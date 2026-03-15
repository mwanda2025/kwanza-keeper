
"use client";

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { 
  getBudget, 
  setBudget as saveBudget, 
  getReportDay, 
  setReportDay as saveReportDay,
  isMultiCurrencyEnabled,
  setMultiCurrencyEnabled
} from '@/lib/budget';
import { useToast } from '@/hooks/use-toast';
import { useUser, useAuth, initiateAnonymousSignIn, initiateGoogleSignIn } from '@/firebase';
import { 
  Wallet, 
  Settings as SettingsIcon, 
  FileText, 
  Trash2, 
  ShieldCheck, 
  Info,
  ChevronRight,
  Database,
  User as UserIcon,
  Sparkles,
  RefreshCw,
  CalendarDays,
  Mail,
  Lock,
  Cloud,
  CloudOff,
  AlertTriangle,
  Zap,
  Plus,
  X,
  Globe,
  Coins,
  ShieldAlert
} from 'lucide-react';
import { formatKwanza } from '@/lib/formatters';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useExpenses } from '@/hooks/useExpenses';
import { useQuickShortcuts } from '@/hooks/useQuickShortcuts';
import { CATEGORIES, type QuickAdd } from '@/lib/types';
import { FixedExpensesManager } from './FixedExpensesManager';
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function SettingsView() {
  const [currentBudget, setCurrentBudget] = useState(150000);
  const [tempBudget, setTempBudget] = useState(150000);
  const [currentReportDay, setCurrentReportDay] = useState(1);
  const [tempReportDay, setTempReportDay] = useState(1);
  const [multiCurrency, setMultiCurrency] = useState(false);
  
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [reportDayDialogOpen, setReportDayDialogOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginView, setIsLoginView] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const { clearAllData, seedDemoData, expenses, isOnline } = useExpenses();
  const { manualShortcuts, updateManualShortcuts } = useQuickShortcuts(expenses);
  const auth = useAuth();

  const [editingShortcuts, setEditingShortcuts] = useState<QuickAdd[]>([]);

  useEffect(() => {
    setCurrentBudget(getBudget());
    setTempBudget(getBudget());
    setCurrentReportDay(getReportDay());
    setTempReportDay(getReportDay());
    setMultiCurrency(isMultiCurrencyEnabled());
  }, []);

  useEffect(() => {
    setEditingShortcuts(manualShortcuts);
  }, [manualShortcuts]);

  const handleConfirmBudget = () => {
    saveBudget(tempBudget);
    setCurrentBudget(tempBudget);
    setBudgetDialogOpen(false);
    toast({
      title: "Orçamento Atualizado",
      description: `O seu limite mensal é agora de ${formatKwanza(tempBudget)}.`
    });
  };

  const handleConfirmReportDay = () => {
    saveReportDay(tempReportDay);
    setCurrentReportDay(tempReportDay);
    setReportDayDialogOpen(false);
    toast({
      title: "Ciclo de Relatórios",
      description: `Os relatórios mensais serão gerados no dia ${tempReportDay} de cada mês.`
    });
  };

  const handleToggleMultiCurrency = (val: boolean) => {
    setMultiCurrency(val);
    setMultiCurrencyEnabled(val);
    toast({
      title: val ? "Multi-moeda Activado" : "Multi-moeda Desactivado",
      description: val ? "Poderás agora registar gastos em USD e EUR." : "A app voltará a usar apenas Kwanza (AOA)."
    });
  };

  const handleAddManualShortcut = () => {
    if (editingShortcuts.length >= 3) {
      toast({ variant: "destructive", title: "Limite Atingido", description: "Podes ter no máximo 3 atalhos manuais." });
      return;
    }
    setEditingShortcuts([...editingShortcuts, { label: "Novo Atalho", amount: 0, category: "other", emoji: "📦" }]);
  };

  const handleRemoveManualShortcut = (index: number) => {
    setEditingShortcuts(editingShortcuts.filter((_, i) => i !== index));
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
    toast({ title: "Atalhos Guardados", description: "As tuas preferências manuais foram atualizadas." });
  };

  const handleAuthAction = async () => {
    if (!email || !password) {
      toast({ variant: "destructive", title: "Campos em falta", description: "Por favor, preenche o email e a palavra-passe." });
      return;
    }
    setAuthLoading(true);
    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: "Bem-vindo de volta!", description: "Sessão iniciada com sucesso." });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: "Conta Criada!", description: "Bem-vindo ao KwanzaKeeper Cloud. Os teus dados locais estão a ser sincronizados." });
      }
      setAuthDialogOpen(false);
    } catch (e: any) {
      let msg = "Ocorreu um erro inesperado.";
      if (e.code === 'auth/email-already-in-use') msg = "Este e-mail já está em uso.";
      if (e.code === 'auth/invalid-email') msg = "E-mail inválido.";
      if (e.code === 'auth/weak-password') msg = "A palavra-passe deve ter pelo menos 6 caracteres.";
      if (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found') msg = "E-mail ou palavra-passe incorretos.";
      
      toast({ variant: "destructive", title: "Erro na Autenticação", description: msg });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    initiateGoogleSignIn(auth);
    setAuthDialogOpen(false);
  };

  const handleAnonymousSignIn = () => {
    initiateAnonymousSignIn(auth);
    toast({
      title: "Modo Guest Ativo",
      description: "Podes usar a app sem conta, mas os dados ficam apenas neste dispositivo."
    });
  };

  const handleClearAll = async () => {
    await clearAllData();
    toast({
      variant: "destructive",
      title: "Dados Apagados",
      description: "Todo o teu histórico foi removido com sucesso."
    });
  };

  const handleSeedData = async () => {
    await seedDemoData();
    toast({
      title: "Demonstração Ativada",
      description: "Dados de exemplo carregados para exploração."
    });
  };

  const isRealUser = user && !user.isAnonymous;
  const hasRealData = expenses.some(e => !e.isDemo);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* SEÇÃO 1: NUVEM E SINCRONIZAÇÃO */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary px-1 flex items-center gap-2">
          <Database className="h-3 w-3" />
          Nuvem e Sincronização
        </h3>
        <Card className="p-6 bg-card/40 border-muted">
          {isRealUser ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/30">
                <UserIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-black uppercase tracking-tight truncate max-w-[220px]">{user.email || user.displayName || 'Utilizador Cloud'}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isOnline ? (
                    <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-black uppercase tracking-widest">
                      <Cloud className="h-2.5 w-2.5" /> Sincronizado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] text-amber-500 font-black uppercase tracking-widest">
                      <CloudOff className="h-2.5 w-2.5" /> Modo Offline
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase tracking-tight">Modo Offline / Visitante</h4>
                  <p className="text-[10px] text-muted-foreground leading-tight">Cria uma conta para salvar os teus dados na nuvem com segurança.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20">
                      Entrar / Criar Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-muted rounded-2xl max-w-[90vw] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground">
                        {isLoginView ? 'Aceder ao KwanzaKeeper' : 'Criar Conta Grátis'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={handleGoogleSignIn}
                        className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-muted bg-background hover:bg-muted/10 gap-3"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Continuar com Google
                      </Button>

                      <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black">
                          <span className="bg-card px-2 text-muted-foreground tracking-widest">ou e-mail</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="email" 
                            placeholder="teu@email.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-background pl-10 h-12 rounded-xl border-muted focus:ring-1 focus:ring-primary/50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Palavra-passe</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-background pl-10 h-12 rounded-xl border-muted focus:ring-1 focus:ring-primary/50"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleAuthAction} 
                        disabled={authLoading} 
                        className="w-full h-14 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95"
                      >
                        {authLoading ? (
                          <RefreshCw className="h-5 w-5 animate-spin" />
                        ) : isLoginView ? (
                          'Entrar com E-mail'
                        ) : (
                          'Criar Conta'
                        )}
                      </Button>
                      <button 
                        onClick={() => setIsLoginView(!isLoginView)}
                        className="w-full text-[10px] font-black uppercase tracking-widest text-primary/80 py-2 hover:text-primary transition-colors"
                      >
                        {isLoginView ? 'Não tens conta? Regista-te agora' : 'Já tens conta? Faz login'}
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" onClick={handleAnonymousSignIn} disabled={isUserLoading} className="h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-muted bg-muted/10 hover:bg-muted/30">
                  Continuar Guest
                </Button>
              </div>
            </div>
          )}
        </Card>
      </section>

      {/* SEÇÃO 2: GESTÃO FINANCEIRA */}
      <div className="space-y-8">
        <div className="px-1 space-y-1">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <Wallet className="h-3 w-3" />
            Gestão Financeira Central
          </h3>
          <Separator className="bg-muted/30" />
        </div>

        {/* Despesas Fixas */}
        <FixedExpensesManager expenses={expenses} />

        {/* Atalhos Rápidos */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Atalhos Manuais (Prioritários)
          </h3>
          <Card className="p-6 bg-card/40 border-muted space-y-4">
            <p className="text-[10px] text-muted-foreground italic leading-tight">Define até 3 despesas recorrentes que aparecerão sempre no topo do teu Acesso Rápido.</p>
            
            <div className="space-y-3">
              {editingShortcuts.map((s, i) => (
                <div key={i} className="bg-muted/20 p-3 rounded-xl border border-muted/50 relative space-y-3">
                  <button 
                    onClick={() => handleRemoveManualShortcut(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-white rounded-full flex items-center justify-center shadow-lg active:scale-75 transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground">Nome</Label>
                      <Input 
                        value={s.label}
                        onChange={(e) => handleUpdateShortcut(i, { label: e.target.value })}
                        className="h-8 bg-background text-[11px] rounded-lg"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[9px] uppercase font-black text-muted-foreground">Valor (Kz)</Label>
                      <Input 
                        type="number"
                        value={s.amount}
                        onChange={(e) => handleUpdateShortcut(i, { amount: Number(e.target.value) })}
                        className="h-8 bg-background text-[11px] font-code rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-black text-muted-foreground">Categoria</Label>
                    <Select value={s.category} onValueChange={(val) => handleUpdateShortcut(i, { category: val })}>
                      <SelectTrigger className="h-8 bg-background rounded-lg text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-muted">
                        {CATEGORIES.map(c => (
                          <SelectItem key={c.id} value={c.id} className="text-[11px] font-bold">
                            {c.emoji} {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}

              {editingShortcuts.length < 3 && (
                <Button 
                  variant="outline" 
                  onClick={handleAddManualShortcut}
                  className="w-full h-10 border-dashed border-muted hover:border-primary/50 text-muted-foreground hover:text-primary transition-all rounded-xl gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Adicionar Atalho</span>
                </Button>
              )}

              {editingShortcuts.length > 0 && (
                <Button 
                  onClick={handleSaveShortcuts}
                  className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-[10px] mt-2 shadow-lg shadow-primary/10"
                >
                  Guardar Atalhos
                </Button>
              )}
            </div>
          </Card>
        </section>

        {/* Orçamento e Ciclo */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
            <CalendarDays className="h-3 w-3" />
            Orçamento e Ciclo Mensal
          </h3>
          <Card className="p-6 bg-card/40 border-muted space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Orçamento Mensal (Kz)</Label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={tempBudget} 
                  onChange={(e) => setTempBudget(Number(e.target.value))}
                  className="bg-background font-code text-lg h-12 rounded-xl border-muted focus:ring-1 focus:ring-primary/50"
                />
                <AlertDialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button 
                      disabled={tempBudget === currentBudget || tempBudget <= 0}
                      className="h-12 rounded-xl px-6 font-black uppercase tracking-widest text-[10px]"
                    >
                      Guardar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-muted max-w-[90vw] rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground font-black uppercase tracking-tight flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-500" />
                        Confirmar Novo Orçamento
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground text-sm space-y-4">
                        <p>Tens a certeza que queres atualizar o teu orçamento mensal?</p>
                        <div className="bg-muted/30 p-4 rounded-xl space-y-2 border border-muted">
                          <div className="flex justify-between text-[10px] uppercase font-black">
                            <span>Atual:</span>
                            <span className="text-muted-foreground">{formatKwanza(currentBudget)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-black text-primary">
                            <span>Novo:</span>
                            <span>{formatKwanza(tempBudget)}</span>
                          </div>
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2">
                      <AlertDialogCancel className="rounded-xl bg-muted/50 border-none font-black uppercase text-[10px] tracking-widest">Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleConfirmBudget} className="rounded-xl bg-primary text-white font-black uppercase text-[10px] tracking-widest">Confirmar</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-muted/50">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dia de Fecho do Relatório</Label>
              <Select 
                value={tempReportDay.toString()} 
                onValueChange={(val) => {
                  setTempReportDay(parseInt(val));
                  setReportDayDialogOpen(true);
                }}
              >
                <SelectTrigger className="h-12 bg-background rounded-xl border-muted">
                  <SelectValue placeholder="Escolhe o dia" />
                </SelectTrigger>
                <SelectContent className="bg-card border-muted">
                  {[1, 5, 8, 10, 20, 25, 28].map(d => (
                    <SelectItem key={d} value={d.toString()} className="text-sm font-medium">Dia {d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <AlertDialog open={reportDayDialogOpen} onOpenChange={setReportDayDialogOpen}>
                <AlertDialogContent className="bg-card border-muted max-w-[90vw] rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground font-black uppercase tracking-tight">Alterar Ciclo</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground text-sm">
                      Isto mudará o período de análise da IA e a data em que os teus dossiers são gerados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col gap-2">
                    <AlertDialogCancel onClick={() => setTempReportDay(currentReportDay)} className="rounded-xl font-black uppercase text-[10px]">Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmReportDay} className="rounded-xl font-black uppercase text-[10px]">Confirmar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </section>
      </div>

      {/* SEÇÃO 3: PREFERÊNCIAS GLOBAIS */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
          <Globe className="h-3 w-3" />
          Preferências da App
        </h3>
        <Card className="p-6 bg-card/40 border-muted space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                Activar Multi-moeda
              </Label>
              <p className="text-[10px] text-muted-foreground">Permite registar gastos em USD e EUR com conversão para Kz.</p>
            </div>
            <Switch 
              checked={multiCurrency}
              onCheckedChange={handleToggleMultiCurrency}
            />
          </div>
        </Card>
      </section>

      {/* SEÇÃO 4: SISTEMA E SEGURANÇA */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
          <SettingsIcon className="h-3 w-3" />
          Sistema e Segurança
        </h3>
        <Card className="bg-card/40 border-muted divide-y divide-muted/50 overflow-hidden rounded-2xl">
          <SettingsItem icon={Lock} title="Bloqueio PIN" description="Segurança de acesso" status="Breve" />
          <SettingsItem icon={ShieldCheck} title="Segurança Cloud" description="Encriptação de dados" status="Activo" />
        </Card>
      </section>

      {/* SEÇÃO 5: INFORMAÇÃO E LEGAL */}
      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
          <Info className="h-3 w-3" />
          Informação e Legal
        </h3>
        <Card className="bg-card/40 border-muted divide-y divide-muted/50 overflow-hidden rounded-2xl">
          <SettingsItem icon={FileText} title="Termos de Uso" description="Privacidade e Dados" />
          <SettingsItem icon={ShieldAlert} title="Política de IA" description="Uso ético do Gemini" />
          <SettingsItem icon={Info} title="Sobre o KwanzaKeeper" description="Versão 1.5.0 Gold — Hybrid Cloud" />
        </Card>
      </section>

      {/* DEMONSTRAÇÃO (APENAS SE NÃO HOUVER DADOS REAIS) */}
      {!hasRealData && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
            <RefreshCw className="h-3 w-3" />
            Explorar App
          </h3>
          <Card className="p-4 bg-primary/5 border-primary/10 rounded-2xl flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-xs font-black uppercase tracking-tight">Carregar Demonstração</h4>
              <p className="text-[9px] text-muted-foreground">Preenche a app com dados de exemplo para teste.</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSeedData} className="text-[10px] font-black uppercase h-8 px-4 border-primary/20 hover:bg-primary/10">Recarregar</Button>
          </Card>
        </section>
      )}

      {/* SEÇÃO 6: ZONA CRÍTICA */}
      <section className="space-y-4 pt-6">
        <div className="px-1 flex items-center gap-2 text-destructive">
          <Trash2 className="h-3 w-3" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em]">Zona Crítica</h3>
        </div>
        <Card className="p-4 bg-destructive/5 border-destructive/20 rounded-2xl">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-destructive/20 active:scale-95 transition-all">
                Apagar Todos os Dados
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-muted max-w-[90vw] rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground font-black uppercase tracking-tight">Eliminar histórico?</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-sm">
                  Esta ação removerá todos os gastos deste dispositivo e da tua conta cloud permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2">
                <AlertDialogCancel className="rounded-xl bg-muted/50 border-none font-black uppercase text-[10px] tracking-widest">Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll} className="rounded-xl bg-destructive text-white font-black uppercase text-[10px] tracking-widest">Sim, Apagar Tudo</AlertDialogAction>
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

function SettingsItem({ icon: Icon, title, description, status, onClick }: any) {
  return (
    <button onClick={onClick} className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-left group" disabled={!onClick}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors border border-transparent group-hover:border-primary/20">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h4 className="text-sm font-black tracking-tight uppercase">{title}</h4>
          <p className="text-[10px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status && <span className="text-[8px] font-black uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{status}</span>}
        {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground/40" />}
      </div>
    </button>
  );
}
