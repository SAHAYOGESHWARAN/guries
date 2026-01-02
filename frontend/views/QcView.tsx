
import React, { useState } from 'react';
import Table from '../components/Table';
import { ChartCard, DonutChart, BarChart } from '../components/Charts';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import type { QcRun } from '../types';

const QcView: React.FC = () => {
  const { data: qcRuns, create: createQcRun } = useData<QcRun>('qc');
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [newRun, setNewRun] = useState<Partial<QcRun>>({
      target_type: 'task',
      target_id: 0, 
      qc_status: 'under_qc'
  });

  const passRate = qcRuns.length > 0 
      ? Math.round((qcRuns.filter(r => r.qc_status === 'approved').length / qcRuns.length) * 100) 
      : 0;

  const typeDist = Object.entries(qcRuns.reduce((acc, run) => {
      acc[run.target_type] = (acc[run.target_type] || 0) + 1;
      return acc;
  }, {} as Record<string, number>)).map(([type, val], i) => ({ id: i, name: type, value: val }));

  const handleCreateRun = async () => {
      await createQcRun({
          target_type: newRun.target_type as any,
          target_id: newRun.target_id as any,
          qc_status: 'under_qc',
          qc_owner_id: 1, 
          qc_checklist_version_id: 1
      } as any);
      setViewMode('list');
  };

  const handleViewReport = (run: QcRun) => {
      setSelectedReport({
          report: { score: run.final_score_percentage || 0, summary: run.analysis_report || 'No report available.' },
          checklist: [
              { id: 1, title: 'Grammar Check', status: 'Pass' },
              { id: 2, title: 'Tone Consistency', status: 'Pass' },
              { id: 3, title: 'SEO Compliance', status: 'Warn' }
          ]
      });
      setIsReportOpen(true);
  };

  const columns = [
      { header: 'Target Type', accessor: 'target_type' as keyof QcRun, className: 'uppercase font-bold text-xs text-slate-600' },
      { header: 'ID', accessor: 'target_id' as keyof QcRun, className: 'font-mono' },
      { header: 'Status', accessor: (item: QcRun) => getStatusBadge(item.qc_status) },
      { header: 'Score', accessor: (item: QcRun) => item.final_score_percentage ? `${item.final_score_percentage}%` : '-' },
      { 
          header: 'Actions', 
          accessor: (item: QcRun) => (
              <button onClick={() => handleViewReport(item)} className="text-blue-600 text-xs font-bold hover:underline">View Report</button>
          ) 
      }
  ];

  if (viewMode === 'create') {
      return (
          <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in w-full">
              <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-2xl font-bold text-slate-800">Initiate QC Run</h2>
                  <div className="flex gap-3">
                      <button onClick={() => setViewMode('list')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50">Cancel</button>
                      <button onClick={handleCreateRun} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700">Add to Queue</button>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                  <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Target Type</label>
                          <select 
                            value={newRun.target_type}
                            onChange={(e) => setNewRun({...newRun, target_type: e.target.value as any})} 
                            className="block w-full px-4 py-3 border border-slate-300 rounded-xl"
                          >
                              <option value="task">Task</option>
                              <option value="content_asset">Content Asset</option>
                              <option value="graphic_asset">Graphic Asset</option>
                              <option value="smm_post">SMM Post</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Target ID</label>
                          <input 
                            type="number" 
                            value={newRun.target_id} 
                            onChange={(e) => setNewRun({...newRun, target_id: parseInt(e.target.value)} as any)} 
                            className="block w-full px-4 py-3 border border-slate-300 rounded-xl" 
                            placeholder="Enter ID of the asset or task..." 
                          />
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-6 h-full overflow-y-auto w-full pr-1 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Intelligent QC Dashboard</h1>
        <button onClick={() => setViewMode('create')} className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700 transition-colors">
          Start New QC Run
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChartCard title="Pass Rate">
              <DonutChart value={passRate} color="text-green-600" label="Overall Approval Rate" />
          </ChartCard>
          <ChartCard title="Reviews by Type">
              <BarChart data={typeDist} color="bg-blue-500" />
          </ChartCard>
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
              <h3 className="text-gray-500 font-bold mb-2">Avg QC Score</h3>
              <p className="text-5xl font-bold text-blue-800">
                  {qcRuns.filter(r => r.final_score_percentage).length > 0 
                      ? Math.round(qcRuns.reduce((acc, r) => acc + (r.final_score_percentage || 0), 0) / qcRuns.filter(r => r.final_score_percentage).length) 
                      : '-'
                  }
                  <span className="text-xl text-gray-400">/100</span>
              </p>
          </div>
      </div>

      <Table columns={columns} data={qcRuns} title="Priority QC Queue" />

      {isReportOpen && selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsReportOpen(false)}>
              <div className="bg-white p-8 rounded-xl shadow-2xl max-w-2xl w-full mx-4" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-slate-800">QC Analysis Report</h2>
                      <button onClick={() => setIsReportOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                  </div>
                  <div className="space-y-6">
                      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <div>
                              <p className="text-sm text-gray-500 font-bold uppercase">Overall Score</p>
                              <p className="text-4xl font-bold text-blue-600">{selectedReport.report.score}/100</p>
                          </div>
                      </div>
                      <div>
                          <h3 className="text-sm font-bold text-gray-700 mb-2">Checklist Coverage</h3>
                          <ul className="space-y-1 text-sm text-gray-600 border p-3 rounded">
                              {selectedReport.checklist.map((item: any) => (
                                  <li key={item.id}>• {item.title} - <span className={item.status === 'Pass' ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>{item.status}</span></li>
                              ))}
                          </ul>
                      </div>
                      <div className="bg-blue-50 p-4 rounded border border-blue-100">
                          <h4 className="font-bold text-blue-800 text-sm mb-2">Summary</h4>
                          <p className="text-sm text-blue-900">{selectedReport.report.summary}</p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default QcView;
    