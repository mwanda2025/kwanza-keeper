
"use client";

import React, { useState, useEffect } from 'react';
import { CATEGORIES, PAYMENT_METHODS, type Expense, type CurrencyCode } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, X, Save, WifiOff, Coins } from 'lucide-react';
import { naturalLanguageExpenseEntry } from '@/ai/flows/natural-language-expense-entry-flow';
import { parseExpenseOffline } from '@/lib/expenseParser';
import { useToast } from '@/hooks/use-toast';
import { SmartSuggestions } from './SmartSuggestions';
import { RecentExpenses } from './RecentExpenses';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { isMultiCurrencyEnabled } from '@/lib/budget';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ExpenseFormProps {
  initialData?: Expense;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

const DEFAULT_RATES: Record<CurrencyCode, number> = {
  'AOA': 1,
  'USD': 910,
  'EUR': 980
};

export function ExpenseForm({ initialData, onSave, onCancel }: ExpenseFormProps) {
  const { toast } = useToast();
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isMultiCurrency, setIsMultiCurrency] = useState(false);
  
  const [form, setForm] = useState<Omit<Expense, 'id'>>({
    date: "",
    category: "food",
    description: "",
    amount: 0,
    currency: "AOA",
    exchangeRate: 1,
    baseAmount: 0,
    payment: "Cash",
    person: "",
    notes: "",
  });

  useEffect(() => {
    setIsOnline(navigator.onLine);
    setIsMultiCurrency(isMultiCurrencyEnabled());
    
    if (initialData) {
      setForm({
        date: initialData.date,
        category: initialData.category,
        description: initialData.description,
        amount: initialData.amount,
        currency: initialData.currency || "AOA",
        exchangeRate: initialData.exchangeRate || 1,
        baseAmount: initialData.baseAmount || initialData.amount,
        payment: initialData.payment,
        person: initialData.person || "",
        notes: initialData.notes || "",
      });
    } else {
      setForm(f => ({ ...f, date: new Date().toISOString().split("T")[0] }));
    }
  }, [initialData]);

  // Actualizar baseAmount quando amount, currency ou rate mudam
  useEffect(() => {
    const rate = form.exchangeRate || 1;
    setForm(f => ({ ...f, baseAmount: Math.round(f.amount * rate) }));
  }, [form.amount, form.exchangeRate]);

  const handleCurrencyChange = (val: CurrencyCode) => {
    setForm(f => ({ 
      ...f, 
      currency: val, 
      exchangeRate: DEFAULT_RATES[val] 
    }));
  };

  const handleAiEntry = async (textToProcess?: string) => {
    const text = textToProcess || aiInput;
    if (!text.trim()) return;

    if (!isOnline) {
      processOffline(text);
      return;
    }

    setIsAiLoading(true);
    try {
      const result = await naturalLanguageExpenseEntry({ text });
      if (result) {
        setForm({
          ...result,
          currency: "AOA",
          exchangeRate: 1,
          baseAmount: result.amount,
          amount: result.amount,
          payment: result.paymentMethod || "Cash",
          person: result.person || "",
          notes: result.notes || "",
        });
        setAiInput("");
        toast({ title: "IA processou o seu gasto!", description: "Verifica os detalhes abaixo." });
      }
    } catch (error) {
      processOffline(text, true);
    } finally {
      setIsAiLoading(false);
    }
  };

  const processOffline = (text: string, fromFailure = false) => {
    const result = parseExpenseOffline(text);
    setForm({
      date: result.date,
      category: result.category,
      description: result.description,
      amount: result.amount,
      currency: "AOA",
      exchangeRate: 1,
      baseAmount: result.amount,
      payment: "Cash",
      person: "",
      notes: fromFailure ? "IA indisponível. Processado localmente." : "Processado offline (Sem Internet).",
    });
    setAiInput("");
    toast({ 
      title: "Motor Local Ativado", 
      description: "Entrada processada offline. A IA será aplicada no próximo gasto online.",
      variant: fromFailure ? "destructive" : "default"
    });
  };

  const handleSuggestionSelect = (fullText: string) => {
    setAiInput(fullText);
    handleAiEntry(fullText);
    setIsInputFocused(false);
  };

  const handleRepeatExpense = (expense: Omit<Expense, 'id'>) => {
    onSave(expense);
    setIsInputFocused(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-6 duration-500 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          {initialData ? "Editar Gasto" : "Novo Gasto"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full hover:bg-muted transition-all">
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="space-y-6">
        {!initialData && (
          <div className="space-y-2 group relative">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black group-focus-within:text-primary transition-colors">Entrada Rápida IA</Label>
            <div className="relative">
              <Input 
                value={aiInput} 
                onChange={(e) => setAiInput(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setTimeout(() => setIsInputFocused(false), 200)} 
                placeholder="Ex: 2000kz para almoço hoje"
                className="pr-10 bg-card border-muted focus:border-primary/50 transition-all rounded-xl h-12 shadow-sm"
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className={`absolute right-1 top-1 text-primary hover:bg-primary/10 transition-all ${isAiLoading ? 'animate-pulse scale-90' : 'hover:scale-110'}`}
                onClick={() => handleAiEntry()}
                disabled={isAiLoading}
              >
                {!isOnline ? <WifiOff className="h-5 w-5 text-amber-500" /> : <Sparkles className="h-5 w-5" />}
              </Button>
              
              <SmartSuggestions 
                inputValue={aiInput} 
                onSelect={handleSuggestionSelect} 
              />

              {!aiInput && isInputFocused && (
                <RecentExpenses 
                  onSelect={(text) => {
                    setAiInput(text);
                    handleAiEntry(text);
                  }} 
                  onRepeat={handleRepeatExpense}
                />
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Categoria</Label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => {
              const Icon = getCategoryIcon(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setForm(f => ({ ...f, category: c.id }))}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border-2 transition-all active:scale-95 ${
                    form.category === c.id 
                      ? `border-primary bg-primary/10 shadow-[0_0_15px_rgba(249,115,22,0.1)]` 
                      : 'border-muted bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <Icon className={`h-6 w-6 transition-transform ${form.category === c.id ? 'scale-110 text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-[9px] font-bold uppercase tracking-tight truncate w-full text-center ${form.category === c.id ? 'text-primary' : 'text-muted-foreground'}`}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Descrição</Label>
          <Input 
            value={form.description} 
            onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Ex: Supermercado Kero"
            className="bg-card border-muted rounded-xl h-11 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className={isMultiCurrency ? "col-span-8 space-y-2" : "col-span-12 space-y-2"}>
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">
                Valor ({form.currency})
              </Label>
              <Input 
                type="number"
                value={form.amount || ""} 
                onChange={(e) => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="bg-card border-muted font-code text-2xl text-primary h-14 rounded-xl focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            {isMultiCurrency && (
              <div className="col-span-4 space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Moeda</Label>
                <Select value={form.currency} onValueChange={(val: CurrencyCode) => handleCurrencyChange(val)}>
                  <SelectTrigger className="h-14 bg-card border-muted rounded-xl text-sm font-black">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-muted">
                    <SelectItem value="AOA">AOA</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {isMultiCurrency && form.currency !== 'AOA' && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl animate-in zoom-in-95 duration-300">
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase font-black text-primary flex items-center gap-1.5">
                  <Coins className="h-3 w-3" /> Câmbio (1 {form.currency})
                </Label>
                <Input 
                  type="number"
                  value={form.exchangeRate}
                  onChange={(e) => setForm(f => ({ ...f, exchangeRate: parseFloat(e.target.value) || 1 }))}
                  className="h-9 bg-background border-muted font-code text-xs"
                />
              </div>
              <div className="space-y-1.5 text-right">
                <Label className="text-[9px] uppercase font-black text-muted-foreground">Total em Kwanza</Label>
                <p className="h-9 flex items-center justify-end font-code font-black text-foreground text-sm">
                  {form.baseAmount?.toLocaleString('pt-AO')} Kz
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Data</Label>
            <Input 
              type="date"
              value={form.date} 
              onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
              className="bg-card border-muted rounded-xl h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Pagamento</Label>
            <select
              value={form.payment}
              onChange={(e) => setForm(f => ({ ...f, payment: e.target.value }))}
              className="w-full h-11 px-3 py-2 bg-card border-2 border-muted rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
            >
              {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Para quem? (Opcional)</Label>
          <Input 
            value={form.person} 
            onChange={(e) => setForm(f => ({ ...f, person: e.target.value }))}
            placeholder="Quem usou ou para quem foi?"
            className="bg-card border-muted rounded-xl h-11"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Notas Adicionais</Label>
          <Textarea 
            value={form.notes} 
            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Detalhes extras aqui..."
            className="bg-card border-muted rounded-xl resize-none focus:ring-1 focus:ring-primary/30 transition-all"
            rows={2}
          />
        </div>

        <Button 
          className="w-full h-14 text-base font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all gap-2" 
          onClick={() => {
            if (!form.description || !form.amount) {
              toast({ title: "Atenção!", description: "Adiciona uma descrição e valor primeiro.", variant: "destructive" });
              return;
            }
            onSave(form);
          }}
        >
          <Save className="h-5 w-5" />
          {initialData ? "Guardar Alterações" : "Registar Gasto"}
        </Button>
        
        <Button variant="ghost" className="w-full h-10 text-xs font-bold uppercase text-muted-foreground" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
