import type { BarcodeDetectorCtor } from '@/types/ui';

export function detectorCtor(): BarcodeDetectorCtor | null {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window
    ? ((window as unknown as { BarcodeDetector: BarcodeDetectorCtor }).BarcodeDetector)
    : null;
}
