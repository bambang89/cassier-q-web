'use client';

import type { PublicProduct } from '@/types/storefront';
import { formatRupiah } from '@/utils/format';
import { Select } from '@/components/ui/Field';
import { Labeled } from '@/features/storefront/components/inspector/fields';
import { ProductPicker } from '@/features/storefront/components/inspector/ProductPicker';
import { ListField } from '@/features/storefront/components/inspector/ListField';
import type { InspectorListItem, FieldDef } from '@/features/storefront/types';
import { SimpleField } from '@/features/storefront/components/inspector/SimpleField';

export function Field({
  field,
  value,
  onSet,
  products,
  categories,
}: {
  field: FieldDef;
  value: unknown;
  onSet: (v: unknown) => void;
  products: PublicProduct[];
  categories: { id: string; name: string }[];
}) {
  switch (field.kind) {
    case 'category':
      return (
        <Labeled label={field.label}>
          <Select value={String(value || '')} onChange={onSet} placeholder="Pilih kategori…" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
        </Labeled>
      );
    case 'product':
      return (
        <Labeled label={field.label}>
          <Select value={String(value || '')} onChange={onSet} placeholder="Pilih produk…" options={products.map((p) => ({ value: p.id, label: `${p.name} · ${formatRupiah(p.price)}` }))} />
        </Labeled>
      );
    case 'products':
      return <ProductPicker label={field.label} value={Array.isArray(value) ? (value as string[]) : []} products={products} max={field.max ?? 40} onChange={onSet} />;
    case 'list':
      return <ListField field={field} value={Array.isArray(value) ? (value as InspectorListItem[]) : []} onChange={onSet} />;
    default:
      return <SimpleField field={field} value={value} onSet={onSet} />;
  }
}
