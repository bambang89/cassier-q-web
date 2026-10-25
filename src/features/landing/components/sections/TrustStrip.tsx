import { WalletIcon, ShieldIcon, DevicesIcon } from '@/components/ui/icons/DataIcons';
import { LockIcon } from '@/components/ui/icons/ActionIcons';

export function TrustStrip() {
  return (
    <section aria-label="Yang Anda dapatkan" className="border-y border-gray-100 bg-gray-25 px-4 py-10 sm:px-6">
      <ul className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { Icon: DevicesIcon, title: 'Web & mobile', text: 'Buka dari browser laptop, tablet, atau ponsel.' },
          { Icon: WalletIcon, title: '5 metode bayar', text: 'Tunai, QRIS, Debit, Kartu Kredit, Transfer.' },
          { Icon: LockIcon, title: 'Akses per peran', text: 'Kasir hanya melihat menu yang diizinkan.' },
          { Icon: ShieldIcon, title: 'Koneksi HTTPS', text: 'Sesi login terikat ke perangkat.' },
        ].map(({ Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-electric-700 shadow-sm ring-1 ring-gray-100">
              <Icon size={20} />
            </span>
            <div>
              <p className="font-bold">{title}</p>
              <p className="text-sm text-ink-2">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
