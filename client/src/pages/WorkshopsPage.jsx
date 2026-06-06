import { useEffect, useState, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  Paper,
  CardContent,
  Chip,
  Stack,
  LinearProgress,
  Button,
} from '@mui/material';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import * as api from '../api/client.js';

const WORKSHOP_PHONE = '+375 (29) 000-00-00';
const WORKSHOP_CONTACT_HINT = `Запись по телефону: ${WORKSHOP_PHONE}`;
const WORKSHOP_CIRCLE_IMAGES = [
  '/images/services/mk1.jpg?v=1',
  '/images/services/mk2.jpg?v=1',
  '/images/services/mk3.jpg?v=1',
];
function fmtRange(startAt, endAt) {
  const s = new Date(startAt);
  const e = new Date(endAt);
  return `${s.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })} — ${e.toLocaleTimeString('ru-RU', { timeStyle: 'short' })}`;
}

export function WorkshopsPage() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.api('/workshops?upcoming=1');
      const closest = [...data].sort((a, b) => new Date(a.startAt) - new Date(b.startAt)).slice(0, 3);
      setAll(closest);
    } catch {
      setAll([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Box component="section">
      <Box sx={{ maxWidth: 980, mx: 'auto', width: '100%' }}>
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
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              Творческая лаборатория AlterEgo
            </Typography>
            <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
              Мастер-классы
            </Typography>
            <Box sx={{ width: 88, height: 4, borderRadius: 999, bgcolor: 'secondary.main', opacity: 0.9 }} />
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
              Живые занятия по росписи, вышивке и декору. На странице публикуем ближайшие тематические МК, а запись
              проходит по телефону студии.
            </Typography>
          </Stack>

          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={0.9}
            sx={{
              mt: 2,
              width: '100%',
              maxWidth: 560,
              mx: 'auto',
              p: { xs: 1.1, sm: 1.3 },
              border: '1px solid rgba(193,18,31,0.25)',
              borderRadius: 3,
              bgcolor: 'rgba(193,18,31,0.08)',
            }}
          >
            <Stack direction="row" spacing={0.8} alignItems="center">
              <LocalPhoneOutlinedIcon sx={{ color: 'secondary.main', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
                Запись по телефону: {WORKSHOP_PHONE}
              </Typography>
            </Stack>
            <Button
              component="a"
              href={`tel:${WORKSHOP_PHONE.replace(/[^\d+]/g, '')}`}
              size="small"
              variant="contained"
              color="secondary"
              sx={{
                alignSelf: 'center',
                px: 1.1,
                py: 0.3,
                minWidth: 0,
                width: 'auto',
                fontSize: '0.75rem',
                borderRadius: 999,
              }}
            >
              Позвонить
            </Button>
          </Stack>
        </Paper>

      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Box
        sx={{
          maxWidth: 980,
          mx: 'auto',
          width: '100%',
          px: { xs: 0.5, sm: 1.5, md: 2.5 },
          py: { xs: 0.5, sm: 1 },
        }}
      >
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          Ближайшие мастер-классы
        </Typography>
        <Stack spacing={{ xs: 3, md: 4 }}>
          {all.map((w, idx) => (
            (() => {
              const workshopImage = WORKSHOP_CIRCLE_IMAGES[idx] || '/images/services/mk1.jpg?v=1';
              const fallbackImage = `/images/services/rabota${Math.max(1, idx + 1)}.jpg`;
              return (
            <Stack
              key={w.id}
              direction={{ xs: 'column', md: idx % 2 === 0 ? 'row' : 'row-reverse' }}
              justifyContent={{ xs: 'center', md: 'space-between' }}
              alignItems="center"
              spacing={{ xs: 1.3, md: 3 }}
              sx={{
                textAlign: { xs: 'center', md: idx % 2 === 0 ? 'left' : 'right' },
                minHeight: { md: 230 },
              }}
            >
              <Box
                component="img"
                src={workshopImage}
                alt={w.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = fallbackImage;
                }}
                sx={{
                  width: { xs: 176, sm: 188, md: 220 },
                  height: { xs: 176, sm: 188, md: 220 },
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '3px solid rgba(193,18,31,0.28)',
                  boxShadow: '0 10px 26px rgba(5,5,5,0.12)',
                  transform: { md: `translateY(${idx % 2 === 0 ? '-6px' : '6px'})` },
                  flexShrink: 0,
                }}
              />
              <Box
                sx={{
                  width: { xs: '100%', sm: 420, md: 500 },
                  maxWidth: '100%',
                  px: { xs: 1.6, sm: 2.2, md: 2.8 },
                  py: { xs: 0.9, md: 1.1 },
                  borderLeft: idx % 2 === 0 ? '2px solid rgba(193,18,31,0.4)' : 'none',
                  borderRight: idx % 2 !== 0 ? '2px solid rgba(193,18,31,0.4)' : 'none',
                }}
              >
                <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                  {w.title}
                </Typography>
                <Stack
                  direction="row"
                  justifyContent={{ xs: 'center', md: idx % 2 === 0 ? 'flex-start' : 'flex-end' }}
                  gap={0.8}
                  flexWrap="wrap"
                  sx={{ mb: 0.8 }}
                >
                  <Chip
                    size="small"
                    label={w.topic}
                    variant="outlined"
                    sx={{
                      height: 'auto',
                      maxWidth: { xs: 220, sm: 230, md: 210 },
                      '& .MuiChip-label': {
                        display: 'block',
                        whiteSpace: 'normal',
                        lineHeight: 1.2,
                        py: 0.5,
                      },
                    }}
                  />
                  {w.priceHint != null && (
                    <Chip
                      size="small"
                      label={`от ${Math.max(100, Number(w.priceHint) || 0)} BYN`}
                      color="secondary"
                      variant="outlined"
                      sx={{
                        height: 'auto',
                        '& .MuiChip-label': {
                          display: 'block',
                          whiteSpace: 'normal',
                          lineHeight: 1.2,
                          py: 0.5,
                        },
                      }}
                    />
                  )}
                </Stack>
                <Typography variant="body2">{fmtRange(w.startAt, w.endAt)}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.6 }}>
                  {w.place}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.6 }}>
                  {WORKSHOP_CONTACT_HINT}
                </Typography>
              </Box>
            </Stack>
              );
            })()
          ))}
        </Stack>
      </Box>

      {!loading && all.length === 0 && (
        <Typography color="text.secondary" sx={{ maxWidth: 980, mx: 'auto', width: '100%' }}>
          Нет запланированных мастер-классов.
        </Typography>
      )}
    </Box>
  );
}
