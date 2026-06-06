import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  Tooltip,
  useMediaQuery,
  useTheme,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice.js';
const linkSx = ({ isActive }) => ({
  color: isActive ? 'secondary.main' : 'inherit',
  fontWeight: isActive ? 600 : 500,
});

const barLinkSx = ({ isActive }) => ({
  color: isActive ? 'secondary.main' : 'text.secondary',
  fontWeight: isActive ? 600 : 500,
  textDecoration: 'none',
  letterSpacing: '0.06em',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  '&:hover': { color: 'primary.main' },
});

function NavContent({ user, staff, onNavigate }) {
  const items = [
    { to: '/', label: 'Главная', icon: <HomeOutlinedIcon /> },
    { to: '/services', label: 'Виды работ', icon: <StyleOutlinedIcon /> },
    { to: '/workshops', label: 'Мастер-классы', icon: <SchoolOutlinedIcon /> },
  ];
  if (user) {
    items.push({ to: '/orders', label: 'Заказы', icon: <AssignmentOutlinedIcon /> });
    items.push({ to: '/profile', label: 'Профиль', icon: <PersonOutlineIcon /> });
  }
  if (staff) {
    items.push({ to: '/materials', label: 'Материалы', icon: <Inventory2OutlinedIcon /> });
    items.push({ to: '/dashboard', label: 'Панель', icon: <DashboardOutlinedIcon /> });
    items.push({ to: '/reports', label: 'Отчёты', icon: <AssessmentOutlinedIcon /> });
  }
  if (!user) {
    items.push({ to: '/login', label: 'Войти', icon: <LoginOutlinedIcon /> });
    items.push({ to: '/register', label: 'Регистрация', icon: <PersonAddOutlinedIcon /> });
  }
  return (
    <List sx={{ width: 260, pt: 2 }} component="nav">
      {items.map((x) => (
        <ListItemButton
          key={x.to}
          component={NavLink}
          to={x.to}
          sx={linkSx}
          onClick={onNavigate}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{x.icon}</ListItemIcon>
          <ListItemText primary={x.label} />
        </ListItemButton>
      ))}
    </List>
  );
}

export function MainLayout() {
  const theme = useTheme();
  const { pathname } = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);
  const user = useSelector((s) => s.auth.user);
  const showGuestHeaderAuth = !user && !isMobile;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const staff = user?.role === 'ADMIN';

  const closeDrawer = () => setOpen(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        boxSizing: 'border-box',
        bgcolor: 'background.default',
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(250, 249, 247, 0.92)',
          backdropFilter: 'blur(12px)',
          color: 'text.primary',
          width: '100%',
          maxWidth: '100vw',
          left: 0,
          right: 0,
        }}
        component="header"
      >
        <Toolbar
          disableGutters
          sx={{
            px: { xs: 1.5, sm: 2, md: 4, lg: 5 },
            maxWidth: '100%',
            minWidth: 0,
            minHeight: { xs: 56, sm: 64 },
            gap: 0.5,
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="меню"
              onClick={() => setOpen(true)}
              sx={{ mr: 0.5, flexShrink: 0 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            component={NavLink}
            to="/"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              minWidth: 0,
              textDecoration: 'none',
              mr: { xs: 0, md: 4 },
              fontFamily: '"Oswald", sans-serif',
              fontSize: { xs: '1.1rem', sm: '1.4rem' },
              fontWeight: 600,
              color: 'primary.main',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            AlterEgo
          </Typography>
          {!isMobile && (
            <Box component="nav" sx={{ display: 'flex', gap: 2, flexGrow: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography component={NavLink} to="/" sx={barLinkSx} variant="body2">
                Главная
              </Typography>
              <Typography component={NavLink} to="/services" sx={barLinkSx} variant="body2">
                Виды работ
              </Typography>
              <Typography component={NavLink} to="/workshops" sx={barLinkSx} variant="body2">
                Мастер-классы
              </Typography>
              {user && (
                <>
                  <Typography component={NavLink} to="/orders" sx={barLinkSx} variant="body2">
                    Заказы
                  </Typography>
                  <Typography component={NavLink} to="/profile" sx={barLinkSx} variant="body2">
                    Профиль
                  </Typography>
                </>
              )}
              {staff && (
                <>
                  <Typography component={NavLink} to="/materials" sx={barLinkSx} variant="body2">
                    Материалы
                  </Typography>
                  <Typography component={NavLink} to="/dashboard" sx={barLinkSx} variant="body2">
                    Панель
                  </Typography>
                  <Typography component={NavLink} to="/reports" sx={barLinkSx} variant="body2">
                    Отчёты
                  </Typography>
                </>
              )}
            </Box>
          )}
          {user ? (
            <>
              <Typography variant="body2" sx={{ mr: 1, display: { xs: 'none', sm: 'block' }, color: 'text.secondary' }}>
                {user.name}
              </Typography>
              <Tooltip title="Выйти">
                <IconButton
                  color="inherit"
                  onClick={() => {
                    dispatch(logout());
                    navigate('/login');
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          ) : showGuestHeaderAuth ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
              <Button
                component={NavLink}
                to="/register"
                size="small"
                variant="contained"
                color="secondary"
                startIcon={<PersonAddOutlinedIcon />}
              >
                Регистрация
              </Button>
              <Button
                component={NavLink}
                to="/login"
                size="small"
                variant="outlined"
                startIcon={<LoginOutlinedIcon />}
                sx={{ color: 'text.secondary', borderColor: 'rgba(5,5,5,0.2)' }}
              >
                Войти
              </Button>
            </Box>
          ) : null}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={open} onClose={closeDrawer}>
        <Box sx={{ width: 260, bgcolor: 'background.paper' }}>
          <Toolbar />
          <Divider />
          <NavContent user={user} staff={staff} onNavigate={closeDrawer} />
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 'none',
          px: { xs: 2, sm: 3, md: 4, lg: 5 },
          pt: pathname === '/' ? 0 : 3,
          pb: pathname === '/' ? 0 : 3,
        }}
      >
        <Outlet />
      </Box>

    </Box>
  );
}
