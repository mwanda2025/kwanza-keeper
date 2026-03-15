
"use client";

import React, { useState } from 'react';
import { type FixedExpense, type RecurrenceType, CATEGORIES, type Expense } from '@/lib/types';
import { useFixedExpenses } from '@/hooks/useFixedExpenses';
import { useExpenses } from '@/hooks/useExpenses';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar,
  AlertCircle,
  X,
  ChevronRight,
  Wallet,
  Settings2,
  Bell
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { Badge } from './ui/badge';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { useToast } from '@/hooks/use-toast';

interface FixedExpensesManagerProps {
  expenses: Expense[];
}

export function FixedExpensesManager({ expenses }: FixedExpensesManagerProps) {
  const { fixedExpenses, addFixedExpense, removeFixedExpense, updateFixedExpense, getPaidStatus } = useFixedExpenses(expenses);
  const { addExpense } = useExpenses();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<Omit<FixedExpense, 'id' | 'synced'>>({
    label: '',
    amount: 0,
    category: 'home',
    recurrence: 'monthly',
    dueDay: 1,
    reminderDaysBefore: 1
  });

  const handleSave = async () => {
    if (!form.label || form.amount <= 0) {
      toast({ variant: "destructive", title: "Campos Inválidos", description: "Preenche o nome e o valor corretamente." });
      return;
    }

    if (editingId) {
      await updateFixedExpense({ ...form, id: editingId });
      toast({ title: "Despesa Fixa Atualizada" });
    } else {
      await addFixedExpense(form);
      toast({ title: "Despesa Fixa Criada" });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      label: '',
      amount: 0,
      category: 'home',
      recurrence: 'monthly',
      dueDay: 1,
      reminderDaysBefore: 1
    });
    setEditingId(null);
  };

  const handleEdit = (f: FixedExpense) => {
    setForm({
      label: f.label,
      amount: f.amount,
      category: f.category,
      recurrence: f.recurrence,
      dueDay: f.dueDay,
      reminderDaysBefore: f.reminderDaysBefore || 1
    });
    setEditingId(f.id);
    setIsDialogOpen(true);
  };

  const handleMarkAsPaid = async (fixed: FixedExpense) => {
    const alreadyPaid = getPaidStatus(fixed);
    if (alreadyPaid) return;

    await addExpense({
      date: new Date().toISOString().split('T')[0],
      category: fixed.category,
      description: fixed.label,
      amount: fixed.amount,
      payment: 'Transfer',
      person: '',
      notes: `Pagamento de despesa fixa (${fixed.recurrence})`
    });

    toast({
      title: "Pagamento Registado",
      description: `${fixed.label} foi adicionado ao histórico deste mês.`
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          Despesas Fixas e Recorrentes
        </h3>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-muted rounded-2xl max-w-[90vw]">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">
                {editingId ? 'Editar Despesa Fixa' : 'Nova Despesa Fixa'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Nome do Compromisso</Label>
                <Input 
                  value={form.label}
                  onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
                  placeholder="Ex: Renda da Casa"
                  className="bg-background h-12 rounded-xl border-muted"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Valor (Kz)</Label>
                <Input 
                  type="number"
                  value={form.amount || ""}
                  onChange={(e) => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                  placeholder="0"
                  className="bg-background h-12 rounded-xl border-muted font-code text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Recorrência</Label>
                  <Select 
                    value={form.recurrence} 
                    onValueChange={(val: RecurrenceType) => setForm(f => ({ ...f, recurrence: val }))}
                  >
                    <SelectTrigger className="h-12 bg-background rounded-xl border-muted">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-muted">
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="quarterly">Trimestral</SelectItem>
                      <SelectItem value="semiannual">Semestral</SelectItem>
                      <SelectItem value="annual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Dia do Vencimento</Label>
                  <Select 
                    value={form.dueDay.toString()} 
                    onValueChange={(val) => setForm(f => ({ ...f, dueDay: Number(val) }))}
                  >
                    <SelectTrigger className="h-12 bg-background rounded-xl border-muted">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-muted h-48">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <SelectItem key={d} value={d.toString()}>Dia {d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                  <Bell className="h-3 w-3 text-primary" />
                  Lembrete de Pagamento
                </Label>
                <Select 
                  value={form.reminderDaysBefore.toString()} 
                  onValueChange={(val) => setForm(f => ({ ...f, reminderDaysBefore: Number(val) }))}
                >
                  <SelectTrigger className="h-12 bg-background rounded-xl border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-muted">
                    <SelectItem value="1">1 dia antes</SelectItem>
                    <SelectItem value="2">2 dias antes</SelectItem>
                    <SelectItem value="3">3 dias antes</SelectItem>
                    <SelectItem value="0">No dia do vencimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Categoria</Label>
                <Select value={form.category} onValueChange={(val) => setForm(f => ({ ...f, category: val }))}>
                  <SelectTrigger className="h-12 bg-background rounded-xl border-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-muted">
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.emoji} {c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full h-14 rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                {editingId ? 'Atualizar Compromisso' : 'Guardar Despesa Fixa'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {fixedExpenses.length === 0 && (
          <Card className="p-8 border-dashed border-muted bg-card/20 text-center space-y-3 rounded-2xl">
            <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto" />
            <p className="text-[11px] text-muted-foreground font-medium">Nenhuma despesa fixa registada. Ideal para rendas, propinas e assinaturas.</p>
          </Card>
        )}

        {fixedExpenses.map((fixed) => {
          const isPaid = getPaidStatus(fixed);
          const Icon = getCategoryIcon(fixed.category);
          const cat = CATEGORIES.find(c => c.id === fixed.category)!;

          return (
            <Card key={fixed.id} className="p-4 bg-card/40 border-muted group overflow-hidden relative rounded-2xl shadow-sm">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-muted/30" style={{ color: cat.color }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-tight flex items-center gap-2">
                      {fixed.label}
                      <Badge variant="outline" className="text-[7px] h-3.5 px-1 font-black uppercase tracking-tighter opacity-60">
                        {fixed.recurrence === 'monthly' ? 'Mês' : fixed.recurrence === 'annual' ? 'Ano' : 'Ciclo'}
                      </Badge>
                    </h4>
                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Vence Dia {fixed.dueDay}</p>
                  </div>
                </div>

                <div className="text-right flex items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-black font-code">{formatKwanza(fixed.amount).split(' ')[0]} <span className="text-[9px]">Kz</span></p>
                    <div className="flex justify-end">
                       {isPaid ? (
                        <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Pago
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full">
                          <AlertCircle className="h-2.5 w-2.5" /> Pendente
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() => handleEdit(fixed)}
                    >
                      <Settings2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => removeFixedExpense(fixed.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-muted/50 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-[9px] text-muted-foreground italic leading-tight max-w-[180px]">
                    {isPaid ? "Compromisso cumprido este mês." : "Marca como pago para adicionar ao histórico mensal."}
                  </p>
                  {fixed.reminderDaysBefore > 0 && (
                    <span className="text-[8px] font-black text-primary uppercase flex items-center gap-1">
                      <Bell className="h-2 w-2" /> Aviso {fixed.reminderDaysBefore}d antes
                    </span>
                  )}
                </div>
                <Button 
                  size="sm" 
                  disabled={isPaid}
                  onClick={() => handleMarkAsPaid(fixed)}
                  className={cn(
                    "h-8 rounded-lg text-[9px] font-black uppercase tracking-widest gap-2 transition-all",
                    isPaid ? "bg-emerald-500/10 text-emerald-500 border-none" : "shadow-md"
                  )}
                >
                  {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <Wallet className="h-3 w-3" />}
                  {isPaid ? "Pago" : "Pagar Agora"}
                </Button>
              </div>

              <Calendar className="absolute -right-4 -bottom-4 h-16 w-16 text-muted/5 -rotate-12 pointer-events-none" />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
