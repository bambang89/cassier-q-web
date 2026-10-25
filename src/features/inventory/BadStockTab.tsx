'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import * as inventoryApi from '@/api/inventoryApi';
import { apiErrorMessage } from '@/api/errors';
import type { BadStockItem, BadStockReport, BadStockStatus } from '@/types/models';
import { useAppSelector } from '@/store/hooks';
import { usePermissions } from '@/hooks/usePermissions';
import { useMenuAccess } from '@/navigation/menu';
import { Alert } from '@/lib/alert';
import type { AlertButton } from '@/lib/alert';
import { Badge, EmptyState } from '@/components/ui/Display';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Field';
import { LoadingBlock } from '@/components/ui/Spinner';
import { AlertTriangleIcon, PlusIcon } from '@/components/icons/LineIcons';
import { BS_STATUS, REASONS, dateTime, qty, reasonLabel, rupiah } from './labels';
import { FilterChips, HeroCard } from './shared';

type Filter = 'ALL' | BadStockStatus;

const thisMonth = () => {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
  };
};

/** Bad stock: kerugian bulan ini, pengaturan persetujuan, dan laporan beserta tindak lanjutnya. */
export function BadStockTab() {
  const router = useRouter();
  const { can } = usePermissions();
  const { isManager } = useMenuAccess();
  const user = useAppSelector((state) => state.auth.user);
  const isKepalaToko = !!user?.roles.some((r) => r.roleCode === 'KEPALA_TOKO');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [items, setItems] = useState<BadStockItem[]>([]);
  const [report, setReport] = useState<BadStockReport | null>(null);
  const [requireApproval, setRequireApproval] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = thisMonth();
      const [list, monthReport, settings] = await Promise.all([
        inventoryApi.fetchBadStock(),
        inventoryApi.fetchBadStockReport(from, to),
        inventoryApi.fetchBadStockSettings(),
      ]);
      setItems(list);
      setReport(monthReport);
      setRequireApproval(settings.requireApproval);
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Data bad stock gagal dimuat.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleApproval = async (value: boolean) => {
    setRequireApproval(value);
    try {
      await inventoryApi.updateBadStockSettings(value);
    } catch (error) {
      setRequireApproval(!value);
      Alert.alert('Gagal', apiErrorMessage(error, 'Pengaturan tidak bisa disimpan.'));
    }
  };

  const act = async (item: BadStockItem, action: 'approve' | 'return' | 'dispose' | 'cancel') => {
    try {
      await inventoryApi.actOnBadStock(item.id, action);
      load();
    } catch (error) {
      Alert.alert('Gagal', apiErrorMessage(error, 'Tindakan tidak bisa diproses.'));
    }
  };

  const actionsFor = (item: BadStockItem): AlertButton[] => {
    const buttons: AlertButton[] = [];
    if (item.status === 'PENDING' && isManager) {
      buttons.push({ text: 'Setujui (kurangi stok)', onPress: () => act(item, 'approve') });
      buttons.push({ text: 'Tolak', style: 'destructive', onPress: () => act(item, 'cancel') });
    }
    if (item.status === 'QUARANTINED') {
      if (can('inventory.bad_stock_resolve')) {
        buttons.push({ text: 'Sudah diretur ke supplier', onPress: () => act(item, 'return') });
        buttons.push({ text: 'Sudah dimusnahkan', onPress: () => act(item, 'dispose') });
      }
      if (isManager) buttons.push({ text: 'Batalkan (kembalikan stok)', style: 'destructive', onPress: () => act(item, 'cancel') });
    }
    return buttons;
  };

  const openActions = (item: BadStockItem) => {
    const buttons = actionsFor(item);
    if (buttons.length === 0) return;
    Alert.alert(item.productName, `${qty(item.quantity)} ${item.unitName} · ${reasonLabel(item.reason)}`, [
      { text: 'Tutup', style: 'cancel' },
      ...buttons,
    ]);
  };

  const visible = filter === 'ALL' ? items : items.filter((i) => i.status === filter);
  const countOf = (status: BadStockStatus) => items.filter((i) => i.status === status).length;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
        <HeroCard title="KERUGIAN BAD STOCK BULAN INI" value={rupiah(report?.totalValue ?? 0)}>
          <p className="text-[12.5px] text-white/70">
            {report?.records ?? 0} laporan
            {report?.byReason.length ? ` · terbanyak: ${reasonLabel(report.byReason[0].reason)} (${rupiah(report.byReason[0].value)})` : ''}
          </p>
          {report?.pending ? <p className="mt-1 text-[12.5px] font-semibold text-warning-200">{report.pending} laporan menunggu persetujuan</p> : null}
        </HeroCard>
        <div className="flex flex-col gap-3">
          {isKepalaToko ? (
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-line bg-white p-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-ink">Perlu persetujuan Kepala Toko</p>
                <p className="text-[12.5px] text-ink-3">
                  {requireApproval ? 'Laporan staf menunggu disetujui sebelum stok dikurangi' : 'Stok langsung dikurangi saat staf mencatat'}
                </p>
              </div>
              <Switch value={requireApproval} onChange={toggleApproval} label="Perlu persetujuan" />
            </div>
          ) : null}
          {can('inventory.bad_stock') ? (
            <Button leftIcon={<PlusIcon size={16} />} onClick={() => router.push('/inventory/bad-stock/new')}>
              Catat Bad Stock
            </Button>
          ) : null}
        </div>
      </div>

      <FilterChips<Filter>
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'ALL', label: 'Semua', count: items.length },
          { value: 'PENDING', label: 'Menunggu', count: countOf('PENDING') },
          { value: 'QUARANTINED', label: 'Dipisahkan', count: countOf('QUARANTINED') },
          { value: 'RETURNED', label: 'Diretur', count: countOf('RETURNED') },
          { value: 'DISPOSED', label: 'Dimusnahkan', count: countOf('DISPOSED') },
          { value: 'CANCELLED', label: 'Dibatalkan', count: countOf('CANCELLED') },
        ]}
      />

      {visible.length === 0 ? (
        loading ? (
          <LoadingBlock />
        ) : (
          <EmptyState icon={AlertTriangleIcon} title="Tidak ada bad stock" description="Barang rusak, kedaluwarsa, atau hilang yang dicatat akan tampil di sini." />
        )
      ) : (
        <div className="grid gap-2.5 lg:grid-cols-2">
          {visible.map((item) => {
            const status = BS_STATUS[item.status];
            const emoji = REASONS.find((r) => r.value === item.reason)?.emoji ?? '📦';
            const hasActions = actionsFor(item).length > 0;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openActions(item)}
                className={`space-y-2 rounded-xl border border-line bg-white p-3.5 text-left transition ${hasActions ? 'cursor-pointer hover:border-primary-200 hover:shadow-card' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-warning-50 text-lg">
                    {item.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.photoUrl} alt="" className="size-full object-cover" />
                    ) : (
                      emoji
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{item.productName}</p>
                    <p className="truncate text-[12.5px] text-ink-2">
                      {qty(item.quantity)} {item.unitName} · {reasonLabel(item.reason)}
                      {item.costValue !== null ? ` · ${rupiah(item.costValue)}` : ''}
                    </p>
                  </div>
                  <Badge variant={status.tone}>{status.label}</Badge>
                </div>
                {item.notes ? <p className="line-clamp-2 text-[12.5px] text-ink-3 italic">“{item.notes}”</p> : null}
                <p className="text-[12px] text-ink-3">
                  Dicatat {item.reportedBy ?? '-'} · {dateTime(item.createdAt)}
                  {item.supplierName ? ` · ke ${item.supplierName}` : ''}
                  {hasActions ? <span className="ml-1 font-semibold text-primary-600">· Tindak lanjuti →</span> : null}
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
