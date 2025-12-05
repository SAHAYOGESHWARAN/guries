import React, { useState } from 'react';
import Tooltip from './Tooltip';

type Props = {
  formData: any;
  setFormData: (fn: any) => void;
};

type TabType = 'default' | 'og' | 'twitter' | 'linkedin' | 'facebook' | 'instagram';

const SocialMetaForm: React.FC<Props> = ({ formData, setFormData }) => {
  const [activeTab, setActiveTab] = useState<TabType>('default');

  const tabs = [
    { id: 'default' as TabType, label: 'Default Meta', icon: '🌐', color: 'slate', gradient: 'from-slate-600 to-slate-700' },
    { id: 'og' as TabType, label: 'Open Graph', icon: '🔗', color: 'blue', gradient: 'from-blue-600 to-blue-700' },
    { id: 'twitter' as TabType, label: 'Twitter', icon: '🐦', color: 'sky', gradient: 'from-sky-500 to-sky-600' },
    { id: 'linkedin' as TabType, label: 'LinkedIn', icon: '💼', color: 'indigo', gradient: 'from-indigo-600 to-indigo-700' },
    { id: 'facebook' as TabType, label: 'Facebook', icon: '👥', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
    { id: 'instagram' as TabType, label: 'Instagram', icon: '📸', color: 'pink', gradient: 'from-pink-500 via-purple-500 to-orange-500' }
  ];

  const currentTab = tabs.find(t => t.id === activeTab)!;

  const renderField = (label: string, field: string, placeholder: string, type: 'input' | 'textarea' = 'input', maxLength?: number) => (
    <Tooltip content={`${label} for this platform`}>
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6 hover:border-indigo-300 transition-all shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <span className="text-base">✏️</span>
            {label}
          </label>
          {maxLength && formData[field] && (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border-2 ${(formData[field]?.length || 0) > maxLength
                ? 'bg-red-50 text-red-700 border-red-300'
                : 'bg-green-50 text-green-700 border-green-300'
              }`}>
              {formData[field]?.length || 0}/{maxLength}
            </span>
          )}
        </div>
        {type === 'input' ? (
          <input
            type="text"
            value={formData[field] || ''}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            placeholder={placeholder}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        ) : (
          <textarea
            value={formData[field] || ''}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            placeholder={placeholder}
            rows={4}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none placeholder:text-slate-400 leading-relaxed"
          />
        )}
      </div>
    </Tooltip>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
            <span className="text-4xl">📢</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Social Media Metadata</h2>
            <p className="text-white/90 text-sm">Optimize how your content appears across social platforms</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg">
        <div className="border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-bold transition-all border-b-4 flex items-center gap-2 min-w-fit ${activeTab === tab.id
                    ? `border-${tab.color}-600 text-${tab.color}-700 bg-white shadow-sm`
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                style={activeTab === tab.id ? {
                  borderBottomColor: tab.color === 'slate' ? '#475569' :
                    tab.color === 'blue' ? '#2563eb' :
                      tab.color === 'sky' ? '#0ea5e9' :
                        tab.color === 'indigo' ? '#4f46e5' :
                          tab.color === 'pink' ? '#ec4899' : '#2563eb'
                } : {}}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-8 bg-gradient-to-br from-slate-50 to-white min-h-[500px]">
          {/* DEFAULT META TAB */}
          {activeTab === 'default' && (
            <div className="space-y-6 animate-fade-in">
              {/* Info Banner */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <span className="text-3xl">ℹ️</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2 text-base">Default Social Media Metadata</h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      These fields serve as fallback values when platform-specific metadata is not provided.
                      They ensure your content always has proper social sharing information.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-6">
                {renderField('Meta Title', 'meta_title', 'Default title for social shares...', 'input', 60)}
                {renderField('Meta Description', 'meta_description', 'Default description for social shares...', 'textarea', 160)}
              </div>
            </div>
          )}

          {/* OPEN GRAPH TAB */}
          {activeTab === 'og' && (
            <div className="space-y-6 animate-fade-in">
              {/* Info Banner */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <span className="text-3xl">🔗</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2 text-base">Open Graph Protocol</h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Used by Facebook, LinkedIn, and many other platforms. Recommended image size: <strong>1200x630px</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-6">
                {renderField('OG Title', 'og_title', 'Open Graph title...', 'input')}
                {renderField('OG Description', 'og_description', 'Open Graph description...', 'textarea')}
                {renderField('OG Image URL', 'og_image_url', 'https://example.com/og-image.jpg', 'input')}

                <Tooltip content="Type of Open Graph object">
                  <div className="bg-white rounded-xl border-2 border-slate-200 p-6 shadow-sm">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                      <span className="text-base">🏷️</span>
                      OG Type
                    </label>
                    <select
                      value={formData.og_type || 'website'}
                      onChange={(e) => setFormData({ ...formData, og_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="website">Website</option>
                      <option value="article">Article</option>
                      <option value="product">Product</option>
                    </select>
                  </div>
                </Tooltip>
              </div>
            </div>
          )}

          {/* TWITTER TAB */}
          {activeTab === 'twitter' && (
            <div className="space-y-6 animate-fade-in">
              {/* Info Banner */}
              <div className="bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-sky-100 p-3 rounded-xl">
                    <span className="text-3xl">🐦</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sky-900 mb-2 text-base">Twitter Card Metadata</h4>
                    <p className="text-sm text-sky-800 leading-relaxed">
                      Optimized for Twitter/X shares. Recommended image size: <strong>1200x675px (16:9 ratio)</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-6">
                {renderField('Twitter Title', 'twitter_title', 'Title for Twitter card...', 'input', 70)}
                {renderField('Twitter Description', 'twitter_description', 'Description for Twitter card...', 'textarea', 200)}
                {renderField('Twitter Image URL', 'twitter_image_url', 'https://example.com/twitter-image.jpg', 'input')}
              </div>
            </div>
          )}

          {/* LINKEDIN TAB */}
          {activeTab === 'linkedin' && (
            <div className="space-y-6 animate-fade-in">
              {/* Info Banner */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <span className="text-3xl">💼</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-900 mb-2 text-base">LinkedIn Metadata</h4>
                    <p className="text-sm text-indigo-800 leading-relaxed">
                      Professional network optimization. Use business-focused language. Image: <strong>1200x627px</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-6">
                {renderField('LinkedIn Title', 'linkedin_title', 'Professional title for LinkedIn...', 'input')}
                {renderField('LinkedIn Description', 'linkedin_description', 'Professional description for LinkedIn...', 'textarea')}
                {renderField('LinkedIn Image URL', 'linkedin_image_url', 'https://example.com/linkedin-image.jpg', 'input')}
              </div>
            </div>
          )}

          {/* FACEBOOK TAB */}
          {activeTab === 'facebook' && (
            <div className="space-y-6 animate-fade-in">
              {/* Info Banner */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <span className="text-3xl">👥</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2 text-base">Facebook Metadata</h4>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Engaging content for Facebook shares. Image: <strong>1200x630px</strong>. Use questions and CTAs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-6">
                {renderField('Facebook Title', 'facebook_title', 'Engaging title for Facebook...', 'input', 90)}
                {renderField('Facebook Description', 'facebook_description', 'Engaging description for Facebook...', 'textarea')}
                {renderField('Facebook Image URL', 'facebook_image_url', 'https://example.com/facebook-image.jpg', 'input')}
              </div>
            </div>
          )}

          {/* INSTAGRAM TAB */}
          {activeTab === 'instagram' && (
            <div className="space-y-6 animate-fade-in">
              {/* Info Banner */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="bg-pink-100 p-3 rounded-xl">
                    <span className="text-3xl">📸</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-pink-900 mb-2 text-base">Instagram Metadata</h4>
                    <p className="text-sm text-pink-800 leading-relaxed">
                      Visual-first platform. Use emojis and hashtags. Square image: <strong>1080x1080px</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div className="grid grid-cols-1 gap-6">
                {renderField('Instagram Title', 'instagram_title', 'Visual title for Instagram...', 'input')}
                {renderField('Instagram Caption', 'instagram_description', 'Engaging caption with emojis and hashtags...', 'textarea', 2200)}
                {renderField('Instagram Image URL', 'instagram_image_url', 'https://example.com/instagram-image.jpg', 'input')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Best Practices */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="bg-amber-100 p-3 rounded-xl">
            <span className="text-3xl">💡</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-amber-900 mb-3 text-base">Platform-Specific Best Practices</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-sm text-amber-900"><strong>🔗 Open Graph:</strong> Universal fallback - ensure this is always filled</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-sm text-amber-900"><strong>🐦 Twitter:</strong> Concise and punchy, under 70 characters for title</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-sm text-amber-900"><strong>💼 LinkedIn:</strong> Professional tone, 150-200 characters for title</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-sm text-amber-900"><strong>👥 Facebook:</strong> Engaging questions work well, 40-90 characters</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-sm text-amber-900"><strong>📸 Instagram:</strong> Visual-first, use emojis and hashtags in caption</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <p className="text-sm text-amber-900"><strong>🖼️ Images:</strong> Each platform has optimal dimensions - use specific images</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default SocialMetaForm;
