import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOMERIAS = [
  {"full_name": "Cesana Neumáticos (Auxilio)", "category": "Gomería a Domicilio", "phone": "+54 9 3492 273481", "location": "Rafaela, Santa Fe"},
  {"full_name": "Auxilios y Neumáticos VF", "category": "Gomería a Domicilio", "phone": "+54 9 3492 629169", "location": "Rafaela, Santa Fe"},
  {"full_name": "Gomería Móvil Cristian 24hs", "category": "Gomería a Domicilio", "phone": "+54 9 3492 685922", "location": "Rafaela, Santa Fe"},
  {"full_name": "Neumáticos Debona (Consultas)", "category": "Gomería", "phone": "+54 9 3492 592229", "location": "Rafaela, Santa Fe"},
  {"full_name": "Gomería Rafaela Urgencias", "category": "Gomería a Domicilio", "phone": "+54 9 3492 605078", "location": "Rafaela, Santa Fe"},
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Validate JWT and admin role
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized: Invalid token');

    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });
    if (roleError || !isAdmin) throw new Error('Unauthorized: Admin role required');

    console.log('[seed-gomerias] Starting...');

    const results: { created: string[]; skipped: string[]; failed: { name: string; error: string }[] } = {
      created: [],
      skipped: [],
      failed: [],
    };

    for (const g of GOMERIAS) {
      try {
        const nameSlug = slugify(g.full_name);
        const fakeEmail = `${nameSlug}@chequealo.net`;

        console.log(`[seed-gomerias] Processing: ${g.full_name} -> ${fakeEmail}`);

        // Check if professional already exists with this email
        const { data: existing } = await supabaseAdmin
          .from('professionals')
          .select('id')
          .eq('email', fakeEmail)
          .maybeSingle();

        if (existing) {
          console.log(`[seed-gomerias] Skipped (already exists): ${g.full_name}`);
          results.skipped.push(g.full_name);
          continue;
        }

        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: fakeEmail,
          password: 'Pionero2026!',
          email_confirm: true,
          user_metadata: { full_name: g.full_name },
        });

        if (createError) {
          if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
            // Auth user exists but no professional - get the user and create professional
            const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = listData?.users?.find(u => u.email === fakeEmail);
            if (existingUser) {
              const userId = existingUser.id;
              await supabaseAdmin
                .from('profiles')
                .upsert({ id: userId, user_id: userId, full_name: g.full_name }, { onConflict: 'user_id' });

              const locationCity = g.location.split(',')[0].trim();
              const autoSlug = slugify(`${g.full_name}-${g.category}-${locationCity}`).substring(0, 50);

              const { error: profError } = await supabaseAdmin
                .from('professionals')
                .insert({
                  user_id: userId,
                  full_name: g.full_name,
                  email: fakeEmail,
                  phone: g.phone,
                  profession: g.category,
                  location: g.location,
                  is_verified: true,
                  verification_date: new Date().toISOString(),
                  has_free_access: true,
                  slug: autoSlug,
                });

              if (profError) throw profError;
              results.created.push(g.full_name);
              console.log(`[seed-gomerias] Created (existing auth): ${g.full_name}`);
              continue;
            }
            results.skipped.push(g.full_name);
            continue;
          }
          throw createError;
        }

        const userId = authData.user.id;

        await supabaseAdmin
          .from('profiles')
          .upsert({ id: userId, user_id: userId, full_name: g.full_name }, { onConflict: 'user_id' });

        const locationCity = g.location.split(',')[0].trim();
        const autoSlug = slugify(`${g.full_name}-${g.category}-${locationCity}`).substring(0, 50);

        const { error: profError } = await supabaseAdmin
          .from('professionals')
          .insert({
            user_id: userId,
            full_name: g.full_name,
            email: fakeEmail,
            phone: g.phone,
            profession: g.category,
            location: g.location,
            is_verified: true,
            verification_date: new Date().toISOString(),
            has_free_access: true,
            slug: autoSlug,
          });

        if (profError) throw profError;

        results.created.push(g.full_name);
        console.log(`[seed-gomerias] Created: ${g.full_name}`);
      } catch (err) {
        console.error(`[seed-gomerias] Failed: ${g.full_name}`, err);
        results.failed.push({ name: g.full_name, error: (err as Error).message || 'Unknown error' });
      }
    }

    console.log(`[seed-gomerias] Done. Created: ${results.created.length}, Skipped: ${results.skipped.length}, Failed: ${results.failed.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        created: results.created.length,
        skipped: results.skipped.length,
        failed: results.failed.length,
        details: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('[seed-gomerias] Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Internal server error', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
