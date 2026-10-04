# Invoices

Your own invoicing platform. You bill clients by email; freelancers bill you through the app.

## What it does

**You (owner)**
- Clients: billing details, CC emails (e.g. their AP team), outstanding and overdue totals per client
- Invoices: line items (hours or fixed), discount (% or amount), tax, notes, terms, multi-currency, auto numbering
- **Send**: the client gets a styled email with a "View invoice" link and the PDF attached. Replies go to you.
- **Tracking**: Draft → Sent → Viewed (when the client opens the link) → Partially paid → Paid, plus Overdue
- **Reminders**: a "Send reminder" button, plus an automatic daily job (3 days before due, then weekly while overdue, at most 6)
- **Payments**: record Bank transfer / Wise / PayPal / Other with a reference number. Partial payments are supported, and you can optionally email a receipt.
- **Inbox**: freelancer invoices wait here for you to approve or send back (with a reason). You record payment once you've paid.
- Dashboard: outstanding, overdue, received this month, what you owe freelancers, monthly chart, totals by payment method
- Freelancers page: what you owe each one, and deactivate accounts
- CSV export of invoices and payments

**Freelancers**
- Sign up, add their own Wise/bank/PayPal details
- Create an invoice. "Send to" defaults to you, and they can pick another account.
- Get emailed when you approve, send back, or pay. They edit and resubmit if sent back.

## Run it locally

```bash
cd invoice
npm install
cp .env.example .env     # then fill in AUTH_SECRET and OWNER_EMAIL
```

To develop without Neon, run a local Postgres in a second terminal:

```bash
npm run db:local
```

and point `.env` at it:

```
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/postgres?sslmode=disable&connection_limit=1&pgbouncer=true"
DIRECT_URL="postgresql://postgres:postgres@127.0.0.1:5433/postgres?sslmode=disable&connection_limit=1&pgbouncer=true"
```

Then:

```bash
npm run db:migrate
npm run db:seed          # optional demo data; every account's password is "password123"
npm run dev              # http://localhost:3100
```

With `RESEND_API_KEY` empty, emails aren't sent. They're saved to `./.emails/` as HTML (plus the PDF) so you can open them in a browser.

## Deploy (Vercel + Neon + Resend)

1. **Neon**: create a project and copy both connection strings, pooled → `DATABASE_URL` and direct → `DIRECT_URL`.
2. **Resend**: add and verify your domain, create an API key, and set `EMAIL_FROM` to an address on that domain, e.g. `Francis David <invoices@yourdomain.com>`.
3. **Vercel**: create a **new project** from this repo with **Root Directory = `invoice`**. Add the environment variables from `.env.example`:
   - `AUTH_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `OWNER_EMAIL`: your email. Whoever signs up with it becomes the owner.
   - `APP_URL`: the deployed URL, e.g. `https://invoices.yourdomain.com`
   - `CRON_SECRET`: any random string. Vercel Cron sends it automatically.
   - `SIGNUP_CODE` (recommended): freelancers must enter this to sign up
4. Deploy. The build runs the database migrations. Then sign up with `OWNER_EMAIL` and fill in **Settings → How you get paid**.

The reminder cron (`vercel.json`) runs daily at 15:00 UTC.

## Notes

- Money is stored as integer cents. Dashboard totals only count your default currency.
- The public invoice link (`/i/<token>`) is unguessable and only exists for sent client invoices. Drafts and freelancer invoices are never public.
- Views you make of your own invoice link aren't counted as client views.
