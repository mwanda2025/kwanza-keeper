"use client";

import React, { useEffect, useState } from 'react';
import { formatKwanza } from '@/lib/formatters';

interface FloatingAmountProps {
  amount: number;
  onComplete: () => void;
}

/**
 * A micro-animation component that shows a floating currency amount.
 * Useful for immediate visual feedback after adding an expense.
 */
export function FloatingAmount({ amount, onComplete }: FloatingAmountProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
      <div className="animate-float-up text-primary font-black font-code text-3xl shadow-2xl bg-background/40 backdrop-blur-md px-6 py-2 rounded-full border border-primary/20">
        +{formatKwanza(amount)}
      </div>
    </div>
  );
}
