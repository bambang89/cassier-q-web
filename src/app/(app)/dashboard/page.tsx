'use client';

import { useEffect, useState } from 'react';

import { fetchSalesSummary } from '@/api/reportsApi';
import type { SalesSummary } from '@/types/models';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchStoreProfile } from '@/store/slices/storeProfileSlice';
import { cn } from '@/lib/cn';
import { formatRupiah } from '@/lib/pos';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { Card, KpiCard } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import {
  BarChartIcon,
  BoxIcon,
  LightbulbIcon,
  ReceiptIcon,
  RegisterIcon,
  TrendDownIcon,
  TrendingIcon,
  TrendUpIcon,
} from '@/components/icons/LineIcons';

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function lastSevenDates(): Date[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date;
  });
}

async function fetchLastSevenDays(): Promise<SalesSummary[]> {
  return Promise.all(
    lastSevenDates().map((date) => {
      const iso = isoDate(date);
      return fetchSalesSummary({ from: iso, to: iso });
    }),
  );
}

function percentDelta(today: number, yesterday: number): number | null {
  if (yesterday <= 0) return null;
  return ((today - yesterday) / yesterday) * 100;
}

function mergeTopSellers(days: SalesSummary[], limit = 4) {
  const byProduct = new Map<string, { productId: string; productName: string; totalQuantity: number; totalRevenue: number }>();
  for (const day of days) {
    for (const seller of day.topSellers) {
      const existing = byProduct.get(seller.productId);
      if (existing) {
        existing.totalQuantity += seller.totalQuantity;
        existing.totalRevenue += seller.totalRevenue;
      } else {
        byProduct.set(seller.productId, { ...seller });
      }
    }
  }
  return Array.from(byProduct.values())
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);
}

function todayLabel(): string {
  return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' });
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const storeProfile = useAppSelector((state) => state.storeProfile.profile);
  const [days, setDays] = useState<SalesSummary[] | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setDays(await fetchLastSevenDays());
    } catch {
      // Biarkan `days` tetap null — UI menampilkan state kosong, bukan data palsu.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    dispatch(fetchStoreProfile());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const storeName = storeProfile?.storeName ?? user?.roles?.[0]?.storeName ?? '-';
  const firstName = user?.name?.split(' ')[0] ?? 'Kasir';

  const today = days?.[6] ?? null;
  const yesterday = days?.[5] ?? null;
  const todayUnitsSold = today ? today.topSellers.reduce((sum, s) => sum + s.totalQuantity, 0) : 0;
  const yesterdayUnitsSold = yesterday ? yesterday.topSellers.reduce((sum, s) => sum + s.totalQuantity, 0) : 0;
  const avgToday = today && today.orderCount > 0 ? today.grossSales / today.orderCount : 0;
  const weeklyTopSellers = days ? mergeTopSellers(days) : [];
  const salesDelta = today && yesterday ? percentDelta(today.grossSales, yesterday.grossSales) : null;
  const orderDelta = today && yesterday ? percentDelta(today.orderCount, yesterday.orderCount) : null;
  const unitsDelta = today && yesterday ? percentDelta(todayUnitsSold, yesterdayUnitsSold) : null;
  const dayLabels = lastSevenDates().map((d) => d.toLocaleDateString('id-ID', { weekday: 'short' }).replace('.', ''));

  const insightText = today
    ? `Hari ini tercatat ${today.orderCount} transaksi dengan total ${formatRupiah(today.grossSales)}. ${
        weeklyTopSellers.length > 0 ? `${weeklyTopSellers[0].productName} jadi produk terlaris minggu ini.` : ''
      }`
    : '';

  const refresh = (
    <Button variant="secondary" size="sm" onClick={load} loading={loading}>
      Muat ulang
    </Button>
  );

  return (
    <>
      <PageHeader
        title={`Selamat datang, ${firstName}`}
        subtitle="Ringkasan performa bisnis hari ini"
        phoneTitle={`Halo, ${firstName} 👋`}
        phoneSubtitle={`${storeName} · ${todayLabel()}`}
        right={<span className="hidden tab:inline-flex">{refresh}</span>}
      />

      <PageBody className="space-y-3 bg-canvas tab:space-y-0 tab:bg-gray-25 tab:px-6 tab:py-[22px]">
        {/* Layar lebar: 4 KPI sejajar */}
        <div className="hidden gap-4 tab:grid tab:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Penjualan Hari Ini', value: today ? formatRupiah(today.grossSales) : '—', icon: RegisterIcon, cls: 'bg-success-50 text-success-600', delta: salesDelta },
            { label: 'Transaksi', value: today ? String(today.orderCount) : '—', icon: ReceiptIcon, cls: 'bg-primary-50 text-primary-600', delta: orderDelta },
            { label: 'Rata-rata', value: today ? formatRupiah(avgToday) : '—', icon: TrendingIcon, cls: 'bg-info-50 text-info-700', delta: undefined },
            { label: 'Produk Terjual', value: today ? String(todayUnitsSold) : '—', icon: BoxIcon, cls: 'bg-warning-50 text-warning-600', delta: unitsDelta },
          ].map((item, index) => (
            <div key={item.label} className="animate-fade-in" style={{ animationDelay: `${index * 60}ms` }}>
              <KpiCard label={item.label} value={item.value} icon={item.icon} iconClass={item.cls} delta={item.delta} />
            </div>
          ))}
        </div>

        {/* HP: kartu hero + 2 KPI */}
        <div className="space-y-3 tab:hidden">
          <div className="relative min-h-[150px] animate-[pop-in_0.4s_ease-out_both] overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0B1F33_0%,#123E7A_60%,#2563EB_100%)] p-5">
            <div className="absolute -top-[50px] -right-10 size-[170px] rounded-full bg-[rgba(96,165,250,0.22)]" />
            <div className="relative flex items-center justify-between">
              <p className="text-sm font-medium text-white/75">Penjualan Hari Ini</p>
              <span className="flex size-[34px] items-center justify-center rounded-lg bg-white/15 text-white">
                <RegisterIcon size={17} />
              </span>
            </div>
            <p className="relative mt-2 truncate text-[32px] leading-10 font-bold text-white">
              {today ? formatRupiah(today.grossSales) : '—'}
            </p>
            <div className="relative mt-3 flex items-center justify-between">
              {salesDelta !== null ? (
                <span
                  className={cn(
                    'flex items-center gap-1 rounded-full px-2 py-1 text-[13px] font-bold',
                    salesDelta >= 0 ? 'bg-[rgba(16,185,129,0.18)] text-[#6EE7B7]' : 'bg-[rgba(239,68,68,0.18)] text-[#FCA5A5]',
                  )}
                >
                  {salesDelta >= 0 ? <TrendUpIcon size={12} /> : <TrendDownIcon size={12} />}
                  {`${salesDelta >= 0 ? '+' : ''}${salesDelta.toFixed(1)}% vs kemarin`}
                </span>
              ) : (
                <span />
              )}
              <span className="text-[13px] text-white/70">{`Rata-rata ${today ? formatRupiah(avgToday) : '—'}`}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <KpiCard label="Transaksi" value={today ? String(today.orderCount) : '—'} icon={ReceiptIcon} iconClass="bg-primary-50 text-primary-600" delta={orderDelta} />
            <KpiCard label="Produk Terjual" value={today ? String(todayUnitsSold) : '—'} icon={BoxIcon} iconClass="bg-warning-50 text-warning-600" delta={unitsDelta} />
          </div>
        </div>

        {today && today.orderCount > 0 ? (
          <div className="flex animate-fade-in items-start gap-3.5 rounded-xl bg-[linear-gradient(120deg,#0B1F33_0%,#0E3355_55%,#0F766E_100%)] p-5 tab:mt-4 tab:rounded-lg">
            <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-white/15 text-white">
              <LightbulbIcon size={17} />
            </span>
            <div className="flex-1">
              <p className="mb-1 text-[11px] font-bold tracking-[0.6px] text-[#8FE0C2] uppercase">Insight cassier-Q</p>
              <p className="text-[13.5px] leading-[21.6px] text-[#E4ECF6]">{insightText}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 tab:mt-[18px] lg:flex-row lg:items-start lg:gap-[18px]">
          <div className="animate-fade-in lg:flex-[1.6]">
            <Card>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-ink">Grafik Penjualan</h3>
                  <p className="mt-px text-[13px] text-ink-3">7 hari terakhir</p>
                </div>
                <span className="flex size-8 items-center justify-center rounded-md bg-primary-50 text-primary-600">
                  <BarChartIcon size={16} />
                </span>
              </div>
              {days ? (
                <SalesTrendChart values={days.map((d) => d.grossSales)} labels={dayLabels} />
              ) : (
                <div className="flex h-40 items-center justify-center text-sm text-ink-3">
                  {loading ? 'Memuat data...' : 'Data penjualan belum bisa dimuat.'}
                </div>
              )}
            </Card>
          </div>

          <div className="animate-fade-in lg:flex-1">
            <Card>
              <h3 className="mb-2 text-base font-bold text-ink">Produk Terlaris</h3>
              {weeklyTopSellers.length === 0 ? (
                <p className="py-5 text-center text-sm text-ink-3">Belum ada penjualan minggu ini.</p>
              ) : (
                weeklyTopSellers.map((seller, index) => (
                  <div
                    key={seller.productId}
                    className="flex animate-slide-in items-center gap-2 border-b border-line py-2 last:border-b-0"
                    style={{ animationDelay: `${420 + index * 60}ms` }}
                  >
                    <span
                      className={cn(
                        'flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] font-bold',
                        index === 0 ? 'bg-warning-100 text-warning-700' : 'bg-gray-100 text-ink',
                      )}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{seller.productName}</p>
                      <p className="text-[13px] text-ink-3">{seller.totalQuantity}x terjual</p>
                    </div>
                    <p className="text-sm font-bold text-ink">{formatRupiah(seller.totalRevenue)}</p>
                  </div>
                ))
              )}
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}

function SalesTrendChart({ values, labels }: { values: number[]; labels: string[] }) {
  const width = 620;
  const height = 160;
  const padding = 8;
  const max = Math.max(...values, 1);
  const points = values.map((v, i) => ({
    x: padding + (i * (width - padding * 2)) / (values.length - 1),
    y: padding + (1 - v / max) * (height - padding * 2),
  }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height} L ${points[0].x},${height} Z`;

  return (
    <div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="text-primary-600">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.18} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* Grafik "tergambar" dari kiri ke kanan seperti di aplikasi mobile. */}
        <g className="animate-[reveal-x_0.9s_ease-out_0.25s_both]">
          <path d={areaPath} fill="url(#areaGrad)" />
          <path d={linePath} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
      <div className="mt-1 flex justify-between">
        {labels.map((label, i) => (
          <span key={`${label}-${i}`} className="flex-1 text-center text-[13px] text-ink-3 capitalize">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
