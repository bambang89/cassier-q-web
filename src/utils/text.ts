/** Inisial nama (maks 2 huruf) untuk avatar. */
export function initialsOf(name?: string | null): string {
  return (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
