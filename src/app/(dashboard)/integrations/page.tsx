'use client';

import { ComingSoon } from '@/components/common/ComingSoon';
import { PlugIcon } from '@/components/ui/icons/NavIcons';

export default function IntegrationsPage() {
  return (
    <ComingSoon
      title="Integrasi"
      subtitle="Hubungkan layanan pihak ketiga"
      icon={PlugIcon}
      description="Integrasi dengan layanan pembayaran, marketplace, dan pihak ketiga lainnya akan tampil di sini."
    />
  );
}
