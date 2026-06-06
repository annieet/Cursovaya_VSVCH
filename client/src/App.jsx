import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, LinearProgress, Snackbar, Alert } from '@mui/material';
import { bootstrapAuth } from './store/authSlice.js';
import { hideSnackbar } from './store/uiSlice.js';
import { MainLayout } from './components/MainLayout.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ServicesPage } from './pages/ServicesPage.jsx';
import { MaterialsPage } from './pages/MaterialsPage.jsx';
import { OrdersPage } from './pages/OrdersPage.jsx';
import { OrderDetailPage } from './pages/OrderDetailPage.jsx';
import { OrderNewPage } from './pages/OrderNewPage.jsx';
import { WorkshopsPage } from './pages/WorkshopsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { ReportsPage } from './pages/ReportsPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { GuestOnly } from './components/GuestOnly.jsx';

function PrivateRoute({ children }) {
  const user = useSelector((s) => s.auth.user);
  const status = useSelector((s) => s.auth.status);
  if (status === 'loading' || status === 'idle') {
    return (
      <Box sx={{ mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function StaffRoute({ children }) {
  const user = useSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  return children;
}

function ClientRoute({ children }) {
  const user = useSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'CLIENT') {
    return <Navigate to="/orders" replace />;
  }
  return children;
}

export default function App() {
  const dispatch = useDispatch();
  const snackbar = useSelector((s) => s.ui.snackbar);

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100vw',
        minHeight: '100vh',
        overflowX: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="register"
            element={
              <GuestOnly>
                <RegisterPage />
              </GuestOnly>
            }
          />
          <Route path="services" element={<ServicesPage />} />
          <Route path="workshops" element={<WorkshopsPage />} />
          <Route
            path="orders"
            element={
              <PrivateRoute>
                <OrdersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="orders/new"
            element={
              <ClientRoute>
                <OrderNewPage />
              </ClientRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <PrivateRoute>
                <OrderDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="materials"
            element={
              <StaffRoute>
                <MaterialsPage />
              </StaffRoute>
            }
          />
          <Route
            path="dashboard"
            element={
              <StaffRoute>
                <DashboardPage />
              </StaffRoute>
            }
          />
          <Route
            path="reports"
            element={
              <StaffRoute>
                <ReportsPage />
              </StaffRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => dispatch(hideSnackbar())}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => dispatch(hideSnackbar())}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
