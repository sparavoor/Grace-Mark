'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

// Calculate marks on server side to avoid manipulation
function calculateMarksForType(type, percentage, targetSteps = null) {
  const pct = parseFloat(percentage) || 0;
  
  if (type === 'UNIT_SAHITYOTSAV') {
    if (pct >= 100) return 15;
    if (pct >= 90) return 12;
    if (pct >= 80) return 8;
    if (pct >= 70) return 5;
    return 0;
  }
  
  if (type === 'BRIGHT_UNIT_SAHITYOTSAV') {
    if (pct >= 100) return 25;
    if (pct >= 80) return 20;
    if (pct >= 60) return 15;
    if (pct >= 40) return 10;
    if (pct >= 20) return 5;
    return 0;
  }
  
  if (type === 'SHINE_SECTOR') {
    if (targetSteps && targetSteps > 0) {
      return pct >= targetSteps ? 20 : 0;
    }
    // Proportional up to 20 marks for 100% completed
    return parseFloat(((pct / 100) * 20).toFixed(2));
  }
  
  return 0;
}

// Admin Action: Create Grace Mark Criteria
export async function createGraceMarkCriteria(formData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name');
  const type = formData.get('type');
  const description = formData.get('description');
  const isActive = formData.get('isActive') === 'true';
  const targetStepsRaw = formData.get('targetSteps');
  const targetSteps = targetStepsRaw ? parseInt(targetStepsRaw) || null : null;

  if (!name || !type) return { error: 'Name and Type are required' };

  try {
    const criteria = await prisma.graceMarkCriteria.create({
      data: {
        name,
        type,
        description,
        isActive,
        targetSteps
      }
    });

    revalidatePath('/admin/grace-marks');
    return { success: true, criteria };
  } catch (e) {
    return { error: e.message };
  }
}

// Admin Action: Toggle Active Status of Criteria (Tick/Untick)
export async function toggleGraceMarkCriteria(id, isActive) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    await prisma.graceMarkCriteria.update({
      where: { id },
      data: { isActive }
    });

    revalidatePath('/admin/grace-marks');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

// Admin Action: Delete Grace Mark Criteria
export async function deleteGraceMarkCriteria(id) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.graceMarkSubmission.deleteMany({ where: { criteriaId: id } });
      await tx.graceMarkCriteria.delete({ where: { id } });
    });

    revalidatePath('/admin/grace-marks');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

// Admin Action: Update Grace Mark Criteria
export async function updateGraceMarkCriteria(id, formData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name');
  const type = formData.get('type');
  const description = formData.get('description');
  const isActive = formData.get('isActive') === 'true';
  const targetStepsRaw = formData.get('targetSteps');
  const targetSteps = targetStepsRaw ? parseInt(targetStepsRaw) || null : null;

  if (!name || !type) return { error: 'Name and Type are required' };

  try {
    const criteria = await prisma.graceMarkCriteria.update({
      where: { id },
      data: {
        name,
        type,
        description,
        isActive,
        targetSteps
      }
    });

    revalidatePath('/admin/grace-marks');
    return { success: true, criteria };
  } catch (e) {
    return { error: e.message };
  }
}

// Sector Action: Submit or Update Grace Marks Percentage & Checklist Tick
export async function submitSectorGraceMarks(criteriaId, percentage, isTicked, unitId = null) {
  const session = await getSession();
  if (!session || session.role !== 'SECTOR') return { error: 'Unauthorized' };

  // Fetch the logged-in sector
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { sector: true }
  });

  if (!user || !user.sector) return { error: 'Sector not found' };
  const sectorId = user.sector.id;

  // Verify the criteria exists and is active
  const criteria = await prisma.graceMarkCriteria.findUnique({
    where: { id: criteriaId }
  });

  if (!criteria) return { error: 'Criteria not found' };
  if (!criteria.isActive) return { error: 'Criteria is not active' };

  const pctValue = parseFloat(percentage);
  if (isNaN(pctValue) || pctValue < 0) {
    return { error: 'Value completed must be positive' };
  }

  // Calculate the correct marks based on criteria rules and target steps
  const marks = isTicked ? calculateMarksForType(criteria.type, pctValue, criteria.targetSteps) : 0;

  try {
    await prisma.graceMarkSubmission.upsert({
      where: {
        sectorId_criteriaId_unitId: {
          sectorId,
          criteriaId,
          unitId: unitId || null
        }
      },
      create: {
        sectorId,
        criteriaId,
        unitId: unitId || null,
        percentage: pctValue,
        marks,
        isTicked
      },
      update: {
        percentage: pctValue,
        marks,
        isTicked
      }
    });

    revalidatePath('/sector/grace-marks');
    revalidatePath('/sector/scorecard');
    return { success: true, marks };
  } catch (e) {
    return { error: e.message };
  }
}
