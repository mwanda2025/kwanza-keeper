
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { type Expense, CATEGORIES, QUICK_ADDS } from '@/lib/types';
import { dateLabel, formatKwanza } from '@/lib/formatters';
import { ExpenseItem } from '@/components/ExpenseItem';
import { ExpenseForm } from '@/components/ExpenseForm';
import { Dashboard } from '@/components/Dashboard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, Search, PieChart, Plus, Settings, Wifi, WifiOff, Loader2, Menu, RefreshCw } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { useExpenses } from '@/hooks/useExpenses';
import { FloatingAmount } from '@/components/animations/FloatingAmount';
import { Badge } from '@/components/ui/badge';
import { SettingsView } from '@/components/SettingsView';
import { useUser } from '@/firebase';
import { useQuickShortcuts } from '@/hooks/useQuickShortcuts';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { StaticInfoViews, type StaticViewType } from '@/components/StaticInfoViews';
import { useSyncManager } from '@/hooks/useSyncManager';
import { AccountOnboardingPrompt } from '@/components/AccountOnboardingPrompt';
import { cn } from '@/lib/utils';

type ViewType = 'home' | 'search' | 'summary' | 'add' | 'edit' | 'settings' | 'support' | 'about' | 'privacy' | 'faq';

export default function KwanzaKeeperApp() {
  const [view, setView] = useState<ViewType>('home');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [lastAddedAmount, setLastAddedAmount] = useState<number | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { toast } = useToast();
  const { expenses, isLoading, addExpense, removeExpense, editExpense } = useExpenses();
  const { user } = useUser();
  const { status: syncStatus, isOnline, forceSync } = useSyncManager();
  
  const { shortcuts: smartQuickAdds } = useQuickShortcuts(expenses);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddExpense = async (newExp: Omit<Expense, 'id'>) => {
    const expense = await addExpense(newExp);
    setLastAddedAmount(expense.baseAmount || expense.amount);
    setNewlyAddedId(expense.id);
    setView('home');
    
    toast({ 
      title: isOnline ? "Despesa Adicionada" : "Guardado Localmente", 
      description: `${expense.description} de ${formatKwanza(expense.baseAmount || expense.amount)} foi registado.` 
    });

    setTimeout(() => setNewlyAddedId(null), 3000);
  };

  const handleUpdateExpense = async (updatedExp: Omit<Expense, 'id'>) => {
    if (!editingExpense) return;
    await editExpense({ ...updatedExp, id: editingExpense.id });
    setEditingExpense(null);
    setView('home');
    toast({ 
      title: "Despesa Atualizada", 
      description: "As alterações foram salvas com sucesso." 
    });
  };

  const handleRepeatExpense = useCallback(async (expense: Expense) => {
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
    setLastAddedAmount(added.baseAmount || added.amount);
    setNewlyAddedId(added.id);
    
    toast({ 
      title: "Despesa Repetida", 
      description: `${expense.description} de ${formatKwanza(added.baseAmount || added.amount)} foi adicionado hoje.` 
    });

    setTimeout(() => setNewlyAddedId(null), 3000);
  }, [addExpense, toast]);

  const handleDeleteExpense = (id: number) => {
    const expenseToDelete = expenses.find(e => e.id === id);
    removeExpense(id);
    toast({ 
      variant: "destructive",
      title: "Despesa Eliminada", 
      description: `${expenseToDelete?.description} foi removido do histórico.` 
    });
  };

  const startEditing = (expense: Expense) => {
    setEditingExpense(expense);
    setView('edit');
  };

  const quickAdd = (q: typeof QUICK_ADDS[0]) => {
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
    const tokens = cleanSearch.split(/\s+/);
    return expenses.filter(e => {
      const matchesCategory = categoryFilter ? e.category === categoryFilter : true;
      if (!matchesCategory) return false;
      if (tokens.length === 0 || tokens[0] === "") return true;
      return tokens.every(token => {
        const numericToken = token.replace(/kz$/i, "");
        const amountStr = (e.baseAmount || e.amount).toString();
        return e.description.toLowerCase().includes(token) || 
               e.person.toLowerCase().includes(token) || 
               e.notes.toLowerCase().includes(token) || 
               amountStr.includes(token) || 
               (numericToken !== token && amountStr.includes(numericToken));
      });
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

  const handleManualSync = () => {
    if (isOnline) {
      forceSync();
      toast({ title: "Sincronização Iniciada", description: "A verificar dados pendentes com a Cloud..." });
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-primary">K</span>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Sincronizando KwanzaKeeper...</p>
        </div>
      </div>
    );
  }

  const isStaticView = ['support', 'about', 'privacy', 'faq'].includes(view);

  return (
    <div className="mobile-container pb-24">
      <Toaster />
      
      {lastAddedAmount !== null && (
        <FloatingAmount 
          amount={lastAddedAmount} 
          onComplete={() => setLastAddedAmount(null)} 
        />
      )}

      <header className="px-6 pt-10 pb-4 sticky top-0 bg-background/80 backdrop-blur-lg z-30 transition-all duration-300 border-b border-muted/10">
        <div className="flex justify-between items-end">
          <div className="flex items-start gap-3">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 -ml-2 rounded-full hover:bg-muted/50 transition-all active:scale-90"
                >
                  <Menu className="h-6 w-6 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 bg-background border-r border-muted/30">
                <SheetHeader className="sr-only">
                  <SheetTitle>Menu de Navegação</SheetTitle>
                  <SheetDescription>Acesso rápido às funcionalidades e configurações do KwanzaKeeper.</SheetDescription>
                </SheetHeader>
                <NavigationSidebar 
                  currentView={view} 
                  onNavigate={handleNavigation as any} 
                />
              </SheetContent>
            </Sheet>
            
            <div className="animate-in slide-in-from-left duration-500">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {view === 'home' ? 'Início' : view === 'search' ? 'Histórico' : view === 'summary' ? 'Análise' : view === 'settings' ? 'App' : 'Gasto'}
                </p>
                {isOnline ? (
                  <button onClick={handleManualSync} className="focus:outline-none hover:scale-110 transition-transform">
                    <Wifi className={cn("h-3 w-3 transition-colors", syncStatus === 'syncing' ? 'text-primary animate-pulse' : 'text-emerald-500')} />
                  </button>
                ) : (
                  <WifiOff className="h-3 w-3 text-amber-500 transition-colors" />
                )}
                {syncStatus === 'syncing' && (
                  <RefreshCw className="h-2.5 w-2.5 animate-spin text-primary" />
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-foreground">
                {view === 'home' ? 'KwanzaKeeper' : view === 'settings' ? 'Definições' : isStaticView ? 'Info' : view.charAt(0).toUpperCase() + view.slice(1)}
              </h1>
            </div>
          </div>

          {!isStaticView && view !== 'settings' && view !== 'add' && view !== 'edit' && (
            <div className="text-right animate-in slide-in-from-right duration-500">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Mês Atual</p>
              <p className="font-code text-xl sm:text-2xl font-black text-primary transition-all">
                {formatKwanza(monthTotal).split(' ')[0]}
                <span className="text-xs ml-1 uppercase">Kz</span>
              </p>
            </div>
          )}
        </div>
      </header>

      <main className="px-6 py-4">
        {view === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Account Onboarding Prompt */}
            <AccountOnboardingPrompt onNavigateToSettings={() => setView('settings')} />

            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Acesso Rápido</h3>
              <div className="grid grid-cols-3 gap-3">
                {smartQuickAdds.map((q, idx) => (
                  <button 
                    key={`${q.label}-${q.amount}-${idx}`}
                    onClick={() => quickAdd(q)}
                    style={{ animationDelay: `${idx * 50}ms` }}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-muted hover:border-primary/50 transition-all active:scale-90 group animate-in zoom-in-95 duration-300 shadow-sm"
                  >
                    <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">{q.emoji}</span>
                    <span className="text-[10px] font-black text-foreground truncate w-full text-center uppercase tracking-tight">{q.label}</span>
                    <span className="text-[9px] font-code text-muted-foreground mt-1">{q.amount} Kz</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Últimas Transações</h3>
                <Button variant="ghost" size="sm" onClick={() => setView('search')} className="text-[10px] font-black uppercase tracking-widest text-primary h-6 px-2">Ver Tudo</Button>
              </div>
              
              {groupedExpenses.length === 0 && (
                <div className="py-20 text-center space-y-4 animate-in fade-in duration-700">
                  <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium italic">Nenhum gasto registado ainda.</p>
                  <Button onClick={() => setView('add')} size="sm" className="rounded-full px-6">Começar Agora</Button>
                </div>
              )}

              {groupedExpenses.slice(0, 3).map(([date, items]) => (
                <div key={date} className="space-y-3">
                  <div className="flex justify-between items-center border-b border-muted/50 pb-1">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">{dateLabel(date)}</h4>
                    <span className="font-code text-[10px] text-muted-foreground/80 font-black">
                      {formatKwanza(items.reduce((s, i) => s + (i.baseAmount || i.amount), 0))}
                    </span>
                  </div>
                  <div className="bg-card/30 rounded-2xl overflow-hidden border border-muted/50 divide-y divide-muted/30 shadow-sm">
                    {items.map(expense => (
                      <ExpenseItem 
                        key={expense.id} 
                        expense={expense} 
                        onDelete={handleDeleteExpense} 
                        onRepeat={handleRepeatExpense}
                        onClick={() => startEditing(expense)}
                        isNew={newlyAddedId === expense.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {view === 'search' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="sticky top-20 bg-background/95 py-2 z-20 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Busca (ex: 2000 taxi)" 
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="bg-card border-muted rounded-xl h-12 pl-10 pr-10 transition-all focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                <Badge 
                  variant={categoryFilter === null ? "default" : "outline"}
                  className="cursor-pointer whitespace-nowrap uppercase text-[9px] font-black tracking-widest px-3 py-1.5"
                  onClick={() => setCategoryFilter(null)}
                >
                  Todas
                </Badge>
                {CATEGORIES.map(cat => (
                  <Badge 
                    key={cat.id}
                    variant={categoryFilter === cat.id ? "default" : "outline"}
                    className="cursor-pointer whitespace-nowrap uppercase text-[9px] font-black tracking-widest px-3 py-1.5"
                    style={categoryFilter === cat.id ? { backgroundColor: cat.color } : {}}
                    onClick={() => setCategoryFilter(cat.id)}
                  >
                    {cat.emoji} {cat.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {groupedExpenses.map(([date, items]) => (
                <div key={date} className="space-y-3">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-muted pb-1">{dateLabel(date)}</h4>
                  <div className="bg-card/30 rounded-2xl overflow-hidden border border-muted divide-y divide-muted">
                    {items.map(expense => (
                      <ExpenseItem 
                        key={expense.id} 
                        expense={expense} 
                        onDelete={handleDeleteExpense}
                        onRepeat={handleRepeatExpense}
                        onClick={() => startEditing(expense)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'summary' && (
          <Dashboard expenses={expenses} />
        )}

        {view === 'settings' && (
          <SettingsView />
        )}

        {isStaticView && (
          <StaticInfoViews view={view as StaticViewType} onBack={() => setView('home')} />
        )}

        {(view === 'add' || view === 'edit') && (
          <ExpenseForm 
            initialData={view === 'edit' ? editingExpense || undefined : undefined}
            onSave={view === 'edit' ? handleUpdateExpense : handleAddExpense} 
            onCancel={() => setView('home')} 
          />
        )}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-background/80 backdrop-blur-xl border-t border-muted/50 px-4 py-3 z-50 flex items-center justify-around shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <NavButton active={view === 'home'} icon={Home} label="Início" onClick={() => setView('home')} />
        <NavButton active={view === 'search'} icon={Search} label="Busca" onClick={() => setView('search')} />
        
        <div className="relative -top-8">
          <Button 
            onClick={() => {
              setEditingExpense(null);
              setView('add');
            }}
            className={`w-14 h-14 rounded-full shadow-[0_8px_32px_rgba(255,126,8,0.4)] transition-all hover:scale-110 active:scale-90 flex items-center justify-center p-0 border-4 border-background ${view === 'add' ? 'bg-secondary' : 'bg-primary'}`}
          >
            <Plus className="h-8 w-8 text-white" />
          </Button>
        </div>

        <NavButton active={view === 'summary'} icon={PieChart} label="Painel" onClick={() => setView('summary')} />
        <NavButton active={view === 'settings'} icon={Settings} label="Definições" onClick={() => setView('settings')} />
      </nav>
    </div>
  );
}

function NavButton({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all duration-300 active:scale-95 w-12 ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
    >
      <Icon className={`h-5 w-5 transition-transform ${active ? 'scale-110' : ''}`} />
      <span className="text-[9px] font-black uppercase tracking-widest leading-none text-center">{label}</span>
      {active && <div className="w-1 h-1 rounded-full bg-primary mt-0.5 animate-in zoom-in" />}
    </button>
  );
}
