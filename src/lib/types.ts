
export type Category = {
  id: string;
  label: string;
  emoji: string;
  color: string;
};

export type QuickAdd = {
  label: string;
  category: string;
  emoji: string;
  amount: number;
};

export type RecurrenceType = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export type CurrencyCode = 'AOA' | 'USD' | 'EUR';

export type FixedExpense = {
  id: number;
  label: string;
  amount: number;
  currency?: CurrencyCode;
  exchangeRate?: number;
  baseAmount?: number;
  category: string;
  recurrence: RecurrenceType;
  dueDay: number;
  reminderDaysBefore: number;
  synced?: boolean;
};

export type Expense = {
  id: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  currency?: CurrencyCode;
  exchangeRate?: number;
  baseAmount?: number; // Valor convertido para AOA
  payment: string;
  person: string;
  notes: string;
  synced?: boolean;
  isDemo?: boolean;
};

export const CATEGORIES: Category[] = [
  { id: "food", label: "Alimentação", emoji: "🍔", color: "#F97316" },
  { id: "transport", label: "Transporte", emoji: "🚕", color: "#3B82F6" },
  { id: "home", label: "Casa", emoji: "🏠", color: "#10B981" },
  { id: "internet", label: "Internet", emoji: "📱", color: "#8B5CF6" },
  { id: "shopping", label: "Compras", emoji: "🛒", color: "#EC4899" },
  { id: "fuel", label: "Combustível", emoji: "⛽", color: "#EAB308" },
  { id: "water", label: "Água", emoji: "💧", color: "#06B6D4" },
  { id: "education", label: "Educação", emoji: "🎓", color: "#6366F1" },
  { id: "health", label: "Saúde", emoji: "💊", color: "#EF4444" },
  { id: "leisure", label: "Lazer", emoji: "🎉", color: "#A855F7" },
  { id: "other", label: "Outros", emoji: "📦", color: "#94A3B8" },
];

export const QUICK_ADDS: QuickAdd[] = [
  { label: "Matabicho", category: "food", emoji: "☕", amount: 600 },
  { label: "Almoço", category: "food", emoji: "🍱", amount: 2000 },
  { label: "Jantar", category: "food", emoji: "🍽️", amount: 3000 },
  { label: "Táxi Azul", category: "transport", emoji: "🚕", amount: 1000 },
  { label: "Mota", category: "transport", emoji: "🏍️", amount: 500 },
  { label: "Net Unitel", category: "internet", emoji: "📡", amount: 400 },
];

export const PAYMENT_METHODS = ["Cash", "Transfer", "Multicaixa", "Card"];

// Helper to get relative dates for sample data
const getRelativeDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
};

export const SAMPLE_EXPENSES: Omit<Expense, 'id'>[] = [
  { date: getRelativeDate(0), category: "food", description: "Almoço no Candando", amount: 4500, currency: 'AOA', baseAmount: 4500, exchangeRate: 1, payment: "Multicaixa", person: "", notes: "", synced: false, isDemo: true },
  { date: getRelativeDate(0), category: "transport", description: "Táxi para o trabalho", amount: 1000, currency: 'AOA', baseAmount: 1000, exchangeRate: 1, payment: "Cash", person: "", notes: "", synced: false, isDemo: true },
  { date: getRelativeDate(1), category: "internet", description: "Plano Mensal Net One", amount: 15000, currency: 'AOA', baseAmount: 15000, exchangeRate: 1, payment: "Transfer", person: "", notes: "Trabalho remoto", synced: false, isDemo: true },
  { date: getRelativeDate(2), category: "food", description: "Jantar em Família", amount: 12500, currency: 'AOA', baseAmount: 12500, exchangeRate: 1, payment: "Card", person: "", notes: "", synced: false, isDemo: true },
  { date: getRelativeDate(3), category: "home", description: "Pagamento Renda", amount: 150000, currency: 'AOA', baseAmount: 150000, exchangeRate: 1, payment: "Transfer", person: "", notes: "Mês de Março", synced: false, isDemo: true },
  { date: getRelativeDate(5), category: "shopping", description: "Supermercado Kero", amount: 35600, currency: 'AOA', baseAmount: 35600, exchangeRate: 1, payment: "Multicaixa", person: "", notes: "Compras do mês", synced: false, isDemo: true },
  { date: getRelativeDate(7), category: "transport", description: "Manutenção do Carro", amount: 45000, currency: 'AOA', baseAmount: 45000, exchangeRate: 1, payment: "Transfer", person: "Mecânico João", notes: "Troca de óleo", synced: false, isDemo: true },
  { date: getRelativeDate(10), category: "health", description: "Farmácia", amount: 8400, currency: 'AOA', baseAmount: 8400, exchangeRate: 1, payment: "Cash", person: "", notes: "Vitaminas", synced: false, isDemo: true },
];
