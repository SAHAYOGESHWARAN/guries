
import React, { useState } from 'react';
import Board from '../components/Board';
import { useData } from '../hooks/useData';
import { generateImage } from '../utils/gemini';
import { SparkIcon } from '../constants';
import type { GraphicAssetPlan } from '../types';

const GraphicsPlanView: React.FC = () => {
  const { data: graphics, create: createGraphic, update: updateGraphic } = useData<GraphicAssetPlan>('graphics');
  const [viewMode, setViewMode] = useState<'board' | 'create'>('board');
  const [newGraphic, setNewGraphic] = useState<Partial<GraphicAssetPlan>>({
      graphic_type: 'smm_post',
      platform: 'instagram',
      status: 'requested',
      due_at: ''
  });
  
  const [genPrompt, setGenPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');

  const columns = [
    { id: 'requested', title: 'Requested' },
    { id: 'in_design', title: 'In Design' },
    { id: 'under_qc', title: 'Under QC' },
    { id: 'approved', title: 'Approved' },
  ];

  const handleStatusChange = async (item: GraphicAssetPlan, newStatus: string) => {
      await updateGraphic(item.id, { status: newStatus as any });
  };

  const handleGenerateImage = async () => {
      if (!genPrompt) return;
      setIsGenerating(true);
      try {
          const img = await generateImage(genPrompt, aspectRatio);
          setGeneratedImage(img);
      } catch (e) {
          alert("Image generation failed");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleCreateRequest = async () => {
      await createGraphic({
          ...newGraphic,
      } as any);
      setViewMode('board');
      setNewGraphic({ graphic_type: 'smm_post', platform: 'instagram', status: 'requested', due_at: '' });
      setGeneratedImage(null);
      setGenPrompt('');
  };

  const renderCard = (item: GraphicAssetPlan) => (
      <div>
          <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase">{item.platform}</span>
              <span className="text-[10px] text-slate-400">{item.due_at}</span>
          </div>
          <p className="text-sm font-medium text-slate-800 capitalize">{item.graphic_type.replace('_', ' ')}</p>
      </div>
  );

  if (viewMode === 'create') {
      return (
          <div className="h-full flex flex-col w-full p-6 animate-fade-in">
              <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full">
                  <div className="border-b border-slate-200 px-8 py-5 flex justify-between items-center bg-slate-50/50 w-full">
                      <h2 className="text-2xl font-bold text-slate-800">New Graphic Request</h2>
                      <div className="flex gap-3">
                          <button onClick={() => setViewMode('board')} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50">Cancel</button>
                          <button onClick={handleCreateRequest} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-blue-700">Submit Request</button>
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 bg-slate-50 w-full">
                      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Form */}
                          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 w-full">
                              <div className="grid grid-cols-2 gap-6 w-full">
                                  <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-2">Asset Type</label>
                                      <select value={newGraphic.graphic_type} onChange={(e) => setNewGraphic({...newGraphic, graphic_type: e.target.value as any})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl">
                                          <option value="smm_post">SMM Post</option>
                                          <option value="infographic">Infographic</option>
                                          <option value="banner">Banner/Ad</option>
                                          <option value="carousel">Carousel</option>
                                      </select>
                                  </div>
                                   <div>
                                      <label className="block text-sm font-bold text-slate-700 mb-2">Platform</label>
                                      <select value={newGraphic.platform} onChange={(e) => setNewGraphic({...newGraphic, platform: e.target.value as any})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl">
                                          <option value="instagram">Instagram</option>
                                          <option value="linkedin">LinkedIn</option>
                                          <option value="youtube">YouTube</option>
                                          <option value="pinterest">Pinterest</option>
                                      </select>
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-2">Due Date</label>
                                  <input type="date" value={newGraphic.due_at} onChange={(e) => setNewGraphic({...newGraphic, due_at: e.target.value})} className="block w-full px-4 py-3 border border-slate-300 rounded-xl" />
                              </div>
                          </div>

                          {/* AI Generator */}
                          <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100 flex flex-col w-full">
                              <div className="flex justify-between items-center mb-4">
                                  <h4 className="text-lg font-bold text-purple-900 flex items-center">
                                      <SparkIcon /> <span className="ml-2">AI Concept Studio (Imagen)</span>
                                  </h4>
                                  <select 
                                      value={aspectRatio}
                                      onChange={(e) => setAspectRatio(e.target.value)}
                                      className="text-xs border-purple-200 rounded-lg p-2 font-medium text-purple-800"
                                  >
                                      <option value="1:1">1:1 (Square)</option>
                                      <option value="16:9">16:9 (Wide)</option>
                                      <option value="9:16">9:16 (Story)</option>
                                      <option value="4:3">4:3</option>
                                      <option value="3:4">3:4</option>
                                  </select>
                              </div>
                              
                              <div className="flex gap-2 mb-4 w-full">
                                  <input 
                                      type="text" 
                                      value={genPrompt}
                                      onChange={(e) => setGenPrompt(e.target.value)}
                                      placeholder="Describe the visual concept..." 
                                      className="flex-1 p-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                                  />
                                  <button 
                                      onClick={handleGenerateImage}
                                      disabled={isGenerating}
                                      className="bg-purple-600 text-white px-4 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50"
                                  >
                                      {isGenerating ? '...' : 'Generate'}
                                  </button>
                              </div>

                              <div className="flex-1 bg-white rounded-xl border border-purple-100 flex items-center justify-center overflow-hidden min-h-[300px]">
                                  {generatedImage ? (
                                      <img src={generatedImage} alt="Generated Concept" className="w-full h-full object-contain" />
                                  ) : (
                                      <p className="text-purple-300 text-sm font-bold">Concept Preview Area</p>
                                  )}
                              </div>
                              {generatedImage && <p className="text-xs text-purple-600 mt-2 text-center">AI generated concept attached to request.</p>}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col w-full p-6 animate-fade-in">
      <div className="flex justify-between items-center flex-shrink-0 w-full mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Graphics Plan</h1>
        <button onClick={() => setViewMode('create')} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors">
          + New Graphic Request
        </button>
      </div>
      
      <div className="flex-1 min-h-0 w-full">
          <Board
            title="Production Pipeline"
            columns={columns}
            data={graphics}
            statusAccessor={(item) => item.status}
            renderCard={renderCard}
            onStatusChange={handleStatusChange}
          />
      </div>
    </div>
  );
};

export default GraphicsPlanView;
