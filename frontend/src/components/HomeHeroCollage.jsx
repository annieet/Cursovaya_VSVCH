import { Box, Typography } from '@mui/material';

/** Фон hero: картинка вместо типографики (файл в client/public). */
const HERO_ALTER_IMG = '/hero-alter.png';

function AlterBackdrop() {
  return (
    <Box
      component="img"
      src={HERO_ALTER_IMG}
      alt=""
      aria-hidden
      draggable={false}
      sx={{
        width: '100%',
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
        opacity: { xs: 0.94, md: 0.9 },
        userSelect: 'none',
        pointerEvents: 'none',
        position: 'relative',
        zIndex: 0,
      }}
    />
  );
}

export function HomeHeroCollage() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        pl: 'max(0px, env(safe-area-inset-left, 0px))',
        pr: 'max(0px, env(safe-area-inset-right, 0px))',
        bgcolor: '#e9e6e1',
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.65) 0%, transparent 55%),
          radial-gradient(ellipse at 100% 100%, rgba(0,0,0,0.04) 0%, transparent 45%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.11'/%3E%3C/svg%3E")
        `,
        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.045)',
      }}
    >
      {/* lineHeight:0 — убирает редкий зазор под img в мобильных движках */}
      <Box sx={{ lineHeight: 0, display: 'block' }}>
        <AlterBackdrop />
      </Box>

      {/* Ego — Anton */}
      <Box
        component="h1"
        sx={{
          position: 'absolute',
          top: { xs: '10.5%', sm: '11%', md: '12%' },
          left: { xs: '4%', md: '5.5%' },
          zIndex: 3,
          m: 0,
          p: 0,
          display: 'flex',
          alignItems: 'baseline',
        }}
      >
        <Box
          component="span"
          sx={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Alter
        </Box>
        <Typography
          component="span"
          sx={{
            /* Anton — отдельный контур букв, плотный дисплей (у Bebas Neue в GF одно начертание) */
            fontFamily: '"Anton", "Oswald", sans-serif',
            fontWeight: 400,
            fontSize: {
              /* xs (0–599): без огромного min(rem) — на 320px кегль от vw, не «ломает» экран */
              xs: 'clamp(3.35rem, 17.5vw, 8rem)',
              sm: 'clamp(7.75rem, 24vw, 13rem)',
              md: 'clamp(9rem, 18vw, 15.5rem)',
              /* ~1200–1535 (в т.ч. 1440): крупнее за счёт vw и потолка */
              lg: 'clamp(11.25rem, 18vw, 22rem)',
              xl: 'clamp(13rem, 11vw, 28rem)',
            },
            lineHeight: 0.9,
            letterSpacing: '0.01em',
            color: 'primary.main',
            textTransform: 'uppercase',
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          Ego
        </Typography>
      </Box>

      {/* Кастомная студия */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: '10%', md: '12%' },
          right: { xs: '5%', md: '7%' },
          zIndex: 3,
          textAlign: 'right',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Oswald", sans-serif',
            fontWeight: 800,
            fontSize: {
              /* xs: на 320px без большого min(rem) — опора на vw */
              xs: 'clamp(1.22rem, 5.1vw, 2.35rem)',
              sm: 'clamp(2.1rem, 4.85vw, 3.25rem)',
              md: 'clamp(2.3rem, 3.65vw, 3.7rem)',
              lg: 'clamp(2.55rem, 3.1vw, 4.1rem)',
              xl: 'clamp(2.85rem, 2.5vw, 4.65rem)',
            },
            lineHeight: 1.05,
            letterSpacing: '0.02em',
            color: 'primary.main',
            textTransform: 'uppercase',
            maxWidth: { xs: '13.5rem', sm: '18rem', md: '21rem', lg: '26rem' },
            ml: 'auto',
          }}
        >
          кастомная
        </Typography>
        <Typography
          sx={{
            /* та же гарнитура Oswald (уже в GF), отдельное начертание — не «рисуем» жирность */
            fontFamily: '"Oswald", sans-serif',
            fontWeight: 600,
            fontSize: {
              xs: 'clamp(0.58rem, 2.05vw, 0.98rem)',
              sm: 'clamp(0.86rem, 2.15vw, 1.22rem)',
              md: 'clamp(0.9rem, 1.7vw, 1.32rem)',
              lg: 'clamp(0.96rem, 1.38vw, 1.42rem)',
              xl: 'clamp(1.05rem, 1.15vw, 1.58rem)',
            },
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'primary.main',
            mt: { xs: 0.55, sm: 0.65, md: 0.75 },
            pr: 0.25,
            lineHeight: 1.2,
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          студия
        </Typography>
      </Box>
    </Box>
  );
}
