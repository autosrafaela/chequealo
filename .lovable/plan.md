

# Plan: Rediseno de la Pestana de Suscripcion

## Resumen

Reemplazar el contenido actual de `SubscriptionPanel` con un diseno que replica las 3 tarjetas de la pagina de Pricing, agrega un badge "TU PLAN ACTUAL", informacion del Programa Pioneros, y una seccion minimalista de vencimiento.

---

## Cambios en `src/components/SubscriptionPanel.tsx`

Reescribir el componente completo. El nuevo diseno incluye:

### 1. Tarjetas de Planes (clonadas del Index/Pricing)

Usar exactamente la misma estructura de 3 tarjetas (Basico, Premium, Pro) definida en `src/pages/Pricing.tsx`:
- Mismos precios, features, iconografia con checks verdes
- Misma estetica: bordes redondeados, badge "MAS ELEGIDO" en Premium, escala 1.1x en desktop
- Grid responsive: `grid-cols-1 lg:grid-cols-3` con Premium centrado y escalado

### 2. Badge "TU PLAN ACTUAL"

- Agregar un badge violeta (bg-primary) en la parte superior de la tarjeta correspondiente al plan actual del usuario
- Para el Programa Pioneros (status trial): marcar la tarjeta Premium (o la que corresponda) con:
  - Precio tachado y "$0" destacado en verde
  - Leyenda: "Bonificado por ser Miembro Fundador"

### 3. Botones de Cambio

- Boton deshabilitado (disabled, variant="default") en el plan actual con texto "Tu Plan Actual"
- Botones activos (variant="outline") en los demas planes con texto "Elegir [Plan]"
- Estilo redondeado y color violeta de la marca

### 4. Seccion de Proximo Vencimiento

Debajo de las tarjetas, una seccion minimalista:
- Card con icono de calendario
- Texto: "Proximo Vencimiento: [fecha de trial_end_date]"
- Sub-texto para Pioneros: "Programa Pioneros - Acceso bonificado hasta [fecha]"
- Sin tablas, sin formularios grises

### 5. Eliminaciones

- Eliminar toda la UI anterior: status cards, alerts, PlanSelector inline, PlanSelectionModal, formularios de pago
- Eliminar imports no usados: `PlanSelectionModal`, `PlanSelector`, `Alert`, `AlertDescription`, `Settings`, `CreditCard`, `XCircle`

---

## Estructura del nuevo componente

```
<div className="space-y-8">
  {/* Titulo */}
  <div className="text-center">
    <h2>Planes y Precios</h2>
    <p>Tu plan actual y opciones disponibles</p>
  </div>

  {/* Grid de 3 tarjetas (mismo estilo Pricing.tsx) */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {plans.map(plan => (
      <Card>
        {isPionero && plan.id === currentPlan && <Badge>TU PLAN ACTUAL</Badge>}
        {plan.badge && <Badge>MAS ELEGIDO</Badge>}
        <h2>{plan.name}</h2>
        <Price strikethrough={isPionero} />
        {isPionero && <p>$0 - Bonificado por ser Miembro Fundador</p>}
        <Features with green checks />
        <Button disabled={isCurrentPlan}>
          {isCurrentPlan ? 'Tu Plan Actual' : plan.cta}
        </Button>
      </Card>
    ))}
  </div>

  {/* Seccion Vencimiento */}
  <Card className="border border-border">
    <Calendar icon />
    <p>Proximo Vencimiento: {trialEndDate}</p>
    <p>Programa Pioneros - Acceso bonificado</p>
  </Card>
</div>
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/SubscriptionPanel.tsx` | Reescritura completa con nuevo diseno |

## Notas

- Los datos de planes se definen estaticamente (igual que en Pricing.tsx) ya que no dependen de la base de datos para el display
- El estado de suscripcion (trial, active, expired) se sigue obteniendo de `useSubscription`
- La fecha de vencimiento se calcula desde `subscription.trial_end_date`
- No se requieren cambios en la base de datos

