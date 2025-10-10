# Sistema de Facturación y Suscripciones - Chequealo

## Resumen

Sistema completo de suscripciones para profesionales con soporte para:
- Período de prueba gratuito (90 días por defecto)
- Múltiples planes (Free, Emprendedor, Profesional, Agencia)
- Integración con MercadoPago o modo mock para desarrollo
- Upgrade/downgrade de planes
- Gestión de facturación

## Variables de Entorno

Todas las variables son **opcionales**. Si no se configuran, el sistema funciona en modo de prueba sin procesamiento de pagos.

### Archivo `.env`

```env
# Activar/desactivar facturación (opcional, default: false)
VITE_BILLING_DISABLED=false

# Proveedor de pagos (opcional, default: mercadopago)
# Valores: stripe | mercadopago | mock
VITE_PAYMENT_PROVIDER=mercadopago

# Moneda (opcional, default: ARS)
VITE_CURRENCY=ARS

# Duración del período de prueba en días (opcional, default: 90)
VITE_TRIAL_DAYS=90

# Precios en centavos o unidad mínima (opcional, defaults mostrados)
VITE_PRICE_PROFESIONAL=14990
VITE_PRICE_EMPRENDEDOR=4990
VITE_PRICE_AGENCIA=39990
```

## Modos de Operación

### 1. Modo Billing Disabled (`BILLING_DISABLED=true`)

- **Comportamiento**: Permite crear suscripciones en estado "trialing" sin procesar pagos
- **Uso**: Desarrollo, testing, o si no se quiere cobrar aún
- **Flujo**:
  1. Usuario selecciona plan
  2. Se crea subscription con `status='trialing'`
  3. No se redirige a checkout
  4. Se muestra mensaje "Prueba iniciada"

### 2. Modo Mock (`PAYMENT_PROVIDER=mock`)

- **Comportamiento**: Similar a billing disabled pero simula un provider
- **Uso**: Testing de flujos sin usar APIs reales
- **Flujo**: Igual que billing disabled

### 3. Modo MercadoPago (`PAYMENT_PROVIDER=mercadopago`)

- **Comportamiento**: Integración completa con MercadoPago
- **Requisitos**: 
  - Secret `MERCADOPAGO_ACCESS_TOKEN` configurado en Supabase
  - Webhook `mercadopago-webhook` funcionando
- **Flujo**:
  1. Usuario selecciona plan
  2. Se crea preferencia de pago en MercadoPago
  3. Usuario es redirigido a checkout
  4. Webhook actualiza estado tras pago

### 4. Modo Stripe (Futuro)

- **Estado**: No implementado aún
- **Comportamiento**: Error al intentar suscribirse

## Estructura de Base de Datos

### Tabla `subscription_plans`

```sql
id TEXT PRIMARY KEY          -- 'free', 'emprendedor', 'profesional', 'agencia'
name TEXT                    -- Nombre visible
price NUMERIC                -- Precio en centavos/unidad mínima
currency TEXT                -- ARS, USD, etc.
billing_interval TEXT        -- 'monthly', 'yearly'
features JSONB               -- Array de strings con features
sort_order INTEGER           -- Orden de visualización
is_recommended BOOLEAN       -- Marcar como recomendado
is_active BOOLEAN            -- Activo/inactivo
-- ... otros campos de límites y features
```

### Tabla `subscriptions`

```sql
id UUID PRIMARY KEY
user_id UUID                 -- Usuario dueño
professional_id UUID         -- Profesional asociado
plan_id TEXT                 -- Plan actual (FK)
selected_plan_id TEXT        -- Plan seleccionado para después del trial
status TEXT                  -- 'trialing', 'active', 'past_due', 'cancelled', 'expired'
trial_start_date TIMESTAMP
trial_end_date TIMESTAMP
payment_data_required_date TIMESTAMP
next_billing_date TIMESTAMP
provider TEXT                -- 'mercadopago', 'stripe', 'mock'
provider_customer_id TEXT    -- ID del customer en el provider
provider_subscription_id TEXT -- ID de la subscription en el provider
-- ... otros campos
```

## Edge Functions (API Endpoints)

Todas las funciones están en `supabase/functions/`:

### 1. `billing-get-plans`

- **Método**: GET
- **Auth**: No requiere (público)
- **Descripción**: Retorna todos los planes activos ordenados
- **Response**:
```json
{
  "ok": true,
  "plans": [
    {
      "id": "free",
      "name": "Gratis",
      "price": 0,
      "currency": "ARS",
      "features": ["..."],
      "is_recommended": false,
      "sort_order": 0
    }
  ]
}
```

### 2. `billing-get-subscription`

- **Método**: GET
- **Auth**: Requiere JWT
- **Descripción**: Retorna la suscripción del usuario actual
- **Response**:
```json
{
  "ok": true,
  "subscription": {
    "id": "...",
    "status": "trialing",
    "plan_id": "profesional",
    "trial_end_date": "2026-01-08T...",
    "subscription_plans": { ... }
  }
}
```

### 3. `billing-subscribe`

- **Método**: POST
- **Auth**: Requiere JWT
- **Body**:
```json
{
  "plan_id": "profesional",
  "return_url": "https://chequealo.ar/dashboard"
}
```
- **Comportamiento**:
  - Si `BILLING_DISABLED=true` o `mock`: Crea/actualiza subscription en trialing
  - Si `mercadopago`: Crea preferencia y retorna checkout_url
- **Response (mock)**:
```json
{
  "ok": true,
  "mode": "trial",
  "message": "Prueba iniciada correctamente",
  "trial_days": 90
}
```
- **Response (mercadopago)**:
```json
{
  "ok": true,
  "checkout_url": "https://www.mercadopago.com/...",
  "init_point": "https://www.mercadopago.com/..."
}
```

### 4. `billing-portal`

- **Método**: POST
- **Auth**: Requiere JWT
- **Descripción**: Retorna URL del portal de facturación
- **Comportamiento**:
  - Si billing disabled/mock: Retorna URL interna `/dashboard#subscription`
  - Si stripe: Crea portal session (futuro)
  - Si mercadopago: Retorna URL interna
- **Response**:
```json
{
  "ok": true,
  "url": "https://chequealo.ar/dashboard#subscription"
}
```

### 5. `billing-cancel`

- **Método**: POST
- **Auth**: Requiere JWT
- **Descripción**: Cancela la suscripción (marca para cancelar al final del período)
- **Response**:
```json
{
  "ok": true,
  "message": "Suscripción cancelada correctamente"
}
```

## Componentes UI

### `<PricingTable />`

Componente reutilizable para mostrar planes.

**Props**:
```typescript
interface PricingTableProps {
  plans: Plan[];                    // Array de planes
  currency?: string;                // Default 'ARS'
  recommendedId?: string;           // ID del plan recomendado
  onPlanSelect?: (planId: string) => void;  // Callback al seleccionar
  currentPlanId?: string;           // Plan actualmente seleccionado
  loading?: boolean;                // Estado de carga
  ctaText?: string;                 // Texto del botón (default 'Comenzar')
  showFeatureDetails?: boolean;     // Mostrar detalles (default true)
}
```

**Uso**:
```tsx
import { PricingTable } from '@/components/PricingTable';

<PricingTable 
  plans={plans}
  onPlanSelect={(planId) => console.log('Selected:', planId)}
  recommendedId="profesional"
  ctaText="Empezar prueba"
/>
```

**Características**:
- Responsive: Grid en desktop, stack en mobile
- Resalta plan recomendado automáticamente
- Muestra plan seleccionado visualmente
- Colapsa features largas
- Muestra límites del plan

### `<SubscriptionPanel />`

Panel completo de gestión de suscripción (ya existente, mejorado).

**Ubicación**: Dashboard del profesional

**Funcionalidad**:
- Muestra estado actual (trial, active, expired, etc.)
- Permite seleccionar/cambiar plan
- Botones para "Guardar Selección" y "Pagar Ahora"
- Información de días restantes de prueba
- Detalles de facturación para suscripciones activas

## Hooks

### `useSubscription`

Hook principal para gestionar suscripciones (ya existente).

```typescript
const {
  subscription,           // Datos de la suscripción
  loading,               // Cargando
  creating,              // Procesando pago
  fetchSubscription,     // Refrescar datos
  createPaymentPreference, // Crear checkout
  updateSelectedPlan,    // Actualizar plan seleccionado
  getSubscriptionStatus, // Obtener estado actual
  getDaysRemaining,      // Días restantes de trial
  hasFullAccessDuringTrial, // Si tiene acceso full
  getPlanFeatures        // Features del plan actual
} = useSubscription();
```

## Estados de Suscripción

| Estado | Descripción | Acceso |
|--------|-------------|--------|
| `trial` | Período de prueba activo | Full acceso |
| `payment_reminder` | 15 días antes de expirar | Full acceso |
| `payment_required` | Últimos días del trial | Full acceso |
| `active` | Suscripción pagada y activa | Según plan |
| `expired` | Trial expirado sin pago | Plan gratuito |
| `cancelled` | Cancelada por usuario | Hasta fin de período |
| `past_due` | Pago fallido | Gracia según plan |

## Flujos de Usuario

### Flujo 1: Nuevo Profesional (Billing Disabled)

1. Usuario se registra como profesional
2. Trigger crea subscription automáticamente con plan por defecto
3. Estado: `trialing`, 90 días
4. En dashboard ve: "Período de Prueba Activo — 90 días"
5. Puede elegir plan para después del trial
6. Botón "Guardar Selección" solo guarda, no cobra
7. Al expirar trial: downgrade a plan Free

### Flujo 2: Nuevo Profesional (MercadoPago Activo)

1. Usuario se registra como profesional
2. Trigger crea subscription automáticamente
3. Estado: `trialing`, 90 días con full acceso
4. Usuario selecciona plan en dashboard
5. Click "Pagar Ahora" → redirige a MercadoPago
6. Tras pago exitoso → webhook actualiza status a `active`
7. Si trial expira sin pago → downgrade a Free

### Flujo 3: Cambio de Plan (Upgrade/Downgrade)

1. Usuario con subscription activa
2. Selecciona nuevo plan en `<PlanSelector />`
3. Si billing disabled: cambio inmediato
4. Si MercadoPago: se aplica cambio en próximo período (o prorratea según config)

### Flujo 4: Cancelación

1. Usuario clickea "Cancelar Suscripción"
2. Se marca `status='cancelled'`
3. Mantiene acceso hasta `current_period_end`
4. Después baja a plan Free

## Testing

### Prueba Manual: Modo Mock

1. Configurar `.env`:
```env
VITE_BILLING_DISABLED=true
VITE_TRIAL_DAYS=90
```

2. Registrarse como profesional
3. Ir a Dashboard > Suscripción
4. Verificar que muestre "Período de Prueba Activo — 90 días"
5. Seleccionar un plan
6. Click "Guardar Selección" (no debe redirigir)
7. Verificar toast "Plan seleccionado correctamente"

### Prueba Manual: MercadoPago

1. Configurar `.env`:
```env
VITE_BILLING_DISABLED=false
VITE_PAYMENT_PROVIDER=mercadopago
```

2. Asegurar que el secret `MERCADOPAGO_ACCESS_TOKEN` esté configurado
3. Registrarse como profesional
4. Seleccionar plan y click "Pagar Ahora"
5. Verificar redirección a MercadoPago
6. Completar pago en sandbox
7. Verificar que webhook actualice el status

## Telemetría (Eventos Sugeridos)

```typescript
// Eventos a trackear:
- view_pricing          // Usuario ve página de precios
- click_subscribe_plan  // Click en botón de plan
- trial_started         // Trial iniciado
- checkout_redirect     // Redirigido a checkout
- payment_success       // Pago exitoso (webhook)
- payment_failed        // Pago fallido (webhook)
- plan_upgraded         // Cambio a plan superior
- plan_downgraded       // Cambio a plan inferior
- cancel_requested      // Usuario solicita cancelación
- trial_expiring_soon   // 7 días antes de expirar
```

## Seguridad

- Todos los endpoints requieren autenticación JWT excepto `billing-get-plans`
- RLS policies en tablas `subscriptions` y `subscription_plans`
- Rate limiting básico en edge functions (implementar si necesario)
- Validación de plan_id antes de crear subscriptions
- Webhooks verifican firma (MercadoPago signature)

## Migración de Datos

Las migraciones son **idempotentes** y pueden ejecutarse múltiples veces sin duplicar datos.

Seed de planes ejecutado automáticamente:
- `free` - $0
- `emprendedor` - $4,990
- `profesional` - $14,990 (recomendado)
- `agencia` - $39,990

## Próximos Pasos

1. **Stripe Integration**: Implementar soporte para Stripe
   - Customer portal
   - Webhooks
   - Subscription management

2. **Analytics**: Agregar dashboard de métricas
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - Conversión trial → paid

3. **Notificaciones**: 
   - Email 7 días antes de expirar trial
   - Email al fallar pago
   - Push notifications

4. **Multi-currency**: Soporte para USD, EUR, etc.

5. **Annual Plans**: Añadir planes anuales con descuento

## Soporte

Para problemas o preguntas:
- Revisar logs de edge functions en Supabase Dashboard
- Verificar configuración de secrets
- Consultar `SECURITY_CHECKLIST.md` para validaciones

## Copys en Español

- "Empezar prueba de X días" - Botón principal
- "Período de Prueba Activo — te quedan {n} días" - Badge de trial
- "La facturación está en preparación. Podés activar tu plan en modo prueba." - Aviso billing off
- "Guardar Selección" - Guardar plan sin pagar
- "Pagar Ahora" - Ir a checkout
- "Gestionar Plan" - Abrir selector
- "Cancelar al finalizar período" - Cancelar subscription
