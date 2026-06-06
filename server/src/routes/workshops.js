import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authOptional, requireAuth, requireStaff } from '../middleware/auth.js';

export const workshopsRouter = Router();

function mapWorkshop(w, registered) {
  const taken = w._count?.registrations ?? 0;
  const { _count, ...rest } = w;
  return {
    ...rest,
    takenSeats: taken,
    placesLeft: Math.max(0, w.maxSeats - taken),
    registered,
  };
}

workshopsRouter.get('/', authOptional, async (req, res) => {
  const upcoming = req.query.upcoming === '1' || req.query.upcoming === 'true';
  const where = upcoming ? { startAt: { gte: new Date() } } : {};
  const workshops = await prisma.workshop.findMany({
    where,
    orderBy: { startAt: 'asc' },
    include: { _count: { select: { registrations: true } } },
  });
  const ids = workshops.map((w) => w.id);
  let mine = new Set();
  if (req.user && ids.length) {
    const mineRows = await prisma.workshopRegistration.findMany({
      where: { userId: req.user.id, workshopId: { in: ids } },
      select: { workshopId: true },
    });
    mine = new Set(mineRows.map((r) => r.workshopId));
  }
  res.json(workshops.map((w) => mapWorkshop(w, mine.has(w.id))));
});

workshopsRouter.post('/', requireStaff, async (req, res) => {
  const { title, description, topic, startAt, endAt, place, maxSeats, priceHint } = req.body;
  if (!title || !topic || !startAt || !endAt) {
    return res.status(400).json({ error: 'Обязательны title, topic, startAt, endAt' });
  }
  const w = await prisma.workshop.create({
    data: {
      title,
      description: description || null,
      topic,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      place: place || 'Студия',
      maxSeats: maxSeats != null ? Number(maxSeats) : 12,
      priceHint: priceHint != null ? Number(priceHint) : null,
    },
  });
  res.status(201).json(w);
});

workshopsRouter.post('/:id/register', requireAuth, async (req, res) => {
  if (req.user.role !== 'CLIENT') {
    return res.status(403).json({ error: 'Запись на мастер-класс доступна клиентам' });
  }
  const w = await prisma.workshop.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { registrations: true } } },
  });
  if (!w) return res.status(404).json({ error: 'МК не найден' });
  if (w._count.registrations >= w.maxSeats) {
    return res.status(409).json({ error: 'Мест больше нет' });
  }
  if (w.startAt < new Date()) {
    return res.status(400).json({ error: 'Этот мастер-класс уже прошёл' });
  }
  try {
    await prisma.workshopRegistration.create({
      data: { workshopId: w.id, userId: req.user.id },
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Вы уже записаны на этот МК' });
    }
    throw e;
  }
});

workshopsRouter.delete('/:id/register', requireAuth, async (req, res) => {
  await prisma.workshopRegistration.deleteMany({
    where: { workshopId: req.params.id, userId: req.user.id },
  });
  res.status(204).end();
});

workshopsRouter.get('/:id', authOptional, async (req, res) => {
  const w = await prisma.workshop.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { registrations: true } } },
  });
  if (!w) return res.status(404).json({ error: 'Не найдено' });
  let registered = false;
  if (req.user) {
    const reg = await prisma.workshopRegistration.findUnique({
      where: {
        workshopId_userId: { workshopId: w.id, userId: req.user.id },
      },
    });
    registered = !!reg;
  }
  res.json(mapWorkshop(w, registered));
});

workshopsRouter.patch('/:id', requireStaff, async (req, res) => {
  const data = { ...req.body };
  if (data.startAt) data.startAt = new Date(data.startAt);
  if (data.endAt) data.endAt = new Date(data.endAt);
  if (data.maxSeats != null) data.maxSeats = Number(data.maxSeats);
  if (data.priceHint != null) data.priceHint = Number(data.priceHint);
  const w = await prisma.workshop.update({ where: { id: req.params.id }, data });
  res.json(w);
});

workshopsRouter.delete('/:id', requireStaff, async (req, res) => {
  await prisma.workshop.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
