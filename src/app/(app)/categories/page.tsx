'use client';

import { useEffect, useState } from 'react';

import type { Category } from '@/types/models';
import { Alert } from '@/lib/alert';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createCategory, deleteCategory, fetchCategories } from '@/store/slices/categoriesSlice';
import { usePermissions } from '@/hooks/usePermissions';
import { PageBody, PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import { FormControl, Input } from '@/components/ui/Field';
import { EmptyState } from '@/components/ui/Display';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ListRow, RowIcon } from '@/components/ui/ListRow';
import { FolderIcon, PlusIcon } from '@/components/icons/LineIcons';

export default function CategoriesPage() {
  const { can } = usePermissions();
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((state) => state.categories);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const onDelete = async (category: Category) => {
    try {
      await dispatch(deleteCategory(category.id)).unwrap();
    } catch {
      Alert.alert('Gagal', 'Kategori tidak bisa dihapus (mungkin masih dipakai produk).');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <PageHeader
        title="Kategori"
        subtitle={`${items.length} kategori produk`}
        right={
          can('categories.create') ? (
            <Button size="sm" leftIcon={<PlusIcon size={14} />} onClick={() => setFormOpen(true)}>
              Baru
            </Button>
          ) : undefined
        }
      />
      <PageBody>
        <div className="mx-auto max-w-[760px] space-y-2.5">
          {items.length === 0 ? (
            status === 'loading' ? (
              <LoadingBlock label="Memuat kategori..." />
            ) : (
              <EmptyState
                icon={FolderIcon}
                title="Belum Ada Kategori"
                description="Kategori membantu mengelompokkan produk (mis. Makanan, Minuman, Rokok) supaya lebih rapi dicari."
                actionLabel={can('categories.create') ? '+ Buat Kategori' : undefined}
                onAction={() => setFormOpen(true)}
              />
            )
          ) : (
            items.map((item, index) => (
              <ListRow
                key={item.id}
                index={index}
                icon={
                  <RowIcon className="bg-warning-50 text-warning-600">
                    <FolderIcon size={18} />
                  </RowIcon>
                }
                title={item.categoryName}
                subtitle={`${item.categoryCode}${item.parentCategoryName ? ` · sub dari ${item.parentCategoryName}` : ''}`}
                right={
                  can('categories.delete') ? (
                    <Button variant="ghost" size="sm" className="text-error-600 hover:bg-error-50" onClick={() => setDeleteTarget(item)}>
                      Hapus
                    </Button>
                  ) : null
                }
              />
            ))
          )}
        </div>
      </PageBody>

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)}>
        <NewCategoryForm onDone={() => setFormOpen(false)} onCancel={() => setFormOpen(false)} />
      </Modal>
      <AlertDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus kategori?"
        description={`"${deleteTarget?.categoryName}" akan dihapus.`}
        confirmText="Hapus"
        isDanger
        onConfirm={() => deleteTarget && onDelete(deleteTarget)}
      />
    </>
  );
}

function NewCategoryForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const dispatch = useAppDispatch();
  const [categoryCode, setCategoryCode] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryCode || !categoryName) return;
    setSubmitting(true);
    try {
      await dispatch(createCategory({ categoryCode, categoryName })).unwrap();
      onDone();
    } catch {
      Alert.alert('Gagal', 'Kategori tidak bisa dibuat.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <p className="mb-4 text-lg font-bold text-ink">Kategori Baru</p>
      <FormControl label="Kode kategori" isRequired>
        <Input autoFocus value={categoryCode} onChange={(e) => setCategoryCode(e.target.value.toUpperCase())} placeholder="mis. MKN" />
      </FormControl>
      <FormControl label="Nama kategori" isRequired>
        <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="mis. Makanan" />
      </FormControl>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} className="min-w-[90px]">
          Batal
        </Button>
        <Button type="submit" loading={submitting} disabled={!categoryCode || !categoryName} className="min-w-[90px]">
          Simpan
        </Button>
      </div>
    </form>
  );
}
