-- Insert sample professionals with complete profiles
INSERT INTO public.professionals (id, user_id, full_name, profession, location, description, phone, email, rating, review_count, is_verified, availability, image_url) VALUES
-- Profesional 1: Ana Rodríguez - Contadora
('123e4567-e89b-12d3-a456-426614174001', 'usr1-1234-5678-9012-123456789001', 'Ana Rodríguez', 'Contadora Pública', 'Rafaela, Santa Fe', 'Especialista en balances, liquidación de impuestos y asesoría contable integral. Más de 10 años de experiencia atendiendo PyMEs y emprendedores. Matriculada en el Consejo Profesional de Ciencias Económicas.', '+54 3492 123456', 'ana.rodriguez@email.com', 4.8, 15, true, 'Disponible hoy', null),

-- Profesional 2: José Martínez - Plomero
('123e4567-e89b-12d3-a456-426614174002', 'usr1-1234-5678-9012-123456789002', 'José Martínez', 'Plomero / Gasista', 'Rafaela, Santa Fe', 'Reparaciones de plomería, instalaciones sanitarias y gas domiciliario. Servicio de emergencias 24hs. Matriculado y con habilitación municipal. Presupuestos sin cargo.', '+54 3492 234567', 'jose.martinez@email.com', 4.2, 8, true, 'Disponible mañana', null),

-- Profesional 3: Laura Gómez - Electricista
('123e4567-e89b-12d3-a456-426614174003', 'usr1-1234-5678-9012-123456789003', 'Laura Gómez', 'Electricista Domiciliaria', 'Rafaela, Santa Fe', 'Instalaciones eléctricas seguras y certificadas. Especialista en tableros eléctricos, iluminación LED y automatización del hogar. Urgencias 24hs. Garantía en todos los trabajos.', '+54 3492 345678', 'laura.gomez@email.com', 5.0, 12, true, 'Disponible ahora', null),

-- Profesional 4: Carlos Fernández - Mecánico
('123e4567-e89b-12d3-a456-426614174004', 'usr1-1234-5678-9012-123456789004', 'Carlos Fernández', 'Mecánico Automotriz', 'Rafaela, Santa Fe', 'Reparación integral de vehículos, especialista en inyección electrónica y transmisiones automáticas. Taller completamente equipado con scanner y herramientas de última generación.', '+54 3492 456789', 'carlos.fernandez@email.com', 4.5, 23, false, 'Disponible esta semana', null),

-- Profesional 5: María López - Abogada
('123e4567-e89b-12d3-a456-426614174005', 'usr1-1234-5678-9012-123456789005', 'María López', 'Abogada', 'Rafaela, Santa Fe', 'Asesoramiento legal en derecho civil, comercial y laboral. Especialista en contratos, divorcios y mediaciones. Consultas presenciales y virtuales. Matrícula vigente en Colegio de Abogados.', '+54 3492 567890', 'maria.lopez@email.com', 4.7, 18, true, 'Disponible próxima semana', null),

-- Profesional 6: Maximiliano Bustamante - Gestor
('123e4567-e89b-12d3-a456-426614174006', 'usr1-1234-5678-9012-123456789006', 'Maximiliano Bustamante', 'Gestor del Automotor / Mandatario', 'Rafaela, Santa Fe', 'Trámites registrales: transferencias, informes de dominio, inscripciones iniciales y duplicados. Gestor matriculado con amplia experiencia en Registro Seccional Rafaela.', '+54 3492 678901', 'max.bustamante@email.com', 4.3, 7, true, 'Disponible hoy', null),

-- Profesional 7: Sofia Herrera - Psicóloga
('123e4567-e89b-12d3-a456-426614174007', 'usr1-1234-5678-9012-123456789007', 'Sofía Herrera', 'Psicóloga Clínica', 'Santa Fe, Santa Fe', 'Atención psicológica individual y familiar. Especialista en terapia cognitivo-conductual y trastornos de ansiedad. Modalidad presencial y online. Matrícula MP 1234.', '+54 342 789012', 'sofia.herrera@email.com', 4.9, 32, true, 'Disponible próxima semana', null),

-- Profesional 8: Roberto Silva - Veterinario
('123e4567-e89b-12d3-a456-426614174008', 'usr1-1234-5678-9012-123456789008', 'Roberto Silva', 'Médico Veterinario', 'Esperanza, Santa Fe', 'Atención clínica y quirúrgica de pequeños animales. Vacunación, desparasitación, cirugías y emergencias. Consultorio equipado con rayos X y laboratorio propio.', '+54 3496 890123', 'roberto.silva@email.com', 4.6, 28, true, 'Disponible mañana', null),

-- Profesional 9: Carolina Paz - Kinesióloga
('123e4567-e89b-12d3-a456-426614174009', 'usr1-1234-5678-9012-123456789009', 'Carolina Paz', 'Kinesióloga / Fisioterapeuta', 'Rafaela, Santa Fe', 'Rehabilitación traumatológica, neurológica y respiratoria. Especialista en RPG y deportología. Atención domiciliaria y en consultorio. Obras sociales y prepagas.', '+54 3492 901234', 'carolina.paz@email.com', 4.8, 19, true, 'Disponible esta semana', null),

-- Profesional 10: Diego Morales - Dentista
('123e4567-e89b-12d3-a456-426614174010', 'usr1-1234-5678-9012-123456789010', 'Diego Morales', 'Odontólogo', 'Rafaela, Santa Fe', 'Odontología general y estética. Implantes, ortodoncia y blanqueamientos. Consultorio moderno con tecnología digital. Planes de financiación disponibles.', '+54 3492 012345', 'diego.morales@email.com', 4.4, 16, true, 'Disponible hoy', null),

-- Profesional 11: Valeria Castro - Arquitecta
('123e4567-e89b-12d3-a456-426614174011', 'usr1-1234-5678-9012-123456789011', 'Valeria Castro', 'Arquitecta', 'Santa Fe, Santa Fe', 'Diseño arquitectónico residencial y comercial. Especialista en arquitectura sustentable y eficiencia energética. Dirección de obra y gestión de permisos municipales.', '+54 342 123456', 'valeria.castro@email.com', 4.7, 11, true, 'Disponible próxima semana', null),

-- Profesional 12: Fernando Ruiz - Profesor de Música
('123e4567-e89b-12d3-a456-426614174012', 'usr1-1234-5678-9012-123456789012', 'Fernando Ruiz', 'Profesor de Música', 'Rafaela, Santa Fe', 'Clases de guitarra, piano y canto para todas las edades. Método personalizado adaptado a cada alumno. Preparación para exámenes y recitales. Clases presenciales y online.', '+54 3492 234567', 'fernando.ruiz@email.com', 4.9, 24, false, 'Disponible esta semana', null),

-- Profesional 13: Gabriela Vega - Nutricionista
('123e4567-e89b-12d3-a456-426614174013', 'usr1-1234-5678-9012-123456789013', 'Gabriela Vega', 'Licenciada en Nutrición', 'Sunchales, Santa Fe', 'Planes nutricionales personalizados para adultos y niños. Especialista en nutrición deportiva y trastornos alimentarios. Seguimiento integral con análisis de composición corporal.', '+54 3493 345678', 'gabriela.vega@email.com', 4.6, 22, true, 'Disponible mañana', null),

-- Profesional 14: Pablo Mendoza - Carpintero
('123e4567-e89b-12d3-a456-426614174014', 'usr1-1234-5678-9012-123456789014', 'Pablo Mendoza', 'Carpintero / Ebanista', 'Rafaela, Santa Fe', 'Muebles a medida en madera maciza y melamina. Especialista en cocinas, placards y bibliotecas. Restauración de muebles antiguos. 15 años de experiencia y garantía en todos los trabajos.', '+54 3492 456789', 'pablo.mendoza@email.com', 4.8, 31, true, 'Disponible próxima semana', null),

-- Profesional 15: Luciana Torres - Limpieza
('123e4567-e89b-12d3-a456-426614174015', 'usr1-1234-5678-9012-123456789015', 'Luciana Torres', 'Empleada Doméstica / Servicio de Limpieza', 'Rafaela, Santa Fe', 'Servicio de limpieza doméstica y de oficinas. Limpieza profunda, mantenimiento regular y limpieza post-obra. Personal capacitado, productos ecológicos y equipamiento profesional.', '+54 3492 567890', 'luciana.torres@email.com', 4.7, 35, true, 'Disponible ahora', null),

-- Profesional 16: Andrés Flores - Jardinero
('123e4567-e89b-12d3-a456-426614174016', 'usr1-1234-5678-9012-123456789016', 'Andrés Flores', 'Jardinero / Paisajista', 'Rafaela, Santa Fe', 'Diseño y mantenimiento de jardines y espacios verdes. Poda de árboles, instalación de riego automático y fumigaciones. Especialista en plantas nativas y jardines sustentables.', '+54 3492 678901', 'andres.flores@email.com', 4.5, 17, false, 'Disponible esta semana', null),

-- Profesional 17: Natalia Sosa - Profesora de Inglés
('123e4567-e89b-12d3-a456-426614174017', 'usr1-1234-5678-9012-123456789017', 'Natalia Sosa', 'Profesora de Inglés', 'Santa Fe, Santa Fe', 'Clases de inglés para niños, adolescentes y adultos. Preparación para exámenes internacionales (Cambridge, TOEFL). Método comunicativo con énfasis en conversación.', '+54 342 789012', 'natalia.sosa@email.com', 4.8, 20, true, 'Disponible hoy', null),

-- Profesional 18: Raúl Pereyra - Pintor
('123e4567-e89b-12d3-a456-426614174018', 'usr1-1234-5678-9012-123456789018', 'Raúl Pereyra', 'Pintor', 'Rafaela, Santa Fe', 'Pintura de casas, departamentos y comercios. Especialista en técnicas decorativas, empapelado y revestimientos texturados. Presupuestos gratuitos y materiales de primera calidad.', '+54 3492 890123', 'raul.pereyra@email.com', 4.3, 13, false, 'Disponible mañana', null),

-- Profesional 19: Claudia Giménez - Contadora
('123e4567-e89b-12d3-a456-426614174019', 'usr1-1234-5678-9012-123456789019', 'Claudia Giménez', 'Contadora Pública', 'Esperanza, Santa Fe', 'Servicios contables integrales para empresas y monotributistas. Liquidación de sueldos, IVA y Ganancias. Asesoramiento en planeamiento tributario y financiero.', '+54 3496 901234', 'claudia.gimenez@email.com', 4.9, 26, true, 'Disponible próxima semana', null),

-- Profesional 20: Martín Acosta - Entrenador Personal
('123e4567-e89b-12d3-a456-426614174020', 'usr1-1234-5678-9012-123456789020', 'Martín Acosta', 'Entrenador Personal', 'Rafaela, Santa Fe', 'Entrenamiento personalizado y funcional. Especialista en pérdida de peso, tonificación muscular y rehabilitación deportiva. Clases individuales y grupales, en gimnasio o domicilio.', '+54 3492 012345', 'martin.acosta@email.com', 4.6, 29, true, 'Disponible esta semana', null);

-- Insert services for each professional
INSERT INTO public.professional_services (professional_id, service_name, description, price_from, price_to, price_unit) VALUES
-- Ana Rodríguez - Contadora
('123e4567-e89b-12d3-a456-426614174001', 'Balance General', 'Confección de balance general anual para PyMES', 25000, 50000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174001', 'Liquidación de IVA', 'Liquidación mensual de IVA', 8000, 15000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174001', 'Asesoramiento Tributario', 'Consultoría en temas impositivos', 5000, 10000, 'ARS'),

-- José Martínez - Plomero
('123e4567-e89b-12d3-a456-426614174002', 'Destapación de Cloacas', 'Servicio de destapación con máquina espiraladora', 8000, 15000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174002', 'Reparación de Canillas', 'Reparación y cambio de canillas y griferías', 3000, 8000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174002', 'Instalación de Termotanque', 'Instalación completa de termotanque a gas', 15000, 25000, 'ARS'),

-- Laura Gómez - Electricista
('123e4567-e89b-12d3-a456-426614174003', 'Instalación Eléctrica Completa', 'Instalación eléctrica para vivienda nueva', 80000, 150000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174003', 'Reparación de Tablero', 'Reparación y modernización de tableros eléctricos', 20000, 40000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174003', 'Instalación de Aire Acondicionado', 'Instalación eléctrica para equipos de AA', 12000, 20000, 'ARS'),

-- Carlos Fernández - Mecánico
('123e4567-e89b-12d3-a456-426614174004', 'Service Completo', 'Service completo con cambio de aceite y filtros', 15000, 30000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174004', 'Reparación de Motor', 'Diagnóstico y reparación de problemas de motor', 50000, 200000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174004', 'Cambio de Embrague', 'Cambio completo de kit de embrague', 80000, 120000, 'ARS'),

-- María López - Abogada
('123e4567-e89b-12d3-a456-426614174005', 'Divorcio de Común Acuerdo', 'Trámite completo de divorcio consensuado', 40000, 80000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174005', 'Redacción de Contratos', 'Elaboración de contratos comerciales', 15000, 35000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174005', 'Asesoramiento Legal', 'Consulta jurídica por hora', 8000, 12000, 'ARS'),

-- Add more services for other professionals (continuing pattern)
('123e4567-e89b-12d3-a456-426614174007', 'Terapia Individual', 'Sesión de terapia psicológica individual', 8000, 12000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174007', 'Terapia de Pareja', 'Sesión de terapia para parejas', 10000, 15000, 'ARS'),

('123e4567-e89b-12d3-a456-426614174008', 'Consulta Veterinaria', 'Consulta clínica general', 5000, 8000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174008', 'Vacunación Completa', 'Plan de vacunas anuales', 12000, 18000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174008', 'Cirugía de Castración', 'Castración de mascotas', 25000, 40000, 'ARS'),

('123e4567-e89b-12d3-a456-426614174009', 'Sesión de Kinesiología', 'Sesión individual de rehabilitación', 6000, 10000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174009', 'Tratamiento RPG', 'Sesión de Reeducación Postural Global', 8000, 12000, 'ARS'),

('123e4567-e89b-12d3-a456-426614174012', 'Clases de Guitarra', 'Clase individual de guitarra (1 hora)', 4000, 6000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174012', 'Clases de Piano', 'Clase individual de piano (1 hora)', 5000, 7000, 'ARS'),

('123e4567-e89b-12d3-a456-426614174015', 'Limpieza Doméstica', 'Limpieza completa de casa por m²', 800, 1200, 'ARS'),
('123e4567-e89b-12d3-a456-426614174015', 'Limpieza Post-Obra', 'Limpieza profunda después de obra', 1500, 2500, 'ARS'),

('123e4567-e89b-12d3-a456-426614174020', 'Entrenamiento Personal', 'Sesión individual de entrenamiento', 6000, 10000, 'ARS'),
('123e4567-e89b-12d3-a456-426614174020', 'Plan de Entrenamiento', 'Plan mensual personalizado', 20000, 35000, 'ARS');

-- Insert sample reviews
INSERT INTO public.reviews (professional_id, user_id, rating, comment, service_provided) VALUES
('123e4567-e89b-12d3-a456-426614174001', 'usr-client-001', 5, 'Excelente profesional, muy detallada en su trabajo. Me ayudó mucho con los impuestos de mi empresa.', 'Balance General'),
('123e4567-e89b-12d3-a456-426614174001', 'usr-client-002', 5, 'Ana es súper responsable y siempre cumple con los plazos. La recomiendo 100%.', 'Liquidación de IVA'),
('123e4567-e89b-12d3-a456-426614174001', 'usr-client-003', 4, 'Muy buen servicio, aunque a veces tarda en responder los mensajes.', 'Asesoramiento Tributario'),

('123e4567-e89b-12d3-a456-426614174002', 'usr-client-004', 4, 'José solucionó el problema de la cañería rápidamente. Precio justo.', 'Destapación de Cloacas'),
('123e4567-e89b-12d3-a456-426614174002', 'usr-client-005', 4, 'Buen trabajo, llegó puntual y dejó todo limpio.', 'Reparación de Canillas'),

('123e4567-e89b-12d3-a456-426614174003', 'usr-client-006', 5, 'Laura es una genia! Solucionó un problema eléctrico que otros no pudieron. Súper recomendable.', 'Reparación de Tablero'),
('123e4567-e89b-12d3-a456-426614174003', 'usr-client-007', 5, 'Trabajo impecable, muy prolija y explica todo lo que hace.', 'Instalación Eléctrica Completa'),

('123e4567-e89b-12d3-a456-426614174007', 'usr-client-008', 5, 'Sofía me ayudó muchísimo con mis problemas de ansiedad. Excelente profesional.', 'Terapia Individual'),
('123e4567-e89b-12d3-a456-426614174007', 'usr-client-009', 5, 'Muy empática y comprensiva. Realmente se nota su experiencia.', 'Terapia de Pareja'),

('123e4567-e89b-12d3-a456-426614174015', 'usr-client-010', 5, 'Luciana y su equipo son fantásticos. Siempre dejan la casa impecable.', 'Limpieza Doméstica'),
('123e4567-e89b-12d3-a456-426614174015', 'usr-client-011', 4, 'Muy buen servicio, puntuales y responsables.', 'Limpieza Post-Obra');

-- Insert some work photos examples
INSERT INTO public.work_photos (professional_id, image_url, caption, work_type, uploaded_by) VALUES
('123e4567-e89b-12d3-a456-426614174003', 'https://example.com/photos/electrical1.jpg', 'Instalación de tablero eléctrico residencial', 'Instalación Eléctrica', 'professional'),
('123e4567-e89b-12d3-a456-426614174003', 'https://example.com/photos/electrical2.jpg', 'Cableado completo de vivienda nueva', 'Instalación Eléctrica', 'professional'),

('123e4567-e89b-12d3-a456-426614174014', 'https://example.com/photos/carpentry1.jpg', 'Cocina en melamina con detalles en madera', 'Muebles de Cocina', 'professional'),
('123e4567-e89b-12d3-a456-426614174014', 'https://example.com/photos/carpentry2.jpg', 'Placard empotrado de 3 cuerpos', 'Placards', 'professional'),

('123e4567-e89b-12d3-a456-426614174015', 'https://example.com/photos/cleaning1.jpg', 'Limpieza post-obra departamento', 'Limpieza Post-Obra', 'professional'),
('123e4567-e89b-12d3-a456-426614174015', 'https://example.com/photos/cleaning2.jpg', 'Resultado final limpieza profunda', 'Limpieza Doméstica', 'client');