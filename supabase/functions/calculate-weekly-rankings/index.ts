import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('[calculate-weekly-rankings] Starting weekly ranking calculation...');

    // Calculate week boundaries (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    console.log(`[calculate-weekly-rankings] Week: ${weekStartStr} to ${weekEndStr}`);

    // Get all active professionals with their location
    const { data: professionals, error: profError } = await supabaseClient
      .from('professionals')
      .select('id, full_name, location, profession, rating, review_count, image_url')
      .eq('is_blocked', false)
      .not('location', 'is', null);

    if (profError) {
      console.error('[calculate-weekly-rankings] Error fetching professionals:', profError);
      throw profError;
    }

    console.log(`[calculate-weekly-rankings] Found ${professionals?.length || 0} professionals`);

    const rankings: any[] = [];

    for (const prof of professionals || []) {
      // Extract city/neighborhood from location (format: "City, Province" or just "City")
      const locationParts = prof.location?.split(',') || [];
      const city = locationParts[0]?.trim() || 'Sin ubicación';

      // 1. Calculate reviews score (new reviews this week * 0.5)
      const { count: newReviewsCount } = await supabaseClient
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', prof.id)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      const reviewsScore = (newReviewsCount || 0) * 10; // Max ~50 points for 5 reviews

      // 2. Calculate response time score (responses < 1 hour * 0.3)
      const { data: contactRequests } = await supabaseClient
        .from('contact_requests')
        .select('id, created_at, updated_at, status')
        .eq('professional_id', prof.id)
        .gte('created_at', weekStart.toISOString())
        .lte('created_at', weekEnd.toISOString());

      let fastResponses = 0;
      let totalResponses = 0;
      let totalResponseMinutes = 0;

      for (const request of contactRequests || []) {
        if (request.status !== 'pending') {
          totalResponses++;
          const created = new Date(request.created_at);
          const updated = new Date(request.updated_at);
          const responseTime = (updated.getTime() - created.getTime()) / (1000 * 60); // minutes
          totalResponseMinutes += responseTime;
          
          if (responseTime <= 60) {
            fastResponses++;
          }
        }
      }

      const responseRate = totalResponses > 0 ? fastResponses / totalResponses : 0;
      const responseScore = responseRate * 30; // Max 30 points

      const avgResponseMinutes = totalResponses > 0 
        ? Math.round(totalResponseMinutes / totalResponses) 
        : null;

      // 3. Calculate punctuality score (completed transactions this week * 0.2)
      const { count: completedTransactions } = await supabaseClient
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', prof.id)
        .eq('status', 'completed')
        .gte('completed_at', weekStart.toISOString())
        .lte('completed_at', weekEnd.toISOString());

      const punctualityScore = (completedTransactions || 0) * 5; // Max ~20 points for 4 completions

      // Total score
      const totalScore = reviewsScore + responseScore + punctualityScore;

      // Only include professionals with some activity
      if (totalScore > 0 || prof.rating > 0) {
        rankings.push({
          professional_id: prof.id,
          location: city,
          profession: prof.profession,
          score: totalScore + (prof.rating || 0) * 2, // Bonus for overall rating
          reviews_score: reviewsScore,
          response_score: responseScore,
          punctuality_score: punctualityScore,
          new_reviews_count: newReviewsCount || 0,
          avg_response_minutes: avgResponseMinutes,
          week_start: weekStartStr,
          week_end: weekEndStr,
          // For display (not stored)
          _full_name: prof.full_name,
          _image_url: prof.image_url,
          _rating: prof.rating
        });
      }
    }

    // Group by location and profession, then rank
    const groupedRankings = new Map<string, any[]>();
    
    for (const ranking of rankings) {
      const key = `${ranking.location}|${ranking.profession}`;
      if (!groupedRankings.has(key)) {
        groupedRankings.set(key, []);
      }
      groupedRankings.get(key)!.push(ranking);
    }

    // Sort and assign positions, keep top 5
    const finalRankings: any[] = [];
    
    for (const [, group] of groupedRankings) {
      group.sort((a, b) => b.score - a.score);
      
      group.slice(0, 5).forEach((ranking, index) => {
        finalRankings.push({
          professional_id: ranking.professional_id,
          location: ranking.location,
          profession: ranking.profession,
          rank_position: index + 1,
          score: ranking.score,
          reviews_score: ranking.reviews_score,
          response_score: ranking.response_score,
          punctuality_score: ranking.punctuality_score,
          new_reviews_count: ranking.new_reviews_count,
          avg_response_minutes: ranking.avg_response_minutes,
          week_start: ranking.week_start,
          week_end: ranking.week_end
        });
      });
    }

    console.log(`[calculate-weekly-rankings] Calculated ${finalRankings.length} rankings`);

    // Delete existing rankings for this week and insert new ones
    const { error: deleteError } = await supabaseClient
      .from('weekly_rankings')
      .delete()
      .eq('week_start', weekStartStr);

    if (deleteError) {
      console.error('[calculate-weekly-rankings] Error deleting old rankings:', deleteError);
    }

    if (finalRankings.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('weekly_rankings')
        .insert(finalRankings);

      if (insertError) {
        console.error('[calculate-weekly-rankings] Error inserting rankings:', insertError);
        throw insertError;
      }
    }

    console.log('[calculate-weekly-rankings] Rankings updated successfully');

    return new Response(JSON.stringify({
      success: true,
      rankingsCount: finalRankings.length,
      weekStart: weekStartStr,
      weekEnd: weekEndStr
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('[calculate-weekly-rankings] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
