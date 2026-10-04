'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import {
  deleteDraft,
  deletePayment,
  duplicateInvoice,
  markSentManually,
  recordPayment,
  reviewInvoice,
  saveInvoice,
  sendInvoiceEmail,
  submitInvoice,
  voidInvoice,
} from '@/lib/invoices';
import type { FormState } from '../../(auth)/actions';

const str = (fd: FormData, k: string) => String(fd.get(k) ?? '');

function refresh(id: string) {
  revalidatePath(`/invoices/${id}`);
  revalidatePath('/', 'layout');
}

export async function saveInvoiceAction(payload: unknown, intent: 'draft' | 'send' | 'submit') {
  const user = await requireUser();
  const res = await saveInvoice(user, payload);
  if (!res.ok) return { error: res.error };
  const id = res.data!.id;

  if (intent === 'submit') {
    const sub = await submitInvoice(user, id);
    if (!sub.ok) return { error: sub.error };
    refresh(id);
    redirect(`/invoices/${id}?flash=submitted`);
  }
  refresh(id);
  redirect(intent === 'send' ? `/invoices/${id}?send=1` : `/invoices/${id}?flash=saved`);
}

export async function sendAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = str(fd, 'id');
  const reminder = fd.get('reminder') === '1';
  const res = await sendInvoiceEmail(user, id, { message: str(fd, 'message').trim() || undefined, reminder });
  if (!res.ok) return { error: res.error };
  refresh(id);
  redirect(`/invoices/${id}?flash=${reminder ? 'reminded' : 'sent'}`);
}

export async function markSentAction(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, 'id');
  await markSentManually(user, id);
  refresh(id);
}

export async function submitAction(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, 'id');
  await submitInvoice(user, id);
  refresh(id);
  redirect(`/invoices/${id}?flash=submitted`);
}

export async function reviewAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = str(fd, 'id');
  const decision = str(fd, 'decision') === 'approve' ? 'approve' : 'reject';
  const res = await reviewInvoice(user, id, decision, str(fd, 'reason'));
  if (!res.ok) return { error: res.error };
  refresh(id);
  redirect(`/invoices/${id}?flash=${decision === 'approve' ? 'approved' : 'rejected'}`);
}

export async function paymentAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = str(fd, 'id');
  const res = await recordPayment(user, id, {
    amount: str(fd, 'amount'),
    method: str(fd, 'method'),
    paidAt: str(fd, 'paidAt'),
    reference: str(fd, 'reference'),
    note: str(fd, 'note'),
    sendReceipt: fd.get('sendReceipt') === 'on',
  });
  if (!res.ok) return { error: res.error };
  refresh(id);
  redirect(`/invoices/${id}?flash=paid`);
}

export async function deletePaymentAction(fd: FormData) {
  const user = await requireUser();
  await deletePayment(user, str(fd, 'paymentId'));
  refresh(str(fd, 'id'));
}

export async function voidAction(fd: FormData) {
  const user = await requireUser();
  const id = str(fd, 'id');
  await voidInvoice(user, id);
  refresh(id);
}

export async function duplicateAction(fd: FormData) {
  const user = await requireUser();
  const res = await duplicateInvoice(user, str(fd, 'id'));
  if (res.ok) redirect(`/invoices/${res.data!.id}/edit`);
}

export async function deleteAction(fd: FormData) {
  const user = await requireUser();
  const res = await deleteDraft(user, str(fd, 'id'));
  if (res.ok) {
    revalidatePath('/', 'layout');
    redirect('/invoices');
  }
}
