
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { type Expense, type FixedExpense, CATEGORIES } from '@/lib/types';
import { getSpendingAlerts, type SpendingAlertsOutput } from '@/ai/flows/spending-alerts';
import { Button } from './ui/button';
import { Sparkles, AlertTriangle, Info, AlertCircle, Loader2, RefreshCw, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFixedExpenses } from '@/hooks/useFixedExpenses';

interface SpendingAlertsProps {
  expenses: Expense[];
  budget: number;
}

export function SpendingAlerts({ expenses, budget }: SpendingAlertsProps) {
  const [aiAlerts, setAiAlerts] = useState<SpendingAlertsOutput['alerts']>([]);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const { fixedExpenses, getPaidStatus } = useFixedExpenses(expenses);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Lógica de Alertas Determinísticos (Offline) para Contas Fixas
  const deterministicAlerts = useMemo(() => {
    if (!isClient) return [];
    const alerts: SpendingAlertsOutput['alerts'] = [];
    const today = new Date();
    const currentDay = today.getDate();

    fixedExpenses.forEach(fixed => {
      const isPaid = getPaidStatus(fixed);
      if (isPaid) return;

      const daysUntilDue = fixed.dueDay - currentDay;
      const reminderDays = fixed.reminderDaysBefore || 1;

      // Alerta Crítico: Hoje ou Atrasado
      if (daysUntilDue === 0) {
        alerts.push({
          message: `O compromisso "${fixed.label}" vence hoje (${formatKwanza(fixed.amount)}).`,
          severity: 'critical',
          category: fixed.category
        });
      } else if (daysUntilDue < 0 && daysUntilDue > -5) {
        alerts.push({
          message: `O compromisso "${fixed.label}" está atrasado há ${Math.abs(daysUntilDue)} dias.`,
          severity: 'critical',
          category: fixed.category
        });
      }
      // Alerta de Lembrete: X dias antes
      else if (daysUntilDue > 0 && daysUntilDue <= reminderDays) {
        alerts.push({
          message: `Lembrete: "${fixed.label}" vence em ${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'}.`,
          severity: 'warning',
          category: fixed.category
        });
      }
    });

    return alerts;
  }, [fixedExpenses, getPaidStatus, isClient]);

  const generateAlerts = async () => {
    if (expenses.length === 0 && fixedExpenses.length === 0) return;
    setLoading(true);
    try {
      const result = await getSpendingAlerts({
        expenses: expenses.map(e => ({
          date: e.date,
          category: e.category,
          amount: e.amount,
          description: e.description,
        })),
        fixedExpenses: fixedExpenses.map(f => ({
          label: f.label,
          amount: f.amount,
          dueDay: f.dueDay,
          isPaid: getPaidStatus(f)
        })),
        budget,
        categories: CATEGORIES.map(c => ({ id: c.id, label: c.label })),
      });
      setAiAlerts(result.alerts);
      setHasGenerated(true);
    } catch (error) {
      console.error("Failed to generate smart alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && !hasGenerated && (expenses.length > 0 || fixedExpenses.length > 0)) {
      generateAlerts();
    }
  }, [expenses.length, fixedExpenses.length, isClient]);

  const allAlerts = useMemo(() => {
    return [...deterministicAlerts, ...aiAlerts];
  }, [deterministicAlerts, aiAlerts]);

  if (!isClient) return null;
  if (expenses.length === 0 && fixedExpenses.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary" />
          Alertas e Lembretes
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground hover:text-primary"
          onClick={generateAlerts}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        </Button>
      </div>

      <div className="grid gap-2">
        {allAlerts.length > 0 ? (
          allAlerts.map((alert, idx) => (
            <div 
              key={idx}
              className={cn(
                "p-3 rounded-xl border flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300 shadow-sm",
                alert.severity === 'critical' ? "bg-destructive/10 border-destructive/20" :
                alert.severity === 'warning' ? "bg-amber-500/10 border-amber-500/20" :
                "bg-blue-500/10 border-blue-500/20"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {alert.severity === 'critical' && <AlertCircle className="h-4 w-4 text-destructive" />}
                {alert.severity === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                {alert.severity === 'info' && <Info className="h-4 w-4 text-blue-500" />}
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-medium leading-relaxed text-foreground/90">
                  {alert.message}
                </p>
              </div>
              {alert.severity === 'critical' && (
                <Bell className="h-3 w-3 text-destructive animate-bounce" />
              )}
            </div>
          ))
        ) : loading ? (
          <div className="p-4 border border-dashed rounded-xl flex items-center justify-center gap-3 bg-muted/5">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sincronizando compromissos...</span>
          </div>
        ) : hasGenerated && (
          <p className="text-[10px] text-center text-muted-foreground italic py-2">Tudo em dia! Não tens alertas nem pagamentos pendentes próximos.</p>
        )}
      </div>
    </section>
  );
}

function formatKwanza(n: number) {
  return n.toLocaleString("pt-AO") + " Kz";
}
