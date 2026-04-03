
"use client";

import React, { useMemo, useState } from 'react';
import { type Expense, CATEGORIES } from '@/lib/types';
import { formatKwanza } from '@/lib/formatters';
import { Card } from './ui/card';
import { AIInsightsView } from './AIInsightsView';
import { SpendingAlerts } from './SpendingAlerts';
import { TrendsSection } from './TrendsSection';
import { SpendingOverview } from './SpendingOverview';
import { StatCard } from './ui/StatCard';
import { BudgetProgressRing } from './ui/BudgetProgressRing';
import { TrendingUp, Calendar, Users, Zap, CalendarDays, CalendarRange, Target, UserCheck, ShieldCheck, LogIn, Sparkles } from 'lucide-react';
import { 
  startOfMonth, 
  parseISO, 
  isWithinInterval, 
  endOfMonth, 
  isToday, 
  isSameWeek, 
  isSameMonth, 
  isSameYear
} from 'date-fns';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MonthlyReportView } from './MonthlyReportView';
import { useAuth } from '@/firebase';
import { Button } from './ui/button';
import { useUserSettings } from '@/hooks/useUserSettings';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { AuthForm } from './AuthForm';

interface DashboardProps {
  expenses: Expense[];
}

export function Dashboard({ expenses }: DashboardProps) {
  const { user } = useAuth();
  const { settings } = useUserSettings();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const budget = settings.budget;
  
  const now = new Date();

  const totals = useMemo(() => {
    let today = 0;
    let week = 0;
    let month = 0;
    let year = 0;

    expenses.forEach(e => {
      try {
        const d = parseISO(e.date);
        const value = e.baseAmount || e.amount;
        if (isToday(d)) today += value;
        if (isSameWeek(d, now, { weekStartsOn: 1 })) week += value;
        if (isSameMonth(d, now)) month += value;
        if (isSameYear(d, now)) year += value;
      } catch (err) {}
    });

    return { today, week, month, year };
  }, [expenses, now]);

  const currentMonthExpenses = useMemo(() => {
    const interval = { start: startOfMonth(now), end: endOfMonth(now) };
    return expenses.filter(e => {
      try {
        return isWithinInterval(parseISO(e.date), interval);
      } catch {
        return false;
      }
    });
  }, [expenses, now]);

  const daysInMonthElapsed = now.getDate();
  const dailyAvg = totals.month > 0 ? Math.round(totals.month / daysInMonthElapsed) : 0;
  const remainingBudget = Math.max(0, budget - totals.month);
  const budgetPercentage = Math.min(100, Math.round((totals.month / budget) * 100));

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    currentMonthExpenses.forEach(e => {
      const val = e.baseAmount || e.amount;
      map.set(e.category, (map.get(e.category) || 0) + val);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [currentMonthExpenses]);

  if (!user) {
    return (
      <div className="py-12 space-y-10 animate-in fade-in zoom-in duration-500">
        <div className="w-full max-w-[280px] mx-auto space-y-8 text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border-2 border-primary/20 shadow-2xl relative">
            <ShieldCheck className="h-12 w-12 text-primary" />
            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-black uppercase tracking-tight">Análise em Pausa</h3>
            <p className="text-[11px] text-muted-foreground uppercase tracking-widest leading-relaxed px-4">
              Estás no modo visitante. Cria uma conta para desbloqueares estatísticas reais, alertas de orçamento e relatórios de voz.
            </p>
          </div>

          <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all"
              >
                <LogIn className="h-5 w-5" />
                Entrar Agora
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background border-muted p-0 sm:rounded-[2rem] overflow-hidden">
              <div className="p-6">
                <AuthForm initialMode="signup" onComplete={() => setIsAuthOpen(false)} />
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center justify-center gap-2 opacity-40">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Teus dados seguros na Nuvem</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Saúde Orçamental</h3>
        </div>
        <Card className="p-6 bg-card/40 backdrop-blur-sm border-muted relative overflow-hidden rounded-[2rem] shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
            <div className="shrink-0">
              <BudgetProgressRing percentage={budgetPercentage} label="Utilizado" size={130} />
            </div>
            <div className="flex-1 space-y-5 w-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Saldo Livre</p>
                  <p className="text-xl font-black font-code text-emerald-400">
                    {formatKwanza(remainingBudget).split(' ')[0]} 
                    <span className="text-[9px] ml-1 uppercase opacity-60">Kz</span>
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Média Diária</p>
                  <p className="text-xl font-black font-code text-foreground">
                    {formatKwanza(dailyAvg).split(' ')[0]} 
                    <span className="text-[9px] ml-1 uppercase opacity-60">Kz</span>
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  <span>Meta Mensal</span>
                  <span className="text-foreground">{formatKwanza(budget)}</span>
                </div>
              </div>
            </div>
          </div>
          <Target className="absolute -right-6 -bottom-6 h-28 w-28 text-muted/5 -rotate-12 pointer-events-none" />
        </Card>
      </section>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full bg-muted/30 p-1 h-11 rounded-xl mb-8 border border-muted/50 shadow-sm">
          <TabsTrigger value="overview" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background transition-all">Estado</TabsTrigger>
          <TabsTrigger value="analysis" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background transition-all">Análise</TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background transition-all">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 mt-0">
          <SpendingAlerts expenses={expenses} budget={budget} />
          <SpendingOverview expenses={expenses} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-8 mt-0">
          <TrendsSection expenses={expenses} />
          <div className="grid grid-cols-2 gap-3">
            <StatCard title="Transações" value={expenses.length.toString()} color="text-blue-400" icon={Calendar} />
            <StatCard title="Dias Ativos" value={(new Set(expenses.map(e => e.date))).size.toString()} color="text-emerald-400" icon={Users} />
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1">Top Categorias (Mês)</h3>
            <Card className="bg-card/40 backdrop-blur-sm border-muted divide-y divide-muted/50 overflow-hidden rounded-[1.5rem] shadow-lg">
              {byCategory.length === 0 ? (
                <div className="p-8 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nenhum gasto este mês</div>
              ) : (
                byCategory.slice(0, 5).map(([catId, total]) => {
                  const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES[CATEGORIES.length - 1];
                  const Icon = getCategoryIcon(catId);
                  const percentage = Math.round((total / totals.month) * 100);
                  return (
                    <div key={catId} className="p-4 space-y-3 hover:bg-muted/20 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="bg-muted/30 w-10 h-10 flex items-center justify-center rounded-xl"><Icon className="h-5 w-5" style={{ color: cat.color }} /></span>
                          <div>
                            <span className="text-xs font-black tracking-tight uppercase block">{cat.label}</span>
                            <span className="text-[9px] text-muted-foreground font-black uppercase">{percentage}% do total</span>
                          </div>
                        </div>
                        <div className="font-code font-black text-sm">{formatKwanza(total).split(' ')[0]} <span className="text-[10px]">Kz</span></div>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${percentage}%`, backgroundColor: cat.color }} />
                      </div>
                    </div>
                  );
                })
              )}
            </Card>
          </div>
          <AIInsightsView expenses={currentMonthExpenses} monthTotal={totals.month} dailyAvg={dailyAvg} />
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <MonthlyReportView expenses={expenses} budget={budget} />
        </TabsContent>
      </Tabs>

      <div className="pt-10 pb-4 text-center space-y-2 opacity-30">
        <div className="flex items-center justify-center gap-2">
          <UserCheck className="h-3 w-3 text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Sessão Activa</span>
        </div>
        <p className="text-[8px] font-bold uppercase tracking-widest">Luanda, AO</p>
      </div>
    </div>
  );
}
