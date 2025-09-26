import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ConfirmationEmail } from './_templates/confirmation-email.tsx'
import { RecoveryEmail } from './_templates/recovery-email.tsx'
import { MagicLinkEmail } from './_templates/magic-link-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)
const hookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') as string

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const headers = Object.fromEntries(req.headers)
    
    // If no webhook secret is configured, skip verification (for testing)
    let emailData
    if (hookSecret) {
      const wh = new Webhook(hookSecret)
      const verified = wh.verify(payload, headers) as {
        user: { email: string }
        email_data: {
          token: string
          token_hash: string
          redirect_to: string
          email_action_type: string
          site_url: string
        }
      }
      emailData = verified
    } else {
      // Parse JSON directly for testing
      emailData = JSON.parse(payload)
    }

    const { user, email_data } = emailData
    const {
      token,
      token_hash,
      redirect_to,
      email_action_type,
    } = email_data

    // Determine which template to use based on action type
    let emailTemplate
    let subject
    let fromName = 'CHEQUEALO'

    switch (email_action_type) {
      case 'signup':
        emailTemplate = React.createElement(ConfirmationEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to,
          email_action_type,
          user_email: user.email,
        })
        subject = '¡Confirma tu cuenta en CHEQUEALO!'
        break

      case 'recovery':
        emailTemplate = React.createElement(RecoveryEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to,
          email_action_type,
          user_email: user.email,
        })
        subject = 'Recupera tu contraseña - CHEQUEALO'
        break

      case 'magiclink':
        emailTemplate = React.createElement(MagicLinkEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to,
          email_action_type,
          user_email: user.email,
        })
        subject = 'Tu enlace de acceso - CHEQUEALO'
        break

      default:
        // Fallback to confirmation email
        emailTemplate = React.createElement(ConfirmationEmail, {
          supabase_url: Deno.env.get('SUPABASE_URL') ?? '',
          token,
          token_hash,
          redirect_to,
          email_action_type,
          user_email: user.email,
        })
        subject = 'CHEQUEALO - Confirma tu acción'
        break
    }

    // Render the email template
    const html = await renderAsync(emailTemplate)

    // Send the email
    const { data, error } = await resend.emails.send({
      from: `${fromName} <noreply@todoaca.ar>`, // Usa tu dominio verificado
      to: [user.email],
      subject: subject,
      html: html,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        email_id: data?.id 
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