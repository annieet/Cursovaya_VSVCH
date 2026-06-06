import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Paper,
  TextField,
  Pagination,
  Button,
  Chip,
  Stack,
  MenuItem,
  Badge,
  LinearProgress,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import * as api from '../api/client.js';
import { useDispatch, useSelector } from 'react-redux';
import { setSupplyPrefs, resetAllPrefs, showSnackbar } from '../store/uiSlice.js';
import { PAGINATION_PROPS, PAGINATION_SX } from '../lib/pagination.js';

const CATEGORY_HINTS = {
  стразы: 'Декор блеском: точечные акценты и орнаменты.',
  бисер: 'Для вышивки деталей и фактурных линий.',
  нитки: 'Основа ручной и машинной вышивки.',
  'краска текстильная': 'Роспись и художественные элементы по ткани.',
  пайетки: 'Сценический и праздничный декор.',
  термоплёнка: 'Нанесение надписей и логотипов прессом.',
  фурнитура: 'Люверсы, заклепки, шнуровка, усиление.',
  'клей текстильный': 'Фиксация страз, аппликаций и мелкого декора.',
};

function getStockLevel(stockQty) {
  if (stockQty < 8) return { label: 'Критично мало', color: 'error' };
  if (stockQty < 20) return { label: 'Низкий остаток', color: 'warning' };
  if (stockQty < 45) return { label: 'Средний остаток', color: 'info' };
  return { label: 'Остаток нормальный', color: 'success' };
}

export function MaterialsPage() {
  const prefs = useSelector((s) => s.ui.prefs);
  const dispatch = useDispatch();
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const perPage = 8;

  const load = useCallback(() => {
    const q = new URLSearchParams();
    if (prefs.supplyCategory) q.set('category', prefs.supplyCategory);
    q.set('sort', 'stockQty');
    q.set('order', prefs.supplyOrder);
    api
      .api(`/supplies?${q.toString()}`)
      .then(setList)
      .catch(() => setList([]));
  }, [prefs.supplyCategory, prefs.supplyOrder]);

  useEffect(() => {
    load();
  }, [load]);

  const searched = useMemo(() => {
    const key = search.trim().toLowerCase();
    if (!key) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(key) ||
        s.color.toLowerCase().includes(key) ||
        s.category.toLowerCase().includes(key) ||
        (s.supplier || '').toLowerCase().includes(key)
    );
  }, [list, search]);

  const filtered = searched;

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page]);

  useEffect(() => setPage(1), [filtered.length, prefs.supplyCategory, search]);

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
        <Stack alignItems="center" textAlign="center" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Внутренний модуль AlterEgo
            </Typography>
          </Stack>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
            Склад материалов
          </Typography>
          <Box
            sx={{
              width: 88,
              height: 4,
              borderRadius: 999,
              bgcolor: 'secondary.main',
              opacity: 0.9,
            }}
          />
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 780 }}>
            Внутренний раздел для команды студии: остатки расходников, фильтрация по категориям и контроль складских
            позиций для планирования заказов.
          </Typography>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} alignItems={{ sm: 'center' }}>
        <TextField
          label="Поиск по материалам"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          select
          label="Категория"
          size="small"
          value={prefs.supplyCategory}
          onChange={(e) => dispatch(setSupplyPrefs({ supplyCategory: e.target.value }))}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Все</MenuItem>
          {['стразы', 'бисер', 'нитки', 'краска текстильная', 'пайетки', 'термоплёнка', 'фурнитура', 'клей текстильный'].map(
            (m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            )
          )}
        </TextField>
        <TextField
          select
          label="Сортировка"
          size="small"
          value={`stockQty-${prefs.supplyOrder}`}
          onChange={(e) => {
            const [, order] = e.target.value.split('-');
            dispatch(setSupplyPrefs({ supplySort: 'stockQty', supplyOrder: order }));
          }}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="stockQty-asc">Остаток ↑</MenuItem>
          <MenuItem value="stockQty-desc">Остаток ↓</MenuItem>
        </TextField>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            dispatch(resetAllPrefs());
            dispatch(showSnackbar({ message: 'Настройки интерфейса сброшены', severity: 'info' }));
          }}
        >
          Сбросить настройки
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2,minmax(0,1fr))' },
          gap: 1.5,
        }}
      >
        {paged.map((s) => (
          <Card
            key={s.id}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              borderLeftWidth: 4,
              borderLeftStyle: 'solid',
              borderLeftColor: s.stockQty < 8 ? 'error.main' : s.stockQty < 20 ? 'warning.main' : 'success.main',
              bgcolor: 'background.paper',
            }}
          >
            <CardContent>
              <Stack spacing={1.1}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  gap={0.8}
                >
                  <Typography variant="subtitle1">{s.name}</Typography>
                  <Chip
                    size="small"
                    color={getStockLevel(s.stockQty).color}
                    variant="outlined"
                    label={getStockLevel(s.stockQty).label}
                  />
                </Stack>

                <Stack direction="row" spacing={0.6} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip size="small" label={s.color} />
                  <Chip size="small" variant="outlined" label={s.category} />
                  {s.stockQty < 5 && (
                    <Badge color="warning" variant="dot">
                      <Chip size="small" label="мало на складе" color="warning" variant="outlined" />
                    </Badge>
                  )}
                </Stack>

                <Paper variant="outlined" sx={{ px: 1.2, py: 0.9, bgcolor: 'rgba(5,5,5,0.015)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Остаток на складе
                    </Typography>
                    <Typography variant="caption" fontWeight={700}>
                      {s.stockQty} ед.
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, (Number(s.stockQty) / 80) * 100)}
                    color={s.stockQty < 8 ? 'error' : s.stockQty < 20 ? 'warning' : 'success'}
                    sx={{ height: 8, borderRadius: 999 }}
                  />
                </Paper>

                <Typography variant="body2">
                  <strong>{s.pricePerUnit} BYN</strong> за упаковку
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {CATEGORY_HINTS[s.category] || 'Используется в рабочих процессах декора.'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Поставщик: {s.supplier || 'не указан'} · Партия: {s.packNote || 'стандарт'}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {paged.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Извините, совпадений не обнаружено
        </Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.max(1, Math.ceil(filtered.length / perPage))}
          page={page}
          onChange={(_, p) => setPage(p)}
          {...PAGINATION_PROPS}
          sx={PAGINATION_SX}
        />
      </Box>
    </Box>
  );
}
