import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} es obligatorio`);
  return value;
}

async function main() {
  const fullName = required('SUPERADMIN_NAME');
  const email = required('SUPERADMIN_EMAIL').toLowerCase();
  const password = required('SUPERADMIN_PASSWORD');

  if (password.length < 16) {
    throw new Error('SUPERADMIN_PASSWORD debe tener al menos 16 caracteres');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Ya existe un usuario con este correo');

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: 'superadmin',
      isActive: true,
      mustChangePassword: false,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'BOOTSTRAP',
      entity: 'User',
      entityId: user.id,
      detail: { source: 'create-superadmin-cli', role: 'superadmin' },
    },
  });

  console.log(`Superadmin creado: ${user.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'No se pudo crear el superadmin');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
