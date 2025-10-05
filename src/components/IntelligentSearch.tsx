import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Mic, MicOff, Sparkles, MapPin, Clock, TrendingUp, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAISearch } from '@/hooks/useAISearch';
import { useToast } from '@/components/ui/use-toast';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'ai' | 'location';
  metadata?: {
    location?: string;
    category?: string;
    popularity?: number;
  };
}

interface IntelligentSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showSuggestions?: boolean;
  className?: string;
}

export const IntelligentSearch: React.FC<IntelligentSearchProps> = ({
  placeholder = "Describí lo que necesitás... Ej: 'mi aire acondicionado no enfría bien'",
  onSearch,
  showSuggestions = true,
  className
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestionsList, setShowSuggestionsList] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { 
    searchWithAI, 
    generateSuggestions,
    intelligentSearch,
    isLoading: aiLoading 
  } = useAISearch();

  useEffect(() => {
    // Load initial suggestions
    loadInitialSuggestions();
  }, []);

  useEffect(() => {
    // Generate AI suggestions when user types
    if (searchQuery.length > 2) {
      const debounceTimer = setTimeout(() => {
        generateAISuggestions(searchQuery);
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    } else {
      loadInitialSuggestions();
    }
  }, [searchQuery]);

  const loadInitialSuggestions = () => {
    // Load recent searches from localStorage
    const recentSearches = JSON.parse(localStorage.getItem('recent-searches') || '[]');
    
    // Popular searches based on common needs
    const popularSearches = [
      { text: 'Plomero para arreglar canilla que gotea', category: 'plomeria' },
      { text: 'Electricista para instalar aire acondicionado', category: 'electricidad' },
      { text: 'Mecánico para revisión general del auto', category: 'automotor' },
      { text: 'Limpieza profunda de casa', category: 'limpieza' },
      { text: 'Jardinero para mantenimiento de césped', category: 'jardineria' },
      { text: 'Pintor para renovar habitación', category: 'pintura' }
    ];

    const initialSuggestions: SearchSuggestion[] = [
      ...recentSearches.slice(0, 3).map((search: string) => ({
        id: `recent-${search}`,
        text: search,
        type: 'recent' as const
      })),
      ...popularSearches.slice(0, 4).map((search, index) => ({
        id: `popular-${index}`,
        text: search.text,
        type: 'popular' as const,
        metadata: { category: search.category, popularity: 100 - index * 10 }
      }))
    ];

    setSuggestions(initialSuggestions);
  };

  const generateAISuggestions = async (query: string) => {
    try {
      const aiSuggestions = await generateSuggestions(query);
      
      const formattedSuggestions: SearchSuggestion[] = aiSuggestions.map((suggestion, index) => ({
        id: `ai-${index}`,
        text: suggestion,
        type: 'ai'
      }));

      setSuggestions(prev => [
        ...formattedSuggestions,
        ...prev.filter(s => s.type !== 'ai').slice(0, 3)
      ]);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    // Save to recent searches
    const recentSearches = JSON.parse(localStorage.getItem('recent-searches') || '[]');
    const updatedRecent = [query, ...recentSearches.filter((s: string) => s !== query)].slice(0, 10);
    localStorage.setItem('recent-searches', JSON.stringify(updatedRecent));

    try {
      // Always use intelligent search to enhance the query
      let finalQuery = query;
      
      // Try intelligent search enhancement (uses AI + local parsing)
      const enhanced = await intelligentSearch(query);
      if (enhanced && enhanced !== query) {
        finalQuery = enhanced;
        console.log('Query mejorada:', { original: query, enhanced: finalQuery });
      }

      // Navigate to search results
      const params = new URLSearchParams();
      params.set('q', finalQuery);
      if (query !== finalQuery) {
        params.set('original', query);
      }
      
      if (onSearch) {
        onSearch(finalQuery);
      } else {
        navigate(`/search?${params.toString()}`);
      }
      
      setShowSuggestionsList(false);
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error en búsqueda",
        description: "Hubo un problema procesando tu búsqueda. Intentá de nuevo.",
        variant: "destructive"
      });
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // Here you would typically send the audio to a speech-to-text service
        // For now, we'll show a placeholder
        setSearchQuery('Búsqueda por voz en desarrollo...');
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Grabando",
        description: "Hablá ahora para buscar por voz"
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive"
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const getSuggestionIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent': return Clock;
      case 'popular': return TrendingUp;
      case 'ai': return Sparkles;
      case 'location': return MapPin;
      default: return Search;
    }
  };

  return (
    <div className={`relative ${className || ''}`}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchQuery); }}>
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => showSuggestions && setShowSuggestionsList(true)}
            className="h-12 sm:h-14 text-base sm:text-lg px-4 sm:px-6 pr-24 bg-background/95 border-2 border-primary/20 rounded-xl placeholder:text-muted-foreground focus:border-primary transition-colors hero-search-bar"
          />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* Voice search button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`h-8 w-8 p-0 ${isRecording ? 'text-destructive animate-pulse' : 'text-muted-foreground hover:text-primary'}`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            {/* Search button */}
            <Button 
              type="submit"
              size="sm"
              disabled={aiLoading}
              className="bg-primary hover:bg-primary/90 h-8 px-3"
            >
              {aiLoading ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* AI processing indicator */}
      {aiLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 z-10">
          <Card className="border-primary/20">
            <CardContent className="p-2">
              <div className="flex items-center gap-2 text-sm text-primary">
                <Sparkles className="h-4 w-4 animate-spin" />
                Procesando con IA...
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showSuggestionsList && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-20">
          <Card className="border-primary/20 shadow-lg max-h-80 overflow-y-auto">
            <CardContent className="p-2">
              {suggestions.map((suggestion) => {
                const Icon = getSuggestionIcon(suggestion.type);
                return (
                  <div
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-3 p-2 hover:bg-primary/5 rounded-md cursor-pointer transition-colors"
                  >
                    <Icon className={`h-4 w-4 ${
                      suggestion.type === 'ai' ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    
                    <span className="flex-1 text-sm">{suggestion.text}</span>
                    
                    {suggestion.type === 'ai' && (
                      <Badge variant="secondary" className="text-xs">
                        IA
                      </Badge>
                    )}
                    
                    {suggestion.type === 'popular' && (
                      <Badge variant="outline" className="text-xs">
                        Popular
                      </Badge>
                    )}
                  </div>
                );
              })}
              
              <div className="mt-2 pt-2 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Describí tu problema en detalle para mejores resultados
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Click outside to close suggestions */}
      {showSuggestionsList && (
        <div 
          className="fixed inset-0 z-10"
          onClick={() => setShowSuggestionsList(false)}
        />
      )}
    </div>
  );
};

export default IntelligentSearch;