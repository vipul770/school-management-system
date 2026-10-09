import useAuth from './useAuth'
export default function usePermission(permission) { const {user}=useAuth(); const permissions=user?.permissions||[]; return permissions.includes('*')||permissions.includes(permission)||permissions.some((p)=>p.endsWith('.*')&&permission.startsWith(p.slice(0,-1))) }
