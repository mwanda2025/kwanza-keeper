
"use client";

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/firebase';
import { 
  Wallet, 
  Trash2, 
  CalendarDays,
  Zap,
  Plus,
  X,
  Globe,
  Coins,
  LogOut,
  ShieldCheck,
  UserCheck,
  Lock,
  Edit2,
  Check,
  AlertCircle
} from 'lucide-react';
import { useExpenses } from '@/hooks/useExpenses';
import { useQuickShortcuts } from '@/hooks/useQuickShortcuts';
import { CATEGORIES, type QuickAdd } from '@/lib/types';
import { FixedExpensesManager } from './FixedExpensesManager';
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUserSettings } from '@/hooks/useUserSettings';
import { formatKwanza } from '@/lib/formatters';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * SettingsView fully integrated with centralized Auth (Email/Password).
 * Includes protected Critical Zone and Secure Budget Editing.
 */
export function SettingsView() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { clearAllData, expenses } = useExpenses();
  const { settings, updateSettings } = useUserSettings();
  const { manualShortcuts, updateManualShortcuts } = useQuickShortcuts(expenses);

  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [tempBudget, setTempBudget] = useState(150000);
  const [tempReportDay, setTempReportDay] = useState(1);
  const [isBudgetFocused, setIsBudgetFocused] = useState(false);
  
  const [editingShortcuts, setEditingShortcuts] = useState<QuickAdd[]>([]);
  const [isCriticalZoneUnlocked, setIsCriticalZoneUnlocked] = useState(false);

  useEffect(() => {
    if (settings) {
      setTempBudget(settings.budget);
      setTempReportDay(settings.reportDay);
    }
  }, [settings]);

  useEffect(() => {
    setEditingShortcuts(manualShortcuts);
  }, [manualShortcuts]);

  const handleEnterEditMode = () => {
    setTempBudget(settings.budget);
    setTempReportDay(settings.reportDay);
    setIsEditingSettings(true);
  };

  const handleCancelSettings = () => {
    setTempBudget(settings.budget);
    setTempReportDay(settings.reportDay);
    setIsEditingSettings(false);
  };

  const handleSaveAllSettings = async () => {
    await updateSettings({ 
      budget: tempBudget || 0,
      reportDay: tempReportDay
    });
    setIsEditingSettings(false);
    toast({ title: "Definições Atualizadas", description: "O teu orçamento e ciclo foram guardados com sucesso." });
  };

  const handleToggleMultiCurrency = async (val: boolean) => {
    await updateSettings({ multiCurrency: val });
    toast({ title: val ? "Multi-moeda Activado" : "Multi-moeda Desactivado" });
  };

  const handleAddManualShortcut = () => {
    if (editingShortcuts.length >= 3) return;
    setEditingShortcuts([...editingShortcuts, { label: "Novo Atalho", amount: 0, category: "other", emoji: "📦" }]);
  };

  const handleUpdateShortcut = (index: number, updates: Partial<QuickAdd>) => {
    const updated = editingShortcuts.map((s, i) => {
      if (i === index) {
        if (updates.category) {
          const cat = CATEGORIES.find(c => c.id === updates.category);
          return { ...s, ...updates, emoji: cat?.emoji || "📦" };
        }
        return { ...s, ...updates };
      }
      return s;
    });
    setEditingShortcuts(updated);
  };

  const handleSaveShortcuts = async () => {
    await updateManualShortcuts(editingShortcuts);
    toast({ title: "Atalhos Guardados" });
  };

  if (!user) {
    return (
      <div className="py-24 text-center space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="w-full max-w-[280px] mx-auto space-y-6">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto border-2 border-primary/10">
            <ShieldCheck className="h-10 w-10 text-primary/40" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black uppercase tracking-tight">Definições Bloqueadas</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest px-4">Inicia sessão para personalizares o teu orçamento e atalhos.</p>
          </div>
          <div className="flex items-center justify-center gap-2 opacity-50">
            <ShieldCheck className="h-3 w-3 text-primary" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Acesso Seguro Necessário</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary px-1 flex items-center gap-2">A tua conta</h3>
        <Card className="p-6 bg-card/40 border-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[10px] font-black uppercase tracking-tight truncate max-w-[180px]">{user.displayName || user.email}</h4>
                <div className="flex items-center gap-1 opacity-60">
                  <ShieldCheck className="h-2.5 w-2.5 text-emerald-500" />
                  <span className="text-[7px] font-black uppercase tracking-widest">Acesso Seguro</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </Card>
      </section>

      <div className="space-y-8">
        <div className="px-1 space-y-1">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Wallet className="h-3 w-3" /> Gestão Financeira
          </h3>
          <Separator className="bg-muted/30" />
        </div>
        
        <FixedExpensesManager expenses={expenses} />

        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
            <Zap className="h-3 w-3" /> Atalhos Manuais
          </h3>
          <Card className="p-6 bg-card/40 border-muted space-y-4">
            <div className="space-y-3">
              {editingShortcuts.map((s, i) => (
                <div key={i} className="bg-muted/20 p-3 rounded-xl border border-muted/50 relative space-y-3">
                  <button onClick={() => setEditingShortcuts(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center shadow-lg"><X className="h-3.5 w-3.5" /></button>
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={s.label} onChange={(e) => handleUpdateShortcut(i, { label: e.target.value })} className="h-8 bg-background text-[11px]" />
                    <Input type="number" value={s.amount || ""} onChange={(e) => handleUpdateShortcut(i, { amount: Number(e.target.value) })} className="h-8 bg-background text-[11px] font-code" />
                  </div>
                  <Select value={s.category} onValueChange={(val) => handleUpdateShortcut(i, { category: val })}>
                    <SelectTrigger className="h-8 bg-background rounded-lg text-[11px]"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-muted">
                      {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id} className="text-[11px] font-bold">{c.emoji} {c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {editingShortcuts.length < 3 && (
                <Button variant="outline" onClick={handleAddManualShortcut} className="w-full h-10 border-dashed border-muted rounded-xl gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Atalho</span>
                </Button>
              )}
              {editingShortcuts.length > 0 && (
                <Button onClick={handleSaveShortcuts} className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-[10px] mt-2 shadow-lg">
                  Guardar Atalhos
                </Button>
              )}
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
              <CalendarDays className="h-3 w-3" /> Orçamento e Ciclo
            </h3>
            {!isEditingSettings && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleEnterEditMode}
                className="h-7 gap-2 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
              >
                <Edit2 className="h-3 w-3" /> Editar Definições
              </Button>
            )}
          </div>

          <Card className="p-6 bg-card/40 border-muted relative overflow-hidden">
            {!isEditingSettings ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Orçamento Mensal</p>
                    <p className="text-2xl font-black font-code text-primary">{formatKwanza(settings.budget)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Fecho do Relatório</p>
                    <p className="text-sm font-bold uppercase tracking-tight">Todo Dia {settings.reportDay}</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/50" />
                  <p className="text-[9px] text-muted-foreground italic">Dados protegidos contra alterações acidentais. Clica em editar para ajustar.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Novo Orçamento (Kz)</Label>
                    <Input 
                      type="text" 
                      value={isBudgetFocused ? (tempBudget === 0 ? "" : tempBudget.toString()) : (tempBudget === 0 ? "" : tempBudget.toLocaleString('de-DE'))}
                      onFocus={() => setIsBudgetFocused(true)}
                      onBlur={() => setIsBudgetFocused(false)}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setTempBudget(val === "" ? 0 : parseInt(val, 10));
                      }}
                      className="bg-background font-code text-lg h-12 rounded-xl border-primary/20 focus:border-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dia de Fecho do Relatório</Label>
                    <Select value={tempReportDay.toString()} onValueChange={(v) => setTempReportDay(parseInt(v))}>
                      <SelectTrigger className="h-12 bg-background rounded-xl border-white/10"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-muted">
                        {[1, 5, 8, 10, 20, 25, 28].map(d => <SelectItem key={d} value={d.toString()} className="text-sm font-medium">Dia {d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button variant="ghost" onClick={handleCancelSettings} className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border border-white/5">
                    Cancelar
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20">
                        <Check className="h-4 w-4" /> Guardar Alterações
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-muted rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground font-black uppercase flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-primary" /> Confirmar Alterações?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          Estás prestes a alterar o teu orçamento mensal para <strong>{formatKwanza(tempBudget)}</strong> e o ciclo para o <strong>Dia {tempReportDay}</strong>. Desejas aplicar estas mudanças?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                        <AlertDialogCancel className="rounded-xl font-bold uppercase text-[10px]">Não, Voltar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSaveAllSettings} className="rounded-xl font-black uppercase text-[10px] bg-primary">Sim, Confirmar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
            <CalendarDays className="absolute -right-6 -bottom-6 h-24 w-24 text-primary/5 -rotate-12 pointer-events-none" />
          </Card>
        </section>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
          <Globe className="h-3 w-3" /> Preferências
        </h3>
        <Card className="p-6 bg-card/40 border-muted flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
              <Coins className="h-4 w-4 text-primary" /> Activar Multi-moeda
            </Label>
            <p className="text-[10px] text-muted-foreground">Regista gastos em USD e EUR com conversão.</p>
          </div>
          <Switch checked={settings.multiCurrency} onCheckedChange={handleToggleMultiCurrency} />
        </Card>
      </section>

      <section className="space-y-4 pt-6">
        <div className="px-1 flex items-center gap-2 text-destructive">
          <Trash2 className="h-3 w-3" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Zona Crítica</h3>
        </div>
        <Card className="p-6 bg-destructive/5 border-destructive/20 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-destructive/80">
                <Lock className="h-4 w-4" /> Desbloquear Proteção
              </Label>
              <p className="text-[10px] text-muted-foreground">Permitir acções de eliminação de dados.</p>
            </div>
            <Switch 
              checked={isCriticalZoneUnlocked} 
              onCheckedChange={setIsCriticalZoneUnlocked}
              className="data-[state=checked]:bg-destructive" 
            />
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={!isCriticalZoneUnlocked}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-destructive/10 disabled:opacity-30 transition-all"
              >
                Apagar Todos os Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-muted rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground font-black uppercase">Eliminar histórico permanentemente?</AlertDialogTitle>
                <AlertDialogDescription>Esta ação removerá todos os gastos da tua conta de forma permanente. Não pode ser desfeita.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2">
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={clearAllData} className="bg-destructive">Sim, Apagar Tudo</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Card>
      </section>

      <div className="text-center opacity-30 py-4">
        <p className="text-[9px] font-black uppercase tracking-[0.4em]">KwanzaKeeper © 2026</p>
      </div>
    </div>
  );
}
