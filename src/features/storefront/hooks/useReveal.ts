import { useRef, useEffect, useState } from 'react';

/** Satu blok lengkap dengan bingkai gaya (latar, jarak, lebar, perataan, tampil di). */
/** Blok publik muncul halus (fade + naik) saat pertama kali masuk layar. */
export function useReveal(enabled: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(!enabled);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof IntersectionObserver === 'undefined') return setShown(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);
  return [ref, shown] as const;
}
