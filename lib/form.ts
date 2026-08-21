import { NextResponse } from 'next/server';

/** Client-side checks are a convenience, not a control — everything the
 *  browser asserted is re-checked here. */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Bots typically submit the instant the DOM is parsed. site.js stamps
 *  form_started with Date.now() at render; anything faster than this is not a
 *  person filling in a form. */
export const MIN_FILL_MS = 2500;

export type Field = { name: string; label: string; required?: boolean; email?: boolean; max?: number };

export type Parsed =
  | { ok: true; values: Record<string, string> }
  | { ok: false; status: number; error: string };

export function validate(data: FormData, fields: Field[]): Parsed {
  // Honeypot: a real browser leaves this hidden input empty.
  const pot = (data.get('company_website') || '').toString().trim();
  if (pot) return { ok: false, status: 400, error: 'Submission rejected.' };

  const started = Number(data.get('form_started') || 0);
  if (started && Date.now() - started < MIN_FILL_MS) {
    return { ok: false, status: 429, error: 'That was too quick — please try again.' };
  }

  if (!data.get('consent')) {
    return { ok: false, status: 400, error: 'Please tick the consent box to continue.' };
  }

  const values: Record<string, string> = {};
  for (const f of fields) {
    const raw = (data.get(f.name) ?? '').toString().trim();
    if (f.required && !raw) return { ok: false, status: 400, error: `${f.label} is required.` };
    if (raw && f.email && !EMAIL_RE.test(raw)) {
      return { ok: false, status: 400, error: 'Enter a valid email address.' };
    }
    if (raw.length > (f.max ?? 2000)) {
      return { ok: false, status: 400, error: `${f.label} is too long.` };
    }
    values[f.name] = raw;
  }
  return { ok: true, values };
}

/** Forms work without JavaScript (native POST -> redirect) and with it
 *  (fetch -> JSON, so the page can show a status line in place). */
export function respond(request: Request, result: { ok: boolean; error?: string; status?: number }) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json');

  if (wantsJson) {
    return NextResponse.json(
      result.ok ? { ok: true, redirect: '/thank-you' } : { ok: false, error: result.error },
      { status: result.ok ? 200 : result.status ?? 400 }
    );
  }

  const url = new URL(request.url);
  if (result.ok) return NextResponse.redirect(new URL('/thank-you', url.origin), 303);

  // Send them back to the form they came from, not a hardcoded page.
  const referer = request.headers.get('referer');
  const back = referer && referer.startsWith(url.origin) ? new URL(referer) : new URL('/contact', url.origin);
  back.searchParams.set('error', result.error ?? 'Something went wrong.');
  return NextResponse.redirect(back, 303);
}
