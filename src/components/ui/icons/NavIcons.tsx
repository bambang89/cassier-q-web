import type { LineIconProps } from '@/types/ui';
import { IconBase } from '@/components/ui/icons/IconBase';

export function DashboardIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <rect x={3} y={3} width={7} height={7} rx={1.5} />
      <rect x={14} y={3} width={7} height={7} rx={1.5} />
      <rect x={3} y={14} width={7} height={7} rx={1.5} />
      <rect x={14} y={14} width={7} height={7} rx={1.5} />
    </IconBase>
  );
}

export function CartIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <circle cx={9} cy={20} r={1.3} fill={props.color ?? 'currentColor'} stroke="none" />
      <circle cx={18} cy={20} r={1.3} fill={props.color ?? 'currentColor'} stroke="none" />
      <path d="M2 3h2.4l2.1 11.4a2 2 0 0 0 2 1.6h8.4a2 2 0 0 0 2-1.6L21 7.5H6" />
    </IconBase>
  );
}

export function ReceiptIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 2h12v19l-2.5-1.5L13 21l-2.5-1.5L8 21l-2-1.3V2Z" />
      <path d="M9 7h6M9 11h6M9 15h3" />
    </IconBase>
  );
}

export function ClipboardIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <rect x={5} y={4} width={14} height={17} rx={2} />
      <rect x={9} y={2} width={6} height={4} rx={1} />
      <path d="M9 11h6M9 15h6M9 19h3" />
    </IconBase>
  );
}

export function BoxIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 3 7.5 12 12l9-4.5Z" />
      <path d="M3 7.5v9L12 21l9-4.5v-9" />
      <path d="M12 12v9" />
    </IconBase>
  );
}

export function LayersIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 2.5 8 12 13l9.5-5Z" />
      <path d="M2.5 12 12 17l9.5-5" />
      <path d="M2.5 16 12 21l9.5-5" />
    </IconBase>
  );
}

export function PeopleIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <circle cx={9} cy={8} r={3.4} />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16.2 3.2a3.4 3.4 0 0 1 0 6.6" />
      <path d="M17.5 14.2c2.6.6 4 2.7 4 5.8" />
    </IconBase>
  );
}

export function BarChartIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M5 20V10M12 20V4M19 20v-7" />
    </IconBase>
  );
}

export function EmployeeIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <circle cx={12} cy={9} r={4} />
      <path d="M8 12.5 6 21l6-3 6 3-2-8.5" />
    </IconBase>
  );
}

export function StoreIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 9.5 4.5 3h15L21 9.5" />
      <path d="M3 9.5a2.7 2.7 0 0 0 5.2 1 2.7 2.7 0 0 0 5.2 0 2.7 2.7 0 0 0 5.2 0 2.7 2.7 0 0 0 5.2-1" />
      <path d="M5 11v10h14V11" />
      <path d="M10 21v-6h4v6" />
    </IconBase>
  );
}

export function PlugIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 3v5M15 3v5M6 8h12l-1 5a5 5 0 0 1-10 0Z" />
      <path d="M12 16v5" />
    </IconBase>
  );
}

export function SettingsIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <circle cx={12} cy={12} r={3} />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </IconBase>
  );
}

export function HelpIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <circle cx={12} cy={12} r={9.3} />
      <path d="M9.2 9.3a2.8 2.8 0 1 1 4 2.5c-.9.5-1.4 1-1.4 2.1" />
      <circle cx={12} cy={17.2} r={0.15} fill={props.color ?? 'currentColor'} stroke={props.color ?? 'currentColor'} strokeWidth={2} />
    </IconBase>
  );
}

export function LogoutIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </IconBase>
  );
}

export function HomeIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />
    </IconBase>
  );
}

export function GlobeIcon(props: LineIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </IconBase>
  );
}

export function MenuIcon(props: LineIconProps) {
  return (
    <IconBase strokeWidth={1.8} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </IconBase>
  );
}

export function ArrowRightIcon(props: LineIconProps) {
  return (
    <IconBase strokeWidth={1.8} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </IconBase>
  );
}
