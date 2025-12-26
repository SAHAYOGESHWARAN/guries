import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

// Role types for the application
export type UserRole = 'admin' | 'user' | 'guest';

// Extended user interface with role-based permissions
export interface AuthUser extends User {
  role: UserRole;
  permissions?: {
    canPerformQC: boolean;
    canApproveAssets: boolean;
    canRejectAssets: boolean;
    canRequestRework: boolean;
    canEditOwnAssets: boolean;
    canDeleteOwnAssets: boolean;
    canViewQCPanel: boolean;
    canSubmitForQC: boolean;
  };
}

// Get permissions based on role
const getPermissionsByRole = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return {
        canPerformQC: true,
        canApproveAssets: true,
        canRejectAssets: true,
        canRequestRework: true,
        canEditOwnAssets: true,
        canDeleteOwnAssets: true,
        canViewQCPanel: true,
        canSubmitForQC: true,
      };
    case 'user':
      return {
        canPerformQC: false,
        canApproveAssets: false,
        canRejectAssets: false,
        canRequestRework: false,
        canEditOwnAssets: true,
        canDeleteOwnAssets: true,
        canViewQCPanel: true, // Can view but with limited actions
        canSubmitForQC: true,
      };
    case 'guest':
    default:
      return {
        canPerformQC: false,
        canApproveAssets: false,
        canRejectAssets: false,
        canRequestRework: false,
        canEditOwnAssets: false,
        canDeleteOwnAssets: false,
        canViewQCPanel: false,
        canSubmitForQC: false,
      };
  }
};

// Lightweight auth hook: tries to read `currentUser` from window.__APP_AUTH__ or localStorage
// Falls back to a safe guest user. Replace with real auth integration when available.
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Allow an app-level global override for testing
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const globalAny: any = window as any;
      if (globalAny.__APP_AUTH__ && typeof globalAny.__APP_AUTH__ === 'object') {
        const authUser = globalAny.__APP_AUTH__ as AuthUser;
        authUser.permissions = getPermissionsByRole(authUser.role as UserRole);
        setUser(authUser);
        setLoading(false);
        return;
      }

      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsedUser = JSON.parse(stored) as AuthUser;
        parsedUser.permissions = getPermissionsByRole(parsedUser.role as UserRole);
        setUser(parsedUser);
        setLoading(false);
        return;
      }
    } catch (e) {
      // ignore
    }

    // default guest user with user role (for demo purposes)
    const defaultUser: AuthUser = {
      id: 1,
      name: 'Guest',
      email: 'guest@example.com',
      role: 'user',
      status: 'active',
      created_at: new Date().toISOString(),
      permissions: getPermissionsByRole('user'),
    };
    setUser(defaultUser);
    setLoading(false);
  }, []);

  // Function to update user (for login/logout)
  const setCurrentUser = useCallback((newUser: AuthUser | null) => {
    if (newUser) {
      newUser.permissions = getPermissionsByRole(newUser.role as UserRole);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('currentUser');
    }
    setUser(newUser);
  }, []);

  // Check if user has admin role
  const isAdmin = user?.role === 'admin';

  // Check if user has specific permission
  const hasPermission = useCallback((permission: keyof NonNullable<AuthUser['permissions']>) => {
    return user?.permissions?.[permission] ?? false;
  }, [user]);

  return {
    user,
    loading,
    setCurrentUser,
    isAdmin,
    hasPermission,
    permissions: user?.permissions
  };
}

export default useAuth;
