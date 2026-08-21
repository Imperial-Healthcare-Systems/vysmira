import nodemailer from 'nodemailer';

/** Every value comes from the environment — nothing about the mailbox is
 *  committed. Missing config fails loudly at send time rather than silently
 *  dropping a lead. */
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name} — set it in .env.local (locally) or the host's env settings.`);
  return value;
}

let cached: nodemailer.Transporter | null = null;

export function transporter(): nodemailer.Transporter {
  if (cached) return cached;

  const port = Number(process.env.SMTP_PORT || 465);
  cached = nodemailer.createTransport({
    host: required('SMTP_HOST'),
    port,
    // 465 is implicit TLS; 587 negotiates STARTTLS after connecting.
    secure: port === 465,
    auth: { user: required('SMTP_USER'), pass: required('SMTP_PASS') },
  });
  return cached;
}

export const MAIL_TO = () => required('MAIL_TO');
export const MAIL_FROM = () => required('MAIL_FROM');

/** Values arrive from a public form; escape before putting them in HTML mail. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function rowsToHtml(rows: Array<[string, string]>): string {
  const cells = rows
    .filter(([, v]) => v)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 14px 6px 0;color:#5C5C57;vertical-align:top;white-space:nowrap">${escapeHtml(
          label
        )}</td><td style="padding:6px 0;color:#1A1A18">${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`
    )
    .join('');
  return `<table style="border-collapse:collapse;font:14px/1.6 system-ui,Segoe UI,Arial,sans-serif">${cells}</table>`;
}

export function rowsToText(rows: Array<[string, string]>): string {
  return rows
    .filter(([, v]) => v)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}
