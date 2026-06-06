import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Paper,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import * as api from '../api/client.js';

const statusRu = {
  DRAFT: 'Черновик',
  RECEIVED: 'В работе',
  DESIGN: 'Макет',
  PRODUCTION: 'В работе',
  READY: 'Готов к выдаче',
  COMPLETED: 'Завершён',
  CANCELLED: 'Отмена',
};

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [refreshedAt, setRefreshedAt] = useState(null);

  useEffect(() => {
    api
      .api('/dashboard/stats')
      .then((payload) => {
        setData(payload);
        setRefreshedAt(new Date());
      })
      .catch(() => {
        setData(null);
      });
  }, []);

  if (!data) {
    return <LinearProgress />;
  }

  const countByStatus = Object.fromEntries((data.ordersByStatus || []).map((x) => [x.status, x.count]));
  const productionCount = (countByStatus.RECEIVED || 0) + (countByStatus.PRODUCTION || 0);
  const readyCount = countByStatus.READY || 0;

  return (
    <Box component="section" sx={{ pb: 2 }}>
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
        <Stack alignItems="center" spacing={1} textAlign="center">
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            Управление студией
          </Typography>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
            Панель AlterEgo
          </Typography>
          <Box sx={{ width: 88, height: 4, borderRadius: 999, bgcolor: 'secondary.main', opacity: 0.9 }} />
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
            Быстрый обзор заказов и склада: текущие статусы, новые заказы и контроль низких остатков.
          </Typography>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card>
          <CardContent sx={{ pb: '16px !important' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Typography variant="overline">{statusRu.PRODUCTION}</Typography>
              <Chip size="small" label="Приоритет" color="secondary" variant="outlined" />
            </Stack>
            <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
              {productionCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              заказов в работе
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ pb: '16px !important' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Typography variant="overline">{statusRu.READY}</Typography>
              <Chip size="small" label="Выдача" color="success" variant="outlined" />
            </Stack>
            <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
              {readyCount}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              готовы к выдаче клиенту
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ pb: '16px !important' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Typography variant="overline">Новые (30 дней)</Typography>
              <Chip size="small" label="Тренд" color="secondary" variant="outlined" />
            </Stack>
            <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
              {data.newOrdersLast30Days}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              оформлено за последние 30 дней
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ pb: '16px !important' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
              <Typography variant="overline">Мало материалов</Typography>
              <Chip
                size="small"
                label={(data.suppliesLowStock ?? 0) > 0 ? 'Внимание' : 'Норма'}
                color={(data.suppliesLowStock ?? 0) > 0 ? 'warning' : 'success'}
                variant="outlined"
              />
            </Stack>
            <Typography variant="h4" sx={{ lineHeight: 1.1 }}>
              {data.suppliesLowStock ?? 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              материалов ниже порога запаса
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Paper
        elevation={0}
        sx={{
          mb: 1.6,
          p: { xs: 1.2, sm: 1.4 },
          border: '1px solid rgba(5,5,5,0.1)',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" gap={0.8} flexWrap="wrap">
            <Chip size="small" color="secondary" variant="outlined" label={`В работе: ${productionCount}`} />
            <Chip size="small" color="success" variant="outlined" label={`К выдаче: ${readyCount}`} />
            <Chip size="small" color={(data.suppliesLowStock ?? 0) > 0 ? 'warning' : 'success'} variant="outlined" label={`Низкий остаток: ${data.suppliesLowStock ?? 0}`} />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Обновлено: {refreshedAt ? refreshedAt.toLocaleTimeString('ru-RU') : '—'}
          </Typography>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <Button component={RouterLink} to="/orders" variant="outlined">
          Открыть заказы
        </Button>
        <Button component={RouterLink} to="/materials" variant="outlined">
          Проверить склад
        </Button>
        <Button component={RouterLink} to="/reports" variant="contained" color="secondary">
          Скачать отчеты
        </Button>
      </Stack>

    </Box>
  );
}
