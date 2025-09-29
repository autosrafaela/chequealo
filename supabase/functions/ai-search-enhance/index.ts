import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, type, userId, searchHistory, location } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'enhance':
        systemPrompt = `Eres un asistente especializado en convertir consultas en lenguaje natural a búsquedas optimizadas para encontrar profesionales de servicios.

Tu trabajo es:
1. Identificar el tipo de servicio necesario
2. Extraer el problema específico
3. Mantener información de ubicación si está presente
4. Convertir a palabras clave efectivas para búsqueda

Ejemplos:
- "Mi aire acondicionado no enfría bien" → "técnico aire acondicionado refrigeración reparación"
- "Necesito alguien que arregle mi heladera que hace ruido" → "técnico heladera electrodomésticos reparación ruido"
- "Busco un plomero porque se me tapa el baño" → "plomero destapaciones baño cañerías"

Responde SOLAMENTE con las palabras clave optimizadas, sin explicaciones.`;
        
        userPrompt = `Consulta: "${query}"`;
        break;

      case 'suggest':
        systemPrompt = `Eres un asistente que genera sugerencias de búsqueda inteligentes para una plataforma de servicios profesionales.

Basándote en lo que el usuario está escribiendo, sugiere 3-4 consultas completas y específicas que podrían estar buscando.

Las sugerencias deben ser:
- Específicas y detalladas
- En español argentino
- Relacionadas con servicios profesionales comunes
- Útiles para encontrar profesionales

Responde con un array JSON de strings con las sugerencias.`;
        
        userPrompt = `El usuario está escribiendo: "${query}". Genera sugerencias de búsqueda relacionadas.`;
        break;

      case 'analyze':
        systemPrompt = `Eres un analizador de intención de búsqueda. Analiza la consulta del usuario y extrae:
1. intent: el propósito principal (ej: "repair", "install", "maintenance", "hire")
2. service: tipo de servicio (ej: "plomero", "electricista", "mecánico")
3. problem: problema específico si se menciona
4. urgency: nivel de urgencia (low, medium, high)
5. location: ubicación si se menciona

Responde con un objeto JSON con estas propiedades.`;
        
        userPrompt = `Analiza esta consulta: "${query}"`;
        break;

      case 'recommendations':
        systemPrompt = `Genera recomendaciones personalizadas de búsqueda basándote en:
- Historial de búsquedas del usuario
- Ubicación del usuario
- Servicios populares en la plataforma

Las recomendaciones deben ser servicios que el usuario podría necesitar.

Responde con un array JSON de strings con las recomendaciones.`;
        
        userPrompt = `Usuario en: ${location || 'No especificada'}
Historial: ${searchHistory?.join(', ') || 'Ninguno'}
Genera 5 recomendaciones personalizadas.`;
        break;

      default:
        throw new Error('Invalid request type');
    }

    console.log('Making OpenAI request for type:', type);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: type === 'enhance' ? 0.1 : 0.7,
        max_tokens: type === 'enhance' ? 100 : 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    console.log('OpenAI response:', content);

    let result;
    switch (type) {
      case 'enhance':
        result = { enhancedQuery: content };
        break;
      case 'suggest':
        try {
          result = { suggestions: JSON.parse(content) };
        } catch {
          // Fallback if JSON parsing fails
          result = { suggestions: content.split('\n').filter((s: string) => s.trim()) };
        }
        break;
      case 'analyze':
        try {
          result = JSON.parse(content);
        } catch {
          result = { intent: 'general', service: 'unknown' };
        }
        break;
      case 'recommendations':
        try {
          result = { recommendations: JSON.parse(content) };
        } catch {
          result = { recommendations: content.split('\n').filter((s: string) => s.trim()) };
        }
        break;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-search-enhance function:', error);
    
    // Provide fallback responses for different types
    let fallbackResult;
    const { type, query } = await req.json().catch(() => ({ type: 'enhance', query: '' }));
    
    switch (type) {
      case 'enhance':
        fallbackResult = { enhancedQuery: query };
        break;
      case 'suggest':
        fallbackResult = { suggestions: [
          'Plomero para reparaciones',
          'Electricista para instalaciones', 
          'Técnico de electrodomésticos',
          'Servicio de limpieza'
        ]};
        break;
      case 'analyze':
        fallbackResult = { 
          intent: 'general', 
          service: 'unknown',
          urgency: 'medium'
        };
        break;
      case 'recommendations':
        fallbackResult = { recommendations: [
          'Mantenimiento de aire acondicionado',
          'Servicio de plomería',
          'Reparación de electrodomésticos'
        ]};
        break;
      default:
        fallbackResult = { error: 'Invalid request type' };
    }

    return new Response(JSON.stringify(fallbackResult), {
      status: (error instanceof Error && error.message.includes('API key')) ? 503 : 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});