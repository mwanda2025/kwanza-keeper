"use client";

import React, { useState, useEffect } from 'react';
import { CATEGORIES, PAYMENT_METHODS, type Expense, type CurrencyCode } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, X, Save, Coins, Loader2, Calendar, CreditCard, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { naturalLanguageExpenseEntry } from '@/ai/flows/natural-language-expense-entry-flow';
import { useToast } from '@/hooks/use-toast';
import { SmartSuggestions } from './SmartSuggestions';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';

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
  const { settings } = useUserSettings();
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!!initialData);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  
  const isMultiCurrency = settings.multiCurrency;
  
  const [form, setForm] = useState<Omit<Expense, 'id'>>({
    date: "",
    category: "other",
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

  useEffect(() => {
    const rate = form.exchangeRate || 0;
    setForm(f => ({ ...f, baseAmount: Math.round(form.amount * rate) }));
  }, [form.amount, form.exchangeRate]);

  const handleCurrencyChange = (val: CurrencyCode) => {
    setForm(f => ({ ...f, currency: val, exchangeRate: DEFAULT_RATES[val] }));
  };

  const handleAiEntry = async (textToProcess?: string) => {
    const text = textToProcess || aiInput;
    if (!text.trim()) return;

    setIsAiLoading(true);
    try {
      const result = await naturalLanguageExpenseEntry({ text });
      if (result) {
        setForm(f => ({
          ...f,
          description: result.description,
          amount: result.amount,
          date: result.date,
          category: result.category,
          payment: result.paymentMethod || "Cash",
          person: result.person || "",
          notes: result.notes || "",
        }));
        setAiInput("");
        toast({ title: "IA processou o seu gasto!", description: "Dados preenchidos com sucesso." });
      } else {
        throw new Error("AI returned empty result");
      }
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Erro na IA", 
        description: "Não conseguimos processar o texto. Tenta preencher manualmente." 
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight">{initialData ? "Editar Dados" : "Registar Gasto"}</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">
            {isExpanded ? "Preenche os detalhes completos" : "Modo Rápido Ativo"}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-2xl bg-muted/50 h-10 w-10"><X className="h-5 w-5" /></Button>
      </div>

      <div className="space-y-6">
        {!initialData && (
          <div className="space-y-3 group relative">
            <Label className="text-[10px] uppercase tracking-[0.2em] text-primary font-black ml-1">Entrada Inteligente (IA)</Label>
            <div className="relative">
              <Input 
                value={aiInput} 
                onChange={(e) => setAiInput(e.target.value)} 
                placeholder="Ex: 2000kz almoço no Candando" 
                className="pr-12 bg-card border-white/5 h-16 rounded-2xl shadow-inner font-bold text-sm" 
              />
              <Button size="icon" variant="ghost" className="absolute right-2 top-2 h-12 w-12 text-primary hover:bg-primary/10 rounded-xl" onClick={() => handleAiEntry()} disabled={isAiLoading}>
                {isAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 stroke-[2.5px]" />}
              </Button>
              <SmartSuggestions inputValue={aiInput} onSelect={(val) => { setAiInput(val); handleAiEntry(val); }} />
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-3">
            <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black ml-1">Descrição</Label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
              <Input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="O que compraste?" className="bg-card border-white/5 h-14 pl-11 rounded-2xl font-bold" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className={isMultiCurrency ? "col-span-8 space-y-3" : "col-span-12 space-y-3"}>
                <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black ml-1">Valor ({form.currency})</Label>
                <div className="relative">
                  <Coins className="absolute left-4 top-5 h-5 w-5 text-primary/40" />
                  <Input 
                    type="text" 
                    value={isAmountFocused ? (form.amount === 0 ? "" : form.amount.toString()) : (form.amount === 0 ? "" : form.amount.toLocaleString('de-DE'))}
                    onFocus={() => setIsAmountFocused(true)}
                    onBlur={() => setIsAmountFocused(false)}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setForm(f => ({ ...f, amount: val === "" ? 0 : parseInt(val, 10) }));
                    }}
                    placeholder="0" 
                    className="bg-card border-white/5 font-code text-2xl text-primary h-16 pl-12 rounded-2xl shadow-inner" 
                  />
                </div>
              </div>
              {isMultiCurrency && (
                <div className="col-span-4 space-y-3">
                  <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Moeda</Label>
                  <Select value={form.currency} onValueChange={(val: CurrencyCode) => handleCurrencyChange(val)}>
                    <SelectTrigger className="h-16 bg-card border-white/5 font-black rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-white/10 rounded-2xl">
                      <SelectItem value="AOA">AOA</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {isMultiCurrency && form.currency !== 'AOA' && (
              <div className="grid grid-cols-2 gap-4 p-5 bg-primary/5 border border-primary/10 rounded-2xl shadow-inner">
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase font-black text-primary/60 flex items-center gap-2 tracking-widest">Taxa de Câmbio</Label>
                  <Input type="number" value={form.exchangeRate || ""} onChange={(e) => setForm(f => ({ ...f, exchangeRate: e.target.value === "" ? 0 : parseFloat(e.target.value) }))} className="h-10 bg-background border-white/5 font-code text-sm rounded-xl" />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-[9px] uppercase font-black text-muted-foreground/60 tracking-widest">Total Estimado</Label>
                  <p className="h-10 flex items-center justify-end font-code font-black text-lg text-foreground">{form.baseAmount?.toLocaleString('de-DE')} <span className="text-[10px] ml-1">Kz</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary gap-2 h-8 px-4 rounded-full border border-white/5 bg-white/[0.02]"
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {isExpanded ? "Menos Opções" : "Mais Opções (Categoria, Data...)"}
          </Button>
        </div>

        {isExpanded && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-4">
              <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black ml-1">Escolher Categoria</Label>
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((c) => {
                  const Icon = getCategoryIcon(c.id);
                  const isActive = form.category === c.id;
                  return (
                    <button 
                      key={c.id} 
                      onClick={() => setForm(f => ({ ...f, category: c.id }))} 
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-[1.5rem] border-2 transition-all active:scale-90",
                        isActive ? "border-primary bg-primary/10 shadow-lg shadow-primary/5" : "border-white/5 bg-card/40"
                      )}
                    >
                      <Icon className={cn("h-6 w-6 transition-all", isActive ? 'text-primary scale-110' : 'text-muted-foreground/60')} />
                      <span className={cn("text-[9px] font-black uppercase tracking-widest truncate w-full text-center", isActive ? 'text-primary' : 'text-muted-foreground')}>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black ml-1">Data</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
                  <Input type="date" value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} className="bg-card border-white/5 h-14 pl-11 rounded-2xl font-bold" />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black ml-1">Pagamento</Label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
                  <select value={form.payment} onChange={(e) => setForm(f => ({ ...f, payment: e.target.value }))} className="w-full h-14 pl-11 pr-4 bg-card border-2 border-white/5 rounded-2xl text-sm font-bold appearance-none cursor-pointer focus:border-primary/40 outline-none transition-all">
                    {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black ml-1">Notas Adicionais (Opcional)</Label>
              <div className="relative">
                <User className="absolute left-4 top-4 h-4 w-4 text-muted-foreground/40" />
                <Input value={form.person} onChange={(e) => setForm(f => ({ ...f, person: e.target.value }))} placeholder="Pessoa relacionada" className="bg-card border-white/5 h-14 pl-11 rounded-2xl font-bold mb-3" />
                <Textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Escreve aqui notas extra..." className="bg-card border-white/5 rounded-2xl min-h-[100px] p-4 font-medium" />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-4">
          <Button className="w-full h-16 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 active:scale-95 transition-all gap-3" onClick={() => {
            if (!form.description || !form.amount) {
              toast({ title: "Dados Incompletos", description: "Indica uma descrição e o valor.", variant: "destructive" });
              return;
            }
            onSave(form);
          }}>
            <Save className="h-5 w-5 stroke-[2.5px]" />
            {initialData ? "Actualizar Registo" : "Guardar na Nuvem"}
          </Button>
          <Button variant="ghost" className="w-full h-12 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground" onClick={onCancel}>Cancelar e Sair</Button>
        </div>
      </div>
    </div>
  );
}
