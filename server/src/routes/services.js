import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireStaff } from '../middleware/auth.js';

export const servicesRouter = Router();

/** Публичный прайс: гости видят виды работ без входа. */
servicesRouter.get('/', async (req, res) => {
  const list = await prisma.service.findMany({
    where: {
      NOT: {
        name: {
          contains: 'Консультац',
          mode: 'insensitive',
        },
      },
    },
    orderBy: { name: 'asc' },
  });
  res.json(list);
});

servicesRouter.post('/', requireStaff, async (req, res) => {
  const { name, description, basePrice, durationMin } = req.body;
  if (!name || basePrice == null) return res.status(400).json({ error: 'name и basePrice обязательны' });
  const s = await prisma.service.create({
    data: {
      name,
      description: description || null,
      basePrice: Number(basePrice),
      durationMin: durationMin != null ? Number(durationMin) : 60,
    },
  });
  res.status(201).json(s);
});

servicesRouter.patch('/:id', requireStaff, async (req, res) => {
  const data = { ...req.body };
  if (data.basePrice != null) data.basePrice = Number(data.basePrice);
  if (data.durationMin != null) data.durationMin = Number(data.durationMin);
  const s = await prisma.service.update({ where: { id: req.params.id }, data });
  res.json(s);
});

servicesRouter.delete('/:id', requireStaff, async (req, res) => {
  await prisma.service.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
