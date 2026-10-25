import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Request /api/v1 dan /uploads di-rewrite ke backend (next.config.ts) sebagai
 * request server-ke-server. Header Origin dari browser ikut terkirim dan
 * ditolak CORS Spring ("Invalid CORS request" 403) karena origin web tidak ada
 * di app.cors.allowed-origins — jadi dibuang di sini; bagi backend ini bukan
 * request lintas origin.
 */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete('origin');
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/api/v1/:path*', '/uploads/:path*'],
};
