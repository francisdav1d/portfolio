// Demo data for local development. Run: npm run db:seed
// All accounts use the password "password123".
import { PrismaClient, type InvoiceStatus, type PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { computeTotals } from '../src/lib/money';

const db = new PrismaClient();
const DAY = 86_400_000;
const today = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
const daysAgo = (n: number) => new Date(today.getTime() - n * DAY);

async function main() {
  const ownerEmail = (process.env.OWNER_EMAIL ?? 'owner@example.com').toLowerCase();
  const passwordHash = await bcrypt.hash('password123', 10);

  const owner = await db.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      name: 'Francis David',
      businessName: 'Francis David Studio',
      role: 'OWNER',
      passwordHash,
      address: '123 Market St\nSan Francisco, CA 94103',
      bankName: 'Chase Bank',
      bankAccountName: 'Francis David Studio LLC',
      bankAccountNumber: '000123456789',
      bankRouting: '021000021',
      bankSwift: 'CHASUS33',
      wiseEmail: ownerEmail,
      paypalEmail: ownerEmail,
      paymentNotes: 'Bank transfer preferred for amounts over $2,000.',
      defaultTerms: 'Payment due within 14 days. Thank you for your business!',
      nextInvoiceNumber: 1,
    },
  });

  const freelancers = await Promise.all(
    [
      { email: 'maya@example.com', name: 'Maya Chen', businessName: 'Maya Chen Design' },
      { email: 'omar@example.com', name: 'Omar Haddad', businessName: null },
    ].map((f) =>
      db.user.upsert({
        where: { email: f.email },
        update: {},
        create: { ...f, passwordHash, role: 'FREELANCER', wiseEmail: f.email, invoicePrefix: f.name.split(' ')[0].toUpperCase() },
      }),
    ),
  );

  const clients = await Promise.all(
    [
      { name: 'Sarah Miller', company: 'Acme Corp', email: 'sarah@acme.test', address: '500 5th Ave\nNew York, NY 10110' },
      { name: 'James Park', company: 'Northwind Labs', email: 'james@northwind.test', ccEmails: 'ap@northwind.test' },
      { name: 'Priya Raman', company: null, email: 'priya@example.test' },
    ].map((c) => db.client.create({ data: { ...c, ownerId: owner.id } })),
  );

  let n = 1;
  async function invoice(opts: {
    issuerId: string;
    clientId?: string;
    recipientId?: string;
    issued: number;
    termDays: number;
    status: InvoiceStatus;
    items: [string, number, number][];
    payments?: [number, PaymentMethod, number, string?][];
    number?: string;
  }) {
    const t = computeTotals({
      items: opts.items.map(([description, quantity, price]) => ({ description, quantity, unitPriceCents: price * 100 })),
      discountType: 'PERCENT',
      discountValue: 0,
      taxRate: 0,
    });
    const paidCents = (opts.payments ?? []).reduce((s, p) => s + p[0] * 100, 0);
    const issueDate = daysAgo(opts.issued);
    const inv = await db.invoice.create({
      data: {
        kind: opts.clientId ? 'OUTGOING' : 'INTERNAL',
        number: opts.number ?? `INV-${String(n++).padStart(4, '0')}`,
        issuerId: opts.issuerId,
        clientId: opts.clientId,
        recipientId: opts.recipientId,
        status: opts.status,
        issueDate,
        dueDate: new Date(issueDate.getTime() + opts.termDays * DAY),
        subtotalCents: t.subtotalCents,
        totalCents: t.totalCents,
        paidCents,
        sentAt: opts.status !== 'DRAFT' ? issueDate : null,
        submittedAt: opts.recipientId && opts.status !== 'DRAFT' ? issueDate : null,
        paidAt: opts.status === 'PAID' ? daysAgo(Math.max(opts.issued - 10, 0)) : null,
        items: { create: t.items.map((i, position) => ({ ...i, position })) },
        payments: {
          create: (opts.payments ?? []).map(([amt, method, ago, reference]) => ({
            amountCents: amt * 100,
            method,
            paidAt: daysAgo(ago),
            reference,
            recordedById: opts.clientId ? owner.id : owner.id,
          })),
        },
      },
    });
    await db.activity.create({ data: { invoiceId: inv.id, actorId: opts.issuerId, type: 'created', message: 'Invoice created (seed data)' } });
    return inv;
  }

  const [acme, northwind, priya] = clients;
  await invoice({ issuerId: owner.id, clientId: acme.id, issued: 300, termDays: 30, status: 'PAID', items: [['Brand strategy workshop', 1, 4800]], payments: [[4800, 'BANK_TRANSFER', 280, 'WIRE-88231']] });
  await invoice({ issuerId: owner.id, clientId: northwind.id, issued: 210, termDays: 14, status: 'PAID', items: [['Landing page design', 1, 2200], ['Revisions (hours)', 6, 95]], payments: [[2770, 'BANK_TRANSFER', 195, 'ACH 55120']] });
  await invoice({ issuerId: owner.id, clientId: priya.id, issued: 150, termDays: 14, status: 'PAID', items: [['Logo refresh', 1, 650]], payments: [[650, 'WISE', 140, 'TRF-1029384']] });
  await invoice({ issuerId: owner.id, clientId: acme.id, issued: 95, termDays: 30, status: 'PAID', items: [['Website build — phase 1', 1, 7500]], payments: [[4000, 'BANK_TRANSFER', 70], [3500, 'BANK_TRANSFER', 50]] });
  await invoice({ issuerId: owner.id, clientId: priya.id, issued: 60, termDays: 7, status: 'PAID', items: [['Social media kit', 1, 380]], payments: [[380, 'PAYPAL', 52, '9XK33211AB']] });
  await invoice({ issuerId: owner.id, clientId: northwind.id, issued: 40, termDays: 14, status: 'PARTIAL', items: [['Design system audit', 1, 3200]], payments: [[1200, 'WISE', 20, 'TRF-2210044']] });
  await invoice({ issuerId: owner.id, clientId: acme.id, issued: 12, termDays: 30, status: 'VIEWED', items: [['Website build — phase 2', 1, 6800], ['Hosting setup', 1, 250]] });
  await invoice({ issuerId: owner.id, clientId: priya.id, issued: 3, termDays: 14, status: 'SENT', items: [['Monthly retainer — October', 1, 900]] });
  await invoice({ issuerId: owner.id, clientId: northwind.id, issued: 0, termDays: 14, status: 'DRAFT', items: [['Prototype iteration', 10, 110]] });
  await db.user.update({ where: { id: owner.id }, data: { nextInvoiceNumber: n } });

  const [maya, omar] = freelancers;
  await invoice({ issuerId: maya.id, recipientId: owner.id, number: 'MAYA-0001', issued: 70, termDays: 14, status: 'PAID', items: [['Illustrations for Acme site', 8, 120]], payments: [[960, 'WISE', 55]] });
  await invoice({ issuerId: maya.id, recipientId: owner.id, number: 'MAYA-0002', issued: 2, termDays: 14, status: 'SUBMITTED', items: [['Icon set (24 icons)', 24, 35]] });
  await invoice({ issuerId: omar.id, recipientId: owner.id, number: 'OMAR-0001', issued: 25, termDays: 14, status: 'APPROVED', items: [['Frontend development (hours)', 32, 75]] });
  await invoice({ issuerId: omar.id, recipientId: owner.id, number: 'OMAR-0002', issued: 1, termDays: 14, status: 'SUBMITTED', items: [['QA and bug fixes (hours)', 10, 75]] });
  await db.user.update({ where: { id: maya.id }, data: { nextInvoiceNumber: 3 } });
  await db.user.update({ where: { id: omar.id }, data: { nextInvoiceNumber: 3 } });

  console.log(`Seeded. Sign in as ${ownerEmail}, maya@example.com or omar@example.com with password "password123".`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
