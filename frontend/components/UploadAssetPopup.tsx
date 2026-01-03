import React from 'react';

interface UploadAssetPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: any;
    onNavigate?: (view: string, id?: number) => void;
}

const UploadAssetPopup: React.FC<UploadAssetPopupProps> = ({ isOpen, onClose, onNavigate }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h1 className="text-lg font-bold text-slate-900">Upload New Asset</h1>
                        <p className="text-sm text-slate-500">Choose the type of content you want to upload</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-medium">Close</button>
                </div>

                {/* Content Type Selector */}
                <div className="p-6">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-700">Select Content Type</h3>
                                <p className="text-xs text-slate-500">Choose the type of content you want to upload</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {/* Web Content */}
                            <button
                                onClick={() => {
                                    onClose();
                                    onNavigate?.('web-asset-upload');
                                }}
                                className="p-5 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-center group"
                            >
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-slate-700">🌐 Web Content</p>
                                <p className="text-xs text-slate-500 mt-1">Landing pages, articles</p>
                            </button>

                            {/* SEO Content */}
                            <button
                                onClick={() => {
                                    alert('SEO Content upload coming soon! For now, please use the Web Content option.');
                                }}
                                className="p-5 rounded-xl border-2 border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all text-center group relative"
                            >
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full">Soon</div>
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-slate-700">🔍 SEO Content</p>
                                <p className="text-xs text-slate-500 mt-1">Search optimized content</p>
                            </button>

                            {/* Social Media */}
                            <button
                                onClick={() => {
                                    alert('Social Media upload coming soon! For now, please use the Web Content option.');
                                }}
                                className="p-5 rounded-xl border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition-all text-center group relative"
                            >
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full">Soon</div>
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-slate-700">📱 Social Media</p>
                                <p className="text-xs text-slate-500 mt-1">Posts, stories, videos</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadAssetPopup;
