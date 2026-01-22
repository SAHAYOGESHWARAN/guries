
import React, { useState, useMemo } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import SocialMetaForm from '../components/SocialMetaForm';
import ServiceAssetLinker from '../components/ServiceAssetLinker';
import LinkedInsightsSelector from '../components/LinkedInsightsSelector';
import LinkedAssetsSelector from '../components/LinkedAssetsSelector';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { Service, SubServiceItem, ContentRepositoryItem, AssetLibraryItem, User, Brand, Campaign, IndustrySectorItem, CountryMasterItem, Keyword, ContentTypeItem, PersonaMasterItem, FormMasterItem, ServiceLink, ServiceImage, FAQItem } from '../types';

const SERVICE_STATUS_OPTIONS = ['Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'] as const;
const FALLBACK_CONTENT_TYPES: ContentTypeItem[] = [
    { id: 1, content_type: 'Pillar', category: 'Core', description: 'Long-form primary page', default_attributes: [], status: 'active' },
    { id: 2, content_type: 'Cluster', category: 'Supporting', description: 'Supporting topic page', default_attributes: [], status: 'active' },
    { id: 3, content_type: 'Landing', category: 'Conversion', description: 'Campaign landing page', default_attributes: [], status: 'active' },
    { id: 4, content_type: 'Blog', category: 'Editorial', description: 'Blog article', default_attributes: [], status: 'active' },
    { id: 5, content_type: 'Case Study', category: 'Proof', description: 'Customer story', default_attributes: [], status: 'active' },
    { id: 6, content_type: 'Sales Page', category: 'Conversion', description: 'Bottom-funnel page', default_attributes: [], status: 'active' }
];

// Helper function to generate service code from service name
const generateServiceCode = (serviceName: string): string => {
    if (!serviceName || serviceName.trim() === '') return '';
    const initials = serviceName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 3);
    const timestamp = Date.now().toString().slice(-4);
    return `${initials}-${timestamp}`;
};

const SubServiceMasterView: React.FC = () => {
    const { data: subServices = [], create, update, remove, refresh: refreshSubServices } = useData<SubServiceItem>('subServices');
    const { data: services = [], refresh: refreshServices } = useData<Service>('services');
    const { data: contentAssets = [], update: updateContentAsset, refresh: refreshContentAssets } = useData<ContentRepositoryItem>('content');
    const { data: libraryAssets = [], update: updateLibraryAsset, refresh: refreshLibraryAssets } = useData<AssetLibraryItem>('assetLibrary');
    const { data: keywordsMaster = [] } = useData<Keyword>('keywords');

    // Master Data for Dropdowns/Selectors
    const { data: users = [] } = useData<User>('users');
    const { data: brands = [] } = useData<Brand>('brands');
    const { data: campaigns = [] } = useData<Campaign>('campaigns');
    const { data: industries = [] } = useData<IndustrySectorItem>('industrySectors');
    const { data: countries = [] } = useData<CountryMasterItem>('countries');
    const { data: contentTypes = [] } = useData<ContentTypeItem>('contentTypes');
    const { data: personas = [] } = useData<PersonaMasterItem>('personas');
    const { data: forms = [] } = useData<FormMasterItem>('forms');

    const brandsLoaded = Array.isArray(brands) && brands.length > 0;

    // UI State
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [industryFilter, setIndustryFilter] = useState('All Industries');
    const [sectorFilter, setSectorFilter] = useState('All Sectors');
    const [contentTypeFilter, setContentTypeFilter] = useState('All Types');
    const [brandFilter, setBrandFilter] = useState('All Brands');
    const [editingItem, setEditingItem] = useState<SubServiceItem | null>(null);
    const [activeTab, setActiveTab] = useState<'Core' | 'Navigation' | 'Strategic' | 'Content' | 'SEO' | 'SMM' | 'Technical' | 'Linking' | 'Governance'>('Core');
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isFormLoading, setIsFormLoading] = useState(false);

    // Asset Picker State within Full Frame
    const [assetSearch, setAssetSearch] = useState('');
    const [repositoryFilter, setRepositoryFilter] = useState('All');

    const createInitialFormState = (): Partial<SubServiceItem> => ({
        sub_service_name: '', sub_service_code: '', slug: '', full_url: '',
        description: '', status: 'Draft', language: 'en',
        menu_group: '', menu_position: 0,
        show_in_main_menu: false, show_in_footer_menu: false,
        parent_menu_section: '',
        include_in_xml_sitemap: true,
        industry_ids: [], country_ids: [],
        linked_campaign_ids: [],
        linked_insights_ids: [],
        linked_assets_ids: [],
        h1: '', h2_list: [], h3_list: [], h4_list: [], h5_list: [], body_content: '',
        internal_links: [], external_links: [], image_alt_texts: [],
        word_count: 0, reading_time_minutes: 0,
        meta_title: '', meta_description: '', focus_keywords: [], secondary_keywords: [],
        seo_score: 0, ranking_summary: '',
        og_title: '', og_description: '', og_image_url: '', og_type: 'website',
        twitter_title: '', twitter_description: '', twitter_image_url: '',
        social_meta: {
            linkedin: { title: '', description: '', image_url: '' },
            facebook: { title: '', description: '', image_url: '' },
            instagram: { title: '', description: '', image_url: '' }
        },
        schema_type_id: 'Service', robots_index: 'index', robots_follow: 'follow', robots_custom: '',
        canonical_url: '', redirect_from_urls: [], hreflang_group_id: undefined,
        core_web_vitals_status: 'Good', tech_seo_status: 'Ok',
        sitemap_priority: 0.8, sitemap_changefreq: 'monthly',
        faq_section_enabled: false, faq_content: [],
        content_type: 'Pillar',
        category: '',
        buyer_journey_stage: 'Awareness',
        target_segment_notes: '',
        primary_persona_id: undefined,
        secondary_persona_ids: [],
        form_id: undefined,
        primary_cta_label: '', primary_cta_url: '',
        brand_id: 0,
        business_unit: '',
        content_owner_id: 0,
        created_by: undefined,
        updated_by: undefined,
        version_number: 1,
        change_log_link: '',
        parent_service_id: undefined,
        breadcrumb_label: '',
        strategic_notes: ''
    });

    // Form State
    const [formData, setFormData] = useState<Partial<SubServiceItem>>(() => createInitialFormState());

    // Helper inputs
    const [tempH2, setTempH2] = useState('');
    const [tempH3, setTempH3] = useState('');
    const [tempH4, setTempH4] = useState('');
    const [tempH5, setTempH5] = useState('');
    const [tempKeyword, setTempKeyword] = useState('');
    const [tempSecondaryKeyword, setTempSecondaryKeyword] = useState('');
    const [tempRedirect, setTempRedirect] = useState('');
    const [tempInternalLink, setTempInternalLink] = useState<ServiceLink>({ anchor_text: '', url: '', rel: '', target_type: '' });
    const [tempExternalLink, setTempExternalLink] = useState<ServiceLink>({ anchor_text: '', url: '', rel: '', target_type: '' });
    const [tempImage, setTempImage] = useState<ServiceImage>({ url: '', alt_text: '', context: '' });
    const [tempFaq, setTempFaq] = useState<FAQItem>({ question: '', answer: '' });

    // Computed Data
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const filteredData = subServices.filter(item => {
        const matchesSearch = !normalizedQuery || [
            item.sub_service_name,
            item.sub_service_code,
            item.full_url,
            item.description,
            item.business_unit
        ].some(value => (value || '').toLowerCase().includes(normalizedQuery));

        const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
        const matchesContentType = contentTypeFilter === 'All Types' || item.content_type === contentTypeFilter;
        const matchesBrand = brandFilter === 'All Brands' || (item.brand_id && brands.find(b => b.id === item.brand_id)?.name === brandFilter);

        // Industry filter - check if any of the service's industry_ids match the selected industry
        const matchesIndustry = industryFilter === 'All Industries' ||
            (Array.isArray(item.industry_ids) && item.industry_ids.some(industryId => {
                const industry = industries.find(ind => ind.id === parseInt(industryId));
                return industry?.industry === industryFilter;
            }));

        // Sector filter - check business_unit field
        const matchesSector = sectorFilter === 'All Sectors' || item.business_unit === sectorFilter;

        return matchesSearch && matchesStatus && matchesContentType && matchesBrand && matchesIndustry && matchesSector;
    });

    // Linked and Available Assets from Asset Library
    const linkedLibraryAssets = useMemo(() => {
        if (!editingItem) return [];
        return libraryAssets.filter(a => {
            const links = Array.isArray(a.linked_service_ids) ? a.linked_service_ids : [];
            return links.map(String).includes(String(editingItem.id));
        });
    }, [libraryAssets, editingItem]);

    const availableLibraryAssets = useMemo(() => {
        if (!editingItem) return [];
        const searchLower = assetSearch.toLowerCase().trim();
        return libraryAssets
            .filter(a => {
                // Check if asset is not already linked
                const links = Array.isArray(a.linked_service_ids) ? a.linked_service_ids : [];
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

    // Legacy: Content Repository Assets (for backward compatibility)
    const linkedAssets = useMemo(() => {
        if (!editingItem) return [];
        return contentAssets.filter(a => {
            const links = Array.isArray(a.linked_service_ids) ? a.linked_service_ids : [];
            return links.map(String).includes(String(editingItem.id));
        });
    }, [contentAssets, editingItem]);

    const availableAssets = useMemo(() => {
        if (!editingItem) return [];
        const searchLower = assetSearch.toLowerCase().trim();
        return contentAssets
            .filter(a => {
                // Check if asset is not already linked
                const links = Array.isArray(a.linked_service_ids) ? a.linked_service_ids : [];
                const isLinked = links.map(String).includes(String(editingItem.id));
                if (isLinked) return false;

                // Check if asset matches search query (if any)
                if (!searchLower) return true;
                const title = (a.content_title_clean || '').toLowerCase();
                const assetType = (a.asset_type || '').toLowerCase();
                const status = (a.status || '').toLowerCase();
                return title.includes(searchLower) || assetType.includes(searchLower) || status.includes(searchLower);
            })
            .slice(0, 20); // Increased limit to show more results
    }, [contentAssets, editingItem, assetSearch]);

    const availableContentTypes = contentTypes.length ? contentTypes : FALLBACK_CONTENT_TYPES;

    // Usage Metrics - Automatic calculation
    const getKeywordUsageCount = (serviceId: number) => {
        return keywordsMaster.filter(k => k.mapped_service === String(serviceId)).length;
    };

    const getLinkedAssetsCount = (serviceId: number) => {
        const contentCount = contentAssets.filter(a => {
            const links = Array.isArray(a.linked_service_ids) ? a.linked_service_ids : [];
            return links.map(String).includes(String(serviceId));
        }).length;
        const libraryCount = libraryAssets.filter(a => {
            const links = Array.isArray(a.linked_service_ids) ? a.linked_service_ids : [];
            return links.map(String).includes(String(serviceId));
        }).length;
        return contentCount + libraryCount;
    };

    const getSubServicesCount = (serviceId: number) => {
        return subServices.filter((s: any) => s.parent_service_id === serviceId).length;
    };

    // Handlers
    const handleCreateClick = () => {
        setIsFormLoading(true);
        setEditingItem(null);
        const initialState = createInitialFormState();
        setFormData(initialState);
        setActiveTab('Core');
        setViewMode('form');
        // Simulate form loading to prevent UI freeze
        setTimeout(() => setIsFormLoading(false), 50);
    };

    const handleEdit = (item: SubServiceItem) => {
        setIsFormLoading(true);
        setEditingItem(item);
        setFormData({
            ...item,
            full_url: item.full_url || '',
            menu_group: item.menu_group || '',
            business_unit: item.business_unit || '',
            h2_list: item.h2_list || [],
            h3_list: item.h3_list || [],
            h4_list: item.h4_list || [],
            h5_list: item.h5_list || [],
            focus_keywords: item.focus_keywords || [],
            secondary_keywords: item.secondary_keywords || [],
            industry_ids: item.industry_ids || [],
            country_ids: item.country_ids || [],
            linked_campaign_ids: item.linked_campaign_ids || [],
            linked_insights_ids: item.linked_insights_ids || [],
            linked_assets_ids: item.linked_assets_ids || [],
            faq_content: item.faq_content || [],
            internal_links: item.internal_links || [],
            external_links: item.external_links || [],
            image_alt_texts: item.image_alt_texts || [],
            word_count: item.word_count || 0,
            reading_time_minutes: item.reading_time_minutes || 0,
            redirect_from_urls: item.redirect_from_urls || [],
            parent_menu_section: item.parent_menu_section || '',
            secondary_persona_ids: item.secondary_persona_ids || [],
            primary_persona_id: item.primary_persona_id ?? undefined,
            target_segment_notes: item.target_segment_notes || '',
            form_id: item.form_id ?? undefined,
            include_in_xml_sitemap: typeof item.include_in_xml_sitemap === 'boolean' ? item.include_in_xml_sitemap : true,
            sitemap_priority: item.sitemap_priority || 0.8,
            sitemap_changefreq: item.sitemap_changefreq || 'monthly',
            core_web_vitals_status: item.core_web_vitals_status || 'Good',
            tech_seo_status: item.tech_seo_status || 'Ok',
            og_type: item.og_type || 'website',
            og_image_url: item.og_image_url || '',
            twitter_image_url: item.twitter_image_url || '',
            social_meta: item.social_meta || {
                linkedin: { title: '', description: '', image_url: '' },
                facebook: { title: '', description: '', image_url: '' },
                instagram: { title: '', description: '', image_url: '' }
            },
            robots_custom: item.robots_custom || '',
            hreflang_group_id: item.hreflang_group_id ?? undefined,
            faq_section_enabled: item.faq_section_enabled || false,
            brand_id: item.brand_id || 0,
            content_owner_id: item.content_owner_id || 0,
            created_by: item.created_by ?? undefined,
            updated_by: item.updated_by ?? undefined,
            version_number: item.version_number || 1,
            change_log_link: item.change_log_link || '',
            primary_cta_label: item.primary_cta_label || '',
            primary_cta_url: item.primary_cta_url || '',
            parent_service_id: item.parent_service_id ?? undefined,
            breadcrumb_label: item.breadcrumb_label || '',
            strategic_notes: item.strategic_notes || ''
        });
        setActiveTab('Core');
        setViewMode('form');
        setTimeout(() => setIsFormLoading(false), 50);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Delete this service?')) await remove(id);
    };

    const handleSave = async () => {
        if (!formData.sub_service_name) return alert("Sub-Service Name is required");
        const now = new Date().toISOString();
        const payload = { ...formData, updated_at: now };

        if (formData.slug && !formData.full_url) {
            payload.full_url = `/sub-services/${formData.slug}`;
        }

        if (editingItem) {
            await update(editingItem.id, payload);
        } else {
            // Auto-generate created_at for new items
            payload.created_at = now;
            await create(payload as any);
        }
        setViewMode('list');
    };

    const handleSlugChange = (val: string) => {
        const slug = val.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
        setFormData(prev => ({ ...prev, slug, full_url: `/services/${slug}` }));
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

    // List Management
    const addToList = (field: keyof SubServiceItem, value: any, setter?: any) => {
        if (!value) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...(prev[field] as any[] || []), value]
        }));
        if (setter) setter('');
    };

    const removeFromList = (field: keyof SubServiceItem, index: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: (prev[field] as any[]).filter((_, i) => i !== index)
        }));
    };

    const addLink = (field: 'internal_links' | 'external_links', link: ServiceLink, setter: React.Dispatch<React.SetStateAction<ServiceLink>>) => {
        if (!link.anchor_text?.trim() || !link.url?.trim()) return;
        setFormData(prev => ({
            ...prev,
            [field]: [...((prev[field] as ServiceLink[]) || []), link]
        }));
        setter({ anchor_text: '', url: '', rel: '', target_type: '' });
    };

    const addImageAlt = (image: ServiceImage) => {
        if (!image.url?.trim() || !image.alt_text?.trim()) return;
        setFormData(prev => ({
            ...prev,
            image_alt_texts: [...((prev.image_alt_texts as ServiceImage[]) || []), image]
        }));
        setTempImage({ url: '', alt_text: '', context: '' });
    };

    const addFaqItem = (faq: FAQItem) => {
        if (!faq.question?.trim() || !faq.answer?.trim()) return;
        setFormData(prev => ({
            ...prev,
            faq_content: [...((prev.faq_content as FAQItem[]) || []), faq]
        }));
        setTempFaq({ question: '', answer: '' });
    };

    const toggleSelection = (field: 'industry_ids' | 'country_ids' | 'linked_campaign_ids' | 'secondary_persona_ids', id: string | number) => {
        const current = (formData[field] as any[]) || [];
        const exists = current.includes(id);
        const updated = exists
            ? current.filter(i => i !== id)
            : [...current, id];
        setFormData({ ...formData, [field]: updated });
    };

    const handleToggleContentLink = async (asset: ContentRepositoryItem) => {
        if (!editingItem) return;
        const currentLinks = Array.isArray(asset.linked_service_ids) ? asset.linked_service_ids : [];
        const isLinked = currentLinks.map(String).includes(String(editingItem.id));
        const newLinks = isLinked
            ? currentLinks.filter(id => String(id) !== String(editingItem.id))
            : [...currentLinks, editingItem.id];

        try {
            // Update the asset with new links - the useData hook now updates state immediately
            await updateContentAsset(asset.id, { linked_service_ids: newLinks });

            // Force a refresh to ensure we have the latest data
            await refreshContentAssets();
        } catch (e) {
            console.error('Content link update error:', e);
            // Even if there's an error, try to refresh to show current state
            try {
                await refreshContentAssets();
            } catch (refreshError) {
                console.error('Refresh error:', refreshError);
            }
        }
    };

    const handleToggleLibraryLink = async (asset: AssetLibraryItem) => {
        if (!editingItem) return;
        const currentLinks = Array.isArray(asset.linked_service_ids) ? asset.linked_service_ids : [];
        const isLinked = currentLinks.map(String).includes(String(editingItem.id));
        const newLinks = isLinked
            ? currentLinks.filter(id => String(id) !== String(editingItem.id))
            : [...currentLinks, editingItem.id];

        try {
            // Update the library asset with new links
            await updateLibraryAsset(asset.id, { linked_service_ids: newLinks });

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

    const getKeywordMetric = (kw: string) => {
        const serviceUsage = services.reduce((acc, s) => {
            if (s.id === editingItem?.id) return acc;
            return acc + (s.focus_keywords?.includes(kw) ? 1 : 0);
        }, 0);

        const masterRecord = keywordsMaster.find(k => k.keyword.toLowerCase() === kw.toLowerCase());
        const vol = masterRecord ? masterRecord.search_volume.toLocaleString() : 'N/A';
        const comp = masterRecord ? masterRecord.competition_score : '-';

        return `Vol: ${vol} | Comp: ${comp}`;
    };

    const handleKeywordSuggest = () => alert('AI keyword suggestion coming soon.');
    const handleSecondaryKeywordSuggest = () => alert('AI keyword suggestion coming soon.');

    // Global keyboard shortcuts
    React.useEffect(() => {
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

    const handleExport = () => {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `services_master_export_${timestamp}`;
        exportToCSV(filteredData, filename);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshServices();
            // Also refresh related data
            await refreshContentAssets();
            await refreshLibraryAssets();
        } catch (error) {
            console.error('Refresh failed:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const tabs = [
        { id: 'Core', label: 'Core', icon: '💎' },
        { id: 'Navigation', label: 'Navigation', icon: '🧭' },
        { id: 'Strategic', label: 'Strategic', icon: '🎯' },
        { id: 'Content', label: 'Content', icon: '📝' },
        { id: 'SEO', label: 'SEO', icon: '🔍' },
        { id: 'SMM', label: 'SMM', icon: '📢' },
        { id: 'Technical', label: 'Technical', icon: '⚙️' },
        { id: 'Linking', label: 'Linking', icon: '🔗' },
        { id: 'Governance', label: 'Governance', icon: '⚖️' }
    ];

    if (viewMode === 'form') {
        return (
            <div className="fixed inset-x-0 bottom-0 top-16 z-[60] bg-white flex flex-col overflow-hidden animate-slide-up">
                {isFormLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                            <p className="text-sm font-medium text-slate-600">Loading form...</p>
                        </div>
                    </div>
                )}
                {/* Full-Frame Header */}
                <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-white shadow-sm z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode('list')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">{editingItem ? `Edit Sub-Service: ${editingItem.sub_service_name}` : 'Create New Sub-Service'}</h2>
                            <div className="flex items-center text-xs text-slate-500 mt-1">
                                <span className="font-mono bg-slate-100 px-1.5 rounded">{editingItem?.sub_service_code || 'NEW'}</span>
                                <span className="mx-2">•</span>
                                <span>{formData.language?.toUpperCase()}</span>
                                <span className="mx-2">•</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${formData.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {formData.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setViewMode('list')} className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">Discard</button>
                        <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors">Save Sub-Service</button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 px-6 bg-white flex-shrink-0 z-30">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-all flex items-center ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                                    }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                    {!isFormLoading ? (
                        <div className="max-w-7xl mx-auto space-y-8 pb-20">
                            {/* Only render active tab to prevent performance issues */}
                            {/* --- TAB: CORE --- */}
                            {activeTab === 'Core' && (
                                <div className="space-y-10">
                                    {/* 1. SERVICE IDENTITY CARD */}
                                    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50 rounded-2xl border-2 border-indigo-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        {/* Header with Icon Background */}
                                        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white overflow-hidden">
                                            <div className="absolute top-0 right-0 opacity-10">
                                                <span className="text-9xl">🏷️</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">💎</span>
                                                    <h3 className="text-2xl font-bold">Service Identity</h3>
                                                </div>
                                                <p className="text-indigo-100 text-sm">Core naming and classification</p>
                                            </div>
                                        </div>

                                        {/* Content with Enhanced Spacing */}
                                        <div className="p-10">
                                            <div className="space-y-8">
                                                {/* Row 1 - Service Name & Code */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <Tooltip content="The primary name displayed to users in menus and headers.">
                                                        <div className="bg-white rounded-xl border-2 border-indigo-100 p-6 hover:border-indigo-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">📝</span>
                                                                Service Name
                                                                <span className="text-red-500 ml-auto">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.sub_service_name}
                                                                onChange={(e) => {
                                                                    const newName = e.target.value;
                                                                    const updates: Partial<SubServiceItem> = { sub_service_name: newName };

                                                                    // Auto-generate slug if creating new service
                                                                    if (!editingItem && !formData.slug) {
                                                                        handleSlugChange(newName);
                                                                    }

                                                                    // Auto-generate service code if creating new service and code is empty
                                                                    if (!editingItem && !formData.sub_service_code) {
                                                                        updates.sub_service_code = generateServiceCode(newName);
                                                                    }

                                                                    setFormData({ ...formData, ...updates });
                                                                }}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white placeholder:text-slate-400"
                                                                placeholder="Enter sub-service name"
                                                            />
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Unique internal identifier (e.g., SRV-001) for system referencing.">
                                                        <div className="bg-white rounded-xl border-2 border-purple-100 p-6 hover:border-purple-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">🔐</span>
                                                                Service Code
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.sub_service_code}
                                                                onChange={(e) => {
                                                                    // Only allow editing if this is an existing service
                                                                    if (editingItem) {
                                                                        setFormData({ ...formData, sub_service_code: e.target.value });
                                                                    }
                                                                }}
                                                                readOnly={!editingItem}
                                                                className={`w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono font-medium transition-all focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder:text-slate-400 ${!editingItem ? 'bg-purple-50 cursor-not-allowed' : 'bg-white'
                                                                    }`}
                                                                placeholder="Auto-generated"
                                                            />
                                                        </div>
                                                    </Tooltip>
                                                </div>

                                                {/* Row 2 - Parent Service (NEW FIELD FOR SUBSERVICE) */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <Tooltip content="Select the parent service that this sub-service belongs to.">
                                                        <div className="bg-white rounded-xl border-2 border-rose-100 p-6 hover:border-rose-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">👨‍👧</span>
                                                                Parent Service
                                                                <span className="text-red-500 ml-auto">*</span>
                                                            </label>
                                                            <select
                                                                value={formData.parent_service_id || ''}
                                                                onChange={(e) => setFormData({ ...formData, parent_service_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white transition-all focus:ring-2 focus:ring-rose-500 focus:border-rose-500 cursor-pointer"
                                                            >
                                                                <option value="">Select parent service...</option>
                                                                {Array.isArray(services) && services.length > 0 ? services.map(s => (
                                                                    <option key={s.id} value={s.id}>{s.service_name} ({s.service_code})</option>
                                                                )) : null}
                                                            </select>
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. WEB PRESENCE & TECHNICAL CARD */}
                                    <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50 rounded-2xl border-2 border-blue-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        {/* Header */}
                                        <div className="relative bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-10 text-white overflow-hidden">
                                            <div className="absolute top-0 right-0 opacity-10">
                                                <span className="text-9xl">🔗</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">🌐</span>
                                                    <h3 className="text-2xl font-bold">Web Presence</h3>
                                                </div>
                                                <p className="text-blue-100 text-sm">URL, accessibility, and status management</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-10">
                                            <div className="space-y-8">
                                                {/* Row 1 - Slug & Full URL */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <Tooltip content="URL-friendly identifier. Auto-generated from name if empty.">
                                                        <div className="bg-white rounded-xl border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">🔤</span>
                                                                URL Slug
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.slug}
                                                                onChange={(e) => handleSlugChange(e.target.value)}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-slate-50 transition-all font-mono text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white placeholder:text-slate-400"
                                                                placeholder="auto-generated-slug"
                                                            />
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Canonical URL path used on Guires Marketing OS.">
                                                        <div className="bg-white rounded-xl border-2 border-cyan-100 p-6 hover:border-cyan-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">🔗</span>
                                                                Full URL
                                                            </label>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={formData.full_url}
                                                                    onChange={(e) => setFormData({ ...formData, full_url: e.target.value })}
                                                                    className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-slate-50 font-mono text-slate-700 transition-all focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:bg-white placeholder:text-slate-400"
                                                                    placeholder="/services/enterprise-marketing"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={handleCopyFullUrl}
                                                                    className={`px-4 py-3 text-xs font-bold rounded-lg border-2 transition-all flex items-center justify-center ${copiedUrl
                                                                        ? 'border-emerald-400 text-emerald-700 bg-emerald-50'
                                                                        : 'border-slate-300 text-slate-700 bg-white hover:bg-cyan-50 hover:border-cyan-300'
                                                                        }`}
                                                                >
                                                                    {copiedUrl ? '✓' : '📋'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </Tooltip>
                                                </div>

                                                {/* Row 2 - Language & Status */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <Tooltip content="Language code for this specific service version (e.g., en, es).">
                                                        <div className="bg-white rounded-xl border-2 border-indigo-100 p-6 hover:border-indigo-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">🌍</span>
                                                                Language
                                                            </label>
                                                            <select
                                                                value={formData.language}
                                                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white transition-all focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                                                            >
                                                                <option value="en">English</option>
                                                                <option value="es">Spanish</option>
                                                                <option value="fr">French</option>
                                                                <option value="de">German</option>
                                                            </select>
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Current lifecycle state used across dashboards and filters.">
                                                        <div className="bg-white rounded-xl border-2 border-orange-100 p-6 hover:border-orange-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">📊</span>
                                                                Status
                                                            </label>
                                                            <select
                                                                value={formData.status}
                                                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Service['status'] })}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white transition-all focus:ring-2 focus:ring-orange-500 focus:border-orange-500 cursor-pointer"
                                                            >
                                                                {SERVICE_STATUS_OPTIONS.map(status => (
                                                                    <option key={status} value={status}>{status}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. DETAILED DESCRIPTION CARD - HERO SECTION */}
                                    <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-50 rounded-3xl border-3 border-indigo-400 shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 relative">
                                        {/* Animated Background Pattern */}
                                        <div className="absolute inset-0 opacity-30">
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
                                        </div>

                                        {/* Header - Premium Styling */}
                                        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-10 py-14 text-white overflow-hidden border-b-4 border-indigo-700">
                                            <div className="absolute top-0 right-0 opacity-15">
                                                <span className="text-[180px] font-black">✨</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="bg-white bg-opacity-25 backdrop-blur-sm p-3 rounded-xl text-3xl shadow-lg border border-white border-opacity-30">📝</div>
                                                    <div>
                                                        <h3 className="text-3xl font-black tracking-tight">Service Description</h3>
                                                        <p className="text-indigo-100 text-sm mt-1 font-medium">Comprehensive service overview and positioning</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content - Full Width */}
                                        <div className="p-10 relative z-10">
                                            <Tooltip content="Write a comprehensive service description used across marketing materials, dashboards, and client communications. Make it compelling, clear, and customer-focused.">
                                                <div className="space-y-6">
                                                    {/* Info Bar */}
                                                    <div className="flex items-center justify-between bg-white bg-opacity-70 backdrop-blur-sm rounded-2xl px-6 py-4 border-2 border-indigo-200 shadow-md">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">📖</div>
                                                            <div>
                                                                <h4 className="text-lg font-bold text-indigo-900">DESCRIPTION CONTENT</h4>
                                                                <p className="text-xs text-slate-600 mt-0.5">Used in marketing materials, dashboards, and service listings</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-slate-500 font-medium">Character Count</p>
                                                            <p className={`text-2xl font-black font-mono ${((formData.description?.length || 0) > 1800) ? 'text-red-600' : 'text-indigo-600'}`}>{(formData.description?.length || 0)}/2000</p>
                                                        </div>
                                                    </div>

                                                    {/* Large Textarea */}
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-3xl blur-xl opacity-20 -z-10"></div>
                                                        <textarea
                                                            value={formData.description}
                                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                            className="w-full px-8 py-8 bg-white text-slate-800 rounded-2xl min-h-[400px] lg:min-h-[500px] text-base leading-relaxed focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:border-indigo-400 resize-none transition-all shadow-xl border-2 border-indigo-200 font-medium placeholder:text-slate-400 placeholder:font-normal"
                                                            placeholder="🎯 Begin with the core value proposition...&#10;&#10;📋 Outline key service benefits and deliverables...&#10;&#10;👥 Describe the ideal customer or use case...&#10;&#10;💡 Include unique differentiators or approach...&#10;&#10;✨ Keep it customer-focused and compelling!"
                                                            maxLength={2000}
                                                        />
                                                    </div>

                                                    {/* Footer Tips */}
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-300 p-4 shadow-sm">
                                                            <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-1">💬 Tip</p>
                                                            <p className="text-xs text-blue-700">Keep descriptions concise yet comprehensive.</p>
                                                        </div>
                                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-300 p-4 shadow-sm">
                                                            <p className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-1">🎯 Focus</p>
                                                            <p className="text-xs text-purple-700">Highlight customer benefits and outcomes.</p>
                                                        </div>
                                                        <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-300 p-4 shadow-sm">
                                                            <p className="text-xs font-bold text-pink-800 uppercase tracking-wider mb-1">⭐ Quality</p>
                                                            <p className="text-xs text-pink-700">Use clear language and structure.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </div>

                                    {/* 4. MASTER INTEGRATIONS CARDS */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {/* Industries Card */}
                                        <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-slate-50 rounded-2xl border-2 border-orange-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                            <div className="relative bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-10 text-white overflow-hidden">
                                                <div className="absolute top-0 right-0 opacity-10">
                                                    <span className="text-9xl">🏭</span>
                                                </div>
                                                <div className="relative z-10 flex items-center gap-3">
                                                    <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">🎯</span>
                                                    <div>
                                                        <h4 className="text-xl font-bold">Target Industries</h4>
                                                        <p className="text-orange-100 text-xs mt-1">Sector focus and specialization</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <Tooltip content="Select relevant industries. Used for filtering and personalization.">
                                                    <div className="border-2 border-orange-200 rounded-xl overflow-hidden">
                                                        <div className="max-h-72 overflow-y-auto bg-white">
                                                            <div className="space-y-2 p-4">
                                                                {industries.map((ind: IndustrySectorItem) => (
                                                                    <label key={ind.id} className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-orange-50 rounded-lg transition-all group">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={formData.industry_ids?.includes(ind.industry)}
                                                                            onChange={() => toggleSelection('industry_ids', ind.industry)}
                                                                            className="rounded text-orange-600 focus:ring-orange-500 h-5 w-5 border-slate-300 cursor-pointer"
                                                                        />
                                                                        <span className="text-sm text-slate-700 group-hover:text-orange-700 transition-colors font-medium">{ind.industry}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        {/* Countries Card */}
                                        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-slate-50 rounded-2xl border-2 border-green-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                            <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-10 text-white overflow-hidden">
                                                <div className="absolute top-0 right-0 opacity-10">
                                                    <span className="text-9xl">🌍</span>
                                                </div>
                                                <div className="relative z-10 flex items-center gap-3">
                                                    <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">🗺️</span>
                                                    <div>
                                                        <h4 className="text-xl font-bold">Target Countries</h4>
                                                        <p className="text-green-100 text-xs mt-1">Geographic availability and reach</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <Tooltip content="Select target countries. Determines regional availability.">
                                                    <div className="border-2 border-green-200 rounded-xl overflow-hidden">
                                                        <div className="max-h-72 overflow-y-auto bg-white">
                                                            <div className="space-y-2 p-4">
                                                                {countries.map(c => (
                                                                    <label key={c.id} className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-green-50 rounded-lg transition-all group">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={formData.country_ids?.includes(c.code)}
                                                                            onChange={() => toggleSelection('country_ids', c.code)}
                                                                            className="rounded text-green-600 focus:ring-green-500 h-5 w-5 border-slate-300 cursor-pointer"
                                                                        />
                                                                        <span className="text-sm text-slate-700 group-hover:text-green-700 transition-colors font-medium">{c.country_name}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: NAVIGATION --- */}
                            {activeTab === 'Navigation' && (
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-blue-50 via-blue-50 to-slate-50 border-b border-slate-200 px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-blue-100 text-blue-600 p-2.5 rounded-lg text-lg">🧭</span>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Menu & Sitemap Configuration</h3>
                                                <p className="text-xs text-slate-500 mt-1">Control navigation visibility and search engine indexing settings</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8">
                                        <div className="space-y-10">
                                            {/* MENU SETTINGS SECTION */}
                                            <div className="space-y-5">
                                                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                                                    <span className="text-base">📌</span>
                                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Menu Settings</h4>
                                                    <span className="ml-auto text-xs text-slate-400 font-medium">Control menu placement</span>
                                                </div>

                                                {/* Menu Visibility Toggle */}
                                                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-6 space-y-4">
                                                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide px-1">Menu Visibility</p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <Tooltip content="Include this page in the primary website navigation menu.">
                                                            <label className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg hover:bg-white transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.show_in_main_menu}
                                                                    onChange={(e) => setFormData({ ...formData, show_in_main_menu: e.target.checked })}
                                                                    className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 border-slate-300 accent-blue-600"
                                                                />
                                                                <div className="flex-1">
                                                                    <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">Show in Main Menu</span>
                                                                    <p className="text-xs text-slate-500 mt-0.5">Primary navigation</p>
                                                                </div>
                                                            </label>
                                                        </Tooltip>
                                                        <Tooltip content="Include this page in the website footer link section.">
                                                            <label className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg hover:bg-white transition-colors">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.show_in_footer_menu}
                                                                    onChange={(e) => setFormData({ ...formData, show_in_footer_menu: e.target.checked })}
                                                                    className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 border-slate-300 accent-blue-600"
                                                                />
                                                                <div className="flex-1">
                                                                    <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">Show in Footer</span>
                                                                    <p className="text-xs text-slate-500 mt-0.5">Footer links section</p>
                                                                </div>
                                                            </label>
                                                        </Tooltip>
                                                    </div>
                                                </div>

                                                {/* Menu Organization */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Tooltip content="Grouping label for organizing nested menus (e.g. 'Consulting Services', 'Products').">
                                                        <div className="space-y-3">
                                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                                <span className="text-sm">🏷️</span>
                                                                <span>Menu Group</span>
                                                                <span className="ml-auto text-slate-400 font-normal text-[10px]">Organize</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.menu_group}
                                                                onChange={(e) => setFormData({ ...formData, menu_group: e.target.value })}
                                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                                placeholder="e.g. Products, Services"
                                                            />
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Parent section this service nests under in the menu hierarchy (e.g. 'Solutions').">
                                                        <div className="space-y-3">
                                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                                <span className="text-sm">🌳</span>
                                                                <span>Parent Menu Section</span>
                                                                <span className="ml-auto text-slate-400 font-normal text-[10px]">Hierarchy</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.parent_menu_section || ''}
                                                                onChange={(e) => setFormData({ ...formData, parent_menu_section: e.target.value })}
                                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                                placeholder="e.g. Solutions, Main"
                                                            />
                                                        </div>
                                                    </Tooltip>
                                                </div>

                                                {/* Menu Positioning */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Tooltip content="Numeric order for sorting items within the menu group. Lower numbers appear first.">
                                                        <div className="space-y-3">
                                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                                <span className="text-sm">📊</span>
                                                                <span>Menu Position</span>
                                                                <span className="ml-auto text-slate-400 font-normal text-[10px]">Order</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={formData.menu_position}
                                                                onChange={(e) => setFormData({ ...formData, menu_position: parseInt(e.target.value) || 0 })}
                                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                                placeholder="0"
                                                                min="0"
                                                            />
                                                            <p className="text-xs text-slate-500">0 = first position</p>
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Text label used in breadcrumb navigation trails for user orientation.">
                                                        <div className="space-y-3">
                                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                                <span className="text-sm">🔗</span>
                                                                <span>Breadcrumb Label</span>
                                                                <span className="ml-auto text-slate-400 font-normal text-[10px]">Navigation</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.breadcrumb_label}
                                                                onChange={(e) => setFormData({ ...formData, breadcrumb_label: e.target.value })}
                                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                                placeholder="e.g. Our Services, Consulting"
                                                            />
                                                            <p className="text-xs text-slate-500">Shown in: Home &gt; {formData.breadcrumb_label || 'Label'}</p>
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            </div>

                                            {/* SITEMAP CONFIGURATION SECTION */}
                                            <div className="space-y-5 border-t border-slate-200 pt-8">
                                                <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                                                    <span className="text-base">📋</span>
                                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Sitemap Configuration</h4>
                                                    <span className="ml-auto text-xs text-slate-400 font-medium">Search engine settings</span>
                                                </div>

                                                {/* Include in Sitemap */}
                                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
                                                    <Tooltip content="Include this page in the XML sitemap for search engine crawling and indexing.">
                                                        <label className="flex items-center space-x-3 cursor-pointer group">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.include_in_xml_sitemap}
                                                                onChange={(e) => setFormData({ ...formData, include_in_xml_sitemap: e.target.checked })}
                                                                className="h-6 w-6 text-green-600 rounded focus:ring-2 focus:ring-green-500 border-slate-300 accent-green-600"
                                                            />
                                                            <div className="flex-1">
                                                                <span className="text-sm font-bold text-slate-800 group-hover:text-green-700 transition-colors">Include in XML Sitemap</span>
                                                                <p className="text-xs text-slate-600 mt-1">Submit to search engines for indexing</p>
                                                            </div>
                                                        </label>
                                                    </Tooltip>
                                                </div>

                                                {/* Sitemap Priority & Frequency */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Tooltip content="Priority hint (0.0-1.0) for search engine crawlers. Higher values indicate greater importance for crawling frequency.">
                                                        <div className="space-y-3">
                                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                                <span className="text-sm">⭐</span>
                                                                <span>Sitemap Priority</span>
                                                                <span className="ml-auto text-slate-400 font-normal text-[10px]">Importance</span>
                                                            </label>
                                                            <select
                                                                value={formData.sitemap_priority ?? 0.8}
                                                                onChange={(e) => setFormData({ ...formData, sitemap_priority: parseFloat(e.target.value) })}
                                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm bg-white transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer"
                                                            >
                                                                <option value={1.0}>🔴 1.0 - Highest (Critical page)</option>
                                                                <option value={0.8}>🟠 0.8 - High (Important page)</option>
                                                                <option value={0.5}>🟡 0.5 - Medium (Standard page)</option>
                                                                <option value={0.3}>🟢 0.3 - Low (Less important)</option>
                                                            </select>
                                                            <p className="text-xs text-slate-500">Affects crawler resource allocation</p>
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Update frequency hint for search engines. Guides how often crawlers should check this page for changes.">
                                                        <div className="space-y-3">
                                                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                                                <span className="text-sm">🔄</span>
                                                                <span>Update Frequency</span>
                                                                <span className="ml-auto text-slate-400 font-normal text-[10px]">Interval</span>
                                                            </label>
                                                            <select
                                                                value={formData.sitemap_changefreq || 'monthly'}
                                                                onChange={(e) => setFormData({ ...formData, sitemap_changefreq: e.target.value as any })}
                                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm bg-white transition-all focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer"
                                                            >
                                                                <option value="daily">📅 Daily (New content frequently)</option>
                                                                <option value="weekly">📆 Weekly (Regular updates)</option>
                                                                <option value="monthly">📊 Monthly (Occasional updates)</option>
                                                                <option value="yearly">📈 Yearly (Minimal changes)</option>
                                                            </select>
                                                            <p className="text-xs text-slate-500">How often content is updated</p>
                                                        </div>
                                                    </Tooltip>
                                                </div>

                                                {/* Info Banner */}
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                                                    <span className="text-lg flex-shrink-0">💡</span>
                                                    <div className="text-xs text-slate-700 space-y-1">
                                                        <p className="font-semibold">Sitemap Tips:</p>
                                                        <ul className="text-slate-600 space-y-1 ml-3 list-disc">
                                                            <li>Set higher priority for pages that convert best</li>
                                                            <li>Update frequency helps search engines allocate crawl budget</li>
                                                            <li>All enabled pages are submitted to Google Search Console</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: STRATEGIC --- */}
                            {activeTab === 'Strategic' && (
                                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                        <span className="bg-red-100 text-red-600 p-1.5 rounded mr-2">🎯</span> Strategy & Targeting
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Tooltip content="Defines the editorial structure of the page (Linked to Content Type Master).">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Content Type</label>
                                                <select value={formData.content_type || ''} onChange={(e) => {
                                                    const selectedType = e.target.value;
                                                    const selectedContentType = availableContentTypes.find(ct => ct.content_type === selectedType);
                                                    setFormData({
                                                        ...formData,
                                                        content_type: selectedType as any,
                                                        category: selectedContentType?.category || ''
                                                    });
                                                }} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="" disabled>Select content type...</option>
                                                    {availableContentTypes.map(ct => (
                                                        <option key={ct.id} value={ct.content_type}>{ct.content_type}</option>
                                                    ))}
                                                    {formData.content_type && !availableContentTypes.some(ct => ct.content_type === formData.content_type) && (
                                                        <option value={formData.content_type}>{formData.content_type}</option>
                                                    )}
                                                </select>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Category associated with the selected content type.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                                                <select value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="" disabled>Select category...</option>
                                                    {formData.content_type && availableContentTypes
                                                        .filter(ct => ct.content_type === formData.content_type)
                                                        .map(ct => (
                                                            <option key={ct.id} value={ct.category}>{ct.category}</option>
                                                        ))
                                                    }
                                                    {formData.category && !availableContentTypes.some(ct => ct.category === formData.category && ct.content_type === formData.content_type) && (
                                                        <option value={formData.category}>{formData.category}</option>
                                                    )}
                                                </select>
                                            </div>
                                        </Tooltip>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Tooltip content="Target stage in the customer funnel.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Buyer Journey Stage</label>
                                                <select value={formData.buyer_journey_stage} onChange={(e) => setFormData({ ...formData, buyer_journey_stage: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option>Awareness</option>
                                                    <option>Consideration</option>
                                                    <option>Decision</option>
                                                    <option>Retention</option>
                                                </select>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Primary persona from Persona Master to align messaging.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Primary Persona</label>
                                                <select
                                                    value={formData.primary_persona_id ?? ''}
                                                    onChange={(e) => setFormData({ ...formData, primary_persona_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white"
                                                >
                                                    <option value="">Select persona...</option>
                                                    {personas.map(persona => (
                                                        <option key={persona.id} value={persona.id}>{persona.persona_name}</option>
                                                    ))}
                                                    {formData.primary_persona_id && !personas.some(p => p.id === formData.primary_persona_id) && (
                                                        <option value={formData.primary_persona_id}>Persona #{formData.primary_persona_id}</option>
                                                    )}
                                                </select>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Associate a lead capture form or workflow.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Linked Form</label>
                                                <select
                                                    value={formData.form_id ?? ''}
                                                    onChange={(e) => setFormData({ ...formData, form_id: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white"
                                                >
                                                    <option value="">No linked form</option>
                                                    {forms.map(form => (
                                                        <option key={form.id} value={form.id}>{form.form_name}</option>
                                                    ))}
                                                    {formData.form_id && !forms.some(f => f.id === formData.form_id) && (
                                                        <option value={formData.form_id}>Form #{formData.form_id}</option>
                                                    )}
                                                </select>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Primary Call-to-Action text.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Primary CTA Label</label>
                                                <input type="text" value={formData.primary_cta_label} onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="e.g. Get Started" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Destination URL for the primary CTA.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Primary CTA URL</label>
                                                <input type="text" value={formData.primary_cta_url} onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="https://..." />
                                            </div>
                                        </Tooltip>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <Tooltip content="Document ICP notes or positioning guidance for this service.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Target Segment Notes</label>
                                                <textarea
                                                    value={formData.target_segment_notes || ''}
                                                    onChange={(e) => setFormData({ ...formData, target_segment_notes: e.target.value })}
                                                    className="w-full p-3 border border-slate-300 rounded-lg text-sm h-28 resize-none"
                                                    placeholder="e.g. Mid-market healthcare providers, 200-500 employees."
                                                />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Select additional personas that should inherit this service.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Secondary Personas</label>
                                                <div className="border border-slate-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-100">
                                                    {personas.length === 0 && (
                                                        <div className="p-3 text-xs text-slate-400 text-center">No personas available. Add entries under Persona Master.</div>
                                                    )}
                                                    {personas.map(persona => (
                                                        <label key={persona.id} className="flex items-center justify-between px-3 py-2 text-sm">
                                                            <span className="text-slate-700">{persona.persona_name}</span>
                                                            <input
                                                                type="checkbox"
                                                                className="h-4 w-4 text-indigo-600 border-slate-300 rounded"
                                                                checked={Boolean(formData.secondary_persona_ids?.includes(persona.id))}
                                                                onChange={() => toggleSelection('secondary_persona_ids', persona.id)}
                                                            />
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </Tooltip>
                                    </div>

                                    <div className="mt-4">
                                        <Tooltip content="Associate this service with active marketing campaigns (Linked to Campaign Master).">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Linked Campaigns</label>
                                            <div className="border border-slate-200 rounded-lg p-4 max-h-40 overflow-y-auto bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {campaigns.map(camp => (
                                                    <label key={camp.id} className="flex items-center space-x-2 cursor-pointer bg-white p-2 rounded border border-slate-100 hover:border-indigo-300 transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.linked_campaign_ids?.includes(camp.id)}
                                                            onChange={() => toggleSelection('linked_campaign_ids', camp.id)}
                                                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300"
                                                        />
                                                        <span className="text-sm text-slate-700 font-medium">{camp.campaign_name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </Tooltip>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: CONTENT --- */}
                            {activeTab === 'Content' && (
                                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                        <span className="bg-yellow-100 text-yellow-600 p-1.5 rounded mr-2">📝</span> Content Structure
                                    </h3>
                                    <div className="space-y-8">
                                        <Tooltip content="The main H1 tag for the page. Essential for SEO.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">H1 Heading</label>
                                                <input type="text" value={formData.h1} onChange={(e) => setFormData({ ...formData, h1: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800" />
                                            </div>
                                        </Tooltip>

                                        {[{ label: 'H2 Headings', field: 'h2_list', temp: tempH2, setter: setTempH2 },
                                        { label: 'H3 Headings', field: 'h3_list', temp: tempH3, setter: setTempH3 },
                                        { label: 'H4 Headings', field: 'h4_list', temp: tempH4, setter: setTempH4 },
                                        { label: 'H5 Headings', field: 'h5_list', temp: tempH5, setter: setTempH5 }].map(config => (
                                            <div key={config.field}>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{config.label}</label>
                                                <div className="flex gap-2 mb-3">
                                                    <input
                                                        type="text"
                                                        value={config.temp}
                                                        onChange={(e) => config.setter(e.target.value)}
                                                        className="flex-1 p-3 border border-slate-300 rounded-lg text-sm"
                                                        placeholder={`Add ${config.label.replace(' Headings', '')}...`}
                                                    />
                                                    <button
                                                        onClick={() => addToList(config.field as keyof SubServiceItem, config.temp, config.setter)}
                                                        className="bg-indigo-50 text-indigo-600 px-6 rounded-lg font-bold border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <ul className="space-y-2">
                                                    {(((formData[config.field as keyof SubServiceItem] as string[] | undefined) || []).length)
                                                        ? ((formData[config.field as keyof SubServiceItem] as string[] | undefined) || []).map((heading, i) => (
                                                            <li key={`${config.field}-${i}`} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                                <span className="font-medium text-slate-700 truncate">{heading}</span>
                                                                <button onClick={() => removeFromList(config.field as keyof SubServiceItem, i)} className="text-slate-400 hover:text-red-500 font-bold p-1 transition-colors">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </li>
                                                        ))
                                                        : <li className="text-xs text-slate-400 text-center py-3 border border-dashed border-slate-200 rounded-lg">No {config.label.toLowerCase()} yet.</li>}
                                                </ul>
                                            </div>
                                        ))}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Tooltip content="Approximate total word count to help editorial planning.">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Word Count</label>
                                                    <input
                                                        type="number"
                                                        value={formData.word_count ?? 0}
                                                        onChange={(e) => setFormData({ ...formData, word_count: parseInt(e.target.value || '0') })}
                                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                                                        min={0}
                                                    />
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="Reading time estimation shown on landing pages (minutes).">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Reading Time (Minutes)</label>
                                                    <input
                                                        type="number"
                                                        value={formData.reading_time_minutes ?? 0}
                                                        onChange={(e) => setFormData({ ...formData, reading_time_minutes: parseInt(e.target.value || '0') })}
                                                        className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                                                        min={0}
                                                    />
                                                </div>
                                            </Tooltip>
                                        </div>

                                        {/* Body Content Section - Redesigned Clean Editor */}
                                        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
                                            <Tooltip content="Main body copy. Supports Markdown formatting for rich text editing.">
                                                <div className="flex flex-col">
                                                    {/* Editor Header */}
                                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 border-b-2 border-indigo-700">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-lg font-bold text-white">Body Content Editor</h3>
                                                                    <p className="text-xs text-indigo-100 mt-0.5">Write your main content with Markdown support</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                                                                    <div className="flex items-center gap-2 text-white">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        <span className="text-sm font-semibold">Markdown</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Markdown Toolbar */}
                                                    <div className="bg-gradient-to-r from-slate-50 to-indigo-50 px-6 py-3 border-b border-slate-200">
                                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide mr-2">Quick Format:</span>
                                                                <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-400 transition-all shadow-sm" title="Bold">**B**</button>
                                                                <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono italic text-slate-700 hover:bg-slate-50 hover:border-indigo-400 transition-all shadow-sm" title="Italic">*I*</button>
                                                                <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-400 transition-all shadow-sm" title="Heading"># H</button>
                                                                <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-700 hover:bg-slate-50 hover:border-indigo-400 transition-all shadow-sm" title="List">• List</button>
                                                                <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-700 hover:bg-slate-50 hover:border-indigo-400 transition-all shadow-sm" title="Link">[Link]</button>
                                                                <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-700 hover:bg-slate-50 hover:border-indigo-400 transition-all shadow-sm" title="Code">`Code`</button>
                                                            </div>
                                                            <span className="text-xs text-slate-500">Tip: Use Markdown syntax for formatting</span>
                                                        </div>
                                                    </div>

                                                    {/* Clean Text Editor - No Line Numbers */}
                                                    <div className="bg-white">
                                                        <textarea
                                                            value={formData.body_content}
                                                            onChange={(e) => setFormData({ ...formData, body_content: e.target.value })}
                                                            className="w-full px-6 py-5 border-0 font-mono text-sm leading-relaxed focus:ring-0 focus:outline-none transition-all resize-none bg-white placeholder:text-slate-400"
                                                            placeholder="Start writing your content here...

Use Markdown for formatting:
**Bold text** for emphasis
*Italic text* for subtle emphasis
[Link text](https://example.com) for hyperlinks

Lists:
- Bullet point 1
- Bullet point 2

1. Numbered item 1
2. Numbered item 2"
                                                            rows={20}
                                                        />
                                                    </div>

                                                    {/* Compact Editor Footer with Stats */}
                                                    <div className="bg-gradient-to-r from-slate-50 to-indigo-50 px-6 py-3 border-t-2 border-slate-200">
                                                        <div className="flex items-center justify-between flex-wrap gap-4">
                                                            {/* Left side - Compact Stats */}
                                                            <div className="flex items-center gap-4 flex-wrap">
                                                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                    </svg>
                                                                    <span className="text-xs text-slate-500">Words</span>
                                                                    <span className="text-sm font-bold text-slate-800">
                                                                        {formData.body_content ? formData.body_content.split(/\s+/).filter(Boolean).length : 0}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    <span className="text-xs text-slate-500">Read Time</span>
                                                                    <span className="text-sm font-bold text-slate-800">
                                                                        {formData.body_content ? Math.ceil((formData.body_content.split(/\s+/).filter(Boolean).length || 0) / 200) : 0} min
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                                                    </svg>
                                                                    <span className="text-xs text-slate-500">Characters</span>
                                                                    <span className="text-sm font-bold text-slate-800 font-mono">
                                                                        {formData.body_content?.length || 0}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                    <span className="text-xs text-slate-500">Lines</span>
                                                                    <span className="text-sm font-bold text-slate-800">
                                                                        {formData.body_content ? formData.body_content.split('\n').length : 0}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Right side - Status indicator */}
                                                            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                                <span className="text-xs font-semibold text-slate-700">Auto-saved</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Internal Links</h4>
                                                    <span className="text-[10px] text-slate-400 font-mono">{formData.internal_links?.length || 0}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <input type="text" value={tempInternalLink.anchor_text} onChange={(e) => setTempInternalLink(prev => ({ ...prev, anchor_text: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded text-sm" placeholder="Anchor text" />
                                                    <input type="text" value={tempInternalLink.url} onChange={(e) => setTempInternalLink(prev => ({ ...prev, url: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded text-sm font-mono" placeholder="/supporting-page" />
                                                    <button onClick={() => addLink('internal_links', tempInternalLink, setTempInternalLink)} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition">Add Internal Link</button>
                                                </div>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {formData.internal_links?.length ? formData.internal_links.map((link, idx) => (
                                                        <div key={`internal-${idx}`} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 text-sm">
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-slate-800 truncate">{link.anchor_text}</p>
                                                                <p className="text-[11px] text-slate-500 font-mono truncate">{link.url}</p>
                                                            </div>
                                                            <button onClick={() => removeFromList('internal_links', idx)} className="text-slate-400 hover:text-red-500 transition">✕</button>
                                                        </div>
                                                    )) : <p className="text-xs text-slate-400 text-center py-2">No links yet.</p>}
                                                </div>
                                            </div>

                                            <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">External Links</h4>
                                                    <span className="text-[10px] text-slate-400 font-mono">{formData.external_links?.length || 0}</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <input type="text" value={tempExternalLink.anchor_text} onChange={(e) => setTempExternalLink(prev => ({ ...prev, anchor_text: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded text-sm" placeholder="Anchor text" />
                                                    <input type="text" value={tempExternalLink.url} onChange={(e) => setTempExternalLink(prev => ({ ...prev, url: e.target.value }))} className="w-full p-2.5 border border-slate-200 rounded text-sm font-mono" placeholder="https://partner-site.com" />
                                                    <button onClick={() => addLink('external_links', tempExternalLink, setTempExternalLink)} className="w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold hover:bg-black transition">Add External Link</button>
                                                </div>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {formData.external_links?.length ? formData.external_links.map((link, idx) => (
                                                        <div key={`external-${idx}`} className="flex items-center justify-between bg-white p-3 rounded border border-slate-200 text-sm">
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-slate-800 truncate">{link.anchor_text}</p>
                                                                <p className="text-[11px] text-slate-500 font-mono truncate">{link.url}</p>
                                                            </div>
                                                            <button onClick={() => removeFromList('external_links', idx)} className="text-slate-400 hover:text-red-500 transition">✕</button>
                                                        </div>
                                                    )) : <p className="text-xs text-slate-400 text-center py-2">No links yet.</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Image Alt Texts</h4>
                                                <span className="text-[10px] text-slate-400 font-mono">{formData.image_alt_texts?.length || 0}</span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <input type="text" value={tempImage.url} onChange={(e) => setTempImage(prev => ({ ...prev, url: e.target.value }))} className="p-2.5 border border-slate-200 rounded text-sm font-mono" placeholder="Image URL" />
                                                <input type="text" value={tempImage.alt_text} onChange={(e) => setTempImage(prev => ({ ...prev, alt_text: e.target.value }))} className="p-2.5 border border-slate-200 rounded text-sm" placeholder="Alt text" />
                                                <input type="text" value={tempImage.context} onChange={(e) => setTempImage(prev => ({ ...prev, context: e.target.value }))} className="p-2.5 border border-slate-200 rounded text-sm" placeholder="Usage context" />
                                            </div>
                                            <button onClick={() => addImageAlt(tempImage)} className="w-full mt-2 bg-slate-800 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-900 transition">Add Image Alt Mapping</button>
                                            <div className="space-y-2 max-h-52 overflow-y-auto">
                                                {formData.image_alt_texts?.length ? formData.image_alt_texts.map((img, idx) => (
                                                    <div key={`img-${idx}`} className="flex items-start justify-between border border-slate-200 rounded-lg p-3 text-sm">
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-slate-800 truncate">{img.alt_text}</p>
                                                            <p className="text-[11px] text-slate-500 font-mono truncate">{img.url}</p>
                                                            {img.context && <p className="text-[11px] text-slate-400 mt-1 truncate">{img.context}</p>}
                                                        </div>
                                                        <button onClick={() => removeFromList('image_alt_texts', idx)} className="text-slate-400 hover:text-red-500 transition">✕</button>
                                                    </div>
                                                )) : <p className="text-xs text-slate-400 text-center py-2">No image metadata documented yet.</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: SEO --- */}
                            {activeTab === 'SEO' && (
                                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                    <header className="flex flex-col gap-1">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Search Engine Optimization</p>
                                        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                            <span className="text-green-600">🔍</span> Organic Visibility Controls
                                        </h3>
                                    </header>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="p-5 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-green-50 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold uppercase tracking-wide text-green-600">Meta Title</span>
                                                <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${((formData.meta_title?.length || 0) > 60) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                    {formData.meta_title?.length || 0}/60
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                value={formData.meta_title}
                                                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                                className="w-full p-3 border border-green-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-slate-300"
                                                placeholder="e.g. Enterprise Marketing Solutions"
                                            />
                                        </div>

                                        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-3 lg:col-span-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Meta Description</span>
                                                <span className={`text-[10px] font-mono px-2 py-1 rounded-full ${((formData.meta_description?.length || 0) > 160) ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
                                                    {formData.meta_description?.length || 0}/160
                                                </span>
                                            </div>
                                            <textarea
                                                value={formData.meta_description}
                                                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                                className="w-full p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none placeholder:text-slate-400 leading-relaxed h-28"
                                                placeholder="High-level promise plus differentiator for this service..."
                                            />
                                        </div>

                                        <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4 lg:col-span-3">
                                            <div className="flex items-center justify-between flex-wrap gap-3">
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Focus Keywords</p>
                                                    <p className="text-xs text-slate-500">Primary phrases we actively monitor</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={handleKeywordSuggest} className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-white transition">AI Suggest</button>
                                                    <span className="text-[10px] font-mono text-slate-400">{formData.focus_keywords?.length || 0} tracked</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={tempKeyword}
                                                    onChange={(e) => setTempKeyword(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addToList('focus_keywords', tempKeyword, setTempKeyword)}
                                                    className="flex-1 p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                    placeholder="Add focus keyword..."
                                                />
                                                <button
                                                    onClick={() => addToList('focus_keywords', tempKeyword, setTempKeyword)}
                                                    className="bg-green-600 text-white px-4 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center shrink-0"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="bg-white border border-slate-200 rounded-lg p-4 min-h-[160px] grid gap-3 lg:grid-cols-2">
                                                {formData.focus_keywords && formData.focus_keywords.length > 0 ? (
                                                    formData.focus_keywords.map((k, idx) => (
                                                        <div key={`${k}-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-green-200 transition-colors">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">{k}</p>
                                                                <p className="text-[11px] text-slate-500 font-mono">{getKeywordMetric(k)}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => removeFromList('focus_keywords', idx)}
                                                                className="text-slate-300 hover:text-red-500 transition-colors font-bold"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="lg:col-span-2 h-full flex flex-col items-center justify-center text-slate-400 text-sm italic min-h-[120px]">
                                                        <span className="opacity-50 text-4xl mb-2">🏷️</span>
                                                        No keywords added.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">Secondary Keywords</p>
                                                    <p className="text-xs text-slate-500">Semantic helpers & support terms</p>
                                                </div>
                                                <button onClick={handleSecondaryKeywordSuggest} className="text-[11px] font-bold px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 transition">AI Suggest</button>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={tempSecondaryKeyword}
                                                    onChange={(e) => setTempSecondaryKeyword(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword)}
                                                    className="flex-1 p-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Add supporting keyword..."
                                                />
                                                <button
                                                    onClick={() => addToList('secondary_keywords', tempSecondaryKeyword, setTempSecondaryKeyword)}
                                                    className="bg-indigo-600 text-white px-4 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center shrink-0"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 min-h-[140px] overflow-y-auto space-y-2">
                                                {formData.secondary_keywords && formData.secondary_keywords.length > 0 ? (
                                                    formData.secondary_keywords.map((k, idx) => (
                                                        <div key={`${k}-${idx}`} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100">
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-700">{k}</p>
                                                                <p className="text-[11px] text-slate-400 font-mono">{getKeywordMetric(k)}</p>
                                                            </div>
                                                            <button
                                                                onClick={() => removeFromList('secondary_keywords', idx)}
                                                                className="text-slate-300 hover:text-red-500 transition-colors font-bold"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-slate-500 text-center py-6">No secondary keywords yet.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-5 rounded-xl border border-slate-200 bg-white space-y-5">
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">SEO Score</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <input
                                                        type="range"
                                                        min={0}
                                                        max={100}
                                                        value={formData.seo_score ?? 0}
                                                        onChange={(e) => setFormData({ ...formData, seo_score: parseInt(e.target.value) })}
                                                        className="flex-1 accent-green-500"
                                                    />
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        value={formData.seo_score ?? 0}
                                                        onChange={(e) => setFormData({ ...formData, seo_score: parseInt(e.target.value) })}
                                                        className="w-16 p-2 border border-slate-200 rounded text-center font-mono text-sm"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600 mb-2">Ranking Summary</p>
                                                <textarea
                                                    value={formData.ranking_summary}
                                                    onChange={(e) => setFormData({ ...formData, ranking_summary: e.target.value })}
                                                    className="w-full p-3 border border-slate-200 rounded-lg text-sm h-32 resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    placeholder="Capture SERP positions, rich snippets, competitive notes..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: SMM --- */}
                            {activeTab === 'SMM' && (
                                <div className="space-y-10">
                                    <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-slate-50 rounded-2xl border-2 border-pink-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        <div className="relative bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-10 text-white overflow-hidden">
                                            <div className="absolute top-0 right-0 opacity-10">
                                                <span className="text-9xl">📢</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">📱</span>
                                                    <h3 className="text-2xl font-bold">Social Media Metadata</h3>
                                                </div>
                                                <p className="text-pink-100 text-sm">Configure social media sharing and platform-specific metadata</p>
                                            </div>
                                        </div>

                                        <div className="p-10">
                                            <SocialMetaForm formData={formData} setFormData={setFormData} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: TECHNICAL --- */}
                            {activeTab === 'Technical' && (
                                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-8">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase border-b pb-3 mb-4 tracking-wider flex items-center">
                                        <span className="bg-gray-100 text-gray-600 p-1.5 rounded mr-2">⚙️</span> Technical SEO Configuration
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Tooltip content="Schema.org type (e.g. Service, Product, Article).">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Schema Type</label>
                                                <input type="text" value={formData.schema_type_id} onChange={(e) => setFormData({ ...formData, schema_type_id: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="Service" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Canonical URL to prevent duplicate content issues.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Canonical URL</label>
                                                <input type="text" value={formData.canonical_url} onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono text-slate-600" placeholder="https://..." />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Group ID for hreflang management (links related locales).">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Hreflang Group ID</label>
                                                <input type="number" value={formData.hreflang_group_id ?? ''} onChange={(e) => setFormData({ ...formData, hreflang_group_id: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" placeholder="e.g. 42" />
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Custom robots directives (each on new line).">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Robots Custom</label>
                                                <textarea value={formData.robots_custom || ''} onChange={(e) => setFormData({ ...formData, robots_custom: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm h-28 font-mono" placeholder="User-agent: *&#10;Disallow: /preview" />
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Tooltip content="Robots meta tag indexing instruction.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Robots Index</label>
                                                <select value={formData.robots_index} onChange={(e) => setFormData({ ...formData, robots_index: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="index">Index</option>
                                                    <option value="noindex">No Index</option>
                                                </select>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Robots meta tag following instruction.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Robots Follow</label>
                                                <select value={formData.robots_follow} onChange={(e) => setFormData({ ...formData, robots_follow: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="follow">Follow</option>
                                                    <option value="nofollow">No Follow</option>
                                                </select>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Flag whether this URL should appear in the XML sitemap.">
                                            <div className="flex items-center bg-slate-50 border border-slate-100 rounded-lg px-4 py-3 justify-between">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-600 uppercase">Include in Sitemap</p>
                                                    <p className="text-[11px] text-slate-500">Controls XML feed visibility</p>
                                                </div>
                                                <label className="inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={!!formData.include_in_xml_sitemap} onChange={(e) => setFormData({ ...formData, include_in_xml_sitemap: e.target.checked })} className="sr-only" />
                                                    <span className={`w-10 h-5 flex items-center rounded-full p-1 transition ${formData.include_in_xml_sitemap ? 'bg-green-500' : 'bg-slate-300'}`}>
                                                        <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${formData.include_in_xml_sitemap ? 'translate-x-4' : ''}`}></span>
                                                    </span>
                                                </label>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Measured Core Web Vitals performance state.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Core Web Vitals Status</label>
                                                <select value={formData.core_web_vitals_status || 'Good'} onChange={(e) => setFormData({ ...formData, core_web_vitals_status: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="Good">Good</option>
                                                    <option value="Needs Improvement">Needs Improvement</option>
                                                    <option value="Poor">Poor</option>
                                                </select>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Overall technical SEO health indicator.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tech SEO Status</label>
                                                <select value={formData.tech_seo_status || 'Ok'} onChange={(e) => setFormData({ ...formData, tech_seo_status: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="Ok">OK</option>
                                                    <option value="Warning">Warning</option>
                                                    <option value="Critical">Critical</option>
                                                </select>
                                            </div>
                                        </Tooltip>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Tooltip content="Priority hint for search engine crawlers (0.0 to 1.0).">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sitemap Priority</label>
                                                <select value={formData.sitemap_priority ?? 0.8} onChange={(e) => setFormData({ ...formData, sitemap_priority: parseFloat(e.target.value) })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value={1.0}>1.0 (Highest)</option>
                                                    <option value={0.8}>0.8 (High)</option>
                                                    <option value={0.5}>0.5 (Medium)</option>
                                                    <option value={0.3}>0.3 (Low)</option>
                                                </select>
                                            </div>
                                        </Tooltip>
                                        <Tooltip content="Expected frequency of updates for sitemap pinging.">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sitemap Frequency</label>
                                                <select value={formData.sitemap_changefreq || 'monthly'} onChange={(e) => setFormData({ ...formData, sitemap_changefreq: e.target.value as any })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="yearly">Yearly</option>
                                                </select>
                                            </div>
                                        </Tooltip>
                                    </div>

                                    <div className="mt-4">
                                        <Tooltip content="List of URLs that should 301 redirect to this service page.">
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3">301 Redirects (From)</label>
                                            <div className="flex gap-2 mb-3">
                                                <input type="text" value={tempRedirect} onChange={(e) => setTempRedirect(e.target.value)} className="flex-1 p-3 border border-slate-300 rounded-lg text-sm" placeholder="/old-url" />
                                                <button onClick={() => addToList('redirect_from_urls', tempRedirect, setTempRedirect)} className="bg-slate-100 text-slate-600 px-6 rounded-lg font-bold border border-slate-200 hover:bg-slate-200 transition-colors">+</button>
                                            </div>
                                            <ul className="space-y-2">
                                                {formData.redirect_from_urls?.map((url, i) => (
                                                    <li key={i} className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg border border-slate-200">
                                                        <span className="font-mono text-slate-600">{url}</span>
                                                        <button onClick={() => removeFromList('redirect_from_urls', i)} className="text-slate-400 hover:text-red-500 font-bold p-1 transition-colors">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </Tooltip>
                                    </div>

                                    <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-slate-50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-bold text-slate-600 uppercase">FAQ Section</p>
                                                <p className="text-[11px] text-slate-500">Control schema-ready Q&A block</p>
                                            </div>
                                            <label className="inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={formData.faq_section_enabled} onChange={(e) => setFormData({ ...formData, faq_section_enabled: e.target.checked })} className="sr-only" />
                                                <span className={`w-10 h-5 flex items-center bg-slate-300 rounded-full p-1 transition ${formData.faq_section_enabled ? 'bg-green-500' : 'bg-slate-300'}`}>
                                                    <span className={`bg-white w-4 h-4 rounded-full shadow transform transition ${formData.faq_section_enabled ? 'translate-x-4' : ''}`}></span>
                                                </span>
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input type="text" value={tempFaq.question} onChange={(e) => setTempFaq(prev => ({ ...prev, question: e.target.value }))} className="p-2.5 border border-slate-200 rounded text-sm" placeholder="Question" />
                                            <input type="text" value={tempFaq.answer} onChange={(e) => setTempFaq(prev => ({ ...prev, answer: e.target.value }))} className="p-2.5 border border-slate-200 rounded text-sm" placeholder="Answer" />
                                        </div>
                                        <button onClick={() => addFaqItem(tempFaq)} className="w-full bg-indigo-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition">Add FAQ</button>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {formData.faq_content?.length ? formData.faq_content.map((faq, idx) => (
                                                <div key={`faq-${idx}`} className="bg-white rounded-lg border border-slate-200 p-3 text-sm flex justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800 truncate">{faq.question}</p>
                                                        <p className="text-[11px] text-slate-500 truncate">{faq.answer}</p>
                                                    </div>
                                                    <button onClick={() => removeFromList('faq_content', idx)} className="text-slate-400 hover:text-red-500 transition">✕</button>
                                                </div>
                                            )) : <p className="text-xs text-slate-400 text-center py-2">No FAQ entries yet.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: LINKING (ASSETS) --- */}
                            {activeTab === 'Linking' && (
                                <div className="space-y-10">
                                    {/* 1. ASSET LIBRARY MANAGEMENT - FIRST */}
                                    <ServiceAssetLinker
                                        linkedAssets={linkedLibraryAssets}
                                        availableAssets={availableLibraryAssets}
                                        assetSearch={assetSearch}
                                        setAssetSearch={setAssetSearch}
                                        onToggle={handleToggleLibraryLink}
                                        totalAssets={libraryAssets.length}
                                        repositoryFilter={repositoryFilter}
                                        setRepositoryFilter={setRepositoryFilter}
                                        allAssets={libraryAssets}
                                    />

                                    {/* 2. LINKING METADATA - SECOND */}
                                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 rounded-2xl border-2 border-blue-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        {/* Header */}
                                        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-white overflow-hidden">
                                            <div className="absolute top-0 right-0 opacity-10">
                                                <span className="text-9xl">🔗</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">📋</span>
                                                    <h3 className="text-2xl font-bold">Linking Metadata</h3>
                                                </div>
                                                <p className="text-blue-100 text-sm">Manage relationships with sub-services, assets, and knowledge topics</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-10">
                                            <div className="space-y-8">
                                                {/* Row 1 - Sub-Services */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    <Tooltip content="Does this service have sub-services?">
                                                        <div className="bg-white rounded-xl border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">📋</span>
                                                                Has Sub-Services
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.has_subservices || false}
                                                                    onChange={(e) => setFormData({ ...formData, has_subservices: e.target.checked })}
                                                                    className="w-5 h-5 text-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                                                />
                                                                <span className="text-sm text-slate-600">
                                                                    {formData.has_subservices ? 'Yes' : 'No'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Auto-calculated count of sub-services under this service">
                                                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6 hover:border-indigo-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">🔢</span>
                                                                Sub-Service Count
                                                                <span className="ml-auto text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">AUTO</span>
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 bg-white rounded-lg border-2 border-indigo-200 px-4 py-3 flex items-center justify-between">
                                                                    <span className="text-3xl font-bold text-indigo-600">
                                                                        {editingItem ? getSubServicesCount(editingItem.id) : 0}
                                                                    </span>
                                                                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-indigo-600 mt-2 font-medium">Calculated automatically</p>
                                                        </div>
                                                    </Tooltip>
                                                </div>

                                                {/* Row 2 - Assets & Knowledge */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                    <Tooltip content="Key article / video to feature on page">
                                                        <div className="bg-white rounded-xl border-2 border-green-100 p-6 hover:border-green-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">🎬</span>
                                                                Featured Asset ID
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={formData.featured_asset_id || ''}
                                                                onChange={(e) => setFormData({ ...formData, featured_asset_id: parseInt(e.target.value) || undefined })}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white"
                                                                placeholder="Asset ID"
                                                            />
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Auto-calculated count of linked assets from both content and library repositories">
                                                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 p-6 hover:border-orange-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">📦</span>
                                                                Asset Count
                                                                <span className="ml-auto text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">AUTO</span>
                                                            </label>
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 bg-white rounded-lg border-2 border-orange-200 px-4 py-3 flex items-center justify-between">
                                                                    <span className="text-3xl font-bold text-orange-600">
                                                                        {editingItem ? getLinkedAssetsCount(editingItem.id) : 0}
                                                                    </span>
                                                                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-orange-600 mt-2 font-medium">Calculated automatically</p>
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Link to Knowledge Hub / Topic Master">
                                                        <div className="bg-white rounded-xl border-2 border-cyan-100 p-6 hover:border-cyan-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">📚</span>
                                                                Knowledge Topic ID
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={formData.knowledge_topic_id || ''}
                                                                onChange={(e) => setFormData({ ...formData, knowledge_topic_id: parseInt(e.target.value) || undefined })}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all bg-white"
                                                                placeholder="Topic ID"
                                                            />
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: GOVERNANCE --- */}
                            {activeTab === 'Governance' && (
                                <div className="space-y-10">
                                    {/* 1. OWNERSHIP & METADATA CARD */}
                                    <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-slate-50 rounded-2xl border-2 border-teal-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        {/* Header */}
                                        <div className="relative bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-10 text-white overflow-hidden">
                                            <div className="absolute top-0 right-0 opacity-10">
                                                <span className="text-9xl">⚖️</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">👥</span>
                                                    <h3 className="text-2xl font-bold">Ownership & Metadata</h3>
                                                </div>
                                                <p className="text-teal-100 text-sm">Manage content ownership and business unit assignment</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-10">
                                            <div className="space-y-8">
                                                {/* Row 1 - Content Owner & Business Unit */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <Tooltip content="Person responsible for maintaining this service content.">
                                                        <div className="bg-white rounded-xl border-2 border-cyan-100 p-6 hover:border-cyan-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">👤</span>
                                                                Content Owner
                                                            </label>
                                                            <select
                                                                value={formData.content_owner_id || 0}
                                                                onChange={(e) => setFormData({ ...formData, content_owner_id: parseInt(e.target.value) || undefined })}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white transition-all focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 cursor-pointer"
                                                            >
                                                                <option value={0}>Select Owner...</option>
                                                                {Array.isArray(users) && users.length > 0 ? users.map(u => <option key={u.id} value={u.id}>{u.name}</option>) : null}
                                                            </select>
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Business unit or pod responsible for this service (optional metadata).">
                                                        <div className="bg-white rounded-xl border-2 border-blue-100 p-6 hover:border-blue-300 transition-colors">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">🏛️</span>
                                                                Business Unit
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={formData.business_unit || ''}
                                                                onChange={(e) => setFormData({ ...formData, business_unit: e.target.value })}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white placeholder:text-slate-400"
                                                                placeholder="Growth Marketing / SEO Team"
                                                            />
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. AUDIT TRAIL & TIMESTAMPS CARD */}
                                    <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-slate-50 rounded-2xl border-2 border-indigo-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        {/* Header */}
                                        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 text-white overflow-hidden">
                                            <div className="absolute top-0 right-0 opacity-10">
                                                <span className="text-9xl">📋</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">🕒</span>
                                                    <h3 className="text-2xl font-bold">Audit Trail & Timestamps</h3>
                                                </div>
                                                <p className="text-indigo-100 text-sm">Auto-generated creation and modification history</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-10">
                                            <div className="space-y-8">
                                                {/* Timestamps - Generated Automatically */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <Tooltip content="Timestamp when this service was originally created. Auto-generated by system.">
                                                        <div className="bg-white rounded-xl border-2 border-green-100 p-6">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">✅</span>
                                                                Created By (Timestamp)
                                                            </label>
                                                            <div className="space-y-2">
                                                                <div className="text-sm font-mono font-semibold text-slate-700 px-3 py-2 bg-green-50 rounded-lg border border-green-200 break-all">
                                                                    {editingItem && formData.created_at
                                                                        ? new Date(formData.created_at).toLocaleString('en-US', {
                                                                            year: 'numeric', month: 'short', day: '2-digit',
                                                                            hour: '2-digit', minute: '2-digit', second: '2-digit',
                                                                            timeZoneName: 'short'
                                                                        })
                                                                        : <span className="text-slate-500 italic">Auto-set on creation</span>
                                                                    }
                                                                </div>
                                                                <p className="text-xs text-slate-500">Read-only - System automatically generates this timestamp</p>
                                                            </div>
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Timestamp when this service was last modified. Auto-generated by system on every save.">
                                                        <div className="bg-white rounded-xl border-2 border-orange-100 p-6">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">🔄</span>
                                                                Updated By (Timestamp)
                                                            </label>
                                                            <div className="space-y-2">
                                                                <div className="text-sm font-mono font-semibold text-slate-700 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200 break-all">
                                                                    {editingItem && formData.updated_at
                                                                        ? new Date(formData.updated_at).toLocaleString('en-US', {
                                                                            year: 'numeric', month: 'short', day: '2-digit',
                                                                            hour: '2-digit', minute: '2-digit', second: '2-digit',
                                                                            timeZoneName: 'short'
                                                                        })
                                                                        : <span className="text-slate-500 italic">Auto-set on save</span>
                                                                    }
                                                                </div>
                                                                <p className="text-xs text-slate-500">Read-only - System automatically generates this timestamp on every update</p>
                                                            </div>
                                                        </div>
                                                    </Tooltip>
                                                </div>

                                                {/* Version & Brand Info */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <Tooltip content="Auto-incremented version number tracking major revisions.">
                                                        <div className="bg-white rounded-xl border-2 border-purple-100 p-6">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">📌</span>
                                                                Version Number
                                                            </label>
                                                            <div className="text-sm font-mono font-bold text-slate-700 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
                                                                v{formData.version_number || 1}
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-2">Read-only - Auto-increments on each save</p>
                                                        </div>
                                                    </Tooltip>

                                                    <Tooltip content="Brand this service belongs to.">
                                                        <div className="bg-white rounded-xl border-2 border-blue-100 p-6">
                                                            <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-widest mb-3">
                                                                <span className="text-sm">🏢</span>
                                                                Brand
                                                            </label>
                                                            <select
                                                                value={formData.brand_id || 0}
                                                                onChange={(e) => setFormData({ ...formData, brand_id: parseInt(e.target.value) || undefined })}
                                                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white transition-all focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                                                            >
                                                                <option value={0}>Select Brand...</option>
                                                                {Array.isArray(brands) && brands.length > 0 ? brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>) : null}
                                                            </select>
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. CHANGE MANAGEMENT CARD */}
                                    <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-slate-50 rounded-2xl border-2 border-amber-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                        {/* Header */}
                                        <div className="relative bg-gradient-to-r from-amber-600 to-yellow-600 px-8 py-10 text-white overflow-hidden">
                                            <div className="absolute top-0 right-0 opacity-10">
                                                <span className="text-9xl">📝</span>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="bg-white bg-opacity-20 p-2 rounded-lg text-2xl">🔗</span>
                                                    <h3 className="text-2xl font-bold">Change Management</h3>
                                                </div>
                                                <p className="text-amber-100 text-sm">Track release notes and approval workflows</p>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-10">
                                            <Tooltip content="Link to release notes, Jira ticket, or change request documenting the last major update.">
                                                <div className="space-y-3">
                                                    <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-widest">
                                                        <span>🔗</span>
                                                        Change Log / Release Notes Link
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={formData.change_log_link || ''}
                                                        onChange={(e) => setFormData({ ...formData, change_log_link: e.target.value })}
                                                        className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl text-sm font-mono transition-all focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white placeholder:text-slate-400"
                                                        placeholder="https://notion.so/changelog or https://jira.company.com/browse/MARK-1234"
                                                    />
                                                    <div className="text-xs text-slate-600 space-y-1 bg-amber-50 p-4 rounded-lg border border-amber-200">
                                                        <p className="font-semibold">📌 Quick Links:</p>
                                                        <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                                                            <li>Notion Changelog: <code className="bg-white px-2 py-1 rounded text-xs">https://notion.so/changelog</code></li>
                                                            <li>Jira Epic: <code className="bg-white px-2 py-1 rounded text-xs">https://jira.company.com/browse/MARK-XXX</code></li>
                                                            <li>GitHub Release: <code className="bg-white px-2 py-1 rounded text-xs">https://github.com/repo/releases/tag/v1.0.0</code></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in w-full h-full overflow-y-auto p-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Service & Sub-Service Master</h1>
                    <p className="text-slate-500 text-xs mt-0.5">Manage all service offerings and their sub-categories</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleExport}
                        className="text-slate-600 bg-white border border-slate-300 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors hover:bg-slate-50 flex items-center gap-1.5"
                        title={`Export ${filteredData.length} filtered services to CSV`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Export
                    </button>
                    <button
                        onClick={() => { }}
                        className="text-slate-600 bg-white border border-slate-300 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors hover:bg-slate-50 flex items-center gap-1.5"
                        title="Filter options"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="text-slate-600 bg-white border border-slate-300 px-3 py-2 rounded-lg text-xs font-medium shadow-sm transition-colors hover:bg-slate-50 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Refresh data from server"
                    >
                        <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                    <button onClick={handleCreateClick} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-1.5">
                        <span className="text-lg leading-none">+</span> Add New Service
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    {/* Search Input */}
                    <div className="relative w-full lg:w-80">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="search"
                            className="block w-full pl-10 p-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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

                    {/* Filter Controls - Figma Style */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Industry Filter */}
                        <div className="relative">
                            <select
                                value={industryFilter}
                                onChange={(e) => setIndustryFilter(e.target.value)}
                                className="appearance-none bg-white border border-slate-300 text-sm rounded-lg py-2 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer min-w-[140px]"
                            >
                                <option value="All Industries">All Industries</option>
                                {industries.map(ind => (
                                    <option key={ind.id} value={ind.industry}>{ind.industry}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Sector Filter */}
                        <div className="relative">
                            <select
                                value={sectorFilter}
                                onChange={(e) => setSectorFilter(e.target.value)}
                                className="appearance-none bg-white border border-slate-300 text-sm rounded-lg py-2 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer min-w-[130px]"
                            >
                                <option value="All Sectors">All Sectors</option>
                                {[...new Set(services.map(s => s.business_unit).filter(Boolean))].map(sector => (
                                    <option key={sector} value={sector}>{sector}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-white border border-slate-300 text-sm rounded-lg py-2 pl-3 pr-8 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer min-w-[120px]"
                            >
                                <option>All Status</option>
                                {SERVICE_STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span>Showing <span className="font-semibold text-slate-700">{filteredData.length}</span> of <span className="font-semibold text-slate-700">{services.length}</span> entries</span>
                    {(searchQuery || statusFilter !== 'All Status' || industryFilter !== 'All Industries' || sectorFilter !== 'All Sectors') && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('All Status');
                                setIndustryFilter('All Industries');
                                setSectorFilter('All Sectors');
                            }}
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <Table
                    columns={[
                        {
                            header: 'Service Name',
                            accessor: (item: Service) => (
                                <span className="font-medium text-slate-800 text-sm">{item.service_name}</span>
                            )
                        },
                        {
                            header: 'Service Code',
                            accessor: (item: Service) => (
                                <span className="font-mono text-xs text-slate-600">{item.service_code || '—'}</span>
                            )
                        },
                        {
                            header: 'Industry',
                            accessor: (item: Service) => {
                                const industryIds = item.industry_ids || [];
                                if (industryIds.length === 0) return <span className="text-slate-400 text-xs">—</span>;
                                const firstIndustry = industries.find(ind => ind.id === parseInt(industryIds[0]));
                                return <span className="text-xs text-slate-700">{firstIndustry?.industry || industryIds[0]}</span>;
                            }
                        },
                        {
                            header: 'Sector',
                            accessor: (item: Service) => (
                                <span className="text-xs text-slate-700">{item.business_unit || '—'}</span>
                            )
                        },
                        {
                            header: 'Sub-Services',
                            accessor: (item: Service) => (
                                <button
                                    onClick={() => {
                                        // Store selected service in sessionStorage for SubServiceMasterView
                                        sessionStorage.setItem('selectedParentServiceId', String(item.id));
                                        sessionStorage.setItem('selectedParentServiceName', item.service_name);
                                        // Navigate to Sub-Service Master
                                        window.location.hash = '#sub-service-master';
                                    }}
                                    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm hover:underline cursor-pointer"
                                >
                                    {getSubServicesCount(item.id)} sub-services
                                </button>
                            ),
                            className: "text-center"
                        },
                        {
                            header: 'Linked Assets',
                            accessor: (item: SubServiceItem) => (
                                <span className="text-indigo-600 font-medium text-sm">
                                    {(item.linked_assets_ids?.length || 0) + getLinkedAssetsCount(item.id)}
                                </span>
                            ),
                            className: "text-center"
                        },
                        {
                            header: 'Linked Insights',
                            accessor: (item: SubServiceItem) => (
                                <span className="text-indigo-600 font-medium text-sm">
                                    {item.linked_insights_ids?.length || 0}
                                </span>
                            ),
                            className: "text-center"
                        },
                        {
                            header: 'Health Score',
                            accessor: (item: SubServiceItem) => {
                                let score = 0;
                                if (item.sub_service_name) score += 15;
                                if (item.sub_service_code) score += 10;
                                if (item.slug) score += 10;
                                if (item.meta_title) score += 15;
                                if (item.meta_description) score += 15;
                                if (item.h1) score += 10;
                                if (item.focus_keywords?.length) score += 15;
                                if (item.body_content) score += 10;
                                const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
                                const textColor = score >= 80 ? 'text-green-700' : score >= 60 ? 'text-yellow-700' : score >= 40 ? 'text-orange-700' : 'text-red-700';
                                return (
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
                                        </div>
                                        <span className={`text-xs font-semibold ${textColor}`}>{score}%</span>
                                    </div>
                                );
                            }
                        },
                        { header: 'Status', accessor: (item: SubServiceItem) => getStatusBadge(item.status) },
                        {
                            header: 'Updated At',
                            accessor: (item: SubServiceItem) => {
                                if (!item.updated_at) return <span className="text-slate-400 text-xs">—</span>;
                                const diffMs = Date.now() - new Date(item.updated_at).getTime();
                                const diffHours = Math.floor(diffMs / 3600000);
                                const diffDays = Math.floor(diffMs / 86400000);
                                const timeAgo = diffHours < 1 ? 'Just now' : diffHours < 24 ? `${diffHours} hour${diffHours > 1 ? 's' : ''} ago` : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                                return <span className="text-xs text-slate-500">{timeAgo}</span>;
                            }
                        },
                        {
                            header: 'Actions',
                            accessor: (item: SubServiceItem) => (
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(item)} className="text-slate-500 hover:text-indigo-600 font-medium text-xs">Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-slate-500 hover:text-red-600 font-medium text-xs">Delete</button>
                                </div>
                            )
                        }
                    ]}
                    data={filteredData}
                    title=""
                />
            </div>
        </div>
    );
};

export default SubServiceMasterView;