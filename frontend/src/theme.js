import { createTheme } from '@mui/material/styles';

/** Редакционный / коллаж: светлый «мрамор», чёрный текст, один яркий акцент (как в референсах Gills / зин). */
const fontDisplay = '"Oswald", "Arial Narrow", sans-serif';
const fontBody = '"Manrope", "Segoe UI", sans-serif';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#050505', contrastText: '#faf9f7' },
    secondary: { main: '#c1121f', dark: '#8a0f18', contrastText: '#ffffff' },
    success: { main: '#2d6a4f' },
    warning: { main: '#bc6c25' },
    error: { main: '#c1121f' },
    info: { main: '#457b9d' },
    background: {
      default: '#e8e6e2',
      paper: '#faf9f7',
    },
    text: { primary: '#050505', secondary: '#2e2e2e' },
    divider: 'rgba(5, 5, 5, 0.12)',
  },
  typography: {
    fontFamily: fontBody,
    h1: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: '0.04em', lineHeight: 1.15, textTransform: 'uppercase' },
    h2: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: '0.03em', lineHeight: 1.2, textTransform: 'uppercase' },
    h3: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: '0.03em', lineHeight: 1.2, textTransform: 'uppercase' },
    h4: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: '0.03em', lineHeight: 1.25, textTransform: 'uppercase' },
    h5: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1.3 },
    h6: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1.35 },
    button: { fontFamily: fontBody, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'none' },
    overline: { fontFamily: fontBody, fontWeight: 600, letterSpacing: '0.2em' },
  },
  shape: { borderRadius: 2 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          /* Нет горизонтального скролла от full-bleed блоков */
          overflowX: 'hidden',
          /* Полоса не отъедает ширину у контента; прокрутка колесом/тачпадом остаётся */
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        },
        'html::-webkit-scrollbar': {
          display: 'none',
          width: 0,
          height: 0,
        },
        body: {
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          backgroundColor: '#e8e6e2',
          backgroundImage: `
            radial-gradient(ellipse 120% 80% at 10% 20%, rgba(255, 255, 255, 0.75) 0%, transparent 55%),
            radial-gradient(ellipse 90% 70% at 90% 80%, rgba(0, 0, 0, 0.04) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 60%),
            linear-gradient(118deg, transparent 35%, rgba(255, 255, 255, 0.12) 48%, transparent 58%)
          `,
          backgroundAttachment: 'fixed',
        },
        'body::-webkit-scrollbar': {
          display: 'none',
          width: 0,
          height: 0,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          fontWeight: 600,
          boxShadow: 'none',
          paddingLeft: 22,
          paddingRight: 22,
          transition: 'opacity 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
          '&:hover': { boxShadow: 'none' },
        },
        contained: {
          '&:hover': { boxShadow: 'none' },
        },
        outlined: {
          borderWidth: 1,
          '&:hover': { borderWidth: 1 },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          border: '1px solid rgba(5, 5, 5, 0.1)',
          boxShadow: '0 8px 32px rgba(5, 5, 5, 0.07)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 9999,
          border: '1px solid rgba(5, 5, 5, 0.14)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(5, 5, 5, 0.09)',
          backgroundImage: 'none',
        },
      },
    },
  },
});
