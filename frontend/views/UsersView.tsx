import React, { useState } from 'react';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { ChartCard, DonutChart } from '../components/Charts';
import { useData } from '../hooks/useData';
import { SparkIcon } from '../constants';
import type { User, Team, TeamMember } from '../types';
import { runQuery } from '../utils/gemini';

const UsersView: React.FC = () => {
    const { data: users, create: createUser, update: updateUser, remove: deleteUser } = useData<User>('users');
    const { data: teams, create: createTeam, update: updateTeam, remove: deleteTeam } = useData<Team>('teams');
    const { data: teamMembers, create: addTeamMember, remove: removeTeamMember } = useData<TeamMember>('teamMembers');

    const [activeTab, setActiveTab] = useState<'users' | 'teams'>('users');
    const [teamViewMode, setTeamViewMode] = useState<'board' | 'tree'>('board');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState('');

    // Forms & Edit State
    const [newUser, setNewUser] = useState<Partial<User>>({ name: '', email: '', role: 'writer', status: 'active' });
    const [teamForm, setTeamForm] = useState<Partial<Team>>({ name: '', lead_user_id: 0 });
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, type: 'user' | 'team' | 'bulk', id?: number }>({ isOpen: false, type: 'user' });
    const [dragOverTeamId, setDragOverTeamId] = useState<number | null>(null);

    const activeRate = users.length > 0 ? Math.round((users.filter(u => u.status === 'active').length / users.length) * 100) : 0;

    const roleChartData = Object.entries(users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).map(([role, count], idx) => ({ id: idx, name: role, value: count }));

    const handleRoleAudit = async () => {
        setIsAiModalOpen(true);
        setIsAiLoading(true);
        try {
            const prompt = `Analyze this team structure: ${JSON.stringify(users.map(u => ({ role: u.role, department: u.department })))}. 
          Identify potential role gaps or imbalances for a digital marketing agency.`;
            const result = await runQuery(prompt, { model: 'gemini-2.5-flash' });
            setAiAnalysis(result.text);
        } catch (e) {
            setAiAnalysis("AI analysis failed.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleAddUser = async () => {
        await createUser(newUser as any);
        setIsAddUserModalOpen(false);
        setNewUser({ name: '', email: '', role: 'writer', status: 'active' });
    };

    const handleUpdateUser = async () => {
        if (selectedUser) {
            await updateUser(selectedUser.id, selectedUser);
            setIsEditPanelOpen(false);
            setSelectedUser(null);
        }
    };

    const handleSaveTeam = async () => {
        if (editingTeam) {
            await updateTeam(editingTeam.id, teamForm);
        } else {
            await createTeam(teamForm as any);
        }
        setIsTeamModalOpen(false);
        setEditingTeam(null);
        setTeamForm({ name: '', lead_user_id: 0 });
    };

    const handleEditTeam = (team: Team) => {
        setEditingTeam(team);
        setTeamForm(team);
        setIsTeamModalOpen(true);
    };

    const handleDeleteTeam = (id: number) => {
        setDeleteConfirm({ isOpen: true, type: 'team', id });
    };

    const executeDelete = async () => {
        if (deleteConfirm.type === 'user' && deleteConfirm.id) await deleteUser(deleteConfirm.id);
        if (deleteConfirm.type === 'team' && deleteConfirm.id) await deleteTeam(deleteConfirm.id);
        if (deleteConfirm.type === 'bulk') {
            for (const id of selectedIds) await deleteUser(id);
            setSelectedIds([]);
        }
        setDeleteConfirm({ isOpen: false, type: 'user' });
    };

    const handleBulkDelete = () => {
        setDeleteConfirm({ isOpen: true, type: 'bulk' });
    };

    const getTeamLead = (leadId: number) => users.find(u => u.id === leadId);

    // Drag & Drop Handlers
    const handleDragStart = (e: React.DragEvent, userId: number) => {
        e.dataTransfer.setData("userId", userId.toString());
    };

    const handleDragOver = (e: React.DragEvent, teamId: number) => {
        e.preventDefault();
        setDragOverTeamId(teamId);
    };

    const handleDragEnd = () => {
        setDragOverTeamId(null);
    };

    const handleDrop = async (e: React.DragEvent, teamId: number) => {
        e.preventDefault();
        const userId = parseInt(e.dataTransfer.getData("userId"));
        setDragOverTeamId(null);

        // Check if already in team
        if (!teamMembers.some(tm => tm.team_id === teamId && tm.user_id === userId)) {
            await addTeamMember({ team_id: teamId, user_id: userId, role_in_team: 'Member' } as any);
        }
    };

    const handleRemoveFromTeam = async (memberId: number) => {
        await removeTeamMember(memberId);
    };

    const userColumns = [
        {
            header: 'Name',
            accessor: (user: User) => (
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-3 font-bold text-slate-600 text-xs overflow-hidden">
                        {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : user.name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-slate-900 text-sm">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                    </div>
                </div>
            )
        },
        { header: 'Role', accessor: 'role' as keyof User },
        { header: 'Status', accessor: (user: User) => <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{user.status}</span> },
        {
            header: 'Actions',
            accessor: (user: User) => (
                <div className="flex space-x-2">
                    <button onClick={() => { setSelectedUser(user); setIsEditPanelOpen(true); }} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold hover:underline">Edit</button>
                    <button onClick={() => setDeleteConfirm({ isOpen: true, type: 'user', id: user.id })} className="text-rose-600 hover:text-rose-800 text-xs font-bold hover:underline">Del</button>
                </div>
            )
        }
    ];

    // Draggable Card Component
    const DraggableUserCard = ({ user, compact, onDragStart, onDragEnd }: any) => (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, user.id)}
            onDragEnd={onDragEnd}
            className={`bg-white p-2 rounded border border-slate-200 shadow-sm cursor-move hover:border-indigo-300 transition-colors ${compact ? 'text-xs' : ''}`}
        >
            <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold mr-2 text-[10px]">
                    {user.name.charAt(0)}
                </div>
                <span className="truncate font-medium text-slate-700">{user.name}</span>
            </div>
        </div>
    );

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-slate-50 animate-fade-in">
            <div className="flex justify-between items-center flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Users & Teams</h1>
                <div className="flex space-x-3">
                    <button onClick={handleRoleAudit} className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-100 flex items-center transition-colors text-xs font-medium">
                        <SparkIcon /> <span className="ml-1.5">AI Role Audit</span>
                    </button>
                    <button onClick={() => setIsAddUserModalOpen(true)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors text-xs font-bold">
                        Invite User
                    </button>
                </div>
            </div>

            {/* Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-shrink-0">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                    <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-slate-800">{users.length}</p>
                </div>
                <ChartCard title="Role Distribution">
                    <div className="h-32 overflow-y-auto">
                        <div className="flex flex-wrap gap-2 mt-2">
                            {roleChartData.map(d => (
                                <div key={d.id} className="bg-slate-100 px-2 py-1 rounded-md text-[10px] font-medium text-slate-600 flex items-center border border-slate-200">
                                    {d.name}: <span className="ml-1 text-indigo-600 font-bold">{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartCard>
                <ChartCard title="Activity Health">
                    <div className="h-32 flex items-center justify-center">
                        <DonutChart value={activeRate} color="text-emerald-500" label="Active" size={100} />
                    </div>
                </ChartCard>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 flex-shrink-0 flex justify-between items-end">
                <nav className="-mb-px flex space-x-6">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        User Directory
                    </button>
                    <button
                        onClick={() => setActiveTab('teams')}
                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'teams'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Team Structure
                    </button>
                </nav>

                {activeTab === 'teams' && (
                    <div className="mb-2 flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                        <button
                            onClick={() => setTeamViewMode('board')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${teamViewMode === 'board' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Board
                        </button>
                        <button
                            onClick={() => setTeamViewMode('tree')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${teamViewMode === 'tree' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Hierarchy
                        </button>
                    </div>
                )}
            </div>

            {/* ... Content ... */}
            {activeTab === 'users' ? (
                <div className="flex-1 overflow-hidden bg-white rounded-xl shadow-sm border border-slate-200">
                    {selectedIds.length > 0 && (
                        <div className="bg-indigo-50 border-b border-indigo-100 p-2 flex justify-between items-center animate-fade-in">
                            <span className="text-xs text-indigo-800 font-bold ml-2">{selectedIds.length} selected</span>
                            <button onClick={handleBulkDelete} className="bg-rose-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-rose-700 transition-colors">
                                Delete Selected
                            </button>
                        </div>
                    )}
                    <Table columns={userColumns} data={users} title="" />
                </div>
            ) : (
                <div className="flex-1 flex gap-6 overflow-hidden min-h-[400px] pt-2">
                    {/* User Pool Sidebar */}
                    {teamViewMode === 'board' && (
                        <div className="w-56 bg-slate-50 border border-slate-200 flex flex-col rounded-xl overflow-hidden flex-shrink-0">
                            <div className="p-3 border-b border-slate-200 bg-slate-100 font-bold text-slate-700 text-xs flex justify-between items-center">
                                <span>Unassigned Users</span>
                                <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded-full text-slate-600">{users.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                <p className="text-[10px] text-slate-400 italic text-center mb-2">Drag to assign</p>
                                {users.map(user => (
                                    <DraggableUserCard
                                        key={user.id}
                                        user={user}
                                        compact
                                        onDragStart={handleDragStart}
                                        onDragEnd={handleDragEnd}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Team Board or Tree */}
                    <div className="flex-1 overflow-y-auto">
                        {teamViewMode === 'board' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-10">
                                {teams.map(team => {
                                    const lead = getTeamLead(team.lead_user_id);
                                    const members = teamMembers.filter(tm => tm.team_id === team.id).map(tm => ({
                                        ...tm,
                                        user: users.find(u => u.id === tm.user_id)
                                    })).filter(m => m.user);

                                    const isOver = dragOverTeamId === team.id;

                                    return (
                                        <div
                                            key={team.id}
                                            onDragOver={(e) => handleDragOver(e, team.id)}
                                            onDrop={(e) => handleDrop(e, team.id)}
                                            className={`bg-white rounded-xl shadow-sm border transition-all flex flex-col ${isOver ? 'border-indigo-500 ring-2 ring-indigo-100 scale-[1.01]' : 'border-slate-200 hover:border-indigo-200'
                                                }`}
                                        >
                                            {/* Team Header */}
                                            <div className="p-3 border-b border-slate-100 flex justify-between items-start bg-slate-50/50 rounded-t-xl">
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-800">{team.name}</h3>
                                                    <div className="flex items-center mt-1 text-[10px] text-slate-500">
                                                        <span className="uppercase font-bold mr-1 tracking-wider text-slate-400">Lead:</span>
                                                        {lead ? (
                                                            <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{lead.name}</span>
                                                        ) : <span className="text-rose-400 italic">Unassigned</span>}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-1">
                                                    <button onClick={() => handleEditTeam(team)} className="text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 transition-colors">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDeleteTeam(team.id)} className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-slate-100 transition-colors">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Member List */}
                                            <div className={`p-3 flex-1 space-y-2 min-h-[120px] transition-colors rounded-b-xl ${isOver ? 'bg-indigo-50/50' : 'bg-white'}`}>
                                                {members.length > 0 ? members.map(member => (
                                                    <div key={member.id} className="group flex items-center justify-between bg-white p-1.5 rounded border border-slate-100 shadow-sm text-xs hover:border-indigo-100 transition-all">
                                                        <div className="flex items-center">
                                                            <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 mr-2 border border-slate-200">
                                                                {member.user?.avatar_url ? <img src={member.user.avatar_url} alt="" /> : member.user?.name.charAt(0)}
                                                            </div>
                                                            <span className="text-slate-700 font-medium">{member.user?.name}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveFromTeam(member.id)}
                                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                )) : (
                                                    <div className="h-full border-2 border-dashed border-slate-100 rounded flex items-center justify-center text-slate-400 text-[10px] font-medium">
                                                        {isOver ? 'Drop to Assign' : 'Drag Users Here'}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                <button
                                    onClick={() => { setTeamForm({ name: '', lead_user_id: 0 }); setIsTeamModalOpen(true); }}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors min-h-[180px] bg-slate-50/50 hover:bg-white"
                                >
                                    <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    <span className="font-bold text-xs">Create New Team</span>
                                </button>
                            </div>
                        ) : (
                            // --- HIERARCHY TREE VIEW ---
                            <div className="p-8 flex flex-col items-center min-w-full overflow-x-auto">
                                <div className="flex flex-col items-center mb-8 relative">
                                    <div className="bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg font-bold text-sm z-10 border border-slate-700">
                                        Organization Root
                                    </div>
                                    <div className="h-8 w-px bg-slate-300"></div>
                                </div>

                                <div className="flex gap-8 items-start">
                                    {teams.map(team => {
                                        const lead = getTeamLead(team.lead_user_id);
                                        const members = teamMembers.filter(tm => tm.team_id === team.id).map(tm => ({
                                            ...tm,
                                            user: users.find(u => u.id === tm.user_id)
                                        })).filter(m => m.user);

                                        return (
                                            <div key={team.id} className="flex flex-col items-center relative">
                                                <div className="absolute -top-8 h-8 w-px bg-slate-300"></div>
                                                <div className="absolute -top-8 left-0 right-0 h-px bg-slate-300" style={{
                                                    display: teams.length === 1 ? 'none' : 'block',
                                                }}></div>

                                                <div className="bg-white border border-indigo-200 p-3 rounded-xl shadow-sm w-56 text-center z-10 relative group hover:shadow-md transition-all">
                                                    <h3 className="font-bold text-slate-800 text-sm">{team.name}</h3>

                                                    {lead && (
                                                        <div className="mt-2 p-1.5 bg-indigo-50 rounded border border-indigo-100 flex items-center justify-center">
                                                            <div className="w-5 h-5 rounded-full bg-indigo-200 text-[9px] flex items-center justify-center mr-1.5 font-bold text-indigo-800">L</div>
                                                            <div className="text-xs font-medium text-indigo-900">{lead.name}</div>
                                                        </div>
                                                    )}

                                                    {members.length > 0 && (
                                                        <div className="mt-3 relative">
                                                            <div className="absolute top-0 left-1/2 -ml-px w-px h-3 bg-slate-200"></div>
                                                            <div className="pt-3 space-y-1.5">
                                                                {members.map(m => (
                                                                    <div key={m.id} className="bg-slate-50 border border-slate-100 p-1.5 rounded text-xs flex items-center text-left">
                                                                        <div className="w-4 h-4 rounded-full bg-slate-200 mr-1.5 flex items-center justify-center text-[8px] text-slate-500 font-bold">{m.user?.name.charAt(0)}</div>
                                                                        <span className="truncate text-slate-600">{m.user?.name}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {isEditPanelOpen && selectedUser && (
                <>
                    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40" onClick={() => setIsEditPanelOpen(false)}></div>
                    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out animate-slide-left flex flex-col border-l border-slate-200">
                        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">Edit Profile</h2>
                            <button onClick={() => setIsEditPanelOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto space-y-5">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl text-slate-400 font-bold relative group cursor-pointer overflow-hidden border-2 border-slate-200">
                                    {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} className="w-full h-full object-cover" /> : selectedUser.name.charAt(0)}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-bold uppercase tracking-wider">
                                        Change
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={selectedUser.name}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Email Address</label>
                                <input
                                    type="email"
                                    autoComplete="email"
                                    value={selectedUser.email}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Role</label>
                                <select
                                    value={selectedUser.role}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 text-sm bg-white"
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="seo_manager">SEO Manager</option>
                                    <option value="writer">Content Writer</option>
                                    <option value="designer">Designer</option>
                                    <option value="smm_manager">SMM Manager</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Account Status</label>
                                <select
                                    value={selectedUser.status}
                                    onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value as any })}
                                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 text-sm bg-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Permissions</h4>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <label className="flex items-center"><input type="checkbox" className="mr-2 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" checked readOnly /> View Dashboard</label>
                                    <label className="flex items-center"><input type="checkbox" className="mr-2 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" checked readOnly /> Edit Campaigns</label>
                                    <label className="flex items-center"><input type="checkbox" className="mr-2 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" checked={selectedUser.role === 'admin'} readOnly /> Manage Users</label>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
                            <button onClick={() => setIsEditPanelOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 uppercase tracking-wide">Cancel</button>
                            <button onClick={handleUpdateUser} className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm uppercase tracking-wide transition-colors">Save Changes</button>
                        </div>
                    </div>
                </>
            )}

            <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="AI Organizational Analysis">
                {isAiLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                        <p className="text-slate-500 text-sm font-medium">Analyzing team structure...</p>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {aiAnalysis}
                    </div>
                )}
            </Modal>

            <Modal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} title="Invite New User">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                        <input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="block w-full border-slate-300 rounded-lg shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                        <input type="email" autoComplete="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="block w-full border-slate-300 rounded-lg shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="block w-full border-slate-300 rounded-lg shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white">
                            <option value="writer">Writer</option>
                            <option value="editor">Editor</option>
                            <option value="seo_manager">SEO Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={handleAddUser} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 text-xs font-bold uppercase tracking-wide transition-colors">Send Invite</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={isTeamModalOpen} onClose={() => setIsTeamModalOpen(false)} title={editingTeam ? "Edit Team" : "Create New Team"}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Team Name</label>
                        <input
                            type="text"
                            value={teamForm.name}
                            onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                            className="block w-full border-slate-300 rounded-lg shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., Growth Hacking"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Team Lead</label>
                        <select
                            value={teamForm.lead_user_id}
                            onChange={(e) => setTeamForm({ ...teamForm, lead_user_id: parseInt(e.target.value) })}
                            className="block w-full border-slate-300 rounded-lg shadow-sm p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            <option value={0}>Select a Lead...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button onClick={handleSaveTeam} className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 text-xs font-bold uppercase tracking-wide transition-colors">
                            {editingTeam ? 'Update Team' : 'Create Team'}
                        </button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={deleteConfirm.isOpen} onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })} title="Confirm Deletion">
                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-rose-100 sm:mx-0">
                            <svg className="h-5 w-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="ml-3 text-left">
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {deleteConfirm.type === 'user' && "Are you sure you want to delete this user? This action cannot be undone."}
                                {deleteConfirm.type === 'team' && "Are you sure you want to delete this team? Members will be unassigned."}
                                {deleteConfirm.type === 'bulk' && `Are you sure you want to delete ${selectedIds.length} selected users?`}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button
                            onClick={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none text-xs font-bold uppercase tracking-wide"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={executeDelete}
                            className="px-4 py-2 text-white bg-rose-600 border border-transparent rounded-lg hover:bg-rose-700 focus:outline-none text-xs font-bold uppercase tracking-wide shadow-sm"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UsersView;