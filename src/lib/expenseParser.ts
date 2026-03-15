/**
 * @fileOverview Parser local para processamento de despesas em linguagem natural (Fallback Offline).
 * Detecta valores, categorias e datas sem necessidade de conexão à internet.
 */

import { CATEGORIES, type Expense } from './types';

interface OfflineParseResult {
  description: string;
  amount: number;
  date: string;
  category: string;
}

/**
 * Palavras-chave para mapeamento de categorias no contexto angolano.
 */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  transport: ['táxi', 'txara', 'mota', 'girabairro', 'candongueiro', 'autocarro', 'macon', 'yango', 'heetch'],
  food: ['almoço', 'jantar', 'matabicho', 'comida', 'restaurante', 'kfc', 'pão', 'gasosa', 'fome'],
  home: ['renda', 'luz', 'casa', 'móveis', 'zap', 'dstv'],
  internet: ['unitel', 'africell', 'net', 'internet', 'dados', 'recarga', 'saldo'],
  shopping: ['supermercado', 'kero', 'candando', 'loja', 'compras', 'shopp', 'roupa'],
  fuel: ['gasolina', 'gasóleo', 'combustível', 'sonangol', 'pumangol'],
  water: ['epal', 'água', 'girafa', 'cisterna'],
  education: ['escola', 'propinas', 'livros', 'faculdade', 'isptec', 'uacan'],
  health: ['farmácia', 'hospital', 'médico', 'remédio', 'clínica'],
  leisure: ['festa', 'cinema', 'lazer', 'praia', 'cerveja', 'cuca'],
};

/**
 * Processa uma frase em linguagem natural e extrai dados estruturados.
 * @param text O texto inserido pelo utilizador (ex: "2000kz táxi hoje").
 * @returns Um objeto com os dados extraídos ou valores padrão.
 */
export function parseExpenseOffline(text: string): OfflineParseResult {
  const lowerText = text.toLowerCase();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // 1. Extração de Valor (Regex para 2000kz, 2000 kz, 2000 kwanza, 2000k)
  const amountMatch = lowerText.match(/(\d+)\s*(kz|kwanza|k\b)/i) || lowerText.match(/(\d+)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  // 2. Extração de Data
  let date = today;
  if (lowerText.includes('ontem')) {
    date = yesterday;
  } else {
    // Procura por formato DD/MM/YYYY ou DD-MM-YYYY
    const dateMatch = lowerText.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dateMatch) {
      date = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
    }
  }

  // 3. Extração de Categoria
  let category = 'other';
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      category = catId;
      break;
    }
  }

  // 4. Limpeza da Descrição (Remover o valor e a data do texto original)
  let description = text
    .replace(/(\d+)\s*(kz|kwanza|k\b)/i, '')
    .replace(/hoje|ontem/gi, '')
    .replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, '')
    .trim();

  // Se a descrição ficar vazia, usar a categoria como nome
  if (!description) {
    const catLabel = CATEGORIES.find(c => c.id === category)?.label || 'Gasto';
    description = catLabel;
  }

  return {
    description: description.charAt(0).toUpperCase() + description.slice(1),
    amount,
    date,
    category,
  };
}
