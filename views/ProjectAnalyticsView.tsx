
// ... existing content ...

    return (
        <div className="space-y-6 h-full overflow-y-auto pr-1 p-6">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Performance Dashboard</h1>
                        <p className="text-slate-500 mt-1">OKR + KPI + Competitor + Gold Standard Analytics</p>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={handleSaveView} className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm">Save View</button>
                        <button onClick={handleExport} className="bg-white text-slate-600 border border-slate-300 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-50 shadow-sm">Export</button>
                        <button onClick={handleRefresh} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 shadow-sm">Refresh</button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                    <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)} className="bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm min-w-[140px]">
                        <option>All Brands</option>
                        {mockBrands.map(b => <option key={b.id}>{b.name}</option>)}
                    </select>
                    <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm min-w-[140px]">
                        <option>All Departments</option>
                        <option>Marketing</option>
                        <option>SEO</option>
                        <option>Content</option>
                        <option>Dev</option>
                    </select>
                    <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm min-w-[120px]">
                        <option>Monthly</option>
                        <option>Quarterly</option>
                        <option>Yearly</option>
                    </select>
                    {/* ... other filters ... */}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { label: 'OKR Achievement %', val: '78%', sub: '+8%', status: 'On Track', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Performance Score %', val: '82%', sub: '+5%', status: 'On Track', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Traffic Growth', val: '+24%', sub: 'vs last cycle', status: 'Good', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Ranking Improvement', val: '15', sub: 'Top 10 Keywords', status: 'On Track', color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Engagement Score', val: '88%', sub: '+3%', status: 'On Track', color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Conversion Score', val: '72%', sub: '-2%', status: 'Warning', color: 'text-orange-600', bg: 'bg-orange-50' },
                ].map((card, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 truncate">{card.label}</p>
                        <h3 className="text-2xl font-bold text-slate-800 mb-1">{card.val}</h3>
                        <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${card.color}`}>{card.sub}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${card.bg} ${card.color}`}>{card.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* KPI Analytics Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50