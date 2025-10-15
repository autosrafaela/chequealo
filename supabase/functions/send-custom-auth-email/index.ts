const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to create HTML email templates
function createEmailHTML(type: string, token: string, tokenHash: string, redirectTo: string, userEmail: string, supabaseUrl: string): string {
  const baseUrl = supabaseUrl || 'https://rolitmcxydholgsxpvwa.supabase.co'
  const confirmationUrl = `${baseUrl}/auth/v1/verify?token=${tokenHash}&type=${type}&redirect_to=${redirectTo}`
  
  const commonStyles = `
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc; }
    .container { max-width: 500px; margin: 0 auto; background: white; padding: 45px; border-radius: 8px; border: 1px solid #f0f0f0; }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo h1 { color: #2563eb; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 2px; }
    .title { color: #1f2937; font-size: 24px; font-weight: bold; margin: 30px 0 20px 0; text-align: center; }
    .text { color: #374151; font-size: 16px; line-height: 24px; margin: 16px 0; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block; }
    .link { color: #6b7280; font-family: monospace; font-size: 12px; background: #f3f4f6; padding: 8px; border-radius: 4px; word-break: break-all; }
    .warning { color: #dc2626; font-size: 14px; font-weight: bold; text-align: center; margin: 24px 0; padding: 12px; background: #fef2f2; border-radius: 4px; border: 1px solid #fecaca; }
    .footer { color: #6b7280; font-size: 14px; margin: 32px 0 16px 0; text-align: center; }
    .copyright { color: #9ca3af; font-size: 12px; text-align: center; margin: 0; }
  `

  switch (type) {
    case 'signup':
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${commonStyles}</style></head>
        <body>
          <div class="container">
            <div class="logo"><h1>CHEQUEALO</h1></div>
            <div class="title">¡Bienvenido a CHEQUEALO!</div>
            <div class="text">Hola, gracias por registrarte en CHEQUEALO. Para completar tu registro, necesitamos que confirmes tu dirección de email.</div>
            <div class="button-container">
              <a href="${confirmationUrl}" class="button">Confirmar mi cuenta</a>
            </div>
            <div class="text">O copia y pega este enlace en tu navegador:</div>
            <div class="link">${confirmationUrl}</div>
            <div class="footer">Si no creaste una cuenta en CHEQUEALO, puedes ignorar este email.</div>
            <div class="copyright">© 2024 CHEQUEALO - Plataforma de profesionales verificados</div>
          </div>
        </body>
        </html>
      `
    
    case 'recovery':
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${commonStyles} .button { background-color: #dc2626; }</style></head>
        <body>
          <div class="container">
            <div class="logo"><h1>CHEQUEALO</h1></div>
            <div class="title">Recuperar contraseña</div>
            <div class="text">Hola, recibimos una solicitud para restablecer la contraseña de tu cuenta en CHEQUEALO.</div>
            <div class="text">Haz clic en el botón siguiente para crear una nueva contraseña:</div>
            <div class="button-container">
              <a href="${confirmationUrl}" class="button">Restablecer contraseña</a>
            </div>
            <div class="text">O copia y pega este enlace en tu navegador:</div>
            <div class="link">${confirmationUrl}</div>
            <div class="warning">⚠️ Este enlace expirará en 1 hora por seguridad.</div>
            <div class="footer">Si no solicitaste restablecer tu contraseña, puedes ignorar este email. Tu contraseña no será cambiada.</div>
            <div class="copyright">© 2024 CHEQUEALO - Plataforma de profesionales verificados</div>
          </div>
        </body>
        </html>
      `
    
    case 'magiclink':
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${commonStyles} .button { background-color: #16a34a; } .code { display: inline-block; padding: 16px 24px; background: #f3f4f6; border-radius: 6px; border: 2px dashed #d1d5db; color: #1f2937; font-family: monospace; font-size: 18px; font-weight: bold; letter-spacing: 2px; }</style></head>
        <body>
          <div class="container">
            <div class="logo"><h1>CHEQUEALO</h1></div>
            <div class="title">Acceso directo a tu cuenta</div>
            <div class="text">Hola, aquí tienes tu enlace de acceso directo a CHEQUEALO. No necesitas recordar tu contraseña.</div>
            <div class="button-container">
              <a href="${confirmationUrl}" class="button">Acceder a mi cuenta</a>
            </div>
            <div class="text">O copia y pega este código temporal de acceso:</div>
            <div class="button-container">
              <div class="code">${token}</div>
            </div>
            <div class="warning" style="color: #d97706; background: #fffbeb; border-color: #fed7aa;">⚠️ Este enlace expirará en 1 hora por seguridad.</div>
            <div class="footer">Si no intentaste acceder a CHEQUEALO, puedes ignorar este email.</div>
            <div class="copyright">© 2024 CHEQUEALO - Plataforma de profesionales verificados</div>
          </div>
        </body>
        </html>
      `
    
    default:
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${commonStyles}</style></head>
        <body>
          <div class="container">
            <div class="logo"><h1>CHEQUEALO</h1></div>
            <div class="title">CHEQUEALO - Confirma tu acción</div>
            <div class="text">Hola, necesitamos que confirmes esta acción en tu cuenta de CHEQUEALO.</div>
            <div class="button-container">
              <a href="${confirmationUrl}" class="button">Confirmar acción</a>
            </div>
            <div class="text">O copia y pega este enlace en tu navegador:</div>
            <div class="link">${confirmationUrl}</div>
            <div class="copyright">© 2024 CHEQUEALO - Plataforma de profesionales verificados</div>
          </div>
        </body>
        </html>
      `
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const payload = await req.text()
    let emailData

    try {
      emailData = JSON.parse(payload)
    } catch (parseError) {
      console.error('Failed to parse JSON payload:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const { user, email_data } = emailData
    if (!user?.email || !email_data) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      )
    }

    const {
      token,
      token_hash,
      redirect_to,
      email_action_type,
    } = email_data

    // Determine subject and create HTML
    let subject = 'CHEQUEALO'
    switch (email_action_type) {
      case 'signup':
        subject = '¡Confirma tu cuenta en CHEQUEALO!'
        break
      case 'recovery':
        subject = 'Recupera tu contraseña - CHEQUEALO'
        break
      case 'magiclink':
        subject = 'Tu enlace de acceso - CHEQUEALO'
        break
      default:
        subject = 'CHEQUEALO - Confirma tu acción'
        break
    }

    const html = createEmailHTML(
      email_action_type,
      token,
      token_hash,
      redirect_to,
      user.email,
      Deno.env.get('SUPABASE_URL') || ''
    )

    // Send via Resend using fetch
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CHEQUEALO <noreply@chequealo.ar>',
        to: [user.email],
        subject: subject,
        html: html,
      }),
    })

    const resendData = await resendResponse.json()

    if (!resendResponse.ok) {
      console.error('Resend error:', resendData)
      throw new Error(`Resend API error: ${resendData.message || 'Unknown error'}`)
    }

    console.log('Email sent successfully:', resendData)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email_id: resendData.id 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error: any) {
    console.error('Error in send-custom-auth-email function:', error)
    
    return new Response(
      JSON.stringify({
        error: {
          message: error.message || 'Internal server error',
          code: error.code || 'UNKNOWN_ERROR',
        },
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    )
  }
})