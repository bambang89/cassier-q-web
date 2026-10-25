'use client';

export function FullScreenLoader() {
  return (
    <div className="flex h-dvh items-center justify-center bg-white">
      <span className="size-9 animate-spin rounded-full border-[3px] border-primary-600 border-t-transparent" />
    </div>
  );
}
