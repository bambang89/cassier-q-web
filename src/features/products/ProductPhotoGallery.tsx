'use client';

import { useEffect } from 'react';

import { Alert } from '@/lib/alert';
import { photoProblem, pickPhoto } from '@/lib/pickPhoto';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addProductPhoto, deleteProductPhoto, fetchProductPhotos } from '@/store/slices/productPhotosSlice';
import { Spinner } from '@/components/ui/Spinner';
import { PlusIcon, TrashIcon } from '@/components/icons/LineIcons';

// Sama dengan MAX_PRODUCT_PHOTOS di backend.
const MAX_PHOTOS = 5;

/** Galeri foto tambahan produk — hanya saat edit (butuh id produk). */
export function ProductPhotoGallery({ productId }: { productId: string }) {
  const dispatch = useAppDispatch();
  const photos = useAppSelector((state) => state.productPhotos.byProductId[productId]) ?? [];
  const status = useAppSelector((state) => state.productPhotos.statusByProductId[productId]);
  const atLimit = photos.length >= MAX_PHOTOS;

  useEffect(() => {
    dispatch(fetchProductPhotos(productId));
  }, [dispatch, productId]);

  const onAddPhoto = async () => {
    if (atLimit) return;
    const file = await pickPhoto();
    if (!file) return;
    const problem = photoProblem(file);
    if (problem) return Alert.alert('Foto tidak valid', problem);
    try {
      await dispatch(addProductPhoto({ productId, file })).unwrap();
    } catch {
      Alert.alert('Gagal', 'Foto tidak bisa diupload, coba lagi.');
    }
  };

  const onDeletePhoto = (photoId: string) => {
    Alert.alert('Hapus foto?', 'Foto ini akan dihapus dari galeri produk.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => dispatch(deleteProductPhoto({ productId, photoId })) },
    ]);
  };

  return (
    <div className="mb-4">
      <p className="mb-1 text-base font-semibold text-ink">Galeri foto</p>
      <div className="flex flex-wrap gap-2.5">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative size-20 overflow-hidden rounded-lg border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.imageUrl} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onDeletePhoto(photo.id)}
              aria-label="Hapus foto"
              className="absolute top-1 right-1 flex size-6 cursor-pointer items-center justify-center rounded-full bg-error-600 text-white opacity-90 hover:opacity-100"
            >
              <TrashIcon size={12} />
            </button>
          </div>
        ))}
        {atLimit ? null : (
          <button
            type="button"
            onClick={onAddPhoto}
            aria-label="Tambah foto"
            className="flex size-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-ink-2 hover:border-primary-400 hover:text-primary-600"
          >
            {status === 'loading' ? <Spinner /> : <PlusIcon size={20} />}
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-ink-2">Foto tambahan selain foto utama ({photos.length}/{MAX_PHOTOS})</p>
    </div>
  );
}
