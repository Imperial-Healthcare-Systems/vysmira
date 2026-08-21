import { transporter, MAIL_TO, MAIL_FROM, rowsToHtml, rowsToText } from '@/lib/mail';
import { validate, respond, type Field } from '@/lib/form';

// nodemailer needs Node APIs; this cannot run on the edge runtime.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FIELDS: Field[] = [
  { name: 'name', label: 'Name', required: true, max: 120 },
  { name: 'email', label: 'Work email', required: true, email: true, max: 160 },
  { name: 'company', label: 'Company', required: true, max: 160 },
  { name: 'phone', label: 'Phone', max: 40 },
  { name: 'need', label: 'What you need', max: 120 },
  { name: 'role_area', label: 'Role or skill area', max: 200 },
  { name: 'message', label: 'Requirement', required: true, max: 5000 },
];

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = validate(await request.formData(), FIELDS);
  } catch {
    return respond(request, { ok: false, status: 400, error: 'Could not read the form.' });
  }

  if (!parsed.ok) return respond(request, parsed);
  const v = parsed.values;

  const rows: Array<[string, string]> = [
    ['Name', v.name],
    ['Company', v.company],
    ['Email', v.email],
    ['Phone', v.phone],
    ['What they need', v.need],
    ['Role / skill area', v.role_area],
    ['Requirement', v.message],
  ];

  try {
    await transporter().sendMail({
      from: MAIL_FROM(),
      to: MAIL_TO(),
      // So hitting reply in the inbox goes straight back to the enquirer.
      replyTo: `${v.name} <${v.email}>`,
      subject: `Enquiry — ${v.name}, ${v.company}`,
      text: rowsToText(rows) + '\n\n— Sent from the enquiry form on vysmirasolutions.com',
      html:
        `<p style="font:14px system-ui,Segoe UI,Arial,sans-serif;color:#5C5C57">New enquiry from the website</p>` +
        rowsToHtml(rows),
    });
  } catch (err) {
    console.error('[enquiry] send failed:', err);
    return respond(request, {
      ok: false,
      status: 502,
      error: 'We could not send your enquiry just now. Please email info@vysmira.com directly.',
    });
  }

  return respond(request, { ok: true });
}
