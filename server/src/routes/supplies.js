import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireStaff } from '../middleware/auth.js';

export const suppliesRouter = Router();

/** Каталог материалов доступен без авторизации (как витрина). */
suppliesRouter.get('/', async (req, res) => {
  const { color, category, minStock, maxPrice, sort = 'name', order = 'asc' } = req.query;
  const where = {};
  if (color) where.color = { contains: String(color), mode: 'insensitive' };
  if (category) where.category = { contains: String(category), mode: 'insensitive' };
  if (minStock != null) where.stockQty = { gte: Number(minStock) };
  if (maxPrice != null) {
    where.pricePerUnit = { ...where.pricePerUnit, lte: Number(maxPrice) };
  }
  const list = await prisma.decoSupply.findMany({
    where,
    orderBy: { [sort]: order === 'desc' ? 'desc' : 'asc' },
  });
  res.json(list);
});

suppliesRouter.get('/:id', async (req, res) => {
  const s = await prisma.decoSupply.findUnique({ where: { id: req.params.id } });
  if (!s) return res.status(404).json({ error: 'Не найдено' });
  res.json(s);
});

suppliesRouter.post('/', requireStaff, async (req, res) => {
  const { name, color, category, packNote, stockQty, pricePerUnit, supplier } = req.body;
  if (!name || !color || !category || stockQty == null || pricePerUnit == null) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }
  const row = await prisma.decoSupply.create({
    data: {
      name,
      color,
      category,
      packNote: packNote || null,
      stockQty: Number(stockQty),
      pricePerUnit: Number(pricePerUnit),
      supplier: supplier || null,
    },
  });
  res.status(201).json(row);
});

suppliesRouter.patch('/:id', requireStaff, async (req, res) => {
  const data = { ...req.body };
  if (data.stockQty != null) data.stockQty = Number(data.stockQty);
  if (data.pricePerUnit != null) data.pricePerUnit = Number(data.pricePerUnit);
  const row = await prisma.decoSupply.update({
    where: { id: req.params.id },
    data,
  });
  res.json(row);
});

suppliesRouter.delete('/:id', requireStaff, async (req, res) => {
  await prisma.decoSupply.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
