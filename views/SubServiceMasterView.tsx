import React, { useState, useMemo, useEffect } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import SocialMetaForm from '../components/SocialMetaForm';
import ServiceAssetLinker from '../components/ServiceAssetLinker';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { SubServiceItem, Service, ContentRepositoryItem, AssetLibraryItem, Brand, User, ContentTypeItem, Keyword, IndustrySectorItem } from '../types';

const STATUSES = ['All Status', 'Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'];
const FALLBACK_CONTENT_TYPES: ContentTypeItem[] = [
    { id: 1, content_type: 'Pillar', category: 'Core', description: 'Long-form primary page', default_attributes: [], status: 'active' },
    { id: 2, content_type: 'Cluster', category: 'Supporting', description: 'Supporting topic page', default_attributes: [], status: 'active' },
    { id: 3, content_type: 'Landing', category: 'Conversion', description: 'Campaign landing page', default_attributes: [], status: 'active' },
    { id: 4, content_type: 'Blog', category: 'Editorial', description: 'Blog article', default_attributes: [], status: 'active' }
];

const SubServiceMasterView: React.FC = () => {
    const { data: subServices = [], create, update, remove, refresh: refreshSubServices, loading } = useData<SubServiceItem>('subServices');
    const { data: services = [], refresh: refreshServices } = useData<Service>('services');
    const { data: contentAssets = [], update: updateContentAsset, refresh: refreshContentAssets } = useData<ContentRepositoryItem>('content');
    const { data: libraryAssets = [], update: updateLibraryAsset, refresh: refreshLibraryAssets } = useData<AssetLibraryItem>('assetLibrary');
    const { data: brands = [], refresh: refreshBrands } = useData<Brand>('brands');
    const { data: users = [], refresh: refreshUsers } = useData<User>('users');
    const { data: contentTypes = [], refresh: refreshContentTypes } = useData<ContentTypeItem>('contentTypes');
    const { data: keywordsMaster = [], refresh: refreshKeywords } = useData<Keyword>('keywords');
    const { data: industrySectors = [], refresh: refreshIndustrySectors } = useData<IndustrySectorItem>('industrySectors');

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'form' | 'view'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [parentFilter, setParentFilter] = useState('All Parent Services');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [contentTypeFilter, setContentTypeFilter] = useState('All Types');
    const [brandFilter, setBrandFilter] = useState('All Brands');
    const [industryFilter, setIndustryFilter] = useState('All Industries');
    const [editingItem, setEditingItem] = useState<SubServiceItem | null>(null);
    const [activeTab, setActiveTab] = useState<'GeneralInfo' | 'SubServiceManager' | 'SEOContent' | 'LinkedAssets'>('GeneralInfo');
    const [assetSearch, setAssetSearch] = useState('');
    const [repositoryFilter, setRepositoryFilter] = useState('All');
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Insights management state
    const [linkedInsights, setLinkedInsights] = useState([
        { id: 1, title: 'Blog: SEO Best Practices', type: 'Blog', priority: 1, status: 'Ready' },
        { id: 2, title: 'Whitepaper: Content Strategy', type: 'Whitepaper', priority: 2, status: 'Ready' },
        { id: 3, title: 'Case Study: E-commerce Success', type: 'Case Study', priority: 3, status: 'Draft' },
        { id: 4, title: 'Video: SEO Tutorial', type: 'Video', priority: 4, status: 'Ready' }
    ]);
    const [selectedInsights, setSelectedInsights] = useState([1, 2]); // IDs of selected insights

    // Promotional readiness state
    const [contentReady, setContentReady] = useState(true);
    const [assetsReady, setAssetsReady] = useState(true);
    const [seoScore, setSeoScore] = useState(75);

    // SEO Content state
    const [h2Headings, setH2Headings] = useState<string[]>([]);
    const [h3Headings, setH3Headings] = useState<string[]>([]);
    const [tempH2, setTempH2] = useState('');
    const [tempH3, setTempH3] = useState('');
    const [ogImageFile, setOgImageFile] = useState<File | null>(null);
    const [ogImagePreview, setOgImagePreview] = useState<string>('');
    const [schemaType, setSchemaType] = useState('Service');
    const [schemaJson, setSchemaJson] = useState('');
    const [showMissingSeoWarning, setShowMissingSeoWarning] = useState(true);

    // Sub-services management state
    const [subServicesList, setSubServicesList] = useState([
        { id: 1, name: 'On-Page SEO', slug: 'on-page-seo', keywords: 'on-page, seo optimization', status: 'active' },
        { id: 2, name: 'Off-Page SEO', slug: 'off-page-seo', keywords: 'backlinks, link building', status: 'active' }
    ]);

    // Form State
    const [formData, setFormData] = useState<any>({
        sub_service_name: '',
        parent_service_id: 0,
        sub_service_code: '',
        slug: '',
        full_url: '',
        description: '',
        status: 'Draft',
        language: 'en',
        content_type: 'Cluster',
        buyer_journey_stage: 'Consideration',
        h1: '',
        meta_title: '',
        meta_description: '',
        focus_keywords: [],
        secondary_keywords: [],
        og_title: '',
        og_description: '',
        og_image_url: '',
        og_type: 'website',
        twitter_title: '',
        twitter_description: '',
        twitter_image_url: '',
        linkedin_title: '',
        linkedin_description: '',
        linkedin_image_url: '',
        facebook_title: '',
        facebook_description: '',
        facebook_image_url: '',
        instagram_title: '',
        instagram_description: '',
        instagram_image_url: '',
        brand_id: 0,
        content_owner_id: 0,
        primary_cta_label: '',
        primary_cta_url: ''
    });

    // Temp inputs for arrays
    const [tempKeyword, setTempKeyword] = useState('');
    const [tempSecondaryKeyword, setTempSecondaryKeyword] = useState('');

    const availableContentTypes = contentTypes.length ? contentTypes : FALLBACK_CONTENT_TYPES;

    const filteredData = subServices.filter(item => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        const matchesSearch = !normalizedQuery || [
            item.sub_service_name,
            item.sub_service_code,
            item.slug,
            item.description,
            item.h1,
            item.meta_title,
            item.meta_description
        ].some(value => (value || '').toLowerCase().includes(normalizedQuery));

        const parentName = services.find(s => s.id === item.parent_service_id)?.service_name || '';
        const matchesParent = parentFilter === 'All Parent Services' || parentName === parentFilter;
        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        const matchesContentType = contentTypeFilter === 'All Types' || item.content_type === contentTypeFilter;

        // Brand filter based on parent service's brand
        const parentService = services.find(s => s.id === item.parent_service_id);
        const parentBrand = parentService?.brand_id ? brands.find(b => b.id === parentService.brand_id)?.name : null;
        const matchesBrand = brandFilter === 'All Brands' || parentBrand === brandFilter;

        // Industry filter based on parent service's industry_ids
        const parentIndustryIds = parentService?.industry_ids || [];
        const matchesIndustry = industryFilter === 'All Industries' ||
            (Array.isArray(parentIndustryIds) && parentIndustryIds.some(industryId => {
                const industry = industrySectors.find(ind => ind.id === parseInt(industryId));
                return industry?.industry === industryFilter;
            }));

        return matchesSearch && matchesParent && matchesStatus && matchesContentType && matchesBrand && matchesIndustry;
    });

    // Linked and Available Assets from Asset Library
    const linkedLibraryAssets = useMemo(() => {
        if (!editingItem) return [];
        return libraryAssets.filter(a => {
            const links = Array.isArray(a.linked_sub_service_ids) ? a.linked_sub_service_ids : [];
            return links.map(String).includes(String(editingItem.id));
        });
    }, [libraryAssets, editingItem]);

    const availableLibraryAssets = useMemo(() => {
        if (!editingItem) return [];
        const searchLower = assetSearch.toLowerCase().trim();
        return libraryAssets
            .filter(a => {
                // Check if asset is not already linked
                const links = Array.isArray(a.linked_sub_service_ids) ? a.linked_sub_service_ids : [];
                const isLinked = links.map(String).includes(String(editingItem.id));
                if (isLinked) return false;

                // Check repository filter
                if (repositoryFilter !== 'All' && a.repository !== repositoryFilter) return false;

                // Check if asset matches search query (if any)
                if (!searchLower) return true;
                const name = (a.name || '').toLowerCase();
                const assetType = (a.type || '').toLowerCase();
                const repository = (a.repository || '').toLowerCase();
                return name.includes(searchLower) || assetType.includes(searchLower) || repository.includes(searchLower);
            })
            .slice(0, 20); // Limit to show 20 results
    }, [libraryAssets, editingItem, assetSearch, repositoryFilter]);

    const handleCreateClick = () => {
        setEditingItem(null);
        setFormData({
            sub_service_name: '',
            parent_service_id: 0,
            sub_service_code: '',
            slug: '',
            full_url: '',
            description: '',
            status: 'Draft',
            language: 'en',
            content_type: 'Cluster',
            buyer_journey_stage: 'Consideration',
            h1: '',
            meta_title: '',
            meta_description: '',
            focus_keywords: [],
            secondary_keywords: [],
            og_title: '',
            og_description: '',
            og_image_url: '',
            og_type: 'website',
            twitter_title: '',
            twitter_description: '',
            twitter_image_url: '',
            linkedin_title: '',
            linkedin_description: '',
            linkedin_image_url: '',
            facebook_title: '',
            facebook_description: '',
            facebook_image_url: '',
            instagram_title: '',
            instagram_description: '',
            instagram_image_url: '',
            brand_id: 0,
            content_owner_id: 0,
            primary_cta_label: '',
            primary_cta_url: ''
        });
        setActiveTab('GeneralInfo');
        setViewMode('form');
    };

    const handleView = (item: SubServiceItem) => {
        setEditingItem(item);
        setFormData({
            ...item,
            focus_keywords: item.focus_keywords || [],
            secondary_keywords: item.secondary_keywords || [],
            content_type: item.content_type || 'Cluster',
            buyer_journey_stage: item.buyer_journey_stage || 'Consideration',
            h1: item.h1 || '',
            primary_cta_label: item.primary_cta_label || '',
            primary_cta_url: item.primary_cta_url || '',
            og_type: item.og_type || 'website',
            og_title: item.og_title || '',
            og_description: item.og_description || '',
            og_image_url: item.og_image_url || '',
            twitter_title: item.twitter_title || '',
            twitter_description: item.twitter_description || '',
            twitter_image_url: item.twitter_image_url || '',
            linkedin_title: item.linkedin_title || '',
            linkedin_description: item.linkedin_description || '',
            linkedin_image_url: item.linkedin_image_url || '',
            facebook_title: item.facebook_title || '',
            facebook_description: item.facebook_description || '',
            facebook_image_url: item.facebook_image_url || '',
            instagram_title: item.instagram_title || '',
            instagram_description: item.instagram_description || '',
            instagram_image_url: item.instagram_image_url || ''
        });
        setActiveTab('GeneralInfo');
        setViewMode('view');
    };

    const handleEdit = (item: SubServiceItem) => {
        setEditingItem(item);
        setFormData({
            ...item,
            focus_keywords: item.focus_keywords || [],
            secondary_keywords: item.secondary_keywords || [],
            content_type: item.content_type || 'Cluster',
            buyer_journey_stage: item.buyer_journey_stage || 'Consideration',
            h1: item.h1 || '',
            primary_cta_label: item.primary_cta_label || '',
            primary_cta_url: item.primary_cta_url || '',
            og_type: item.og_type || 'website',
            og_title: item.og_title || '',
            og_description: item.og_description || '',
            og_image_url: item.og_image_url || '',
            twitter_title: item.twitter_title || '',
            twitter_description: item.twitter_description || '',
            twitter_image_url: item.twitter_image_url || '',
            linkedin_title: item.linkedin_title || '',
            linkedin_description: item.linkedin_description || '',
            linkedin_image_url: item.linkedin_image_url || '',
            facebook_title: item.facebook_title || '',
            facebook_description: item.facebook_description || '',
            facebook_image_url: item.facebook_image_url || '',
            instagram_title: item.instagram_title || '',
            instagram_description: item.instagram_description || '',
            instagram_image_url: item.instagram_image_url || ''
        });
        setActiveTab('GeneralInfo');
        setViewMode('form');
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this sub-service?')) {
            await remove(id);
        }
    };

    const handleSave = async () => {
        if (!formData.sub_service_name) {
            return alert("Sub-Service Name is required");
        }
        if (!formData.parent_service_id || formData.parent_service_id === 0) {
            return alert("Parent Service is required");
        }

        const now = new Date().toISOString();
        const payload = {
            ...formData,
            updated_at: now,
            slug: formData.slug || formData.sub_service_name.toLowerCase().replace(/ /g, '-')
        };

        if (formData.slug && !formData.full_url) {
            payload.full_url = `/services/${formData.slug}`;
        }

        if (editingItem) {
            await update(editingItem.id, payload);
        } else {
            payload.created_at = now;
            await create(payload as any);
        }
        setViewMode('list');
        setEditingItem(null);
    };

    const handleSlugChange = (val: string) => {
        const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        setFormData((prev: any) => ({ ...prev, slug, full_url: `/services/${slug}` }));
    };

    const handleCopyFullUrl = () => {
        if (!formData.full_url) return;
        if (typeof navigator === 'undefined' || !navigator.clipboard) {
            alert('Clipboard API unavailable in this environment.');
            return;
        }
        navigator.clipboard.writeText(formData.full_url)
            .then(() => {
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 1500);
            })
            .catch(() => alert('Unable to copy URL to clipboard.'));
    };

    const handleToggleLibraryLink = async (asset: AssetLibraryItem) => {
        if (!editingItem) return;
        const currentLinks = Array.isArray(asset.linked_sub_service_ids) ? asset.linked_sub_service_ids : [];
        const isLinked = currentLinks.map(String).includes(String(editingItem.id));
        const newLinks = isLinked
            ? currentLinks.filter(id => String(id) !== String(editingItem.id))
            : [...currentLinks, editingItem.id];

        try {
            // Update the library asset with new links
            await updateLibraryAsset(asset.id, { linked_sub_service_ids: newLinks });

            // Force a refresh to ensure we have the latest data
            await refreshLibraryAssets();
        } catch (e) {
            console.error('Library asset link update error:', e);
            // Even if there's an error, try to refresh to show current state
            try {
                await refreshLibraryAssets();
            } catch (refreshError) {
                console.error('Refresh error:', refreshError);
            }
        }
    };

    const addToList = (field: string, value: any, setter?: any) => {
        if (!value) return;
        setFormData((prev: any) => ({
            ...prev,
            [field]: [...(prev[field] || []), value]
        }));
        if (setter) setter('');
    };

    const removeFromList = (field: string, index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: (prev[field] || []).filter((_: any, i: number) => i !== index)
        }));
    };

    const getKeywordMetric = (kw: string) => {
        const masterRecord = keywordsMaster.find(k => k.keyword.toLowerCase() === kw.toLowerCase());
        const vol = masterRecord ? masterRecord.search_volume.toLocaleString() : 'N/A';
        const comp = masterRecord ? masterRecord.competition : '-';
        return `Vol: ${vol} | Comp: ${comp}`;
    };

    const handleOgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('File size must be less than 2MB');
                return;
            }
            if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                alert('Only PNG and JPG files are allowed');
                return;
            }
            setOgImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setOgImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addHeading = (type: 'h2' | 'h3', value: string) => {
        if (!value.trim()) return;
        if (type === 'h2') {
            setH2Headings([...h2Headings, value]);
            setTempH2('');
        } else {
            setH3Headings([...h3Headings, value]);
            setTempH3('');
        }
    };

    const removeHeading = (type: 'h2' | 'h3', index: number) => {
        if (type === 'h2') {
            setH2Headings(h2Headings.filter((_, i) => i !== index));
        } else {
            setH3Headings(h3Headings.filter((_, i) => i !== index));
        }
    };

    const generateSchemaJson = () => {
        const baseSchema = {
            "@context": "https://schema.org",
            "@type": schemaType,
            "name": formData.sub_service_name || "Sub-Service Name",
            "description": formData.meta_description || formData.description || "Service description",
            "url": formData.full_url || "",
        };

        if (schemaType === 'Service') {
            Object.assign(baseSchema, {
                "serviceType": formData.content_type || "Service",
                "provider": {
                    "@type": "Organization",
                    "name": "Your Organization"
                }
            });
        } else if (schemaType === 'Product') {
            Object.assign(baseSchema, {
                "brand": "Your Brand",
                "category": formData.content_type || "Product"
            });
        } else if (schemaType === 'Article') {
            Object.assign(baseSchema, {
                "headline": formData.h1 || formData.sub_service_name,
                "author": {
                    "@type": "Person",
                    "name": "Author Name"
                }
            });
        }

        setSchemaJson(JSON.stringify(baseSchema, null, 2));
    };

    const checkSeoCompleteness = () => {
        const missing = [];
        if (!formData.meta_description) missing.push('Meta Description');
        if (!formData.og_image_url && !ogImageFile) missing.push('OG Image');
        return missing;
    };

    const handleExport = () => {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `sub_services_export_${timestamp}`;

        // Transform data to include the specific fields requested
        const exportData = filteredData.map(item => {
            // Get parent service info
            const parentService = services.find(s => s.id === item.parent_service_id);

            // Get industry sectors from parent service
            const parentIndustryIds = parentService?.industry_ids || [];
            const industryNames = Array.isArray(parentIndustryIds)
                ? parentIndustryIds.map(id => {
                    const industry = industrySectors.find(ind => ind.id === parseInt(id));
                    return industry?.industry || '';
                }).filter(name => name).join('; ')
                : '';

            // Count linked assets
            const linkedContentAssets = contentAssets.filter(asset => {
                const links = Array.isArray(asset.linked_sub_service_ids) ? asset.linked_sub_service_ids : [];
                return links.map(String).includes(String(item.id));
            }).length;

            const linkedLibraryAssets = libraryAssets.filter(asset => {
                const links = Array.isArray(asset.linked_sub_service_ids) ? asset.linked_sub_service_ids : [];
                return links.map(String).includes(String(item.id));
            }).length;

            const totalLinkedAssets = linkedContentAssets + linkedLibraryAssets;

            // Calculate health score (simplified - you can enhance this logic)
            let healthScore = 0;
            if (item.meta_title) healthScore += 20;
            if (item.meta_description) healthScore += 20;
            if (item.h1) healthScore += 15;
            if (item.focus_keywords && item.focus_keywords.length > 0) healthScore += 15;
            if (item.description) healthScore += 10;
            if (totalLinkedAssets > 0) healthScore += 10;
            if (item.og_title && item.og_description) healthScore += 10;

            return {
                'Service Name': item.sub_service_name || '',
                'Service Code': item.sub_service_code || '',
                'IndustrySector': industryNames,
                'Sub-Services': parentService?.service_name || '',
                'Linked Assets': totalLinkedAssets,
                'Linked Insights': linkedInsights.filter(insight => selectedInsights.includes(insight.id)).length,
                'Health Score': `${healthScore}%`,
                'Status': item.status || '',
                'Updated At': item.updated_at ? new Date(item.updated_at).toLocaleDateString() : ''
            };
        });

        exportToCSV(exportData, filename);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Refresh all related data with individual error handling
            const refreshPromises = [
                refreshSubServices?.().catch(e => console.warn('Failed to refresh sub-services:', e)),
                refreshServices?.().catch(e => console.warn('Failed to refresh services:', e)),
                refreshContentAssets?.().catch(e => console.warn('Failed to refresh content assets:', e)),
                refreshLibraryAssets?.().catch(e => console.warn('Failed to refresh library assets:', e)),
                refreshBrands?.().catch(e => console.warn('Failed to refresh brands:', e)),
                refreshUsers?.().catch(e => console.warn('Failed to refresh users:', e)),
                refreshContentTypes?.().catch(e => console.warn('Failed to refresh content types:', e)),
                refreshKeywords?.().catch(e => console.warn('Failed to refresh keywords:', e)),
                refreshIndustrySectors?.().catch(e => console.warn('Failed to refresh industry sectors:', e))
            ];

            await Promise.allSettled(refreshPromises);

            // Show success feedback briefly
            setTimeout(() => {
                setIsRefreshing(false);
            }, 800);
        } catch (error) {
            console.error('Refresh failed:', error);
            setIsRefreshing(false);
        }
    };

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
                if (searchInput) {
                    searchInput.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Auto-refresh on mount to ensure latest data
    useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    refreshSubServices?.(),
                    refreshServices?.(),
                    refreshBrands?.(),
                    refreshUsers?.(),
                    refreshContentTypes?.(),
                    refreshKeywords?.(),
                    refreshIndustrySectors?.()
                ]);
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };
        loadData();
    }, []);

    const tabs = [
        { id: 'GeneralInfo', label: 'General Info', icon: '📋' },
        { id: 'SubServiceManager', label: 'Sub-Service Manager', icon: '🔧' },
        { id: 'SEOContent', label: 'SEO & Content', icon: '🔍' },
        { id: 'LinkedAssets', label: 'Linked Assets & Insights', icon: '🔗' }
    ];

    // Define isViewMode at component level for consistent access
    const isViewMode = viewMode === 'view';

    // Helper function to get input classes based on view mode
    const getInputClasses = (baseClasses: string) => {
        return isViewMode
            ? `${baseClasses} bg-slate-50 cursor-not-allowed opacity-75`
            : baseClasses;
    };

    if (viewMode === 'form' || viewMode === 'view') {
        return (
            <div className="fixed inset-x-0 bottom-0 top-16 z-[60] bg-white flex flex-col overflow-hidden animate-slide-up">
                {/* Header */}
                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white shadow-sm z-40">
                    <div className="flex items-center gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">
                                {isViewMode ? 'View Service Details' : (editingItem ? 'Edit Service' : 'Add New Service')}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">
                                {isViewMode ? 'View complete service information and configuration' : 'Create a new service with complete SEO and content configuration'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setViewMode('list')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 px-6 bg-white flex-shrink-0 z-30">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    <div className="max-w-7xl mx-auto space-y-8 pb-20">

                        {/* --- TAB: GENERAL INFO --- */}
                        {activeTab === 'GeneralInfo' && (
                            <div className="space-y-10">
                                {/* 1. SUB-SERVICE IDENTITY CARD */}
                                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50 rounded-2xl border-2 border-indigo-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white overflow-hidden">
                                        <div className="absolute top-0 right-0 opacity-10">
                                            <span className="text-9xl">🏷️</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">💎</span>
                                                <h3 className="text-2xl font-bold">Sub-Service Identity</h3>
                                            </div>
                                            <p className="text-indigo-100 text-sm">Core naming and classification</p>
                                        </div>
                                    </div>

                                    <div className="p-10">
                                        <div className="space-y-8">
                                            {/* Row 1 - Parent Service & Sub-Service Name */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Tooltip content="Select the parent service this sub-service belongs to">
                                                    <div className="bg-white rounded-xl border-2 border-indigo-100 p-6 hover:border-indigo-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🔗</span>
                                                            Parent Service
                                                            <span className="text-red-500 ml-auto">*</span>
                                                        </label>
                                                        <select
                                                            value={formData.parent_service_id}
                                                            onChange={(e) => setFormData({ ...formData, parent_service_id: parseInt(e.target.value) })}
                                                            disabled={isViewMode}
                                                            className={`w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${isViewMode ? 'bg-slate-50 cursor-not-allowed' : 'bg-white cursor-pointer'}`}
                                                        >
                                                            <option value={0}>Select Parent Service...</option>
                                                            {services.map(s => (
                                                                <option key={s.id} value={s.id}>{s.service_name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </Tooltip>

                                                <Tooltip content="Name of the sub-service (visible in lists and URLs)">
                                                    <div className="bg-white rounded-xl border-2 border-purple-100 p-6 hover:border-purple-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">📝</span>
                                                            Sub-Service Name
                                                            <span className="text-red-500 ml-auto">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.sub_service_name}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setFormData({ ...formData, sub_service_name: val });
                                                                if (!editingItem && !formData.slug) handleSlugChange(val);
                                                            }}
                                                            disabled={isViewMode}
                                                            placeholder="Enter sub-service name..."
                                                            className={`w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium transition-all focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${isViewMode ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}`}
                                                        />
                                                    </div>
                                                </Tooltip>
                                            </div>

                                            {/* Row 2 - Sub-Service Code & Status */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Tooltip content="Unique internal identifier (e.g., SUB-001)">
                                                    <div className="bg-white rounded-xl border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🔐</span>
                                                            Sub-Service Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.sub_service_code}
                                                            onChange={(e) => setFormData({ ...formData, sub_service_code: e.target.value })}
                                                            disabled={isViewMode}
                                                            className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono font-medium transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white")}
                                                            placeholder="SUB-XXX"
                                                        />
                                                    </div>
                                                </Tooltip>

                                                <Tooltip content="Publication status">
                                                    <div className="bg-white rounded-xl border-2 border-emerald-100 p-6 hover:border-emerald-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">📊</span>
                                                            Status
                                                        </label>
                                                        <select
                                                            value={formData.status}
                                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                            disabled={isViewMode}
                                                            className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all")}
                                                        >
                                                            {STATUSES.filter(s => s !== 'All Status').map(status => (
                                                                <option key={status} value={status}>{status}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. WEB PRESENCE CARD */}
                                <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 rounded-2xl border-2 border-blue-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-10 text-white overflow-hidden">
                                        <div className="absolute top-0 right-0 opacity-10">
                                            <span className="text-9xl">🔗</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">🌐</span>
                                                <h3 className="text-2xl font-bold">Web Presence</h3>
                                            </div>
                                            <p className="text-blue-100 text-sm">URL, slug, and accessibility</p>
                                        </div>
                                    </div>

                                    <div className="p-10">
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Tooltip content="URL-friendly slug (auto-generated from name)">
                                                    <div className="bg-white rounded-xl border-2 border-cyan-100 p-6 hover:border-cyan-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🔗</span>
                                                            URL Slug
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.slug}
                                                            onChange={(e) => handleSlugChange(e.target.value)}
                                                            disabled={isViewMode}
                                                            placeholder="auto-generated-from-name"
                                                            className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono bg-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all")}
                                                        />
                                                    </div>
                                                </Tooltip>

                                                <Tooltip content="Full URL path for this sub-service">
                                                    <div className="bg-white rounded-xl border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🌍</span>
                                                            Full URL
                                                        </label>
                                                        <div className="flex gap-2">
                                                            <input
                                                                type="text"
                                                                value={formData.full_url}
                                                                onChange={(e) => setFormData({ ...formData, full_url: e.target.value })}
                                                                disabled={isViewMode}
                                                                placeholder="/services/sub-service-name"
                                                                className={getInputClasses("flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all")}
                                                            />
                                                            {formData.full_url && (
                                                                <button
                                                                    onClick={handleCopyFullUrl}
                                                                    className={`px-4 py-3 rounded-lg font-bold transition-all ${copiedUrl ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                                                >
                                                                    {copiedUrl ? '✓' : '📋'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Tooltip>
                                            </div>

                                            {/* Description - Big Box */}
                                            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border-2 border-indigo-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                                                <Tooltip content="Comprehensive description of the sub-service, its purpose, features, and benefits">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <label className="flex items-center gap-3 text-sm font-bold text-indigo-900 uppercase tracking-wider">
                                                                <span className="bg-indigo-100 p-2 rounded-lg text-xl">📄</span>
                                                                <div>
                                                                    <div>Description</div>
                                                                    <div className="text-[10px] text-slate-500 normal-case font-normal tracking-normal mt-0.5">
                                                                        Provide a detailed overview of this sub-service
                                                                    </div>
                                                                </div>
                                                            </label>
                                                            <span className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold ${(formData.description?.length || 0) > 500 ? 'bg-red-100 text-red-700 border-2 border-red-300' : 'bg-slate-100 text-slate-700 border-2 border-slate-300'}`}>
                                                                {formData.description?.length || 0}/500
                                                            </span>
                                                        </div>
                                                        <textarea
                                                            value={formData.description || ''}
                                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                            disabled={isViewMode}
                                                            placeholder="Describe the sub-service in detail...&#10;&#10;• What is this sub-service?&#10;• What problems does it solve?&#10;• What are the key features and benefits?&#10;• Who is the target audience?&#10;• How does it relate to the parent service?"
                                                            className={getInputClasses("w-full px-5 py-4 border-2 border-indigo-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all resize-none shadow-inner leading-relaxed")}
                                                            rows={12}
                                                        />
                                                        <div className="flex items-start gap-2 text-xs text-slate-600 bg-white rounded-lg p-3 border border-slate-200">
                                                            <span className="text-base">💡</span>
                                                            <div>
                                                                <strong className="text-slate-700">Tip:</strong> A well-written description helps with SEO, user understanding, and internal documentation. Include keywords naturally and focus on value propositions.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. CONTENT STRATEGY CARD */}
                                <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-slate-50 rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="relative bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-10 text-white overflow-hidden">
                                        <div className="absolute top-0 right-0 opacity-10">
                                            <span className="text-9xl">🎯</span>
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">📝</span>
                                                <h3 className="text-2xl font-bold">Content Strategy</h3>
                                            </div>
                                            <p className="text-amber-100 text-sm">Content type, journey stage, and heading</p>
                                        </div>
                                    </div>

                                    <div className="p-10">
                                        <div className="space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Tooltip content="Type of content for this sub-service">
                                                    <div className="bg-white rounded-xl border-2 border-amber-100 p-6 hover:border-amber-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">📑</span>
                                                            Content Type
                                                        </label>
                                                        <select
                                                            value={formData.content_type}
                                                            onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                                                            disabled={isViewMode}
                                                            className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all")}
                                                        >
                                                            {availableContentTypes.map(ct => (
                                                                <option key={ct.id} value={ct.content_type}>{ct.content_type}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </Tooltip>

                                                <Tooltip content="Buyer journey stage this content targets">
                                                    <div className="bg-white rounded-xl border-2 border-orange-100 p-6 hover:border-orange-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🛤️</span>
                                                            Buyer Journey Stage
                                                        </label>
                                                        <select
                                                            value={formData.buyer_journey_stage}
                                                            onChange={(e) => setFormData({ ...formData, buyer_journey_stage: e.target.value })}
                                                            disabled={isViewMode}
                                                            className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all")}
                                                        >
                                                            <option value="Awareness">Awareness</option>
                                                            <option value="Consideration">Consideration</option>
                                                            <option value="Decision">Decision</option>
                                                            <option value="Retention">Retention</option>
                                                        </select>
                                                    </div>
                                                </Tooltip>
                                            </div>

                                            {/* H1 Heading */}
                                            <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                                                <Tooltip content="Main H1 heading for the page">
                                                    <div>
                                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                                                            <span className="text-sm">📌</span>
                                                            H1 Heading
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.h1}
                                                            onChange={(e) => setFormData({ ...formData, h1: e.target.value })}
                                                            disabled={isViewMode}
                                                            placeholder="Main page heading..."
                                                            className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all")}
                                                        />
                                                    </div>
                                                </Tooltip>
                                            </div>

                                            {/* CTA Section */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <Tooltip content="Primary call-to-action button label">
                                                    <div className="bg-white rounded-xl border-2 border-green-100 p-6 hover:border-green-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🎯</span>
                                                            Primary CTA Label
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.primary_cta_label}
                                                            onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })}
                                                            disabled={isViewMode}
                                                            placeholder="Get Started"
                                                            className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all")}
                                                        />
                                                    </div>
                                                </Tooltip>

                                                <Tooltip content="Primary call-to-action URL">
                                                    <div className="bg-white rounded-xl border-2 border-teal-100 p-6 hover:border-teal-300 transition-colors">
                                                        <label className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase tracking-widest mb-3">
                                                            <span className="text-sm">🔗</span>
                                                            Primary CTA URL
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={formData.primary_cta_url}
                                                            onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })}
                                                            disabled={isViewMode}
                                                            placeholder="/contact"
                                                            className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all")}
                                                        />
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}







                        <div className="bg-white rounded-xl border-2 border-orange-100 p-6">
                            <label className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase tracking-widest mb-3">
                                <span className="text-sm">🏢</span>
                                Brand
                            </label>
                            <select
                                value={formData.brand_id || 0}
                                onChange={(e) => setFormData({ ...formData, brand_id: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                            >
                                <option value={0}>Select Brand...</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* CTA Configuration */}
                    <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 p-6">
                        <h4 className="text-lg font-bold text-emerald-800 mb-4 flex items-center gap-2">
                            <span className="text-xl">🎯</span>
                            Call-to-Action Configuration
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-emerald-700 mb-2">CTA Label</label>
                                <input
                                    type="text"
                                    value={formData.primary_cta_label || ''}
                                    onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })}
                                    placeholder="Get Started"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-emerald-700 mb-2">CTA URL</label>
                                <input
                                    type="text"
                                    value={formData.primary_cta_url || ''}
                                    onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })}
                                    placeholder="/contact"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    {/* --- TAB: SUB-SERVICE MANAGER --- */ }
    {
        activeTab === 'SubServiceManager' && (
            <div className="space-y-8">
                {/* Sub-Services Table */}
                <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 rounded-2xl border-2 border-cyan-200 shadow-lg overflow-hidden">
                    <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 px-8 py-6 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="bg-white bg-opacity-20 p-2 rounded-lg text-xl">🔧</span>
                                <div>
                                    <h3 className="text-xl font-bold">Sub-Services ({subServicesList.length})</h3>
                                    <p className="text-cyan-100 text-sm">Manage and organize sub-services</p>
                                </div>
                            </div>
                            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
                                <span className="text-lg">+</span>
                                Add Sub-Service
                            </button>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Slug</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Keywords</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {subServicesList.map((subService, index) => (
                                            <tr key={subService.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-sm text-slate-900">{subService.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-slate-600 font-mono">{subService.slug}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-slate-600">{subService.keywords}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${subService.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {subService.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-900 font-medium">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-200">
                            <div className="text-sm text-slate-600">
                                {subServicesList.length} sub-services configured
                            </div>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                                    Save as Draft
                                </button>
                                <button className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                                    Create Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    {/* --- TAB: SEO & CONTENT --- */ }
    {
        activeTab === 'SEOContent' && (
            <div className="space-y-8">
                {/* Missing SEO Components Warning */}
                {showMissingSeoWarning && checkSeoCompleteness().length > 0 && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-red-800 mb-2">Missing SEO Components</h3>
                                <p className="text-red-700 text-sm mb-3">
                                    {checkSeoCompleteness().join(' and ')} {checkSeoCompleteness().length === 1 ? 'is' : 'are'} required for optimal SEO performance.
                                </p>
                                <button
                                    onClick={() => setShowMissingSeoWarning(false)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium underline"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SEO Metadata */}
                <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-slate-50 rounded-2xl border-2 border-green-200 shadow-lg overflow-hidden">
                    <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 text-white">
                        <div className="flex items-center gap-3">
                            <span className="bg-white bg-opacity-20 p-2 rounded-lg text-xl">🔍</span>
                            <div>
                                <h3 className="text-xl font-bold">SEO Optimization</h3>
                                <p className="text-green-100 text-sm">Meta tags, keywords, and search optimization</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Meta Title */}
                        <div className="bg-white rounded-xl border-2 border-green-100 p-6">
                            <label className="flex items-center justify-between mb-3">
                                <span className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-widest">
                                    <span className="text-sm">🏷️</span>
                                    Meta Title
                                    <span className="text-red-500 ml-1">*</span>
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-mono ${(formData.meta_title?.length || 0) > 60 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {formData.meta_title?.length || 0}/60 characters
                                </span>
                            </label>
                            <input
                                type="text"
                                value={formData.meta_title || ''}
                                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                placeholder="Sub-Service Name - Brand | Compelling Value Proposition"
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                        </div>

                        {/* Meta Description */}
                        <div className="bg-white rounded-xl border-2 border-emerald-100 p-6">
                            <label className="flex items-center justify-between mb-3">
                                <span className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-widest">
                                    <span className="text-sm">📝</span>
                                    Meta Description
                                    <span className="text-red-500 ml-1">*</span>
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-mono ${(formData.meta_description?.length || 0) > 160 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {formData.meta_description?.length || 0}/160 characters
                                </span>
                            </label>
                            <textarea
                                value={formData.meta_description || ''}
                                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                placeholder="Write a compelling summary that encourages clicks from search results. Include key benefits and a call-to-action."
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                                rows={3}
                            />
                        </div>

                        {/* Content Structure */}
                        <div className="bg-white rounded-xl border-2 border-indigo-100 p-6">
                            <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3">
                                <span className="text-sm">📄</span>
                                H1 Heading
                            </label>
                            <input
                                type="text"
                                value={formData.h1 || ''}
                                onChange={(e) => setFormData({ ...formData, h1: e.target.value })}
                                placeholder="Main page heading..."
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            />
                        </div>

                        {/* H2 and H3 Headings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* H2 Headings */}
                            <div className="bg-white rounded-xl border-2 border-blue-100 p-6">
                                <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                                    <span className="text-sm">📋</span>
                                    H2 Headings
                                </label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tempH2}
                                            onChange={(e) => setTempH2(e.target.value)}
                                            placeholder="Enter H2 heading..."
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHeading('h2', tempH2))}
                                        />
                                        <button
                                            onClick={() => addHeading('h2', tempH2)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                                        >
                                            + Add H2
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {h2Headings.map((heading, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <span className="text-sm text-blue-800">{heading}</span>
                                                <button
                                                    onClick={() => removeHeading('h2', index)}
                                                    className="text-blue-500 hover:text-blue-700 font-bold"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* H3 Headings */}
                            <div className="bg-white rounded-xl border-2 border-purple-100 p-6">
                                <label className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-widest mb-3">
                                    <span className="text-sm">📝</span>
                                    H3 Headings
                                </label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tempH3}
                                            onChange={(e) => setTempH3(e.target.value)}
                                            placeholder="Enter H3 heading..."
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addHeading('h3', tempH3))}
                                        />
                                        <button
                                            onClick={() => addHeading('h3', tempH3)}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                                        >
                                            + Add H3
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {h3Headings.map((heading, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                <span className="text-sm text-purple-800">{heading}</span>
                                                <button
                                                    onClick={() => removeHeading('h3', index)}
                                                    className="text-purple-500 hover:text-purple-700 font-bold"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Open Graph Settings */}
                        <div className="bg-white rounded-xl border-2 border-pink-100 p-6">
                            <h4 className="flex items-center gap-2 text-lg font-bold text-pink-700 mb-4">
                                <span className="text-xl">🌐</span>
                                Open Graph Settings
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* OG Title */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-pink-700 uppercase tracking-widest mb-2">
                                        OG Title
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.og_title || ''}
                                        onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                                        placeholder="Social media title..."
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all"
                                    />
                                </div>

                                {/* OG Description */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-pink-700 uppercase tracking-widest mb-2">
                                        OG Description
                                    </label>
                                    <textarea
                                        value={formData.og_description || ''}
                                        onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                                        placeholder="Social media description..."
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            {/* OG Image Upload */}
                            <div className="mt-6">
                                <label className="flex items-center gap-2 text-xs font-bold text-pink-700 uppercase tracking-widest mb-3">
                                    OG Image
                                </label>
                                <div className="border-2 border-dashed border-pink-300 rounded-xl p-6 text-center hover:border-pink-400 transition-colors">
                                    {ogImagePreview ? (
                                        <div className="space-y-4">
                                            <img src={ogImagePreview} alt="OG Image Preview" className="max-w-xs mx-auto rounded-lg shadow-md" />
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => {
                                                        setOgImageFile(null);
                                                        setOgImagePreview('');
                                                    }}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                                <label className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold hover:bg-pink-700 transition-colors cursor-pointer">
                                                    Replace
                                                    <input
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/jpg"
                                                        onChange={handleOgImageUpload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="text-4xl mb-3">📷</div>
                                            <p className="text-pink-700 font-medium mb-2">Click to upload or drag and drop</p>
                                            <p className="text-pink-500 text-sm mb-4">PNG, JPG up to 2MB (1200x630 recommended)</p>
                                            <label className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg font-bold hover:bg-pink-700 transition-colors cursor-pointer">
                                                Choose File
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/jpg"
                                                    onChange={handleOgImageUpload}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Schema Markup */}
                        <div className="bg-white rounded-xl border-2 border-amber-100 p-6">
                            <h4 className="flex items-center gap-2 text-lg font-bold text-amber-700 mb-4">
                                <span className="text-xl">🏗️</span>
                                Schema Markup
                            </h4>
                            <div className="space-y-4">
                                {/* Schema Type Selector */}
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">
                                        Schema Type
                                    </label>
                                    <div className="flex gap-2">
                                        {['Service', 'Product', 'Organization', 'Article'].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setSchemaType(type)}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${schemaType === type
                                                    ? 'bg-amber-600 text-white'
                                                    : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generate Schema Button */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={generateSchemaJson}
                                        className="px-6 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors"
                                    >
                                        Generate Schema JSON
                                    </button>
                                    <button
                                        onClick={() => {
                                            generateSchemaJson();
                                            // Placeholder for AI enhancement
                                            alert('AI enhancement feature coming soon!');
                                        }}
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
                                    >
                                        <span className="text-sm">✨</span>
                                        Enhance with AI
                                    </button>
                                </div>

                                {/* Schema JSON Display */}
                                {schemaJson && (
                                    <div>
                                        <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest mb-2">
                                            Schema JSON
                                        </label>
                                        <textarea
                                            value={schemaJson}
                                            onChange={(e) => setSchemaJson(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-slate-50 font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                                            rows={8}
                                            placeholder="Generated schema JSON will appear here..."
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Keywords */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Focus Keywords */}
                            <div className="bg-white rounded-xl border-2 border-blue-100 p-6">
                                <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                                    <span className="text-sm">🎯</span>
                                    Focus Keywords
                                </label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tempKeyword}
                                            onChange={(e) => setTempKeyword(e.target.value)}
                                            placeholder="Enter keyword..."
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('focus_keywords', tempKeyword, setTempKeyword))}
                                        />
                                        <button
                                            onClick={() => addToList('focus_keywords', tempKeyword, setTempKeyword)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(formData.focus_keywords || []).map((kw: string, index: number) => (
                                            <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs border border-blue-200 flex items-center gap-2">
                                                {kw}
                                                <button
                                                    onClick={() => removeFromList('focus_keywords', index)}
                                                    className="text-blue-500 hover:text-blue-700 font-bold"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Secondary Keywords */}
                            <div className="bg-white rounded-xl border-2 border-purple-100 p-6">
                                <label className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-widest mb-3">
                                    <span className="text-sm">🔍</span>
                                    Secondary Keywords
                                </label>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tempSecondaryKeyword}
                                            onChange={(e) => setTempSecondaryKeyword(e.target.value)}
                                            placeholder="Enter keyword..."
                                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword))}
                                        />
                                        <button
                                            onClick={() => addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword)}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(formData.secondary_keywords || []).map((kw: string, index: number) => (
                                            <span key={index} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs border border-purple-200 flex items-center gap-2">
                                                {kw}
                                                <button
                                                    onClick={() => removeFromList('secondary_keywords', index)}
                                                    className="text-purple-500 hover:text-purple-700 font-bold"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Keyword Mapping */}
                        <div className="bg-white rounded-xl border-2 border-teal-100 p-6">
                            <h4 className="flex items-center gap-2 text-lg font-bold text-teal-700 mb-4">
                                <span className="text-xl">🗺️</span>
                                Keyword Mapping
                            </h4>
                            <div className="space-y-4">
                                {(formData.focus_keywords || []).concat(formData.secondary_keywords || []).map((keyword: string, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-teal-50 rounded-lg border border-teal-200">
                                        <div className="flex-1">
                                            <div className="font-medium text-teal-800">{keyword}</div>
                                            <div className="text-xs text-teal-600 mt-1">{getKeywordMetric(keyword)}</div>
                                        </div>
                                        <div className="text-sm text-teal-600">
                                            {index < (formData.focus_keywords || []).length ? 'Primary' : 'Secondary'}
                                        </div>
                                    </div>
                                ))}
                                {((formData.focus_keywords || []).length + (formData.secondary_keywords || []).length) === 0 && (
                                    <div className="text-center py-8 text-slate-500">
                                        Add keywords above to see mapping
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                            <button
                                onClick={() => setViewMode('list')}
                                className="px-6 py-3 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                            >
                                {isViewMode ? 'Back to List' : 'Cancel'}
                            </button>
                            {!isViewMode && (
                                <>
                                    <button
                                        onClick={() => {
                                            const payload = { ...formData, status: 'Draft' };
                                            setFormData(payload);
                                            handleSave();
                                        }}
                                        className="px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-bold"
                                    >
                                        Save as Draft
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold"
                                    >
                                        {editingItem ? 'Update Service' : 'Create Service'}
                                    </button>
                                </>
                            )}
                            {isViewMode && editingItem && (
                                <button
                                    onClick={() => handleEdit(editingItem)}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold"
                                >
                                    Edit Service
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    {/* --- TAB: LINKED ASSETS & INSIGHTS --- */ }
    {
        activeTab === 'LinkedAssets' && (
            <div className="space-y-8">
                {/* Linked Insights Section */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 rounded-2xl border-2 border-blue-200 shadow-lg overflow-hidden">
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
                        <div className="flex items-center gap-3">
                            <span className="bg-white bg-opacity-20 p-2 rounded-lg text-xl">�</span>
                            <div>
                                <h3 className="text-xl font-bold">Linked Insights</h3>
                                <p className="text-blue-100 text-sm">Select and prioritize content insights</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Available Insights */}
                            <div className="space-y-3">
                                {linkedInsights.map(insight => (
                                    <label key={insight.id} className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-blue-300 transition-colors cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedInsights.includes(insight.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedInsights([...selectedInsights, insight.id]);
                                                } else {
                                                    setSelectedInsights(selectedInsights.filter(id => id !== insight.id));
                                                }
                                            }}
                                            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm text-slate-800">{insight.title}</div>
                                            <div className="text-xs text-slate-500">{insight.type}</div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${insight.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {insight.status}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            {/* Insight Order (Drag to reorder) */}
                            <div className="bg-white rounded-lg border-2 border-slate-200 p-4">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <span className="text-sm">📋</span>
                                    Insight Order (Drag to reorder)
                                </h4>
                                <div className="space-y-2">
                                    {selectedInsights.map((insightId, index) => {
                                        const insight = linkedInsights.find(i => i.id === insightId);
                                        return insight ? (
                                            <div key={insight.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">Insight #{index + 1}</div>
                                                    <div className="text-xs text-slate-500">Priority: {index + 1}</div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${insight.status === 'Ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {insight.status}
                                                </span>
                                            </div>
                                        ) : null;
                                    })}
                                    {selectedInsights.length === 0 && (
                                        <div className="text-center py-4 text-slate-500 text-sm">
                                            No insights selected
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 text-xs text-slate-500">
                                    {selectedInsights.length} insights selected
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Linked Assets Section */}
                <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-slate-50 rounded-2xl border-2 border-purple-200 shadow-lg overflow-hidden">
                    <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6 text-white">
                        <div className="flex items-center gap-3">
                            <span className="bg-white bg-opacity-20 p-2 rounded-lg text-xl">🔗</span>
                            <div>
                                <h3 className="text-xl font-bold">Linked Assets</h3>
                                <p className="text-purple-100 text-sm">Manage related assets and resources</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Available Assets */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-slate-800 mb-3">Available Assets</h4>
                                {[
                                    { id: 1, name: 'Image: Hero Banner', type: 'Image', selected: true },
                                    { id: 2, name: 'Icon: Service Logo', type: 'Icon', selected: false },
                                    { id: 3, name: 'PDF: Service Guide', type: 'PDF', selected: false },
                                    { id: 4, name: 'Infographic: Stats', type: 'Infographic', selected: false },
                                    { id: 5, name: 'Video: Demo', type: 'Video', selected: true },
                                    { id: 6, name: 'Template: Proposal', type: 'Template', selected: false }
                                ].map(asset => (
                                    <label key={asset.id} className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-purple-300 transition-colors cursor-pointer">
                                        <input
                                            type="checkbox"
                                            defaultChecked={asset.selected}
                                            className="w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm text-slate-800">{asset.name}</div>
                                            <div className="text-xs text-slate-500">{asset.type}</div>
                                        </div>
                                        <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center">
                                            {asset.type === 'Image' && '🖼️'}
                                            {asset.type === 'Icon' && '🎯'}
                                            {asset.type === 'PDF' && '📄'}
                                            {asset.type === 'Infographic' && '📊'}
                                            {asset.type === 'Video' && '🎥'}
                                            {asset.type === 'Template' && '📋'}
                                        </div>
                                    </label>
                                ))}
                                <div className="text-xs text-slate-500 mt-3">
                                    1 assets selected
                                </div>
                            </div>

                            {/* Promotional Readiness */}
                            <div className="bg-white rounded-lg border-2 border-slate-200 p-6">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span className="text-lg">🚀</span>
                                    Promotional Readiness
                                </h4>

                                <div className="space-y-4">
                                    {/* Content Ready */}
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="font-medium text-sm">Content Ready</span>
                                        </div>
                                        <span className="text-sm font-bold text-green-700">Yes</span>
                                    </div>

                                    {/* Assets Ready */}
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span className="font-medium text-sm">Assets Ready</span>
                                        </div>
                                        <span className="text-sm font-bold text-green-700">Yes</span>
                                    </div>

                                    {/* SEO Score */}
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                            <span className="font-medium text-sm">SEO Score</span>
                                        </div>
                                        <span className="text-sm font-bold text-orange-700">75%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    {/* Fixed Footer */ }
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <button
                onClick={() => setViewMode('list')}
                className="px-6 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
                Cancel
            </button>
            <div className="flex gap-3">
                <button
                    onClick={() => {
                        // Save as draft logic
                        setFormData({ ...formData, status: 'Draft' });
                        handleSave();
                    }}
                    className="px-6 py-2 text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors font-medium flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Save as Draft
                </button>
                <button
                    onClick={handleSave}
                    className="px-8 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create Service
                </button>
            </div>
        </div>
    </div>

    return (
        <div className="space-y-6 animate-fade-in w-full h-full overflow-y-auto p-6 ui-surface">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sub-Service Master</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage sub-service offerings linked to main services</p>
                </div>
                <div className="flex items-center space-x-3">
                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh data from server"
                    >
                        <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        className="text-slate-600 bg-white border border-slate-300 px-4 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors hover:bg-slate-50 flex items-center gap-2"
                        title={`Export ${filteredData.length} filtered sub-services to CSV`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export
                    </button>

                    {/* Add Sub-Service Button */}
                    <button
                        onClick={handleCreateClick}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center"
                    >
                        <span className="mr-1 text-lg">+</span> Add New Sub-Service
                    </button>
                </div>
            </div>

            {/* Enhanced Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                    </svg>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Filters & Search</h3>
                    <div className="flex-1"></div>
                    {(searchQuery || parentFilter !== 'All Parent Services' || statusFilter !== 'All Status' || contentTypeFilter !== 'All Types' || brandFilter !== 'All Brands' || industryFilter !== 'All Industries') && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setParentFilter('All Parent Services');
                                setStatusFilter('All Status');
                                setContentTypeFilter('All Types');
                                setBrandFilter('All Brands');
                                setIndustryFilter('All Industries');
                            }}
                            className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors flex items-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear All Filters
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Main Search */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            className="block w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-all"
                            placeholder="Search by name, code, slug, description, or content... (Ctrl+K)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.ctrlKey && e.key === 'k') {
                                    e.preventDefault();
                                    e.currentTarget.focus();
                                }
                            }}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Filter Row */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Parent Service Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-slate-600">Parent:</label>
                            <div className="relative">
                                <select
                                    value={parentFilter}
                                    onChange={(e) => setParentFilter(e.target.value)}
                                    className="bg-slate-50 border border-slate-300 text-sm rounded-lg py-2.5 px-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer min-w-[160px]"
                                >
                                    <option value="All Parent Services">All Parent Services</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.service_name}>{s.service_name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-slate-600">Status:</label>
                            <div className="relative">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-slate-50 border border-slate-300 text-sm rounded-lg py-2.5 px-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer min-w-[120px]"
                                >
                                    {STATUSES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Content Type Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-medium text-slate-600">Type:</label>
                            <div className="relative">
                                <select
                                    value={contentTypeFilter}
                                    onChange={(e) => setContentTypeFilter(e.target.value)}
                                    className="bg-slate-50 border border-slate-300 text-sm rounded-lg py-2.5 px-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer min-w-[120px]"
                                >
                                    <option value="All Types">All Types</option>
                                    {availableContentTypes.map(type => (
                                        <option key={type.id} value={type.content_type}>{type.content_type}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Brand Filter */}
                        {brands.length > 0 && (
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium text-slate-600">Brand:</label>
                                <div className="relative">
                                    <select
                                        value={brandFilter}
                                        onChange={(e) => setBrandFilter(e.target.value)}
                                        className="bg-slate-50 border border-slate-300 text-sm rounded-lg py-2.5 px-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer min-w-[120px]"
                                    >
                                        <option value="All Brands">All Brands</option>
                                        {brands.map(brand => (
                                            <option key={brand.id} value={brand.name}>{brand.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Industry Filter */}
                        {industrySectors.length > 0 && (
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-medium text-slate-600">Industry:</label>
                                <div className="relative">
                                    <select
                                        value={industryFilter}
                                        onChange={(e) => setIndustryFilter(e.target.value)}
                                        className="bg-slate-50 border border-slate-300 text-sm rounded-lg py-2.5 px-3 pr-8 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer min-w-[140px]"
                                    >
                                        <option value="All Industries">All Industries</option>
                                        {[...new Set(industrySectors.map(sector => sector.industry))].map(industry => (
                                            <option key={industry} value={industry}>{industry}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Filters */}
                        <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                            <label className="text-xs font-medium text-slate-600">Quick:</label>
                            <button
                                onClick={() => setStatusFilter('Published')}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full hover:bg-green-200 transition-colors"
                            >
                                Published
                            </button>
                            <button
                                onClick={() => setStatusFilter('Draft')}
                                className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full hover:bg-yellow-200 transition-colors"
                            >
                                Drafts
                            </button>
                            <button
                                onClick={() => setStatusFilter('QC')}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
                            >
                                In QC
                            </button>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setParentFilter('All Parent Services');
                                    setStatusFilter('All Status');
                                    setContentTypeFilter('All Types');
                                    setBrandFilter('All Brands');
                                    setIndustryFilter('All Industries');
                                }}
                                className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full hover:bg-slate-200 transition-colors"
                            >
                                Show All
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-slate-600">
                                Showing <span className="font-bold text-slate-900">{filteredData.length}</span> of <span className="font-bold text-slate-900">{subServices.length}</span> sub-services
                            </span>
                            {filteredData.length !== subServices.length && (
                                <span className="text-indigo-600 font-medium">
                                    {subServices.length - filteredData.length} filtered out
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                            {filteredData.length} results
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-3 text-slate-500">
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span className="text-sm font-medium">Loading services...</span>
                        </div>
                    </div>
                )}
                {!loading && (
                    <Table
                        columns={[
                            {
                                header: 'Service Name',
                                accessor: (item: SubServiceItem) => {
                                    const parent = services.find(s => s.id === item.parent_service_id);
                                    return (
                                        <div>
                                            <div className="font-bold text-slate-800 text-sm hover:text-indigo-600 transition-colors">
                                                {parent?.service_name || '-'}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {item.sub_service_name}
                                            </div>
                                        </div>
                                    );
                                }
                            },
                            {
                                header: 'Service Code',
                                accessor: (item: SubServiceItem) => {
                                    const parent = services.find(s => s.id === item.parent_service_id);
                                    return (
                                        <div>
                                            <div className="font-mono text-xs text-slate-700 font-bold">
                                                {parent?.service_code || '-'}
                                            </div>
                                            {item.sub_service_code && (
                                                <div className="text-xs text-slate-500 font-mono mt-0.5">
                                                    {item.sub_service_code}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                            },
                            {
                                header: 'Industry',
                                accessor: (item: SubServiceItem) => {
                                    const parent = services.find(s => s.id === item.parent_service_id);
                                    const industryIds = parent?.industry_ids || [];
                                    return (
                                        <Tooltip content="Industry classification">
                                            <div className="text-xs">
                                                {industryIds.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {industryIds.slice(0, 2).map((industryId, index) => (
                                                            <span key={index} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">
                                                                {industryId}
                                                            </span>
                                                        ))}
                                                        {industryIds.length > 2 && (
                                                            <span className="text-slate-500">+{industryIds.length - 2}</span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </div>
                                        </Tooltip>
                                    );
                                }
                            },
                            {
                                header: 'Sector',
                                accessor: (item: SubServiceItem) => {
                                    const parent = services.find(s => s.id === item.parent_service_id);
                                    return (
                                        <Tooltip content="Business sector">
                                            <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100">
                                                {parent?.business_unit || 'General'}
                                            </span>
                                        </Tooltip>
                                    );
                                }
                            },
                            {
                                header: 'Sub-Services',
                                accessor: (item: SubServiceItem) => {
                                    const parent = services.find(s => s.id === item.parent_service_id);
                                    const siblingCount = subServices.filter(s => s.parent_service_id === item.parent_service_id).length;
                                    return (
                                        <Tooltip content={`Total sub-services under ${parent?.service_name || 'this service'}`}>
                                            <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-xs font-bold border border-purple-100">
                                                {siblingCount}
                                            </span>
                                        </Tooltip>
                                    );
                                },
                                className: "text-center"
                            },
                            {
                                header: 'Linked Assets',
                                accessor: (item: SubServiceItem) => {
                                    // Count assets from both Content Repository and Asset Library
                                    const contentCount = contentAssets.filter(a => a.linked_sub_service_ids?.includes(item.id)).length;
                                    const libraryCount = libraryAssets.filter(a => {
                                        const links = Array.isArray(a.linked_sub_service_ids) ? a.linked_sub_service_ids : [];
                                        return links.map(String).includes(String(item.id));
                                    }).length;
                                    const count = contentCount + libraryCount;
                                    return (
                                        <Tooltip content={`Total assets linked: ${libraryCount} from Asset Library + ${contentCount} from Content Repository`}>
                                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold border border-indigo-100">
                                                {count}
                                            </span>
                                        </Tooltip>
                                    );
                                },
                                className: "text-center"
                            },

                            {
                                header: 'Linked Insights',
                                accessor: (item: SubServiceItem) => {
                                    // Calculate insights based on keywords and content
                                    const keywordCount = (item.focus_keywords?.length || 0) + (item.secondary_keywords?.length || 0);
                                    const hasContent = !!(item.body_content || item.h1 || item.meta_description);
                                    const insightScore = keywordCount + (hasContent ? 1 : 0);

                                    return (
                                        <Tooltip content={`Insights: ${keywordCount} keywords, ${hasContent ? 'has content' : 'no content'}`}>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${insightScore > 3 ? 'bg-green-50 text-green-700 border-green-100' :
                                                insightScore > 1 ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                    'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {insightScore}
                                            </span>
                                        </Tooltip>
                                    );
                                },
                                className: "text-center"
                            },
                            {
                                header: 'Health Score',
                                accessor: (item: SubServiceItem) => {
                                    // Calculate health score based on completeness
                                    let score = 0;
                                    if (item.sub_service_name) score += 20;
                                    if (item.slug) score += 15;
                                    if (item.meta_title) score += 15;
                                    if (item.meta_description) score += 15;
                                    if (item.h1) score += 10;
                                    if (item.focus_keywords && item.focus_keywords.length > 0) score += 15;
                                    if (item.body_content) score += 10;

                                    const getScoreColor = (score: number) => {
                                        if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
                                        if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                                        if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-200';
                                        return 'bg-red-100 text-red-800 border-red-200';
                                    };

                                    return (
                                        <Tooltip content="Health score based on content completeness">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getScoreColor(score)}`}>
                                                    {score}%
                                                </span>
                                                <div className="w-8 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all ${score >= 80 ? 'bg-green-500' :
                                                            score >= 60 ? 'bg-yellow-500' :
                                                                score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                                                            }`}
                                                        style={{ width: `${score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </Tooltip>
                                    );
                                },
                                className: "text-center"
                            },
                            {
                                header: 'Status',
                                accessor: (item: SubServiceItem) => getStatusBadge(item.status)
                            },
                            {
                                header: 'Updated At',
                                accessor: (item: SubServiceItem) => {
                                    const date = item.updated_at ? new Date(item.updated_at) : null;
                                    return (
                                        <Tooltip content={date ? date.toLocaleString() : 'No update date'}>
                                            <div className="text-xs text-slate-500">
                                                {date ? (
                                                    <>
                                                        <div>{date.toLocaleDateString()}</div>
                                                        <div className="text-xs text-slate-400">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                    </>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </div>
                                        </Tooltip>
                                    );
                                }
                            },
                            {
                                header: 'Actions',
                                accessor: (item: SubServiceItem) => (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleView(item)}
                                            className="text-slate-500 hover:text-blue-600 font-medium text-xs transition-colors"
                                        >
                                            View
                                        </button>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-slate-500 hover:text-indigo-600 font-medium text-xs transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-slate-500 hover:text-red-600 font-medium text-xs transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )
                            }
                        ]}
                        data={filteredData}
                        title={`Sub-Service Registry (${filteredData.length})`}
                    />
                )}
                {!loading && filteredData.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                        <svg className="w-12 h-12 mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-slate-700 mb-2">No Sub-Services Found</h3>
                        <p className="text-sm text-slate-500 mb-4">Get started by creating your first sub-service</p>
                        <button
                            onClick={handleCreateClick}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                        >
                            Create Sub-Service
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubServiceMasterView;

