import React, { useState, useMemo, useEffect } from 'react';
import Table from '../components/Table';
import Tooltip from '../components/Tooltip';
import SocialMetaForm from '../components/SocialMetaForm';
import ServiceAssetLinker from '../components/ServiceAssetLinker';
import { getStatusBadge } from '../constants';
import { useData } from '../hooks/useData';
import { exportToCSV } from '../utils/csvHelper';
import type { SubServiceItem, Service, Brand, User, ContentTypeItem, Keyword, IndustrySectorItem } from '../types';

const STATUSES = ['All Status', 'Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'];
const TABS = ['CoreNavigation', 'StrategicContent', 'SEO', 'SMM', 'Technical', 'Linking', 'Governance'] as const;

const SubServiceMasterView: React.FC = () => {
  const { data: subServices = [], create, update, remove, refresh } = useData<SubServiceItem>('subServices');
  const { data: services = [] } = useData<Service>('services');
  const { data: brands = [] } = useData<Brand>('brands');
  const { data: users = [] } = useData<User>('users');
  const { data: contentTypes = [] } = useData<ContentTypeItem>('contentTypes');
  const { data: keywords = [] } = useData<Keyword>('keywords');
  const { data: industries = [] } = useData<IndustrySectorItem>('industrySectors');

  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [parentFilter, setParentFilter] = useState('All Parent Services');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [editingItem, setEditingItem] = useState<SubServiceItem | null>(null);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('CoreNavigation');
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [formData, setFormData] = useState<Partial<SubServiceItem>>({
    sub_service_name: '',
    parent_service_id: 0,
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
    twitter_title: '',
    twitter_description: '',
    linkedin_title: '',
    linkedin_description: '',
    facebook_title: '',
    facebook_description: '',
    instagram_title: '',
    instagram_description: '',
    brand_id: 0,
    content_owner_id: 0,
    primary_cta_label: '',
    primary_cta_url: '',
    robots_index: 'index',
    robots_follow: 'follow',
    canonical_url: '',
    schema_type_id: 'Service',
    menu_position: 0,
    breadcrumb_label: '',
    include_in_xml_sitemap: true,
    sitemap_priority: 0.8,
    sitemap_changefreq: 'monthly'
  });

  const [tempKeyword, setTempKeyword] = useState('');
  const [tempSecondaryKeyword, setTempSecondaryKeyword] = useState('');
  const [tempH2, setTempH2] = useState('');
  const [tempH3, setTempH3] = useState('');

  const parentService = services.find(s => s.id === formData.parent_service_id);
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
      refresh();
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
      refresh();
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
            <button onClick={() => refresh()} className='px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300'>Refresh</button>
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
                </select>
              </div>
            </div>
            {parentService && (
              <div className='mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                <p className='text-sm'><strong>Parent Service:</strong> {parentService.service_name}</p>
                <p className='text-sm'><strong>Industries:</strong> {parentService.industry_ids?.join(', ') || 'N/A'}</p>
                <p className='text-sm'><strong>Countries:</strong> {parentService.country_ids?.join(', ') || 'N/A'}</p>
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
                  <option>Pillar</option>
                  <option>Cluster</option>
                  <option>Landing</option>
                  <option>Blog</option>
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
                <label className='block text-sm font-medium mb-1'>Meta Title</label>
                <input type='text' value={formData.meta_title || ''} onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div className='col-span-2'>
                <label className='block text-sm font-medium mb-1'>Meta Description</label>
                <textarea value={formData.meta_description || ''} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} className='w-full px-3 py-2 border rounded-lg' rows={2} />
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
                      <button onClick={() => setFormData({ ...formData, focus_keywords: formData.focus_keywords?.filter((_, idx) => idx !== i) })} className='text-red-600 hover:text-red-800'></button>
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
            </div>
          </div>
        )}

        {activeTab === 'SMM' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Social Media Meta</h3>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-1'>OG Title</label>
                <input type='text' value={formData.og_title || ''} onChange={(e) => setFormData({ ...formData, og_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>OG Description</label>
                <input type='text' value={formData.og_description || ''} onChange={(e) => setFormData({ ...formData, og_description: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Twitter Title</label>
                <input type='text' value={formData.twitter_title || ''} onChange={(e) => setFormData({ ...formData, twitter_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>LinkedIn Title</label>
                <input type='text' value={formData.linkedin_title || ''} onChange={(e) => setFormData({ ...formData, linkedin_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Facebook Title</label>
                <input type='text' value={formData.facebook_title || ''} onChange={(e) => setFormData({ ...formData, facebook_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
              <div>
                <label className='block text-sm font-medium mb-1'>Instagram Title</label>
                <input type='text' value={formData.instagram_title || ''} onChange={(e) => setFormData({ ...formData, instagram_title: e.target.value })} className='w-full px-3 py-2 border rounded-lg' />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Technical' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Technical</h3>
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
            </div>
          </div>
        )}

        {activeTab === 'Linking' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Linking</h3>
            <div className='p-4 bg-gray-50 rounded-lg'>
              <p className='text-sm text-gray-600'>Asset linking and service relationships will be configured here.</p>
            </div>
          </div>
        )}

        {activeTab === 'Governance' && (
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold mb-4'>Governance</h3>
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
            </div>
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
