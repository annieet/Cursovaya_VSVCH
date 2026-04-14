import { Box, Button, Stack, Typography } from '@mui/material';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage.jsx';

function StubPage({ title }) {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Эта страница добавлена как заглушка для демо главной.
      </Typography>
      <Button component={Link} to="/" variant="contained" color="secondary">
        Вернуться на главную
      </Button>
    </Box>
  );
}

function TopDemoNav() {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ p: 2, borderBottom: '1px solid rgba(5,5,5,0.1)', bgcolor: 'background.paper', position: 'sticky', top: 0, zIndex: 10 }}
    >
      <Button component={Link} to="/" size="small">
        Главная
      </Button>
      <Button component={Link} to="/orders/new" size="small">
        Новый заказ
      </Button>
      <Button component={Link} to="/services" size="small">
        Услуги
      </Button>
    </Stack>
  );
}

export default function App() {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <TopDemoNav />
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 1, sm: 2 } }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/orders/new" element={<StubPage title="Оформление заказа" />} />
          <Route path="/services" element={<StubPage title="Виды работ" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Box>
  );
}
