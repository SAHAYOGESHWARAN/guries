import React, { useState, useRef } from 'react';

interface SmmApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPlatformSelect: (platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | 'tiktok' | 'pinterest' | 'snapchat' | 'whatsapp' | 'telegram' | 'discord' | 'reddit' | 'tumblr' | 'other', file?: File) => void;
}

const SmmApplicationModal: React.FC<SmmApplicationModalProps> = ({ isOpen, onClose, onPlatformSelect }) => {
    const [step, setStep] = useState<'platform' | 'upload'>('platform');
    const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleReset = () => {
        setStep('platform');
        setSelectedPlatform(null);
        setSelectedFile(null);
        setDragActive(false);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    const handlePlatformSelect = (platformId: string) => {
        setSelectedPlatform(platformId);
        setStep('upload');
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleContinue = () => {
        if (selectedPlatform) {
            onPlatformSelect(selectedPlatform as any, selectedFile || undefined);
            handleReset();
        }
    };

    const platforms = [
        {
            id: 'facebook',
            name: 'Facebook',
            icon: '📘',
            description: 'Share with friends and family',
            color: 'from-blue-600 to-blue-700'
        },
        {
            id: 'instagram',
            name: 'Instagram',
            icon: '📷',
            description: 'Visual storytelling platform',
            color: 'from-pink-500 to-purple-600'
        },
        {
            id: 'twitter',
            name: 'Twitter/X',
            icon: '🐦',
            description: 'Real-time conversations',
            color: 'from-sky-400 to-blue-500'
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            icon: '💼',
            description: 'Professional networking',
            color: 'from-blue-700 to-blue-800'
        },
        {
            id: 'youtube',
            name: 'YouTube',
            icon: '🎥',
            description: 'Video content platform',
            color: 'from-red-600 to-red-700'
        },
        {
            id: 'tiktok',
            name: 'TikTok',
            icon: '🎵',
            description: 'Short-form video content',
            color: 'from-black to-gray-800'
        }
    ];

    const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">📱 SMM Application Fields</h2>
                            <p className="text-slate-600">Configure your social media content</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {step === 'platform' && (
                        <>
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <h3 className="text-lg font-bold text-slate-900">Social Media Platform</h3>
                                    <span className="text-red-500 text-sm">*</span>
                                </div>
                                <p className="text-slate-600 text-sm mb-6">Select the platform where you want to publish your content</p>
                            </div>

                            {/* Platform Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {platforms.map((platform) => (
                                    <button
                                        key={platform.id}
                                        onClick={() => handlePlatformSelect(platform.id)}
                                        className="group relative bg-white border-2 border-slate-200 rounded-xl p-6 text-left hover:border-purple-300 hover:shadow-lg transition-all duration-200 hover:scale-105"
                                    >
                                        <div className="flex items-center gap-4 mb-3">
                                            <div className={`w-12 h-12 bg-gradient-to-r ${platform.color} rounded-xl flex items-center justify-center text-2xl shadow-sm`}>
                                                {platform.icon}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">{platform.name}</h4>
                                            </div>
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{platform.description}</p>

                                        {/* Hover effect overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                                    </button>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-slate-500">
                                        Choose a platform to continue with content configuration
                                    </p>
                                    <button
                                        onClick={handleClose}
                                        className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {step === 'upload' && (
                        <>
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <button
                                        onClick={() => setStep('platform')}
                                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <h3 className="text-lg font-bold text-slate-900">Upload Content</h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <p className="text-slate-600 text-sm">Selected platform:</p>
                                    {selectedPlatformData && (
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 bg-gradient-to-r ${selectedPlatformData.color} rounded-lg flex items-center justify-center text-lg`}>
                                                {selectedPlatformData.icon}
                                            </div>
                                            <span className="font-semibold text-purple-600">{selectedPlatformData.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Upload Area */}
                            <div
                                className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${dragActive
                                        ? 'border-purple-400 bg-purple-50'
                                        : selectedFile
                                            ? 'border-green-400 bg-green-50'
                                            : 'border-slate-300 bg-slate-50 hover:border-purple-300 hover:bg-purple-50'
                                    }`}
                                onDrop={handleDrop}
                                onDragOver={handleDrag}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*,video/*,.pdf,.doc,.docx"
                                    onChange={handleFileInputChange}
                                />

                                <div className="flex flex-col items-center">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${selectedFile ? 'bg-green-500' : 'bg-purple-500'
                                        }`}>
                                        {selectedFile ? (
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                            </svg>
                                        )}
                                    </div>

                                    {selectedFile ? (
                                        <div>
                                            <p className="text-lg font-semibold text-green-700 mb-2">File Selected!</p>
                                            <p className="text-sm text-green-600 mb-1">{selectedFile.name}</p>
                                            <p className="text-xs text-green-500">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-lg font-semibold text-slate-700 mb-2">
                                                Drag & drop your files here, or click to browse
                                            </p>
                                            <p className="text-sm text-slate-500 mb-4">
                                                Supported formats: PNG, JPG, SVG, PDF, MP4, WEBM, AVIF
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-slate-500">
                                        {selectedFile ? 'Ready to continue' : 'File upload is optional'}
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleClose}
                                            className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleContinue}
                                            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                                        >
                                            Continue
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmmApplicationModal;