import type { LineIconProps } from '@/types/ui';
import { IconBase } from '@/components/ui/icons/IconBase';

export function ClockIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <circle cx={12} cy={12} r={9.3} />
      <path d="M12 7v5.3l3.5 2" />
    </IconBase>
  );
}

export function DiscountIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <circle cx={7} cy={7} r={2.5} />
      <circle cx={17} cy={17} r={2.5} />
      <path d="M18.5 5.5 5.5 18.5" />
    </IconBase>
  );
}

export function NoteIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 3h11l3 3v15H5Z" />
      <path d="M16 3v3h3" />
      <path d="M8.5 12h7M8.5 15.5h7M8.5 8.5h4" />
    </IconBase>
  );
}

export function RegisterIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <rect x={2} y={6} width={20} height={12.5} rx={2} />
      <circle cx={12} cy={12.3} r={3} />
      <path d="M5.5 9v0M18.5 15.6v0" />
    </IconBase>
  );
}

export function TrendUpIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </IconBase>
  );
}

export function TrendDownIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M6 13l6 6 6-6" />
    </IconBase>
  );
}

export function TrendingIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 17l6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </IconBase>
  );
}

export function LightbulbIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 2s5 4.5 5 9.5a5 5 0 0 1-10 0c0-1 .3-2 1-3 .3 1 1 1.5 1.5 1.5-1-3 1-5.5 2.5-8Z" />
    </IconBase>
  );
}

export function TruckIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M2 7h11v9H2Z" />
      <path d="M13 10h4l3 3v3h-3" />
      <circle cx={6} cy={18} r={1.8} />
      <circle cx={17} cy={18} r={1.8} />
    </IconBase>
  );
}

export function ScaleIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M5 7l-3 6a3 3 0 0 0 6 0Z" />
      <path d="M19 7l-3 6a3 3 0 0 0 6 0Z" />
      <path d="M8 21h8" />
    </IconBase>
  );
}

export function FolderIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    </IconBase>
  );
}

export function WalletIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
      <rect x={3} y={7} width={18} height={13} rx={2} />
      <path d="M16 13h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3a2 2 0 0 1 0-4Z" />
    </IconBase>
  );
}

export function CalendarIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <rect x={3} y={5} width={18} height={16} rx={2} />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </IconBase>
  );
}

export function TrophyIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 4h10v6a5 5 0 0 1-10 0Z" />
      <path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
      <path d="M12 15v3M9 21h6M9.5 18h5l.5 3H9Z" />
    </IconBase>
  );
}

export function WrenchIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2Z" />
    </IconBase>
  );
}

export function StickyNoteIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 4h16v11l-5 5H4Z" />
      <path d="M15 20v-4a1 1 0 0 1 1-1h4" />
    </IconBase>
  );
}

export function CreditCardIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <rect x={2} y={5} width={20} height={14} rx={2} />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </IconBase>
  );
}

export function PinIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx={12} cy={9.5} r={2.3} />
    </IconBase>
  );
}

export function HistoryIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 7v5l3.5 2" />
    </IconBase>
  );
}

export function PersonIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <circle cx={12} cy={8} r={4} />
      <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
    </IconBase>
  );
}

export function AlertTriangleIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3.5 22 20H2Z" />
      <path d="M12 9.5v4.5" />
      <circle cx={12} cy={17} r={0.15} fill={props.color ?? 'currentColor'} stroke={props.color ?? 'currentColor'} strokeWidth={2} />
    </IconBase>
  );
}

export function ShieldIcon(props: LineIconProps) {
  return (
    <IconBase strokeWidth={1.8} {...props}>
      <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </IconBase>
  );
}

export function DevicesIcon(props: LineIconProps) {
  return (
    <IconBase strokeWidth={1.8} {...props}>
      <rect x="2.5" y="4" width="14" height="10" rx="1.5" />
      <path d="M6 18h7M9.5 14v4" />
      <rect x="17.5" y="8" width="4" height="11" rx="1" />
    </IconBase>
  );
}

export function ChatIcon(props: LineIconProps) {
  return (
    <IconBase strokeWidth={1.8} {...props}>
      <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z" />
    </IconBase>
  );
}

export function MailIcon(props: LineIconProps) {
  return (
    <IconBase strokeWidth={1.8} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3.5 6.5L12 13l8.5-6.5" />
    </IconBase>
  );
}

export function QrIcon(props: LineIconProps) {
  return (
    <IconBase strokeWidth={1.8} {...props}>
      <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="14.5" y="3.5" width="6" height="6" rx="1" />
      <rect x="3.5" y="14.5" width="6" height="6" rx="1" />
      <path d="M14.5 14.5h2v2M20.5 14.5v6h-6M17.5 18h0" />
    </IconBase>
  );
}
