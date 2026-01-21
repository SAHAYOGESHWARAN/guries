import React, { useState, useMemo, useEffect } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import SocialMetaForm from '../components/SocialMetaForm';
import ServiceAssetLinker from '../components/ServiceAssetLinker';
import LinkedInsightsSelector from '../components/LinkedInsightsSelector';
import LinkedAssetsSelector from '../components/LinkedAssetsSelector';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { SubServiceItem, Service, Brand, User, ContentTypeItem, Keyword, IndustrySectorItem, PersonaMasterItem, FormMasterItem, Campaign, ContentRepositoryItem, AssetLibraryItem } from '../types';

const STATUSES = ['All Status', 'Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'];
const TABS = ['CoreNavigation', 'StrategicContent', 'SEO', 'SMM', 'Technical', 'Linking', 'Governance'] as const;
const FALLBACK_CONTENT_TYPES = [
  { id: 1, content_type: 'Pillar', category: 'Core', description: 'Long-form primary page', default_attributes: [], status: 'active' },
  { id: 2, content_type: 'Cluster', category: 'Supporting', description: 'Supporting topic page', default_attributes: [], status: 'active' },
  { id: 3, content_type: 'Landing', category: 'Conversion', description: 'Campaign landing page', default_attributes: [], status: 'active' },
  { id: 4, content_type: 'Blog', category: 'Editorial', description: 'Blog article', default_attributes: [], status: 'active' },
  { id: 5, content_type: 'Case Study', category: 'Proof', description: 'Customer story', default_attributes: [], status: 'active' },
  { id: 6, content_type: 'Sales Page', category: 'Conversion', description: 'Bottom-funnel page', default_attributes: [], status: 'active' }
];

const SubServiceMasterView: React.FC = () => {
  const { data: subServices = [], create, update, remove, refresh: refreshSubServices } = useData<SubServiceItem>('subServices');
  const { data: services = [] } = useData<Service>('services');
  const { data: brands = [] } = useData<Brand>('brands');
  const { data: users = [] } = useData<User>('users');
  const { data: contentTypes = [] } = useData<ContentTypeItem>('contentTypes');
  const { data: keywords = [] } = useData<Keyword>('keywords');
  const { data: industries = [] } = useData<IndustrySectorItem>('industrySectors');
  const { data: personas = [] } = useData<PersonaMasterItem>('personas');
  const { data: forms = [] } = useData<FormMasterItem>('forms');
  const { data: campaigns = [] } = useData<Campaign>('campaigns');
  const { data: contentAssets = [] } = useData<ContentRepositoryItem>('content');
  const { data: libraryAssets = [] } = useData<AssetLibraryItem>('assetLibrary');

  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [parentFilter, setParentFilter] = useState('All Parent Services');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [editingItem, setEditingItem] = useState<SubServiceItem | null>(null);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('CoreNavigation');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [formData, setFormData] = useState<Partial<SubServiceItem>>({
    sub_service_name: '',
    parent_service_id: 0,
    slug: '',
    full_url: '',
    description: '',
    status: 'Draft',
    language: 'en',
    menu_heading: '',
    short_tagline: '',
    industry_ids: [],
    country_ids: [],
    content_type: 'Cluster',
    buyer_journey_stage: 'Consideration',
    h1: '',
    h2_list: [],
    h3_list: [],
    h4_list: [],
    h5_list: [],
    body_content: '',
    word_count: 0,
    reading_time_minutes: 0,
    meta_title: '',
    meta_description: '',
    focus_keywords: [],
    secondary_keywords: [],
    seo_score: 0,
    ranking_summary: '',
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
    social_meta: {},
    brand_id: 0,
    content_owner_id: 0,
    primary_cta_label: '',
    primary_cta_url: '',
    robots_index: 'index',
    robots_follow: 'follow',
    robots_custom: '',
    canonical_url: '',
    schema_type_id: 'Service',
    redirect_from_urls: [],
    hreflang_group_id: undefined,
    core_web_vitals_status: 'Good',
    tech_seo_status: 'Ok',
    menu_position: 0,
    breadcrumb_label: '',
    include_in_xml_sitemap: true,
    sitemap_priority: 0.8,
    sitemap_changefreq: 'monthly',
    faq_section_enabled: false,
    faq_content: [],
    linked_insights_ids: [],
    linked_assets_ids: [],
    assets_linked: 0,
    created_by: undefined,
    updated_by: undefined,
    version_number: 1
  });

  const [tempKeyword, setTempKeyword] = useState('');
  const [tempSecondaryKeyword, setTempSecondaryKeyword] = useState('');
  const [tempH2, setTempH2] = useState('');
  const [tempH3, setTempH3] = useState('');
  const [tempH4, setTempH4] = useState('');
  const [tempH5, setTempH5] = useState('');
  const [assetSearch, setAssetSearch] = useState('');
  const [repositoryFilter, setRepositoryFilter] = useState('All');

  const parentService = services.find(s => s.id === formData.parent_service_id);
  const contentTypesData = contentTypes.length > 0 ? contentTypes : FALLBACK_CONTENT_TYPES;

  const filteredSubServices = useMemo(() => {
    return subServices.filter(item => {
      const matchesSearch = !searchQuery || item.sub_service_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesParent = parentFilter === 'All Parent Services' || item.parent_service_id === parseInt(parentFilter);
      const matchesStatus = statusFilter === 'All Status' || item.status === statusFilter;
      return matchesSearch && matchesParent && matchesStatus;
    });
  }, [subServices, searchQuery, parentFilter, statusFilter]);

  const handleSave = async () => {
    try {
      if (editingItem) {
        await update(editingItem.id, formData);
      } else {
        await create(formData);
      }
      setViewMode('list');
      setEditingItem(null);
      setFormData({ sub_service_name: '', parent_service_id: 0, status: 'Draft' });
      refreshSubServices();
    } catch (error) {
      console.error('Error saving sub-service:', error);
    }
  };

  const handleEdit = (item: SubServiceItem) => {
    setEditingItem(item);
    setFormData(item);
    setViewMode('form');
    setActiveTab('CoreNavigation');
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure?')) {
      await remove(id);
      refreshSubServices();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (viewMode === 'list') {
    return (
      <div className='p-6 bg-gray-50 min-h-screen'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold'>Sub-Service Master</h1>
          <button onClick={() => { setViewMode('form'); setEditingItem(null); setFormData({ sub_service_name: '', parent_service_id: 0, status: 'Draft' }); }} className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'>
            + Add Sub-Service
          </button>
        </div>

        <div className='bg-white rounded-lg shadow-md p-4 mb-6'>
          <div className='grid grid-cols-4 gap-4'>
            <input type='text' placeholder='Search...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='px-3 py-2 border rounded-lg' />
            <select value={parentFilter} onChange={(e) => setParentFilter(e.target.value)} className='px-3 py-2 border rounded-lg'>
              <option>All Parent Services</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className='px-3 py-2 border rounded-lg'>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
            <button onClick={() => refreshSubServices()} className='px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300'>Refresh</button>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <table className='w-full'>
            <thead className='bg-gray-100 border-b'>
              <tr>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Sub-Service Name</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Parent Service</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Status</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>URL</th>
                <th className='px-6 py-3 text-left text-sm font-semibold'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubServices.map(item => (
                <tr key={item.id} className='border-b hover:bg-gray-50'>
                  <td className='px-6 py-3'>{item.sub_service_name}</td>
                  <td className='px-6 py-3'>{services.find(s => s.id === item.parent_service_id)?.service_name || 'N/A'}</td>
                  <td className='px-6 py-3'><span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.status}</span></td>
                  <td className='px-6 py-3 text-sm text-blue-600 cursor-pointer' onClick={() => copyToClipboard(item.full_url || '')}>{item.full_url}</td>
                  <td className='px-6 py-3 space-x-2'>
                    <button onClick={() => handleEdit(item)} className='px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600'>Edit</button>
                    <button onClick={() => handleDelete(item.id)} className='px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600'>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 bg-gray-50 min-h-screen'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-3xl font-bold'>{editingItem ? 'Edit' : 'Create'} Sub-Service</h1>
        <button onClick={() => setViewMode('list')} className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700'>Back</button>
      </div>

      {editingItem?.working_on_by && (
        <div className='mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <p className='text-blue-700 font-medium'>📝 {editingItem.working_on_by} is working on this asset</p>
        </div>
      )}

      <div className='bg-white rounded-lg shadow-md p-6'>
        <div className='flex gap-2 mb-6 border-b'>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'CoreNavigation' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Core Navigation</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Parent Service *</label>
                <select value={formData.parent_service_id || 0} onChange={(e) => setFormData({ ...formData, parent_service_id: parseInt(e.target.value) })} className='w-full px-3 py-2 border rounded-lg'>
                  <option value={0}>Select Parent Service</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.service_name}</option>)}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Sub-Service Name *</label>
                <input type='text' value={formData.sub_service_name || ''} onChange={(e) => setFormData({ ...formData, sub_service_name: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Slug</label>
                <input type='text' value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Full URL</label>
                <input type='text' value={formData.full_url || ''} onChange={(e) => setFormData({ ...formData, full_url: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Menu Heading</label>
                <input type='text' value={formData.menu_heading || ''} onChange={(e) => setFormData({ ...formData, menu_heading: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Short Tagline</label>
                <input type='text' value={formData.short_tagline || ''} onChange={(e) => setFormData({ ...formData, short_tagline: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Description</label>
                <textarea value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className='w-full px-3 py-2 border rounded-lg' rows={3} />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Status</label>
                <select value={formData.status || 'Draft'} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className='w-full px-3 py-2 border rounded-lg'>
                  {STATUSES.filter(s => s !== 'All Status').map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Language</label>
                <select value={formData.language || 'en'} onChange={(e) => setFormData({ ...formData, language: e.target.value })} className='w-full px-3 py-2 border rounded-lg'>
                  <option value='en'>English</option>
                  <option value='es'>Spanish</option>
                  <option value='fr'>French</option>
                  <option value='de'>German</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Breadcrumb Label</label>
                <input type='text' value={formData.breadcrumb_label || ''} onChange={(e) => setFormData({ ...formData, breadcrumb_label: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Menu Position</label>
                <input type='number' value={formData.menu_position || 0} onChange={(e) => setFormData({ ...formData, menu_position: parseInt(e.target.value) })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
            </div>
            {parentService && (
              <div className='mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                <h4 className='font-semibold text-blue-900 mb-2'>Parent Service Information</h4>
                <p className='text-sm'><strong>Service:</strong> {parentService.service_name}</p>
                <p className='text-sm'><strong>Industries:</strong> {parentService.industry_ids?.join(', ') || 'N/A'}</p>
                <p className='text-sm'><strong>Countries:</strong> {parentService.country_ids?.join(', ') || 'N/A'}</p>
                <p className='text-sm'><strong>Content Type:</strong> {parentService.content_type || 'N/A'}</p>
                <p className='text-sm'><strong>Buyer Journey:</strong> {parentService.buyer_journey_stage || 'N/A'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'StrategicContent' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Strategic Content</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Content Type</label>
                <select value={formData.content_type || 'Cluster'} onChange={(e) => setFormData({ ...formData, content_type: e.target.value })} className='w-full px-3 py-2 border rounded-lg'>
                  {contentTypesData.map(ct => <option key={ct.id}>{ct.content_type}</option>)}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Buyer Journey Stage</label>
                <select value={formData.buyer_journey_stage || 'Consideration'} onChange={(e) => setFormData({ ...formData, buyer_journey_stage: e.target.value })} className='w-full px-3 py-2 border rounded-lg'>
                  <option>Awareness</option>
                  <option>Consideration</option>
                  <option>Decision</option>
                  <option>Retention</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Primary CTA Label</label>
                <input type='text' value={formData.primary_cta_label || ''} onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Primary CTA URL</label>
                <input type='text' value={formData.primary_cta_url || ''} onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
            </div>
            {parentService && (
              <div className='mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200'>
                <h4 className='font-semibold text-amber-900 mb-2'>Inherited from Parent Service</h4>
                <p className='text-sm'><strong>Content Type:</strong> {parentService.content_type || 'N/A'}</p>
                <p className='text-sm'><strong>Buyer Journey:</strong> {parentService.buyer_journey_stage || 'N/A'}</p>
                <p className='text-sm'><strong>Primary CTA:</strong> {parentService.primary_cta_label || 'N/A'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'SEO' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>SEO</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>H1</label>
                <input type='text' value={formData.h1 || ''} onChange={(e) => setFormData({ ...formData, h1: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>H2 Headings</label>
                <div className='flex gap-2 mb-2'>
                  <input type='text' value={tempH2} onChange={(e) => setTempH2(e.target.value)} placeholder='Add H2 heading' className='flex-1 px-3 py-2 border rounded-lg' />
                  <button onClick={() => { if (tempH2) { setFormData({ ...formData, h2_list: [...(formData.h2_list || []), tempH2] }); setTempH2(''); } }} className='px-3 py-2 bg-blue-500 text-white rounded-lg'>Add</button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {(formData.h2_list || []).map((h, i) => (
                    <span key={i} className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2'>
                      {h}
                      <button onClick={() => setFormData({ ...formData, h2_list: formData.h2_list?.filter((_, idx) => idx !== i) })} className='text-red-600 hover:text-red-800'>×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>H3 Headings</label>
                <div className='flex gap-2 mb-2'>
                  <input type='text' value={tempH3} onChange={(e) => setTempH3(e.target.value)} placeholder='Add H3 heading' className='flex-1 px-3 py-2 border rounded-lg' />
                  <button onClick={() => { if (tempH3) { setFormData({ ...formData, h3_list: [...(formData.h3_list || []), tempH3] }); setTempH3(''); } }} className='px-3 py-2 bg-blue-500 text-white rounded-lg'>Add</button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {(formData.h3_list || []).map((h, i) => (
                    <span key={i} className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2'>
                      {h}
                      <button onClick={() => setFormData({ ...formData, h3_list: formData.h3_list?.filter((_, idx) => idx !== i) })} className='text-red-600 hover:text-red-800'>×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Meta Title</label>
                <input type='text' value={formData.meta_title || ''} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' placeholder='60 characters recommended' />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Meta Description</label>
                <textarea value={formData.meta_description || ''} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} className='w-full px-3 py-2 border rounded-lg' rows={2} placeholder='160 characters recommended' />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Focus Keywords</label>
                <div className='flex gap-2 mb-2'>
                  <input type='text' value={tempKeyword} onChange={(e) => setTempKeyword(e.target.value)} placeholder='Add keyword' className='flex-1 px-3 py-2 border rounded-lg' />
                  <button onClick={() => { if (tempKeyword) { setFormData({ ...formData, focus_keywords: [...(formData.focus_keywords || []), tempKeyword] }); setTempKeyword(''); } }} className='px-3 py-2 bg-blue-500 text-white rounded-lg'>Add</button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {(formData.focus_keywords || []).map((kw, i) => (
                    <span key={i} className='px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2'>
                      {kw}
                      <button onClick={() => setFormData({ ...formData, focus_keywords: formData.focus_keywords?.filter((_, idx) => idx !== i) })} className='text-red-600 hover:text-red-800'>×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Secondary Keywords</label>
                <div className='flex gap-2 mb-2'>
                  <input type='text' value={tempSecondaryKeyword} onChange={(e) => setTempSecondaryKeyword(e.target.value)} placeholder='Add secondary keyword' className='flex-1 px-3 py-2 border rounded-lg' />
                  <button onClick={() => { if (tempSecondaryKeyword) { setFormData({ ...formData, secondary_keywords: [...(formData.secondary_keywords || []), tempSecondaryKeyword] }); setTempSecondaryKeyword(''); } }} className='px-3 py-2 bg-blue-500 text-white rounded-lg'>Add</button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {(formData.secondary_keywords || []).map((kw, i) => (
                    <span key={i} className='px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2'>
                      {kw}
                      <button onClick={() => setFormData({ ...formData, secondary_keywords: formData.secondary_keywords?.filter((_, idx) => idx !== i) })} className='text-red-600 hover:text-red-800'>×</button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Canonical URL</label>
                <input type='text' value={formData.canonical_url || ''} onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Schema Type</label>
                <input type='text' value={formData.schema_type_id || 'Service'} onChange={(e) => setFormData({ ...formData, schema_type_id: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>SEO Score</label>
                <input type='number' step='0.1' min='0' max='100' value={formData.seo_score || 0} onChange={(e) => setFormData({ ...formData, seo_score: parseFloat(e.target.value) })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Ranking Summary</label>
                <input type='text' value={formData.ranking_summary || ''} onChange={(e) => setFormData({ ...formData, ranking_summary: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SMM' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Social Media Meta</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div className='col-span-2 p-3 bg-purple-50 rounded-lg border border-purple-200'>
                <h4 className='font-semibold text-purple-900 mb-2'>Open Graph (OG)</h4>
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>OG Title</label>
                <input type='text' value={formData.og_title || ''} onChange={(e) => setFormData({ ...formData, og_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>OG Description</label>
                <textarea value={formData.og_description || ''} onChange={(e) => setFormData({ ...formData, og_description: e.target.value })} className='w-full px-3 py-2 border rounded-lg' rows={2} />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>OG Image URL</label>
                <input type='text' value={formData.og_image_url || ''} onChange={(e) => setFormData({ ...formData, og_image_url: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>OG Type</label>
                <select value={formData.og_type || 'website'} onChange={(e) => setFormData({ ...formData, og_type: e.target.value as any })} className='w-full px-3 py-2 border rounded-lg'>
                  <option>website</option>
                  <option>article</option>
                  <option>product</option>
                </select>
              </div>
              <div className='col-span-2 p-3 bg-blue-50 rounded-lg border border-blue-200 mt-4'>
                <h4 className='font-semibold text-blue-900 mb-2'>Twitter</h4>
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Twitter Title</label>
                <input type='text' value={formData.twitter_title || ''} onChange={(e) => setFormData({ ...formData, twitter_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Twitter Description</label>
                <textarea value={formData.twitter_description || ''} onChange={(e) => setFormData({ ...formData, twitter_description: e.target.value })} className='w-full px-3 py-2 border rounded-lg' rows={2} />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Twitter Image URL</label>
                <input type='text' value={formData.twitter_image_url || ''} onChange={(e) => setFormData({ ...formData, twitter_image_url: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200 mt-4'>
                <h4 className='font-semibold text-indigo-900 mb-2'>LinkedIn</h4>
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>LinkedIn Title</label>
                <input type='text' value={formData.linkedin_title || ''} onChange={(e) => setFormData({ ...formData, linkedin_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>LinkedIn Description</label>
                <textarea value={formData.linkedin_description || ''} onChange={(e) => setFormData({ ...formData, linkedin_description: e.target.value })} className='w-full px-3 py-2 border rounded-lg' rows={2} />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>LinkedIn Image URL</label>
                <input type='text' value={formData.linkedin_image_url || ''} onChange={(e) => setFormData({ ...formData, linkedin_image_url: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2 p-3 bg-blue-50 rounded-lg border border-blue-200 mt-4'>
                <h4 className='font-semibold text-blue-900 mb-2'>Facebook</h4>
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Facebook Title</label>
                <input type='text' value={formData.facebook_title || ''} onChange={(e) => setFormData({ ...formData, facebook_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Facebook Description</label>
                <textarea value={formData.facebook_description || ''} onChange={(e) => setFormData({ ...formData, facebook_description: e.target.value })} className='w-full px-3 py-2 border rounded-lg' rows={2} />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Facebook Image URL</label>
                <input type='text' value={formData.facebook_image_url || ''} onChange={(e) => setFormData({ ...formData, facebook_image_url: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2 p-3 bg-pink-50 rounded-lg border border-pink-200 mt-4'>
                <h4 className='font-semibold text-pink-900 mb-2'>Instagram</h4>
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Instagram Title</label>
                <input type='text' value={formData.instagram_title || ''} onChange={(e) => setFormData({ ...formData, instagram_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Instagram Description</label>
                <textarea value={formData.instagram_description || ''} onChange={(e) => setFormData({ ...formData, instagram_description: e.target.value })} className='w-full px-3 py-2 border rounded-lg' rows={2} />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Instagram Image URL</label>
                <input type='text' value={formData.instagram_image_url || ''} onChange={(e) => setFormData({ ...formData, instagram_image_url: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Technical' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Technical SEO</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Robots Index</label>
                <select value={formData.robots_index || 'index'} onChange={(e) => setFormData({ ...formData, robots_index: e.target.value as any })} className='w-full px-3 py-2 border rounded-lg'>
                  <option>index</option>
                  <option>noindex</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Robots Follow</label>
                <select value={formData.robots_follow || 'follow'} onChange={(e) => setFormData({ ...formData, robots_follow: e.target.value as any })} className='w-full px-3 py-2 border rounded-lg'>
                  <option>follow</option>
                  <option>nofollow</option>
                </select>
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Robots Custom</label>
                <input type='text' value={formData.robots_custom || ''} onChange={(e) => setFormData({ ...formData, robots_custom: e.target.value })} className='w-full px-3 py-2 border rounded-lg' placeholder='e.g., max-snippet:-1, max-image-preview:large' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Core Web Vitals Status</label>
                <select value={formData.core_web_vitals_status || 'Good'} onChange={(e) => setFormData({ ...formData, core_web_vitals_status: e.target.value })} className='w-full px-3 py-2 border rounded-lg'>
                  <option>Good</option>
                  <option>Needs Improvement</option>
                  <option>Poor</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Tech SEO Status</label>
                <select value={formData.tech_seo_status || 'Ok'} onChange={(e) => setFormData({ ...formData, tech_seo_status: e.target.value })} className='w-full px-3 py-2 border rounded-lg'>
                  <option>Ok</option>
                  <option>Warning</option>
                  <option>Critical</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Sitemap Priority</label>
                <input type='number' step='0.1' min='0' max='1' value={formData.sitemap_priority || 0.8} onChange={(e) => setFormData({ ...formData, sitemap_priority: parseFloat(e.target.value) })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Sitemap Changefreq</label>
                <select value={formData.sitemap_changefreq || 'monthly'} onChange={(e) => setFormData({ ...formData, sitemap_changefreq: e.target.value as any })} className='w-full px-3 py-2 border rounded-lg'>
                  <option>daily</option>
                  <option>weekly</option>
                  <option>monthly</option>
                  <option>yearly</option>
                </select>
              </div>
              <div className='col-span-2'>
                <label className='flex items-center gap-2'>
                  <input type='checkbox' checked={formData.include_in_xml_sitemap || false} onChange={(e) => setFormData({ ...formData, include_in_xml_sitemap: e.target.checked })} className='w-4 h-4' />
                  <span className='text-sm font-medium'>Include in XML Sitemap</span>
                </label>
              </div>
              <div className='col-span-2'>
                <label className='flex items-center gap-2'>
                  <input type='checkbox' checked={formData.faq_section_enabled || false} onChange={(e) => setFormData({ ...formData, faq_section_enabled: e.target.checked })} className='w-4 h-4' />
                  <span className='text-sm font-medium'>Enable FAQ Section</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Linking' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Linking & Assets</h3>
            <div className='space-y-4'>
              <div className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                <h4 className='font-semibold mb-2'>Asset Linking</h4>
                <p className='text-sm text-gray-600 mb-3'>Link assets, insights, and related content to this sub-service.</p>
                <div className='space-y-2'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>Linked Assets Count</label>
                    <input type='number' value={formData.assets_linked || 0} onChange={(e) => setFormData({ ...formData, assets_linked: parseInt(e.target.value) })} className='w-full px-3 py-2 border rounded-lg' />
                  </div>
                </div>
              </div>
              <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
                <h4 className='font-semibold text-blue-900 mb-2'>Internal Linking</h4>
                <p className='text-sm text-blue-700'>Configure internal links and cross-references within this sub-service.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Governance' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Governance & Ownership</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>Brand</label>
                <select value={formData.brand_id || 0} onChange={(e) => setFormData({ ...formData, brand_id: parseInt(e.target.value) })} className='w-full px-3 py-2 border rounded-lg'>
                  <option value={0}>Select Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Content Owner</label>
                <select value={formData.content_owner_id || 0} onChange={(e) => setFormData({ ...formData, content_owner_id: parseInt(e.target.value) })} className='w-full px-3 py-2 border rounded-lg'>
                  <option value={0}>Select Owner</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Working On By</label>
                <input type='text' value={formData.working_on_by || ''} onChange={(e) => setFormData({ ...formData, working_on_by: e.target.value })} className='w-full px-3 py-2 border rounded-lg' placeholder='e.g., CW, John Doe, Team A' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Version Number</label>
                <input type='number' value={formData.version_number || 1} onChange={(e) => setFormData({ ...formData, version_number: parseInt(e.target.value) })} className='w-full px-3 py-2 border rounded-lg' disabled />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Change Log Link</label>
                <input type='text' value={formData.change_log_link || ''} onChange={(e) => setFormData({ ...formData, change_log_link: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Created At</label>
                <input type='text' value={formData.created_at || ''} className='w-full px-3 py-2 border rounded-lg bg-gray-100' disabled />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Updated At</label>
                <input type='text' value={formData.updated_at || ''} className='w-full px-3 py-2 border rounded-lg bg-gray-100' disabled />
              </div>
            </div>
            {parentService && (
              <div className='mt-4 p-4 bg-green-50 rounded-lg border border-green-200'>
                <h4 className='font-semibold text-green-900 mb-2'>Inherited from Parent Service</h4>
                <p className='text-sm'><strong>Brand:</strong> {brands.find(b => b.id === parentService.brand_id)?.name || 'N/A'}</p>
                <p className='text-sm'><strong>Business Unit:</strong> {parentService.business_unit || 'N/A'}</p>
              </div>
            )}
          </div>
        )}

        <div className='flex gap-4 mt-8 pt-6 border-t'>
          <button onClick={handleSave} className='px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold'>Save</button>
          <button onClick={() => setViewMode('list')} className='px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold'>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SubServiceMasterView;
