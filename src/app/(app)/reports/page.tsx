'use client';

import { useEffect, useState } from 'react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSalesSummary } from '@/store/slices/reportsSlice';
import { cn } from '@/lib/cn';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { KpiCard } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { BarChartIcon, CalendarIcon, ReceiptIcon, RegisterIcon, TrendingIcon, TrophyIcon } from '@/components/icons/LineIcons';

type RangeOption = 7 | 30;

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function rangeParams(days: RangeOption) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: isoDate(from), to: isoDate(to) };
}

function prettyDate(iso: string) {
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ReportsPage() {
  const dispatch = useAppDispatch();
  const [range, setRange] = useState<RangeOption>(7);
  const summary = useAppSelector((state) => state.reports.summary);

  useEffect(() => {
    dispatch(fetchSalesSummary(rangeParams(range)));
  }, [dispatch, range]);

  const switcher = (
    <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
      {([7, 30] as RangeOption[]).map((days) => (
        <button
          key={days}
          type="button"
          onClick={() => setRange(days)}
          className={cn(
            'cursor-pointer rounded-md px-4 py-1.5 text-[13px] font-semibold transition',
            range === days ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-2 hover:text-ink',
          )}
        >
          {days} Hari
        </button>
      ))}
    </div>
  );

  const maxRevenue = Math.max(1, ...(summary?.topSellers.map((s) => s.totalRevenue) ?? [1]));
  const average = summary && summary.orderCount > 0 ? summary.grossSales / summary.orderCount : 0;

  return (
    <>
      <PageHeader
        title="Laporan"
        phoneTitle="Laporan Penjualan"
        subtitle={summary ? `Periode ${prettyDate(summary.from)} — ${prettyDate(summary.to)}` : 'Ringkasan penjualan'}
        right={<span className="hidden tab:block">{switcher}</span>}
      />
      <PageBody className="space-y-4">
        <div className="tab:hidden">{switcher}</div>
        {!summary ? (
          <LoadingBlock />
        ) : (
          <div className="mx-auto max-w-[1080px] space-y-5">
            <div className="grid gap-3 sm:grid-cols-3 tab:gap-4">
              <KpiCard icon={RegisterIcon} iconClass="bg-success-50 text-success-600" label="Total Penjualan" value={`Rp ${summary.grossSales.toLocaleString('id-ID')}`} />
              <KpiCard icon={ReceiptIcon} iconClass="bg-primary-50 text-primary-600" label="Jumlah Transaksi" value={String(summary.orderCount)} />
              <KpiCard icon={TrendingIcon} iconClass="bg-info-50 text-info-700" label="Rata-rata per Transaksi" value={`Rp ${Math.round(average).toLocaleString('id-ID')}`} />
            </div>

            <p className="flex items-center gap-1.5 text-sm text-ink-3 tab:hidden">
              <CalendarIcon size={14} /> Periode: {prettyDate(summary.from)} — {prettyDate(summary.to)}
            </p>

            <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
              <div className="flex items-center gap-2 border-b border-line px-5 py-4">
                <span className="flex size-8 items-center justify-center rounded-md bg-warning-50 text-warning-600">
                  <TrophyIcon size={16} />
                </span>
                <p className="text-base font-bold text-ink">Produk Terlaris</p>
              </div>
              {summary.topSellers.length === 0 ? (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                    <BarChartIcon size={22} />
                  </span>
                  <p className="max-w-sm text-ink-2">Belum ada penjualan di periode ini. Data akan muncul begitu ada transaksi baru.</p>
                </div>
              ) : (
                summary.topSellers.map((seller, index) => (
                  <div key={seller.productId} className="flex items-center gap-4 border-b border-gray-100 px-5 py-3.5 last:border-0">
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                        index === 0 ? 'bg-warning-100 text-warning-700' : index < 3 ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-ink-2',
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate font-semibold text-ink">{seller.productName}</p>
                        <p className="shrink-0 font-bold text-success-700">Rp {seller.totalRevenue.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="mt-1.5 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full animate-[reveal-x_0.8s_ease-out_both] rounded-full bg-gradient-to-r from-primary-500 to-info-600"
                            style={{ width: `${(seller.totalRevenue / maxRevenue) * 100}%`, animationDelay: `${index * 80}ms` }}
                          />
                        </div>
                        <span className="w-20 shrink-0 text-right text-[12.5px] text-ink-3">{seller.totalQuantity} terjual</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </PageBody>
    </>
  );
}
