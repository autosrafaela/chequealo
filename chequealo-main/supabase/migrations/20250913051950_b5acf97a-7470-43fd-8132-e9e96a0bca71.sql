-- Crear usuario profesional directamente
-- Primero necesitamos crear un UUID único para el usuario
DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
BEGIN
    -- Insertar en profiles
    INSERT INTO public.profiles (
        user_id, 
        full_name, 
        username,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'Dardo Perez',
        'dardoperez',
        now(),
        now()
    );
    
    -- Insertar en professionals
    INSERT INTO public.professionals (
        user_id,
        full_name,
        email,
        phone,
        profession,
        location,
        description,
        availability,
        is_verified,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        'Dardo Perez',
        'cardealer@live.com.ar',
        '+54 3492 123456',
        'Contador Público',
        'Rafaela, Santa Fe',
        'Contador público especializado en balances, liquidación de impuestos y asesoría contable integral. Más de 15 años de experiencia atendiendo PyMEs y emprendedores.',
        'Disponible hoy',
        true,
        now(),
        now()
    );
    
    -- Asignar rol de usuario
    INSERT INTO public.user_roles (
        user_id,
        role,
        created_at
    ) VALUES (
        new_user_id,
        'user',
        now()
    );
    
    -- Mostrar el ID del usuario creado para referencia
    RAISE NOTICE 'Usuario creado con ID: %', new_user_id;
END $$;