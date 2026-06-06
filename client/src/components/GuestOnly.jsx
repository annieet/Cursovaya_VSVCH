import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, LinearProgress } from '@mui/material';

export function GuestOnly({ children }) {
  const user = useSelector((s) => s.auth.user);
  const status = useSelector((s) => s.auth.status);

  if (status === 'loading' || status === 'idle') {
    return (
      <Box sx={{ mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }
  if (user) return <Navigate to="/" replace />;
  return children;
}
