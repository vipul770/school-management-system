import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  Divider,
  useTheme,
  alpha,
  Collapse,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  School,
  EventNote,
  AttachMoney,
  Assessment,
  Settings,
  Notifications,
  Search,
  AccountTree,
  LibraryBooks,
  LocalHospital,
  DirectionsBus,
  Inventory,
  Message,
  ExpandLess,
  ExpandMore,
  Logout,
  Person,
  Brightness4,
  Brightness7,
  ChevronLeft,
  Home,
  Class,
  Assignment,
  Receipt,
  TrendingUp,
  Timeline,
  PieChart,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const drawerWidth = 280;

const ModernLayout = ({ children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState(['academic']);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null);
  };

  const handleExpandClick = (item) => {
    setExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: Dashboard,
      path: '/dashboard',
      badge: 0,
    },
    {
      id: 'academic',
      title: 'Academic',
      icon: School,
      children: [
        { id: 'students', title: 'Students', icon: People, path: '/students' },
        { id: 'teachers', title: 'Teachers', icon: Person, path: '/teachers' },
        { id: 'classes', title: 'Classes', icon: Class, path: '/classes' },
        { id: 'subjects', title: 'Subjects', icon: Assignment, path: '/subjects' },
      ],
    },
    {
      id: 'operations',
      title: 'Operations',
      icon: Settings,
      children: [
        { id: 'attendance', title: 'Attendance', icon: EventNote, path: '/attendance' },
        { id: 'exams', title: 'Examinations', icon: Assignment, path: '/exams' },
        { id: 'timetable', title: 'Timetable', icon: Timeline, path: '/timetable' },
        { id: 'fees', title: 'Fee Management', icon: Receipt, path: '/fees' },
      ],
    },
    {
      id: 'resources',
      title: 'Resources',
      icon: Inventory,
      children: [
        { id: 'library', title: 'Library', icon: LibraryBooks, path: '/library' },
        { id: 'transport', title: 'Transport', icon: DirectionsBus, path: '/transport' },
        { id: 'hostel', title: 'Hostel', icon: LocalHospital, path: '/hostel' },
        { id: 'inventory', title: 'Inventory', icon: Inventory, path: '/inventory' },
      ],
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: Assessment,
      children: [
        { id: 'reports', title: 'Reports', icon: Assessment, path: '/reports' },
        { id: 'charts', title: 'Charts', icon: PieChart, path: '/charts' },
        { id: 'trends', title: 'Trends', icon: TrendingUp, path: '/trends' },
      ],
    },
    {
      id: 'communication',
      title: 'Communication',
      icon: Message,
      path: '/messages',
      badge: 3,
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      path: '/settings',
    },
  ];

  const notifications = [
    { id: 1, title: 'New student registration', message: 'John Smith registered', time: '2 min ago', read: false },
    { id: 2, title: 'Fee payment received', message: 'Payment of $500 received', time: '1 hour ago', read: false },
    { id: 3, title: 'System maintenance', message: 'Scheduled for tonight', time: '3 hours ago', read: true },
  ];

  const isActive = (path) => location.pathname === path;

  const renderMenuItem = (item, level = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <Box key={item.id}>
          <ListItem
            button
            onClick={() => handleExpandClick(item.id)}
            sx={{
              mx: 1,
              my: 0.5,
              borderRadius: 2,
              bgcolor: isExpanded ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ListItemIcon
              sx={{
                color: isExpanded ? theme.palette.primary.main : theme.palette.text.secondary,
                minWidth: isCollapsed ? 0 : 40,
              }}
            >
              <item.icon />
            </ListItemIcon>
            {!isCollapsed && (
              <>
                <ListItemText
                  primary={item.title}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: isExpanded ? 'bold' : 'normal',
                      color: isExpanded ? theme.palette.primary.main : theme.palette.text.primary,
                    },
                  }}
                />
                {isExpanded ? <ExpandLess /> : <ExpandMore />}
              </>
            )}
          </ListItem>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child) => (
                <ListItem
                  key={child.id}
                  button
                  onClick={() => navigate(child.path)}
                  sx={{
                    pl: level + 3,
                    mx: 1,
                    my: 0.5,
                    borderRadius: 2,
                    bgcolor: isActive(child.path) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive(child.path) ? theme.palette.primary.main : theme.palette.text.secondary, minWidth: 30 }}>
                    <child.icon sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary={child.title}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: isActive(child.path) ? 'bold' : 'normal',
                          color: isActive(child.path) ? theme.palette.primary.main : theme.palette.text.primary,
                          fontSize: '0.875rem',
                        },
                      }}
                    />
                  )}
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItem
        key={item.id}
        button
        onClick={() => navigate(item.path)}
        sx={{
          mx: 1,
          my: 0.5,
          borderRadius: 2,
          bgcolor: isActive(item.path) ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          },
          transition: 'all 0.2s ease',
        }}
      >
        <ListItemIcon
          sx={{
            color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.secondary,
            minWidth: isCollapsed ? 0 : 40,
          }}
        >
          {item.badge > 0 ? (
            <Badge badgeContent={item.badge} color="error">
              <item.icon />
            </Badge>
          ) : (
            <item.icon />
          )}
        </ListItemIcon>
        {!isCollapsed && (
          <ListItemText
            primary={item.title}
            sx={{
              '& .MuiListItemText-primary': {
                fontWeight: isActive(item.path) ? 'bold' : 'normal',
                color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
              },
            }}
          />
        )}
      </ListItem>
    );
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
              mr: isCollapsed ? 0 : 2,
            }}
          >
            <School />
          </Avatar>
          {!isCollapsed && (
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              SchoolPro
            </Typography>
          )}
        </Box>
        {!isCollapsed && (
          <IconButton size="small" onClick={() => setIsCollapsed(true)}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      {/* Search Bar */}
      {!isCollapsed && (
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.default, 0.5),
              },
            }}
          />
        </Box>
      )}

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        <List>
          {menuItems.map((item) => renderMenuItem(item))}
        </List>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
        <ListItem
          button
          onClick={() => setIsCollapsed(!isCollapsed)}
          sx={{
            borderRadius: 2,
            '&:hover': {
              bgcolor: alpha(theme.palette.action.hover, 0.04),
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {isCollapsed ? <ExpandMore /> : <ExpandLess />}
          </ListItemIcon>
          {!isCollapsed && (
            <ListItemText primary="Collapse" />
          )}
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${isCollapsed ? 60 : drawerWidth}px)` },
          ml: { sm: `${isCollapsed ? 60 : drawerWidth}px` },
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <IconButton
              size="small"
              onClick={() => setIsCollapsed(!isCollapsed)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Toggle Theme">
              <IconButton size="small" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton size="small" onClick={handleNotificationMenuOpen}>
                <Badge badgeContent={notifications.filter(n => !n.read).length} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Profile">
              <IconButton
                size="small"
                onClick={handleProfileMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  JD
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            bgcolor: theme.palette.background.paper,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isCollapsed ? 60 : drawerWidth,
            bgcolor: theme.palette.background.paper,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isCollapsed ? 60 : drawerWidth}px)` },
          mt: 8,
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
          },
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchor}
        open={Boolean(notificationAnchor)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            maxWidth: 400,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
            Notifications
          </Typography>
        </Box>
        {notifications.map((notification) => (
          <MenuItem
            key={notification.id}
            onClick={handleNotificationMenuClose}
            sx={{
              py: 1.5,
              px: 2,
              bgcolor: !notification.read ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
              '&:hover': {
                bgcolor: alpha(theme.palette.action.hover, 0.04),
              },
            }}
          >
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2" sx={{ fontWeight: !notification.read ? 'bold' : 'normal' }}>
                {notification.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {notification.message}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {notification.time}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        <Box sx={{ p: 1, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <Button fullWidth size="small" variant="text">
            Mark all as read
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default ModernLayout;
