'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireOwner } from '@/lib/auth';

export async function setActive(fd: FormData) {
  const owner = await requireOwner();
  const id = String(fd.get('id'));
  if (id === owner.id) return;
  await db.user.updateMany({ where: { id, role: 'FREELANCER' }, data: { active: fd.get('active') === 'true' } });
  revalidatePath('/freelancers');
}
