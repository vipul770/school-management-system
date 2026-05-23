import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { List, ListItem, ListItemIcon, ListItemText, ListItemButton, Collapse, Typography, Box, Divider } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { permissionService } from '../../services/permissions';

export default function RoleBasedNavigation() {
  const [navigationItems, setNavigationItems] = useState([]);
  const [openSections, setOpenSections] = useState({});
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadNavigation = () => {
      const profile = JSON.parse(localStorage.getItem('profile') || 'null');
      if (profile) {
        setUser(profile);
        permissionService.setCurrentUser(profile);
        const items = permissionService.getNavigationItems();
        setNavigationItems(items);
        
        // Group items by category
        const grouped = groupNavigationItems(items);
        setNavigationItems(grouped);
      }
    };

    loadNavigation();
  }, []);

  const groupNavigationItems = (items) => {
    const categories = {
      academic: {
        name: 'Academic',
        icon: '📚',
        items: []
      },
      administrative: {
        name: 'Administrative',
        icon: '⚙️',
        items: []
      },
      financial: {
        name: 'Financial',
        icon: '💰',
        items: []
      },
      communication: {
        name: 'Communication',
        icon: '💬',
        items: []
      },
      library: {
        name: 'Library',
        icon: '📚',
        items: []
      }
    };

    items.forEach(item => {
      if (['/classrooms', '/students', '/teachers', '/attendance', '/exams', '/results', '/timetable'].includes(item.path)) {
        categories.academic.items.push(item);
      } else if (['/hr/employees', '/hr/payroll', '/hr/leaves'].includes(item.path)) {
        categories.administrative.items.push(item);
      } else if (['/fees/invoices', '/fees/payments'].includes(item.path)) {
        categories.financial.items.push(item);
      } else if (['/announcements', '/messages'].includes(item.path)) {
        categories.communication.items.push(item);
      } else if (['/library/books', '/library/issues'].includes(item.path)) {
        categories.library.items.push(item);
      }
    });

    // Filter out empty categories
    return Object.values(categories).filter(category => category.items.length > 0);
  };

  const handleSectionToggle = (sectionName) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* User Info */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
          {permissionService.getRoleDisplayName(user.role)}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
          {user.full_name}
        </Typography>
      </Box>

      {/* Navigation Items */}
      <List sx={{ p: 0 }}>
        {navigationItems.map((category, index) => (
          <React.Fragment key={category.name}>
            <ListItem sx={{ py: 1, px: 2 }}>
              <ListItemIcon sx={{ minWidth: 32, fontSize: '1.2rem' }}>
                {category.icon}
              </ListItemIcon>
              <ListItemText 
                primary={category.name}
                primaryTypographyProps={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 600,
                  color: 'text.secondary'
                }}
              />
              <ListItemButton 
                onClick={() => handleSectionToggle(category.name)}
                sx={{ maxWidth: 32, p: 0.5 }}
              >
                {openSections[category.name] ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            
            <Collapse in={openSections[category.name]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {category.items.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton 
                      onClick={() => handleNavigation(item.path)}
                      selected={isActive(item.path)}
                      sx={{
                        pl: 4,
                        py: 1,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                          '& .MuiListItemText-primary': {
                            color: 'primary.contrastText',
                          },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32, fontSize: '1rem' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.name}
                        primaryTypographyProps={{ 
                          fontSize: '0.85rem',
                          fontWeight: isActive(item.path) ? 600 : 400
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
            
            {index < navigationItems.length - 1 && (
              <Divider sx={{ mx: 2, my: 1 }} />
            )}
          </React.Fragment>
        ))}
      </List>

      {/* Quick Actions */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.12)', mt: 'auto' }}>
        <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 1 }}>
          Quick Actions
        </Typography>
        <List sx={{ p: 0 }}>
          {user.role === 'teacher' && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/attendance/mark')} sx={{ py: 0.5 }}>
                <ListItemText primary="Mark Attendance" primaryTypographyProps={{ fontSize: '0.8rem' }} />
              </ListItemButton>
            </ListItem>
          )}
          {user.role === 'student' && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/fees/my-invoices')} sx={{ py: 0.5 }}>
                <ListItemText primary="My Fees" primaryTypographyProps={{ fontSize: '0.8rem' }} />
              </ListItemButton>
            </ListItem>
          )}
          {user.role === 'parent' && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/students/my-children')} sx={{ py: 0.5 }}>
                <ListItemText primary="My Children" primaryTypographyProps={{ fontSize: '0.8rem' }} />
              </ListItemButton>
            </ListItem>
          )}
          {['accountant', 'school', 'admin'].includes(user.role) && (
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleNavigation('/reports')} sx={{ py: 0.5 }}>
                <ListItemText primary="Reports" primaryTypographyProps={{ fontSize: '0.8rem' }} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>
    </Box>
  );
}

// Simple navigation for mobile or sidebar
export function SimpleNavigation() {
  const [navigationItems, setNavigationItems] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadNavigation = () => {
      const profile = JSON.parse(localStorage.getItem('profile') || 'null');
      if (profile) {
        setUser(profile);
        permissionService.setCurrentUser(profile);
        const items = permissionService.getNavigationItems();
        setNavigationItems(items);
      }
    };

    loadNavigation();
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!user) {
    return null;
  }

  return (
    <List sx={{ p: 0 }}>
      {navigationItems.map((item) => (
        <ListItem key={item.path} disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation(item.path)}
            selected={isActive(item.path)}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.contrastText',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, fontSize: '1rem' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.name}
              primaryTypographyProps={{ 
                fontSize: '0.85rem',
                fontWeight: isActive(item.path) ? 600 : 400
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
}
