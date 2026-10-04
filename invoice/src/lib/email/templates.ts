import { formatDate, formatMoney } from '../money';
import { billTo, issuerName, paymentInstructions, type FullInvoice } from '../invoice-query';
import { appUrl } from './send';

const ACCENT = '#4f46e5';
const INK = '#18181b';
const MUTED = '#71717a';
const LINE = '#e4e4e7';
const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;

export function esc(s: string | null | undefined) {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const nl2br = (s: string | null | undefined) => esc(s).replace(/\n/g, '<br>');

function layout(opts: { preheader: string; brand: string; body: string; footer?: string }) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${esc(opts.brand)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:${FONT};color:${INK};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5">
<tr><td align="center" style="padding:32px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
    <tr><td style="padding:0 4px 16px;font-size:15px;font-weight:700;letter-spacing:-0.01em;color:${INK}">${esc(opts.brand)}</td></tr>
    <tr><td style="background:#ffffff;border:1px solid ${LINE};border-radius:14px;overflow:hidden">${opts.body}</td></tr>
    <tr><td style="padding:20px 4px;font-size:12px;line-height:18px;color:${MUTED};text-align:center">${opts.footer ?? ''}</td></tr>
  </table>
</td></tr></table></body></html>`;
}

function button(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="border-radius:10px;background:${ACCENT}">
<a href="${esc(href)}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px">${esc(label)}</a>
</td></tr></table>`;
}

function itemsTable(inv: FullInvoice) {
  const rows = inv.items
    .map(
      (i) => `<tr>
<td style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:14px;line-height:20px">${nl2br(i.description)}
<div style="font-size:12px;color:${MUTED}">${i.quantity} × ${formatMoney(i.unitPriceCents, inv.currency)}</div></td>
<td align="right" style="padding:10px 0;border-bottom:1px solid ${LINE};font-size:14px;white-space:nowrap;vertical-align:top">${formatMoney(i.amountCents, inv.currency)}</td></tr>`,
    )
    .join('');
  const total = (label: string, cents: number, strong = false) =>
    `<tr><td align="right" style="padding:6px 16px 0 0;font-size:${strong ? 15 : 13}px;color:${strong ? INK : MUTED};font-weight:${strong ? 700 : 400}">${label}</td>
<td align="right" style="padding:6px 0 0;font-size:${strong ? 15 : 13}px;font-weight:${strong ? 700 : 400};white-space:nowrap">${formatMoney(cents, inv.currency)}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:6px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED}">Description</td>
<td align="right" style="padding-bottom:6px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED}">Amount</td></tr>
${rows}
${total('Subtotal', inv.subtotalCents)}
${inv.discountCents ? total('Discount', -inv.discountCents) : ''}
${inv.taxCents ? total(`Tax (${inv.taxRate}%)`, inv.taxCents) : ''}
${total('Total', inv.totalCents, true)}
${inv.paidCents ? total('Paid', -inv.paidCents) + total('Balance due', inv.totalCents - inv.paidCents, true) : ''}
</table>`;
}

function paymentBlock(inv: FullInvoice) {
  const groups = paymentInstructions(inv.issuer);
  if (!groups.length && !inv.issuer.paymentNotes) return '';
  const cols = groups
    .map(
      (g) => `<div style="margin-bottom:14px"><div style="font-size:13px;font-weight:700;margin-bottom:4px">${esc(g.title)}</div>
${g.lines.map((l) => `<div style="font-size:13px;line-height:20px"><span style="color:${MUTED}">${esc(l.label)}:</span> ${esc(l.value)}</div>`).join('')}</div>`,
    )
    .join('');
  return `<tr><td style="padding:24px 32px;background:#fafafa;border-top:1px solid ${LINE}">
<div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED};margin-bottom:12px">How to pay</div>
${cols}
<div style="font-size:13px;line-height:20px;color:${INK}">Please include <strong>${esc(inv.number)}</strong> as the payment reference.</div>
${inv.issuer.paymentNotes ? `<div style="font-size:13px;line-height:20px;color:${MUTED};margin-top:8px">${nl2br(inv.issuer.paymentNotes)}</div>` : ''}
</td></tr>`;
}

function invoiceCard(inv: FullInvoice, opts: { eyebrow: string; headline: string; message?: string | null; cta: string }) {
  const balance = inv.totalCents - inv.paidCents;
  const link = appUrl(`/i/${inv.publicToken}`);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:32px 32px 8px">
  <div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${ACCENT};font-weight:700">${esc(opts.eyebrow)}</div>
  <div style="font-size:22px;line-height:30px;font-weight:700;margin-top:6px">${esc(opts.headline)}</div>
  ${opts.message ? `<div style="font-size:15px;line-height:24px;color:#3f3f46;margin-top:12px">${nl2br(opts.message)}</div>` : ''}
</td></tr>
<tr><td style="padding:16px 32px 8px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8ff;border:1px solid #e0e7ff;border-radius:12px">
  <tr><td style="padding:20px 22px">
    <div style="font-size:12px;color:${MUTED}">Amount due</div>
    <div style="font-size:32px;line-height:40px;font-weight:800;letter-spacing:-0.02em">${formatMoney(balance, inv.currency)}</div>
    <div style="font-size:13px;color:${MUTED};margin-top:4px">Invoice ${esc(inv.number)} · Due ${formatDate(inv.dueDate)}</div>
  </td></tr></table>
</td></tr>
<tr><td style="padding:20px 32px 28px">${button(opts.cta, link)}
<div style="font-size:12px;color:${MUTED};margin-top:10px">A PDF copy is attached to this email.</div></td></tr>
<tr><td style="padding:0 32px 28px">${itemsTable(inv)}</td></tr>
${inv.notes ? `<tr><td style="padding:0 32px 24px;font-size:13px;line-height:20px;color:#3f3f46"><div style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED};margin-bottom:6px">Notes</div>${nl2br(inv.notes)}</td></tr>` : ''}
${paymentBlock(inv)}
</table>`;
}

function footerFor(inv: FullInvoice) {
  const from = issuerName(inv.issuer);
  return `Sent by ${esc(from)} · Questions? Reply to this email or write to <a href="mailto:${esc(inv.issuer.email)}" style="color:${MUTED}">${esc(inv.issuer.email)}</a>`;
}

export function invoiceEmail(inv: FullInvoice, message?: string | null) {
  const from = issuerName(inv.issuer);
  const to = billTo(inv);
  return {
    subject: `Invoice ${inv.number} from ${from} — ${formatMoney(inv.totalCents - inv.paidCents, inv.currency)} due ${formatDate(inv.dueDate)}`,
    html: layout({
      brand: from,
      preheader: `${formatMoney(inv.totalCents - inv.paidCents, inv.currency)} due ${formatDate(inv.dueDate)}`,
      body: invoiceCard(inv, {
        eyebrow: 'New invoice',
        headline: `Hi ${to.contact ?? to.name}, here's your invoice from ${from}.`,
        message,
        cta: 'View invoice',
      }),
      footer: footerFor(inv),
    }),
  };
}

export function reminderEmail(inv: FullInvoice, daysOverdue: number, message?: string | null) {
  const from = issuerName(inv.issuer);
  const to = billTo(inv);
  const headline =
    daysOverdue > 0
      ? `Invoice ${inv.number} is ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`
      : `Friendly reminder: invoice ${inv.number} is due ${formatDate(inv.dueDate)}`;
  return {
    subject: daysOverdue > 0 ? `Reminder: invoice ${inv.number} is overdue` : `Reminder: invoice ${inv.number} due ${formatDate(inv.dueDate)}`,
    html: layout({
      brand: from,
      preheader: headline,
      body: invoiceCard(inv, {
        eyebrow: 'Payment reminder',
        headline,
        message:
          message ??
          `Hi ${to.contact ?? to.name}, just a quick reminder about this invoice. If you've already sent payment, thank you, and please ignore this note.`,
        cta: 'View invoice',
      }),
      footer: footerFor(inv),
    }),
  };
}

export function receiptEmail(inv: FullInvoice, payment: { amountCents: number; paidAt: Date }) {
  const from = issuerName(inv.issuer);
  const balance = inv.totalCents - inv.paidCents;
  const body = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:32px">
  <div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#059669;font-weight:700">Payment received</div>
  <div style="font-size:22px;line-height:30px;font-weight:700;margin-top:6px">Thank you! We received ${formatMoney(payment.amountCents, inv.currency)}.</div>
  <div style="font-size:15px;line-height:24px;color:#3f3f46;margin-top:12px">
    This payment was applied to invoice <strong>${esc(inv.number)}</strong> on ${formatDate(payment.paidAt)}.
    ${balance > 0 ? `The remaining balance is <strong>${formatMoney(balance, inv.currency)}</strong>.` : 'This invoice is now paid in full.'}
  </div>
  <div style="margin-top:24px">${button('View receipt', appUrl(`/i/${inv.publicToken}`))}</div>
</td></tr></table>`;
  return {
    subject: `Payment received for invoice ${inv.number}`,
    html: layout({ brand: from, preheader: `We received ${formatMoney(payment.amountCents, inv.currency)}`, body, footer: footerFor(inv) }),
  };
}

/** Simple notification used for in-platform events (submitted, approved, rejected, paid). */
export function noticeEmail(opts: {
  eyebrow: string;
  title: string;
  intro: string;
  rows?: [string, string][];
  cta: { label: string; href: string };
  tone?: 'default' | 'success' | 'danger';
}) {
  const color = opts.tone === 'success' ? '#059669' : opts.tone === 'danger' ? '#e11d48' : ACCENT;
  const rows = (opts.rows ?? [])
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid ${LINE};font-size:13px;color:${MUTED}">${esc(k)}</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${LINE};font-size:14px;font-weight:600">${esc(v)}</td></tr>`,
    )
    .join('');
  const body = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px">
<div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${color};font-weight:700">${esc(opts.eyebrow)}</div>
<div style="font-size:22px;line-height:30px;font-weight:700;margin-top:6px">${esc(opts.title)}</div>
<div style="font-size:15px;line-height:24px;color:#3f3f46;margin-top:12px">${nl2br(opts.intro)}</div>
${rows ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px">${rows}</table>` : ''}
<div style="margin-top:24px">${button(opts.cta.label, opts.cta.href)}</div>
</td></tr></table>`;
  return { subject: opts.title, html: layout({ brand: 'Invoices', preheader: opts.intro.slice(0, 120), body }) };
}
