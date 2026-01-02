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
  const getAssetTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Blog': 'bg-blue-500',
      'Video': 'bg-red-500',
      'PDF': 'bg-orange-500',
      'Image': 'bg-green-500',
      'Document': 'bg-purple-500',
      'Infographic': 'bg-pink-500',
      'Case Study': 'bg-teal-500',
      'Whitepaper': 'bg-indigo-500',
    };
    return colors[type] || 'bg-slate-500';
  };

  const getAssetTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'Blog': '📝',
      'Video': '🎥',
      'PDF': '📄',
      'Image': '🖼️',
      'Document': '📋',
      'Infographic': '📊',
      'Case Study': '📖',
      'Whitepaper': '📑',
    };
    return icons[type] || '📦';
  };

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Linked Assets Section */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <span className="text-2xl">🔗</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold">Linked Assets</h4>
                  <p className="text-xs text-indigo-100 mt-0.5">Currently connected content</p>
                </div>
              </div>
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
                <span className="text-2xl font-bold">{linkedAssets.length}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-b-2xl border-2 border-indigo-200 border-t-0 p-4 min-h-[500px] max-h-[600px]">
            <div className="h-full overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {linkedAssets.length > 0 ? (
                linkedAssets.map(asset => (
                  <div
                    key={asset.id}
                    className="bg-white rounded-xl border-2 border-indigo-200 shadow-sm hover:shadow-md transition-all group p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Asset Type Badge */}
                        <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex flex-col items-center justify-center text-white shadow-md ${getAssetTypeColor(asset.asset_type)}`}>
                          <span className="text-lg">{getAssetTypeIcon(asset.asset_type)}</span>
                          <span className="text-[8px] font-bold uppercase mt-0.5 opacity-90">
                            {asset.asset_type ? String(asset.asset_type).slice(0, 3) : 'N/A'}
                          </span>
                        </div>

                        {/* Asset Info */}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-slate-800 mb-1 line-clamp-2" title={asset.content_title_clean}>
                            {asset.content_title_clean}
                          </h5>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${asset.status === 'Published' ? 'bg-green-100 text-green-700' :
                                asset.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-slate-100 text-slate-700'
                              }`}>
                              {asset.status}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {asset.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Unlink Button */}
                      <button
                        onClick={() => onToggle(asset)}
                        className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Unlink this asset"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="bg-white rounded-full p-6 mb-4 shadow-sm">
                    <span className="text-5xl opacity-50">🔗</span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-700 mb-2">No Assets Linked</h5>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Search and link content assets from the library to connect them with this sub-service.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Available Assets Section */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-t-2xl p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h4 className="text-lg font-bold">Asset Library</h4>
                <p className="text-xs text-blue-100 mt-0.5">Browse and link content</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 border-t-0 border-b-0 p-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by title, type, or keyword..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-blue-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm"
              />
              {assetSearch && (
                <button
                  onClick={() => setAssetSearch('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-b-2xl border-2 border-blue-200 border-t-0 p-4 min-h-[500px] max-h-[600px]">
            <div className="h-full overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {availableAssets.length > 0 ? (
                availableAssets.map(asset => (
                  <div
                    key={asset.id}
                    onClick={() => onToggle(asset)}
                    className="bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all group p-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Asset Type Badge */}
                        <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex flex-col items-center justify-center text-white shadow-md ${getAssetTypeColor(asset.asset_type)}`}>
                          <span className="text-lg">{getAssetTypeIcon(asset.asset_type)}</span>
                          <span className="text-[8px] font-bold uppercase mt-0.5 opacity-90">
                            {asset.asset_type ? String(asset.asset_type).slice(0, 3) : 'N/A'}
                          </span>
                        </div>

                        {/* Asset Info */}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-slate-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors" title={asset.content_title_clean}>
                            {asset.content_title_clean}
                          </h5>
                          <div className="flex flex-wrap gap-2 items-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${asset.status === 'Published' ? 'bg-green-100 text-green-700' :
                                asset.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-slate-100 text-slate-700'
                              }`}>
                              {asset.status}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {asset.id}</span>
                          </div>
                        </div>
                      </div>

                      {/* Link Button */}
                      <button
                        className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-700 shadow-sm"
                      >
                        + Link
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="bg-white rounded-full p-6 mb-4 shadow-sm">
                    <span className="text-5xl opacity-50">
                      {assetSearch ? '🔍' : '📚'}
                    </span>
                  </div>
                  <h5 className="text-sm font-bold text-slate-700 mb-2">
                    {assetSearch ? 'No Matching Assets' : 'Start Searching'}
                  </h5>
                  <p className="text-xs text-slate-500 max-w-xs">
                    {assetSearch
                      ? `No assets found matching "${assetSearch}". Try a different search term.`
                      : 'Use the search bar above to find content assets from your library.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h5 className="text-sm font-bold text-amber-900 mb-1">Asset Linking Tips</h5>
            <ul className="text-xs text-amber-800 space-y-1">
              <li>• <strong>Link related content</strong> to create a comprehensive resource hub</li>
              <li>• <strong>Organize by topic</strong> to help users discover relevant materials</li>
              <li>• <strong>Keep it relevant</strong> - only link assets that directly support this sub-service</li>
              <li>• <strong>Update regularly</strong> to ensure linked content stays current and valuable</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AssetLinker;
