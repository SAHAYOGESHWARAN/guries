import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown } from 'lucide-react';
import PlatformMasterModal from './PlatformMasterModal';
import { API_BASE_URL } from '../constants';

interface Platform {
    id: number;
    platform_name: string;
    platform_code: string;
    description: string;
    status: string;
    content_type_count: number;
    asset_type_count: number;
    created_at: string;
}

interface ContentType {
    id: number;
    content_type: string;
    category: string;
}

interface AssetType {
    id: number;
    asset_type: string;
    dimension: string;
}

export default function PlatformMaster() {
    const [platforms, setPlatforms] = useState<Platform[]>([]);
    const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPlatform, setEditingPlatform] = useState<any>(null);
    const [expandedPlatform, setExpandedPlatform] = useState<number | null>(null);

    useEffect(() => {
        fetchPlatforms();
        fetchMasterData();
    }, []);

    const fetchPlatforms = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/platform-master`);
            const data = await response.json();
            setPlatforms(data);
        } catch (error) {
            console.error('Error fetching platforms:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterData = async () => {
        try {
            const [ctRes, atRes] = await Promise.all([
                fetch(`${API_BASE_URL}/content-types`),
                fetch(`${API_BASE_URL}/asset-types`)
            ]);
            const contentTypesData = await ctRes.json();
            const assetTypesData = await atRes.json();
            setContentTypes(contentTypesData);
            setAssetTypes(assetTypesData);
        } catch (error) {
            console.error('Error fetching master data:', error);
        }
    };

    const handleAddPlatform = () => {
        setEditingPlatform(null);
        setShowModal(true);
    };

    const handleEditPlatform = (platform: Platform) => {
        setEditingPlatform(platform);
        setShowModal(true);
    };

    const handleDeletePlatform = async (id: number) => {
        if (confirm('Are you sure you want to delete this platform?')) {
            try {
                await fetch(`${API_BASE_URL}/platform-master/${id}`, {
                    method: 'DELETE'
                });
                fetchPlatforms();
            } catch (error) {
                console.error('Error deleting platform:', error);
            }
        }
    };

    const handleSavePlatform = async (platformData: any) => {
        try {
            const method = editingPlatform ? 'PUT' : 'POST';
            const url = editingPlatform
                ? `${API_BASE_URL}/platform-master/${editingPlatform.id}`
                : `${API_BASE_URL}/platform-master`;

            await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(platformData)
            });

            setShowModal(false);
            fetchPlatforms();
        } catch (error) {
            console.error('Error saving platform:', error);
        }
    };

    if (loading) {
        return <div className="p-6 text-center">Loading...</div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Platform Master</h1>
                        <p className="text-gray-600 mt-1">Manage platforms, content types, asset types, and scheduling options</p>
                    </div>
                    <button
                        onClick={handleAddPlatform}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Add Platform
                    </button>
                </div>

                {/* Platforms Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Platform Name</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Content Types</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Asset Types</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {platforms.map((platform) => (
                                <React.Fragment key={platform.id}>
                                    <tr className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{platform.platform_name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{platform.platform_code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {platform.content_type_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                                {platform.asset_type_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${platform.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {platform.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setExpandedPlatform(expandedPlatform === platform.id ? null : platform.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <ChevronDown size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEditPlatform(platform)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePlatform(platform.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedPlatform === platform.id && (
                                        <tr className="bg-gray-50 border-b">
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="font-semibold text-gray-700 mb-2">Description:</p>
                                                    <p className="text-gray-600 mb-4">{platform.description || 'No description'}</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {platforms.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg">
                        <p className="text-gray-500">No platforms found. Create one to get started.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <PlatformMasterModal
                    platform={editingPlatform}
                    contentTypes={contentTypes}
                    assetTypes={assetTypes}
                    onSave={handleSavePlatform}
                    onClose={() => setShowModal(false)}
                />
            )}
        </div>
    );
}
