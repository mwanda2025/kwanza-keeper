"use client";

import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Car, 
  Utensils, 
  Fuel, 
  ShoppingBag, 
  Wifi, 
  Droplets, 
  Home, 
  Bike, 
  Coffee,
  Moon
} from 'lucide-react';

interface SmartSuggestionsProps {
  inputValue: string;
  onSelect: (suggestion: string) => void;
}

const COMMON_SUFFIXES = [
  { text: "no táxi", icon: Car, label: "Táxi" },
  { text: "almoço", icon: Utensils, label: "Almoço" },
  { text: "combustível", icon: Fuel, label: "Gasosa/Combustível" },
  { text: "compras", icon: ShoppingBag, label: "Compras" },
  { text: "internet", icon: Wifi, label: "Internet/Unitel" },
  { text: "pequeno-almoço", icon: Coffee, label: "Matabicho" },
  { text: "jantar", icon: Moon, label: "Jantar" },
  { text: "mota", icon: Bike, label: "Mota" },
  { text: "água", icon: Droplets, label: "Água" },
  { text: "renda", icon: Home, label: "Renda" },
];

export function SmartSuggestions({ inputValue, onSelect }: SmartSuggestionsProps) {
  const suggestions = useMemo(() => {
    // Regex para detectar um número seguido de kz, kwanza ou k (opcional)
    // Ex: "2000", "2000kz", "2000 kz"
    const match = inputValue.trim().match(/^(\d+)\s*(kz|kwanza|k)?$/i);
    
    if (!match) return [];

    const amount = match[1];
    const suffixUsed = match[2] || "kz";

    return COMMON_SUFFIXES.map(suffix => ({
      full: `${amount}${suffixUsed} ${suffix.text}`,
      display: suffix.text,
      icon: suffix.icon,
      label: suffix.label
    }));
  }, [inputValue]);

  if (suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-card border border-muted rounded-2xl shadow-2xl overflow-hidden p-2 grid grid-cols-2 gap-1.5 backdrop-blur-xl bg-card/95">
        <p className="col-span-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2 py-1">Sugestões Rápidas</p>
        {suggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(suggestion.full)}
            className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all active:scale-95 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <suggestion.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-tight text-foreground truncate">{suggestion.display}</p>
              <p className="text-[9px] text-muted-foreground truncate">{suggestion.label}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
