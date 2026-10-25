'use client';

import { useState } from 'react';

import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/cn';
import { StockTab } from '@/features/inventory/StockTab';
import { MovementsTab } from '@/features/inventory/MovementsTab';
import { OpnameTab } from '@/features/inventory/OpnameTab';
import { BadStockTab } from '@/features/inventory/BadStockTab';

type TabKey = 'stock' | 'movements' | 'opname' | 'badStock';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'stock', label: 'Stok' },
  { key: 'movements', label: 'Mutasi' },
  { key: 'opname', label: 'Opname' },
  { key: 'badStock', label: 'Bad Stock' },
];

/** Inventori: stok, mutasi, stok opname, dan bad stock. */
export default function InventoryPage() {
  const [tab, setTab] = useState<TabKey>('stock');

  return (
    <>
      <PageHeader title="Inventori" subtitle="Stok, mutasi, opname & bad stock" />
      <PageBody className="space-y-4">
        <div role="tablist" className="grid grid-cols-4 gap-1 rounded-xl bg-gray-100 p-1 tab:inline-grid tab:w-auto tab:min-w-[440px]">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={t.key === tab}
              onClick={() => setTab(t.key)}
              className={cn(
                'cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold transition',
                t.key === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-2 hover:text-ink',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div key={tab} className="animate-fade-in">
          {tab === 'stock' ? <StockTab /> : null}
          {tab === 'movements' ? <MovementsTab /> : null}
          {tab === 'opname' ? <OpnameTab /> : null}
          {tab === 'badStock' ? <BadStockTab /> : null}
        </div>
      </PageBody>
    </>
  );
}
