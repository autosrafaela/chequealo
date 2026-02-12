

# Plan: Reparar Formularios de Presupuesto y Express

## Problema Detectado

Hay dos problemas principales:

1. **"Solicitar Presupuesto" (ContactRequestDialog)**: El codigo parece correcto (inserta contact_request, crea conversacion, envia mensaje, notifica). El error podria estar relacionado con el estado de autenticacion del usuario o un problema de RLS. Necesitamos agregar mejor manejo de errores y feedback visual.

2. **"Presupuesto Express disponible"**: El link en la linea 356 de ProfessionalProfile.tsx abre el mismo `ContactRequestDialog` estandar en vez del componente `ExpressQuoteButton`. Esto significa que NO se marca como `is_express`, NO se envia la notificacion urgente con sonido express, y NO se usa el formato de mensaje prioritario.

---

## Cambios a Realizar

### 1. `src/pages/ProfessionalProfile.tsx` - Integrar Express real

**Problema**: El link "Presupuesto Express disponible" (linea 356) abre `setShowContactDialog(true)` que muestra el formulario estandar.

**Solucion**:
- Agregar estado `showExpressQuote` separado
- Importar `ExpressQuoteButton` (actualmente comentado en linea 12)
- Reemplazar el link express para que abra el `ExpressQuoteButton` con su dialog propio
- Alternativa: usar el `ExpressQuoteButton` directamente como componente inline

### 2. `src/components/ContactRequestDialog.tsx` - Mejorar manejo de errores y feedback

**Problema**: El error generico "Error al enviar la solicitud" no da informacion util al usuario.

**Solucion**:
- Agregar validacion de autenticacion con fallback a `supabase.auth.getUser()` (patron ya usado en useChat para evitar race conditions de AuthContext)
- Agregar feedback visual de exito: animacion con checkmark antes de redirigir
- Agregar manejo especifico de errores de RLS vs errores de red
- Log detallado del error para diagnostico

### 3. `src/components/ExpressQuoteButton.tsx` - Verificar y corregir

**Problema**: Puede tener el mismo problema de autenticacion.

**Solucion**:
- Agregar el mismo fallback de autenticacion (`supabase.auth.getUser()`)
- Verificar que `is_express: true` se inserte correctamente
- Mejorar feedback de exito con animacion

### 4. Verificar dominio

- Buscar cualquier referencia a `.ar` en los componentes de contacto/presupuesto
- Los componentes ya usan `supabase` client directamente (no URLs hardcodeadas), asi que no deberia haber bloqueo por dominio

---

## Detalle Tecnico

### ProfessionalProfile.tsx - Express integrado

```tsx
// Estado separado para Express
const [showExpressQuote, setShowExpressQuote] = useState(false);

// En el JSX, reemplazar el link express:
{professional.is_verified && (
  <p className="text-center text-xs text-muted-foreground">
    <button 
      onClick={() => setShowExpressQuote(true)} 
      className="text-amber-600 font-semibold hover:underline"
    >
      Presupuesto Express disponible
    </button>
  </p>
)}

// Agregar ExpressQuoteButton como dialog controlado
// (necesita refactorizar para aceptar open/onOpenChange como props)
```

### ContactRequestDialog.tsx - Auth fallback

```tsx
// Antes de insertar, verificar auth con fallback
let userId = user?.id;
if (!userId) {
  const { data: { user: freshUser } } = await supabase.auth.getUser();
  userId = freshUser?.id;
}
if (!userId) {
  toast.error('Tu sesion expiro. Por favor inicia sesion nuevamente.');
  return;
}
```

### Feedback visual de exito

```tsx
const [showSuccess, setShowSuccess] = useState(false);

// En el flujo exitoso:
setShowSuccess(true);
setTimeout(() => {
  setOpen(false);
  setShowSuccess(false);
  navigate(`/user-dashboard?tab=messages&conversation=${conversationId}`);
}, 2000);

// En el JSX del dialog, mostrar estado de exito:
{showSuccess ? (
  <div className="text-center py-8 space-y-4">
    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
      <CheckCircle className="w-10 h-10 text-green-600" />
    </div>
    <h3>¡Solicitud Enviada!</h3>
    <p>El profesional te contactara pronto.</p>
  </div>
) : (
  <form>...</form>
)}
```

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/ProfessionalProfile.tsx` | Separar Express del dialog estandar, agregar estado `showExpressQuote` |
| `src/components/ContactRequestDialog.tsx` | Auth fallback, feedback visual de exito, mejor logging de errores |
| `src/components/ExpressQuoteButton.tsx` | Auth fallback, mejorar feedback, aceptar open/onOpenChange como props controladas |

---

## Notas

- No hay referencias a `.ar` en los componentes de contacto; usan el cliente Supabase directamente
- El problema de "marca error" probablemente es un race condition de autenticacion (AuthContext no esta listo) o un error de RLS silencioso
- La notificacion ya esta implementada en `ContactRequestDialog` y `ExpressQuoteButton`; solo falta que el Express use su componente correcto

