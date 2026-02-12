# Configuración del Cloudflare Worker para Prerendering

## Token de Prerender.io
**Token:** `x9gHkf4ehk007uIfGH7I`

---

## Código del Cloudflare Worker

Copia este código en tu Cloudflare Worker "chequealo-prerender":

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';
    
    // Lista de bots de redes sociales y crawlers que necesitan prerendering
    const botPatterns = [
      'facebookexternalhit',
      'facebookcatalog',
      'Facebot',
      'Twitterbot',
      'WhatsApp',
      'LinkedInBot',
      'Slackbot',
      'TelegramBot',
      'Discordbot',
      'pinterest',
      'redditbot',
      'SkypeUriPreview',
      'Snapchat',
      'instagram'
    ];
    
    // Detectar si es un bot
    const isBot = botPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // Manejar solicitudes OPTIONS (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
    
    // Si es un bot y es una ruta de profesional, usar Prerender.io
    if (isBot && (url.pathname.startsWith('/professional/') || url.pathname.startsWith('/profesional/'))) {
      console.log(`Bot detected: ${userAgent} requesting ${url.pathname}`);
      
      const prerenderUrl = `https://service.prerender.io/${request.url}`;
      
      try {
        const response = await fetch(prerenderUrl, {
          headers: {
            'X-Prerender-Token': 'x9gHkf4ehk007uIfGH7I'
          }
        });
        
        // Retornar el HTML prerenderizado con headers CORS
        const body = await response.text();
        return new Response(body, {
          status: response.status,
          headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
          }
        });
      } catch (error) {
        console.error('Prerender error:', error);
        // Si falla, servir la app normalmente
        return env.ASSETS.fetch(request);
      }
    }
    
    // Para usuarios normales, servir la app React normalmente
    return env.ASSETS.fetch(request);
  }
};
```

---

## Pasos de Configuración en Cloudflare

### 1. Accede a tu Worker
Ve a: Cloudflare Dashboard → Workers & Pages → "chequealo-prerender"

### 2. Pega el Código
- Haz clic en "Quick Edit" o "Edit Code"
- Reemplaza TODO el código existente con el código de arriba
- Haz clic en "Save and Deploy"

### 3. Configura la Ruta
En Cloudflare Dashboard → tu dominio (chequealo.net) → Workers Routes:
- Añade ruta: `chequealo.net/professional/*`
- Worker: `chequealo-prerender`
- Añade ruta: `chequealo.net/profesional/*`
- Worker: `chequealo-prerender`

### 4. Verifica el Despliegue
Espera 1-2 minutos para que se propague.

---

## Pruebas de Validación

### Test 1: Facebook Sharing Debugger
1. Ve a: https://developers.facebook.com/tools/debug/
2. Ingresa: `https://chequealo.net/professional/[ID-DE-PROFESIONAL]`
3. Haz clic en "Scrape Again" para forzar actualización
4. Verifica que aparezca:
   - ✅ Imagen correcta (foto del profesional o imagen genérica)
   - ✅ Título con nombre del profesional
   - ✅ Descripción del profesional

### Test 2: Twitter Card Validator
1. Ve a: https://cards-dev.twitter.com/validator
2. Ingresa la URL del perfil
3. Verifica preview

### Test 3: LinkedIn Post Inspector
1. Ve a: https://www.linkedin.com/post-inspector/
2. Ingresa la URL del perfil
3. Verifica preview

### Test 4: Prueba con WhatsApp
Envía el link por WhatsApp y verifica el preview.

---

## Problemas Comunes

### El preview no cambia
**Solución:** Los crawlers cachean la información. Usa "Scrape Again" en Facebook Debugger.

### Sale imagen genérica cuando debería salir la foto
**Causas posibles:**
1. La URL de la imagen no es accesible públicamente
2. El crawler no puede descargar la imagen (timeout, tamaño)
3. Cache del crawler

**Solución:**
- Verifica que la imagen sea accesible desde: https://www.chequealo.net/storage/[ruta]
- Las imágenes de Supabase deben tener el bucket público
- Usa "Scrape Again" para actualizar cache

### No funciona en ningún profesional
**Causas posibles:**
1. El Worker no está desplegado correctamente
2. La ruta del Worker no está configurada
3. El token de Prerender.io es incorrecto

**Solución:**
- Verifica que el Worker esté en estado "Active"
- Revisa los logs del Worker en Cloudflare Dashboard
- Confirma que las rutas estén configuradas correctamente

---

## Monitoreo

### Ver logs del Worker
Cloudflare Dashboard → Workers → chequealo-prerender → Logs

Deberías ver mensajes como:
```
Bot detected: facebookexternalhit/1.1 requesting /professional/123...
```

### Ver uso de Prerender.io
Prerender.io Dashboard → Panel → Observa el contador de "renders"

Límite gratuito: 1000 renders/mes (debería ser más que suficiente)

---

## Checklist Final de Validación

- [ ] Worker desplegado con el código correcto
- [ ] Rutas configuradas en Cloudflare (`/professional/*` y `/profesional/*`)
- [ ] Facebook Debugger muestra meta tags correctos para perfiles CON foto
- [ ] Facebook Debugger muestra imagen genérica para perfiles SIN foto  
- [ ] Facebook Debugger muestra descripción del profesional
- [ ] Twitter Card Validator funciona correctamente
- [ ] WhatsApp muestra preview al compartir
- [ ] Instagram muestra preview al compartir en stories/DM
- [ ] Los usuarios normales (no bots) ven la aplicación React normalmente

---

## Notas Importantes

1. **Tiempo de propagación:** Puede tomar 1-5 minutos después de desplegar
2. **Cache de crawlers:** Facebook y otros cachean por 7+ días. Usa "Scrape Again" para actualizar
3. **Solo para bots:** Los usuarios normales no verán diferencia, la app funciona igual
4. **Uso gratuito:** 1000 prerenders/mes en plan gratuito de Prerender.io
5. **SEO de Google:** Google NO usa prerender (ejecuta JavaScript), solo redes sociales lo necesitan
