'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  slot: string;
  format?: 'auto' | 'rectangle' | 'horizontal';
  className?: string;
}

export function AdSlot({ slot, format = 'auto', className }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense push failed', error);
    }
  }, [client, slot]);

  if (!client) {
    return (
      <div className={`card-surface flex min-h-[120px] items-center justify-center text-xs text-muted ${className ?? ''}`}>
        Espacio publicitario ({slot})
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle block min-h-[120px] w-full"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
