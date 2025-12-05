import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const CLOUDFLARE_ZONE_ID = Deno.env.get('CLOUDFLARE_ZONE_ID');

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      console.error('Missing Cloudflare credentials');
      return new Response(
        JSON.stringify({ error: 'Cloudflare credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get date range for analytics (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log(`Fetching Cloudflare analytics from ${startDateStr} to ${endDateStr}`);

    // GraphQL query for Cloudflare Analytics
    const graphqlQuery = {
      query: `
        query {
          viewer {
            zones(filter: { zoneTag: "${CLOUDFLARE_ZONE_ID}" }) {
              httpRequests1dGroups(
                limit: 30
                filter: { date_geq: "${startDateStr}", date_leq: "${endDateStr}" }
                orderBy: [date_DESC]
              ) {
                dimensions {
                  date
                }
                sum {
                  requests
                  pageViews
                  threats
                  bytes
                }
                uniq {
                  uniques
                }
              }
            }
          }
        }
      `
    };

    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphqlQuery),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cloudflare API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Cloudflare analytics', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Cloudflare response:', JSON.stringify(data));

    if (data.errors && data.errors.length > 0) {
      console.error('GraphQL errors:', data.errors);
      return new Response(
        JSON.stringify({ error: 'GraphQL query failed', details: data.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const zones = data.data?.viewer?.zones || [];
    const httpRequests = zones[0]?.httpRequests1dGroups || [];

    // Calculate totals
    let totalRequests = 0;
    let totalPageViews = 0;
    let totalUniqueVisitors = 0;
    let totalBytes = 0;
    let totalThreats = 0;

    const dailyData = httpRequests.map((day: any) => {
      totalRequests += day.sum?.requests || 0;
      totalPageViews += day.sum?.pageViews || 0;
      totalUniqueVisitors += day.uniq?.uniques || 0;
      totalBytes += day.sum?.bytes || 0;
      totalThreats += day.sum?.threats || 0;

      return {
        date: day.dimensions?.date,
        requests: day.sum?.requests || 0,
        pageViews: day.sum?.pageViews || 0,
        uniqueVisitors: day.uniq?.uniques || 0,
        bytes: day.sum?.bytes || 0,
        threats: day.sum?.threats || 0,
      };
    });

    // Get today's data
    const today = dailyData[0] || {
      requests: 0,
      pageViews: 0,
      uniqueVisitors: 0,
      bytes: 0,
      threats: 0,
    };

    const analyticsResult = {
      period: {
        start: startDateStr,
        end: endDateStr,
      },
      totals: {
        requests: totalRequests,
        pageViews: totalPageViews,
        uniqueVisitors: totalUniqueVisitors,
        bandwidth: totalBytes,
        threats: totalThreats,
      },
      today: {
        requests: today.requests,
        pageViews: today.pageViews,
        uniqueVisitors: today.uniqueVisitors,
        bandwidth: today.bytes,
        threats: today.threats,
      },
      dailyData: dailyData.slice(0, 7), // Last 7 days for charts
    };

    console.log('Analytics result:', JSON.stringify(analyticsResult));

    return new Response(
      JSON.stringify(analyticsResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cloudflare-analytics:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
