import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Breadcrumbs,
  Link,
  Stack,
  Autocomplete,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import * as api from '../api/client.js';
import { useSelector, useDispatch } from 'react-redux';
import { showSnackbar } from '../store/uiSlice.js';

const statusOrder = ['DRAFT', 'PRODUCTION', 'READY', 'COMPLETED'];

const labels = {
  DRAFT: 'Черновик',
  RECEIVED: 'В работе',
  DESIGN: 'Черновик',
  PRODUCTION: 'В работе',
  READY: 'Готов к отправке / самовывозу',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отмена',
};

const CATEGORY_RULES = [
  { keys: ['страз'], categories: ['стразы', 'клей текстильный'] },
  { keys: ['вышив', 'бисер', 'пайет'], categories: ['нитки', 'бисер', 'пайетки', 'клей текстильный'] },
  { keys: ['роспис'], categories: ['краска текстильная', 'клей текстильный'] },
  { keys: ['принт', 'термо'], categories: ['термоплёнка', 'клей текстильный'] },
  { keys: ['аппликац', 'нашив'], categories: ['фурнитура', 'клей текстильный', 'нитки'] },
  { keys: ['шнур', 'люверс'], categories: ['фурнитура'] },
  { keys: ['реставрац'], categories: ['клей текстильный', 'фурнитура', 'нитки'] },
];

function categoriesForOrder(order) {
  const source = `${order?.title || ''} ${order?.notes || ''} ${(order?.items || [])
    .map((x) => x?.service?.name || '')
    .join(' ')}`
    .toLowerCase();
  const out = new Set();
  for (const rule of CATEGORY_RULES) {
    if (rule.keys.some((k) => source.includes(k))) {
      for (const cat of rule.categories) out.add(cat);
    }
  }
  return Array.from(out);
}

function suppliesForOrder(supplies, order) {
  const categories = categoriesForOrder(order);
  if (!categories.length) return { list: supplies, categories: [] };
  const filtered = supplies.filter((s) => categories.includes(s.category));
  return { list: filtered.length ? filtered : supplies, categories };
}

function normalizeUiStatus(status) {
  if (status === 'DESIGN') return 'DRAFT';
  if (status === 'RECEIVED') return 'PRODUCTION';
  return status;
}

function getStatusLabel(status, isStaff) {
  const normalized = normalizeUiStatus(status);
  if (!isStaff && (normalized === 'READY' || normalized === 'COMPLETED')) return 'Готов';
  return labels[normalized] || status;
}

export function OrderDetailPage() {
  const { id } = useParams();
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loadState, setLoadState] = useState('loading');
  const [supplies, setSupplies] = useState([]);
  const [orderMaterials, setOrderMaterials] = useState([]);
  const [starting, setStarting] = useState(false);
  const staff = user?.role === 'ADMIN';

  const load = async () => {
    const data = await api.api(`/orders/${id}`);
    setOrder(data);
    return data;
  };

  useEffect(() => {
    let cancelled = false;
    setLoadState('loading');
    api
      .api(`/orders/${id}`)
      .then((o) => {
        if (!cancelled) {
          setOrder(o);
          setLoadState('ready');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setOrder(null);
          setLoadState('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!staff) return;
    api
      .api('/supplies?sort=name&order=asc')
      .then(setSupplies)
      .catch(() => setSupplies([]));
  }, [staff]);

  useEffect(() => {
    if (!order) return;
    const first = order.items?.[0];
    setOrderMaterials(first?.supplyId ? [{ supplyId: first.supplyId, qty: Math.max(1, Number(first.quantity) || 1) }] : []);
  }, [order]);

  if (loadState === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadState === 'error') {
    return (
      <Box>
        <Typography gutterBottom>Не удалось загрузить заказ. Запущен ли сервер и есть ли такой id?</Typography>
        <Button component={RouterLink} to="/orders" variant="contained">
          К списку заказов
        </Button>
      </Box>
    );
  }

  if (!order) {
    return null;
  }

  const normalizedStatus = normalizeUiStatus(order.status);
  const uiStatusOrder = staff ? statusOrder : ['DRAFT', 'PRODUCTION', 'READY'];
  const clientNormalizedStatus = !staff && normalizedStatus === 'COMPLETED' ? 'READY' : normalizedStatus;
  const activeStep = clientNormalizedStatus === 'CANCELLED' ? 0 : Math.max(0, uiStatusOrder.indexOf(clientNormalizedStatus));
  const productionStarted = ['PRODUCTION', 'READY', 'COMPLETED'].includes(order.status);

  const patchStatus = async (status) => {
    try {
      await api.api(`/orders/${id}`, { method: 'PATCH', body: { status } });
      dispatch(showSnackbar({ message: 'Статус обновлён', severity: 'success' }));
      await load();
      setLoadState('ready');
    } catch (e) {
      dispatch(showSnackbar({ message: e.message, severity: 'error' }));
    }
  };

  const startProduction = async () => {
    setStarting(true);
    try {
      const updated = await api.api(`/orders/${id}/start-production`, {
        method: 'POST',
        body: { orderMaterials },
      });
      setOrder(updated);
      setLoadState('ready');
      dispatch(showSnackbar({ message: 'Заказ запущен в изготовление', severity: 'success' }));
    } catch (e) {
      dispatch(showSnackbar({ message: e.message, severity: 'error' }));
    } finally {
      setStarting(false);
    }
  };

  const setOrderMaterialSelection = (selectedSupplies) => {
    setOrderMaterials((prev) => {
      const byId = new Map(prev.map((r) => [r.supplyId, r.qty]));
      return selectedSupplies.map((s) => ({
        supplyId: s.id,
        qty: byId.get(s.id) || 1,
      }));
    });
  };

  const setOrderMaterialQty = (supplyId, qty) => {
    setOrderMaterials((prev) =>
      prev.map((row) => (row.supplyId === supplyId ? { ...row, qty: Math.max(1, Number(qty) || 1) } : row))
    );
  };

  return (
    <Box>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" color="inherit" to="/">
          Главная
        </Link>
        <Link component={RouterLink} underline="hover" color="inherit" to="/orders">
          Заказы
        </Link>
        <Typography color="text.primary">{order.title}</Typography>
      </Breadcrumbs>

      <Typography variant="h4" gutterBottom>
        {order.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Клиент: {order.customer?.name}
        {order.customer?.clientProfile?.phone ? ` · Телефон: ${order.customer.clientProfile.phone}` : ''}
        {' · '}
        Создан: {new Date(order.createdAt).toLocaleString('ru-RU')}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ my: 3 }} alternativeLabel>
        {uiStatusOrder.map((s) => (
          <Step key={s}>
            <StepLabel>{getStatusLabel(s, staff)}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {staff && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            {['DRAFT', 'RECEIVED', 'DESIGN'].includes(order.status) && (
              <>
                <Typography variant="h6" gutterBottom>
                  Принять в работу с материалами заказа
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Добавьте любые материалы, которые реально нужны для этого заказа. После запуска остатки будут
                  списаны со склада, а статус перейдёт в «В работе».
                </Typography>
                {(() => {
                  const scoped = suppliesForOrder(supplies, order);
                  const selectedSupplies = orderMaterials
                    .map((row) => supplies.find((s) => s.id === row.supplyId))
                    .filter(Boolean);
                  return (
                    <Box>
                      <Autocomplete
                        multiple
                        options={supplies}
                        value={selectedSupplies}
                        size="small"
                        disableCloseOnSelect
                        getOptionLabel={(sup) => `${sup.name} (${sup.category}) · остаток ${sup.stockQty}`}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(_, value) => setOrderMaterialSelection(value)}
                        renderInput={(params) => <TextField {...params} label="Материалы для заказа" />}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {scoped.categories.length
                          ? `Рекомендовано: ${scoped.categories.join(', ')}`
                          : 'Подходящая категория не определена, можно выбрать любые материалы.'}
                      </Typography>

                      {orderMaterials.length > 0 && (
                        <Stack spacing={1} sx={{ mt: 1 }}>
                          {orderMaterials.map((row) => {
                            const sup = supplies.find((s) => s.id === row.supplyId);
                            if (!sup) return null;
                            return (
                              <TextField
                                key={row.supplyId}
                                size="small"
                                type="number"
                                label={`Количество: ${sup.name}`}
                                value={row.qty}
                                inputProps={{ min: 1, max: Math.max(1, Number(sup.stockQty)) }}
                                onChange={(e) => setOrderMaterialQty(row.supplyId, e.target.value)}
                              />
                            );
                          })}
                        </Stack>
                      )}
                    </Box>
                  );
                })()}
                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  color="secondary"
                  onClick={startProduction}
                  disabled={starting}
                >
                  {starting ? 'Запуск...' : 'Принять и запустить в изготовление'}
                </Button>
              </>
            )}

            {order.status === 'PRODUCTION' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Изготовление в процессе
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Когда декор завершён, переведите заказ в статус «Готов к выдаче / отправке».
                </Typography>
                <Button variant="contained" onClick={() => patchStatus('READY')}>
                  Отметить как готовый
                </Button>
              </>
            )}

            {order.status === 'READY' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Заказ готов
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  После передачи клиенту завершите заказ.
                </Typography>
                <Button variant="contained" color="secondary" onClick={() => patchStatus('COMPLETED')}>
                  Закрыть заказ
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">Позиции</Typography>
          <List dense>
            {order.items?.map((it) => (
              <ListItem key={it.id} disableGutters>
                <ListItemText
                  primary={`${it.service.name} × ${it.quantity}`}
                  secondary={
                    productionStarted
                      ? it.supply
                        ? `${it.supply.name} (${it.supply.color})`
                        : 'Материал не выбран'
                      : 'Материалы будут выбраны сотрудником на этапе запуска в изготовление'
                  }
                />
                <Typography variant="body2">
                  {Math.round(Number(it.service?.basePrice ?? it.unitPrice ?? 0) * Math.max(1, Number(it.quantity) || 1) * 100) / 100}{' '}
                  BYN
                </Typography>
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle1">Итого: {order.totalPrice ?? '—'} BYN</Typography>
          {order.notes && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Заметки: {order.notes}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        История статусов
      </Typography>
      <List dense>
        {order.statusLog?.map((h) => (
          <ListItem key={h.id}>
            <ListItemText
              primary={`${getStatusLabel(h.status, staff)}`}
              secondary={`${new Date(h.createdAt).toLocaleString('ru-RU')} — ${h.message || ''}`}
            />
          </ListItem>
        ))}
      </List>

      <Button component={RouterLink} to="/orders" variant="outlined" sx={{ mt: 2 }}>
        К списку
      </Button>
    </Box>
  );
}
