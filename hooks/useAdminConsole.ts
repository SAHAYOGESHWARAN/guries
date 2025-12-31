import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';
import { db } from '../utils/storage';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

interface EmployeeMetrics {
    totalUsers: number;
    activeAccounts: number;
    inactiveAccounts: number;
    pendingAccounts: number;
    systemHealth: string;
}

interface UseAdminConsoleReturn {
    employees: User[];
    pendingRegistrations: User[];
    metrics: EmployeeMetrics;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    createEmployee: (data: Partial<User> & { password?: string }) => Promise<User | null>;
    updateEmployee: (id: number, data: Partial<User>) => Promise<User | null>;
    resetPassword: (id: number, newPassword: string) => Promise<boolean>;
    toggleStatus: (id: number) => Promise<User | null>;
    deleteEmployee: (id: number) => Promise<boolean>;
    validateLogin: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
    getPendingRegistrations: () => Promise<void>;
    approveRegistration: (id: number, role?: string) => Promise<User | null>;
    rejectRegistration: (id: number, reason?: string) => Promise<boolean>;
}

export const useAdminConsole = (): UseAdminConsoleReturn => {
    const [employees, setEmployees] = useState<User[]>([]);
    const [pendingRegistrations, setPendingRegistrations] = useState<User[]>([]);
    const [metrics, setMetrics] = useState<EmployeeMetrics>({
        totalUsers: 0,
        activeAccounts: 0,
        inactiveAccounts: 0,
        pendingAccounts: 0,
        systemHealth: 'Optimal'
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [useLocalStorage, setUseLocalStorage] = useState(false);

    // Calculate metrics from employees
    const calculateMetrics = useCallback((users: User[], pending: User[]): EmployeeMetrics => {
        return {
            totalUsers: users.length,
            activeAccounts: users.filter(u => u.status === 'active').length,
            inactiveAccounts: users.filter(u => u.status === 'inactive').length,
            pendingAccounts: pending.length,
            systemHealth: 'Optimal'
        };
    }, []);

    // Fetch employees from API or localStorage
    const fetchEmployees = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/admin/employees`);
            if (response.ok) {
                const data = await response.json();
                // Filter out pending users from main employees list
                const activeEmployees = data.filter((u: User) => u.status !== 'pending');
                const pending = data.filter((u: User) => u.status === 'pending');
                setEmployees(activeEmployees);
                setPendingRegistrations(pending);
                setMetrics(calculateMetrics(activeEmployees, pending));
                setUseLocalStorage(false);
            } else {
                throw new Error('API not available');
            }
        } catch (err) {
            // Fallback to localStorage
            console.log('Using localStorage fallback for employees');
            setUseLocalStorage(true);
            const localUsers = db.users.getAll();
            const activeEmployees = localUsers.filter(u => u.status !== 'pending');
            const pending = localUsers.filter(u => u.status === 'pending');
            setEmployees(activeEmployees);
            setPendingRegistrations(pending);
            setMetrics(calculateMetrics(activeEmployees, pending));
        } finally {
            setLoading(false);
        }
    }, [calculateMetrics]);

    // Initial fetch
    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Create employee
    const createEmployee = useCallback(async (data: Partial<User> & { password?: string }): Promise<User | null> => {
        try {
            if (!useLocalStorage) {
                const response = await fetch(`${API_BASE_URL}/admin/employees`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const newEmployee = await response.json();
                    await fetchEmployees();
                    return newEmployee;
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to create employee');
                }
            } else {
                // localStorage fallback
                const newUser = db.users.create({
                    name: data.name || '',
                    email: data.email || '',
                    role: data.role || 'user',
                    status: 'active',
                    created_at: new Date().toISOString()
                } as User);
                await fetchEmployees();
                return newUser;
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    }, [useLocalStorage, fetchEmployees]);

    // Update employee
    const updateEmployee = useCallback(async (id: number, data: Partial<User>): Promise<User | null> => {
        try {
            if (!useLocalStorage) {
                const response = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const updatedEmployee = await response.json();
                    await fetchEmployees();
                    return updatedEmployee;
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update employee');
                }
            } else {
                // localStorage fallback
                const updated = db.users.update(id, data);
                await fetchEmployees();
                return updated;
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    }, [useLocalStorage, fetchEmployees]);

    // Reset password
    const resetPassword = useCallback(async (id: number, newPassword: string): Promise<boolean> => {
        try {
            if (!useLocalStorage) {
                const response = await fetch(`${API_BASE_URL}/admin/employees/${id}/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newPassword })
                });

                if (response.ok) {
                    return true;
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to reset password');
                }
            } else {
                // localStorage doesn't store passwords, just return success
                return true;
            }
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    }, [useLocalStorage]);

    // Toggle status (activate/deactivate)
    const toggleStatus = useCallback(async (id: number): Promise<User | null> => {
        try {
            if (!useLocalStorage) {
                const response = await fetch(`${API_BASE_URL}/admin/employees/${id}/toggle-status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    const result = await response.json();
                    await fetchEmployees();
                    return result.employee;
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to toggle status');
                }
            } else {
                // localStorage fallback
                const user = db.users.getById(id);
                if (user) {
                    const newStatus = user.status === 'active' ? 'inactive' : 'active';
                    const updated = db.users.update(id, { status: newStatus });
                    await fetchEmployees();
                    return updated;
                }
                return null;
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    }, [useLocalStorage, fetchEmployees]);

    // Delete employee
    const deleteEmployee = useCallback(async (id: number): Promise<boolean> => {
        try {
            if (!useLocalStorage) {
                const response = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok || response.status === 204) {
                    await fetchEmployees();
                    return true;
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete employee');
                }
            } else {
                // localStorage fallback
                db.users.delete(id);
                await fetchEmployees();
                return true;
            }
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    }, [useLocalStorage, fetchEmployees]);

    // Validate login
    const validateLogin = useCallback(async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
        try {
            if (!useLocalStorage) {
                const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    return { success: true, user: data.user };
                } else {
                    return { success: false, error: data.error };
                }
            } else {
                // localStorage fallback - check user status
                const users = db.users.getAll();
                const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (!user) {
                    return { success: false, error: 'Invalid credentials' };
                }

                if (user.status === 'inactive') {
                    return { success: false, error: 'User deactivated' };
                }

                if (user.status === 'pending') {
                    return { success: false, error: 'Account pending approval' };
                }

                return { success: true, user };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    }, [useLocalStorage]);

    // Get pending registrations
    const getPendingRegistrations = useCallback(async (): Promise<void> => {
        try {
            if (!useLocalStorage) {
                const response = await fetch(`${API_BASE_URL}/admin/employees/pending`);
                if (response.ok) {
                    const data = await response.json();
                    setPendingRegistrations(data);
                }
            } else {
                const localUsers = db.users.getAll();
                const pending = localUsers.filter(u => u.status === 'pending');
                setPendingRegistrations(pending);
            }
        } catch (err: any) {
            console.error('Error fetching pending registrations:', err);
        }
    }, [useLocalStorage]);

    // Approve pending registration
    const approveRegistration = useCallback(async (id: number, role?: string): Promise<User | null> => {
        try {
            if (!useLocalStorage) {
                const response = await fetch(`${API_BASE_URL}/admin/employees/${id}/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role: role || 'user' })
                });

                if (response.ok) {
                    const result = await response.json();
                    await fetchEmployees();
                    return result.employee;
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to approve registration');
                }
            } else {
                // localStorage fallback
                const updated = db.users.update(id, { status: 'active', role: role || 'user' });
                await fetchEmployees();
                return updated;
            }
        } catch (err: any) {
            setError(err.message);
            return null;
        }
    }, [useLocalStorage, fetchEmployees]);

    // Reject pending registration
    const rejectRegistration = useCallback(async (id: number, reason?: string): Promise<boolean> => {
        try {
            if (!useLocalStorage) {
                const response = await fetch(`${API_BASE_URL}/admin/employees/${id}/reject`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason })
                });

                if (response.ok) {
                    await fetchEmployees();
                    return true;
                } else {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to reject registration');
                }
            } else {
                // localStorage fallback - delete the pending user
                db.users.delete(id);
                await fetchEmployees();
                return true;
            }
        } catch (err: any) {
            setError(err.message);
            return false;
        }
    }, [useLocalStorage, fetchEmployees]);

    return {
        employees,
        pendingRegistrations,
        metrics,
        loading,
        error,
        refresh: fetchEmployees,
        createEmployee,
        updateEmployee,
        resetPassword,
        toggleStatus,
        deleteEmployee,
        validateLogin,
        getPendingRegistrations,
        approveRegistration,
        rejectRegistration
    };
};

export default useAdminConsole;
