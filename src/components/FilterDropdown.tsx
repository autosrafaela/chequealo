import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterOption {
  value: string;
  label: string;
  description?: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  selected: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

const FilterDropdown = ({ options, selected, onSelect, placeholder }: FilterDropdownProps) => {
  const selectedOption = options.find(option => option.value === selected);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="text-foreground bg-background hover:bg-accent hover:text-accent-foreground min-w-[180px] justify-between font-medium h-auto"
        >
          {selectedOption?.label || placeholder}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onSelect(option.value)}
            className="flex items-start space-x-2 p-3"
          >
            <div className="flex items-center space-x-2 flex-1">
              {selected === option.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
              <div className="flex-1">
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </div>
                )}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterDropdown;