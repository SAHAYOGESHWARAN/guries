import React, { useState } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { User } from '../types';

const ROLES = ['All Roles', 'Admin', 'SEO', 'Content', 'Developer', 'SMM', 'Manager', 'QC'];
const DEPARTMENTS = ['All Departments', 'Management', 'Marketing', 'Content', 'Technology', 'Quality'];

const UserRoleMasterView: React.FC = () => {
    // ... (logic kept same) ...
    const { data: users } = useData<User>('users');
    
    const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [deptFilter, setDeptFilter] = useState('All Departments');

    const filteredData = users.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All Roles' || item.role === roleFilter;
        const matchesDept = deptFilter === 'All Departments' || item.department === deptFilter;
        
        return matchesSearch && matchesRole && matchesDept;
    });

    const handleExport = () => {
        exportToCSV(filteredData, 'users_export');
    };

    const columns = [
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
                    <Table columns={columns} data={filteredData} title="User Registry" />
                </>
            ) : (
                <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                    <p className="text-slate-500">Role configuration interface placeholder</p>
                </div>
            )}
        </div>
    );
};

export default UserRoleMasterView;