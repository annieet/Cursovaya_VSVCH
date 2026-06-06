import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Link } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/authSlice.js';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    const r = await dispatch(
      register({ name: name.trim(), email: email.trim(), password: password.trim() })
    );
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
            Регистрация
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Создайте аккаунт, чтобы оформлять заказы на декор, следить за готовностью и записываться в студию.
          </Typography>
          <Box component="form" onSubmit={submit}>
            <TextField
              fullWidth
              margin="normal"
              label="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.replace(/\s/g, ''))}
              onBlur={() => setEmail((v) => v.trim())}
              required
            />
            <TextField
              fullWidth
              margin="normal"
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
              sx={{ mt: 2 }}
              disabled={status === 'loading'}
            >
              Создать аккаунт
            </Button>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Уже есть вход?{' '}
              <Link component={RouterLink} to="/login">
                Войти
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
