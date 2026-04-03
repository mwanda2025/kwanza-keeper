"use client";

import React from 'react';
import { useExpenses } from '@/hooks/useExpenses';
import { CATEGORIES, type Expense } from '@/lib/types';
import { formatKwanza } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { RotateCcw, Plus } from 'lucide-react';

interface RecentExpensesProps {
  onSelect: (text: string) => void;
  onRepeat: (expense: Omit<Expense, 'id'>) => void;
}

export function RecentExpenses({ onSelect, onRepeat }: RecentExpensesProps) {
  const { expenses } = useExpenses();

  // Pegar os últimos 5 gastos únicos (por descrição e valor) para evitar duplicados óbvios
  const recentItems = React.useMemo(() => {
    const unique = new Map<string, Expense>();
    expenses.slice(0, 15).forEach(e => {
      const key = `${e.description}-${e.amount}`;
      if (!unique.has(key)) {
        unique.set(key, e);
      }
    });
    return Array.from(unique.values()).slice(0, 5);
  }, [expenses]);

  if (recentItems.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="bg-card border border-muted rounded-2xl shadow-2xl overflow-hidden p-2 backdrop-blur-xl bg-card/95">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2 py-2 border-b border-muted/50 mb-1">
          Gastos Recentes
        </p>
        <div className="flex flex-col gap-1">
          {recentItems.map((item) => {
            const category = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[CATEGORIES.length - 1];
            return (
              <div 
                key={item.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/50 transition-all group"
              >
                <button
                  onClick={() => onSelect(`${item.amount}kz ${item.description}`)}
                  className="flex flex-1 items-center gap-3 text-left overflow-hidden"
                >
                  <span className="text-lg shrink-0">{category.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-foreground truncate">{item.description}</p>
                    <p className="text-[10px] font-code text-primary font-black">
                      {formatKwanza(item.amount)}
                    </p>
                  </div>
                </button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRepeat({
                    date: new Date().toISOString().split('T')[0],
                    category: item.category,
                    description: item.description,
                    amount: item.amount,
                    payment: item.payment,
                    person: item.person || "",
                    notes: item.notes || "",
                  })}
                  className="h-8 gap-1.5 text-[9px] font-black uppercase tracking-tight text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg px-2 shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  Repetir
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
