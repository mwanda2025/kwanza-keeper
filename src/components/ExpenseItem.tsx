
"use client";

import React from 'react';
import { type Expense, CATEGORIES } from '@/lib/types';
import { formatKwanza } from '@/lib/formatters';
import { Trash2, RotateCcw, Edit2, MoreVertical, Coins } from 'lucide-react';
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
  onDelete: (id: string) => void;
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
        "group relative flex items-center gap-3 p-4 hover:bg-white/[0.03] active:bg-white/[0.05] transition-all cursor-pointer border-b border-white/[0.02] last:border-0",
        isNew && "animate-success-pulse border-l-2 border-l-primary"
      )}
      onClick={onClick}
    >
      <div 
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-all group-active:scale-90" 
        style={{ backgroundColor: `${category.color}15` }}
      >
        <Icon className="h-5.5 w-5.5" style={{ color: category.color }} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors leading-tight">
            {expense.description}
          </h4>
          {expense.isDemo && (
            <Badge variant="outline" className="h-3.5 px-1 text-[7px] font-black uppercase tracking-tighter border-primary/30 text-primary/60">
              Demo
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{category.label}</span>
          </div>
          <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">•</span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{expense.payment}</span>
          {isForeignCurrency && (
            <span className="flex items-center gap-0.5 text-[8px] font-black text-primary uppercase bg-primary/5 px-1.5 rounded-full border border-primary/10">
              <Coins className="h-2 w-2" /> {expense.amount} {expense.currency}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="font-code font-black text-[15px] leading-none tracking-tight">
            {formatKwanza(expense.baseAmount || expense.amount).split(' ')[0]}
          </div>
          <div className="text-[8px] text-muted-foreground font-black uppercase tracking-widest mt-1">Kwanza</div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48 p-1 bg-card border-white/10 shadow-2xl rounded-2xl backdrop-blur-xl">
            <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground px-3 py-2">Opções do Gasto</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5 mx-1" />
            
            <DropdownMenuItem onClick={handleEdit} className="flex items-center gap-3 h-11 rounded-xl cursor-pointer focus:bg-primary/10 group px-3">
              <Edit2 className="h-4 w-4 text-muted-foreground group-focus:text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">Editar Dados</span>
            </DropdownMenuItem>

            <DropdownMenuItem onClick={handleRepeat} className="flex items-center gap-3 h-11 rounded-xl cursor-pointer focus:bg-primary/10 group px-3">
              <RotateCcw className="h-4 w-4 text-muted-foreground group-focus:text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">Repetir Agora</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-white/5 mx-1" />

            <DropdownMenuItem onClick={handleDelete} className="flex items-center gap-3 h-11 rounded-xl cursor-pointer focus:bg-destructive/10 text-destructive group px-3">
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="text-xs font-bold uppercase tracking-widest">Apagar Registo</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
