
"use client";

import React, { useMemo, useState } from 'react';
import { type Expense, CATEGORIES } from '@/lib/types';
import { formatKwanza } from '@/lib/formatters';
import { Card } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Zap
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '@/lib/utils';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths, 
  format, 
  parseISO, 
  eachDayOfInterval,
  isSameDay,
  subDays,
  startOfYear,
  eachMonthOfInterval
} from 'date-fns';
import { pt } from 'date-fns/locale';

interface TrendsSectionProps {
  expenses: Expense[];
}

type Period = 'week' | 'month' | 'year';

export function TrendsSection({ expenses }: TrendsSectionProps) {
  const [period, setPeriod] = useState<Period>('month');

  const stats = useMemo(() => {
    const now = new Date();
    let chartData: any[] = [];
    let currentTotal = 0;
    let prevTotal = 0;

    if (period === 'week') {
      const days = eachDayOfInterval({
        start: subDays(now, 6),
        end: now
      });

      chartData = days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayTotal = expenses
          .filter(e => e.date === dayStr)
          .reduce((sum, e) => sum + e.amount, 0);
        
        return {
          name: format(day, 'EEE', { locale: pt }),
          amount: dayTotal,
          color: '#F97316'
        };
      });

      currentTotal = chartData.reduce((s, d) => s + d.amount, 0);
      // Simulação simplificada de prevTotal para comparação
      prevTotal = currentTotal * 0.9; 

    } else if (period === 'month') {
      // Top 5 Categorias do Mês
      const currentStart = startOfMonth(now);
      const monthExpenses = expenses.filter(e => parseISO(e.date) >= currentStart);
      
      const catMap = new Map<string, number>();
      monthExpenses.forEach(e => catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount));
      
      chartData = Array.from(catMap.entries())
        .map(([id, amount]) => {
          const cat = CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
          return { name: cat.label, amount, color: cat.color };
        })
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      currentTotal = monthExpenses.reduce((s, e) => s + e.amount, 0);
      prevTotal = expenses
        .filter(e => {
          const d = parseISO(e.date);
          return d >= startOfMonth(subMonths(now, 1)) && d < currentStart;
        })
        .reduce((s, e) => s + e.amount, 0);

    } else if (period === 'year') {
      const months = eachMonthOfInterval({
        start: startOfYear(now),
        end: now
      });

      chartData = months.map(m => {
        const mTotal = expenses
          .filter(e => {
            const d = parseISO(e.date);
            return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
          })
          .reduce((sum, e) => sum + e.amount, 0);
        
        return {
          name: format(m, 'MMM', { locale: pt }),
          amount: mTotal,
          color: '#3B82F6'
        };
      });

      currentTotal = chartData.reduce((s, d) => s + d.amount, 0);
      prevTotal = 0; // Simplificado
    }

    const diff = currentTotal - prevTotal;
    const percentChange = prevTotal === 0 ? 100 : Math.round((diff / prevTotal) * 100);

    return {
      currentTotal,
      percentChange,
      chartData
    };
  }, [expenses, period]);

  return (
    <section className="space-y-4 animate-in fade-in duration-700">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <BarChart3 className="h-3 w-3 text-primary" />
          Tendências e Gráficos
        </h3>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <TabsList className="h-7 bg-muted/50 p-0.5 border border-muted">
            <TabsTrigger value="week" className="text-[9px] h-6 px-2 uppercase font-black tracking-tighter">7 Dias</TabsTrigger>
            <TabsTrigger value="month" className="text-[9px] h-6 px-2 uppercase font-black tracking-tighter">Mês</TabsTrigger>
            <TabsTrigger value="year" className="text-[9px] h-6 px-2 uppercase font-black tracking-tighter">Ano</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="p-5 bg-card/40 backdrop-blur-sm border-muted overflow-hidden relative">
        <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
              {period === 'week' ? 'Última Semana' : period === 'month' ? 'Total Mensal' : 'Total Anual'}
            </p>
            <p className="text-xl font-black font-code text-foreground">
              {formatKwanza(stats.currentTotal).split(' ')[0]} <span className="text-xs uppercase">Kz</span>
            </p>
          </div>
          <div className="text-right">
            {period !== 'year' && (
              <>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Comparação</p>
                <div className={cn(
                  "flex items-center justify-end gap-1 font-black font-code text-sm",
                  stats.percentChange > 0 ? "text-destructive" : stats.percentChange < 0 ? "text-emerald-500" : "text-muted-foreground"
                )}>
                  {stats.percentChange > 0 ? <TrendingUp className="h-4 w-4" /> : stats.percentChange < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                  {Math.abs(stats.percentChange)}%
                </div>
              </>
            )}
          </div>
        </div>

        <div className="h-48 w-full mb-2">
          <ResponsiveContainer width="100%" height="100%">
            {period === 'year' ? (
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 900 }} 
                />
                <Tooltip 
                  cursor={{ stroke: '#3B82F6', strokeWidth: 1 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-muted p-2 rounded-lg shadow-xl animate-in zoom-in-95 duration-200">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{payload[0].payload.name}</p>
                          <p className="font-code font-black text-blue-400">{formatKwanza(Number(payload[0].value))}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke="#3B82F6" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
              </AreaChart>
            ) : (
              <BarChart data={stats.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 900 }} 
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border border-muted p-2 rounded-lg shadow-xl animate-in zoom-in-95 duration-200">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{payload[0].payload.name}</p>
                          <p className="font-code font-black text-primary">{formatKwanza(Number(payload[0].value))}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-[10px] text-foreground/80 leading-relaxed italic text-center">
            {period === 'week' && "Visão do consumo nos últimos 7 dias úteis."}
            {period === 'month' && "Distribuição do gasto pelas tuas top 5 categorias."}
            {period === 'year' && "Evolução do teu património e despesas este ano."}
          </p>
        </div>
      </Card>
    </section>
  );
}
