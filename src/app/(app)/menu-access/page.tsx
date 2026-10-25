'use client';

import { useEffect, useMemo, useState } from 'react';

import { Alert } from '@/lib/alert';
import { cn } from '@/lib/cn';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMenuAccess, saveMenuAccess } from '@/store/slices/accessSlice';
import { MENU_CATALOG, MENU_KEYS } from '@/navigation/menu';
import type { MenuKey } from '@/navigation/menu';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { CheckIcon, LockIcon } from '@/components/icons/LineIcons';

const ROLES = [
  { code: 'PRODUCT', label: 'Produk', hint: 'Admin produk — mengelola katalog, harga & stok' },
  { code: 'GUDANG', label: 'Gudang', hint: 'Penerimaan barang & stok' },
  { code: 'KASIR', label: 'Kasir', hint: 'Melayani penjualan di kasir' },
] as const;

/** "Beranda" selalu tampil supaya setiap staf punya halaman awal. */
const CONFIGURABLE = MENU_KEYS.filter((key) => key !== 'dashboard');

/** Kepala Toko menentukan menu & aksi untuk tiap role staf. */
export default function MenuAccessPage() {
  const dispatch = useAppDispatch();
  const { matrix, matrixStatus } = useAppSelector((state) => state.access);
  const user = useAppSelector((state) => state.auth.user);
  const isKepalaToko = !!user?.roles.some((r) => r.roleCode === 'KEPALA_TOKO');
  const [role, setRole] = useState<(typeof ROLES)[number]['code']>('KASIR');
  const [draft, setDraft] = useState<Record<string, MenuKey[]>>({});
  const [draftActions, setDraftActions] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isKepalaToko) dispatch(fetchMenuAccess());
  }, [dispatch, isKepalaToko]);

  useEffect(() => {
    if (!matrix) return;
    setDraft(matrix.roles as Record<string, MenuKey[]>);
    setDraftActions(matrix.roleActions ?? {});
  }, [matrix]);

  const current = useMemo(() => draft[role] ?? [], [draft, role]);
  const currentActions = useMemo(() => draftActions[role] ?? [], [draftActions, role]);
  const dirty = useMemo(() => {
    const same = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));
    return !same(current, (matrix?.roles[role] ?? []) as MenuKey[]) || !same(currentActions, matrix?.roleActions?.[role] ?? []);
  }, [current, currentActions, matrix, role]);

  const toggleAction = (action: string) =>
    setDraftActions((prev) => {
      const list = new Set(prev[role] ?? []);
      if (list.has(action)) list.delete(action);
      else list.add(action);
      return { ...prev, [role]: [...list] };
    });

  const toggle = (key: MenuKey, value: boolean) => {
    setDraft((prev) => {
      const list = new Set(prev[role] ?? []);
      if (value) list.add(key);
      else list.delete(key);
      return { ...prev, [role]: MENU_KEYS.filter((k) => list.has(k)) };
    });
    // Menu yang disembunyikan tidak menyimpan aksi.
    if (!value) setDraftActions((prev) => ({ ...prev, [role]: (prev[role] ?? []).filter((a) => !a.startsWith(`${key}.`)) }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await dispatch(saveMenuAccess({ roleCode: role, menus: current, actions: currentActions })).unwrap();
      Alert.alert('Tersimpan', `Menu untuk ${ROLES.find((r) => r.code === role)?.label} sudah diperbarui.`);
    } catch (error) {
      Alert.alert('Gagal', typeof error === 'string' ? error : 'Pengaturan menu gagal disimpan.');
    } finally {
      setSaving(false);
    }
  };

  if (!isKepalaToko) {
    return (
      <>
        <PageHeader title="Hak Akses Menu" backHref="/settings" />
        <EmptyState icon={LockIcon} title="Khusus Kepala Toko" description="Hak akses menu dan aksi untuk setiap role hanya bisa diatur oleh Kepala Toko." />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Hak Akses Menu"
        subtitle="Menu & aksi untuk Produk, Gudang, Kasir"
        backHref="/settings"
        right={
          <Button size="sm" onClick={onSave} loading={saving} disabled={!dirty} className="hidden tab:inline-flex">
            {dirty ? 'Simpan Perubahan' : 'Tersimpan'}
          </Button>
        }
      />
      <PageBody>
        <div className="mx-auto max-w-[860px] space-y-4 pb-20 tab:pb-0">
          <div className="flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary-600">
              <LockIcon size={18} />
            </span>
            <p className="text-sm text-ink-2">
              Pilih menu yang boleh dilihat tiap role, lalu atur aksinya (Tambah, Ubah, Hapus, dll.) di bawah setiap menu. Tanpa aksi, staf hanya bisa
              melihat. Kepala Toko selalu punya akses penuh.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {ROLES.map((item) => {
              const active = item.code === role;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setRole(item.code)}
                  className={cn(
                    'cursor-pointer rounded-xl border-[1.5px] p-3 text-left transition',
                    active ? 'border-primary-600 bg-primary-600 text-white shadow-md' : 'border-line bg-white hover:border-primary-200',
                  )}
                >
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className={cn('text-[12.5px]', active ? 'text-white/75' : 'text-ink-3')}>{(draft[item.code] ?? []).length} menu</p>
                </button>
              );
            })}
          </div>
          <p className="text-[12.5px] text-ink-3">{ROLES.find((r) => r.code === role)?.hint}</p>

          <div className="overflow-hidden rounded-2xl border border-line bg-white">
            {matrixStatus === 'loading' && !matrix ? (
              <LoadingBlock label="Memuat pengaturan..." />
            ) : (
              CONFIGURABLE.map((key) => {
                const entry = MENU_CATALOG[key];
                const Icon = entry.icon;
                const enabled = current.includes(key);
                const defs = matrix?.actions?.[key] ?? [];
                return (
                  <div key={`${role}-${key}`} className="border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span className={cn('flex size-[38px] items-center justify-center rounded-lg', enabled ? entry.tint : 'bg-gray-100 text-gray-400')}>
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn('text-sm font-semibold', enabled ? 'text-ink' : 'text-ink-3')}>{entry.label}</p>
                        <p className="truncate text-[12.5px] text-ink-3">{entry.hint}</p>
                      </div>
                      <Switch value={enabled} onChange={(value) => toggle(key, value)} label={entry.label} />
                    </div>
                    {enabled ? (
                      <div className="animate-fade-in bg-gray-25 px-4 pt-1 pb-3.5 pl-[66px]">
                        {defs.length ? (
                          <>
                            <p className="mb-1.5 text-[11px] font-bold tracking-[0.08em] text-ink-3">AKSI DIIZINKAN</p>
                            <div className="flex flex-wrap gap-1.5">
                              {defs.map((def) => {
                                const code = `${key}.${def.code}`;
                                const on = currentActions.includes(code);
                                return (
                                  <button
                                    key={code}
                                    type="button"
                                    role="checkbox"
                                    aria-checked={on}
                                    onClick={() => toggleAction(code)}
                                    className={cn(
                                      'flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12.5px] font-semibold transition',
                                      on ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-line bg-white text-ink-2 hover:border-primary-200',
                                    )}
                                  >
                                    <span className={cn('flex size-3.5 items-center justify-center rounded-[4px] border', on ? 'border-primary-600 bg-primary-600 text-white' : 'border-gray-300')}>
                                      {on ? <CheckIcon size={9} /> : null}
                                    </span>
                                    {def.label}
                                  </button>
                                );
                              })}
                            </div>
                            {!defs.some((def) => currentActions.includes(`${key}.${def.code}`)) ? <p className="mt-1.5 text-[12.5px] text-ink-3">Hanya bisa melihat</p> : null}
                          </>
                        ) : (
                          <p className="text-[12.5px] text-ink-3">Menu ini hanya untuk dilihat</p>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </PageBody>
      <div className="fixed inset-x-0 bottom-[76px] z-30 border-t border-line bg-white p-3 tab:hidden">
        <Button fullWidth onClick={onSave} loading={saving} disabled={!dirty}>
          {dirty ? 'Simpan Perubahan' : 'Tidak ada perubahan'}
        </Button>
      </div>
    </>
  );
}
