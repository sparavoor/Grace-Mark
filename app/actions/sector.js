'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import bcrypt from 'bcrypt';
import { revalidatePath } from 'next/cache';

export async function createSector(formData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name');
  const username = formData.get('username');
  const password = formData.get('password');

  if (!name || !username || !password) return { error: 'Missing required fields' };

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user and sector transactionally
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { username, passwordHash, role: 'SECTOR' }
      });
      await tx.sector.create({
        data: { name, userId: user.id }
      });
    });

    revalidatePath('/admin/sectors');
    return { success: true };
  } catch (e) {
    return { error: 'Username might already exist or invalid data.' };
  }
}

export async function updateSector(sectorId, formData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name');
  const password = formData.get('password'); // Optional update

  if (!name) return { error: 'Sector name is required' };

  try {
    const sector = await prisma.sector.findUnique({ where: { id: sectorId } });

    await prisma.$transaction(async (tx) => {
      await tx.sector.update({ where: { id: sectorId }, data: { name } });
      
      if (password) {
        const passwordHash = await bcrypt.hash(password, 10);
        await tx.user.update({ where: { id: sector.userId }, data: { passwordHash } });
      }
    });

    revalidatePath('/admin/sectors');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function deleteSector(sectorId) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    const sector = await prisma.sector.findUnique({ where: { id: sectorId } });
    if (!sector) return { error: 'Sector not found' };

    await prisma.$transaction(async (tx) => {
      // Cascading deletion
      await tx.meetingReport.deleteMany({ where: { sectorId } });
      await tx.unit.deleteMany({ where: { sectorId } });
      await tx.sector.delete({ where: { id: sectorId } });
      await tx.user.delete({ where: { id: sector.userId } });
    });

    revalidatePath('/admin/sectors');
    revalidatePath('/admin/dashboard');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}
