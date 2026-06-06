import { useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import * as api from '../api/client.js';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { setOrderPrefs, resetAllPrefs, showSnackbar } from '../store/uiSlice.js';

const statuses = ['', 'DRAFT', 'PRODUCTION', 'READY', 'COMPLETED', 'CANCELLED'];

const labels = {
  DRAFT: 'Черновик',
  RECEIVED: 'В работе',
  DESIGN: 'Черновик',
  PRODUCTION: 'В работе',
  READY: 'Готов к выдаче',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отмена',
};

const STATUS_GROUP_STYLES = {
  neutral: { bgcolor: 'rgba(5,5,5,0.08)', borderColor: 'rgba(5,5,5,0.2)', color: 'text.secondary' },
  warning: { bgcolor: 'rgba(217,119,6,0.12)', borderColor: 'rgba(217,119,6,0.34)', color: '#B45309' },
  success: { bgcolor: 'rgba(45,106,79,0.14)', borderColor: 'rgba(45,106,79,0.4)', color: 'success.main' },
  danger: { bgcolor: 'rgba(193,18,31,0.1)', borderColor: 'rgba(193,18,31,0.34)', color: 'secondary.main' },
};

const STATUS_CHIP_SX = {
  DRAFT: STATUS_GROUP_STYLES.neutral,
  DESIGN: STATUS_GROUP_STYLES.neutral,
  RECEIVED: STATUS_GROUP_STYLES.warning,
  PRODUCTION: STATUS_GROUP_STYLES.warning,
  READY: STATUS_GROUP_STYLES.success,
  COMPLETED: STATUS_GROUP_STYLES.success,
  CANCELLED: STATUS_GROUP_STYLES.danger,
};

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

export function OrdersPage() {
  const user = useSelector((s) => s.auth.user);
  const prefs = useSelector((s) => s.ui.prefs);
  const dispatch = useDispatch();
  const [rows, setRows] = useState([]);
  const canCreate = user?.role === 'CLIENT';
  const isStaff = user?.role === 'ADMIN';

  const load = useCallback(() => {
    const q = new URLSearchParams();
    if (isStaff) {
      const selectedStatus = normalizeUiStatus(prefs.orderStatus);
      if (selectedStatus === 'PRODUCTION') q.set('status', 'PRODUCTION,RECEIVED');
      else if (selectedStatus) q.set('status', selectedStatus);
      q.set('sort', prefs.orderSort);
      q.set('order', prefs.orderOrder);
      if (prefs.orderQuery) q.set('q', prefs.orderQuery);
    }
    api
      .api(`/orders?${q.toString()}`)
      .then(setRows)
      .catch(() => setRows([]));
  }, [isStaff, prefs.orderStatus, prefs.orderSort, prefs.orderOrder, prefs.orderQuery]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box component="section">
      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          px: { xs: 1.5, sm: 2.5, md: 3 },
          py: { xs: 2, md: 2.5 },
          border: '1px solid rgba(5,5,5,0.1)',
          bgcolor: 'background.paper',
          backgroundImage:
            'linear-gradient(180deg, rgba(193,18,31,0.03) 0%, rgba(193,18,31,0) 70%), radial-gradient(circle at 100% 0%, rgba(193,18,31,0.08) 0%, transparent 45%)',
        }}
      >
        <Stack direction="column" alignItems="center" spacing={1.4} sx={{ textAlign: 'center' }}>
          <Box sx={{ mx: 'auto' }}>
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ mb: 0.4 }}>
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Личный кабинет
              </Typography>
            </Stack>
            <Typography variant="h4" component="h1">
              {canCreate ? 'Мои заказы' : 'Заказы'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'center' }}>
              {canCreate
                ? 'Здесь отображаются только ваши заявки и текущие статусы выполнения.'
                : 'Реестр заказов клиентов с текущими статусами и суммой.'}
            </Typography>
          </Box>
          {canCreate && (
            <Button component={RouterLink} to="/orders/new" variant="contained" startIcon={<AddIcon />}>
              Новый заказ
            </Button>
          )}
        </Stack>
      </Paper>

      {isStaff && (
        <Paper
          elevation={0}
          sx={{ mb: 2, p: { xs: 1.2, sm: 1.6 }, border: '1px solid rgba(5,5,5,0.1)', bgcolor: 'background.paper' }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Поиск по названию"
              size="small"
              value={prefs.orderQuery}
              onChange={(e) => dispatch(setOrderPrefs({ orderQuery: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
            <TextField
              select
              label="Статус"
              size="small"
              value={normalizeUiStatus(prefs.orderStatus)}
              onChange={(e) => dispatch(setOrderPrefs({ orderStatus: e.target.value }))}
              sx={{ minWidth: 180 }}
            >
              {statuses.map((s) => (
                <MenuItem key={s || 'all'} value={s}>
                  {s ? labels[s] : 'Все'}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Сортировка"
              size="small"
              value={`${prefs.orderSort}-${prefs.orderOrder}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                dispatch(setOrderPrefs({ orderSort: sort, orderOrder: order }));
              }}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="createdAt-desc">Дата ↓</MenuItem>
              <MenuItem value="createdAt-asc">Дата ↑</MenuItem>
              <MenuItem value="title-asc">Название ↑</MenuItem>
              <MenuItem value="title-desc">Название ↓</MenuItem>
            </TextField>
            <Button
              variant="outlined"
              onClick={() => {
                dispatch(resetAllPrefs());
                dispatch(showSnackbar({ message: 'Фильтры и сортировка заказов сброшены', severity: 'info' }));
              }}
            >
              Сброс настроек
            </Button>
          </Stack>
        </Paper>
      )}

      <TableContainer
        component={Paper}
        sx={{
          overflowX: 'auto',
          border: '1px solid rgba(5,5,5,0.1)',
          bgcolor: 'background.paper',
          '& .MuiTableHead-root .MuiTableCell-root': {
            bgcolor: 'rgba(5,5,5,0.03)',
            color: 'text.secondary',
            fontWeight: 700,
          },
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Сумма</TableCell>
              {isStaff && <TableCell>Клиент</TableCell>}
              <TableCell>Обновлено</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((o, index) => (
              <TableRow
                key={o.id}
                hover
                sx={{
                  '& td': { borderBottomColor: 'rgba(5,5,5,0.08)' },
                  bgcolor: index % 2 === 0 ? 'rgba(5,5,5,0.012)' : 'transparent',
                }}
              >
                <TableCell>
                  <Button component={RouterLink} to={`/orders/${o.id}`} size="small" sx={{ px: 0.6 }}>
                    {o.title}
                  </Button>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={getStatusLabel(o.status, isStaff)} variant="outlined" sx={STATUS_CHIP_SX[normalizeUiStatus(o.status)]} />
                </TableCell>
                <TableCell align="right">{o.totalPrice ?? '—'}</TableCell>
                {isStaff && <TableCell>{o.customer?.name}</TableCell>}
                <TableCell>{new Date(o.updatedAt).toLocaleDateString('ru-RU')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {rows.length === 0 && (
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Заказов не найдено
        </Typography>
      )}
    </Box>
  );
}
