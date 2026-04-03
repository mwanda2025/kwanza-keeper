
"use client";

import React, { useState } from 'react';
import { type Expense } from '@/lib/types';
import { exportToExcel, exportToPDF } from '@/lib/exportService';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { Download, FileText, Table as TableIcon, Loader2 } from 'lucide-react';

interface ExportReportsProps {
  expenses: Expense[];
  budget: number;
  monthTotal: number;
}

export function ExportReports({ expenses, budget, monthTotal }: ExportReportsProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (type: 'pdf' | 'excel') => {
    if (expenses.length === 0) return;
    setExporting(true);
    
    // Slight delay to allow UI to update and provide feedback
    setTimeout(() => {
      try {
        if (type === 'pdf') {
          exportToPDF({ expenses, budget, monthTotal });
        } else {
          exportToExcel({ expenses, budget, monthTotal });
        }
      } catch (error) {
        console.error("Export failed:", error);
      } finally {
        setExporting(false);
      }
    }, 500);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 border-muted hover:bg-muted/50">
          {exporting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5 text-primary" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest">Exportar</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-muted shadow-2xl">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">Relatórios</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-muted" />
        <DropdownMenuItem 
          onClick={() => handleExport('pdf')}
          className="gap-2 py-2.5 cursor-pointer focus:bg-primary/10"
        >
          <FileText className="h-4 w-4 text-red-400" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Exportar PDF</span>
            <span className="text-[9px] text-muted-foreground">Ideal para partilhar</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleExport('excel')}
          className="gap-2 py-2.5 cursor-pointer focus:bg-primary/10"
        >
          <TableIcon className="h-4 w-4 text-emerald-400" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Exportar Excel</span>
            <span className="text-[9px] text-muted-foreground">Analise de dados</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
