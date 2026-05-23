/**
 * Permission service for role-based access control
 */

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

export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write'
};

// Role-based permission matrix
export const ROLE_PERMISSIONS = {
  superadmin: {
    read_modules: Object.values(MODULES),
    write_modules: Object.values(MODULES)
  },
  school: {
    read_modules: Object.values(MODULES),
    write_modules: Object.values(MODULES)
  },
  admin: {
    read_modules: Object.values(MODULES),
    write_modules: Object.values(MODULES)
  },
  teacher: {
    read_modules: [
      MODULES.CLASSROOMS,
      MODULES.STUDENTS,
      MODULES.TEACHERS,
      MODULES.ATTENDANCE,
      MODULES.EXAMS,
      MODULES.EXAM_RESULTS,
      MODULES.TIMETABLE,
      MODULES.ANNOUNCEMENTS,
      MODULES.DIRECT_MESSAGES
    ],
    write_modules: [
      MODULES.ATTENDANCE,
      MODULES.EXAMS,
      MODULES.EXAM_RESULTS,
      MODULES.TIMETABLE,
      MODULES.ANNOUNCEMENTS,
      MODULES.DIRECT_MESSAGES
    ]
  },
  student: {
    read_modules: [
      MODULES.ATTENDANCE,
      MODULES.FEE_INVOICES,
      MODULES.FEE_PAYMENTS,
      MODULES.EXAMS,
      MODULES.EXAM_RESULTS,
      MODULES.TIMETABLE,
      MODULES.ANNOUNCEMENTS,
      MODULES.DIRECT_MESSAGES,
      MODULES.CLASSROOMS
    ],
    write_modules: [
      MODULES.DIRECT_MESSAGES
    ]
  },
  parent: {
    read_modules: [
      MODULES.ATTENDANCE,
      MODULES.FEE_INVOICES,
      MODULES.FEE_PAYMENTS,
      MODULES.EXAMS,
      MODULES.EXAM_RESULTS,
      MODULES.TIMETABLE,
      MODULES.ANNOUNCEMENTS,
      MODULES.DIRECT_MESSAGES,
      MODULES.CLASSROOMS
    ],
    write_modules: [
      MODULES.DIRECT_MESSAGES
    ]
  },
  accountant: {
    read_modules: [
      MODULES.FEE_INVOICES,
      MODULES.FEE_PAYMENTS,
      MODULES.HR_EMPLOYEES,
      MODULES.PAYROLL,
      MODULES.LEAVES,
      MODULES.ANNOUNCEMENTS,
      MODULES.DIRECT_MESSAGES
    ],
    write_modules: [
      MODULES.FEE_INVOICES,
      MODULES.FEE_PAYMENTS,
      MODULES.PAYROLL,
      MODULES.DIRECT_MESSAGES
    ]
  },
  librarian: {
    read_modules: [
      MODULES.LIBRARY_BOOKS,
      MODULES.LIBRARY_ISSUES,
      MODULES.ANNOUNCEMENTS,
      MODULES.DIRECT_MESSAGES
    ],
    write_modules: [
      MODULES.LIBRARY_BOOKS,
      MODULES.LIBRARY_ISSUES,
      MODULES.DIRECT_MESSAGES
    ]
  }
};

class PermissionService {
  constructor() {
    this.currentUser = null;
    this.userPermissions = null;
  }

  /**
   * Set current user and cache their permissions
   */
  setCurrentUser(user) {
    this.currentUser = user;
    this.userPermissions = ROLE_PERMISSIONS[user.role] || { read_modules: [], write_modules: [] };
  }

  /**
   * Check if user has permission for a specific module
   */
  hasPermission(module, permission) {
    if (!this.userPermissions) return false;
    
    if (permission === PERMISSIONS.READ) {
      return this.userPermissions.read_modules.includes(module);
    } else if (permission === PERMISSIONS.WRITE) {
      return this.userPermissions.write_modules.includes(module);
    }
    
    return false;
  }

  /**
   * Check if user can read a module
   */
  canRead(module) {
    return this.hasPermission(module, PERMISSIONS.READ);
  }

  /**
   * Check if user can write to a module
   */
  canWrite(module) {
    return this.hasPermission(module, PERMISSIONS.WRITE);
  }

  /**
   * Get all modules user can read
   */
  getReadableModules() {
    return this.userPermissions?.read_modules || [];
  }

  /**
   * Get all modules user can write
   */
  getWritableModules() {
    return this.userPermissions?.write_modules || [];
  }

  /**
   * Get navigation items based on user permissions
   */
  getNavigationItems() {
    const readableModules = this.getReadableModules();
    
    const navigationMap = {
      [MODULES.CLASSROOMS]: {
        name: 'Classrooms',
        path: '/classrooms',
        icon: '🏫',
        order: 1
      },
      [MODULES.STUDENTS]: {
        name: 'Students',
        path: '/students',
        icon: '👨‍🎓',
        order: 2
      },
      [MODULES.TEACHERS]: {
        name: 'Teachers',
        path: '/teachers',
        icon: '👩‍🏫',
        order: 3
      },
      [MODULES.ATTENDANCE]: {
        name: 'Attendance',
        path: '/attendance',
        icon: '📊',
        order: 4
      },
      [MODULES.EXAMS]: {
        name: 'Exams',
        path: '/exams',
        icon: '📝',
        order: 5
      },
      [MODULES.EXAM_RESULTS]: {
        name: 'Results',
        path: '/results',
        icon: '📈',
        order: 6
      },
      [MODULES.TIMETABLE]: {
        name: 'Timetable',
        path: '/timetable',
        icon: '📅',
        order: 7
      },
      [MODULES.ANNOUNCEMENTS]: {
        name: 'Announcements',
        path: '/announcements',
        icon: '📢',
        order: 8
      },
      [MODULES.DIRECT_MESSAGES]: {
        name: 'Messages',
        path: '/messages',
        icon: '💬',
        order: 9
      },
      [MODULES.FEE_INVOICES]: {
        name: 'Fee Invoices',
        path: '/fees/invoices',
        icon: '💰',
        order: 10
      },
      [MODULES.FEE_PAYMENTS]: {
        name: 'Fee Payments',
        path: '/fees/payments',
        icon: '💳',
        order: 11
      },
      [MODULES.HR_EMPLOYEES]: {
        name: 'HR Employees',
        path: '/hr/employees',
        icon: '👥',
        order: 12
      },
      [MODULES.PAYROLL]: {
        name: 'Payroll',
        path: '/hr/payroll',
        icon: '💵',
        order: 13
      },
      [MODULES.LEAVES]: {
        name: 'Leaves',
        path: '/hr/leaves',
        icon: '🏖️',
        order: 14
      },
      [MODULES.LIBRARY_BOOKS]: {
        name: 'Library Books',
        path: '/library/books',
        icon: '📚',
        order: 15
      },
      [MODULES.LIBRARY_ISSUES]: {
        name: 'Library Issues',
        path: '/library/issues',
        icon: '📖',
        order: 16
      }
    };

    return readableModules
      .map(module => navigationMap[module])
      .filter(Boolean)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Get dashboard modules for current user
   */
  getDashboardModules() {
    const readableModules = this.getReadableModules();
    
    return readableModules.map(module => ({
      module,
      canRead: this.canRead(module),
      canWrite: this.canWrite(module)
    }));
  }

  /**
   * Check if user can access a specific route
   */
  canAccessRoute(path) {
    // Map routes to modules
    const routeModuleMap = {
      '/classrooms': MODULES.CLASSROOMS,
      '/students': MODULES.STUDENTS,
      '/teachers': MODULES.TEACHERS,
      '/attendance': MODULES.ATTENDANCE,
      '/exams': MODULES.EXAMS,
      '/results': MODULES.EXAM_RESULTS,
      '/timetable': MODULES.TIMETABLE,
      '/announcements': MODULES.ANNOUNCEMENTS,
      '/messages': MODULES.DIRECT_MESSAGES,
      '/fees/invoices': MODULES.FEE_INVOICES,
      '/fees/payments': MODULES.FEE_PAYMENTS,
      '/hr/employees': MODULES.HR_EMPLOYEES,
      '/hr/payroll': MODULES.PAYROLL,
      '/hr/leaves': MODULES.LEAVES,
      '/library/books': MODULES.LIBRARY_BOOKS,
      '/library/issues': MODULES.LIBRARY_ISSUES
    };

    const module = routeModuleMap[path];
    return module ? this.canRead(module) : true; // Allow access to non-module routes
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(role) {
    const roleNames = {
      superadmin: 'Super Admin',
      school: 'School Admin',
      admin: 'Admin',
      teacher: 'Teacher',
      student: 'Student',
      parent: 'Parent',
      accountant: 'Accountant',
      librarian: 'Librarian'
    };
    
    return roleNames[role] || role;
  }

  /**
   * Get user permissions from API
   */
  async fetchUserPermissions() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch('/api/user/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('Error fetching user permissions:', error);
    }
    
    return null;
  }
}

// Create singleton instance
export const permissionService = new PermissionService();

// React hook for permissions
export const usePermissions = () => {
  const [user, setUser] = React.useState(null);
  const [permissions, setPermissions] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPermissions = async () => {
      try {
        const profile = JSON.parse(localStorage.getItem('profile') || 'null');
        if (profile) {
          permissionService.setCurrentUser(profile);
          setUser(profile);
          setPermissions(permissionService.getDashboardModules());
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  return {
    user,
    permissions,
    loading,
    canRead: permissionService.canRead.bind(permissionService),
    canWrite: permissionService.canWrite.bind(permissionService),
    getNavigationItems: permissionService.getNavigationItems.bind(permissionService),
    canAccessRoute: permissionService.canAccessRoute.bind(permissionService)
  };
};

export default permissionService;
