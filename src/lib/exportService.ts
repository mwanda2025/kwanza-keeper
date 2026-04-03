
"use client";

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { type Expense, CATEGORIES } from './types';
import { formatKwanza } from './formatters';

/**
 * Service to handle exporting expense data to different formats.
 */

interface ExportOptions {
  expenses: Expense[];
  budget: number;
  monthTotal: number;
}

export const exportToExcel = ({ expenses, budget, monthTotal }: ExportOptions) => {
  const fileName = `KwanzaKeeper_Report_${new Date().toISOString().split('T')[0]}.xlsx`;

  // 1. Transactions Sheet
  const transactionsData = expenses.map(e => ({
    Data: e.date,
    Descrição: e.description,
    Categoria: CATEGORIES.find(c => c.id === e.category)?.label || e.category,
    Valor: e.amount,
    Pagamento: e.payment,
    Pessoa: e.person || '-',
    Notas: e.notes || '-'
  }));

  // 2. Summary Sheet
  const byCategory = new Map<string, number>();
  expenses.forEach(e => byCategory.set(e.category, (byCategory.get(e.category) || 0) + e.amount));
  
  const summaryData = [
    { Item: 'Total de Orçamento', Valor: budget },
    { Item: 'Total de Gastos', Valor: monthTotal },
    { Item: 'Saldo Remanescente', Valor: Math.max(0, budget - monthTotal) },
    { Item: '', Valor: '' },
    { Item: 'Gastos por Categoria', Valor: '' },
    ...Array.from(byCategory.entries()).map(([catId, total]) => ({
      Item: CATEGORIES.find(c => c.id === catId)?.label || catId,
      Valor: total
    }))
  ];

  const wb = XLSX.utils.book_new();
  const wsTransactions = XLSX.utils.json_to_sheet(transactionsData);
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);

  XLSX.utils.book_append_sheet(wb, wsSummary, "Resumo");
  XLSX.utils.book_append_sheet(wb, wsTransactions, "Transações");

  XLSX.writeFile(wb, fileName);
};

export const exportToPDF = ({ expenses, budget, monthTotal }: ExportOptions) => {
  const doc = new jsPDF() as any;
  const date = new Date().toLocaleDateString('pt-AO');

  // Title
  doc.setFontSize(22);
  doc.setTextColor(249, 115, 22); // Primary color (orange)
  doc.text('KwanzaKeeper Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Gerado em: ${date}`, 14, 30);

  // Summary Box
  doc.setDrawColor(220);
  doc.setFillColor(245, 245, 245);
  doc.rect(14, 35, 182, 35, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Resumo Mensal', 20, 45);
  
  doc.setFontSize(10);
  doc.text(`Orçamento: ${formatKwanza(budget)}`, 20, 52);
  doc.text(`Total Gasto: ${formatKwanza(monthTotal)}`, 20, 58);
  doc.text(`Disponível: ${formatKwanza(Math.max(0, budget - monthTotal))}`, 20, 64);

  // Category Breakdown Table
  const byCategory = new Map<string, number>();
  expenses.forEach(e => byCategory.set(e.category, (byCategory.get(e.category) || 0) + e.amount));
  
  const categoryRows = Array.from(byCategory.entries()).map(([catId, total]) => [
    CATEGORIES.find(c => c.id === catId)?.label || catId,
    formatKwanza(total),
    `${Math.round((total / monthTotal) * 100)}%`
  ]);

  doc.autoTable({
    startY: 75,
    head: [['Categoria', 'Total', '%']],
    body: categoryRows,
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] }
  });

  // Transactions Table
  doc.addPage();
  doc.setFontSize(16);
  doc.setTextColor(249, 115, 22);
  doc.text('Lista de Transações', 14, 20);

  const transactionRows = expenses.map(e => [
    e.date,
    e.description,
    CATEGORIES.find(c => c.id === e.category)?.label || e.category,
    formatKwanza(e.amount),
    e.payment
  ]);

  doc.autoTable({
    startY: 25,
    head: [['Data', 'Descrição', 'Categoria', 'Valor', 'Metodo']],
    body: transactionRows,
    theme: 'grid',
    headStyles: { fillColor: [28, 25, 23] },
    styles: { fontSize: 8 }
  });

  doc.save(`KwanzaKeeper_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
