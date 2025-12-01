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
    }, 5000); // Change slide every 5 seconds

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
    setTimeout(() => setIsAutoPlaying(true), 10000); // Resume autoplay after 10s
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
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-lg group">
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

            {/* Content */}
            {(slide.title || slide.description || slide.button_text) && (
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
                <div className="max-w-3xl">
                  {slide.title && (
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
                      {slide.title}
                    </h2>
                  )}
                  {slide.description && (
                    <p className="text-lg md:text-xl mb-6 text-gray-200 animate-fade-in">
                      {slide.description}
                    </p>
                  )}
                  {slide.button_text && slide.link_url && (
                    <Link to={slide.link_url}>
                      <Button 
                        size="lg" 
                        className="animate-fade-in hover-scale"
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

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
