import { useState, useMemo } from "react";
import { Search, ExternalLink, Sparkles, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";

interface AI {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  difficulty: string;
  logo: string;
  url: string;
  tags: string[];
}

const aiTools: AI[] = [
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "Asistente conversacional avanzado para responder preguntas, escribir código y generar contenido",
    category: "Texto y Conversación",
    price: "Gratis / $20/mes",
    difficulty: "Fácil",
    logo: "🤖",
    url: "https://chat.openai.com",
    tags: ["conversación", "código", "escritura", "análisis"]
  },
  {
    id: "claude",
    name: "Claude",
    description: "IA de Anthropic especializada en conversaciones largas y análisis detallados",
    category: "Texto y Conversación",
    price: "Gratis / $20/mes",
    difficulty: "Fácil",
    logo: "🎭",
    url: "https://claude.ai",
    tags: ["análisis", "código", "escritura", "investigación"]
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Generación de imágenes artísticas de alta calidad mediante prompts",
    category: "Diseño y Arte",
    price: "$10-60/mes",
    difficulty: "Media",
    logo: "🎨",
    url: "https://midjourney.com",
    tags: ["imágenes", "arte", "diseño", "creatividad"]
  },
  {
    id: "dall-e",
    name: "DALL-E 3",
    description: "Creación de imágenes realistas y artísticas desde descripciones de texto",
    category: "Diseño y Arte",
    price: "Pay per use",
    difficulty: "Fácil",
    logo: "🖼️",
    url: "https://openai.com/dall-e-3",
    tags: ["imágenes", "diseño", "marketing"]
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    description: "Asistente de programación que sugiere código mientras escribes",
    category: "Desarrollo",
    price: "$10/mes",
    difficulty: "Media",
    logo: "💻",
    url: "https://github.com/features/copilot",
    tags: ["código", "programación", "desarrollo"]
  },
  {
    id: "jasper",
    name: "Jasper AI",
    description: "Herramienta de copywriting para marketing y contenido comercial",
    category: "Marketing y Contenido",
    price: "$49+/mes",
    difficulty: "Fácil",
    logo: "✍️",
    url: "https://jasper.ai",
    tags: ["marketing", "copywriting", "contenido", "ads"]
  },
  {
    id: "runway",
    name: "Runway ML",
    description: "Edición de video con IA, generación y efectos especiales",
    category: "Video",
    price: "$15+/mes",
    difficulty: "Media",
    logo: "🎬",
    url: "https://runwayml.com",
    tags: ["video", "edición", "efectos"]
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs",
    description: "Generación de voz realista y clonación de voces",
    category: "Audio",
    price: "Gratis / $5+/mes",
    difficulty: "Fácil",
    logo: "🎙️",
    url: "https://elevenlabs.io",
    tags: ["voz", "audio", "narración", "podcast"]
  }
];

const AISearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "Texto y Conversación", "Diseño y Arte", "Desarrollo", "Marketing y Contenido", "Video", "Audio"];

  const professionalKeywords = ["profesional", "experto", "servicio", "contratar", "freelancer", "humano", "persona"];
  
  const showChequealoPromo = useMemo(() => {
    return professionalKeywords.some(keyword => 
      searchQuery.toLowerCase().includes(keyword)
    );
  }, [searchQuery]);

  const filteredAIs = useMemo(() => {
    let filtered = aiTools;
    
    if (selectedCategory !== "all") {
      filtered = filtered.filter(ai => ai.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ai => 
        ai.name.toLowerCase().includes(query) ||
        ai.description.toLowerCase().includes(query) ||
        ai.tags.some(tag => tag.includes(query))
      );
    }
    
    return filtered;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <Badge className="mx-auto bg-primary/10 text-primary hover:bg-primary/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Directorio de IAs
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Encuentra la IA perfecta para tu necesidad
            </h1>
            <p className="text-xl text-muted-foreground">
              Descubre herramientas de inteligencia artificial para diseño, código, marketing, contenido, análisis y más
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, función o necesidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg border-2 focus-visible:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Chequealo Promo - Always visible */}
      <section className="container mx-auto px-4 mb-12">
        <Card className="border-2 border-primary bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 space-y-3 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <Users className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">¿Necesitas un profesional humano?</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  Para servicios profesionales reales, encuentra expertos verificados en tu zona
                </p>
              </div>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 gap-2 text-lg px-8"
                onClick={() => window.open("https://chequealo.ar", "_blank")}
              >
                <ExternalLink className="w-5 h-5" />
                Visitar Chequealo.ar
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Promo if searching for professional services */}
      {showChequealoPromo && (
        <section className="container mx-auto px-4 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-2 border-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl">Resultado Destacado</CardTitle>
              </div>
              <CardDescription className="text-base">
                Parece que buscas servicios profesionales humanos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg">
                <strong>Chequealo.ar</strong> es tu plataforma ideal para encontrar profesionales verificados:
              </p>
              <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                <li>Profesionales de todas las áreas y oficios</li>
                <li>Perfiles verificados con reseñas reales</li>
                <li>Contacto directo sin intermediarios</li>
                <li>Búsqueda por ubicación y especialidad</li>
              </ul>
              <Button
                size="lg"
                className="w-full md:w-auto"
                onClick={() => window.open("https://chequealo.ar", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ir a Chequealo.ar
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Category Filters */}
      <section className="container mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category === "all" ? "Todas" : category}
            </Button>
          ))}
        </div>
      </section>

      {/* AI Tools Grid */}
      <section className="container mx-auto px-4 pb-16">
        {filteredAIs.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-12 text-center space-y-4">
              <p className="text-xl text-muted-foreground">
                No se encontraron herramientas de IA con ese criterio.
              </p>
              <p className="text-muted-foreground">
                ¿Buscas un servicio profesional humano?
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open("https://chequealo.ar", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Buscar en Chequealo.ar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAIs.map((ai) => (
              <Card
                key={ai.id}
                className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => window.open(ai.url, "_blank")}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{ai.logo}</span>
                      <div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {ai.name}
                        </CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {ai.category}
                        </Badge>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {ai.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {ai.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm font-medium">{ai.price}</span>
                    <span className="text-xs text-muted-foreground">{ai.difficulty}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer CTA */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h3 className="text-2xl font-bold">¿No encontraste lo que buscabas?</h3>
            <p className="text-lg text-muted-foreground">
              Si necesitas servicios profesionales humanos, te invitamos a explorar nuestra plataforma principal
            </p>
            <Button
              size="lg"
              className="gap-2"
              onClick={() => window.open("https://chequealo.ar", "_blank")}
            >
              <Users className="w-5 h-5" />
              Descubrir Profesionales en Chequealo.ar
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AISearch;
