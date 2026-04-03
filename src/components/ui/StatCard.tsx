"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card } from './card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  color?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  subtitle, 
  color = "text-foreground", 
  className 
}: StatCardProps) {
  return (
    <Card className={cn(
      "p-4 bg-card/40 backdrop-blur-md border-white/5 shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all active:scale-[0.97] group overflow-hidden relative rounded-2xl",
      className
    )}>
      <div className="relative z-10 flex flex-col justify-between h-full space-y-1.5">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg bg-muted/50 group-hover:bg-primary/10 transition-colors", color.replace('text-', 'bg-').replace('500', '500/10'))}>
            <Icon className={cn("h-3.5 w-3.5", color)} />
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] group-hover:text-foreground transition-colors">
            {title}
          </p>
        </div>
        
        <div>
          <div className={cn("text-lg sm:text-xl font-black font-code transition-all group-hover:translate-x-0.5", color)}>
            {typeof value === 'string' && value.includes(' Kz') ? (
              <>
                {value.split(' ')[0]}
                <span className="text-[10px] ml-1 uppercase opacity-60">Kz</span>
              </>
            ) : value}
          </div>
          {subtitle && (
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5 opacity-70">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <Icon className="absolute -right-4 -bottom-4 h-16 w-16 text-muted/5 transition-transform group-hover:scale-110 group-hover:rotate-6 duration-700 pointer-events-none" />
    </Card>
  );
}