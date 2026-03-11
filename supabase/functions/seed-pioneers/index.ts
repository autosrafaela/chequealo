import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PIONEERS = [
  {"full_name": "Cristian Gallardo", "category": "Plomería y Gas", "phone": "+54 9 3492 663183", "location": "Rafaela, Santa Fe"},
  {"full_name": "Multiservicios Alcides Díaz", "category": "Plomería", "phone": "+54 9 3492 661782", "location": "Rafaela, Santa Fe"},
  {"full_name": "Leandro Yori", "category": "Plomería y Gas", "phone": "+54 9 3492 610799", "location": "Rafaela, Santa Fe"},
  {"full_name": "MRL Plomero Gasista Mat 19039", "category": "Plomería y Gas", "phone": "+54 9 3492 566473", "location": "Rafaela, Santa Fe"},
  {"full_name": "Marcelo Raúl Maidana", "category": "Plomería", "phone": "+54 9 3492 643658", "location": "Rafaela, Santa Fe"},
  {"full_name": "José Godoy", "category": "Plomería", "phone": "+54 9 3492 607784", "location": "Rafaela, Santa Fe"},
  {"full_name": "Fernando Plomería", "category": "Plomería", "phone": "+54 9 3492 315405", "location": "Rafaela, Santa Fe"},
  {"full_name": "Juan Electricista", "category": "Electricidad", "phone": "+54 9 3492 681726", "location": "Rafaela, Santa Fe"},
  {"full_name": "Mundo Servicios", "category": "Mantenimiento General", "phone": "+54 9 3492 685922", "location": "Rafaela, Santa Fe"},
  {"full_name": "Servicios Integrales Luis Miranda", "category": "Mantenimiento General", "phone": "+54 9 3492 645145", "location": "Rafaela, Santa Fe"},
  {"full_name": "José Alberto Gariboglio", "category": "Sanitarios y Plomería", "phone": "+54 9 3492 562038", "location": "Rafaela, Santa Fe"},
  {"full_name": "Cuidadora a Domicilio", "category": "Cuidado de Personas", "phone": "+54 9 3492 325020", "location": "Rafaela, Santa Fe"},
  {"full_name": "Cuidadora para Sanatorios", "category": "Cuidado de Personas", "phone": "+54 9 3492 697218", "location": "Rafaela, Santa Fe"},
  {"full_name": "Cesana Neumáticos", "category": "Mecánica Ligera", "phone": "+54 9 3492 273481", "location": "Rafaela, Santa Fe"},
  {"full_name": "Carlos Andretich S.A.", "category": "Repuestos y Mecánica", "phone": "+54 9 3492 676045", "location": "Rafaela, Santa Fe"},
  {"full_name": "Electromecánica Teroel", "category": "Electricidad del Automotor", "phone": "+54 9 3492 679493", "location": "Rafaela, Santa Fe"},
  {"full_name": "Gestoría De Automotores", "category": "Gestor del Automotor", "phone": "+54 9 3492 528730", "location": "Rafaela, Santa Fe"},
  {"full_name": "Gestoría Automotor Matías Almada", "category": "Gestor del Automotor", "phone": "+54 9 3492 682308", "location": "Rafaela, Santa Fe"},
  {"full_name": "Gestoría Fiel", "category": "Gestor del Automotor", "phone": "+54 9 3492 566866", "location": "Rafaela, Santa Fe"},
  {"full_name": "Badino Mecánica", "category": "Mecánico", "phone": "+54 9 3492 505054", "location": "Rafaela, Santa Fe"},
  {"full_name": "Mecánica Cattaneo", "category": "Mecánico", "phone": "+54 9 3492 663170", "location": "Rafaela, Santa Fe"},
  {"full_name": "RG Servicio Mecánico", "category": "Mecánico", "phone": "+54 9 3492 564944", "location": "Rafaela, Santa Fe"},
  {"full_name": "Taller Max-Lis", "category": "Mecánico", "phone": "+54 9 3492 510665", "location": "Rafaela, Santa Fe"},
  {"full_name": "ML Energía - Movimiento", "category": "Electricista", "phone": "+54 9 3492 676801", "location": "Rafaela, Santa Fe"},
  {"full_name": "Electricidad del Hogar", "category": "Electricista", "phone": "+54 9 3492 306999", "location": "Rafaela, Santa Fe"},
  {"full_name": "Olivera Juan Gasista Mat. 20553", "category": "Gasista", "phone": "+54 9 3492 587908", "location": "Rafaela, Santa Fe"},
  {"full_name": "Plomería de Oscar Marquez", "category": "Plomero", "phone": "+54 9 3492 672500", "location": "Rafaela, Santa Fe"},
  {"full_name": "Plomero Gasista Rafaela", "category": "Plomero y Gasista", "phone": "+54 9 3492 653595", "location": "Rafaela, Santa Fe"},
  {"full_name": "Carpintería Viotti", "category": "Carpintero", "phone": "+54 9 3492 661603", "location": "Rafaela, Santa Fe"},
  {"full_name": "Originario Carpintería", "category": "Carpintero", "phone": "+54 9 3492 614727", "location": "Rafaela, Santa Fe"},
  {"full_name": "Fletes Mudanzas y Cargas", "category": "Fletes", "phone": "+54 9 3492 327807", "location": "Rafaela, Santa Fe"},
  {"full_name": "Fletes y Auxilios VF", "category": "Fletes y Remolques", "phone": "+54 9 3492 629169", "location": "Rafaela, Santa Fe"},
  {"full_name": "Fletes JC", "category": "Fletes", "phone": "+54 9 3492 273105", "location": "Rafaela, Santa Fe"},
  {"full_name": "Nutrijardín", "category": "Jardinería", "phone": "+54 9 3492 571659", "location": "Rafaela, Santa Fe"},
  {"full_name": "Vivero Los Robles", "category": "Jardinería", "phone": "+54 9 3492 579389", "location": "Rafaela, Santa Fe"},
  {"full_name": "Legalistas Abogados", "category": "Abogado", "phone": "+54 9 3492 608000", "location": "Rafaela, Santa Fe"},
  {"full_name": "Escribanía Martín L. Peretti", "category": "Escribanía", "phone": "+54 9 3492 578528", "location": "Rafaela, Santa Fe"},
  {"full_name": "Estudio Contable Storero", "category": "Contador", "phone": "+54 9 3492 622429", "location": "Rafaela, Santa Fe"},
  {"full_name": "JD Estudio Contable", "category": "Contador", "phone": "+54 9 3492 206269", "location": "Rafaela, Santa Fe"},
  {"full_name": "Aglietto Ingeniería SRL", "category": "Ingeniero", "phone": "+54 9 3492 613175", "location": "Rafaela, Santa Fe"},
  {"full_name": "Nutrición Valeria Rubiolo", "category": "Nutricionista", "phone": "+54 9 3751 478972", "location": "Rafaela, Santa Fe"},
  {"full_name": "Nutricionista Calanit Zimerman", "category": "Nutricionista", "phone": "+54 9 3492 376245", "location": "Rafaela, Santa Fe"},
  {"full_name": "Nutricionista Eloísa Schnidrig", "category": "Nutricionista", "phone": "+54 9 3497 405121", "location": "Rafaela, Santa Fe"},
  {"full_name": "Lic. María E. Ferreyra (MEF)", "category": "Nutricionista", "phone": "+54 9 3492 593210", "location": "Rafaela, Santa Fe"},
  {"full_name": "Psicóloga Florencia Bovier", "category": "Psicólogo", "phone": "+54 9 3492 300303", "location": "Rafaela, Santa Fe"},
  {"full_name": "Psicóloga Marisa Boschetti", "category": "Psicólogo", "phone": "+54 9 3492 660957", "location": "Rafaela, Santa Fe"},
  {"full_name": "Lic. Guillermo Chiariotti", "category": "Psicólogo", "phone": "+54 9 3492 521501", "location": "Rafaela, Santa Fe"},
  {"full_name": "Psicóloga Cindi Roldán", "category": "Psicólogo", "phone": "+54 9 3492 610526", "location": "Rafaela, Santa Fe"},
  {"full_name": "Mozione Kinesiología", "category": "Kinesiólogo", "phone": "+54 9 3492 588443", "location": "Rafaela, Santa Fe"},
  {"full_name": "Vitality Kinesiología", "category": "Kinesiólogo", "phone": "+54 9 3492 206257", "location": "Rafaela, Santa Fe"},
  {"full_name": "Ser Kinesiología", "category": "Kinesiólogo", "phone": "+54 9 3492 385171", "location": "Rafaela, Santa Fe"},
  {"full_name": "Estar Bien Consultorios", "category": "Kinesiólogo", "phone": "+54 9 3492 275519", "location": "Rafaela, Santa Fe"},
  {"full_name": "Único Arquitectura", "category": "Arquitecto", "phone": "+54 9 3492 678830", "location": "Rafaela, Santa Fe"},
  {"full_name": "Arquitectos Valsagna-Fluck", "category": "Arquitecto", "phone": "+54 9 3492 218013", "location": "Rafaela, Santa Fe"},
  {"full_name": "Mauricio Morra Arquitectos", "category": "Arquitecto", "phone": "+54 9 3492 570604", "location": "Rafaela, Santa Fe"},
  {"full_name": "Hugo Poggi Arquitecto", "category": "Arquitecto", "phone": "+54 9 3492 528221", "location": "Rafaela, Santa Fe"},
  {"full_name": "BA+ Arquitecto", "category": "Arquitecto", "phone": "+54 9 3492 685710", "location": "Rafaela, Santa Fe"},
  {"full_name": "Veterinaria del Centro", "category": "Veterinario", "phone": "+54 9 3492 570503", "location": "Rafaela, Santa Fe"},
  {"full_name": "Cerrajería De Urgencias 24hs", "category": "Cerrajero", "phone": "+54 9 3492 605078", "location": "Rafaela, Santa Fe"},
  {"full_name": "Cerrajería Emanuel", "category": "Cerrajero", "phone": "+54 9 3492 286412", "location": "Rafaela, Santa Fe"},
  {"full_name": "Sistemas y Servicios de Cerrajería", "category": "Cerrajero", "phone": "+54 9 3492 529402", "location": "Rafaela, Santa Fe"},
  {"full_name": "Walter Servicios (Aires)", "category": "Aire Acondicionado", "phone": "+54 9 3492 662463", "location": "Rafaela, Santa Fe"},
  {"full_name": "AC Aires Acondicionados", "category": "Aire Acondicionado", "phone": "+54 9 3492 608469", "location": "Rafaela, Santa Fe"},
  {"full_name": "Theler Climatización", "category": "Aire Acondicionado", "phone": "+54 9 3492 613805", "location": "Rafaela, Santa Fe"},
  {"full_name": "Celular Service", "category": "Servicio Técnico PC/Celulares", "phone": "+54 9 3492 240974", "location": "Rafaela, Santa Fe"},
  {"full_name": "Mega Electrónica Rafaela", "category": "Servicio Técnico PC/Celulares", "phone": "+54 9 3492 642233", "location": "Rafaela, Santa Fe"},
  {"full_name": "Celumaniacos", "category": "Servicio Técnico PC/Celulares", "phone": "+54 9 3492 627820", "location": "Rafaela, Santa Fe"},
  {"full_name": "Informática (Rosario 382)", "category": "Servicio Técnico PC/Celulares", "phone": "+54 9 3492 688686", "location": "Rafaela, Santa Fe"},
  {"full_name": "Celu Rafaela", "category": "Servicio Técnico PC/Celulares", "phone": "+54 9 3492 605730", "location": "Rafaela, Santa Fe"},
  {"full_name": "Tapicería Carina", "category": "Limpieza de Tapizados", "phone": "+54 9 3492 609326", "location": "Rafaela, Santa Fe"},
  {"full_name": "Danger Detailing", "category": "Limpieza de Tapizados", "phone": "+54 9 3492 210704", "location": "Rafaela, Santa Fe"},
  {"full_name": "Rafaela Clean", "category": "Limpieza de Tapizados", "phone": "+54 9 3492 311010", "location": "Rafaela, Santa Fe"},
  {"full_name": "Propiedades Rafaela de Adrián Perez", "category": "Corredor Inmobiliario", "phone": "+54 9 3492 662868", "location": "Rafaela, Santa Fe"},
  {"full_name": "Paludi Pinturas", "category": "Pintor", "phone": "+54 9 3492 656433", "location": "Rafaela, Santa Fe"},
  {"full_name": "Impermeabilizaciones de techos Juan", "category": "Albañil y Pintor", "phone": "+54 9 3492 275311", "location": "Rafaela, Santa Fe"},
  {"full_name": "M.A.S. Pintura de obras", "category": "Pintor", "phone": "+54 9 3492 318380", "location": "Rafaela, Santa Fe"},
  {"full_name": "Villalba Revestimientos", "category": "Albañil y Pintor", "phone": "+54 9 3492 274041", "location": "Rafaela, Santa Fe"},
  {"full_name": "Dr. Pablo Ferraro", "category": "Psiquiatra", "phone": "+54 9 342 4410638", "location": "Rafaela, Santa Fe"},
  {"full_name": "Clinica Podio Especialidades", "category": "Centro Médico", "phone": "+54 9 3492 617682", "location": "Rafaela, Santa Fe"},
  {"full_name": "Odontología Estética Rafaela", "category": "Odontólogo", "phone": "+54 9 3492 646137", "location": "Rafaela, Santa Fe"},
  {"full_name": "Odontología Rafaela", "category": "Odontólogo", "phone": "+54 9 3492 621351", "location": "Rafaela, Santa Fe"},
  {"full_name": "Odontología Integral Dr. Toledo", "category": "Odontólogo", "phone": "+54 9 3492 228026", "location": "Rafaela, Santa Fe"},
  {"full_name": "Paloma Peluquería Unisex", "category": "Peluquería", "phone": "+54 9 3492 521491", "location": "Rafaela, Santa Fe"},
  {"full_name": "Lorena Mondino Barbería", "category": "Barbería", "phone": "+54 9 3492 626973", "location": "Rafaela, Santa Fe"},
  {"full_name": "The Black Sheep Barber Shop", "category": "Barbería", "phone": "+54 9 3492 501180", "location": "Rafaela, Santa Fe"},
  {"full_name": "Sisters In Law Peluquería", "category": "Peluquería", "phone": "+54 9 3492 685377", "location": "Rafaela, Santa Fe"},
  {"full_name": "Paula Peluquería", "category": "Peluquería", "phone": "+54 9 3492 513167", "location": "Rafaela, Santa Fe"},
  {"full_name": "Peluquería Rita", "category": "Peluquería", "phone": "+54 9 3492 212624", "location": "Rafaela, Santa Fe"},
  {"full_name": "SG Fotografía de Eventos", "category": "Fotógrafo", "phone": "+54 9 3492 635541", "location": "Rafaela, Santa Fe"},
  {"full_name": "Focus Rafaela Fotografía", "category": "Fotógrafo", "phone": "+54 9 3492 689920", "location": "Rafaela, Santa Fe"},
  {"full_name": "DJ Seba Eventos", "category": "DJ para Eventos", "phone": "+54 9 3492 554122", "location": "Rafaela, Santa Fe"},
  {"full_name": "Asadores El Quincho", "category": "Catering y Eventos", "phone": "+54 9 3492 458871", "location": "Rafaela, Santa Fe"},
  {"full_name": "Fumigaciones Rafaela", "category": "Fumigaciones", "phone": "+54 9 3492 562872", "location": "Rafaela, Santa Fe"},
  {"full_name": "Control de Plagas Norte", "category": "Fumigaciones", "phone": "+54 9 3492 665214", "location": "Rafaela, Santa Fe"},
  {"full_name": "Mantenimiento de Piletas El Sol", "category": "Piletero", "phone": "+54 9 3492 210045", "location": "Rafaela, Santa Fe"},
  {"full_name": "Peluquería Canina Huellas", "category": "Peluquería Canina", "phone": "+54 9 3492 346610", "location": "Rafaela, Santa Fe"},
  {"full_name": "Veterinaria Merin (Turnos Wsp)", "category": "Veterinaria y Peluquería", "phone": "+54 9 3492 577410", "location": "Rafaela, Santa Fe"},
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

async function cleanupOldPioneers(supabaseAdmin: any) {
  console.log('[seed-pioneers] Cleaning up old pioneers...');
  
  const { data: oldProfessionals, error } = await supabaseAdmin
    .from('professionals')
    .select('id, user_id, email')
    .ilike('email', '%@chequealo.net');

  if (error) {
    console.error('[seed-pioneers] Error fetching old pioneers:', error);
    return { deleted: 0, errors: [] };
  }

  if (!oldProfessionals || oldProfessionals.length === 0) {
    console.log('[seed-pioneers] No old pioneers found.');
    return { deleted: 0, errors: [] };
  }

  let deleted = 0;
  const errors: { name: string; error: string }[] = [];

  for (const prof of oldProfessionals) {
    try {
      const pid = prof.id;
      const uid = prof.user_id;

      // Delete related data (same pattern as admin-delete-user)
      await supabaseAdmin.from('professional_services').delete().eq('professional_id', pid);
      await supabaseAdmin.from('work_photos').delete().eq('professional_id', pid);
      await supabaseAdmin.from('verification_requests').delete().eq('professional_id', pid);
      await supabaseAdmin.from('review_responses').delete().eq('professional_id', pid);
      await supabaseAdmin.from('contact_requests').delete().eq('professional_id', pid);
      await supabaseAdmin.from('subscriptions').delete().eq('professional_id', pid);
      await supabaseAdmin.from('transactions').delete().eq('professional_id', pid);
      await supabaseAdmin.from('user_ratings').delete().eq('professional_id', pid);
      await supabaseAdmin.from('reviews').delete().eq('professional_id', pid);

      // Delete user-level data
      await supabaseAdmin.from('contact_requests').delete().eq('user_id', uid);
      await supabaseAdmin.from('favorites').delete().eq('user_id', uid);
      await supabaseAdmin.from('notifications').delete().eq('user_id', uid);
      await supabaseAdmin.from('payment_methods').delete().eq('user_id', uid);
      await supabaseAdmin.from('payments').delete().eq('user_id', uid);
      await supabaseAdmin.from('transactions').delete().eq('user_id', uid);
      await supabaseAdmin.from('reviews').delete().eq('user_id', uid);
      await supabaseAdmin.from('review_likes').delete().eq('user_id', uid);
      await supabaseAdmin.from('user_ratings').delete().eq('user_id', uid);
      await supabaseAdmin.from('user_roles').delete().eq('user_id', uid);
      await supabaseAdmin.from('subscriptions').delete().eq('user_id', uid);

      // Delete professional and profile
      await supabaseAdmin.from('professionals').delete().eq('id', pid);
      await supabaseAdmin.from('profiles').delete().eq('user_id', uid);

      // Delete auth user
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(uid);
      if (delErr) throw delErr;

      deleted++;
      console.log(`[seed-pioneers] Deleted old pioneer: ${prof.email}`);
    } catch (err) {
      console.error(`[seed-pioneers] Error deleting ${prof.email}:`, err);
      errors.push({ name: prof.email, error: (err as Error).message });
    }
  }

  console.log(`[seed-pioneers] Cleanup done. Deleted: ${deleted}, Errors: ${errors.length}`);
  return { deleted, errors };
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

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Unauthorized: Invalid token');

    const { data: isAdmin, error: roleError } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin',
    });
    if (roleError || !isAdmin) throw new Error('Unauthorized: Admin role required');

    console.log('[seed-pioneers] Starting by admin:', user.id);

    // Step 1: Cleanup old pioneers
    const cleanup = await cleanupOldPioneers(supabaseAdmin);

    // Step 2: Create new pioneers
    const results: { created: string[]; failed: { name: string; error: string }[] } = {
      created: [],
      failed: [],
    };

    for (const p of PIONEERS) {
      try {
        const nameSlug = slugify(p.full_name);
        const fakeEmail = `${nameSlug}@chequealo.net`;

        console.log(`[seed-pioneers] Processing: ${p.full_name} -> ${fakeEmail}`);

        const randomPassword = crypto.randomUUID() + '-X1!';
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: fakeEmail,
          password: randomPassword,
          email_confirm: true,
          user_metadata: { full_name: p.full_name },
        });

        if (createError) {
          if (createError.message?.includes('already been registered') || createError.message?.includes('already exists')) {
            console.log(`[seed-pioneers] Skipped (exists): ${p.full_name}`);
            results.failed.push({ name: p.full_name, error: 'Ya existe' });
            continue;
          }
          throw createError;
        }

        const userId = authData.user.id;

        await supabaseAdmin
          .from('profiles')
          .upsert({ id: userId, user_id: userId, full_name: p.full_name }, { onConflict: 'user_id' });

        // Auto-generate SEO-friendly slug: nombre-categoria-ciudad
        const locationCity = p.location.split(',')[0].trim();
        const autoSlug = slugify(`${p.full_name}-${p.category}-${locationCity}`);

        const { error: profError } = await supabaseAdmin
          .from('professionals')
          .insert({
            user_id: userId,
            full_name: p.full_name,
            email: fakeEmail,
            phone: p.phone,
            profession: p.category,
            location: p.location,
            is_verified: true,
            verification_date: new Date().toISOString(),
            has_free_access: true,
            slug: autoSlug,
          });

        if (profError) throw profError;

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
        cleanup,
        created: results.created.length,
        failed: results.failed.length,
        details: results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('[seed-pioneers] Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Internal server error', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
