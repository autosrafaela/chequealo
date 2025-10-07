import React, { useState, useEffect, useRef } from 'react';
import { Input } from './input';
import { Label } from './label';
import { provinceCityMap } from '@/data/provinceCityData';
import { MapPin, X } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  required?: boolean;
  className?: string;
}

interface LocationOption {
  city: string;
  province: string;
  formatted: string;
  key: string;
}

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  value,
  onChange,
  placeholder = "Escribe tu ciudad o provincia...",
  label,
  id,
  required,
  className
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<LocationOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Create searchable location options
  const createLocationOptions = (): LocationOption[] => {
    const options: LocationOption[] = [];
    
    Object.entries(provinceCityMap).forEach(([provinceKey, cities]) => {
      // Format province name
      const provinceName = provinceKey
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Add each city
      cities.forEach(city => {
        options.push({
          city: city,
          province: provinceName,
          formatted: `${city}, ${provinceName}`,
          key: `${city.toLowerCase()}-${provinceKey}`
        });
      });
    });
    
    return options.sort((a, b) => a.formatted.localeCompare(b.formatted));
  };

  const allLocations = createLocationOptions();

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    if (newValue.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Filter suggestions
    const filtered = allLocations.filter(location => {
      const searchTerm = newValue.toLowerCase().trim();
      return (
        location.city.toLowerCase().includes(searchTerm) ||
        location.province.toLowerCase().includes(searchTerm) ||
        location.formatted.toLowerCase().includes(searchTerm)
      );
    }).slice(0, 10); // Limit to 10 results

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: LocationOption) => {
    setInputValue(suggestion.formatted);
    onChange(suggestion.formatted);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      // Update parent with current value even if not from suggestions
      onChange(inputValue);
    }, 150);
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setShowSuggestions(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className || ''}`}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative mt-1">
        <div className="relative">
          <Input
            ref={inputRef}
            id={id}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={placeholder}
            className="pl-9 pr-8"
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.key}
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-accent hover:text-accent-foreground ${
                  index === selectedIndex ? 'bg-accent text-accent-foreground' : ''
                }`}
                onMouseDown={(e) => e.preventDefault()} // Prevent blur
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">
                    <span className="font-medium">{suggestion.city}</span>
                    <span className="text-muted-foreground">, {suggestion.province}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};