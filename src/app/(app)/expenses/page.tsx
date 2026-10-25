'use client';

import { WalletIcon } from '@/components/icons/LineIcons';
import { ComingSoon } from '@/components/layout/ComingSoon';

export default function ExpensesPage() {
  return (
    <ComingSoon
      title="Pengeluaran"
      subtitle="Catat biaya operasional toko"
      icon={WalletIcon}
      description="Fitur pencatatan pengeluaran toko masih dalam pengembangan."
    />
  );
}
