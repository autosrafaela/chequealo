import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PIONEERS = [
  {"full_name": "Cristian Gallardo", "category": "Plomería y Gas", "phone": "3492 66-3183", "location": "Rafaela, Santa Fe"},
  {"full_name": "Multiservicios Alcides Díaz", "category": "Plomería", "phone": "3492 66-1782", "location": "Rafaela, Santa Fe"},
  {"full_name": "Leandro Yori", "category": "Plomería y Gas", "phone": "3492 15-610799", "location": "Rafaela, Santa Fe"},
  {"full_name": "MRL Plomero Gasista Mat 19039", "category": "Plomería y Gas", "phone": "3492 15-566473", "location": "Rafaela, Santa Fe"},
  {"full_name": "Marcelo Raúl Maidana", "category": "Plomería", "phone": "3492 15-643658", "location": "Rafaela, Santa Fe"},
  {"full_name": "José Godoy", "category": "Plomería", "phone": "3492 15-607784", "location": "Rafaela, Santa Fe"},
  {"full_name": "Fernando Plomería", "category": "Plomería", "phone": "3492 15-315405", "location": "Rafaela, Santa Fe"},
  {"full_name": "Alberto Desiderio Mark", "category": "Plomería", "phone": "3492 43-0888", "location": "Rafaela, Santa Fe"},
  {"full_name": "José Alberto Menaier", "category": "Gasista", "phone": "3492 43-0278", "location": "Rafaela, Santa Fe"},
  {"full_name": "Sebastián Coronel", "category": "Plomería", "phone": "3492 44-0987", "location": "Rafaela, Santa Fe"},
  {"full_name": "Rubén Carlos Rosetti", "category": "Plomería", "phone": "3492 42-9313", "location": "Rafaela, Santa Fe"},
  {"full_name": "Sergio Horacio Pairone", "category": "Plomería", "phone": "3492 42-8613", "location": "Rafaela, Santa Fe"},
  {"full_name": "Fernando Germán Heredia", "category": "Plomería", "phone": "3492 43-1455", "location": "Rafaela, Santa Fe"},
  {"full_name": "Juan Electricista", "category": "Electricidad", "phone": "3492 68-1726", "location": "Rafaela, Santa Fe"},
  {"full_name": "Mundo Servicios", "category": "Mantenimiento General", "phone": "3492 15-685922", "location": "Rafaela, Santa Fe"},
  {"full_name": "Servicios Integrales Luis Miranda", "category": "Mantenimiento General", "phone": "3492 15-645145", "location": "Rafaela, Santa Fe"},
  {"full_name": "José Alberto Gariboglio", "category": "Sanitarios y Plomería", "phone": "3492 15-562038", "location": "Rafaela, Santa Fe"},
  {"full_name": "Cuidadora a Domicilio", "category": "Cuidado de Personas", "phone": "03492 15-325020", "location": "Rafaela, Santa Fe"},
  {"full_name": "Cuidadora para Sanatorios", "category": "Cuidado de Personas", "phone": "3492 697218", "location": "Rafaela, Santa Fe"},
  {"full_name": "Cesana Neumáticos", "category": "Mecánica Ligera", "phone": "3492 273481", "location": "Rafaela, Santa Fe"},
  {"full_name": "Mecánica Torreano", "category": "Taller Mecánico", "phone": "Taller Histórico", "location": "Rafaela, Santa Fe"},
  {"full_name": "Fasano Servicios Automotor", "category": "Taller Mecánico", "phone": "fasanoservicios@gmail.com", "location": "Rafaela, Santa Fe"},
  {"full_name": "Cipolat Taller Mecánico", "category": "Taller Mecánico", "phone": "Intendente Giménez 877", "location": "Rafaela, Santa Fe"},
  {"full_name": "El Taller de Ale", "category": "Taller Mecánico", "phone": "Alfonsina Storni 1285", "location": "Rafaela, Santa Fe"},
  {"full_name": "Carlos Andretich S.A.", "category": "Repuestos y Mecánica", "phone": "3492 676045", "location": "Rafaela, Santa Fe"},
  {"full_name": "Electricidad del Automotor Zlauvinen SRL", "category": "Electricidad del Automotor", "phone": "03492 42-1411", "location": "Rafaela, Santa Fe"},
  {"full_name": "Electromecánica Sidades", "category": "Electricidad del Automotor", "phone": "03492 42-5972", "location": "Rafaela, Santa Fe"},
  {"full_name": "Electromecánica Pablito", "category": "Electricidad del Automotor", "phone": "03492 43-5614", "location": "Rafaela, Santa Fe"},
  {"full_name": "Pieruccioni Enrique e Hijos", "category": "Electricidad del Automotor", "phone": "03492 42-9402", "location": "Rafaela, Santa Fe"},
  {"full_name": "Electromecánica Teroel", "category": "Electricidad del Automotor", "phone": "03492 67-9493", "location": "Rafaela, Santa Fe"},
  {"full_name": "La Casa del Motor Eléctrico", "category": "Electricidad del Automotor", "phone": "Arenales 645", "location": "Rafaela, Santa Fe"},
];

function sanitizePhone(phone: string): string | null {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // If we have at least 6 digits, it's a real phone number
  if (digits.length >= 6) {
    return digits;
  }
  return null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
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

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify caller is admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized: Invalid token');
    }

    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });

    if (roleError || !isAdmin) {
      throw new Error('Unauthorized: Admin role required');
    }

    console.log('[seed-pioneers] Starting seed by admin:', user.id);

    const results: { created: string[]; failed: { name: string; error: string }[] } = {
      created: [],
      failed: [],
    };

    for (const p of PIONEERS) {
      try {
        const sanitizedPhone = sanitizePhone(p.phone);
        const emailPrefix = sanitizedPhone || slugify(p.full_name);
        const fakeEmail = `${emailPrefix}@chequealo.net`;
        const phoneToStore = sanitizedPhone ? p.phone : null;

        console.log(`[seed-pioneers] Processing: ${p.full_name} -> ${fakeEmail}`);

        // 1. Create auth user
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: fakeEmail,
          password: 'Pionero2026!',
          email_confirm: true,
          user_metadata: { full_name: p.full_name },
        });

        if (createError) {
          // If user already exists, skip
          if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
            console.log(`[seed-pioneers] Skipped (already exists): ${p.full_name}`);
            results.failed.push({ name: p.full_name, error: 'Ya existe' });
            continue;
          }
          throw createError;
        }

        const userId = authData.user.id;

        // 2. Profile is created by the handle_new_user trigger, but let's ensure it has the right data
        await supabaseAdmin
          .from('profiles')
          .upsert({
            id: userId,
            user_id: userId,
            full_name: p.full_name,
          }, { onConflict: 'user_id' });

        // 3. Insert professional
        const { error: profError } = await supabaseAdmin
          .from('professionals')
          .insert({
            user_id: userId,
            full_name: p.full_name,
            email: fakeEmail,
            phone: phoneToStore,
            profession: p.category,
            location: p.location,
            is_verified: true,
            verification_date: new Date().toISOString(),
            has_free_access: true,
          });

        if (profError) {
          console.error(`[seed-pioneers] Error inserting professional ${p.full_name}:`, profError);
          throw profError;
        }

        results.created.push(p.full_name);
        console.log(`[seed-pioneers] Created: ${p.full_name}`);
      } catch (err) {
        console.error(`[seed-pioneers] Failed: ${p.full_name}`, err);
        results.failed.push({ name: p.full_name, error: (err as Error).message || 'Unknown error' });
      }
    }

    console.log(`[seed-pioneers] Done. Created: ${results.created.length}, Failed: ${results.failed.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        created: results.created.length,
        failed: results.failed.length,
        details: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[seed-pioneers] Error:', error);
    return new Response(
      JSON.stringify({
        error: (error as Error).message || 'Internal server error',
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
