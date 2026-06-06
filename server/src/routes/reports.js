import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx';
import { prisma } from '../lib/prisma.js';
import { requireStaff } from '../middleware/auth.js';

export const reportsRouter = Router();

function resolvePdfFontPath() {
  const candidates = [
    path.join(process.cwd(), 'assets', 'fonts', 'DejaVuSans.ttf'),
    path.join(process.cwd(), 'public', 'fonts', 'DejaVuSans.ttf'),
    'C:\\Windows\\Fonts\\arial.ttf',
    'C:\\Windows\\Fonts\\calibri.ttf',
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
}

reportsRouter.get('/orders-summary.pdf', requireStaff, async (req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      customer: { select: { name: true, email: true } },
      items: { include: { service: true } },
    },
  });

  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="orders-summary.pdf"');
  doc.pipe(res);

  const fontPath = resolvePdfFontPath();
  if (fontPath) doc.font(fontPath);

  doc.fontSize(18).text('AlterEgo — отчёт по заказам (декор и кастом одежды)', { underline: true });
  doc.moveDown();
  doc.fontSize(10).text(`Сформировано: ${new Date().toLocaleString('ru-RU')}`);
  doc.moveDown();

  for (const o of orders) {
    doc.fontSize(12).text(`${o.title}`, { continued: false });
    doc.fontSize(10).text(`Клиент: ${o.customer.name} | Статус: ${o.status} | Сумма: ${o.totalPrice ?? '—'}`);
    doc.text(`Позиции: ${o.items.map((i) => i.service.name).join(', ')}`);
    doc.moveDown(0.5);
  }
  doc.end();
});

reportsRouter.get('/supplies-stock.docx', requireStaff, async (req, res) => {
  const rows = await prisma.decoSupply.findMany({ orderBy: { name: 'asc' } });

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Материал', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Цвет/марк.', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Категория', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Остаток, ед.', bold: true })] })] }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Цена/ед.', bold: true })] })] }),
      ],
    }),
    ...rows.map(
      (s) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(s.name)] }),
            new TableCell({ children: [new Paragraph(s.color)] }),
            new TableCell({ children: [new Paragraph(s.category)] }),
            new TableCell({ children: [new Paragraph(String(s.stockQty))] }),
            new TableCell({ children: [new Paragraph(String(s.pricePerUnit))] }),
          ],
        })
    ),
  ];

  const document = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: 'AlterEgo — склад материалов для декора (не пошив)', bold: true, size: 32 }),
            ],
          }),
          new Paragraph(`Дата: ${new Date().toLocaleDateString('ru-RU')}`),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),
        ],
      },
    ],
  });

  const buf = await Packer.toBuffer(document);
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
  res.setHeader('Content-Disposition', 'attachment; filename="supplies-stock.docx"');
  res.send(buf);
});
