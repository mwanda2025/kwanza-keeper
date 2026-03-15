
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { type Expense, CATEGORIES } from '@/lib/types';
import { formatKwanza } from '@/lib/formatters';
import { getAiSpendingInsights, type AiSpendingInsightsOutput } from '@/ai/flows/ai-spending-insights';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { 
  Sparkles, 
  Loader2, 
  Calendar, 
  TrendingUp, 
  ChevronRight, 
  ArrowRight,
  FileText,
  Table as TableIcon
} from 'lucide-react';
import { exportToPDF, exportToExcel } from '@/lib/exportService';
import { cn } from '@/lib/utils';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO, format, getWeek } from 'date-fns';
import { pt } from 'date-fns/locale';
import { getReportDay } from '@/lib/budget';

interface MonthlyReportViewProps {
  expenses: Expense[];
  budget: number;
}

export function MonthlyReportView({ expenses, budget }: MonthlyReportViewProps) {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AiSpendingInsightsOutput | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [reportDay, setReportDay] = useState(1);

  useEffect(() => {
    setReportDay(getReportDay());
    setSelectedMonth(new Date());
  }, []);

  const monthExpenses = useMemo(() => {
    if (!selectedMonth) return [];
    const interval = { start: startOfMonth(selectedMonth), end: endOfMonth(selectedMonth) };
    return expenses.filter(e => {
      try {
        return isWithinInterval(parseISO(e.date), interval);
      } catch {
        return false;
      }
    });
  }, [expenses, selectedMonth]);

  const monthTotal = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyAvg = monthExpenses.length > 0 ? Math.round(monthTotal / 30) : 0;

  const stats = useMemo(() => {
    if (monthExpenses.length === 0) return null;

    const dayMap = new Map<string, number>();
    monthExpenses.forEach(e => dayMap.set(e.date, (dayMap.get(e.date) || 0) + e.amount));
    const busiestDay = Array.from(dayMap.entries()).sort((a, b) => b[1] - a[1])[0];

    const weekMap = new Map<number, number>();
    monthExpenses.forEach(e => {
      const w = getWeek(parseISO(e.date));
      weekMap.set(w, (weekMap.get(w) || 0) + e.amount);
    });
    const busiestWeek = Array.from(weekMap.entries()).sort((a, b) => b[1] - a[1])[0];

    const catMap = new Map<string, number>();
    monthExpenses.forEach(e => catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount));

    return {
      busiestDay: busiestDay ? { date: busiestDay[0], amount: busiestDay[1] } : undefined,
      busiestWeek: busiestWeek ? { weekNumber: busiestWeek[0], amount: busiestWeek[1] } : undefined,
      byCategory: Array.from(catMap.entries()),
    };
  }, [monthExpenses]);

  const generateReport = async () => {
    if (!stats) return;
    setLoading(true);
    try {
      const result = await getAiSpendingInsights({
        expenses: monthExpenses.map(e => ({ ...e, id: e.id.toString() })),
        monthTotal,
        dailyAvg,
        byCategory: stats.byCategory,
        busiestDay: stats.busiestDay,
        busiestWeek: stats.busiestWeek,
        categories: CATEGORIES.map(c => ({ id: c.id, label: c.label, emoji: c.emoji, color: c.color }))
      });
      setReport(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedMonth) return null;

  const monthName = format(selectedMonth, 'MMMM yyyy', { locale: pt });

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{monthName}</h3>
        </div>
        <div className="flex gap-2">
           <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setSelectedMonth(prev => prev ? new Date(prev.setMonth(prev.getMonth() - 1)) : null)}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setSelectedMonth(prev => prev ? new Date(prev.setMonth(prev.getMonth() + 1)) : null)}
            disabled={selectedMonth >= new Date()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-card/40 border-muted relative overflow-hidden shadow-xl rounded-2xl">
        <div className="space-y-6 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Mensal</p>
              <p className="text-2xl sm:text-3xl font-black font-code text-foreground">{formatKwanza(monthTotal).split(' ')[0]} <span className="text-sm">Kz</span></p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Ciclo Mensal</p>
               <p className="text-xs font-bold text-primary">Fecha ao Dia {reportDay}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-muted/50">
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Pico de Gasto</p>
              <p className="text-sm font-bold font-code">{stats?.busiestDay ? formatKwanza(stats.busiestDay.amount).split(' ')[0] : '0'} Kz</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Média Diária</p>
              <p className="text-sm font-bold font-code">{formatKwanza(dailyAvg).split(' ')[0]} Kz</p>
            </div>
          </div>
        </div>
        <TrendingUp className="absolute -right-4 -bottom-4 h-24 w-24 text-primary/5 -rotate-12" />
      </Card>

      {!report ? (
        <Button 
          className="w-full h-14 rounded-2xl gap-3 text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/20"
          onClick={generateReport}
          disabled={loading || monthExpenses.length === 0}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          Gerar Relatório IA
        </Button>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="p-6 bg-primary/5 border-primary/20 space-y-6 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest">Insights do KwanzaKeeper</h4>
            </div>

            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-foreground/90 font-medium italic">"{report.summary}"</p>
              
              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Análise de Tendências</h5>
                <div className="space-y-2">
                  {report.trends.map((t, i) => (
                    <div key={i} className="flex gap-2 items-start text-xs">
                      <ArrowRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-primary">Dicas de Poupança</h5>
                <div className="space-y-2">
                  {report.savings.map((s, i) => (
                    <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex gap-3 items-start">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      <span className="text-[11px] font-medium">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-10 gap-2 border-muted"
                onClick={() => exportToPDF({ expenses: monthExpenses, budget, monthTotal })}
              >
                <FileText className="h-3.5 w-3.5 text-red-400" />
                <span className="text-[10px] font-black uppercase">PDF</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 h-10 gap-2 border-muted"
                onClick={() => exportToExcel({ expenses: monthExpenses, budget, monthTotal })}
              >
                <TableIcon className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[10px] font-black uppercase">Excel</span>
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
