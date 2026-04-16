const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const sectorPassword = await bcrypt.hash('sector123', 10);

  // Create Admin
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: adminPassword },
    create: {
      username: 'admin',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });

  // Create or Update Sector 1
  const sector1User = await prisma.user.upsert({
    where: { username: 'sector1' },
    update: { passwordHash: sectorPassword },
    create: {
      username: 'sector1',
      passwordHash: sectorPassword,
      role: 'SECTOR'
    }
  });

  await prisma.sector.upsert({
    where: { userId: sector1User.id },
    update: { name: 'Sector 1' },
    create: {
      name: 'Sector 1',
      userId: sector1User.id
    }
  });

  console.log('Demo accounts created successfully:');
  console.log('Admin: admin / admin123');
  console.log('Sector: sector1 / sector123');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
