import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Save, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://aidesign-production.up.railway.app/api/v1';

interface BrandSetupProps {
  token: string;
}

export default function BrandSetup({ token }: BrandSetupProps) {
  const [brandName, setBrandName] = useState('My Store');
  const [brandVoice, setBrandVoice] = useState('professional');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Colors
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#666666');
  const [accentColor, setAccentColor] = useState('#0066CC');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  
  // Typography
  const [headingFont, setHeadingFont] = useState('Arial, sans-serif');
  const [bodyFont, setBodyFont] = useState('Arial, sans-serif');
  
  // Button Style
  const [buttonRadius, setButtonRadius] = useState('4px');
  const [buttonSize, setButtonSize] = useState('normal');
  
  // Footer
  const [footerLinks, setFooterLinks] = useState([
    { text: 'Unsubscribe', url: '{{unsubscribe_link}}' },
    { text: 'Contact Us', url: 'https://example.com/contact' },
    { text: 'Privacy Policy', url: 'https://example.com/privacy' }
  ]);
  const [footerTemplate, setFooterTemplate] = useState('minimal');
  
  const footerTemplates = {
    minimal: [
      { text: 'Unsubscribe', url: '{{unsubscribe_link}}' },
      { text: 'Contact Us', url: 'https://yourstore.com/contact' }
    ],
    standard: [
      { text: 'Shop', url: 'https://yourstore.com' },
      { text: 'About', url: 'https://yourstore.com/about' },
      { text: 'Contact', url: 'https://yourstore.com/contact' },
      { text: 'Unsubscribe', url: '{{unsubscribe_link}}' }
    ],
    social: [
      { text: 'Instagram', url: 'https://instagram.com/yourstore' },
      { text: 'Facebook', url: 'https://facebook.com/yourstore' },
      { text: 'Twitter', url: 'https://twitter.com/yourstore' },
      { text: 'Join Research Group', url: 'https://yourstore.com/research' },
      { text: 'Refer A Friend', url: 'https://yourstore.com/refer' },
      { text: 'Unsubscribe', url: '{{unsubscribe_link}}' }
    ]
  };
  
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load existing profile
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/brand/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.profile) {
        const p = response.data.profile;
        setBrandName(p.brand_name || 'My Store');
        setBrandVoice(p.brand_voice || 'professional');
        
        if (p.logo_urls) {
          const logos = typeof p.logo_urls === 'string' ? JSON.parse(p.logo_urls) : p.logo_urls;
          setLogoUrl(logos.header || '');
        }
        
        if (p.color_palette) {
          const colors = typeof p.color_palette === 'string' 
            ? JSON.parse(p.color_palette) 
            : p.color_palette;
          setPrimaryColor(colors.primary || '#000000');
          setSecondaryColor(colors.secondary || '#666666');
          setAccentColor(colors.accent || '#0066CC');
          setBackgroundColor(colors.background || '#FFFFFF');
        }
        
        if (p.typography) {
          const typo = typeof p.typography === 'string'
            ? JSON.parse(p.typography)
            : p.typography;
          setHeadingFont(typo.heading?.font || 'Arial, sans-serif');
          setBodyFont(typo.body?.font || 'Arial, sans-serif');
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('assetType', 'logo');

      const response = await axios.post(
        `${API_URL}/brand/upload-assets`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.assets?.[0]?.cdn_url) {
        setLogoUrl(response.data.assets[0].cdn_url);
      }
    } catch (err) {
      setError('Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      await axios.patch(
        `${API_URL}/brand/profile`,
        {
          brandName,
          brandVoice,
          logoUrls: {
            header: logoUrl,
            footer: logoUrl
          },
          colorPalette: {
            primary: primaryColor,
            secondary: secondaryColor,
            accent: accentColor,
            background: backgroundColor,
            text: '#1F1F1F'
          },
          typography: {
            heading: {
              font: headingFont,
              size: '32px',
              weight: 'bold'
            },
            body: {
              font: bodyFont,
              size: '14px',
              weight: 'normal'
            }
          },
          footerTemplate: footerTemplate,
          footerLinks: footerLinks
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="glass rounded-xl p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
              <Palette className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Brand Setup</h2>
              <p className="text-white/50 text-sm">Customize your email branding</p>
            </div>
          </div>

          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="glass-button px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Brand
              </>
            )}
          </motion.button>
        </div>

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-green-500/20 border border-green-400/30 text-green-200 text-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Brand settings saved successfully!
          </motion.div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </motion.div>

      {/* Logo Upload */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Logo</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Upload Logo</label>
            <div className="flex items-center gap-4">
              {logoUrl && (
                <div className="glass rounded-xl p-4 bg-white/5">
                  <img src={logoUrl} alt="Logo" className="h-16 max-w-[200px] object-contain" />
                </div>
              )}
              
              <label className="glass-hover px-6 py-3 rounded-xl text-white/80 font-medium border border-white/20 cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {uploadingLogo ? 'Uploading...' : logoUrl ? 'Change Logo' : 'Upload Logo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  disabled={uploadingLogo}
                />
              </label>
            </div>
            <p className="text-white/40 text-xs mt-2">
              PNG or JPG. Recommended: 200-400px wide, transparent background
            </p>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Brand Name</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-white"
              placeholder="My Store"
            />
            <p className="text-white/40 text-xs mt-1">Used if no logo uploaded</p>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Brand Voice</label>
            <select
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-white cursor-pointer"
            >
              <option value="professional" className="bg-slate-900">Professional</option>
              <option value="luxury" className="bg-slate-900">Luxury</option>
              <option value="casual" className="bg-slate-900">Casual</option>
              <option value="playful" className="bg-slate-900">Playful</option>
            </select>
            <p className="text-white/40 text-xs mt-1">Affects AI-generated copy tone</p>
          </div>
        </div>
      </motion.div>

      {/* Color Palette */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Color Palette</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Primary Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-16 h-12 rounded-lg cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="glass-input flex-1 px-4 py-3 rounded-xl text-white font-mono text-sm"
              />
            </div>
            <p className="text-white/40 text-xs mt-1">Buttons, CTAs</p>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Secondary Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-16 h-12 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="glass-input flex-1 px-4 py-3 rounded-xl text-white font-mono text-sm"
              />
            </div>
            <p className="text-white/40 text-xs mt-1">Text, descriptions</p>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Accent Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-16 h-12 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="glass-input flex-1 px-4 py-3 rounded-xl text-white font-mono text-sm"
              />
            </div>
            <p className="text-white/40 text-xs mt-1">Prices, highlights</p>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Background Color</label>
            <div className="flex gap-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-12 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="glass-input flex-1 px-4 py-3 rounded-xl text-white font-mono text-sm"
              />
            </div>
            <p className="text-white/40 text-xs mt-1">Email background</p>
          </div>
        </div>

        {/* Color Preview */}
        <div className="mt-6 glass rounded-xl p-6" style={{ backgroundColor: backgroundColor }}>
          <div className="flex gap-4 items-center justify-center">
            <button
              style={{ backgroundColor: primaryColor }}
              className="px-6 py-3 rounded-lg text-white font-semibold"
            >
              Primary Button
            </button>
            <span style={{ color: secondaryColor }} className="font-medium">
              Secondary Text
            </span>
            <span style={{ color: accentColor }} className="text-xl font-bold">
              $99.99
            </span>
          </div>
        </div>
      </motion.div>

      {/* Typography */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Typography</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Heading Font</label>
            <select
              value={headingFont}
              onChange={(e) => setHeadingFont(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-white cursor-pointer"
            >
              <option value="Arial, sans-serif" className="bg-slate-900">Arial</option>
              <option value="'Helvetica Neue', Helvetica, sans-serif" className="bg-slate-900">Helvetica</option>
              <option value="Georgia, serif" className="bg-slate-900">Georgia</option>
              <option value="'Times New Roman', serif" className="bg-slate-900">Times New Roman</option>
              <option value="'Courier New', monospace" className="bg-slate-900">Courier New</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Body Font</label>
            <select
              value={bodyFont}
              onChange={(e) => setBodyFont(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-white cursor-pointer"
            >
              <option value="Arial, sans-serif" className="bg-slate-900">Arial</option>
              <option value="'Helvetica Neue', Helvetica, sans-serif" className="bg-slate-900">Helvetica</option>
              <option value="Georgia, serif" className="bg-slate-900">Georgia</option>
              <option value="Verdana, sans-serif" className="bg-slate-900">Verdana</option>
            </select>
          </div>
        </div>

        {/* Font Preview */}
        <div className="mt-6 glass rounded-xl p-6 bg-white/5">
          <h2 style={{ fontFamily: headingFont }} className="text-2xl font-bold text-white mb-2">
            Sample Headline
          </h2>
          <p style={{ fontFamily: bodyFont }} className="text-white/70">
            This is how your email body text will look. The quick brown fox jumps over the lazy dog.
          </p>
        </div>
      </motion.div>

      {/* Button Style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Button Style</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Corner Radius</label>
            <select
              value={buttonRadius}
              onChange={(e) => setButtonRadius(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-white cursor-pointer"
            >
              <option value="0px" className="bg-slate-900">Sharp (0px)</option>
              <option value="4px" className="bg-slate-900">Rounded (4px)</option>
              <option value="8px" className="bg-slate-900">More Rounded (8px)</option>
              <option value="24px" className="bg-slate-900">Pill (24px)</option>
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm mb-2">Button Size</label>
            <select
              value={buttonSize}
              onChange={(e) => setButtonSize(e.target.value)}
              className="glass-input w-full px-4 py-3 rounded-xl text-white cursor-pointer"
            >
              <option value="compact" className="bg-slate-900">Compact</option>
              <option value="normal" className="bg-slate-900">Normal</option>
              <option value="large" className="bg-slate-900">Large</option>
            </select>
          </div>
        </div>

        {/* Button Preview */}
        <div className="mt-6 flex flex-wrap gap-4 items-center justify-center">
          <button
            style={{
              backgroundColor: primaryColor,
              borderRadius: buttonRadius,
              padding: buttonSize === 'compact' ? '8px 16px' : buttonSize === 'large' ? '16px 32px' : '12px 24px'
            }}
            className="text-white font-semibold"
          >
            Preview Button
          </button>
          
          <button
            style={{
              backgroundColor: 'transparent',
              border: `2px solid ${primaryColor}`,
              color: primaryColor,
              borderRadius: buttonRadius,
              padding: buttonSize === 'compact' ? '8px 16px' : buttonSize === 'large' ? '16px 32px' : '12px 24px'
            }}
            className="font-semibold"
          >
            Outline Style
          </button>
        </div>
      </motion.div>

      {/* Footer Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Email Footer</h3>
        
        {/* Footer Templates */}
        <div className="mb-6">
          <label className="block text-white/80 text-sm mb-3">Footer Design</label>
          <div className="grid grid-cols-3 gap-3">
            {/* Minimal */}
            <button
              type="button"
              onClick={() => {
                setFooterTemplate('minimal');
                setFooterLinks(footerTemplates.minimal);
              }}
              className={`group px-4 py-4 rounded-xl transition-all ${
                footerTemplate === 'minimal'
                  ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white border-2 border-white/40'
                  : 'glass-hover text-white/60 border-2 border-white/10'
              }`}
            >
              <div className="text-sm font-semibold mb-2">Minimal Clean</div>
              <div className="text-xs opacity-70 mb-3">Simple & elegant</div>
              <div className="glass rounded-lg p-2 bg-black/20">
                <div className="h-12 flex items-center justify-center">
                  <div className="text-[8px] text-white/50">Link | Link</div>
                </div>
              </div>
            </button>
            
            {/* Navigation */}
            <button
              type="button"
              onClick={() => {
                setFooterTemplate('navigation');
                setFooterLinks(footerTemplates.standard);
              }}
              className={`group px-4 py-4 rounded-xl transition-all ${
                footerTemplate === 'navigation'
                  ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white border-2 border-white/40'
                  : 'glass-hover text-white/60 border-2 border-white/10'
              }`}
            >
              <div className="text-sm font-semibold mb-2">Category Grid</div>
              <div className="text-xs opacity-70 mb-3">Navigation blocks</div>
              <div className="glass rounded-lg p-2 bg-black/20">
                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-white/10 rounded text-[6px] py-1">NEW</div>
                  <div className="bg-white/10 rounded text-[6px] py-1">SALE</div>
                </div>
              </div>
            </button>
            
            {/* Social */}
            <button
              type="button"
              onClick={() => {
                setFooterTemplate('social');
                setFooterLinks(footerTemplates.social);
              }}
              className={`group px-4 py-4 rounded-xl transition-all ${
                footerTemplate === 'social'
                  ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white border-2 border-white/40'
                  : 'glass-hover text-white/60 border-2 border-white/10'
              }`}
            >
              <div className="text-sm font-semibold mb-2">Social Links</div>
              <div className="text-xs opacity-70 mb-3">Full engagement</div>
              <div className="glass rounded-lg p-2 bg-black/20">
                <div className="space-y-1">
                  <div className="h-2 bg-white/10 rounded"></div>
                  <div className="h-2 bg-white/10 rounded"></div>
                  <div className="flex gap-1 justify-center mt-2">
                    <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <h4 className="text-sm font-medium text-white/70 mb-3">Customize Links</h4>
        <div className="space-y-3">
          {footerLinks.map((link, index) => (
            <div key={index} className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={link.text}
                onChange={(e) => {
                  const newLinks = [...footerLinks];
                  newLinks[index].text = e.target.value;
                  setFooterLinks(newLinks);
                }}
                className="glass-input px-4 py-2 rounded-lg text-white text-sm"
                placeholder="Link text"
              />
              <input
                type="text"
                value={link.url}
                onChange={(e) => {
                  const newLinks = [...footerLinks];
                  newLinks[index].url = e.target.value;
                  setFooterLinks(newLinks);
                }}
                className="glass-input px-4 py-2 rounded-lg text-white text-sm font-mono"
                placeholder="URL"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setFooterLinks([...footerLinks, { text: 'New Link', url: 'https://' }])}
            className="glass-hover px-4 py-2 rounded-lg text-white/70 text-sm border border-white/10"
          >
            + Add Link
          </button>
          {footerLinks.length > 1 && (
            <button
              type="button"
              onClick={() => setFooterLinks(footerLinks.slice(0, -1))}
              className="glass-hover px-4 py-2 rounded-lg text-white/70 text-sm border border-white/10"
            >
              Remove Last
            </button>
          )}
        </div>

        <p className="text-white/40 text-xs mt-4">
          💡 Use <code className="bg-white/10 px-1 rounded">{'{{unsubscribe_link}}'}</code> for Klaviyo unsubscribe
        </p>

        {/* Footer Preview */}
        <div className="mt-6 glass rounded-xl p-4 bg-black/30">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {footerLinks.map((link, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-white/30 mx-2">|</span>}
                  <a href="#" className="text-white/70 hover:text-white text-sm">
                    {link.text}
                  </a>
                </span>
              ))}
            </div>
            <p className="text-white/40 text-xs mt-3">
              © 2025 {brandName}. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Save Button (Bottom) */}
      <motion.button
        onClick={handleSave}
        disabled={saving}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className="glass-button w-full py-4 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-3"
      >
        {saving ? (
          <>Saving Brand Settings...</>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Brand Settings
          </>
        )}
      </motion.button>
    </div>
  );
}

