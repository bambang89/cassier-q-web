'use client';

import { ComingSoon } from '@/components/common/ComingSoon';
import { WalletIcon } from '@/components/ui/icons/DataIcons';

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
