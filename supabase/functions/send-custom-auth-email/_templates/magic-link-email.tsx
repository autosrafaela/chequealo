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

interface MagicLinkEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const MagicLinkEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: MagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Tu enlace de acceso a CHEQUEALO</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Heading style={h1}>CHEQUEALO</Heading>
        </Section>
        
        <Heading style={h2}>Acceso directo a tu cuenta</Heading>
        
        <Text style={text}>
          Hola, aquí tienes tu enlace de acceso directo a CHEQUEALO. 
          No necesitas recordar tu contraseña.
        </Text>
        
        <Section style={buttonContainer}>
          <Link
            href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
            style={button}
          >
            Acceder a mi cuenta
          </Link>
        </Section>
        
        <Text style={text}>
          O copia y pega este código temporal de acceso:
        </Text>
        
        <Section style={codeContainer}>
          <Text style={code}>{token}</Text>
        </Section>
        
        <Text style={warningText}>
          ⚠️ Este enlace expirará en 1 hora por seguridad.
        </Text>
        
        <Text style={footerText}>
          Si no intentaste acceder a CHEQUEALO, puedes ignorar este email.
        </Text>
        
        <Text style={footer}>
          © 2024 CHEQUEALO - Plataforma de profesionales verificados
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
  backgroundColor: '#16a34a',
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

const codeContainer = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const code = {
  display: 'inline-block',
  padding: '16px 24px',
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  border: '2px dashed #d1d5db',
  color: '#1f2937',
  fontFamily: 'monospace',
  fontSize: '18px',
  fontWeight: 'bold',
  letterSpacing: '2px',
}

const warningText = {
  color: '#d97706',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '24px 0',
  padding: '12px',
  backgroundColor: '#fffbeb',
  borderRadius: '4px',
  border: '1px solid #fed7aa',
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