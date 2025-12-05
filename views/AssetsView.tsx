import React, { useState, useRef } from 'react';
import Table from '../components/Table';
import { useData } from '../hooks/useData';
import { getStatusBadge } from '../constants';
import type { AssetLibraryItem } from '../types';

const AssetsView: React.FC = () => {
    const { data: assets, create: createAsset } = useData<AssetLibraryItem>('assetLibrary');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'upload'>('list');
    const [newAsset, setNewAsset] = useState<Partial<AssetLibraryItem>>({
        name: '', type: 'Image', repository: 'Content Repository', usage_status: 'Available'
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredAssets = assets.filter(a => (a.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()));

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        // Auto-fill name from filename if empty
        if (!newAsset.name) {
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            setNewAsset({ ...newAsset, name: nameWithoutExt });
        }
        // Auto-detect type from file
        const fileType = file.type;
        if (fileType.startsWith('image/')) {
            setNewAsset({ ...newAsset, type: 'Image' });
        } else if (fileType.startsWith('video/')) {
            setNewAsset({ ...newAsset, type: 'Video' });
        } else if (fileType.includes('pdf') || fileType.includes('document')) {
            setNewAsset({ ...newAsset, type: 'Document' });
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                alert('File size exceeds 50MB limit');
                return;
            }
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            // Check file size (50MB limit)
            if (file.size > 50 * 1024 * 1024) {
                alert('File size exceeds 50MB limit');
                return;
            }
            handleFileSelect(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const uploadFileToServer = async (file: File): Promise<string> => {
        // Convert file to base64
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64String = reader.result as string;
                    // Remove data URL prefix (e.g., "data:image/png;base64,")
                    const base64Content = base64String.split(',')[1];

                    // Upload to server
                    const response = await fetch('/api/v1/uploads', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            filename: file.name,
                            content_base64: base64Content
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`Upload failed: ${response.statusText}`);
                    }

                    const result = await response.json();
                    resolve(result.url || `/uploads/${result.filename}`);
                } catch (error) {
                    console.error('Upload error:', error);
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleUpload = async () => {
        if (!newAsset.name) {
            alert('Please enter an asset name');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            let fileUrl = '';

            if (selectedFile) {
                // Simulate upload progress
                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => Math.min(prev + 10, 90));
                }, 200);

                // Upload file to server
                fileUrl = await uploadFileToServer(selectedFile);

                clearInterval(progressInterval);
                setUploadProgress(100);
            }

            // Create asset record
            await createAsset({
                ...newAsset,
                date: new Date().toISOString(),
                linked_task: selectedFile ? fileUrl : undefined
            } as any);

            // Reset and return to list
            setTimeout(() => {
                setViewMode('list');
                setNewAsset({ name: '', type: 'Image', repository: 'Content Repository', usage_status: 'Available' });
                setSelectedFile(null);
                setUploadProgress(0);
                setIsUploading(false);
            }, 500);
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Upload failed. Please try again.');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const columns = [
        { header: 'Name', accessor: 'name' as keyof AssetLibraryItem, className: 'font-medium text-sm text-slate-700' },
        { header: 'Type', accessor: 'type' as keyof AssetLibraryItem, className: 'text-xs text-slate-500' },
        { header: 'Repository', accessor: 'repository' as keyof AssetLibraryItem, className: 'text-xs text-slate-500' },
        { header: 'Status', accessor: (item: AssetLibraryItem) => getStatusBadge(item.usage_status) },
        { header: 'Date', accessor: (item: AssetLibraryItem) => item.date ? new Date(item.date).toLocaleDateString() : '-', className: 'text-xs text-slate-400' }
    ];

    if (viewMode === 'upload') {
        return (
            <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full">
                    <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50 w-full flex-shrink-0">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Upload New Asset</h2>
                            <p className="text-slate-500 text-xs mt-0.5">Add media to the central library</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setViewMode('list');
                                    setSelectedFile(null);
                                    setUploadProgress(0);
                                }}
                                disabled={isUploading}
                                className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={isUploading || !newAsset.name}
                                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold shadow-sm hover:bg-blue-700 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    'Confirm Upload'
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 w-full">
                        <div className="w-full space-y-4">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 w-full">
                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*,.pdf,.doc,.docx"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />

                                {/* Drag and drop zone */}
                                <div
                                    className={`border-2 border-dashed rounded-lg p-10 text-center transition-all cursor-pointer group w-full ${isDragging
                                        ? 'border-blue-500 bg-blue-50'
                                        : selectedFile
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-slate-300 hover:bg-slate-50'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={handleUploadClick}
                                >
                                    <div className="group-hover:scale-105 transition-transform">
                                        {selectedFile ? (
                                            <>
                                                <svg className="mx-auto h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="mt-3 text-sm font-medium text-green-700">{selectedFile.name}</p>
                                                <p className="text-xs text-green-600 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                                <p className="text-xs text-slate-500 mt-2">Click to change file</p>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <p className="mt-3 text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF, MP4 up to 50MB</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Upload progress bar */}
                                {isUploading && uploadProgress > 0 && (
                                    <div className="w-full">
                                        <div className="flex justify-between text-xs text-slate-600 mb-1">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Asset Name</label>
                                        <input type="text" value={newAsset.name} onChange={(e) => setNewAsset({ ...newAsset, name: e.target.value })} className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Q1 Marketing Flyer" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                                        <select value={newAsset.type} onChange={(e) => setNewAsset({ ...newAsset, type: e.target.value })} className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm">
                                            <option>Image</option>
                                            <option>Video</option>
                                            <option>Document</option>
                                            <option>Archive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Repository</label>
                                        <select value={newAsset.repository} onChange={(e) => setNewAsset({ ...newAsset, repository: e.target.value })} className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm">
                                            <option>Content Repository</option>
                                            <option>SMM Repository</option>
                                            <option>SEO Repository</option>
                                            <option>Design Repository</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                                        <select value={newAsset.usage_status} onChange={(e) => setNewAsset({ ...newAsset, usage_status: e.target.value as any })} className="block w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm">
                                            <option>Available</option>
                                            <option>In Use</option>
                                            <option>Archived</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col w-full p-6 animate-fade-in overflow-hidden">
            <div className="flex justify-between items-start flex-shrink-0 w-full mb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Assets</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage and organize all your marketing assets</p>
                </div>
                <button
                    onClick={() => setViewMode('upload')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors flex items-center"
                >
                    <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Upload Asset
                </button>
            </div>

            <div className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-200 w-full mb-4 flex-shrink-0">
                <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <input
                        type="search"
                        className="block w-full p-2 pl-9 text-sm text-gray-900 border border-gray-300 rounded-lg bg-slate-50 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Search by title, file name, or tag..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm w-full min-h-0">
                <div className="flex-1 overflow-hidden w-full h-full">
                    <Table columns={columns} data={filteredAssets} title={`Showing ${filteredAssets.length} assets`} />
                </div>
            </div>
        </div>
    );
};

export default AssetsView;