
"use client";

import React, { useMemo } from 'react';
import { type Expense } from '@/lib/types';
import { formatKwanza } from '@/lib/formatters';
import { StatCard } from './ui/StatCard';
import { 
  startOfDay, 
  startOfWeek, 
  startOfMonth, 
  isWithinInterval, 
  parseISO,
  subDays,
  subWeeks,
  subMonths,
  endOfDay,
  endOfWeek,
  endOfMonth,
  startOfYear,
  endOfYear,
  subYears
} from 'date-fns';
import { Calendar, CalendarDays, CalendarRange, Landmark } from 'lucide-react';

interface SpendingOverviewProps {
  expenses: Expense[];
}

export function SpendingOverview({ expenses }: SpendingOverviewProps) {
  const stats = useMemo(() => {
    const now = new Date();
    
    // Intervalos Atuais
    const todayInterval = { start: startOfDay(now), end: endOfDay(now) };
    const weekInterval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    const monthInterval = { start: startOfMonth(now), end: endOfMonth(now) };
    const yearInterval = { start: startOfYear(now), end: endOfYear(now) };

    // Intervalos Anteriores (para comparação)
    const yesterdayInterval = { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) };
    const lastWeekInterval = { start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) };
    const lastMonthInterval = { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    const lastYearInterval = { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) };

    const getSum = (interval: { start: Date; end: Date }) => 
      expenses.filter(e => {
        try {
          const d = parseISO(e.date);
          return isWithinInterval(d, interval);
        } catch (e) {
          return false;
        }
      }).reduce((sum, e) => sum + e.amount, 0);

    const today = getSum(todayInterval);
    const yesterday = getSum(yesterdayInterval);
    
    const week = getSum(weekInterval);
    const lastWeek = getSum(lastWeekInterval);
    
    const month = getSum(monthInterval);
    const lastMonth = getSum(lastMonthInterval);

    const year = getSum(yearInterval);
    const lastYear = getSum(lastYearInterval);

    const getDiff = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return [
      { 
        label: "Hoje", 
        value: formatKwanza(today), 
        diff: getDiff(today, yesterday), 
        icon: Calendar, 
        color: "text-emerald-500",
      },
      { 
        label: "Semana", 
        value: formatKwanza(week), 
        diff: getDiff(week, lastWeek), 
        icon: CalendarDays, 
        color: "text-blue-500",
      },
      { 
        label: "Mês", 
        value: formatKwanza(month), 
        diff: getDiff(month, lastMonth), 
        icon: CalendarRange, 
        color: "text-primary",
      },
      { 
        label: "Ano", 
        value: formatKwanza(year), 
        diff: getDiff(year, lastYear), 
        icon: Landmark, 
        color: "text-amber-500",
      },
    ];
  }, [expenses]);

  return (
    <section className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Ritmo de Gastos</h3>
      <div className="grid grid-cols-2 xs:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            subtitle={stat.diff !== 0 ? `${stat.diff > 0 ? '↑' : '↓'} ${Math.abs(stat.diff)}% vs ant.` : 'Estável'}
          />
        ))}
      </div>
    </section>
  );
}
