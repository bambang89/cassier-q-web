'use client';

import { useEffect, useState } from 'react';

import { logout, logoutAll } from '@/lib/store/slices/authSlice';
import { fetchCurrentSession } from '@/lib/store/slices/cashierSessionSlice';
import { fetchStoreProfile } from '@/lib/store/slices/storeProfileSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/store';
import { useIsWide } from '@/hooks/useMedia';
import { cn } from '@/utils/cn';
import { PageHeader } from '@/components/common/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { ChangePasswordForm, CloseSessionForm } from '@/features/account/components/AccountForms';
import type { SettingsSectionKey } from '@/features/settings/types';
import { SECTIONS } from '@/features/settings/constants';
import { SettingsDetail } from '@/features/settings/components/SettingsDetail';
import { PhoneAccount } from '@/features/settings/components/PhoneAccount';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const isWide = useIsWide();
  const session = useAppSelector((state) => state.cashierSession.current);
  const [closeSessionVisible, setCloseSessionVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [logoutAllVisible, setLogoutAllVisible] = useState(false);
  const [section, setSection] = useState<SettingsSectionKey>('akun');

  useEffect(() => {
    dispatch(fetchCurrentSession());
    dispatch(fetchStoreProfile());
  }, [dispatch]);

  const handlers = {
    onCloseSession: () => setCloseSessionVisible(true),
    onChangePassword: () => setChangePasswordVisible(true),
    onLogout: () => setLogoutVisible(true),
    onLogoutAll: () => setLogoutAllVisible(true),
  };

  return (
    <>
      <PageHeader title="Pengaturan" subtitle="Konfigurasi bisnis dan preferensi akun" phoneTitle="Akun" />

      {isWide ? (
        <div className="flex min-h-0 flex-1">
          <nav className="w-[260px] shrink-0 space-y-0.5 overflow-y-auto border-r border-gray-150 bg-white p-3">
            {SECTIONS.map((item) => {
              const Icon = item.icon;
              const active = section === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSection(item.key)}
                  className={cn(
                    'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] font-semibold transition',
                    active ? 'bg-primary-50 text-primary-700' : 'text-ink-2 hover:bg-gray-50 hover:text-ink',
                  )}
                >
                  <Icon size={17} className={active ? 'text-primary-600' : 'text-gray-400'} />
                  <span className="flex-1">{item.label}</span>
                  {!item.available ? <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500">SOON</span> : null}
                </button>
              );
            })}
          </nav>
          <div className="scroll-thin min-w-0 flex-1 overflow-y-auto bg-gray-25">
            <div key={section} className="animate-slide-in p-6 xl:p-8">
              <SettingsDetail section={section} {...handlers} />
            </div>
          </div>
        </div>
      ) : (
        <PhoneAccount {...handlers} />
      )}

      <Modal isOpen={closeSessionVisible} onClose={() => setCloseSessionVisible(false)}>
        {session ? <CloseSessionForm sessionId={session.id} onDone={() => setCloseSessionVisible(false)} onCancel={() => setCloseSessionVisible(false)} /> : null}
      </Modal>
      <Modal isOpen={changePasswordVisible} onClose={() => setChangePasswordVisible(false)}>
        <ChangePasswordForm onDone={() => setChangePasswordVisible(false)} onCancel={() => setChangePasswordVisible(false)} />
      </Modal>
      <AlertDialog
        isOpen={logoutVisible}
        onClose={() => setLogoutVisible(false)}
        title="Keluar dari akun?"
        description="Anda perlu masuk lagi untuk memakai aplikasi di perangkat ini."
        confirmText="Keluar"
        isDanger
        onConfirm={() => {
          setLogoutVisible(false);
          dispatch(logout());
        }}
      />
      <AlertDialog
        isOpen={logoutAllVisible}
        onClose={() => setLogoutAllVisible(false)}
        title="Keluar dari semua perangkat?"
        description="Semua sesi login akun ini — di perangkat manapun — akan langsung dicabut."
        confirmText="Keluar Semua"
        isDanger
        onConfirm={() => {
          setLogoutAllVisible(false);
          dispatch(logoutAll());
        }}
      />
    </>
  );
}

