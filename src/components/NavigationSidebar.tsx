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
      <div className="px-6 pt-12 pb-8 border-b border-muted/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-xl font-black text-white">K</span>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight">KwanzaKeeper</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Versão 1.5.0</p>
          </div>
        </div>
        {user && (
          <div className="bg-muted/30 p-3 rounded-xl border border-muted/50">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Conta Ativa</p>
            <p className="text-xs font-bold truncate">{user.email || 'Utilizador Guest'}</p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        <section>
          <p className="px-3 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Navegação</p>
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
          <p className="px-3 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Ajuda e Info</p>
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

      <div className="p-6 border-t border-muted/30 text-center">
        <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20">KwanzaKeeper © 2026</p>
      </div>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl transition-all active:scale-95 group",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
        <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      </div>
      <ChevronRight className={cn("h-4 w-4 opacity-0 transition-all", active ? "opacity-100 translate-x-0" : "group-hover:opacity-40 -translate-x-2 group-hover:translate-x-0")} />
    </button>
  );
}
