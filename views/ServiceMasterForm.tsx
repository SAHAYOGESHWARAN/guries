import React, { useState } from 'react';
import type { Service } from '../types';

const initialService: Partial<Service> = {
  service_code: '',
  service_name: '',
  slug: '',
  full_url: '',
  menu_heading: '',
  short_tagline: '',
  service_description: '',
  industry_ids: [],
  country_ids: [],
  language: 'en',
  status: 'Draft',
  // ...other fields can be initialized as needed
};

const statusOptions = [
  'Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'
];
const contentTypeOptions = [
  'Pillar', 'Cluster', 'Landing', 'Blog', 'Case Study', 'Sales Page'
];
const buyerJourneyOptions = [
  'Awareness', 'Consideration', 'Decision', 'Retention'
];
const robotsIndexOptions = ['index', 'noindex'];
const robotsFollowOptions = ['follow', 'nofollow'];
const coreWebVitalsOptions = ['Good', 'Needs Improvement', 'Poor'];
const techSeoStatusOptions = ['Ok', 'Warning', 'Critical'];
const ogTypeOptions = ['article', 'website', 'product'];
const sitemapChangefreqOptions = ['daily', 'weekly', 'monthly', 'yearly'];

const ServiceMasterForm: React.FC = () => {
  const [service, setService] = useState<Partial<Service>>(initialService);

  const handleChange = (field: keyof Service, value: any) => {
    setService(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (channel: 'linkedin' | 'facebook' | 'instagram', key: 'title' | 'description' | 'image_url', value: string) => {
    setService(prev => ({
      ...prev,
      social_meta: {
        ...(prev.social_meta || {}),
        [channel]: {
          ...((prev.social_meta as any)?.[channel] || {}),
          [key]: value
        }
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend API for create/update
    alert('Service Master saved!');
  };

  return (
    <form className="space-y-8 p-8 bg-white rounded-xl shadow-xl max-w-4xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4">Service Master</h2>
      {/* Identity & Core Details */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label>Service Code</label>
          <input type="text" value={service.service_code || ''} onChange={e => handleChange('service_code', e.target.value)} className="input" />
        </div>
        <div>
          <label>Service Name</label>
          <input type="text" value={service.service_name || ''} onChange={e => handleChange('service_name', e.target.value)} className="input" />
        </div>
        <div>
          <label>Slug</label>
          <input type="text" value={service.slug || ''} onChange={e => handleChange('slug', e.target.value)} className="input" />
        </div>
        <div>
          <label>Full URL</label>
          <input type="text" value={service.full_url || ''} onChange={e => handleChange('full_url', e.target.value)} className="input" />
        </div>
        <div>
          <label>Menu Heading</label>
          <input type="text" value={service.menu_heading || ''} onChange={e => handleChange('menu_heading', e.target.value)} className="input" />
        </div>
        <div>
          <label>Short Tagline</label>
          <input type="text" value={service.short_tagline || ''} onChange={e => handleChange('short_tagline', e.target.value)} className="input" />
        </div>
        <div className="col-span-2">
          <label>Service Description</label>
          <textarea value={service.service_description || ''} onChange={e => handleChange('service_description', e.target.value)} className="input" />
        </div>
      </div>
      {/* Multi-selects and enums */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label>Industry IDs (comma separated)</label>
          <input type="text" value={service.industry_ids?.join(',') || ''} onChange={e => handleChange('industry_ids', e.target.value.split(','))} className="input" />
        </div>
        <div>
          <label>Country IDs (comma separated)</label>
          <input type="text" value={service.country_ids?.join(',') || ''} onChange={e => handleChange('country_ids', e.target.value.split(','))} className="input" />
        </div>
        <div>
          <label>Language</label>
          <input type="text" value={service.language || ''} onChange={e => handleChange('language', e.target.value)} className="input" />
        </div>
        <div>
          <label>Status</label>
          <select value={service.status || ''} onChange={e => handleChange('status', e.target.value)} className="input">
            {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
          </select>
        </div>
      </div>
      {/* Add more blocks for Content, SEO, SMM, Navigation, Technical SEO, Strategic Mapping, Linking, Governance, etc. */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-800 text-sm uppercase mb-4">Social Meta Defaults</h4>
        <div className="grid grid-cols-3 gap-6">
          {/* LinkedIn */}
          <div>
            <h5 className="font-semibold">LinkedIn</h5>
            <label className="block text-xs mt-2">Title</label>
            <input type="text" value={(service.social_meta as any)?.linkedin?.title || ''} onChange={e => handleSocialChange('linkedin', 'title', e.target.value)} className="input" />
            <label className="block text-xs mt-2">Description</label>
            <input type="text" value={(service.social_meta as any)?.linkedin?.description || ''} onChange={e => handleSocialChange('linkedin', 'description', e.target.value)} className="input" />
            <label className="block text-xs mt-2">Image URL</label>
            <input type="text" value={(service.social_meta as any)?.linkedin?.image_url || ''} onChange={e => handleSocialChange('linkedin', 'image_url', e.target.value)} className="input" />
          </div>

          {/* Facebook */}
          <div>
            <h5 className="font-semibold">Facebook</h5>
            <label className="block text-xs mt-2">Title</label>
            <input type="text" value={(service.social_meta as any)?.facebook?.title || ''} onChange={e => handleSocialChange('facebook', 'title', e.target.value)} className="input" />
            <label className="block text-xs mt-2">Description</label>
            <input type="text" value={(service.social_meta as any)?.facebook?.description || ''} onChange={e => handleSocialChange('facebook', 'description', e.target.value)} className="input" />
            <label className="block text-xs mt-2">Image URL</label>
            <input type="text" value={(service.social_meta as any)?.facebook?.image_url || ''} onChange={e => handleSocialChange('facebook', 'image_url', e.target.value)} className="input" />
          </div>

          {/* Instagram */}
          <div>
            <h5 className="font-semibold">Instagram</h5>
            <label className="block text-xs mt-2">Title</label>
            <input type="text" value={(service.social_meta as any)?.instagram?.title || ''} onChange={e => handleSocialChange('instagram', 'title', e.target.value)} className="input" />
            <label className="block text-xs mt-2">Description</label>
            <input type="text" value={(service.social_meta as any)?.instagram?.description || ''} onChange={e => handleSocialChange('instagram', 'description', e.target.value)} className="input" />
            <label className="block text-xs mt-2">Image URL</label>
            <input type="text" value={(service.social_meta as any)?.instagram?.image_url || ''} onChange={e => handleSocialChange('instagram', 'image_url', e.target.value)} className="input" />
          </div>
        </div>
      </div>
      <div className="mt-8">
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">Save Service Master</button>
      </div>
    </form>
  );
};

export default ServiceMasterForm;
