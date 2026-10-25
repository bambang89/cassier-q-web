'use client';

import { PlugIcon } from '@/components/icons/LineIcons';
import { ComingSoon } from '@/components/layout/ComingSoon';

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
