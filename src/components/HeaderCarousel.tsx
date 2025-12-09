import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CarouselSlide {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  display_order: number;
}

export const HeaderCarousel: React.FC = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_slides')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error('Error fetching carousel slides:', error);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % slides.length;
    goToSlide(newIndex);
  };

  if (slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-[200px] sm:h-[280px] md:h-[350px] lg:h-[450px] xl:h-[500px] overflow-hidden rounded-lg sm:rounded-xl group">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image_url}
              alt={slide.title || 'Slide'}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Content - Responsive */}
            {(slide.title || slide.description || slide.button_text) && (
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12 text-white">
                <div className="max-w-3xl">
                  {slide.title && (
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 line-clamp-2">
                      {slide.title}
                    </h2>
                  )}
                  {slide.description && (
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-3 sm:mb-4 md:mb-6 text-gray-200 line-clamp-2 sm:line-clamp-3">
                      {slide.description}
                    </p>
                  )}
                  {slide.button_text && slide.link_url && (
                    <Link to={slide.link_url}>
                      <Button 
                        size="sm"
                        className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-2 md:py-3 h-auto"
                      >
                        {slide.button_text}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows - Responsive */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-1.5 sm:p-2 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
          </button>
        </>
      )}

      {/* Dots indicator - Responsive */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 sm:h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-4 sm:w-6 md:w-8'
                  : 'bg-white/50 hover:bg-white/75 w-1.5 sm:w-2'
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};