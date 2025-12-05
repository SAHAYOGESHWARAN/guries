import React from 'react';

type ContentRepositoryItem = any;

type Props = {
  linkedAssets: ContentRepositoryItem[];
  availableAssets: ContentRepositoryItem[];
  assetSearch: string;
  setAssetSearch: (v: string) => void;
  onToggle: (asset: ContentRepositoryItem) => void;
};

const AssetLinker: React.FC<Props> = ({ linkedAssets, availableAssets, assetSearch, setAssetSearch, onToggle }) => {
  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Linked Assets */}
        <div className="flex flex-col h-[520px]">
          <h4 className="text-xs font-bold text-slate-700 uppercase mb-4 flex justify-between items-center tracking-wider">
            <span>Linked Assets</span>
            <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{linkedAssets.length}</span>
          </h4>
          <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-slate-50 p-3 space-y-3">
            {linkedAssets.length > 0 ? linkedAssets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors group">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm bg-indigo-600`}>
                    {asset.asset_type ? String(asset.asset_type).slice(0, 2) : 'NA'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-800 truncate" title={asset.content_title_clean}>{asset.content_title_clean}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide mt-0.5">{asset.status}</p>
                  </div>
                </div>
                <button onClick={() => onToggle(asset)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0" title="Unlink Asset">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-sm italic">No assets linked</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Assets */}
        <div className="flex flex-col h-[520px]">
          <h4 className="text-xs font-bold text-slate-700 uppercase mb-4 tracking-wider">Add Assets from Library</h4>
          <div className="mb-3">
            <input type="text" placeholder="Search repository..." value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} className="w-full p-3 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" />
          </div>
          <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl bg-white p-3 space-y-3">
            {availableAssets.length > 0 ? availableAssets.map(asset => (
              <div key={asset.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 transition-colors group cursor-pointer" onClick={() => onToggle(asset)}>
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold uppercase">
                    {asset.asset_type ? String(asset.asset_type).slice(0, 2) : 'NA'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-slate-700 truncate">{asset.content_title_clean}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">ID: {asset.id}</p>
                  </div>
                </div>
                <button className="text-indigo-600 opacity-0 group-hover:opacity-100 text-xs font-bold bg-indigo-50 px-3 py-1.5 rounded transition-all">Link</button>
              </div>
            )) : (
              <div className="p-10 text-center text-sm text-slate-400">
                {assetSearch ? 'No matching assets found.' : 'Search to find assets.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetLinker;
