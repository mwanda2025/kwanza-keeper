"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings2, Check } from 'lucide-react';
import { setBudget as saveBudget } from '@/lib/budget';
import { formatKwanza } from '@/lib/formatters';

interface BudgetManagerProps {
  currentBudget: number;
  onUpdate: (newBudget: number) => void;
}

export function BudgetManager({ currentBudget, onUpdate }: BudgetManagerProps) {
  const [value, setValue] = useState(currentBudget.toString());
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      saveBudget(numValue);
      onUpdate(numValue);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-primary">
          <Settings2 className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Adjust Budget</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 bg-card border-muted shadow-2xl">
        <div className="space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold">Monthly Budget</h4>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Set your spending limit</p>
          </div>
          <div className="flex gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="budget" className="sr-only">Budget</Label>
              <Input
                id="budget"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-9 bg-background font-code"
              />
            </div>
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            Currently: {formatKwanza(currentBudget)}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
