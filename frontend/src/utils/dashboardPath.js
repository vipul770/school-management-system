export function getDashboardPath(profile) {
  const role = (profile?.role || "").toLowerCase();
  const roleRoutes = {
    superadmin: "/dashboard/superadmin",
    admin: "/dashboard/admin",
    school: "/dashboard/school",
    teacher: "/dashboard/teacher",
    student: "/dashboard/student",
    parent: "/dashboard/parent",
    accountant: "/dashboard/accountant",
    librarian: "/dashboard/librarian",
  };
  if (roleRoutes[role]) return roleRoutes[role];
  if (profile?.school_id || profile?.tenant_id) return "/dashboard/admin";
  return "/dashboard/student";
}

