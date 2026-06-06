import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice.js';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (trimmedEmail !== email) setEmail(trimmedEmail);
    const r = await dispatch(login({ email: trimmedEmail, password: trimmedPassword }));
    if (!r.error) navigate('/', { replace: true });
  };

  return (
    <Box
      component="section"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 3, md: 5 },
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Вход
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Личный кабинет клиента AlterEgo: заказы на декор одежды, статусы и удобная связь со студией.
          </Typography>
          <Box component="form" onSubmit={submit}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
              onBlur={() => setEmail((v) => v.trim())}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Пароль"
              type={show ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="показать пароль"
                      onClick={() => setShow((v) => !v)}
                      edge="end"
                    >
                      {show ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              disabled={status === 'loading'}
            >
              Войти
            </Button>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Нет аккаунта?{' '}
              <Link component={RouterLink} to="/register">
                Создать аккаунт
              </Link>
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
              Для теста: client1@demo.local или admin@salon.local, пароль password123
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
