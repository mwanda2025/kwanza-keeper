/**
 * @fileOverview Motor de inteligência para os botões de acesso rápido.
 * Analisa o histórico de despesas e sugere os atalhos mais relevantes de forma Offline-First.
 */

import { Expense, QuickAdd, CATEGORIES, QUICK_ADDS } from './types';

/**
 * Gera uma lista de atalhos inteligentes baseada no histórico de gastos.
 * Utiliza um algoritmo de peso (frequência + recência).
 */
export function getSmartQuickAdds(expenses: Expense[]): QuickAdd[] {
  const realExpenses = expenses.filter(e => !e.isDemo);

  // Se o utilizador é novo, mantemos a experiência padrão
  if (realExpenses.length < 10) {
    return QUICK_ADDS;
  }

  const scores = new Map<string, { count: number; lastDate: string; data: QuickAdd }>();
  const now = new Date();

  realExpenses.forEach(e => {
    const key = `${e.description.toLowerCase()}-${e.category}-${e.amount}`;
    const category = CATEGORIES.find(c => c.id === e.category);
    
    // Calcular recência (dias desde o gasto)
    const expenseDate = new Date(e.date);
    const diffDays = Math.max(1, (now.getTime() - expenseDate.getTime()) / (1000 * 3600 * 24));
    const recencyWeight = 1 / Math.log(diffDays + 2); // Gastos recentes têm mais peso

    const existing = scores.get(key);
    if (existing) {
      existing.count += 1 * recencyWeight;
      if (e.date > existing.lastDate) {
        existing.lastDate = e.date;
      }
    } else {
      scores.set(key, {
        count: 1 * recencyWeight,
        lastDate: e.date,
        data: {
          label: e.description,
          category: e.category,
          emoji: category?.emoji || "💰",
          amount: e.amount
        }
      });
    }
  });

  // Ordenamos pelo score calculado
  const ranked = Array.from(scores.values())
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.lastDate.localeCompare(a.lastDate);
    })
    .map(item => item.data);

  const result = [...ranked.slice(0, 6)];
  
  // Preencher com defaults se necessário
  if (result.length < 6) {
    for (const def of QUICK_ADDS) {
      if (result.length >= 6) break;
      const isDup = result.some(r => 
        r.label.toLowerCase() === def.label.toLowerCase() && 
        r.amount === def.amount
      );
      if (!isDup) {
        result.push(def);
      }
    }
  }

  return result;
}
