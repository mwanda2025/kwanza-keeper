"use client";

import React, { useState } from 'react';
import { type Expense, CATEGORIES } from '@/lib/types';
import { getAiSpendingInsights, type AiSpendingInsightsOutput } from '@/ai/flows/ai-spending-insights';
import { Button } from './ui/button';
import { Sparkles, Loader2, TrendingUp, Lightbulb, Activity, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { formatKwanza } from '@/lib/formatters';

interface AIInsightsViewProps {
  expenses: Expense[];
  monthTotal: number;
  dailyAvg: number;
}

export function AIInsightsView({ expenses, monthTotal, dailyAvg }: AIInsightsViewProps) {
  const [report, setReport] = useState<AiSpendingInsightsOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (expenses.length === 0) return;
    setLoading(true);
    try {
      const byCategoryMap = new Map<string, number>();
      expenses.forEach(e => byCategoryMap.set(e.category, (byCategoryMap.get(e.category) || 0) + e.amount));
      
      const byPersonMap = new Map<string, number>();
      expenses.filter(e => e.person).forEach(e => byPersonMap.set(e.person || 'Outros', (byPersonMap.get(e.person || 'Outros') || 0) + e.amount));

      const result = await getAiSpendingInsights({
        expenses: expenses.map(e => ({ ...e, id: e.id.toString(), payment: e.payment })),
        monthTotal,
        dailyAvg,
        byCategory: Array.from(byCategoryMap.entries()),
        byPerson: Array.from(byPersonMap.entries()),
        categories: CATEGORIES.map(c => ({ id: c.id, label: c.label, emoji: c.emoji, color: c.color }))
      });
      setReport(result);
    } catch (error) {
      console.error("AI Generation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-primary" />
          Conselheiro KwanzaKeeper
        </h3>
        {!report && (
          <Button size="sm" onClick={generate} disabled={loading || expenses.length === 0} className="h-8 gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Analisar Agora
          </Button>
        )}
      </div>

      {report ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="p-5 bg-primary/5 border-primary/20 space-y-6 rounded-2xl relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <p className="text-sm leading-relaxed text-foreground/90 font-medium italic">
                "{report.summary}"
              </p>
            </div>

            <div className="grid gap-4 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                  <TrendingUp className="h-3 w-3" />
                  Tendências Detetadas
                </div>
                <div className="space-y-2">
                  {report.trends.map((t, i) => (
                    <div key={i} className="flex gap-2 items-start text-[11px] leading-tight text-foreground/80">
                      <ArrowRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  <Lightbulb className="h-3 w-3" />
                  Dicas de Poupança
                </div>
                <div className="space-y-2">
                  {report.savings.map((s, i) => (
                    <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl flex gap-2 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span className="text-[11px] font-medium text-foreground/90">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-primary/10">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">
                  <Activity className="h-3 w-3" />
                  Análise de Picos
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                  {report.peakAnalysis}
                </p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setReport(null)} className="w-full h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary mt-2">
              Limpar e Recalcular
            </Button>
            
            <Sparkles className="absolute -right-4 -top-4 h-24 w-24 text-primary/5 -rotate-12 pointer-events-none" />
          </Card>
        </div>
      ) : (
        <button 
          onClick={generate}
          disabled={loading || expenses.length === 0}
          className="w-full p-8 text-center border-2 border-dashed border-muted/50 rounded-2xl bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all group"
        >
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">KwanzaKeeper está a pensar...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="h-8 w-8 text-muted-foreground/30 group-hover:text-primary/50 group-hover:scale-110 transition-all" />
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Obter Insights IA</p>
                <p className="text-[10px] text-muted-foreground/60">Analisar os teus padrões de gastos deste mês.</p>
              </div>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
