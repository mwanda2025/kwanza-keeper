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

/**
 * Reusable StatCard with soft shadows and modern hover/tap effects.
 */
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
      "p-4 bg-card/50 backdrop-blur-xl border-muted shadow-md hover:shadow-xl hover:border-primary/20 transition-all active:scale-[0.98] group overflow-hidden relative rounded-xl",
      className
    )}>
      <div className="relative z-10 flex flex-col justify-between h-full space-y-2">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 group-hover:text-primary transition-colors">
            {title}
          </p>
          <div className={cn("text-lg sm:text-xl font-black font-code transition-all group-hover:translate-x-1 origin-left", color)}>
            {typeof value === 'string' && value.includes(' Kz') ? (
              <>
                {value.split(' ')[0]}
                <span className="text-[10px] ml-1 uppercase opacity-70">Kz</span>
              </>
            ) : value}
          </div>
        </div>
        {subtitle && (
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider mt-1 opacity-80">
            {subtitle}
          </p>
        )}
      </div>
      <Icon className="absolute -right-3 -bottom-3 h-14 w-14 text-muted/10 transition-transform group-hover:scale-125 group-hover:rotate-12 duration-700 pointer-events-none" />
    </Card>
  );
}
