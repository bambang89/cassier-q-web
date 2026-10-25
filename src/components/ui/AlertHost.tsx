'use client';

import { useEffect, useState } from 'react';

import { dismissAlert, subscribeAlerts } from '@/lib/alert';
import type { AlertRequest } from '@/lib/alert';
import { cn } from '@/lib/cn';
import { Modal } from './Modal';

/** Menampilkan antrean Alert.alert() satu per satu. */
export function AlertHost() {
  const [queue, setQueue] = useState<AlertRequest[]>([]);
  useEffect(() => subscribeAlerts(setQueue), []);

  const current = queue[0];
  if (!current) return null;

  const close = () => dismissAlert(current.id);
  const cancel = current.buttons.find((b) => b.style === 'cancel');

  return (
    <Modal
      isOpen
      onClose={() => {
        close();
        cancel?.onPress?.();
      }}
      size="sm"
    >
      <h2 className="text-xl font-bold text-ink">{current.title}</h2>
      {current.message ? <p className="mt-2 whitespace-pre-line text-ink-2">{current.message}</p> : null}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {current.buttons.map((button) => (
          <button
            key={button.text}
            type="button"
            onClick={() => {
              close();
              button.onPress?.();
            }}
            className={cn(
              'min-h-10 min-w-[90px] cursor-pointer rounded-lg px-4 text-sm font-semibold transition active:scale-[0.97]',
              button.style === 'destructive'
                ? 'bg-error-600 text-white hover:bg-error-700'
                : button.style === 'cancel'
                  ? 'text-primary-600 hover:bg-primary-50'
                  : 'bg-primary-600 text-white hover:bg-primary-700',
            )}
          >
            {button.text}
          </button>
        ))}
      </div>
    </Modal>
  );
}
