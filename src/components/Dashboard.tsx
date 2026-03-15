
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { type Expense, CATEGORIES } from '@/lib/types';
import { formatKwanza } from '@/lib/formatters';
import { Card } from './ui/card';
import { AIInsightsView } from './AIInsightsView';
import { SpendingAlerts } from './SpendingAlerts';
import { TrendsSection } from './TrendsSection';
import { SpendingOverview } from './SpendingOverview';
import { getBudget, calculateRemainingBudget } from '@/lib/budget';
import { ExportReports } from './ExportReports';
import { StatCard } from './ui/StatCard';
import { BudgetProgressRing } from './ui/BudgetProgressRing';
import { TrendingUp, Calendar, Users, Zap, CalendarDays, CalendarRange, Target, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  startOfMonth, 
  parseISO, 
  isWithinInterval, 
  endOfMonth, 
  isToday, 
  isSameWeek, 
  isSameMonth, 
  isSameYear,
  startOfYear,
  endOfYear,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MonthlyReportView } from './MonthlyReportView';

interface DashboardProps {
  expenses: Expense[];
}

export function Dashboard({ expenses }: DashboardProps) {
  const [budget, setBudgetState] = useState(150000);
  
  useEffect(() => {
    setBudgetState(getBudget());
  }, []);

  const now = new Date();

  // Agregações de Período (Usando baseAmount para consistência AOA)
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
      } catch (err) {
        // Ignorar datas inválidas
      }
    });

    return { today, week, month, year };
  }, [expenses]);

  const currentMonthExpenses = useMemo(() => {
    const interval = { start: startOfMonth(now), end: endOfMonth(now) };
    return expenses.filter(e => {
      try {
        return isWithinInterval(parseISO(e.date), interval);
      } catch {
        return false;
      }
    });
  }, [expenses]);

  const daysInMonthElapsed = now.getDate();
  const dailyAvg = totals.month > 0 ? Math.round(totals.month / daysInMonthElapsed) : 0;
  
  const remainingBudget = calculateRemainingBudget(budget, totals.month);
  const budgetPercentage = Math.min(100, Math.round((totals.month / budget) * 100));

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    currentMonthExpenses.forEach(e => {
      const val = e.baseAmount || e.amount;
      map.set(e.category, (map.get(e.category) || 0) + val);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [currentMonthExpenses]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      {/* Painel de Sumário Rápido (Multi-Período) */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard 
          title="Gasto Hoje" 
          value={formatKwanza(totals.today)} 
          color="text-primary" 
          icon={Zap} 
          subtitle="Ritmo Diário"
        />
        <StatCard 
          title="Esta Semana" 
          value={formatKwanza(totals.week)} 
          color="text-blue-400" 
          icon={CalendarDays} 
          subtitle="Acumulado 7 dias"
        />
        <StatCard 
          title="Este Mês" 
          value={formatKwanza(totals.month)} 
          color="text-emerald-400" 
          icon={CalendarRange} 
          subtitle={`Meta: ${formatKwanza(budget)}`}
        />
        <StatCard 
          title="Média Diária" 
          value={formatKwanza(dailyAvg)} 
          color="text-amber-400" 
          icon={TrendingUp} 
          subtitle="Consumo Médio"
        />
      </section>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full bg-muted/30 p-1 h-11 rounded-xl mb-6 border border-muted/50 shadow-sm">
          <TabsTrigger value="overview" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">Estado</TabsTrigger>
          <TabsTrigger value="analysis" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">Análise</TabsTrigger>
          <TabsTrigger value="reports" className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg transition-all">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-0">
          <SpendingOverview expenses={expenses} />

          <section className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Monitorização</h3>
              <ExportReports expenses={expenses} budget={budget} monthTotal={totals.month} />
            </div>
            
            <Card className="p-6 bg-card/40 backdrop-blur-sm border-muted relative overflow-hidden group shadow-xl rounded-2xl">
              <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
                <div className="shrink-0 animate-in zoom-in duration-700">
                  <BudgetProgressRing 
                    percentage={budgetPercentage} 
                    label="Utilizado" 
                    size={140}
                  />
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Saldo Disponível</p>
                      <p className="text-xl font-black font-code text-emerald-400">
                        {formatKwanza(remainingBudget).split(' ')[0]} <span className="text-[10px]">Kz</span>
                      </p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Gasto</p>
                      <p className="text-xl font-black font-code text-foreground">
                        {formatKwanza(totals.month).split(' ')[0]} <span className="text-[10px]">Kz</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-muted/50 space-y-2">
                     <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Gasto Anual</p>
                          <p className="text-sm font-bold text-primary">{formatKwanza(totals.year)}</p>
                        </div>
                        <div className={cn(
                          "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                          budgetPercentage > 90 ? "bg-destructive/20 text-destructive" : "bg-emerald-500/20 text-emerald-400"
                        )}>
                          {budgetPercentage > 90 ? "Limite Crítico" : "Em Dia"}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
              
              <Target className="absolute -right-6 -bottom-6 h-28 w-28 text-muted/5 -rotate-12 pointer-events-none" />
            </Card>
          </section>

          <SpendingAlerts expenses={expenses} budget={budget} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-8 mt-0">
          <TrendsSection expenses={expenses} />

          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              title="Transações" 
              value={expenses.length.toString()} 
              color="text-blue-400" 
              icon={Calendar} 
            />
            <StatCard 
              title="Dias Ativos" 
              value={(new Set(expenses.map(e => e.date))).size.toString()} 
              color="text-emerald-400" 
              icon={Users} 
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Top Categorias (Mês)</h3>
            <Card className="bg-card/40 backdrop-blur-sm border-muted divide-y divide-muted/50 overflow-hidden shadow-lg rounded-2xl">
              {byCategory.length === 0 ? (
                <div className="p-8 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nenhum gasto este mês</div>
              ) : (
                byCategory.slice(0, 5).map(([catId, total], idx) => {
                  const cat = CATEGORIES.find(c => c.id === catId) || CATEGORIES.find(c => c.id === 'other') || CATEGORIES[0];
                  const Icon = getCategoryIcon(catId);
                  const percentage = Math.round((total / totals.month) * 100);
                  return (
                    <div 
                      key={catId} 
                      className="p-4 space-y-3 hover:bg-muted/20 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="bg-muted/30 w-10 h-10 flex items-center justify-center rounded-xl">
                            <Icon className="h-5 w-5" style={{ color: cat.color }} />
                          </span>
                          <div>
                            <span className="text-xs font-black tracking-tight uppercase block">{cat.label}</span>
                            <span className="text-[9px] text-muted-foreground font-black uppercase">{percentage}% do total</span>
                          </div>
                        </div>
                        <div className="font-code font-black text-sm">{formatKwanza(total).split(' ')[0]} <span className="text-[10px]">Kz</span></div>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${percentage}%`, backgroundColor: cat.color }} 
                        />
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
          <ShieldCheck className="h-3 w-3 text-emerald-500" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">KwanzaKeeper v1.5.0 Gold</span>
        </div>
        <p className="text-[8px] font-bold uppercase tracking-widest">Sincronização Cloud Ativa • Luanda, AO</p>
      </div>
    </div>
  );
}
