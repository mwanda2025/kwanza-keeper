"use client";

import React from 'react';
import { 
  Home, 
  Search, 
  Settings, 
  Headset, 
  Info, 
  ShieldCheck, 
  HelpCircle, 
  ChevronRight,
  PieChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/firebase';
import { AuthSidebarSection } from './AuthSidebarSection';

interface NavigationSidebarProps {
  currentView: string;
  onNavigate: (view: any) => void;
}

export function NavigationSidebar({ currentView, onNavigate }: NavigationSidebarProps) {
  const { user } = useUser();

  const navItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'search', label: 'Actividade', icon: Search },
    { id: 'summary', label: 'Análise Financeira', icon: PieChart },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ] as const;

  const infoItems = [
    { id: 'support', label: 'Apoio ao Cliente', icon: Headset },
    { id: 'about', label: 'Sobre o KwanzaKeeper', icon: Info },
    { id: 'privacy', label: 'Privacidade e Termos', icon: ShieldCheck },
    { id: 'faq', label: 'Perguntas Frequentes', icon: HelpCircle },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header da Sidebar */}
      <div className="px-6 pt-12 pb-8 border-b border-muted/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-xl font-black text-white">K</span>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight leading-none mb-1">KwanzaKeeper</h2>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Versão 1.5.0 Gold</p>
          </div>
        </div>
        
        {!user && (
          <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Modo Visitante</p>
            <p className="text-[10px] text-muted-foreground font-medium leading-tight">Entra para guardares as tuas despesas com segurança.</p>
          </div>
        )}
      </div>

      {/* Links de Navegação */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <section>
          <p className="px-3 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Navegação Principal</p>
          <div className="space-y-1">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={currentView === item.id}
                onClick={() => onNavigate(item.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <p className="px-3 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Ajuda e Informação</p>
          <div className="space-y-1">
            {infoItems.map((item) => (
              <SidebarItem 
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={currentView === item.id}
                onClick={() => onNavigate(item.id)} 
              />
            ))}
          </div>
        </section>
      </div>

      {/* Secção de Autenticação */}
      <AuthSidebarSection onNavigate={onNavigate} />

      {/* Footer de Copyright */}
      <div className="p-6 text-center opacity-20">
        <p className="text-[8px] font-black uppercase tracking-[0.4em]">KwanzaKeeper © 2026</p>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.97] group",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-5 w-5 transition-transform duration-300", active && "scale-110")} />
        <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      </div>
      <ChevronRight className={cn(
        "h-4 w-4 transition-all duration-300", 
        active ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0"
      )} />
    </button>
  );
}
