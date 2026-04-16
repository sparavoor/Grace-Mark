'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function createUnit(formData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name');
  const sectorId = formData.get('sectorId');

  if (!name || !sectorId) return { error: 'Missing required fields' };

  try {
    await prisma.unit.create({
      data: { name, sectorId }
    });

    revalidatePath('/admin/units');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function updateUnit(unitId, formData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name');
  const sectorId = formData.get('sectorId');

  if (!name || !sectorId) return { error: 'Missing required fields' };

  try {
    await prisma.unit.update({
      where: { id: unitId },
      data: { name, sectorId }
    });

    revalidatePath('/admin/units');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deleteUnit(unitId) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    await prisma.$transaction(async (tx) => {
      // Cascading deletion of any reports tied strictly to this unit
      await tx.meetingReport.deleteMany({ where: { unitId } });
      await tx.unit.delete({ where: { id: unitId } });
    });

    revalidatePath('/admin/units');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}
