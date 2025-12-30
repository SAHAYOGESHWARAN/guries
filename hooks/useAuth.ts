import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

// Role types for the application - extended to support more roles
export type UserRole = 'admin' | 'user' | 'manager' | 'qc' | 'guest';

// Extended user interface with role-based permissions
export interface AuthUser extends User {
  role: UserRole;
  last_login?: string;
  permissions?: {
    // QC-related permissions
    canPerformQC: boolean;
    canApproveAssets: boolean;
    canRejectAssets: boolean;
    canRequestRework: boolean;
    canViewQCPanel: boolean;
    canSubmitForQC: boolean;
    // Asset permissions
    canEditOwnAssets: boolean;
    canDeleteOwnAssets: boolean;
    canEditAllAssets: boolean;
    canDeleteAllAssets: boolean;
    canViewAllAssets: boolean;
    // Admin-only permissions
    canViewAdminQCReview: boolean;
    canViewAdminConsole: boolean;
    canManageUsers: boolean;
    canViewAuditLogs: boolean;
  };
}

// Get permissions based on role - Role & Permission Matrix implementation
const getPermissionsByRole = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return {
        // Admin has full QC permissions
        canPerformQC: true,
        canApproveAssets: true,
        canRejectAssets: true,
        canRequestRework: true,
        canViewQCPanel: true,
        canSubmitForQC: true,
        // Admin has full asset permissions
        canEditOwnAssets: true,
        canDeleteOwnAssets: true,
        canEditAllAssets: true,
        canDeleteAllAssets: true,
        canViewAllAssets: true,
        // Admin-only screens
        canViewAdminQCReview: true,
        canViewAdminConsole: true,
        canManageUsers: true,
        canViewAuditLogs: true,
      };
    case 'qc':
      return {
        // QC role can perform reviews but not admin functions
        canPerformQC: true,
        canApproveAssets: true,
        canRejectAssets: true,
        canRequestRework: true,
        canViewQCPanel: true,
        canSubmitForQC: false,
        canEditOwnAssets: true,
        canDeleteOwnAssets: true,
        canEditAllAssets: false,
        canDeleteAllAssets: false,
        canViewAllAssets: true,
        canViewAdminQCReview: false, // QC role cannot access Admin QC Review screen
        canViewAdminConsole: false,
        canManageUsers: false,
        canViewAuditLogs: false,
      };
    case 'manager':
      return {
        // Manager can view but not perform QC
        canPerformQC: false,
        canApproveAssets: false,
        canRejectAssets: false,
        canRequestRework: false,
        canViewQCPanel: true,
        canSubmitForQC: true,
        canEditOwnAssets: true,
        canDeleteOwnAssets: true,
        canEditAllAssets: false,
        canDeleteAllAssets: false,
        canViewAllAssets: true,
        canViewAdminQCReview: false,
        canViewAdminConsole: false,
        canManageUsers: false,
        canViewAuditLogs: false,
      };
    case 'user':
      return {
        // Employee/User - can submit for QC, view panel (read-only), manage own assets
        canPerformQC: false,
        canApproveAssets: false,
        canRejectAssets: false,
        canRequestRework: false,
        canViewQCPanel: true, // Can view QC panel in side drawer (read-only)
        canSubmitForQC: true, // Can submit assets for QC review
        canEditOwnAssets: true,
        canDeleteOwnAssets: true,
        canEditAllAssets: false,
        canDeleteAllAssets: false,
        canViewAllAssets: false, // Only sees own assets
        canViewAdminQCReview: false, // Cannot access Admin QC Review screen
        canViewAdminConsole: false,
        canManageUsers: false,
        canViewAuditLogs: false,
      };
    case 'guest':
    default:
      return {
        canPerformQC: false,
        canApproveAssets: false,
        canRejectAssets: false,
        canRequestRework: false,
        canViewQCPanel: false,
        canSubmitForQC: false,
        canEditOwnAssets: false,
        canDeleteOwnAssets: false,
        canEditAllAssets: false,
        canDeleteAllAssets: false,
        canViewAllAssets: false,
        canViewAdminQCReview: false,
        canViewAdminConsole: false,
        canManageUsers: false,
        canViewAuditLogs: false,
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
