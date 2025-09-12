import { 
  Wrench, Zap, Car, Sparkles, Dumbbell, Paintbrush, 
  Hammer, Flame, TreePine, Building, Heart, Laptop 
} from "lucide-react";

const ServiceCategories = () => {
  // Servicios ordenados por ranking de búsquedas (los más buscados primero)
  const categories = [
    { name: "Empleada Doméstica / Servicio de Limpieza", icon: Sparkles, color: "bg-teal-100 text-teal-600", rank: 1 },
    { name: "Mecánico", icon: Car, color: "bg-orange-100 text-orange-600", rank: 2 },
    { name: "Técnico de Aire Acondicionado", icon: Wrench, color: "bg-blue-100 text-blue-600", rank: 3 },
    { name: "Kinesiólogo / Fisioterapeuta", icon: Heart, color: "bg-pink-100 text-pink-600", rank: 4 },
    { name: "Entrenador Personal", icon: Dumbbell, color: "bg-purple-100 text-purple-600", rank: 5 },
    { name: "Gestor del Automotor", icon: Car, color: "bg-red-100 text-red-600", rank: 6 },
    { name: "Profesor de Apoyo Escolar", icon: Laptop, color: "bg-indigo-100 text-indigo-600", rank: 7 },
    { name: "Servicio Técnico (Línea Blanca)", icon: Wrench, color: "bg-gray-100 text-gray-600", rank: 8 },
    { name: "Limpieza de Tapizados", icon: Sparkles, color: "bg-cyan-100 text-cyan-600", rank: 9 },
    { name: "Instalador de Durlock / Yesero", icon: Hammer, color: "bg-amber-100 text-amber-600", rank: 10 },
    { name: "Fumigador / Control de Plagas", icon: Building, color: "bg-green-100 text-green-600", rank: 11 },
    { name: "Profesor de Música", icon: Laptop, color: "bg-yellow-100 text-yellow-600", rank: 12 },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Servicios Populares
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Encontrá el profesional que necesitás entre nuestras categorías más solicitadas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <button
                key={index}
                className="group p-4 lg:p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-100 hover:border-primary/20 text-left"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-xl ${category.color} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-medium text-sm lg:text-base text-foreground leading-tight">
                    {category.name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button className="text-primary hover:text-primary/80 font-medium text-lg underline underline-offset-4">
            Ver todas las categorías
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServiceCategories;