
import React from 'react';
import { useData } from '../hooks/useData';
import { ChartCard, BarChart } from '../components/Charts';
import type { User, Skill, Achievement } from '../types';

const EmployeeScorecardView: React.FC = () => {
    const { data: users } = useData<User>('users');
    const { data: skills } = useData<Skill>('hr/skills');
    const { data: achievements } = useData<Achievement>('hr/achievements');
    
    // Default or selected user
    const currentUser = users[0];

    if (!currentUser) {
        return (
            <div className="p-6 text-center text-slate-500">
                No employees found in the directory. Please add users in the Admin Console.
            </div>
        );
    }

    const performanceData = [
        { id: 1, name: 'Tasks Done', value: currentUser.projects_count || 0 },
        // Placeholder for real performance data which would be calculated in backend
        { id: 2, name: 'Efficiency', value: 0 },
        { id: 3, name: 'Impact', value: 0 }
    ];

    return (
        <div className="space-y-6 h-full flex flex-col w-full p-6 animate-fade-in overflow-y-auto">
            <div className="flex justify-between items-start flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                        {currentUser.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{currentUser.name}</h1>
                        <p className="text-slate-500">{currentUser.role} • {currentUser.department || 'General'}</p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                        {currentUser.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ChartCard title="Performance Matrix">
                    <BarChart data={performanceData} color="bg-blue-500" maxValue={100} />
                </ChartCard>
                
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Skill Radar</h3>
                    <div className="space-y-3">
                        {skills.length > 0 ? skills.map((skill, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span>{skill.name}</span>
                                    <span className="font-bold">{skill.score}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2">
                                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${skill.score}%` }}></div>
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-400 italic">No skill data available.</p>}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Achievements</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {achievements.length > 0 ? achievements.map(ach => (
                        <div key={ach.id} className="flex items-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div className="text-3xl mr-3">{ach.icon}</div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{ach.title}</p>
                                <p className="text-xs text-slate-500">{ach.date}</p>
                            </div>
                        </div>
                    )) : <p className="text-sm text-slate-400 italic col-span-full">No achievements recorded yet.</p>}
                </div>
            </div>
        </div>
    );
};

export default EmployeeScorecardView;
