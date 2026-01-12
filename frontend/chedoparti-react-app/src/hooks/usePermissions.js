import { useCallback } from 'react';
import useAuth from './useAuth';
import { ROLES, ROLE_PERMISSIONS } from '../constants/roles';

export default function usePermissions() {
  const { user } = useAuth();

  const hasRole = useCallback(
    (role) => {
      if (!user || !user.role) return false;
      return user.role === role;
    },
    [user]
  );

  const can = useCallback(
    (permission) => {
      if (!user || !user.role) return false;
      
      // Super Admin has all permissions implicitly (or explicitly via ROLE_PERMISSIONS)
      if (user.role === ROLES.SUPER_ADMIN) return true;

      const userPermissions = ROLE_PERMISSIONS[user.role] || [];
      return userPermissions.includes(permission);
    },
    [user]
  );

  // Convenience methods
  const isSuperAdmin = useCallback(() => hasRole(ROLES.SUPER_ADMIN), [hasRole]);
  const isInstitutionAdmin = useCallback(() => hasRole(ROLES.INSTITUTION_ADMIN), [hasRole]);
  const isStaff = useCallback(() => hasRole(ROLES.STAFF), [hasRole]);
  const isViewer = useCallback(() => hasRole(ROLES.VIEWER), [hasRole]);
  const isCoach = useCallback(() => hasRole(ROLES.COACH), [hasRole]);
  const isSocio = useCallback(() => hasRole(ROLES.SOCIO), [hasRole]);

  // Combined checks
  const isAdmin = useCallback(() => isSuperAdmin() || isInstitutionAdmin(), [isSuperAdmin, isInstitutionAdmin]);
  const canManageInstitution = useCallback(() => isAdmin() || isStaff(), [isAdmin, isStaff]);

  return {
    user,
    role: user?.role,
    can,
    hasRole,
    isSuperAdmin,
    isInstitutionAdmin,
    isStaff,
    isViewer,
    isCoach,
    isSocio,
    isAdmin,
    canManageInstitution,
    ROLES, // Export constants for easy access
  };
}
