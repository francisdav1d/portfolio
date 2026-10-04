import 'server-only';
import { Document, Font, Page, StyleSheet, Text, View, renderToBuffer } from '@react-pdf/renderer';
import { formatDate, formatMoney } from './money';
import { billTo, issuerName, paymentInstructions, type FullInvoice } from './invoice-query';
import { STATUS_LABEL, displayStatus } from './status';

// Never hyphenate: it splits emails, account numbers and names.
Font.registerHyphenationCallback((word) => [word]);

const ACCENT = '#4f46e5';
const MUTED = '#71717a';
const LINE = '#e4e4e7';

const s = StyleSheet.create({
  page: { padding: 44, paddingBottom: 56, fontSize: 10, fontFamily: 'Helvetica', color: '#18181b', lineHeight: 1.4 },
  row: { flexDirection: 'row' },
  between: { flexDirection: 'row', justifyContent: 'space-between' },
  // Explicit line heights: an inherited page lineHeight resolves to the body size and makes large text overlap.
  brand: { fontSize: 18, lineHeight: 1.25, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  title: { fontSize: 26, lineHeight: 1.15, fontFamily: 'Helvetica-Bold', color: ACCENT, textAlign: 'right', marginBottom: 2 },
  muted: { color: MUTED },
  label: { fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  bold: { fontFamily: 'Helvetica-Bold' },
  th: { fontSize: 8, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.8 },
  tableHead: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#18181b', paddingBottom: 6, marginTop: 28 },
  tr: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: LINE, paddingVertical: 8 },
  cDesc: { flex: 1, paddingRight: 8 },
  cQty: { width: 50, textAlign: 'right' },
  cPrice: { width: 80, textAlign: 'right' },
  cAmt: { width: 90, textAlign: 'right' },
  totals: { marginTop: 12, marginLeft: 'auto', width: 230 },
  tRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  due: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 4,
  },
  box: { marginTop: 28, padding: 14, backgroundColor: '#fafafa', borderRadius: 6, borderWidth: 1, borderColor: LINE },
  status: { fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right', marginTop: 4 },
});

function InvoicePdf({ inv }: { inv: FullInvoice }) {
  const to = billTo(inv);
  const from = inv.issuer;
  const balance = inv.totalCents - inv.paidCents;
  const status = displayStatus(inv);
  const pay = paymentInstructions(from);
  const statusColor = status === 'PAID' ? '#059669' : status === 'OVERDUE' ? '#dc2626' : MUTED;

  return (
    <Document title={`Invoice ${inv.number}`} author={issuerName(from)}>
      <Page size="LETTER" style={s.page}>
        <View style={s.between}>
          <View style={{ maxWidth: 260 }}>
            <Text style={s.brand}>{issuerName(from)}</Text>
            {from.businessName ? <Text style={s.muted}>{from.name}</Text> : null}
            {from.address ? <Text style={s.muted}>{from.address}</Text> : null}
            <Text style={s.muted}>{from.email}</Text>
            {from.phone ? <Text style={s.muted}>{from.phone}</Text> : null}
            {from.taxId ? <Text style={s.muted}>Tax ID: {from.taxId}</Text> : null}
          </View>
          <View>
            <Text style={s.title}>INVOICE</Text>
            <Text style={{ textAlign: 'right', fontSize: 12 }}>{inv.number}</Text>
            {status !== 'DRAFT' ? <Text style={[s.status, { color: statusColor }]}>{STATUS_LABEL[status].toUpperCase()}</Text> : null}
          </View>
        </View>

        <View style={[s.between, { marginTop: 32 }]}>
          <View style={{ maxWidth: 260 }}>
            <Text style={s.label}>Bill to</Text>
            <Text style={s.bold}>{to.name}</Text>
            {to.contact ? <Text>{to.contact}</Text> : null}
            {to.address ? <Text style={s.muted}>{to.address}</Text> : null}
            <Text style={s.muted}>{to.email}</Text>
            {to.taxId ? <Text style={s.muted}>Tax ID: {to.taxId}</Text> : null}
          </View>
          <View style={{ width: 200 }}>
            {[
              ['Issue date', formatDate(inv.issueDate)],
              ['Due date', formatDate(inv.dueDate)],
              ['Currency', inv.currency],
            ].map(([k, v]) => (
              <View key={k} style={s.tRow}>
                <Text style={s.muted}>{k}</Text>
                <Text>{v}</Text>
              </View>
            ))}
            <View style={s.due}>
              <Text style={s.bold}>Balance due</Text>
              <Text style={s.bold}>{formatMoney(balance, inv.currency)}</Text>
            </View>
          </View>
        </View>

        <View style={s.tableHead}>
          <Text style={[s.th, s.cDesc]}>Description</Text>
          <Text style={[s.th, s.cQty]}>Qty</Text>
          <Text style={[s.th, s.cPrice]}>Rate</Text>
          <Text style={[s.th, s.cAmt]}>Amount</Text>
        </View>
        {inv.items.map((i) => (
          <View key={i.id} style={s.tr} wrap={false}>
            <Text style={s.cDesc}>{i.description}</Text>
            <Text style={s.cQty}>{i.quantity}</Text>
            <Text style={s.cPrice}>{formatMoney(i.unitPriceCents, inv.currency)}</Text>
            <Text style={s.cAmt}>{formatMoney(i.amountCents, inv.currency)}</Text>
          </View>
        ))}

        <View style={s.totals} wrap={false}>
          <View style={s.tRow}>
            <Text style={s.muted}>Subtotal</Text>
            <Text>{formatMoney(inv.subtotalCents, inv.currency)}</Text>
          </View>
          {inv.discountCents ? (
            <View style={s.tRow}>
              <Text style={s.muted}>Discount{inv.discountType === 'PERCENT' ? ` (${inv.discountValue}%)` : ''}</Text>
              <Text>-{formatMoney(inv.discountCents, inv.currency)}</Text>
            </View>
          ) : null}
          {inv.taxCents ? (
            <View style={s.tRow}>
              <Text style={s.muted}>Tax ({inv.taxRate}%)</Text>
              <Text>{formatMoney(inv.taxCents, inv.currency)}</Text>
            </View>
          ) : null}
          <View style={[s.tRow, { borderTopWidth: 1, borderTopColor: LINE, marginTop: 4, paddingTop: 6 }]}>
            <Text style={s.bold}>Total</Text>
            <Text style={s.bold}>{formatMoney(inv.totalCents, inv.currency)}</Text>
          </View>
          {inv.paidCents ? (
            <View style={s.tRow}>
              <Text style={s.muted}>Paid</Text>
              <Text>-{formatMoney(inv.paidCents, inv.currency)}</Text>
            </View>
          ) : null}
          <View style={s.due}>
            <Text style={s.bold}>Balance due</Text>
            <Text style={s.bold}>{formatMoney(balance, inv.currency)}</Text>
          </View>
        </View>

        {inv.notes ? (
          <View style={{ marginTop: 24 }} wrap={false}>
            <Text style={s.label}>Notes</Text>
            <Text>{inv.notes}</Text>
          </View>
        ) : null}

        {pay.length || from.paymentNotes ? (
          <View style={s.box}>
            <Text style={s.label}>Payment details · reference {inv.number}</Text>
            <View style={[s.row, { marginTop: 4 }]}>
              {pay.map((g) => (
                <View key={g.title} style={{ flex: 1, paddingRight: 12 }}>
                  <Text style={[s.bold, { marginBottom: 2 }]}>{g.title}</Text>
                  {g.lines.map((l) => (
                    <Text key={l.label}>
                      <Text style={s.muted}>{l.label}: </Text>
                      {l.value}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
            {from.paymentNotes ? <Text style={[s.muted, { marginTop: 8 }]}>{from.paymentNotes}</Text> : null}
          </View>
        ) : null}

        {inv.terms ? (
          <View style={{ marginTop: 20 }} wrap={false}>
            <Text style={s.label}>Terms</Text>
            <Text style={s.muted}>{inv.terms}</Text>
          </View>
        ) : null}

        <Text
          fixed
          style={{ position: 'absolute', bottom: 22, left: 0, right: 0, fontSize: 8, lineHeight: 1.2, color: MUTED, textAlign: 'center' }}
        >
          {inv.number} · {issuerName(from)} · {from.email}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(inv: FullInvoice) {
  return renderToBuffer(<InvoicePdf inv={inv} />);
}
