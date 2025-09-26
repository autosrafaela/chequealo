import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface RecoveryEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const RecoveryEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: RecoveryEmailProps) => (
  <Html>
    <Head />
    <Preview>Recupera tu contraseña en CHEQUEALO</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Heading style={h1}>CHEQUEALO</Heading>
        </Section>
        
        <Heading style={h2}>Recuperar contraseña</Heading>
        
        <Text style={text}>
          Hola, recibimos una solicitud para restablecer la contraseña de tu cuenta en CHEQUEALO.
        </Text>
        
        <Text style={text}>
          Haz clic en el botón siguiente para crear una nueva contraseña:
        </Text>
        
        <Section style={buttonContainer}>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            style={button}
          >
            Restablecer contraseña
          </Link>
        </Section>
        
        <Text style={text}>
          O copia y pega este enlace en tu navegador:
        </Text>
        
        <Text style={linkText}>
          {`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
        </Text>
        
        <Text style={warningText}>
          ⚠️ Este enlace expirará en 1 hora por seguridad.
        </Text>
        
        <Text style={footerText}>
          Si no solicitaste restablecer tu contraseña, puedes ignorar este email. 
          Tu contraseña no será cambiada.
        </Text>
        
        <Text style={footer}>
          © 2024 CHEQUEALO - Plataforma de profesionales verificados
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
}

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
  borderRadius: '8px',
  margin: '0 auto',
  maxWidth: '500px',
}

const logoContainer = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const h1 = {
  color: '#2563eb',
  fontFamily: 'Arial, sans-serif',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
  letterSpacing: '2px',
}

const h2 = {
  color: '#1f2937',
  fontFamily: 'Arial, sans-serif',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '30px 0 20px 0',
  textAlign: 'center' as const,
}

const text = {
  color: '#374151',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '6px',
  color: '#ffffff',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const linkText = {
  color: '#6b7280',
  fontFamily: 'monospace',
  fontSize: '12px',
  lineHeight: '16px',
  backgroundColor: '#f3f4f6',
  padding: '8px',
  borderRadius: '4px',
  wordBreak: 'break-all' as const,
}

const warningText = {
  color: '#dc2626',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '12px',
  backgroundColor: '#fef2f2',
  borderRadius: '4px',
  border: '1px solid #fecaca',
}

const footerText = {
  color: '#6b7280',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  margin: '32px 0 16px 0',
  textAlign: 'center' as const,
}

const footer = {
  color: '#9ca3af',
  fontFamily: 'Arial, sans-serif',
  fontSize: '12px',
  textAlign: 'center' as const,
  margin: '0',
}