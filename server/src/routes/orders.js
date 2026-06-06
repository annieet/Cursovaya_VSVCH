import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireStaff } from '../middleware/auth.js';

export const ordersRouter = Router();
const MATERIALS_META_PREFIX = '__materials__=';

function makeHttpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function encodeMaterialsMeta(rows) {
  return `${MATERIALS_META_PREFIX}${JSON.stringify(rows)}`;
}

function decodeMaterialsMeta(itemNotes) {
  if (!itemNotes || typeof itemNotes !== 'string' || !itemNotes.startsWith(MATERIALS_META_PREFIX)) return [];
  try {
    const parsed = JSON.parse(itemNotes.slice(MATERIALS_META_PREFIX.length));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((r) => ({ supplyId: r?.supplyId || null, qty: Math.max(1, Number(r?.qty) || 1) }))
      .filter((r) => r.supplyId);
  } catch {
    return [];
  }
}

async function calculateLiveOrderTotal(tx, order) {
  const serviceTotal = (order.items || []).reduce(
    (sum, it) => sum + Number(it?.service?.basePrice ?? it.unitPrice ?? 0) * Math.max(1, Number(it.quantity) || 1),
    0
  );

  const materialBySupply = new Map();
  for (const item of order.items || []) {
    const metaRows = decodeMaterialsMeta(item.itemNotes);
    for (const row of metaRows) {
      materialBySupply.set(row.supplyId, (materialBySupply.get(row.supplyId) || 0) + row.qty);
    }
  }

  let materialsTotal = 0;
  if (materialBySupply.size > 0) {
    const supplyIds = Array.from(materialBySupply.keys());
    const supplies = await tx.decoSupply.findMany({
      where: { id: { in: supplyIds } },
      select: { id: true, pricePerUnit: true },
    });
    const priceById = new Map(supplies.map((s) => [s.id, Number(s.pricePerUnit)]));
    for (const [supplyId, qty] of materialBySupply.entries()) {
      materialsTotal += (priceById.get(supplyId) || 0) * qty;
    }
  }

  return Math.round((serviceTotal + materialsTotal) * 100) / 100;
}

ordersRouter.get('/', requireAuth, async (req, res) => {
  const { status, sort = 'createdAt', order = 'desc', q } = req.query;
  const where = {};
  const isStaff = req.user.role === 'ADMIN';
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Некорректные данные пользователя в токене' });
  }
  if (!isStaff) {
    where.customerId = req.user.id;
  }
  if (status) {
    const statuses = String(status)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (statuses.length === 1) where.status = statuses[0];
    if (statuses.length > 1) where.status = { in: statuses };
  }
  if (q && typeof q === 'string') {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { notes: { contains: q, mode: 'insensitive' } },
    ];
  }
  const list = await prisma.order.findMany({
    where,
    orderBy: { [sort]: order === 'asc' ? 'asc' : 'desc' },
    include: {
      customer: { select: { id: true, name: true, email: true, clientProfile: { select: { phone: true } } } },
      items: { include: { service: true, supply: true } },
    },
  });
  const withLiveTotals = await Promise.all(
    list.map(async (o) => {
      const totalPrice = await calculateLiveOrderTotal(prisma, o);
      return { ...o, totalPrice };
    })
  );
  res.json(withLiveTotals);
});

ordersRouter.get('/:id', requireAuth, async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Некорректные данные пользователя в токене' });
  }
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      customer: { select: { id: true, name: true, email: true, clientProfile: { select: { phone: true } } } },
      items: { include: { service: true, supply: true } },
      statusLog: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!order) return res.status(404).json({ error: 'Заказ не найден' });
  const isStaff = req.user.role === 'ADMIN';
  if (!isStaff && order.customerId !== req.user.id) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  const liveTotal = await calculateLiveOrderTotal(prisma, order);
  if (Number(order.totalPrice ?? 0) !== liveTotal) {
    await prisma.order.update({ where: { id: order.id }, data: { totalPrice: liveTotal } });
  }
  order.totalPrice = liveTotal;
  res.json(order);
});

ordersRouter.post('/', requireAuth, async (req, res) => {
  if (req.user.role !== 'CLIENT') {
    return res.status(403).json({ error: 'Создавать заказ может только клиент' });
  }
  const { title, notes, deadline, items } = req.body;
  if (!title || !Array.isArray(items) || items.length !== 1) {
    return res.status(400).json({ error: 'Для заказа должен быть выбран ровно один вид работы' });
  }
  const cleanTitle = String(title).trim();
  const autoOrderNo = Date.now().toString().slice(-6);
  const normalizedTitle = /^заказ\s*№/i.test(cleanTitle) ? cleanTitle : `Заказ №${autoOrderNo}: ${cleanTitle}`;

  let total = 0;
  const prepared = [];
  for (const it of items) {
    const svc = await prisma.service.findUnique({ where: { id: it.serviceId } });
    if (!svc) return res.status(400).json({ error: `Услуга ${it.serviceId} не найдена` });
    /** По бизнес-логике: одна услуга = одна ручная работа мастера за заказ. */
    const qty = 1;
    const unit = Number(svc.basePrice);
    total += unit * qty;
    prepared.push({
      serviceId: it.serviceId,
      supplyId: it.supplyId || null,
      quantity: qty,
      unitPrice: unit,
      itemNotes: it.itemNotes || null,
    });
  }
  const order = await prisma.order.create({
    data: {
      customerId: req.user.id,
      title: normalizedTitle,
      notes: notes || null,
      deadline: deadline ? new Date(deadline) : null,
      totalPrice: total,
      status: 'DRAFT',
      items: { create: prepared },
      statusLog: { create: { status: 'DRAFT', message: 'Создан заказ' } },
    },
    include: { items: { include: { service: true, supply: true } } },
  });
  res.status(201).json(order);
});

ordersRouter.patch('/:id', requireAuth, async (req, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Некорректные данные пользователя в токене' });
  }
  const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: 'Не найден' });
  const isStaff = req.user.role === 'ADMIN';
  if (!isStaff && existing.customerId !== req.user.id) {
    return res.status(403).json({ error: 'Нет доступа' });
  }
  const { status, title, notes, deadline, totalPrice } = req.body;
  const data = {};
  if (title != null) data.title = title;
  if (notes != null) data.notes = notes;
  if (deadline != null) data.deadline = new Date(deadline);
  if (totalPrice != null) data.totalPrice = Number(totalPrice);

  if (status && req.user.role !== 'CLIENT') {
    data.status = status;
    await prisma.orderStatusHistory.create({
      data: { orderId: existing.id, status, message: req.body.statusMessage || null },
    });
  }

  if (Object.keys(data).length === 0) {
    const full = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        customer: { select: { id: true, name: true, email: true, clientProfile: { select: { phone: true } } } },
        items: { include: { service: true, supply: true } },
        statusLog: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    return res.json(full);
  }

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data,
    include: {
      customer: { select: { id: true, name: true, email: true, clientProfile: { select: { phone: true } } } },
      items: { include: { service: true, supply: true } },
      statusLog: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
  const liveTotal = await calculateLiveOrderTotal(prisma, order);
  if (Number(order.totalPrice ?? 0) !== liveTotal) {
    await prisma.order.update({ where: { id: order.id }, data: { totalPrice: liveTotal } });
    order.totalPrice = liveTotal;
  }
  res.json(order);
});

ordersRouter.post('/:id/start-production', requireStaff, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: true },
  });
  if (!order) return res.status(404).json({ error: 'Заказ не найден' });

  if (['PRODUCTION', 'READY', 'COMPLETED', 'CANCELLED'].includes(order.status)) {
    return res.status(409).json({ error: 'Заказ уже запущен или закрыт' });
  }

  const itemSupplies = req.body?.itemSupplies || {};
  const itemMaterials = req.body?.itemMaterials || {};
  const orderMaterials = Array.isArray(req.body?.orderMaterials) ? req.body.orderMaterials : [];

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (orderMaterials.length > 0) {
        const mergedBySupply = new Map();
        for (const row of orderMaterials) {
          const supplyId = row?.supplyId || null;
          if (!supplyId) continue;
          const qty = Math.max(1, Number(row?.qty) || 1);
          mergedBySupply.set(supplyId, (mergedBySupply.get(supplyId) || 0) + qty);
        }

        const notes = [];
        for (const [supplyId, qty] of mergedBySupply.entries()) {
          const supply = await tx.decoSupply.findUnique({ where: { id: supplyId } });
          if (!supply) throw makeHttpError(400, 'Материал не найден');
          if (Number(supply.stockQty) < qty) {
            throw makeHttpError(409, `Недостаточно остатка: ${supply.name}`);
          }
          await tx.decoSupply.update({
            where: { id: supplyId },
            data: { stockQty: { decrement: qty } },
          });
          notes.push(`${supply.name} x${qty}`);
        }

        const firstSupplyId = mergedBySupply.size ? Array.from(mergedBySupply.keys())[0] : null;
        const materialRows = Array.from(mergedBySupply.entries()).map(([supplyId, qty]) => ({ supplyId, qty }));
        const materialNote = materialRows.length ? encodeMaterialsMeta(materialRows) : null;
        for (const [idx, item] of order.items.entries()) {
          await tx.orderItem.update({
            where: { id: item.id },
            data: {
              supplyId: idx === 0 ? firstSupplyId : null,
              itemNotes: idx === 0 ? materialNote : null,
            },
          });
        }
      } else {
      for (const item of order.items) {
        const fromMulti = Array.isArray(itemMaterials[item.id]) ? itemMaterials[item.id] : null;
        /** Backward compatibility with old single-select body. */
        const fallbackSingle = Object.prototype.hasOwnProperty.call(itemSupplies, item.id)
          ? [{ supplyId: itemSupplies[item.id], qty: Math.max(1, Number(item.quantity) || 1) }]
          : item.supplyId
            ? [{ supplyId: item.supplyId, qty: Math.max(1, Number(item.quantity) || 1) }]
            : [];

        const selectedRows = (fromMulti ?? fallbackSingle)
          .map((row) => ({
            supplyId: row?.supplyId || null,
            qty: Math.max(1, Number(row?.qty) || 1),
          }))
          .filter((row) => row.supplyId);

        const mergedBySupply = new Map();
        for (const row of selectedRows) {
          mergedBySupply.set(row.supplyId, (mergedBySupply.get(row.supplyId) || 0) + row.qty);
        }

        const notes = [];
        for (const [supplyId, qty] of mergedBySupply.entries()) {
          const supply = await tx.decoSupply.findUnique({ where: { id: supplyId } });
          if (!supply) {
            throw makeHttpError(400, `Материал не найден для позиции ${item.id}`);
          }
          if (Number(supply.stockQty) < qty) {
            throw makeHttpError(409, `Недостаточно остатка: ${supply.name}`);
          }
          await tx.decoSupply.update({
            where: { id: supplyId },
            data: { stockQty: { decrement: qty } },
          });
          notes.push(`${supply.name} x${qty}`);
        }

        const firstSupplyId = mergedBySupply.size ? Array.from(mergedBySupply.keys())[0] : null;
        const materialRows = Array.from(mergedBySupply.entries()).map(([supplyId, qty]) => ({ supplyId, qty }));
        const materialNote = materialRows.length ? encodeMaterialsMeta(materialRows) : null;
        await tx.orderItem.update({
          where: { id: item.id },
          data: {
            supplyId: firstSupplyId,
            itemNotes: materialNote,
          },
        });
      }
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'PRODUCTION',
          message: 'Заказ принят в работу, материалы списаны со склада',
        },
      });

      return tx.order.update({
        where: { id: order.id },
        data: { status: 'PRODUCTION' },
        include: {
          customer: { select: { id: true, name: true, email: true, clientProfile: { select: { phone: true } } } },
          items: { include: { service: true, supply: true } },
          statusLog: { orderBy: { createdAt: 'desc' }, take: 5 },
        },
      });
    });
    const liveTotal = await calculateLiveOrderTotal(prisma, updated);
    await prisma.order.update({
      where: { id: updated.id },
      data: { totalPrice: liveTotal },
    });
    updated.totalPrice = liveTotal;
    res.json(updated);
  } catch (e) {
    const status = e.status || 500;
    res.status(status).json({ error: e.message || 'Ошибка запуска заказа' });
  }
});

ordersRouter.delete('/:id', requireStaff, async (req, res) => {
  await prisma.order.delete({ where: { id: req.params.id } }).catch(() => null);
  res.status(204).end();
});
