import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants';
import '../styles/AssetManager.css';

interface Asset {
    id: number;
    asset_name: string;
    asset_type: string;
    asset_category: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export function AssetManager() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        asset_name: '',
        asset_type: 'article',
        asset_category: 'content',
        status: 'draft'
    });

    // Fetch assets
    const fetchAssets = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/assetLibrary`);
            if (!response.ok) throw new Error('Failed to fetch assets');
            const data = await response.json();
            setAssets(data.data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Load assets on mount
    useEffect(() => {
        fetchAssets();
    }, []);

    // Create asset
    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/assetLibrary`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create asset');
            }

            const data = await response.json();
            setAssets([data.asset, ...assets]);
            setFormData({
                asset_name: '',
                asset_type: 'article',
                asset_category: 'content',
                status: 'draft'
            });
            alert('Asset created successfully!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete asset
    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/assetLibrary/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete asset');

            setAssets(assets.filter(a => a.id !== id));
            alert('Asset deleted successfully!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Update asset status
    const handleUpdateStatus = async (id: number, newStatus: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/assetLibrary/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) throw new Error('Failed to update asset');

            const data = await response.json();
            setAssets(assets.map(a => a.id === id ? data.asset : a));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="asset-manager">
            <h1>Asset Manager</h1>

            {error && <div className="error-message">{error}</div>}

            <div className="container">
                {/* Form Section */}
                <div className="form-section">
                    <h2>Create New Asset</h2>
                    <form onSubmit={handleCreate}>
                        <div className="form-group">
                            <label>Asset Name *</label>
                            <input
                                type="text"
                                value={formData.asset_name}
                                onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
                                placeholder="Enter asset name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Asset Type</label>
                            <select
                                value={formData.asset_type}
                                onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                            >
                                <option value="article">Article</option>
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                                <option value="document">Document</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <input
                                type="text"
                                value={formData.asset_category}
                                onChange={(e) => setFormData({ ...formData, asset_category: e.target.value })}
                                placeholder="Enter category"
                            />
                        </div>

                        <div className="form-group">
                            <label>Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Asset'}
                        </button>
                    </form>
                </div>

                {/* List Section */}
                <div className="list-section">
                    <div className="list-header">
                        <h2>Assets ({assets.length})</h2>
                        <button onClick={fetchAssets} disabled={loading} className="refresh-btn">
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>

                    {loading && assets.length === 0 ? (
                        <p className="loading">Loading assets...</p>
                    ) : assets.length === 0 ? (
                        <p className="empty">No assets found. Create one to get started!</p>
                    ) : (
                        <div className="assets-grid">
                            {assets.map(asset => (
                                <div key={asset.id} className="asset-card">
                                    <div className="asset-header">
                                        <h3>{asset.asset_name}</h3>
                                        <span className={`status-badge status-${asset.status}`}>
                                            {asset.status}
                                        </span>
                                    </div>

                                    <div className="asset-details">
                                        <p><strong>Type:</strong> {asset.asset_type}</p>
                                        <p><strong>Category:</strong> {asset.asset_category}</p>
                                        <p><strong>Created:</strong> {new Date(asset.created_at).toLocaleDateString()}</p>
                                    </div>

                                    <div className="asset-actions">
                                        <select
                                            value={asset.status}
                                            onChange={(e) => handleUpdateStatus(asset.id, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                        <button
                                            onClick={() => handleDelete(asset.id)}
                                            className="delete-btn"
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
