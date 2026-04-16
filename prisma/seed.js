const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.meetingReport.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.sector.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('admin123', 10);
  
  // Create Division Admin
  await prisma.user.create({
    data: {
      username: 'division_admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create Meetings
  const m1 = await prisma.meeting.create({
    data: { 
      name: 'Executive Session - I', 
      targetGroup: 'SECTOR',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3600000)
    }
  });
  const m2 = await prisma.meeting.create({
    data: { 
      name: 'Secretariat - I', 
      targetGroup: 'SECTOR',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3600000)
    }
  });
  const mUnit1 = await prisma.meeting.create({
    data: { 
      name: 'Unit Level Workshop', 
      targetGroup: 'UNIT',
      startDate: new Date(),
      endDate: new Date(Date.now() + 3600000)
    }
  });

  const sectorsToCreate = ['Kozhikode North', 'Kozhikode South', 'Feroke', 'Pantheeramkavu'];

  for (const [index, sectorName] of sectorsToCreate.entries()) {
    const sectorPassword = await bcrypt.hash(`sector${index + 1}`, 10);
    
    // Create Sector User
    const user = await prisma.user.create({
      data: {
        username: `sector${index + 1}`,
        passwordHash: sectorPassword,
        role: 'SECTOR',
      },
    });

    // Create Sector Entity
    const sector = await prisma.sector.create({
      data: {
        name: sectorName,
        userId: user.id
      }
    });

    // Create Units
    const u1 = await prisma.unit.create({ data: { name: `${sectorName} - Alpha`, sectorId: sector.id } });
    const u2 = await prisma.unit.create({ data: { name: `${sectorName} - Beta`, sectorId: sector.id } });

    // Seed some reports for "Complete UI" look
    // Sector Core reports
    await prisma.meetingReport.create({
      data: {
        meetingId: m1.id,
        sectorId: sector.id,
        attendanceCount: 12 + index,
        representativeName: 'User ' + (index + 1),
        minutesImagePath: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80'
      }
    });

    // Unit level reports (Some sectors have more)
    if (index % 2 === 0) {
      await prisma.meetingReport.create({
        data: {
          meetingId: mUnit1.id,
          sectorId: sector.id,
          unitId: u1.id,
          attendanceCount: 8,
          representativeName: 'Unit Rep A',
          minutesImagePath: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80'
        }
      });
    }
  }

  console.log('Database seeded with high-fidelity demo data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
