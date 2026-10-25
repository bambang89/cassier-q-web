import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, ButtonHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  wrapperClassName?: string;
}

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
}

export interface SelectProps<T extends string = string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value: T | null;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  isInvalid?: boolean;
}

export interface FormControlProps {
  label?: string;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  isRequired?: boolean;
  className?: string;
  children: ReactNode;
}

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'danger' | 'dangerOutline' | 'success' | 'secondary';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  closeOnBackdropPress?: boolean;
  /** Lebar kartu di layar lebar (default 460px seperti tablet). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'info';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isDanger?: boolean;
  isConfirmLoading?: boolean;
}

export interface MenuAction {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
}

export interface LineIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Tombol aksi di kanan (mis. "Tambah Produk"). */
  right?: ReactNode;
  /**
   * Tujuan tombol kembali. Default: layar di luar tab bar HP kembali ke /menu
   * (di HP saja); layar detail sebaiknya mengisi ini (mis. "/orders").
   */
  backHref?: string;
  /** Judul/subjudul khusus HP bila berbeda dari layar lebar. */
  phoneTitle?: string;
  phoneSubtitle?: string;
}

// BarcodeDetector belum ada di lib.dom TypeScript.
export type DetectedBarcode = { rawValue: string };

export type BarcodeDetectorLike = { detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]> };

export type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

// Pengganti Alert.alert dari React Native: API yang sama (judul, pesan,
// tombol) supaya logika layar mobile bisa dipakai apa adanya. Dirender oleh
// <AlertHost /> di root.
export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AlertRequest {
  id: number;
  title: string;
  message?: string;
  buttons: AlertButton[];
}

export type AlertListener = (queue: AlertRequest[]) => void;

export type SummaryRowProps = { label: string; value: string; valueClass?: string; className?: string };
