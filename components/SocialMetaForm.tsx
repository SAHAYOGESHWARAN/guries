import React from 'react';
import Tooltip from './Tooltip';

type SocialMeta = {
  linkedin?: { title?: string; description?: string; image_url?: string };
  facebook?: { title?: string; description?: string; image_url?: string };
  instagram?: { title?: string; description?: string; image_url?: string };
  twitter?: { title?: string; description?: string; image_url?: string };
};

type Props = {
  formData: any;
  setFormData: (fn: any) => void;
};

const SocialMetaForm: React.FC<Props> = ({ formData, setFormData }) => {
  const updateChannel = (channel: keyof SocialMeta, key: string, value: string) => {
    setFormData({
      ...formData,
      social_meta: {
        ...formData.social_meta,
        [channel]: {
          ...(formData.social_meta?.[channel] || {}),
          [key]: value
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6 pb-8 border-b border-slate-200">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Social Media Metadata</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Tooltip content="Open Graph Title (Facebook, LinkedIn). Defaults to SEO Title if empty.">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">OG Title</label>
              <input type="text" value={formData.og_title || ''} onChange={(e) => setFormData({ ...formData, og_title: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
            </div>
          </Tooltip>

          <Tooltip content="Twitter Card Title. Defaults to OG Title if empty.">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Twitter Title</label>
              <input type="text" value={formData.twitter_title || ''} onChange={(e) => setFormData({ ...formData, twitter_title: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm" />
            </div>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Tooltip content="Open Graph Description.">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">OG Description</label>
              <textarea value={formData.og_description || ''} onChange={(e) => setFormData({ ...formData, og_description: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg h-24 text-sm resize-none" />
            </div>
          </Tooltip>

          <Tooltip content="Twitter Card Description.">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Twitter Description</label>
              <textarea value={formData.twitter_description || ''} onChange={(e) => setFormData({ ...formData, twitter_description: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg h-24 text-sm resize-none" />
            </div>
          </Tooltip>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Tooltip content="Image used by Open Graph previews.">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">OG Image URL</label>
              <input type="text" value={formData.og_image_url || ''} onChange={(e) => setFormData({ ...formData, og_image_url: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono text-slate-600" placeholder="https://..." />
            </div>
          </Tooltip>

          <Tooltip content="Controls how social platforms render the preview card.">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">OG Type</label>
              <select value={formData.og_type || 'website'} onChange={(e) => setFormData({ ...formData, og_type: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm bg-white">
                <option value="website">Website</option>
                <option value="article">Article</option>
                <option value="product">Product</option>
              </select>
            </div>
          </Tooltip>

          <Tooltip content="Image used for Twitter card previews.">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Twitter Image URL</label>
              <input type="text" value={formData.twitter_image_url || ''} onChange={(e) => setFormData({ ...formData, twitter_image_url: e.target.value })} className="w-full p-3 border border-slate-300 rounded-lg text-sm font-mono text-slate-600" placeholder="https://..." />
            </div>
          </Tooltip>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Platform-Specific Content</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* LinkedIn */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/20 rounded-xl border-2 border-blue-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold">in</span>
              <h5 className="text-sm font-bold text-slate-900">LinkedIn</h5>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Title</label>
                <input type="text" value={(formData.social_meta?.linkedin?.title) || ''} onChange={(e) => updateChannel('linkedin', 'title', e.target.value)} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Description</label>
                <textarea value={(formData.social_meta?.linkedin?.description) || ''} onChange={(e) => updateChannel('linkedin', 'description', e.target.value)} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm bg-white resize-none h-20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Image URL</label>
                <input type="text" value={(formData.social_meta?.linkedin?.image_url) || ''} onChange={(e) => updateChannel('linkedin', 'image_url', e.target.value)} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm font-mono text-slate-600 bg-white" />
              </div>
            </div>
          </div>

          {/* Facebook */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/20 rounded-xl border-2 border-blue-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-bold">f</span>
              <h5 className="text-sm font-bold text-slate-900">Facebook</h5>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Title</label>
                <input type="text" value={(formData.social_meta?.facebook?.title) || ''} onChange={(e) => updateChannel('facebook', 'title', e.target.value)} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Description</label>
                <textarea value={(formData.social_meta?.facebook?.description) || ''} onChange={(e) => updateChannel('facebook', 'description', e.target.value)} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm bg-white resize-none h-20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Image URL</label>
                <input type="text" value={(formData.social_meta?.facebook?.image_url) || ''} onChange={(e) => updateChannel('facebook', 'image_url', e.target.value)} className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm font-mono text-slate-600 bg-white" />
              </div>
            </div>
          </div>

          {/* Instagram */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50/20 rounded-xl border-2 border-purple-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-600 px-2.5 py-1 rounded-lg text-xs font-bold">📷</span>
              <h5 className="text-sm font-bold text-slate-900">Instagram</h5>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Title</label>
                <input type="text" value={(formData.social_meta?.instagram?.title) || ''} onChange={(e) => updateChannel('instagram', 'title', e.target.value)} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-sm bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Caption</label>
                <textarea value={(formData.social_meta?.instagram?.description) || ''} onChange={(e) => updateChannel('instagram', 'description', e.target.value)} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-sm bg-white resize-none h-20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Image URL</label>
                <input type="text" value={(formData.social_meta?.instagram?.image_url) || ''} onChange={(e) => updateChannel('instagram', 'image_url', e.target.value)} className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-sm font-mono text-slate-600 bg-white" />
              </div>
            </div>
          </div>

+          {/* Twitter (Platform-specific) */}
+          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 p-6 space-y-4">
+            <div className="flex items-center gap-2">
+              <span className="bg-sky-100 text-sky-600 px-2.5 py-1 rounded-lg text-xs font-bold">t</span>
+              <h5 className="text-sm font-bold text-slate-900">Twitter</h5>
+            </div>
+            <div className="space-y-3">
+              <div>
+                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Title</label>
+                <input type="text" value={(formData.social_meta?.twitter?.title) || ''} onChange={(e) => updateChannel('twitter', 'title', e.target.value)} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-white" />
+              </div>
+              <div>
+                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Description</label>
+                <textarea value={(formData.social_meta?.twitter?.description) || ''} onChange={(e) => updateChannel('twitter', 'description', e.target.value)} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm bg-white resize-none h-20" />
+              </div>
+              <div>
+                <label className="block text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">Image URL</label>
+                <input type="text" value={(formData.social_meta?.twitter?.image_url) || ''} onChange={(e) => updateChannel('twitter', 'image_url', e.target.value)} className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-mono text-slate-600 bg-white" />
+              </div>
+            </div>
+          </div>

        </div>
      </div>
    </div>
  );
};

export default SocialMetaForm;
