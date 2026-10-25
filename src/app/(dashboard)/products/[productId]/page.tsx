'use client';

import { useParams } from 'next/navigation';

import { PageHeader } from '@/components/common/PageHeader';
import { LoadingBlock } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/Display';
import { BoxIcon } from '@/components/ui/icons/NavIcons';
import { ProductForm } from '@/features/products/components/ProductForm';
import { useProductById } from '@/features/products/hooks/useProductById';

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const { product, loading } = useProductById(productId);

  if (product) return <ProductForm product={product} />;
  return (
    <>
      <PageHeader title="Ubah Produk" backHref="/products" />
      {loading ? <LoadingBlock /> : <EmptyState icon={BoxIcon} title="Produk tidak ditemukan" description="Produk ini mungkin sudah dinonaktifkan." />}
    </>
  );
}
