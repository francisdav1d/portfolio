import 'server-only';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Resend } from 'resend';

export type Attachment = { filename: string; content: Buffer };

export type EmailInput = {
  to: string | string[];
  cc?: string[];
  replyTo?: string;
  subject: string;
  html: string;
  attachments?: Attachment[];
};

export async function sendEmail(input: EmailInput): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    // Dev fallback: write the email to disk so it can be opened in a browser.
    const dir = path.join(process.cwd(), '.emails');
    await mkdir(dir, { recursive: true });
    const slug = input.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60);
    const file = path.join(dir, `${Date.now()}-${slug}.html`);
    const header = `<!-- to: ${[input.to].flat().join(', ')} | cc: ${(input.cc ?? []).join(', ')} | attachments: ${(input.attachments ?? []).map((a) => a.filename).join(', ')} -->\n`;
    await writeFile(file, header + input.html);
    for (const a of input.attachments ?? []) await writeFile(file.replace(/\.html$/, `-${a.filename}`), a.content);
    console.log(`[email] RESEND_API_KEY not set — saved "${input.subject}" to ${file}`);
    return { ok: true };
  }

  const from = process.env.EMAIL_FROM;
  if (!from) return { ok: false, error: 'EMAIL_FROM is not configured' };

  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    cc: input.cc?.length ? input.cc : undefined,
    replyTo: input.replyTo,
    subject: input.subject,
    html: input.html,
    attachments: input.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id };
}

export function appUrl(p = '') {
  const base = (process.env.APP_URL ?? 'http://localhost:3100').replace(/\/$/, '');
  return base + p;
}
