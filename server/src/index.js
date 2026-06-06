import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.js';
import { ordersRouter } from './routes/orders.js';
import { suppliesRouter } from './routes/supplies.js';
import { servicesRouter } from './routes/services.js';
import { workshopsRouter } from './routes/workshops.js';
import { dashboardRouter } from './routes/dashboard.js';
import { reportsRouter } from './routes/reports.js';
import { usersRouter } from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/supplies', suppliesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/workshops', workshopsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/users', usersRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Внутренняя ошибка' });
});

app.listen(PORT, () => {
  console.log(`API http://localhost:${PORT}`);
});
