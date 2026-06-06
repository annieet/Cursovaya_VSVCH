import { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import * as api from '../api/client.js';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../store/uiSlice.js';
import { bootstrapAuth } from '../store/authSlice.js';

const PROFILE_BG_GRAFFITI = '/images/home-bg/graffiti-bg.png';
const PROFILE_BG_LEFT = '/images/home-bg/ink-left.png';

export function ProfilePage() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const canEditClient = user?.role === 'CLIENT';

  useEffect(() => {
    api
      .api('/auth/me')
      .then((me) => {
        setName(me.name || '');
        setPhone(me.clientProfile?.phone || '');
        setAddress(me.clientProfile?.address || '');
      })
      .catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!canEditClient) {
      dispatch(showSnackbar({ message: 'Редактирование профиля для клиента', severity: 'info' }));
      return;
    }
    try {
      await api.api('/users/profile', { method: 'PATCH', body: { name, phone, address } });
      dispatch(showSnackbar({ message: 'Профиль сохранён', severity: 'success' }));
      dispatch(bootstrapAuth());
    } catch (err) {
      dispatch(showSnackbar({ message: err.message, severity: 'error' }));
    }
  };

  return (
    <Box component="section" sx={{ position: 'relative', pb: 2 }}>
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={PROFILE_BG_GRAFFITI}
          alt=""
          draggable={false}
          sx={{
            position: 'absolute',
            right: { xs: '-18%', md: '-8%' },
            top: { xs: '8%', md: '12%' },
            width: { xs: '120%', md: 'min(84vw, 900px)' },
            opacity: { xs: 0.14, md: 0.18 },
            mixBlendMode: 'multiply',
          }}
        />
        <Box
          component="img"
          src={PROFILE_BG_LEFT}
          alt=""
          draggable={false}
          sx={{
            position: 'absolute',
            left: { xs: '-14%', md: '-6%' },
            top: { xs: '14%', md: '18%' },
            width: { xs: 'min(88vw, 420px)', md: 'min(42vw, 560px)' },
            opacity: { xs: 0.2, md: 0.26 },
            mixBlendMode: 'multiply',
          }}
        />
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 620, mx: 'auto', width: '100%' }}>
        <Paper
          elevation={0}
          sx={{
            mb: 2.5,
            px: { xs: 1.5, sm: 2.5, md: 3 },
            py: { xs: 2, md: 2.5 },
            border: '1px solid rgba(5,5,5,0.1)',
            bgcolor: 'background.paper',
            textAlign: 'center',
            backgroundImage:
              'linear-gradient(180deg, rgba(193,18,31,0.03) 0%, rgba(193,18,31,0) 70%), radial-gradient(circle at 100% 0%, rgba(193,18,31,0.08) 0%, transparent 45%)',
          }}
        >
          <Stack alignItems="center" spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AutoAwesomeOutlinedIcon sx={{ fontSize: 20, color: 'secondary.main' }} />
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Личный кабинет
              </Typography>
            </Stack>
            <Typography variant="h4" component="h1" sx={{ color: 'primary.main' }}>
              Профиль
            </Typography>
            <Box sx={{ width: 88, height: 4, borderRadius: 999, bgcolor: 'secondary.main', opacity: 0.9 }} />
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }}>
              Обновляйте контактные данные, чтобы мы быстро согласовывали детали заказа и способ передачи готовой вещи.
            </Typography>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2.5, md: 3 },
            border: '1px solid rgba(5,5,5,0.1)',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }} gap={1}>
            <Typography variant="h6">Данные аккаунта</Typography>
            <Chip
              size="small"
              label={`Роль: ${user?.role || '—'}`}
              variant="outlined"
              sx={{ borderColor: 'secondary.main', color: 'secondary.main', fontWeight: 600 }}
            />
          </Stack>
          <Divider sx={{ mb: 2 }} />

          <Box component="form" onSubmit={save}>
            <Stack spacing={2}>
              <TextField label="Имя" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
              <TextField
                label="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!canEditClient}
                fullWidth
              />
              <TextField
                label="Адрес"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={!canEditClient}
                fullWidth
              />
              {!canEditClient && (
                <Typography variant="caption" color="text.secondary">
                  Редактирование контактных полей доступно для клиента.
                </Typography>
              )}
              <Button type="submit" variant="contained" disabled={!canEditClient} sx={{ alignSelf: 'flex-start' }}>
                Сохранить
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
