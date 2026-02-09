
import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { User } from '../types';

interface Role {
    id: number;
    role_name: string;
    permissions: any;
    status: string;
}

const ROLES = ['All Roles', 'Admin', 'SEO', 'Content', 'Developer', 'SMM', 'Manager', 'QC'];
const DEPARTMENTS = ['All Departments', 'Management', 'Marketing', 'Content', 'Technology', 'Quality'];

const UserRoleMasterView: React.FC = () => {
    const { data: users } = useData<User>('users');
    const { data: roles, create: createRole, update: updateRole, remove: deleteRole } = useData<Role>('roles');

    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [deptFilter, setDeptFilter] = useState('All Departments');

    // Role Form State
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleForm, setRoleForm] = useState<Partial<Role>>({ role_name: '', status: 'Active', permissions: { read: true, write: false, delete: false } });

    const filteredUsers = (users || []).filter(item => {
        if (!item) return false;
        const matchesSearch = (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All Roles' || item.role === roleFilter;
        const matchesDept = deptFilter === 'All Departments' || item.department === deptFilter;
        return matchesSearch && matchesRole && matchesDept;
    });

    const filteredRoles = (roles || []).filter(r => (r?.role_name || '').toLowerCase().includes(searchQuery.toLowerCase()));

    const handleExport = () => {
        exportToCSV(activeTab === 'users' ? filteredUsers : filteredRoles, `${activeTab}_export`);
    };

    // Role Actions
    const handleSaveRole = async () => {
        if (editingRole) {
            await updateRole(editingRole.id, roleForm);
        } else {
            await createRole(roleForm as any);
        }
        setIsRoleModalOpen(false);
        setEditingRole(null);
        setRoleForm({ role_name: '', status: 'Active', permissions: { read: true, write: false, delete: false } });
    };

    const handleDeleteRole = async (id: number) => {
        if (confirm("Delete this role?")) await deleteRole(id);
    };

    const handleEditRole = (role: Role) => {
        setEditingRole(role);
        setRoleForm(role);
        setIsRoleModalOpen(true);
    };

    const userColumns = [
        {
            header: 'Name',
            accessor: (item: User) => (
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-3">
                        {item.avatar_url ? <img src={item.avatar_url} alt={item.name} className="h-full w-full rounded-full object-cover" /> : item.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900">{item.name}</span>
                </div>
            )
        },
        { header: 'Role', accessor: 'role' as keyof User },
        { header: 'Department', accessor: 'department' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User, className: 'text-slate-500' },
        { header: 'Country', accessor: 'country' as keyof User },
        { header: 'Target', accessor: 'target' as keyof User, className: 'font-mono text-green-600' },
        {
            header: 'Projects',
            accessor: (item: User) => (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                    {item.projects_count}
                </div>
            ),
            className: "text-center"
        },
        {
            header: 'Status',
            accessor: (item: User) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.status === 'active' ? 'Active' : 'Inactive'}
                </span>
            )
        },
        { header: 'Last Login', accessor: 'last_login' as keyof User, className: 'text-xs text-slate-500' },
    ];

    const roleColumns = [
        { header: 'Role Name', accessor: 'role_name' as keyof Role, className: 'font-bold' },
        { header: 'Status', accessor: 'status' as keyof Role },
        {
            header: 'Permissions',
            accessor: (item: Role) => (
                <div className="flex gap-2 text-xs">
                    {item.permissions?.read && <span className="bg-blue-50 text-blue-600 px-2 rounded">Read</span>}
                    {item.permissions?.write && <span className="bg-green-50 text-green-600 px-2 rounded">Write</span>}
                    {item.permissions?.delete && <span className="bg-red-50 text-red-600 px-2 rounded">Delete</span>}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: (item: Role) => (
                <div className="flex space-x-2">
                    <button onClick={() => handleEditRole(item)} className="text-blue-600 text-xs font-bold">Edit</button>
                    <button onClick={() => handleDeleteRole(item.id)} className="text-red-600 text-xs font-bold">Del</button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 h-full overflow-y-auto w-full pr-1">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">User & Role Master</h1>
                    <p className="text-slate-500 mt-1">Manage users, roles, permissions and departmental assignments</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleExport}
                        className="text-slate-600 hover:text-indigo-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                    >
                        Export
                    </button>
                    {activeTab === 'roles' && (
                        <button
                            onClick={() => { setEditingRole(null); setRoleForm({ role_name: '', status: 'Active', permissions: { read: true, write: false, delete: false } }); setIsRoleModalOpen(true); }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                        >
                            + Add Role
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button onClick={() => setActiveTab('users')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Users</button>
                    <button onClick={() => setActiveTab('roles')} className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'roles' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Roles & Permissions</button>
                </nav>
            </div>

            {activeTab === 'users' ? (
                <>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            <div className="flex flex-wrap gap-2">
                                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select>
                                <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="bg-slate-50 border border-slate-300 text-sm rounded-lg p-2.5">{DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}</select>
                            </div>
                        </div>
                    </div>
                    <Table columns={userColumns} data={filteredUsers} title="User Registry" />
                </>
            ) : (
                <>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-4">
                        <input type="search" className="block w-full p-2.5 border border-gray-300 rounded-lg" placeholder="Search roles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <Table columns={roleColumns} data={filteredRoles} title="System Roles" />
                </>
            )}

            <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title={editingRole ? "Edit Role" : "Create Role"}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Role Name</label>
                        <input type="text" value={roleForm.role_name} onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                        <div className="flex gap-4">
                            <label className="flex items-center"><input type="checkbox" checked={roleForm.permissions?.read} onChange={(e) => setRoleForm({ ...roleForm, permissions: { ...roleForm.permissions, read: e.target.checked } })} className="mr-2" /> Read</label>
                            <label className="flex items-center"><input type="checkbox" checked={roleForm.permissions?.write} onChange={(e) => setRoleForm({ ...roleForm, permissions: { ...roleForm.permissions, write: e.target.checked } })} className="mr-2" /> Write</label>
                            <label className="flex items-center"><input type="checkbox" checked={roleForm.permissions?.delete} onChange={(e) => setRoleForm({ ...roleForm, permissions: { ...roleForm.permissions, delete: e.target.checked } })} className="mr-2" /> Delete</label>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select value={roleForm.status} onChange={(e) => setRoleForm({ ...roleForm, status: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4"><button onClick={handleSaveRole} className="bg-blue-600 text-white px-4 py-2 rounded-md">Save</button></div>
                </div>
            </Modal>
        </div>
    );
};

export default UserRoleMasterView;
