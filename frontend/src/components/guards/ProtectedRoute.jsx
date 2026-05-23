import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { permissionService } from '../../services/permissions';

export default function ProtectedRoute({ 
  children, 
  requiredModule = null, 
  requiredPermission = 'read',
  requiredRoles = [],
  fallbackPath = '/dashboard'
}) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        const profile = JSON.parse(localStorage.getItem('profile') || 'null');

        if (!token || !profile) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        setUser(profile);
        permissionService.setCurrentUser(profile);

        // Check role-based access
        if (requiredRoles.length > 0 && !requiredRoles.includes(profile.role)) {
          setHasAccess(false);
          setLoading(false);
          return;
        }

        // Check module-based access
        if (requiredModule) {
          const canAccess = requiredPermission === 'read' 
            ? permissionService.canRead(requiredModule)
            : permissionService.canWrite(requiredModule);
          
          setHasAccess(canAccess);
        } else {
          setHasAccess(true);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [requiredModule, requiredPermission, requiredRoles]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Checking permissions...
        </Typography>
      </Box>
    );
  }

  if (!hasAccess) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        p={3}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center', 
            maxWidth: 400,
            backgroundColor: 'background.paper'
          }}
        >
          <Typography variant="h6" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {requiredModule 
              ? `You don't have ${requiredPermission} permission for this module.`
              : requiredRoles.length > 0
              ? `You don't have the required role to access this page.`
              : 'You don\'t have permission to access this page.'
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your current role: <strong>{user ? permissionService.getRoleDisplayName(user.role) : 'Unknown'}</strong>
          </Typography>
          <Box mt={2}>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer', textDecoration: 'underline' }}
              onClick={() => window.history.back()}
            >
              Go back
            </Typography>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ cursor: 'pointer', textDecoration: 'underline', ml: 2 }}
              onClick={() => window.location.href = fallbackPath}
            >
              Go to dashboard
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  return children;
}

// Higher-order component for protecting routes
export function withProtection(WrappedComponent, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute {...options}>
        <WrappedComponent {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook for checking permissions programmatically
export function usePermissions() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const profile = JSON.parse(localStorage.getItem('profile') || 'null');
        if (profile) {
          setUser(profile);
          permissionService.setCurrentUser(profile);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const canRead = (module) => {
    return permissionService.canRead(module);
  };

  const canWrite = (module) => {
    return permissionService.canWrite(module);
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const getNavigationItems = () => {
    return permissionService.getNavigationItems();
  };

  return {
    user,
    loading,
    canRead,
    canWrite,
    hasRole,
    hasAnyRole,
    getNavigationItems
  };
}

// Permission-based UI component
export function PermissionGate({ 
  module, 
  permission = 'read', 
  children, 
  fallback = null 
}) {
  const { canRead, canWrite, loading } = usePermissions();

  if (loading) {
    return null;
  }

  const hasPermission = permission === 'read' ? canRead(module) : canWrite(module);

  return hasPermission ? children : fallback;
}

// Role-based UI component
export function RoleGate({ 
  roles, 
  children, 
  fallback = null 
}) {
  const { user, loading } = usePermissions();

  if (loading) {
    return null;
  }

  const hasRole = Array.isArray(roles) ? roles.includes(user?.role) : user?.role === roles;

  return hasRole ? children : fallback;
}

// Conditional rendering based on permissions
export function IfCanRead({ module, children }) {
  return (
    <PermissionGate module={module} permission="read">
      {children}
    </PermissionGate>
  );
}

export function IfCanWrite({ module, children }) {
  return (
    <PermissionGate module={module} permission="write">
      {children}
    </PermissionGate>
  );
}

export function IfRole({ roles, children }) {
  return (
    <RoleGate roles={roles}>
      {children}
    </RoleGate>
  );
}

// Export permission constants for easy use
export const MODULES = {
  CLASSROOMS: 'classrooms',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  ATTENDANCE: 'attendance',
  EXAMS: 'exams',
  EXAM_RESULTS: 'exam_results',
  TIMETABLE: 'timetable',
  ANNOUNCEMENTS: 'announcements',
  DIRECT_MESSAGES: 'direct_messages',
  FEE_INVOICES: 'fee_invoices',
  FEE_PAYMENTS: 'fee_payments',
  HR_EMPLOYEES: 'hr_employees',
  PAYROLL: 'payroll',
  LEAVES: 'leaves',
  LIBRARY_BOOKS: 'library_books',
  LIBRARY_ISSUES: 'library_issues'
};

export const ROLES = {
  SUPERADMIN: 'superadmin',
  SCHOOL: 'school',
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT: 'parent',
  ACCOUNTANT: 'accountant',
  LIBRARIAN: 'librarian'
};
