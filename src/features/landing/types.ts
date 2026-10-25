/**
 * Titik integrasi analitik. Belum ada tracking ID — event hanya didorong ke
 * `window.dataLayer` (Google Tag Manager, kalau nanti dipasang) dan dipancarkan
 * sebagai CustomEvent `cq:track` supaya tool lain bisa mendengarkan.
 */
export type LandingEvent =
  | 'cta_primary_click'
  | 'cta_secondary_click'
  | 'whatsapp_click'
  | 'registration_start'
  | 'demo_request'
  | 'contact_submit';

export type ProductKind = 'coffee' | 'bread' | 'water' | 'tea' | 'noodle' | 'milk';

export type ProductArtIds = { id: (n: string) => string; url: (n: string) => string };

export type LeadFormErrors = Partial<Record<'name' | 'business' | 'phone', string>>;


export type LandingButtonVariant = 'primary' | 'secondary' | 'ghost' | 'onDark' | 'onDarkGhost';
