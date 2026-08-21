import { transporter, MAIL_TO, MAIL_FROM, rowsToHtml, rowsToText } from '@/lib/mail';
import { validate, respond, type Field } from '@/lib/form';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIELDS: Field[] = [
  { name: 'cv-name', label: 'Name', required: true, max: 120 },
  { name: 'cv-email', label: 'Email', required: true, email: true, max: 160 },
  { name: 'cv-phone', label: 'Phone', required: true, max: 40 },
  { name: 'cv-company', label: 'Current employer', max: 160 },
  { name: 'cv-role', label: 'Current role', max: 160 },
  { name: 'cv-exp', label: 'Experience', max: 60 },
  { name: 'cv-skill', label: 'Skill area', required: true, max: 200 },
  { name: 'cv-location', label: 'Preferred location', max: 120 },
];

// Vercel caps a serverless request body at 4.5MB, so the client limit is 4MB.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = /\.(pdf|docx?)$/i;

export async function POST(request: Request) {
  let data: FormData;
  try {
    data = await request.formData();
  } catch {
    return respond(request, { ok: false, status: 413, error: 'That file was too large to upload.' });
  }

  const parsed = validate(data, FIELDS);
  if (!parsed.ok) return respond(request, parsed);
  const v = parsed.values;

  const file = data.get('cv-file');
  if (!(file instanceof File) || file.size === 0) {
    return respond(request, { ok: false, status: 400, error: 'Please attach your CV.' });
  }
  if (!ALLOWED.test(file.name)) {
    return respond(request, { ok: false, status: 400, error: 'Upload a PDF, DOC or DOCX file.' });
  }
  if (file.size > MAX_BYTES) {
    return respond(request, { ok: false, status: 413, error: 'This file is larger than 4MB. Please upload a smaller file.' });
  }

  const rows: Array<[string, string]> = [
    ['Name', v['cv-name']],
    ['Email', v['cv-email']],
    ['Phone', v['cv-phone']],
    ['Current employer', v['cv-company']],
    ['Current role', v['cv-role']],
    ['Experience', v['cv-exp']],
    ['Skill area', v['cv-skill']],
    ['Preferred location', v['cv-location']],
    ['CV file', `${file.name} (${Math.round(file.size / 1024)} KB)`],
  ];

  try {
    await transporter().sendMail({
      from: MAIL_FROM(),
      to: MAIL_TO(),
      replyTo: `${v['cv-name']} <${v['cv-email']}>`,
      subject: `CV — ${v['cv-name']}, ${v['cv-skill']}`,
      text: rowsToText(rows) + '\n\n— Sent from the CV form on vysmirasolutions.com',
      html:
        `<p style="font:14px system-ui,Segoe UI,Arial,sans-serif;color:#5C5C57">New CV submission from the website</p>` +
        rowsToHtml(rows),
      attachments: [
        {
          filename: file.name.replace(/[^\w.\- ]+/g, '_'),
          content: Buffer.from(await file.arrayBuffer()),
          contentType: file.type || 'application/octet-stream',
        },
      ],
    });
  } catch (err) {
    console.error('[cv] send failed:', err);
    return respond(request, {
      ok: false,
      status: 502,
      error: 'We could not send your CV just now. Please email info@vysmira.com directly.',
    });
  }

  return respond(request, { ok: true });
}
