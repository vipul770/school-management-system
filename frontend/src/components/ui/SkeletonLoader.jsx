import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Typography,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
  Backdrop,
  LinearProgress,
  Grid,
} from '@mui/material';

// Skeleton variants for different components
export const CardSkeleton = ({ height = 200, showAvatar = false }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {showAvatar && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={20} />
            </Box>
          </Box>
        )}
        
        <Skeleton variant="text" width="40%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Skeleton variant="rectangular" height={16} width="100%" />
          <Skeleton variant="rectangular" height={16} width="90%" />
          <Skeleton variant="rectangular" height={16} width="85%" />
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Skeleton variant="rectangular" height={32} width={80} />
          <Skeleton variant="rectangular" height={32} width={60} />
        </Box>
      </CardContent>
    </Card>
  );
};

export const StatCardSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height: 140,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Skeleton variant="rectangular" height={32} width={32} />
        </Box>
        
        <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={20} />
      </CardContent>
    </Card>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
      }}
    >
      <TableContainer component={Paper} sx={{ elevation: 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              {Array.from({ length: columns }).map((_, index) => (
                <TableCell key={index}>
                  <Skeleton variant="text" height={24} />
                </TableCell>
              ))}
              <TableCell align="right">
                <Skeleton variant="text" height={24} width={40} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton variant="text" height={20} />
                  </TableCell>
                ))}
                <TableCell align="right">
                  <Skeleton variant="rectangular" height={32} width={32} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};

export const FormSkeleton = ({ fields = 4 }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        p: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
        <Skeleton variant="text" width="30%" height={28} />
      </Typography>
      
      <Grid container spacing={3}>
        {Array.from({ length: fields }).map((_, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Skeleton variant="rectangular" height={56} />
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Skeleton variant="rectangular" height={36} width={100} />
        <Skeleton variant="rectangular" height={36} width={80} />
      </Box>
    </Card>
  );
};

export const ListSkeleton = ({ items = 5, showAvatar = true }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {Array.from({ length: items }).map((_, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 2,
              borderBottom: index < items - 1 ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
            }}
          >
            {showAvatar && (
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            )}
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
            <Skeleton variant="rectangular" height={32} width={32} />
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export const ChartSkeleton = ({ height = 300 }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        height,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ width: '80%', textAlign: 'center' }}>
        <Skeleton variant="rectangular" height={height - 80} />
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          <Skeleton variant="rectangular" height={20} width={60} />
          <Skeleton variant="rectangular" height={20} width={60} />
          <Skeleton variant="rectangular" height={20} width={60} />
        </Box>
      </Box>
    </Card>
  );
};

export const DashboardSkeleton = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Skeleton variant="text" width="30%" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="50%" height={20} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="rectangular" height={36} width={36} />
          <Skeleton variant="rectangular" height={36} width={36} />
          <Skeleton variant="rectangular" height={36} width={36} />
        </Box>
      </Box>

      {/* Stats Grid Skeleton */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCardSkeleton />
          </Grid>
        ))}
      </Grid>

      {/* Content Grid Skeleton */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <CardSkeleton height={400} showAvatar />
        </Grid>
        <Grid item xs={12} md={6}>
          <CardSkeleton height={400} />
        </Grid>
        <Grid item xs={12}>
          <CardSkeleton height={200} />
        </Grid>
      </Grid>
    </Box>
  );
};

// Loading overlay component
export const LoadingOverlay = ({ open, message = 'Loading...' }) => {
  const theme = useTheme();
  
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.modal + 1,
        bgcolor: alpha(theme.palette.background.default, 0.8),
        backdropFilter: 'blur(4px)',
      }}
      open={open}
    >
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.primary' }}>
          {message}
        </Typography>
        <LinearProgress
          sx={{
            width: 200,
            mt: 2,
            '& .MuiLinearProgress-bar': {
              animation: 'pulse 1.5s ease-in-out infinite',
            },
          }}
        />
      </Box>
    </Backdrop>
  );
};

// Progress skeleton component
export const ProgressSkeleton = ({ steps = 3 }) => {
  const theme = useTheme();
  
  return (
    <Card
      sx={{
        p: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        borderRadius: 3,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Array.from({ length: steps }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="rectangular" height={8} width="100%" />
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
};

// Avatar skeleton component
export const AvatarSkeleton = ({ size = 40 }) => (
  <Skeleton variant="circular" width={size} height={size} />
);

// Chip skeleton component
export const ChipSkeleton = ({ width = 80 }) => (
  <Skeleton variant="rectangular" height={24} width={width} sx={{ borderRadius: 12 }} />
);

// Button skeleton component
export const ButtonSkeleton = ({ width = 100, height = 36 }) => (
  <Skeleton variant="rectangular" width={width} height={height} sx={{ borderRadius: 4 }} />
);

// Combined skeleton loader for different contexts
export const SkeletonLoader = ({ type, ...props }) => {
  switch (type) {
    case 'card':
      return <CardSkeleton {...props} />;
    case 'stat':
      return <StatCardSkeleton {...props} />;
    case 'table':
      return <TableSkeleton {...props} />;
    case 'form':
      return <FormSkeleton {...props} />;
    case 'list':
      return <ListSkeleton {...props} />;
    case 'chart':
      return <ChartSkeleton {...props} />;
    case 'dashboard':
      return <DashboardSkeleton {...props} />;
    case 'progress':
      return <ProgressSkeleton {...props} />;
    case 'avatar':
      return <AvatarSkeleton {...props} />;
    case 'chip':
      return <ChipSkeleton {...props} />;
    case 'button':
      return <ButtonSkeleton {...props} />;
    default:
      return <Box>Loading...</Box>;
  }
};

// Animated skeleton component
export const AnimatedSkeleton = ({ children, delay = 0 }) => {
  const [show, setShow] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  
  if (!show) return null;
  
  return (
    <Box
      sx={{
        animation: 'pulse 1.5s ease-in-out infinite',
        '@keyframes pulse': {
          '0%': { opacity: 1 },
          '50%': { opacity: 0.5 },
          '100%': { opacity: 1 },
        },
      }}
    >
      {children}
    </Box>
  );
};

export default {
  CardSkeleton,
  StatCardSkeleton,
  TableSkeleton,
  FormSkeleton,
  ListSkeleton,
  ChartSkeleton,
  DashboardSkeleton,
  LoadingOverlay,
  ProgressSkeleton,
  AvatarSkeleton,
  ChipSkeleton,
  ButtonSkeleton,
  SkeletonLoader,
  AnimatedSkeleton,
};
