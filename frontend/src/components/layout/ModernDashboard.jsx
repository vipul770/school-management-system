import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  Button,
  Divider,
  useTheme,
  alpha,
  Fade,
  Slide,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  School,
  EventNote,
  AttachMoney,
  MoreVert,
  Notifications,
  Settings,
  Search,
  FilterList,
  Download,
  Refresh,
  Assessment,
  Timeline,
  PieChart,
  BarChart,
  Activity,
  CheckCircle,
  Warning,
  Error,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const ModernDashboard = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(3);

  // Mock data
  const stats = [
    {
      title: 'Total Students',
      value: '2,847',
      change: '+12.5%',
      trend: 'up',
      icon: People,
      color: theme.palette.primary.main,
      bgColor: alpha(theme.palette.primary.main, 0.1),
    },
    {
      title: 'Active Classes',
      value: '124',
      change: '+5.2%',
      trend: 'up',
      icon: School,
      color: theme.palette.success.main,
      bgColor: alpha(theme.palette.success.main, 0.1),
    },
    {
      title: 'Attendance Rate',
      value: '94.2%',
      change: '-2.1%',
      trend: 'down',
      icon: EventNote,
      color: theme.palette.warning.main,
      bgColor: alpha(theme.palette.warning.main, 0.1),
    },
    {
      title: 'Revenue',
      value: '$48,250',
      change: '+18.7%',
      trend: 'up',
      icon: AttachMoney,
      color: theme.palette.info.main,
      bgColor: alpha(theme.palette.info.main, 0.1),
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'Sarah Johnson',
      action: 'Added new student',
      target: 'John Smith',
      time: '2 minutes ago',
      avatar: 'SJ',
      status: 'success',
    },
    {
      id: 2,
      user: 'Michael Chen',
      action: 'Updated attendance',
      target: 'Class 10A',
      time: '15 minutes ago',
      avatar: 'MC',
      status: 'info',
    },
    {
      id: 3,
      user: 'Emily Davis',
      action: 'Generated report',
      target: 'Monthly Progress',
      time: '1 hour ago',
      avatar: 'ED',
      status: 'warning',
    },
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Parent-Teacher Meeting',
      date: 'Tomorrow',
      time: '10:00 AM',
      type: 'meeting',
      attendees: 24,
    },
    {
      id: 2,
      title: 'Science Fair',
      date: 'Dec 15',
      time: '9:00 AM',
      type: 'event',
      attendees: 150,
    },
    {
      id: 3,
      title: 'Staff Training',
      date: 'Dec 18',
      time: '2:00 PM',
      type: 'training',
      attendees: 12,
    },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const StatCard = ({ stat, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        sx={{
          height: '100%',
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(stat.bgColor, 0.3)} 100%)`,
          border: `1px solid ${alpha(stat.color, 0.2)}`,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: stat.bgColor,
                color: stat.color,
                width: 56,
                height: 56,
              }}
            >
              <stat.icon sx={{ fontSize: 28 }} />
            </Avatar>
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVert sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
          
          <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
            {stat.value}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={stat.trend === 'up' ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
              label={stat.change}
              size="small"
              sx={{
                bgcolor: stat.trend === 'up' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                color: stat.trend === 'up' ? theme.palette.success.main : theme.palette.error.main,
                fontWeight: 'bold',
              }}
            />
            <Typography variant="body2" color="text.secondary">
              vs last month
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ActivityItem = ({ activity, index }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
        <Avatar
          sx={{
            mr: 2,
            bgcolor: activity.status === 'success' ? theme.palette.success.main :
                   activity.status === 'warning' ? theme.palette.warning.main :
                   theme.palette.info.main,
            width: 40,
            height: 40,
          }}
        >
          {activity.avatar}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            <Box component="span" sx={{ color: theme.palette.primary.main }}>
              {activity.user}
            </Box>
            {' '}{activity.action}{' '}
            <Box component="span" sx={{ fontWeight: 'bold' }}>
              {activity.target}
            </Box>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {activity.time}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: activity.status === 'success' ? theme.palette.success.main :
                     activity.status === 'warning' ? theme.palette.warning.main :
                     theme.palette.info.main,
          }}
        />
      </Box>
    </motion.div>
  );

  const EventCard = ({ event, index }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card
        sx={{
          p: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateX(4px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box
            sx={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              bgcolor: event.type === 'meeting' ? theme.palette.primary.main :
                       event.type === 'event' ? theme.palette.success.main :
                       theme.palette.warning.main,
              mr: 2,
            }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            {event.title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {event.date} at {event.time}
          </Typography>
          <Chip
            label={`${event.attendees} attendees`}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
        </Box>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card sx={{ height: 140 }}>
                <CardContent>
                  <LinearProgress sx={{ mb: 2 }} />
                  <LinearProgress sx={{ mb: 2 }} />
                  <LinearProgress sx={{ width: '60%' }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Dashboard Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back! Here's what's happening with your school today.
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh">
            <IconButton sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filter">
            <IconButton sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download Report">
            <IconButton sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <Download />
            </IconButton>
          </Tooltip>
          <Badge badgeContent={notifications} color="error">
            <IconButton sx={{ border: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
              <Notifications />
            </IconButton>
          </Badge>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard stat={stat} index={index} />
          </Grid>
        ))}
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: 400,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Recent Activities
                </Typography>
                <Button size="small" variant="text">
                  View All
                </Button>
              </Box>
              
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {recentActivities.map((activity, index) => (
                  <React.Fragment key={activity.id}>
                    <ActivityItem activity={activity} index={index} />
                    {index < recentActivities.length - 1 && (
                      <Divider sx={{ my: 1 }} />
                    )}
                  </React.Fragment>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Events */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              height: 400,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Upcoming Events
                </Typography>
                <Button size="small" variant="text">
                  Calendar
                </Button>
              </Box>
              
              <Box sx={{ flex: 1, overflow: 'auto' }}>
                {upcomingEvents.map((event, index) => (
                  <Box key={event.id} sx={{ mb: 2 }}>
                    <EventCard event={event} index={index} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card
            sx={{
              p: 3,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              borderRadius: 3,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Quick Actions
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<People />}
                  sx={{
                    p: 2,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      border: `2px solid ${theme.palette.primary.main}`,
                    },
                  }}
                >
                  Add Student
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<EventNote />}
                  sx={{
                    p: 2,
                    border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.success.main, 0.05),
                      border: `2px solid ${theme.palette.success.main}`,
                    },
                  }}
                >
                  Mark Attendance
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Assessment />}
                  sx={{
                    p: 2,
                    border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.warning.main, 0.05),
                      border: `2px solid ${theme.palette.warning.main}`,
                    },
                  }}
                >
                  Generate Report
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AttachMoney />}
                  sx={{
                    p: 2,
                    border: `2px solid ${alpha(theme.palette.info.main, 0.3)}`,
                    borderRadius: 2,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `2px solid ${theme.palette.info.main}`,
                    },
                  }}
                >
                  Collect Fees
                </Button>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Export Data</MenuItem>
        <MenuItem onClick={handleMenuClose}>Set Alert</MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
      </Menu>
    </Box>
  );
};

export default ModernDashboard;
