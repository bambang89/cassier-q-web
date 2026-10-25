'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import type { Product } from '@/types/models';
import * as productsApi from '@/services/productsApi';
import { fetchCategories } from '@/lib/store/slices/categoriesSlice';
import { fetchUnits } from '@/lib/store/slices/unitsSlice';
import { createProduct, fetchProducts, updateProduct, uploadProductPhoto } from '@/lib/store/slices/productsSlice';
import { Alert } from '@/lib/alert';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { usePermissions } from '@/hooks/usePermissions';
import { apiErrorMessage } from '@/utils/apiErrors';
import { photoProblem, pickPhoto } from '@/utils/pickPhoto';
import { PageBody, PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { FormControl, Input, Select, TextArea } from '@/components/ui/Field';
import { BarcodeScanner } from '@/components/common/BarcodeScanner';
import { BoxIcon } from '@/components/ui/icons/NavIcons';
import { BarcodeIcon } from '@/components/ui/icons/ActionIcons';
import { PriceTiersSection } from '@/features/products/components/PriceTiersSection';
import { ProductPhotoGallery } from '@/features/products/components/ProductPhotoGallery';
import { ProductUnitsSection } from '@/features/products/components/ProductUnitsSection';
import { generateSku } from '@/features/products/utils';
import type { TierDraft } from '@/features/products/types';

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-card tab:p-6">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {description ? <p className="mb-4 text-[13px] text-ink-3">{description}</p> : <div className="mb-4" />}
      {children}
    </section>
  );
}

/** Form tambah/ubah produk — padanan ProductFormScreen mobile. */
export function ProductForm({ product: initial, prefillBarcode: initialBarcode }: { product?: Product; prefillBarcode?: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.categories.items);
  const units = useAppSelector((state) => state.units.items);
  const { canCreateProduct, canUpdateProduct, can } = usePermissions();
  const canEditTiers = can('products.price_tiers');
  const [editing, setEditing] = useState<Product | undefined>(initial);
  const [prefillBarcode, setPrefillBarcode] = useState(initialBarcode);
  const canManage = editing ? canUpdateProduct : canCreateProduct;

  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [productName, setProductName] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pickedImage, setPickedImage] = useState<File | null>(null);
  const [pickedPreview, setPickedPreview] = useState<string | null>(null);
  const [baseUnitId, setBaseUnitId] = useState<string | null>(null);
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [tiers, setTiers] = useState<TierDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  // Paket diedit di form paket (Kepala Toko).
  useEffect(() => {
    if (editing?.productType === 'BUNDLE') router.replace(`/bundles/${editing.id}`);
  }, [editing, router]);

  useEffect(() => {
    if (canManage) return;
    Alert.alert('Akses ditolak', editing ? 'Role Anda tidak diizinkan mengubah produk.' : 'Role Anda tidak diizinkan menambah produk.');
    router.back();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchUnits());
  }, [dispatch]);

  useEffect(() => {
    const p = editing;
    setSku(p?.sku ?? '');
    setBarcode(p?.barcode ?? prefillBarcode ?? '');
    setProductName(p?.productName ?? '');
    setCategoryId(p?.categoryId ?? null);
    setBrand(p?.brand ?? '');
    setDescription(p?.description ?? '');
    setImageUrl(p?.imageUrl ?? '');
    setPickedImage(null);
    setBaseUnitId(p?.baseUnitId ?? null);
    setSellingPrice(p?.sellingPrice ? String(p.sellingPrice) : '');
    setCostPrice(p?.costPrice ? String(p.costPrice) : '');
    setTiers((p?.priceTiers ?? []).map((t) => ({ minQuantity: String(t.minQuantity), unitPrice: String(t.unitPrice) })));
  }, [editing, prefillBarcode]);

  useEffect(() => {
    if (!pickedImage) {
      setPickedPreview(null);
      return;
    }
    const url = URL.createObjectURL(pickedImage);
    setPickedPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [pickedImage]);

  const canSubmit = !!(sku && productName && categoryId && baseUnitId && sellingPrice);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !baseUnitId || !canSubmit) return;
    setSubmitting(true);
    try {
      const payload = {
        sku,
        barcode: barcode.trim() || undefined,
        productName,
        categoryId,
        brand: brand || undefined,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        baseUnitId,
        sellingPrice: Number(sellingPrice),
        costPrice: costPrice ? Number(costPrice) : undefined,
      };
      const saved = editing
        ? await dispatch(updateProduct({ id: editing.id, payload })).unwrap()
        : await dispatch(createProduct(payload)).unwrap();

      if (canEditTiers) {
        const parsed = tiers
          .filter((t) => t.minQuantity !== '' && t.unitPrice !== '')
          .map((t) => ({ minQuantity: Number(t.minQuantity), unitPrice: Number(t.unitPrice) }));
        if (JSON.stringify(parsed) !== JSON.stringify(editing?.priceTiers ?? [])) {
          try {
            await productsApi.updatePriceTiers(saved.id, parsed);
            dispatch(fetchProducts({}));
          } catch (error) {
            Alert.alert('Harga grosir belum tersimpan', apiErrorMessage(error, 'Produk tersimpan, tetapi harga grosir gagal disimpan.'));
            setSubmitting(false);
            return;
          }
        }
      }

      if (pickedImage) {
        try {
          await dispatch(uploadProductPhoto({ id: saved.id, file: pickedImage })).unwrap();
        } catch {
          Alert.alert('Produk tersimpan', 'Tapi foto gagal diupload — coba lagi dari menu edit produk.');
        }
      }
      router.push('/products');
    } catch (error) {
      Alert.alert('Gagal', typeof error === 'string' ? error : 'Produk tidak bisa disimpan. Cek kembali data yang diisi.');
    } finally {
      setSubmitting(false);
    }
  };

  const onChoosePhoto = async () => {
    const file = await pickPhoto();
    if (!file) return;
    const problem = photoProblem(file);
    if (problem) return Alert.alert('Foto tidak valid', problem);
    setPickedImage(file);
  };

  const photoPreview = pickedPreview || imageUrl || null;
  const unitName = units.find((u) => u.id === baseUnitId)?.unitName ?? 'pcs';

  return (
    <>
      <PageHeader
        title={editing ? 'Ubah Produk' : 'Tambah Produk'}
        subtitle={editing ? editing.productName : 'Lengkapi data produk baru'}
        backHref="/products"
        right={
          <Button size="sm" variant="outline" leftIcon={<BarcodeIcon size={14} />} onClick={() => setScannerVisible(true)}>
            Scan
          </Button>
        }
      />
      <PageBody>
        <form onSubmit={onSubmit} className="mx-auto grid max-w-[1080px] gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            {prefillBarcode && !editing ? (
              <p className="rounded-lg bg-primary-50 px-4 py-3 text-sm text-primary-700">
                Barcode {prefillBarcode} belum terdaftar — lengkapi data di bawah untuk mendaftarkannya sebagai produk baru.
              </p>
            ) : null}
            <Section title="Informasi Produk" description="Identitas produk yang tampil di kasir dan struk.">
              <div className="grid gap-x-4 sm:grid-cols-2">
                <FormControl label="SKU" isRequired helperText="Ketik manual atau tekan Auto">
                  <Input
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="mis. SKU-001"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setSku(generateSku(categories.find((c) => c.id === categoryId)?.categoryName))}
                        className="cursor-pointer rounded-md bg-primary-50 px-2 py-1 text-sm font-semibold text-primary-600 hover:bg-primary-100"
                      >
                        Auto
                      </button>
                    }
                  />
                </FormControl>
                <FormControl label="Barcode (opsional)" helperText="Kosongkan jika produk tidak punya barcode">
                  <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="Tanpa barcode" inputMode="numeric" />
                </FormControl>
              </div>
              <FormControl label="Nama produk" isRequired>
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Nama produk" />
              </FormControl>
              <div className="grid gap-x-4 sm:grid-cols-2">
                <FormControl label="Kategori" isRequired>
                  <Select
                    value={categoryId}
                    onChange={setCategoryId}
                    placeholder="Pilih kategori"
                    options={categories.map((c) => ({ label: c.categoryName, value: c.id }))}
                  />
                </FormControl>
                <FormControl label="Satuan dasar" isRequired>
                  <Select
                    value={baseUnitId}
                    onChange={setBaseUnitId}
                    placeholder="Pilih satuan"
                    options={units.map((u) => ({ label: `${u.unitName} (${u.unitCode})`, value: u.id }))}
                  />
                  {units.length === 0 ? (
                    <Link href="/units" className="mt-1 inline-block text-sm font-semibold text-primary-600">
                      Belum ada — buat dulu
                    </Link>
                  ) : null}
                </FormControl>
              </div>
              <FormControl label="Merek">
                <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Opsional" />
              </FormControl>
              <FormControl label="Deskripsi" className="mb-0">
                <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opsional" />
              </FormControl>
            </Section>

            <Section title="Harga" description="Harga jual per satuan dasar.">
              <div className="grid gap-x-4 sm:grid-cols-2">
                <FormControl label="Harga modal">
                  <Input value={costPrice} onChange={(e) => setCostPrice(e.target.value.replace(/\D/g, ''))} placeholder="Opsional" inputMode="numeric" leftElement={<span className="text-ink-3">Rp</span>} />
                </FormControl>
                <FormControl label="Harga jual" isRequired>
                  <Input value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value.replace(/\D/g, ''))} placeholder="0" inputMode="numeric" leftElement={<span className="text-ink-3">Rp</span>} />
                </FormControl>
              </div>
              <PriceTiersSection tiers={tiers} onChange={setTiers} normalPrice={Number(sellingPrice || 0)} unitName={unitName} disabled={!canEditTiers} />
            </Section>

            {editing ? (
              <Section title="Satuan & Galeri" description="Satuan jual/restock tambahan dan foto lain produk.">
                <ProductUnitsSection product={editing} allUnits={units} />
                <ProductPhotoGallery productId={editing.id} />
              </Section>
            ) : null}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-0 lg:self-start">
            <Section title="Foto Produk">
              <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                {photoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photoPreview} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex flex-col items-center gap-2 text-sm text-ink-3">
                    <BoxIcon size={28} />
                    Belum ada foto
                  </span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" onClick={onChoosePhoto} className="flex-1">
                  {photoPreview ? 'Ganti Foto' : 'Pilih Foto'}
                </Button>
                {photoPreview ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setPickedImage(null);
                      setImageUrl('');
                    }}
                  >
                    Hapus
                  </Button>
                ) : null}
              </div>
              <p className="mt-2 text-[12.5px] text-ink-3">JPG, PNG, atau WEBP · maks 5MB</p>
            </Section>
            <Button type="submit" loading={submitting} disabled={!canSubmit} fullWidth size="lg">
              {editing ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </aside>
        </form>
      </PageBody>

      <BarcodeScanner
        isOpen={scannerVisible}
        onClose={() => setScannerVisible(false)}
        // Produk lain sudah punya barcode ini — buka buat diedit.
        onFound={(product) => {
          setPrefillBarcode(undefined);
          setEditing(product);
        }}
        // Belum terdaftar — form mode tambah baru dengan barcode terisi.
        onNotFound={(scanned) => {
          setEditing(undefined);
          setPrefillBarcode(scanned);
        }}
      />
    </>
  );
}
