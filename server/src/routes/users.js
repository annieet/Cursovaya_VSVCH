import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const usersRouter = Router();

usersRouter.patch('/profile', requireAuth, async (req, res) => {
  if (req.user.role !== 'CLIENT') {
    return res.status(403).json({ error: 'Профиль клиента' });
  }
  const { phone, address, name } = req.body;
  const profileData = {};
  if (phone !== undefined) profileData.phone = phone;
  if (address !== undefined) profileData.address = address;
  const profile = await prisma.clientProfile.update({
    where: { userId: req.user.id },
    data: profileData,
  });
  if (name) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
    });
  }
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { clientProfile: true },
  });
  const { passwordHash: _, ...rest } = user;
  res.json({ ...rest, clientProfile: profile });
});
