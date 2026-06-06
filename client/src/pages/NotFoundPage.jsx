import { Box, Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        backgroundImage:
          'linear-gradient(180deg, rgba(250,249,247,0.84), rgba(250,249,247,0.9)), url("/images/home-bg/graffiti-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
            opacity: { xs: 0.22, md: 0.28 },
          backgroundImage:
            'radial-gradient(circle at 12% 82%, rgba(193,18,31,0.28) 0%, transparent 20%), radial-gradient(circle at 88% 18%, rgba(193,18,31,0.25) 0%, transparent 16%), radial-gradient(circle at 88% 78%, rgba(193,18,31,0.15) 0%, transparent 14%)',
        }}
      />

      <Stack spacing={1.2} sx={{ position: 'relative', textAlign: 'center', px: 2 }}>
        <Typography
          component="div"
          sx={{
            fontFamily: '"Oswald", sans-serif',
            fontSize: { xs: '9.5rem', sm: '14.5rem', md: '20rem' },
            lineHeight: 0.84,
            color: 'secondary.main',
            letterSpacing: '0.04em',
            filter: 'blur(1.8px)',
            textShadow: '0 0 26px rgba(193,18,31,0.58)',
            userSelect: 'none',
            mb: { xs: 1.6, sm: 2.2, md: 2.8 },
          }}
        >
          404
        </Typography>

        <Box sx={{ height: { xs: 28, sm: 42, md: 56 } }} />

        <Typography variant="h5" sx={{ color: 'primary.main' }}>
          Страница не найдена
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
          Возможно, ссылка устарела или адрес введен с ошибкой. Вернитесь на главную и продолжите работу с платформой.
        </Typography>

        <Button component={RouterLink} to="/" variant="contained" color="secondary" sx={{ mt: 1.2, alignSelf: 'center' }}>
          На главную
        </Button>
      </Stack>
    </Box>
  );
}
