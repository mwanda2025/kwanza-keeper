
"use client";

import React from 'react';
import { type Expense, CATEGORIES } from '@/lib/types';
import { formatKwanza } from '@/lib/formatters';
import { Trash2, CloudOff, RotateCcw, Edit2, MoreVertical, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from './ui/button';

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: number) => void;
  onRepeat: (expense: Expense) => void;
  onClick: () => void;
  isNew?: boolean;
}

export function ExpenseItem({ expense, onDelete, onRepeat, onClick, isNew }: ExpenseItemProps) {
  const category = CATEGORIES.find(c => c.id === expense.category) || CATEGORIES[CATEGORIES.length - 1];
  const Icon = getCategoryIcon(expense.category);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(expense.id);
  };

  const handleRepeat = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRepeat(expense);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const isForeignCurrency = expense.currency && expense.currency !== 'AOA';

  return (
    <div 
      className={cn(
        "group relative flex items-center gap-3 p-3 hover:bg-muted/50 active:bg-muted/30 transition-all cursor-pointer animate-in fade-in slide-in-from-top-2 duration-500",
        isNew && "animate-success-pulse border-l-2 border-l-primary",
        expense.isDemo && "opacity-80"
      )}
      onClick={onClick}
    >
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105" 
        style={{ backgroundColor: `${category.color}22` }}
      >
        <Icon className="h-5 w-5" style={{ color: category.color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
            {category.emoji} {expense.description}
          </h4>
          {expense.isDemo && (
            <Badge variant="outline" className="h-3.5 px-1 text-[7px] font-black uppercase tracking-tighter border-primary/30 text-primary/60">
              Demo
            </Badge>
          )}
          {expense.synced === false && !expense.isDemo && (
            <CloudOff className="h-3 w-3 text-amber-500 shrink-0 animate-pulse" title="Apenas Local (Offline)" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {expense.person && (
            <span className="text-[8px] text-primary/80 font-bold bg-primary/10 px-1 rounded-sm uppercase tracking-tighter">
              {expense.person}
            </span>
          )}
          <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">{expense.payment}</span>
          {isForeignCurrency && (
            <span className="flex items-center gap-0.5 text-[8px] font-black text-primary uppercase bg-primary/5 px-1.5 rounded-full border border-primary/10">
              <Coins className="h-2 w-2" /> {expense.amount} {expense.currency}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="font-code font-black text-sm leading-none">
            {formatKwanza(expense.baseAmount || expense.amount).split(' ')[0]}
          </div>
          <div className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest text-right mt-0.5">Kz</div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-90"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Opções</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44 p-1 bg-card border-muted shadow-2xl rounded-xl">
            <DropdownMenuLabel className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground px-2 py-1">Ações</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-muted/50 mx-1" />
            
            <DropdownMenuItem 
              onClick={handleEdit}
              className="flex items-center gap-2.5 h-11 rounded-lg cursor-pointer focus:bg-primary/10 group"
            >
              <Edit2 className="h-3.5 w-3.5 text-muted-foreground group-focus:text-primary" />
              <span className="text-xs font-bold">Editar</span>
            </DropdownMenuItem>

            <DropdownMenuItem 
              onClick={handleRepeat}
              className="flex items-center gap-2.5 h-11 rounded-lg cursor-pointer focus:bg-primary/10 group"
            >
              <RotateCcw className="h-3.5 w-3.5 text-muted-foreground group-focus:text-primary" />
              <span className="text-xs font-bold">Repetir Hoje</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-muted/50 mx-1" />

            <DropdownMenuItem 
              onClick={handleDelete}
              className="flex items-center gap-2.5 h-11 rounded-lg cursor-pointer focus:bg-destructive/10 text-destructive group"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs font-bold">Eliminar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
