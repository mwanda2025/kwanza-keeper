
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { type Expense, CATEGORIES, QUICK_ADDS } from '@/lib/types';
import { dateLabel, formatKwanza } from '@/lib/formatters';
import { ExpenseItem } from '@/components/ExpenseItem';
import { ExpenseForm } from '@/components/ExpenseForm';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Search, PieChart, Plus, Settings, Loader2, Menu, Sparkles, User } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { useExpenses } from '@/hooks/useExpenses';
import { FloatingAmount } from '@/components/animations/FloatingAmount';
import { Badge } from '@/components/ui/badge';
import { SettingsView } from '@/components/SettingsView';
import { useAuth } from '@/firebase';
import { useQuickShortcuts } from '@/hooks/useQuickShortcuts';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { StaticInfoViews, type StaticViewType } from '@/components/StaticInfoViews';
import { AccountOnboardingPrompt } from '@/components/AccountOnboardingPrompt';
import { AuthForm } from '@/components/AuthForm';

type ViewType = 'home' | 'search' | 'summary' | 'add' | 'edit' | 'settings' | 'support' | 'about' | 'privacy' | 'faq' | 'auth';

export default function KwanzaKeeperApp() {
  const [view, setView] = useState<ViewType>('home');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [lastAddedAmount, setLastAddedAmount] = useState<number | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { toast } = useToast();
  const { expenses, isLoading, addExpense, removeExpense, editExpense } = useExpenses();
  const { user, loading: isAuthLoading } = useAuth();
  
  const { shortcuts: smartQuickAdds } = useQuickShortcuts(expenses);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user && view === 'auth') {
      setView('home');
    }
  }, [user, view]);

  const ensureAuth = () => {
    if (!user) {
      setView('auth');
      toast({ 
        title: "Identificação Necessária", 
        description: "Precisas de entrar na tua conta para gravar ou alterar dados." 
      });
      return false;
    }
    return true;
  };

  const handleAddExpense = async (newExp: Omit<Expense, 'id'>) => {
    if (!ensureAuth()) return;
    try {
      const expense = await addExpense(newExp);
      if (expense) {
        setLastAddedAmount(expense.baseAmount || expense.amount);
        setNewlyAddedId(expense.id);
        setView('home');
        toast({ title: "Gasto Registado", description: "Guardado na tua conta." });
        setTimeout(() => setNewlyAddedId(null), 3000);
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Erro ao Guardar", description: "Tenta novamente." });
    }
  };

  const handleUpdateExpense = async (updatedExp: Omit<Expense, 'id'>) => {
    if (!ensureAuth()) return;
    if (!editingExpense) return;
    await editExpense({ ...updatedExp, id: editingExpense.id });
    setEditingExpense(null);
    setView('home');
    toast({ title: "Actualizado", description: "Alterações guardadas." });
  };

  const handleRepeatExpense = useCallback(async (expense: Expense) => {
    if (!ensureAuth()) return;
    const newExpenseData: Omit<Expense, 'id'> = {
      date: new Date().toISOString().split("T")[0],
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency || "AOA",
      exchangeRate: expense.exchangeRate || 1,
      baseAmount: expense.baseAmount || expense.amount,
      payment: expense.payment,
      person: expense.person || "",
      notes: expense.notes || "",
    };
    
    const added = await addExpense(newExpenseData);
    if (added) {
      setLastAddedAmount(added.baseAmount || added.amount);
      setNewlyAddedId(added.id);
      toast({ title: "Repetido", description: "Registo adicionado ao dia de hoje." });
      setTimeout(() => setNewlyAddedId(null), 3000);
    }
  }, [addExpense, user, toast]);

  const handleDeleteExpense = (id: string) => {
    if (!ensureAuth()) return;
    removeExpense(id);
    toast({ variant: "destructive", title: "Eliminado", description: "Registo removido permanentemente." });
  };

  const startEditing = (expense: Expense) => {
    if (!ensureAuth()) return;
    setEditingExpense(expense);
    setView('edit');
  };

  const quickAdd = (q: typeof QUICK_ADDS[0]) => {
    if (!ensureAuth()) return;
    handleAddExpense({
      date: new Date().toISOString().split("T")[0],
      category: q.category,
      description: q.label,
      amount: q.amount,
      currency: "AOA",
      exchangeRate: 1,
      baseAmount: q.amount,
      payment: "Cash",
      person: "",
      notes: ""
    });
  };

  const filteredExpenses = useMemo(() => {
    const cleanSearch = searchFilter.toLowerCase().trim();
    if (!cleanSearch && !categoryFilter) return expenses;
    return expenses.filter(e => {
      const matchesCategory = categoryFilter ? e.category === categoryFilter : true;
      if (!matchesCategory) return false;
      const amountStr = (e.baseAmount || e.amount).toString();
      return e.description.toLowerCase().includes(cleanSearch) || amountStr.includes(cleanSearch);
    });
  }, [expenses, searchFilter, categoryFilter]);

  const groupedExpenses = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    filteredExpenses.forEach(e => {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredExpenses]);

  const monthTotal = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, e) => sum + (e.baseAmount || e.amount), 0);
  }, [expenses]);

  const handleNavigation = (newView: ViewType | null) => {
    if (newView) setView(newView);
    setIsSidebarOpen(false);
  };

  if (!isMounted || isLoading || isAuthLoading) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <Loader2 className="h-14 w-14 animate-spin text-primary mx-auto opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">KwanzaKeeper</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground opacity-50">A carregar os teus dados...</p>
          </div>
        </div>
      </div>
    );
  }

  const isStaticView = ['support', 'about', 'privacy', 'faq'].includes(view);

  return (
    <div className="mobile-container pb-28">
      <Toaster />
      
      {lastAddedAmount !== null && (
        <FloatingAmount amount={lastAddedAmount} onComplete={() => setLastAddedAmount(null)} />
      )}

      <header className="px-6 pt-12 pb-6 sticky top-0 bg-background/80 backdrop-blur-xl z-30 border-b border-white/[0.03]">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-4">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 -ml-2 rounded-2xl bg-white/[0.03] active:scale-90 transition-all">
                  <Menu className="h-5 w-5 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 bg-background border-r border-white/5">
                <NavigationSidebar currentView={view} onNavigate={handleNavigation as any} />
              </SheetContent>
            </Sheet>
            
            <div className="animate-in slide-in-from-left duration-500">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                  {view === 'home' ? 'Painel Principal' : view === 'settings' ? 'Configurações' : 'Gasto Activo'}
                </p>
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                {view === 'home' ? 'KwanzaKeeper' : view === 'settings' ? 'Ajustes' : isStaticView ? 'Info' : view.charAt(0).toUpperCase() + view.slice(1)}
              </h1>
            </div>
          </div>

          {!isStaticView && !['settings', 'add', 'edit', 'auth'].includes(view) && (
            <div className="text-right animate-in slide-in-from-right duration-500">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 opacity-60">Mensal</p>
              <p className="font-code text-xl font-black text-primary leading-none">
                {formatKwanza(monthTotal).split(' ')[0]}
                <span className="text-[10px] ml-1 opacity-60 uppercase">Kz</span>
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="px-6 py-6">
        {view === 'auth' && (
          <div className="py-10">
            <AuthForm onComplete={() => setView('home')} />
            <div className="mt-8 text-center">
              <Button 
                variant="ghost" 
                onClick={() => setView('home')} 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                Continuar a Explorar
              </Button>
            </div>
          </div>
        )}

        {view === 'home' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {!user && <AccountOnboardingPrompt />}

            <section>
              <div className="flex items-center gap-2 mb-5 px-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Acesso Rápido</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {smartQuickAdds.map((q, idx) => (
                  <button 
                    key={`${q.label}-${q.amount}-${idx}`}
                    onClick={() => quickAdd(q)}
                    className="flex flex-col items-center justify-center p-4 rounded-[1.5rem] bg-card/40 border border-white/5 hover:border-primary/40 transition-all active:scale-90 group shadow-lg"
                  >
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{q.emoji}</span>
                    <span className="text-[9px] font-black text-foreground truncate w-full text-center uppercase tracking-tight">{q.label}</span>
                    <span className="text-[10px] font-code font-black text-primary mt-1.5">{q.amount} <span className="text-[7px] opacity-60">Kz</span></span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Movimentos {user ? 'Recentes' : 'Exemplo'}</h3>
                <Button variant="ghost" size="sm" onClick={() => setView('search')} className="text-[9px] font-black uppercase tracking-[0.2em] text-primary h-8 px-3 rounded-xl bg-primary/5">Ver Tudo</Button>
              </div>
              
              {groupedExpenses.length === 0 ? (
                <div className="py-24 text-center space-y-5 opacity-40">
                  <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center mx-auto mb-2 border border-white/5">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sem movimentos este mês</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {groupedExpenses.slice(0, 3).map(([date, items]) => (
                    <div key={date} className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] bg-muted/30 px-2 py-1 rounded-md">{dateLabel(date)}</h4>
                        <span className="font-code text-[10px] text-muted-foreground font-black tracking-widest">
                          {formatKwanza(items.reduce((s, i) => s + (i.baseAmount || i.amount), 0))}
                        </span>
                      </div>
                      <div className="bg-card/40 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl backdrop-blur-sm">
                        {items.map(expense => (
                          <ExpenseItem key={expense.id} expense={expense} onDelete={handleDeleteExpense} onRepeat={handleRepeatExpense} onClick={() => startEditing(expense)} isNew={newlyAddedId === expense.id} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {view === 'search' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="sticky top-24 bg-background/95 backdrop-blur-xl py-4 z-20 space-y-5 border-b border-white/5 -mx-2 px-2">
              <Input placeholder="O que procuras?" value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} className="bg-card border-white/10 rounded-2xl h-14 text-sm font-bold shadow-inner" />
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth">
                <Badge variant={categoryFilter === null ? "default" : "outline"} className="cursor-pointer h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest shrink-0" onClick={() => setCategoryFilter(null)}>Todas</Badge>
                {CATEGORIES.map(cat => (
                  <Badge key={cat.id} variant={categoryFilter === cat.id ? "default" : "outline"} className="cursor-pointer h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest shrink-0 gap-2" onClick={() => setCategoryFilter(cat.id)}><span>{cat.emoji}</span> {cat.label}</Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-10">
              {groupedExpenses.map(([date, items]) => (
                <div key={date} className="space-y-4">
                  <h4 className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] border-l-2 border-primary pl-3 py-0.5">{dateLabel(date)}</h4>
                  <div className="bg-card/40 rounded-[2rem] overflow-hidden border border-white/5 shadow-xl">
                    {items.map(expense => (
                      <ExpenseItem key={expense.id} expense={expense} onDelete={handleDeleteExpense} onRepeat={handleRepeatExpense} onClick={() => startEditing(expense)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'summary' && <Dashboard expenses={expenses} />}
        {view === 'settings' && <SettingsView />}
        {isStaticView && <StaticInfoViews view={view as StaticViewType} onBack={() => setView('home')} />}
        {(view === 'add' || view === 'edit') && (
          <ExpenseForm 
            initialData={view === 'edit' ? editingExpense || undefined : undefined} 
            onSave={view === 'edit' ? handleUpdateExpense : handleAddExpense} 
            onCancel={() => setView('home')} 
          />
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] bg-[#1A1716]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-2 py-3 z-50 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <NavButton active={view === 'home'} icon={Home} label="Início" onClick={() => setView('home')} />
        <NavButton active={view === 'search'} icon={Search} label="Busca" onClick={() => setView('search')} />
        <div className="relative -top-10">
          <Button onClick={() => { setEditingExpense(null); setView('add'); }} className={`w-16 h-16 rounded-[2rem] shadow-2xl transition-all active:scale-90 border-[6px] border-background ${view === 'add' ? 'bg-secondary' : 'bg-primary'}`}>
            <Plus className="h-8 w-8 text-white stroke-[3px]" />
          </Button>
        </div>
        <NavButton active={view === 'summary'} icon={PieChart} label="Análise" onClick={() => setView('summary')} />
        <NavButton active={view === 'settings'} icon={Settings} label="Ajustes" onClick={() => setView('settings')} />
      </nav>
    </div>
  );
}

function NavButton({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all w-14 py-1 ${active ? 'text-primary' : 'text-muted-foreground/60 hover:text-foreground'}`}>
      <Icon className={`h-5 w-5 transition-all duration-300 ${active ? 'scale-110 stroke-[2.5px]' : 'stroke-[2px]'}`} />
      <span className="text-[8px] font-black uppercase tracking-[0.15em] leading-none text-center">{label}</span>
      {active && <div className="w-1 h-1 bg-primary rounded-full mt-0.5 animate-in zoom-in" />}
    </button>
  );
}
