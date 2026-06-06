import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Stack,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import * as api from '../api/client.js';
import { PAGINATION_PROPS, PAGINATION_SX } from '../lib/pagination.js';

const PAGE_SIZE = 6;
function getServiceVisualByPosition(position = 1) {
  const safePosition = Math.max(1, Number(position) || 1);
  return { src: `/images/services/rabota${safePosition}.jpg`, tag: `Работа ${safePosition}` };
}

function getServiceHint(name = '') {
  const key = name.toLowerCase();
  if (key.includes('корпоратив')) return 'Подходит для тиражей и брендирования формы.';
  if (key.includes('консультац')) return 'Начинайте с обсуждения идеи, материалов и сроков.';
  if (key.includes('реставрац')) return 'Для восстановления декора и обновления любимых вещей.';
  if (key.includes('принт') || key.includes('термо')) return 'Оптимально для футболок, худи и мерча.';
  if (key.includes('вышивк')) return 'Хороший выбор для долговечного и премиального декора.';
  return 'Финальная смета уточняется после согласования макета и материалов.';
}

export function ServicesPage() {
  const user = useSelector((s) => s.auth.user);
  const isClient = user?.role === 'CLIENT';
  const canSeeOrderButton = !user || isClient;
  const orderButtonTarget = isClient ? '/orders/new' : '/login';
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(null);
  const [sortBy, setSortBy] = useState('price-asc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.api('/services').then(setRows).catch(() => setRows([]));
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (s) =>
          s.name.toLowerCase().includes(q.toLowerCase()) ||
          (s.description || '').toLowerCase().includes(q.toLowerCase())
      ),
    [rows, q]
  );

  const sorted = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const pa = Number(a.basePrice);
      const pb = Number(b.basePrice);
      if (sortBy === 'price-desc') return pb - pa;
      return pa - pb;
    });
    return copy;
  }, [filtered, sortBy]);

  const stableVisualIndexByServiceId = useMemo(() => {
    const base = [...rows].sort((a, b) => Number(a.basePrice) - Number(b.basePrice));
    const map = new Map();
    base.forEach((service, idx) => {
      map.set(service.id, idx + 1);
    });
    return map;
  }, [rows]);

  const pagesCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  useEffect(() => {
    setPage(1);
  }, [q, sortBy]);

  useEffect(() => {
    if (page > pagesCount) setPage(pagesCount);
  }, [page, pagesCount]);

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
        <Stack alignItems="center" textAlign="center" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <AutoAwesomeOutlinedIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Каталог AlterEgo
            </Typography>
          </Stack>
          <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
            Виды работ
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
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 940 }}>
            Вышивка, стразы, роспись, принт и другие техники — ориентиры по стоимости ниже. Работаем с вашими готовыми
            вещами и корпоративными тиражами; итоговую смету фиксируем после макета и выбора материалов.
          </Typography>
          <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="center" sx={{ pt: 0.5 }}>
            <Chip
              size="small"
              label="Индивидуальный декор"
              variant="outlined"
              sx={{
                borderColor: 'secondary.main',
                color: 'secondary.main',
                bgcolor: 'rgba(193,18,31,0.08)',
                fontWeight: 700,
              }}
            />
            <Chip
              size="small"
              label="Корпоративные тиражи"
              variant="outlined"
              sx={{
                borderColor: 'secondary.main',
                color: 'secondary.main',
                bgcolor: 'rgba(193,18,31,0.08)',
                fontWeight: 700,
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, md: 2 },
          mb: 2.5,
          border: '1px solid rgba(5,5,5,0.1)',
          bgcolor: 'background.paper',
          overflow: 'hidden',
        }}
      >
        <Stack spacing={1.5} direction={{ xs: 'column', md: 'row' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Поиск по видам работ…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 230 } }}>
            <InputLabel id="services-sort-label">Сортировка</InputLabel>
            <Select
              labelId="services-sort-label"
              value={sortBy}
              label="Сортировка"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="price-asc">Цена: по возрастанию</MenuItem>
              <MenuItem value="price-desc">Цена: по убыванию</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {paged.map((s, idx) => {
          const stablePosition = stableVisualIndexByServiceId.get(s.id) || idx + 1;
          const visual = getServiceVisualByPosition(stablePosition);
          return (
            <Card
              key={s.id}
              variant="outlined"
              sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.paper' }}
            >
              <CardMedia
                component="img"
                image={visual.src}
                alt={s.name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/services/rabota1.jpg';
                }}
                sx={{ height: { xs: 240, sm: 280, lg: 310 }, objectFit: 'cover' }}
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.3 }}>
                    {s.name}
                  </Typography>
                  <Chip size="small" label={visual.tag} variant="outlined" />
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 48 }}>
                  {s.description || 'Описание техники будет уточнено на этапе согласования макета.'}
                </Typography>

                <Stack direction="row" gap={1} flexWrap="wrap">
                  <Chip
                    label={`от ${s.basePrice} BYN`}
                    color="secondary"
                    sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', borderColor: 'secondary.main' }}
                  />
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ minHeight: 24 }}>
                  {getServiceHint(s.name)}
                </Typography>

                <Stack direction="row" gap={1} sx={{ mt: 'auto', pt: 0.5 }}>
                  <Button size="small" variant="outlined" onClick={() => setActive(s)}>
                    Подробнее
                  </Button>
                  {canSeeOrderButton && (
                    <Button
                      size="small"
                      variant="text"
                      component={RouterLink}
                      to={orderButtonTarget}
                      endIcon={<ArrowOutwardIcon sx={{ fontSize: 15 }} />}
                    >
                      В заказ
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {sorted.length > PAGE_SIZE && (
        <Stack alignItems="center" sx={{ mt: 2.5 }}>
          <Pagination
            count={pagesCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            {...PAGINATION_PROPS}
            sx={PAGINATION_SX}
          />
        </Stack>
      )}

      {filtered.length === 0 && (
        <Paper elevation={0} sx={{ mt: 2, p: 2.5, border: '1px dashed rgba(5,5,5,0.18)', textAlign: 'center' }}>
          <Typography color="text.secondary">Совпадений не найдено. Попробуйте другое слово для поиска.</Typography>
        </Paper>
      )}

      <Dialog open={Boolean(active)} onClose={() => setActive(null)} fullWidth maxWidth="sm">
        {active && (
          <>
            <DialogTitle sx={{ pb: 1 }}>{active.name}</DialogTitle>
            <DialogContent sx={{ pb: 2.5 }}>
              {(() => {
                const activePosition = stableVisualIndexByServiceId.get(active.id) || 1;
                const activeVisual = getServiceVisualByPosition(activePosition);
                return (
                  <Box
                    component="img"
                src={activeVisual.src}
                    alt={active.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/services/rabota1.jpg';
                    }}
                    sx={{ width: '100%', height: { xs: 220, sm: 260 }, objectFit: 'cover', borderRadius: 1.5, mb: 2 }}
                  />
                );
              })()}
              <Stack direction="row" gap={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
                <Chip
                  label={`от ${active.basePrice} BYN`}
                  color="secondary"
                  sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', borderColor: 'secondary.main' }}
                />
              </Stack>
              <Typography variant="body1" color="text.secondary">
                {active.description || 'Описание техники будет уточнено после обсуждения макета.'}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2">{getServiceHint(active.name)}</Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
