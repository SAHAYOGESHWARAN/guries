import React, { useState, useEffect } from 'react';
import type { AssetLibraryItem } from '../types';

interface ServiceLinkedAssetsDisplayProps {
    serviceId: number;
    subServiceId?: number;
    title?: string;
    showStaticIndicator?: boolean;
}

interface LinkedAsset extends AssetLibraryItem {
    is_static?: boolean;
}

const ServiceLinkedAssetsDisplay: React.FC<ServiceLinkedAssetsDisplayProps> = ({
    serviceId,
    subServiceId,
    title = 'Linked Assets',
    showStaticIndicator = true
}) => {
    const [assets, setAssets] = useState<LinkedAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLinkedAssets = async () => {
            setLoading(true);
            setError(null);

            try {
                const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
                let endpoint = `/asset-service-linking/services/${serviceId}/linked-assets`;

                if (subServiceId) {
                    endpoint = `/asset-service-linking/sub-services/${subServiceId}/linked-assets`;
                }

                const response = await fetch(`${apiUrl}${endpoint}`);

                if (!response.ok) {
                    throw new Error(`Failed to fetch linked assets: ${response.statusText}`);
                }

                const data = await response.json();
                setAssets(Array.isArray(data) ? data : []);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load linked assets';
                setError(message);
                console.error('Error fetching linked assets:', err);
            } finally {
                setLoading(false);
            }
        };

        if (serviceId) {
            fetchLinkedAssets();
        }
    }, [serviceId, subServiceId]);

    if (loading) {
        return (
            <div className="linked-assets-display">
                <div className="loading-spinner">Loading assets...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="linked-assets-display">
                <div className="error-message">Error: {error}</div>
            </div>
        );
    }

    if (assets.length === 0) {
        return (
            <div className="linked-assets-display">
                <div className="empty-state">
                    <p>No assets linked to this service yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="linked-assets-display">
            <h3 className="assets-title">{title}</h3>
            <div className="assets-grid">
                {assets.map(asset => (
                    <div key={asset.id} className="asset-card">
                        {/* Asset Thumbnail */}
                        <div className="asset-thumbnail">
                            {asset.thumbnail_url ? (
                                <img src={asset.thumbnail_url} alt={asset.name} />
                            ) : (
                                <div className="asset-icon">
                                    {getAssetIcon(asset.type)}
                                </div>
                            )}
                            {showStaticIndicator && asset.is_static && (
                                <div className="static-badge" title="This asset is permanently linked and cannot be removed">
                                    🔒 Static
                                </div>
                            )}
                        </div>

                        {/* Asset Info */}
                        <div className="asset-info">
                            <h4 className="asset-name">{asset.name}</h4>

                            {/* Status Badges */}
                            <div className="asset-badges">
                                {asset.status && (
                                    <span className={`badge badge-${asset.status.toLowerCase()}`}>
                                        {asset.status}
                                    </span>
                                )}
                                {asset.qc_status && (
                                    <span className={`badge badge-qc-${asset.qc_status.toLowerCase()}`}>
                                        QC: {asset.qc_status}
                                    </span>
                                )}
                            </div>

                            {/* Asset Details */}
                            <div className="asset-details">
                                {asset.type && (
                                    <div className="detail-row">
                                        <span className="detail-label">Type:</span>
                                        <span className="detail-value">{asset.type}</span>
                                    </div>
                                )}
                                {asset.asset_category && (
                                    <div className="detail-row">
                                        <span className="detail-label">Category:</span>
                                        <span className="detail-value">{asset.asset_category}</span>
                                    </div>
                                )}
                                {asset.seo_score !== undefined && (
                                    <div className="detail-row">
                                        <span className="detail-label">SEO Score:</span>
                                        <span className={`detail-value score-${getScoreLevel(asset.seo_score)}`}>
                                            {asset.seo_score}/100
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Keywords */}
                            {asset.keywords && asset.keywords.length > 0 && (
                                <div className="asset-keywords">
                                    {asset.keywords.slice(0, 3).map((keyword, idx) => (
                                        <span key={idx} className="keyword-tag">
                                            {keyword}
                                        </span>
                                    ))}
                                    {asset.keywords.length > 3 && (
                                        <span className="keyword-tag more">
                                            +{asset.keywords.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Action Button */}
                            {asset.file_url && (
                                <a
                                    href={asset.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-view-asset"
                                >
                                    View Asset →
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .linked-assets-display {
                    padding: 1rem;
                }

                .assets-title {
                    font-size: 1.3rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                    color: #333;
                }

                .assets-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .asset-card {
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .asset-card:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                }

                .asset-thumbnail {
                    position: relative;
                    width: 100%;
                    height: 180px;
                    background-color: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }

                .asset-thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .asset-icon {
                    font-size: 3rem;
                    opacity: 0.5;
                }

                .static-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background-color: #ffc107;
                    color: #333;
                    padding: 0.4rem 0.8rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .asset-info {
                    padding: 1rem;
                }

                .asset-name {
                    font-size: 1rem;
                    font-weight: 600;
                    margin: 0 0 0.75rem 0;
                    color: #333;
                    line-height: 1.3;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .asset-badges {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                    flex-wrap: wrap;
                }

                .badge {
                    display: inline-block;
                    padding: 0.25rem 0.6rem;
                    border-radius: 3px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .badge-draft {
                    background-color: #e9ecef;
                    color: #495057;
                }

                .badge-published {
                    background-color: #d4edda;
                    color: #155724;
                }

                .badge-pending {
                    background-color: #fff3cd;
                    color: #856404;
                }

                .badge-qc-pass {
                    background-color: #d4edda;
                    color: #155724;
                }

                .badge-qc-fail {
                    background-color: #f8d7da;
                    color: #721c24;
                }

                .badge-qc-pending {
                    background-color: #fff3cd;
                    color: #856404;
                }

                .asset-details {
                    margin-bottom: 0.75rem;
                    font-size: 0.85rem;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.4rem;
                    color: #666;
                }

                .detail-label {
                    font-weight: 600;
                    color: #555;
                }

                .detail-value {
                    color: #666;
                }

                .score-high {
                    color: #28a745;
                    font-weight: 600;
                }

                .score-medium {
                    color: #ffc107;
                    font-weight: 600;
                }

                .score-low {
                    color: #dc3545;
                    font-weight: 600;
                }

                .asset-keywords {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                    margin-bottom: 0.75rem;
                }

                .keyword-tag {
                    display: inline-block;
                    background-color: #e7f3ff;
                    color: #0056b3;
                    padding: 0.25rem 0.6rem;
                    border-radius: 3px;
                    font-size: 0.75rem;
                }

                .keyword-tag.more {
                    background-color: #f0f0f0;
                    color: #666;
                }

                .btn-view-asset {
                    display: inline-block;
                    background-color: #007bff;
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    text-decoration: none;
                    font-size: 0.85rem;
                    font-weight: 600;
                    transition: background-color 0.3s ease;
                    width: 100%;
                    text-align: center;
                }

                .btn-view-asset:hover {
                    background-color: #0056b3;
                    text-decoration: none;
                }

                .loading-spinner {
                    text-align: center;
                    padding: 2rem;
                    color: #666;
                }

                .error-message {
                    background-color: #f8d7da;
                    border: 1px solid #f5c6cb;
                    color: #721c24;
                    padding: 1rem;
                    border-radius: 4px;
                }

                .empty-state {
                    text-align: center;
                    padding: 2rem;
                    color: #999;
                    background-color: #f8f9fa;
                    border-radius: 4px;
                }

                @media (max-width: 768px) {
                    .assets-grid {
                        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                        gap: 1rem;
                    }

                    .asset-thumbnail {
                        height: 140px;
                    }
                }
            `}</style>
        </div>
    );
};

// Helper function to get asset icon based on type
function getAssetIcon(type?: string): string {
    const icons: Record<string, string> = {
        'article': '📄',
        'image': '🖼️',
        'video': '🎥',
        'document': '📑',
        'infographic': '📊',
        'web': '🌐',
        'seo': '🔍',
        'smm': '📱'
    };
    return icons[type?.toLowerCase() || ''] || '📦';
}

// Helper function to get score level
function getScoreLevel(score: number): string {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
}

export default ServiceLinkedAssetsDisplay;
