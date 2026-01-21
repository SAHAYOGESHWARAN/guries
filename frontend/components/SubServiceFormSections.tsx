import React from 'react';
import Tooltip from './Tooltip';
import SocialMetaForm from './SocialMetaForm';
import type { SubServiceItem, Service, User, Brand, ContentTypeItem, Keyword } from '../types';

interface SubServiceFormSectionsProps {
    formData: any;
    setFormData: (data: any) => void;
    isViewMode: boolean;
    getInputClasses: (classes: string) => string;
    services: Service[];
    users: User[];
    brands: Brand[];
    contentTypes: ContentTypeItem[];
    keywordsMaster: Keyword[];
    activeTab: string;
    editingItem: SubServiceItem | null;
}

export const CoreSection: React.FC<SubServiceFormSectionsProps> = ({
    formData, setFormData, isViewMode, getInputClasses, services, brands
}) => (
    <div className="space-y-8">
        {/* Parent Service & Sub-Service Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Tooltip content="Select the parent service this sub-service belongs to">
                <div className="bg-white rounded-xl border-2 border-indigo-100 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase mb-3">
                        <span>🔗</span> Parent Service <span className="text-red-500 ml-auto">*</span>
                    </label>
                    <select
                        value={formData.parent_service_id}
                        onChange={(e) => setFormData({ ...formData, parent_service_id: parseInt(e.target.value) })}
                        disabled={isViewMode}
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white")}
                    >
                        <option value={0}>Select Parent Service...</option>
                        {services.map(s => (
                            <option key={s.id} value={s.id}>{s.service_name}</option>
                        ))}
                    </select>
                </div>
            </Tooltip>

            <Tooltip content="Name of the sub-service">
                <div className="bg-white rounded-xl border-2 border-purple-100 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase mb-3">
                        <span>📝</span> Sub-Service Name <span className="text-red-500 ml-auto">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.sub_service_name}
                        onChange={(e) => setFormData({ ...formData, sub_service_name: e.target.value })}
                        disabled={isViewMode}
                        placeholder="Enter sub-service name..."
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white")}
                    />
                </div>
            </Tooltip>
        </div>

        {/* Code & Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Tooltip content="Unique internal identifier">
                <div className="bg-white rounded-xl border-2 border-blue-100 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase mb-3">
                        <span>🔐</span> Sub-Service Code
                    </label>
                    <input
                        type="text"
                        value={formData.sub_service_code}
                        onChange={(e) => setFormData({ ...formData, sub_service_code: e.target.value })}
                        disabled={isViewMode}
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-mono bg-white")}
                        placeholder="Auto-generated"
                    />
                </div>
            </Tooltip>

            <Tooltip content="Publication status">
                <div className="bg-white rounded-xl border-2 border-emerald-100 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase mb-3">
                        <span>📊</span> Status
                    </label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        disabled={isViewMode}
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm font-medium bg-white")}
                    >
                        {['Draft', 'In Progress', 'QC', 'Approved', 'Published', 'Archived'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </Tooltip>
        </div>

        {/* Description */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-2xl border-2 border-indigo-200 p-8">
            <label className="flex items-center gap-3 text-sm font-bold text-indigo-900 uppercase mb-4">
                <span className="bg-indigo-100 p-2 rounded-lg text-xl">📄</span>
                <div>
                    <div>Description</div>
                    <div className="text-[10px] text-slate-500 normal-case font-normal mt-0.5">
                        Provide a detailed overview of this sub-service
                    </div>
                </div>
                <span className={`ml-auto px-3 py-1.5 rounded-full text-xs font-mono font-bold ${(formData.description?.length || 0) > 500 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                    {formData.description?.length || 0}/500
                </span>
            </label>
            <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isViewMode}
                placeholder="Describe the sub-service in detail..."
                className={getInputClasses("w-full px-5 py-4 border-2 border-indigo-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all resize-none shadow-inner leading-relaxed")}
                rows={8}
            />
        </div>
    </div>
);

export const NavigationSection: React.FC<SubServiceFormSectionsProps> = ({
    formData, setFormData, isViewMode, getInputClasses
}) => (
    <div className="space-y-8">
        {/* Menu Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Tooltip content="Show in main navigation menu">
                <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-3">
                        <span>📍</span> Show in Main Menu
                    </label>
                    <input
                        type="checkbox"
                        checked={formData.show_in_main_menu || false}
                        onChange={(e) => setFormData({ ...formData, show_in_main_menu: e.target.checked })}
                        disabled={isViewMode}
                        className="w-5 h-5 rounded border-2 border-slate-300"
                    />
                </div>
            </Tooltip>

            <Tooltip content="Show in footer menu">
                <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-3">
                        <span>🔗</span> Show in Footer Menu
                    </label>
                    <input
                        type="checkbox"
                        checked={formData.show_in_footer_menu || false}
                        onChange={(e) => setFormData({ ...formData, show_in_footer_menu: e.target.checked })}
                        disabled={isViewMode}
                        className="w-5 h-5 rounded border-2 border-slate-300"
                    />
                </div>
            </Tooltip>
        </div>

        {/* Menu Position & Breadcrumb */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Tooltip content="Position in menu (0-100)">
                <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-3">
                        <span>#️⃣</span> Menu Position
                    </label>
                    <input
                        type="number"
                        value={formData.menu_position || 0}
                        onChange={(e) => setFormData({ ...formData, menu_position: parseInt(e.target.value) })}
                        disabled={isViewMode}
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white")}
                    />
                </div>
            </Tooltip>

            <Tooltip content="Breadcrumb label for navigation">
                <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-3">
                        <span>🏷️</span> Breadcrumb Label
                    </label>
                    <input
                        type="text"
                        value={formData.breadcrumb_label || ''}
                        onChange={(e) => setFormData({ ...formData, breadcrumb_label: e.target.value })}
                        disabled={isViewMode}
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white")}
                    />
                </div>
            </Tooltip>
        </div>

        {/* XML Sitemap */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Tooltip content="Include in XML sitemap">
                <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-3">
                        <span>🗺️</span> Include in Sitemap
                    </label>
                    <input
                        type="checkbox"
                        checked={formData.include_in_xml_sitemap ?? true}
                        onChange={(e) => setFormData({ ...formData, include_in_xml_sitemap: e.target.checked })}
                        disabled={isViewMode}
                        className="w-5 h-5 rounded border-2 border-slate-300"
                    />
                </div>
            </Tooltip>

            <Tooltip content="Sitemap priority (0.0-1.0)">
                <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-3">
                        <span>⭐</span> Sitemap Priority
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="1"
                        value={formData.sitemap_priority || 0.8}
                        onChange={(e) => setFormData({ ...formData, sitemap_priority: parseFloat(e.target.value) })}
                        disabled={isViewMode}
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white")}
                    />
                </div>
            </Tooltip>

            <Tooltip content="How often page changes">
                <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-3">
                        <span>🔄</span> Change Frequency
                    </label>
                    <select
                        value={formData.sitemap_changefreq || 'monthly'}
                        onChange={(e) => setFormData({ ...formData, sitemap_changefreq: e.target.value })}
                        disabled={isViewMode}
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white")}
                    >
                        {['daily', 'weekly', 'monthly', 'yearly'].map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                </div>
            </Tooltip>
        </div>
    </div>
);

export const StrategicSection: React.FC<SubServiceFormSectionsProps> = ({
    formData, setFormData, isViewMode, getInputClasses, contentTypes
}) => (
    <div className="space-y-8">
        {/* Content Type & Buyer Journey */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Tooltip content="Type of content for this sub-service">
                <div className="bg-white rounded-xl border-2 border-amber-100 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase mb-3">
                        <span>📑</span> Content Type
                    </label>
                    <select
                        value={formData.content_type || 'Cluster'}
                        onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                        disabled={isViewMode}
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white")}
                    >
                        {contentTypes.map(ct => (
                            <option key={ct.id} value={ct.content_type}>{ct.content_type}</option>
                        ))}
                    </select>
                </div>
            </Tooltip>

            <Tooltip content="Buyer journey stage this content targets">
                <div className="bg-white rounded-xl border-2 border-orange-100 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase mb-3">
                        <span>🛤️</span> Buyer Journey Stage
                    </label>
                    <select
                        value={formData.buyer_journey_stage || 'Consideration'}
                        onChange={(e) => setFormData({ ...formData, buyer_journey_stage: e.target.value })}
                        disabled={isViewMode}
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white")}
                    >
                        {['Awareness', 'Consideration', 'Decision', 'Retention'].map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>
            </Tooltip>
        </div>

        {/* H1 Heading */}
        <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase mb-3">
                <span>📌</span> H1 Heading
            </label>
            <input
                type="text"
                value={formData.h1 || ''}
                onChange={(e) => setFormData({ ...formData, h1: e.target.value })}
                disabled={isViewMode}
                placeholder="Main page heading..."
                className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white")}
            />
        </div>

        {/* CTA Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Tooltip content="Primary call-to-action button label">
                <div className="bg-white rounded-xl border-2 border-green-100 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase mb-3">
                        <span>🎯</span> Primary CTA Label
                    </label>
                    <input
                        type="text"
                        value={formData.primary_cta_label || ''}
                        onChange={(e) => setFormData({ ...formData, primary_cta_label: e.target.value })}
                        disabled={isViewMode}
                        placeholder="Get Started"
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white")}
                    />
                </div>
            </Tooltip>

            <Tooltip content="Primary call-to-action URL">
                <div className="bg-white rounded-xl border-2 border-teal-100 p-6">
                    <label className="flex items-center gap-2 text-xs font-bold text-teal-700 uppercase mb-3">
                        <span>🔗</span> Primary CTA URL
                    </label>
                    <input
                        type="text"
                        value={formData.primary_cta_url || ''}
                        onChange={(e) => setFormData({ ...formData, primary_cta_url: e.target.value })}
                        disabled={isViewMode}
                        placeholder="/contact"
                        className={getInputClasses("w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white")}
                    />
                </div>
            </Tooltip>
        </div>
    </div>
);
