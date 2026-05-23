export type Role =
  | 'superadmin'
  | 'admin'
  | 'school'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant'
  | 'librarian';

export interface Tenant {
  id: number;
  name: string;
  code?: string;
  contactEmail?: string;
}

export interface School {
  id: number;
  name: string;
  address?: string;
  tenantId?: number;
}

export interface User {
  id: number;
  username: string;
  fullName?: string;
  email?: string;
  role: Role;
  tenantId?: number;
  schoolId?: number;
}
