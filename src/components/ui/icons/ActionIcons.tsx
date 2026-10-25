import type { LineIconProps } from '@/types/ui';
import { IconBase } from '@/components/ui/icons/IconBase';

export function SearchIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <circle cx={11} cy={11} r={7.2} />
      <path d="M21 21l-4.4-4.4" />
    </IconBase>
  );
}

export function BarcodeIcon(props: LineIconProps) {
  return (
    <IconBase {...props} strokeWidth={props.strokeWidth ?? 1.6}>
      <path d="M3 4v16M7 4v16M10 4v16M15 4v16M17.5 4v16M21 4v16" />
    </IconBase>
  );
}

export function BellIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9Z" />
      <path d="M10 19.5a2 2 0 0 0 4 0" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 9l6 6 6-6" />
    </IconBase>
  );
}

export function TrashIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
      <path d="M10 11v6M14 11v6" />
    </IconBase>
  );
}

export function PlusIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14M5 12h14" />
    </IconBase>
  );
}

export function CloseIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 6 6 18M6 6l12 12" />
    </IconBase>
  );
}

export function FilterIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 5h16l-6.5 8v6l-3 1.5v-7.5Z" />
    </IconBase>
  );
}

export function LockIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <rect x={5} y={11} width={14} height={9} rx={2} />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </IconBase>
  );
}

export function ReceiveIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v11" />
      <path d="M8 10l4 4 4-4" />
      <path d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5" />
    </IconBase>
  );
}

export function UnlockIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <rect x={5} y={11} width={14} height={9} rx={2} />
      <path d="M8 11V7a4 4 0 0 1 7.4-2.1" />
    </IconBase>
  );
}

export function EyeIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx={12} cy={12} r={3} />
    </IconBase>
  );
}

// Path persis dari .input-icon-wrap password field di cassier-q-webapp/login.html.
export function EyeOffIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a15 15 0 0 1-3.4 4.2M6.7 6.7A15.4 15.4 0 0 0 2 12s3.5 7 10 7c1.4 0 2.6-.2 3.7-.6" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </IconBase>
  );
}

export function CheckIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 12.5 9.5 18 20 6" />
    </IconBase>
  );
}

// Path persis tombol "Cetak Ulang" di cassier-q-webapp/tablet-transactions.html.
export function PrintIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 9V3h12v6" />
      <rect x={4} y={9} width={16} height={8} rx={1.5} />
      <path d="M6 14h12v7H6Z" />
    </IconBase>
  );
}

export function BluetoothIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="m7 7 10 10-5 5V2l5 5L7 17" />
    </IconBase>
  );
}

// Path persis tombol "Refund" di cassier-q-webapp/tablet-transactions.html.
export function RefundIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 11a9 9 0 0 1 15.3-5.3L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 13a9 9 0 0 1-15.3 5.3L3 16" />
      <path d="M3 21v-5h5" />
    </IconBase>
  );
}

// Path persis ikon "Ubah" di aksi tabel .dtable, cassier-q-webapp/employees.html.
export function PencilIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12.5 5.5 18 11 8 21H3v-5Z" />
      <path d="M15 3l5.5 5.5" />
    </IconBase>
  );
}

// Path persis ikon "..." di aksi tabel .dtable, cassier-q-webapp/employees.html.
export function MoreIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <circle cx={5} cy={12} r={1.4} fill="currentColor" stroke="none" />
      <circle cx={12} cy={12} r={1.4} fill="currentColor" stroke="none" />
      <circle cx={19} cy={12} r={1.4} fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function ChevronRightIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 6 6 6-6 6" />
    </IconBase>
  );
}

export function ChevronLeftIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="m15 6-6 6 6 6" />
    </IconBase>
  );
}

export function CheckCircleIcon(props: LineIconProps) {
  return (
    <IconBase strokeWidth={1.8} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </IconBase>
  );
}

export function MinusCircleIcon(props: LineIconProps) {
  return (
    <IconBase strokeWidth={1.8} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8" />
    </IconBase>
  );
}
