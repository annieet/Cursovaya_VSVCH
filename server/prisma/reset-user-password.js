/**
 * Одноразовый сброс пароля: node prisma/reset-user-password.js <email> <новый_пароль>
 * Пример: node prisma/reset-user-password.js anna@gmail.com password123
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const email = process.argv[2];
const plain = process.argv[3];

if (!email || !plain) {
  console.error('Использование: node prisma/reset-user-password.js <email> <новый_пароль>');
  process.exit(1);
}

const prisma = new PrismaClient();
const hash = await bcrypt.hash(plain, 10);
const { count } = await prisma.user.updateMany({ where: { email }, data: { passwordHash: hash } });
await prisma.$disconnect();

if (count === 0) {
  console.error('Пользователь с таким email не найден:', email);
  process.exit(1);
}
console.log('Пароль обновлён для', email);
