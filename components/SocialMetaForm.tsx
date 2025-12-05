import React, { useState } from 'react';
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
  const [activePreview, setActivePreview] = useState<string | null>(null);

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

  const platforms = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: 'blue',
      bgGradient: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-300',
      bgLight: 'bg-blue-50',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-100',
      focusRing: 'focus:ring-blue-500 focus:border-blue-500'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '👥',
      color: 'indigo',
      bgGradient: 'from-indigo-500 to-indigo-600',
      borderColor: 'border-indigo-300',
      bgLight: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      iconBg: 'bg-indigo-100',
      focusRing: 'focus:ring-indigo-500 focus:border-indigo-500'
    },
    {
      id: 'twitter',
      name: 'Twitter / X',
      icon: '🐦',
      color: 'sky',
      bgGradient: 'from-sky-500 to-sky-600',
      borderColor: 'border-sky-300',
      bgLight: 'bg-sky-50',
      textColor: 'text-sky-700',
      iconBg: 'bg-sky-100',
      focusRing: 'focus:ring-sky-500 focus:border-sky-500'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📸',
      color: 'pink',
      bgGradient: 'from-pink-500 via-purple-500 to-orange-500',
      borderColor: 'border-pink-300',
      bgLight: 'bg-gradient-to-br from-pink-50 to-purple-50',
      textColor: 'text-pink-700',
      iconBg: 'bg-pink-100',
      focusRing: 'focus:ring-pink-500 focus:border-pink-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-4 mb-3">
          <div className="bg-white bg-opacity-20 p-3 rounded-xl">
            <span className="text-3xl">📢</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold">Social Media Metadata</h2>
            <p className="text-white/90 text-sm mt-1">Optimize how your content appears across social platforms</p>
          </div>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const data = formData.social_meta?.[platform.id as keyof SocialMeta] || {};
          const isExpanded = activePreview === platform.id;

          return (
            <div
              key={platform.id}
              className={`bg-white rounded-2xl border-2 ${platform.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden`}
            >
              {/* Platform Header */}
              <div className={`bg-gradient-to-r ${platform.bgGradient} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{platform.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold">{platform.name}</h3>
                      <p className="text-white/80 text-xs">Customize preview card</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActivePreview(isExpanded ? null : platform.id)}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-6 space-y-4">
                <Tooltip content={`Title displayed when sharing on ${platform.name}`}>
                  <div>
                    <label className={`block text-xs font-bold ${platform.textColor} uppercase mb-2 tracking-wide flex items-center gap-2`}>
                      <span>📝</span> Title
                    </label>
                    <input
                      type="text"
                      value={data.title || ''}
                      onChange={(e) => updateChannel(platform.id as keyof SocialMeta, 'title', e.target.value)}
                      className={`w-full px-4 py-3 border-2 ${platform.borderColor} rounded-xl text-sm ${platform.focusRing} transition-all bg-white`}
                      placeholder={`${platform.name} post title...`}
                    />
                    {data.title && (
                      <p className="text-xs text-slate-500 mt-1">{data.title.length} characters</p>
                    )}
                  </div>
                </Tooltip>

                <Tooltip content={`Description or caption for ${platform.name} shares`}>
                  <div>
                    <label className={`block text-xs font-bold ${platform.textColor} uppercase mb-2 tracking-wide flex items-center gap-2`}>
                      <span>💬</span> {platform.id === 'instagram' ? 'Caption' : 'Description'}
                    </label>
                    <textarea
                      value={data.description || ''}
                      onChange={(e) => updateChannel(platform.id as keyof SocialMeta, 'description', e.target.value)}
                      className={`w-full px-4 py-3 border-2 ${platform.borderColor} rounded-xl text-sm ${platform.focusRing} transition-all bg-white resize-none`}
                      rows={3}
                      placeholder={`Engaging ${platform.id === 'instagram' ? 'caption' : 'description'} for ${platform.name}...`}
                    />
                    {data.description && (
                      <p className="text-xs text-slate-500 mt-1">{data.description.length} characters</p>
                    )}
                  </div>
                </Tooltip>

                <Tooltip content={`Image URL for ${platform.name} preview card`}>
                  <div>
                    <label className={`block text-xs font-bold ${platform.textColor} uppercase mb-2 tracking-wide flex items-center gap-2`}>
                      <span>🖼️</span> Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={data.image_url || ''}
                        onChange={(e) => updateChannel(platform.id as keyof SocialMeta, 'image_url', e.target.value)}
                        className={`flex-1 px-4 py-3 border-2 ${platform.borderColor} rounded-xl text-sm font-mono ${platform.focusRing} transition-all bg-white`}
                        placeholder="https://example.com/image.jpg"
                      />
                      {data.image_url && (
                        <button
                          onClick={() => window.open(data.image_url, '_blank')}
                          className={`px-4 py-3 ${platform.bgLight} ${platform.textColor} rounded-xl font-bold hover:opacity-80 transition-all`}
                        >
                          👁️
                        </button>
                      )}
                    </div>
                  </div>
                </Tooltip>

                {/* Preview Card */}
                {isExpanded && (data.title || data.description || data.image_url) && (
                  <div className={`mt-4 p-4 ${platform.bgLight} rounded-xl border-2 ${platform.borderColor}`}>
                    <p className="text-xs font-bold text-slate-600 uppercase mb-3 flex items-center gap-2">
                      <span>👀</span> Preview
                    </p>
                    <div className="bg-white rounded-lg overflow-hidden shadow-md border border-slate-200">
                      {data.image_url && (
                        <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                          <img src={data.image_url} alt="Preview" className="w-full h-full object-cover" onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<span>🖼️ Image Preview</span>';
                          }} />
                        </div>
                      )}
                      <div className="p-4">
                        {data.title && (
                          <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{data.title}</h4>
                        )}
                        {data.description && (
                          <p className="text-xs text-slate-600 line-clamp-2">{data.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div className={`${platform.bgLight} px-6 py-3 border-t-2 ${platform.borderColor} flex items-center justify-between`}>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full ${data.title && data.description ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                  <span className="text-slate-600 font-medium">
                    {data.title && data.description ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {[data.title, data.description, data.image_url].filter(Boolean).length}/3 fields
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-amber-900 mb-2">Best Practices</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• <strong>LinkedIn:</strong> Professional tone, 150-200 characters for title</li>
              <li>• <strong>Facebook:</strong> Engaging questions work well, 40-90 characters for title</li>
              <li>• <strong>Twitter:</strong> Concise and punchy, under 70 characters for title</li>
              <li>• <strong>Instagram:</strong> Visual-first, use emojis and hashtags in caption</li>
              <li>• <strong>Images:</strong> Recommended 1200x630px for optimal display across platforms</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMetaForm;
