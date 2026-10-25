'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { LANDING, whatsappLink } from '@/config/site';
import { cn } from '@/utils/cn';
import { track, buttonClass } from '@/features/landing/utils';
import type { LeadFormErrors } from '@/features/landing/types';

const BUSINESS_TYPES = ['Retail / minimarket', 'Kafe / restoran', 'Fashion', 'Toko kelontong / sembako', 'Salon / barbershop', 'Lainnya'];

/**
 * Form singkat konsultasi. Belum ada endpoint lead di backend, jadi data TIDAK
 * dikirim ke server: form menyusun pesan lalu membuka WhatsApp (atau email)
 * tim cassier-Q yang diatur di config. Honeypot + jeda minimum menahan bot.
 */
export function LeadForm() {
  const startedAt = useRef(0);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [status, setStatus] = useState<'idle' | 'sent' | 'unconfigured'>('idle');

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (data.get('website') || Date.now() - startedAt.current < 1500) return; // bot

    const name = String(data.get('name') ?? '').trim();
    const business = String(data.get('business') ?? '').trim();
    const phone = String(data.get('phone') ?? '').replace(/[\s-]/g, '');
    const type = String(data.get('type') ?? '');
    const note = String(data.get('note') ?? '').trim();

    const next: LeadFormErrors = {};
    if (name.length < 2) next.name = 'Isi nama Anda.';
    if (business.length < 2) next.business = 'Isi nama usaha Anda.';
    if (!/^(\+62|62|0)8\d{7,12}$/.test(phone)) next.phone = 'Nomor WhatsApp tidak valid (contoh: 081234567890).';
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      e.currentTarget.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
      return;
    }

    const message = [
      `Halo tim ${LANDING.brand}, saya ingin konsultasi.`,
      `Nama: ${name}`,
      `Usaha: ${business}${type ? ` (${type})` : ''}`,
      `WhatsApp: ${phone}`,
      note && `Kebutuhan: ${note}`,
    ]
      .filter(Boolean)
      .join('\n');

    const wa = whatsappLink(message);
    const mail = LANDING.contact.email
      ? `mailto:${LANDING.contact.email}?subject=${encodeURIComponent(`Konsultasi ${LANDING.brand} — ${business}`)}&body=${encodeURIComponent(message)}`
      : null;
    const target = wa ?? mail;
    if (!target) {
      setStatus('unconfigured');
      return;
    }
    track('contact_submit', { channel: wa ? 'whatsapp' : 'email', businessType: type || null });
    track('demo_request');
    window.open(target, wa ? '_blank' : '_self', 'noopener');
    setStatus('sent');
  };

  return (
    <form noValidate onSubmit={onSubmit} className="grid gap-4 rounded-2xl bg-white p-5 text-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)] sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama" name="name" autoComplete="name" error={errors.name} />
        <Field label="Nama usaha" name="business" autoComplete="organization" error={errors.business} />
      </div>
      <Field label="Nomor WhatsApp" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="081234567890" error={errors.phone} />
      <label className="grid gap-1.5 text-sm font-semibold">
        Jenis usaha <span className="sr-only">(opsional)</span>
        <select name="type" defaultValue="" className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-[15px] font-normal focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-100">
          <option value="">Pilih (opsional)</option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-semibold">
        <span>
          Ceritakan kebutuhan Anda <span className="font-normal text-ink-3">(opsional)</span>
        </span>
        <textarea name="note" rows={3} maxLength={500} className="rounded-xl border border-gray-200 px-3 py-2.5 text-[15px] font-normal focus:border-electric-500 focus:outline-none focus:ring-2 focus:ring-electric-100" />
      </label>
      {/* Honeypot: disembunyikan dari manusia & pembaca layar. */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button type="submit" className={buttonClass('primary', 'lg', 'w-full')}>
        Kirim &amp; Konsultasi
      </button>
      <p className="text-xs leading-relaxed text-ink-3">Data hanya dipakai untuk menghubungi Anda terkait {LANDING.brand}.</p>
      <p role="status" aria-live="polite" className={cn('text-sm', status === 'idle' && 'sr-only')}>
        {status === 'sent' && <span className="text-pine-700">Pesan Anda sudah disiapkan. Kirim lewat jendela yang terbuka, tim kami akan membalas.</span>}
        {status === 'unconfigured' && (
          <span className="text-warning-700">Kontak tim belum diatur. (Admin: isi NEXT_PUBLIC_CONTACT_WHATSAPP atau NEXT_PUBLIC_CONTACT_EMAIL.)</span>
        )}
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  name,
  ...rest
}: { label: string; error?: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const errId = `${name}-error`;
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {label}
      <input
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errId : undefined}
        className={cn(
          'h-11 rounded-xl border px-3 text-[15px] font-normal focus:outline-none focus:ring-2',
          error ? 'border-error-500 focus:ring-error-100' : 'border-gray-200 focus:border-electric-500 focus:ring-electric-100',
        )}
        {...rest}
      />
      {error && (
        <span id={errId} className="text-xs font-medium text-error-600">
          {error}
        </span>
      )}
    </label>
  );
}
