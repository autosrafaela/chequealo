import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting booking reminders process...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get bookings that need reminders (24 hours before booking_date)
    const reminderTime = new Date();
    reminderTime.setHours(reminderTime.getHours() + 24);
    
    const { data: bookings, error: bookingsError } = await supabaseClient
      .from('bookings')
      .select(`
        *,
        professionals!inner(
          full_name,
          phone,
          email,
          profession
        )
      `)
      .eq('status', 'confirmed')
      .gte('booking_date', new Date().toISOString())
      .lte('booking_date', reminderTime.toISOString())
      .is('reminder_sent', false);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      throw bookingsError;
    }

    console.log(`Found ${bookings?.length || 0} bookings needing reminders`);

    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No bookings need reminders' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const remindersResults = [];

    for (const booking of bookings) {
      try {
        console.log(`Processing reminder for booking ${booking.id}`);

        // Prepare email content
        const bookingDate = new Date(booking.booking_date);
        const formattedDate = bookingDate.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const formattedTime = bookingDate.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Email template for client
        const clientEmailTemplate: EmailTemplate = {
          subject: `Recordatorio: Cita con ${booking.professionals.full_name} mañana`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Recordatorio de Cita - TodoAca.ar</h2>
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>¡Tu cita es mañana!</h3>
                <p><strong>Profesional:</strong> ${booking.professionals.full_name}</p>
                <p><strong>Profesión:</strong> ${booking.professionals.profession}</p>
                <p><strong>Fecha:</strong> ${formattedDate}</p>
                <p><strong>Hora:</strong> ${formattedTime}</p>
                <p><strong>Duración:</strong> ${booking.duration_minutes} minutos</p>
                ${booking.notes ? `<p><strong>Notas:</strong> ${booking.notes}</p>` : ''}
              </div>
              <p>Si necesitas cancelar o reprogramar, por favor contacta al profesional:</p>
              <p>📱 Teléfono: ${booking.professionals.phone || 'No disponible'}</p>
              <p>✉️ Email: ${booking.professionals.email}</p>
              <hr style="margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                Este es un recordatorio automático de TodoAca.ar<br>
                Si tienes alguna consulta, contacta a nuestro soporte.
              </p>
            </div>
          `,
          text: `
Recordatorio de Cita - TodoAca.ar

¡Tu cita es mañana!

Profesional: ${booking.professionals.full_name}
Profesión: ${booking.professionals.profession}
Fecha: ${formattedDate}
Hora: ${formattedTime}
Duración: ${booking.duration_minutes} minutos
${booking.notes ? `Notas: ${booking.notes}` : ''}

Si necesitas cancelar o reprogramar, contacta al profesional:
Teléfono: ${booking.professionals.phone || 'No disponible'}
Email: ${booking.professionals.email}

Este es un recordatorio automático de TodoAca.ar
          `
        };

        // Email template for professional
        const professionalEmailTemplate: EmailTemplate = {
          subject: `Recordatorio: Cita con ${booking.client_name} mañana`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Recordatorio de Cita - TodoAca.ar</h2>
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>¡Tienes una cita mañana!</h3>
                <p><strong>Cliente:</strong> ${booking.client_name}</p>
                <p><strong>Email:</strong> ${booking.client_email}</p>
                <p><strong>Teléfono:</strong> ${booking.client_phone || 'No proporcionado'}</p>
                <p><strong>Fecha:</strong> ${formattedDate}</p>
                <p><strong>Hora:</strong> ${formattedTime}</p>
                <p><strong>Duración:</strong> ${booking.duration_minutes} minutos</p>
                ${booking.notes ? `<p><strong>Notas del cliente:</strong> ${booking.notes}</p>` : ''}
              </div>
              <p>Recuerda prepararte para la cita y confirmar tu disponibilidad.</p>
              <hr style="margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px;">
                Este es un recordatorio automático de TodoAca.ar
              </p>
            </div>
          `,
          text: `
Recordatorio de Cita - TodoAca.ar

¡Tienes una cita mañana!

Cliente: ${booking.client_name}
Email: ${booking.client_email}
Teléfono: ${booking.client_phone || 'No proporcionado'}
Fecha: ${formattedDate}
Hora: ${formattedTime}
Duración: ${booking.duration_minutes} minutos
${booking.notes ? `Notas del cliente: ${booking.notes}` : ''}

Recuerda prepararte para la cita y confirmar tu disponibilidad.

Este es un recordatorio automático de TodoAca.ar
          `
        };

        // Send email to client using Resend
        if (Deno.env.get('RESEND_API_KEY')) {
          try {
            const clientEmailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'TodoAca <noreply@todoaca.ar>',
                to: [booking.client_email],
                subject: clientEmailTemplate.subject,
                html: clientEmailTemplate.html,
              }),
            });

            if (!clientEmailResponse.ok) {
              console.error('Failed to send client email:', await clientEmailResponse.text());
            } else {
              console.log(`Client reminder email sent for booking ${booking.id}`);
            }
          } catch (emailError) {
            console.error('Error sending client email:', emailError);
          }

          // Send email to professional
          try {
            const professionalEmailResponse = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'TodoAca <noreply@todoaca.ar>',
                to: [booking.professionals.email],
                subject: professionalEmailTemplate.subject,
                html: professionalEmailTemplate.html,
              }),
            });

            if (!professionalEmailResponse.ok) {
              console.error('Failed to send professional email:', await professionalEmailResponse.text());
            } else {
              console.log(`Professional reminder email sent for booking ${booking.id}`);
            }
          } catch (emailError) {
            console.error('Error sending professional email:', emailError);
          }
        }

        // Create notifications in the database
        await supabaseClient
          .from('notifications')
          .insert([
            {
              user_id: booking.professionals.user_id,
              title: 'Recordatorio de Cita',
              message: `Tienes una cita con ${booking.client_name} mañana a las ${formattedTime}`,
              type: 'reminder',
              action_url: '/professional/bookings'
            }
          ]);

        // Mark reminder as sent
        await supabaseClient
          .from('bookings')
          .update({ 
            reminder_sent: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.id);

        remindersResults.push({
          booking_id: booking.id,
          status: 'success',
          client_email: booking.client_email,
          professional_email: booking.professionals.email
        });

        console.log(`Successfully processed reminder for booking ${booking.id}`);

      } catch (bookingError) {
        console.error(`Error processing booking ${booking.id}:`, bookingError);
        const errorMessage = bookingError instanceof Error ? bookingError.message : String(bookingError);
        remindersResults.push({
          booking_id: booking.id,
          status: 'error',
          error: errorMessage
        });
      }
    }

    console.log(`Processed ${remindersResults.length} booking reminders`);

    return new Response(
      JSON.stringify({
        message: `Processed ${remindersResults.length} booking reminders`,
        results: remindersResults,
        success_count: remindersResults.filter(r => r.status === 'success').length,
        error_count: remindersResults.filter(r => r.status === 'error').length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-booking-reminders function:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to process booking reminders'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});