'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import cloudinary from '@/lib/cloudinary';

export async function createMeeting(formData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name');
  const description = formData.get('description');
  const venue = formData.get('venue');
  const startDate = new Date(formData.get('startDate'));
  const endDate = new Date(formData.get('endDate'));
  const targetGroup = formData.get('targetGroup'); // 'SECTOR' or 'UNIT'
  
  const assignedSectorId = formData.get('assignedSectorId') || null;
  const assignedUnitId = formData.get('assignedUnitId') || null;

  if (!name || isNaN(startDate) || isNaN(endDate) || !targetGroup) {
    return { error: 'Missing required fields' };
  }

  try {
    await prisma.meeting.create({
      data: { 
        name, 
        description, 
        venue, 
        startDate, 
        endDate, 
        targetGroup,
        assignedSectorId: assignedSectorId === 'ALL' ? null : assignedSectorId,
        assignedUnitId: assignedUnitId === 'ALL' ? null : assignedUnitId
      },
    });
    revalidatePath('/admin/meetings');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function submitReport(formData) {
  const session = await getSession();
  if (!session || session.role !== 'SECTOR') return { error: 'Unauthorized' };

  const meetingId = formData.get('meetingId');
  const unitId = formData.get('unitId') || null; 
  const attendanceCount = parseInt(formData.get('attendanceCount'), 10);
  const venue = formData.get('venue');
  const representativeName = formData.get('representativeName');
  
  let minutesImagePath = null;
  const photo = formData.get('photo');
  if (photo && photo.size > 0) {
    const arrayBuffer = await photo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'grace-mark-reports',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });
    
    minutesImagePath = result.secure_url;
  }

  if (!meetingId || isNaN(attendanceCount) || !representativeName) {
    return { error: 'Missing fields' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { sector: true }
    });

    const sectorId = user.sector.id;

    // Check meeting date and assignment
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
    if (!meeting) return { error: 'Meeting not found' };
    
    // Check Sector Assignment
    if (meeting.assignedSectorId && meeting.assignedSectorId !== sectorId) {
      return { error: 'This meeting is not assigned to your sector' };
    }

    // Check Unit Assignment
    if (meeting.assignedUnitId && unitId && meeting.assignedUnitId !== unitId) {
      return { error: 'This meeting is not assigned to the selected unit' };
    }

    const now = new Date();
    if (now > meeting.endDate) {
      return { error: 'Reporting for this meeting has expired' };
    }

    // Check for duplicate
    const existingReport = await prisma.meetingReport.findFirst({
      where: {
        meetingId,
        sectorId,
        unitId: unitId || null
      }
    });

    if (existingReport) {
      return { error: 'A report for this meeting has already been submitted.' };
    }

    await prisma.meetingReport.create({
      data: {
        meetingId,
        sectorId,
        unitId,
        attendanceCount,
        venue,
        representativeName,
        minutesImagePath
      }
    });

    revalidatePath('/sector/dashboard');
    revalidatePath('/sector/report');
    return { success: true };
  } catch (e) {
    console.error('CRITICAL_ERROR: Report submission failed:', e);
    return { error: `Submission failed: ${e.message || 'Unknown server error'}` };
  }
}

export async function deleteMeeting(meetingId) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    await prisma.meetingReport.deleteMany({ where: { meetingId } });
    await prisma.meeting.delete({ where: { id: meetingId } });
    revalidatePath('/admin/meetings');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}

export async function updateMeeting(meetingId, formData) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') return { error: 'Unauthorized' };

  const name = formData.get('name');
  const description = formData.get('description');
  const venue = formData.get('venue');
  const startDate = new Date(formData.get('startDate'));
  const endDate = new Date(formData.get('endDate'));
  const targetGroup = formData.get('targetGroup');
  
  const assignedSectorId = formData.get('assignedSectorId') || null;
  const assignedUnitId = formData.get('assignedUnitId') || null;

  if (!name || isNaN(startDate) || isNaN(endDate) || !targetGroup) {
    return { error: 'Missing required fields' };
  }

  try {
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { 
        name, 
        description, 
        venue, 
        startDate, 
        endDate, 
        targetGroup,
        assignedSectorId: assignedSectorId === 'ALL' ? null : assignedSectorId,
        assignedUnitId: assignedUnitId === 'ALL' ? null : assignedUnitId
      },
    });
    revalidatePath('/admin/meetings');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
}
