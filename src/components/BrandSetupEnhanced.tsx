import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, Save, Upload, CheckCircle, AlertCircle, Sparkles, 
  Globe, Loader, RefreshCw, Sliders, Eye, Settings 
} from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://aidesign-production.up.railway.app/api/v1';

interface BrandSetupEnhancedProps {
  token: string;
}

interface BrandProfile {
  brand_name: string;
  website_url: string;
  logo_urls: {
    primary?: string;
  };
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    heading: { font: string; weight: number };
    body: { font: string; weight: number };
  };
  brand_personality?: {
    tone: string;
    adjectives: string[];
    voice_description: string;
    formality_level: number;
  };
  visual_style?: {
    layout_preference: string;
    image_style: string;
    overlay_style: string;
    spacing: string;
  };
  messaging_preferences?: {
    cta_style: string;
    urgency_level: string;
    emoji_usage: string;
    sentence_length: string;
    common_ctas?: string[];
  };
  analysis_status?: string;
}

export default function BrandSetupEnhanced({ token }: BrandSetupEnhancedProps) {
  const [activeTab, setActiveTab] = useState<'analyze' | 'personality' | 'visual' | 'messaging'>('analyze');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [jobId, setJobId] = useState('');
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Personality sliders
  const [formalityLevel, setFormalityLevel] = useState(3);
  const [urgencyLevel, setUrgencyLevel] = useState(2);
  const [emojiUsage, setEmojiUsage] = useState(1);
  const [sentenceLength, setSentenceLength] = useState(2);

  // Load existing brand profile
  useEffect(() => {
    loadBrandProfile();
  }, []);

  const loadBrandProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/brand/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.profile) {
        const profile = response.data.profile;
        setBrandProfile(profile);
        
        // Set sliders from profile
        if (profile.brand_personality) {
          setFormalityLevel(profile.brand_personality.formality_level || 3);
        }
        if (profile.messaging_preferences) {
          setUrgencyLevel(
            profile.messaging_preferences.urgency_level === 'low' ? 1 :
            profile.messaging_preferences.urgency_level === 'medium' ? 2 : 3
          );
          setEmojiUsage(
            profile.messaging_preferences.emoji_usage === 'none' ? 0 :
            profile.messaging_preferences.emoji_usage === 'minimal' ? 1 :
            profile.messaging_preferences.emoji_usage === 'moderate' ? 2 : 3
          );
          setSentenceLength(
            profile.messaging_preferences.sentence_length === 'short' ? 1 :
            profile.messaging_preferences.sentence_length === 'medium' ? 2 : 3
          );
        }
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error('Error loading brand profile:', error);
      }
    }
  };

  const startAnalysis = async () => {
    if (!websiteUrl) {
      setMessage({ type: 'error', text: 'Please enter your website URL' });
      return;
    }

    setAnalyzing(true);
    setMessage(null);

    try {
      const response = await axios.post(
        `${API_URL}/brand/analyze-enhanced`,
        { websiteUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJobId(response.data.jobId);
      setMessage({ type: 'success', text: 'Analysis started! This will take 2-5 minutes...' });
      
      // Poll for status
      pollAnalysisStatus(response.data.jobId);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to start analysis' });
      setAnalyzing(false);
    }
  };

  const pollAnalysisStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/brand/analysis/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === 'completed') {
          clearInterval(interval);
          setAnalyzing(false);
          setMessage({ type: 'success', text: 'Brand analysis complete!' });
          loadBrandProfile();
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          setAnalyzing(false);
          setMessage({ type: 'error', text: 'Analysis failed. Please try again.' });
        }
      } catch (error) {
        clearInterval(interval);
        setAnalyzing(false);
        setMessage({ type: 'error', text: 'Error checking analysis status' });
      }
    }, 10000); // Check every 10 seconds
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage(null);

    try {
      await axios.patch(
        `${API_URL}/brand/profile`,
        {
          brand_personality: {
            formality_level: formalityLevel
          },
          messaging_preferences: {
            urgency_level: urgencyLevel === 1 ? 'low' : urgencyLevel === 2 ? 'medium' : 'high',
            emoji_usage: emojiUsage === 0 ? 'none' : emojiUsage === 1 ? 'minimal' : emojiUsage === 2 ? 'moderate' : 'heavy',
            sentence_length: sentenceLength === 1 ? 'short' : sentenceLength === 2 ? 'medium' : 'long'
          }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      loadBrandProfile();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'analyze' as const, label: 'Analyze Website', icon: Globe },
    { id: 'personality' as const, label: 'Brand Personality', icon: Sparkles },
    { id: 'visual' as const, label: 'Visual Style', icon: Palette },
    { id: 'messaging' as const, label: 'Messaging', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="glass rounded-xl p-2">
            <Sparkles className="w-6 h-6 text-purple-300" />
          </div>
          <h2 className="text-2xl font-bold text-white">Enhanced Brand Profile</h2>
        </div>
        <p className="text-white/60">
          AI-powered brand analysis with personality, visual style, and messaging preferences
        </p>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass rounded-xl p-4 flex items-center gap-3 ${
            message.type === 'success' ? 'border border-green-500/30' : 'border border-red-500/30'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <p className="text-white">{message.text}</p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="glass rounded-2xl p-2 flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1"
            >
              <motion.div
                className={`
                  relative px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2
                  ${isActive ? 'text-white' : 'text-white/60 hover:text-white/80'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-4 h-4" />
                <span className="relative z-10">{tab.label}</span>
              </motion.div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="glass rounded-2xl p-6"
      >
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Analyze Your Website</h3>
              <p className="text-white/60 mb-6">
                Enter your website URL and we'll analyze your brand personality, visual style, and messaging preferences using AI.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 mb-2">Website URL</label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://yourstore.com"
                    className="w-full glass-input"
                    disabled={analyzing}
                  />
                </div>

                <button
                  onClick={startAnalysis}
                  disabled={analyzing || !websiteUrl}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Analyzing... (2-5 minutes)
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze Website
                    </>
                  )}
                </button>
              </div>
            </div>

            {brandProfile && (
              <div className="mt-8 space-y-4">
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Analysis Complete
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-1">Brand Name</p>
                    <p className="text-white font-medium">{brandProfile.brand_name}</p>
                  </div>

                  {brandProfile.brand_personality && (
                    <>
                      <div className="glass rounded-xl p-4">
                        <p className="text-white/60 text-sm mb-1">Tone</p>
                        <p className="text-white font-medium capitalize">{brandProfile.brand_personality.tone}</p>
                      </div>

                      <div className="glass rounded-xl p-4">
                        <p className="text-white/60 text-sm mb-1">Formality Level</p>
                        <p className="text-white font-medium">{brandProfile.brand_personality.formality_level}/5</p>
                      </div>

                      <div className="glass rounded-xl p-4">
                        <p className="text-white/60 text-sm mb-1">Adjectives</p>
                        <p className="text-white font-medium">{brandProfile.brand_personality.adjectives.join(', ')}</p>
                      </div>
                    </>
                  )}
                </div>

                {brandProfile.brand_personality?.voice_description && (
                  <div className="glass rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-2">Brand Voice</p>
                    <p className="text-white">{brandProfile.brand_personality.voice_description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'personality' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Brand Personality</h3>
              <p className="text-white/60 mb-6">
                Adjust these settings to fine-tune how your brand communicates
              </p>
            </div>

            {/* Formality Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-white/80 font-medium">Formality Level</label>
                <span className="text-white/60 text-sm">{formalityLevel}/5</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formalityLevel}
                  onChange={(e) => setFormalityLevel(parseInt(e.target.value))}
                  className="w-full slider"
                />
                <div className="flex justify-between text-xs text-white/40">
                  <span>Very Casual</span>
                  <span>Balanced</span>
                  <span>Very Formal</span>
                </div>
              </div>
            </div>

            {/* Urgency Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-white/80 font-medium">Urgency Level</label>
                <span className="text-white/60 text-sm">
                  {urgencyLevel === 1 ? 'Low' : urgencyLevel === 2 ? 'Medium' : 'High'}
                </span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={urgencyLevel}
                  onChange={(e) => setUrgencyLevel(parseInt(e.target.value))}
                  className="w-full slider"
                />
                <div className="flex justify-between text-xs text-white/40">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            {/* Emoji Usage Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-white/80 font-medium">Emoji Usage</label>
                <span className="text-white/60 text-sm">
                  {emojiUsage === 0 ? 'None' : emojiUsage === 1 ? 'Minimal' : emojiUsage === 2 ? 'Moderate' : 'Heavy'}
                </span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={emojiUsage}
                  onChange={(e) => setEmojiUsage(parseInt(e.target.value))}
                  className="w-full slider"
                />
                <div className="flex justify-between text-xs text-white/40">
                  <span>None</span>
                  <span>Minimal</span>
                  <span>Moderate</span>
                  <span>Heavy</span>
                </div>
              </div>
            </div>

            {/* Sentence Length Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-white/80 font-medium">Sentence Length</label>
                <span className="text-white/60 text-sm">
                  {sentenceLength === 1 ? 'Short' : sentenceLength === 2 ? 'Medium' : 'Long'}
                </span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={sentenceLength}
                  onChange={(e) => setSentenceLength(parseInt(e.target.value))}
                  className="w-full slider"
                />
                <div className="flex justify-between text-xs text-white/40">
                  <span>Short & Punchy</span>
                  <span>Medium</span>
                  <span>Long & Descriptive</span>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="glass rounded-xl p-4 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-purple-300" />
                <p className="text-white/80 font-medium">Preview</p>
              </div>
              <div className="space-y-2">
                <p className="text-white text-sm">
                  {formalityLevel <= 2 ? "Hey there! 👋" : formalityLevel <= 3 ? "Hello!" : "Greetings,"}
                </p>
                <p className="text-white text-sm">
                  {sentenceLength === 1 
                    ? "New arrivals just dropped." 
                    : sentenceLength === 2 
                    ? "We're excited to share our latest collection with you."
                    : "We're thrilled to introduce our newest collection, carefully curated with your style in mind."}
                  {urgencyLevel === 3 && " Don't miss out!"}
                  {emojiUsage >= 2 && " ✨"}
                </p>
              </div>
            </div>

            <button
              onClick={saveSettings}
              disabled={saving}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Visual Style</h3>
              <p className="text-white/60 mb-6">
                Customize the visual appearance of your emails
              </p>
            </div>

            {brandProfile?.visual_style && (
              <div className="grid grid-cols-2 gap-4">
                <div className="glass rounded-xl p-4">
                  <p className="text-white/60 text-sm mb-1">Layout Preference</p>
                  <p className="text-white font-medium capitalize">{brandProfile.visual_style.layout_preference}</p>
                </div>

                <div className="glass rounded-xl p-4">
                  <p className="text-white/60 text-sm mb-1">Image Style</p>
                  <p className="text-white font-medium capitalize">{brandProfile.visual_style.image_style}</p>
                </div>

                <div className="glass rounded-xl p-4">
                  <p className="text-white/60 text-sm mb-1">Overlay Style</p>
                  <p className="text-white font-medium capitalize">{brandProfile.visual_style.overlay_style}</p>
                </div>

                <div className="glass rounded-xl p-4">
                  <p className="text-white/60 text-sm mb-1">Spacing</p>
                  <p className="text-white font-medium capitalize">{brandProfile.visual_style.spacing}</p>
                </div>
              </div>
            )}

            {!brandProfile?.visual_style && (
              <div className="glass rounded-xl p-6 text-center">
                <Globe className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">
                  Analyze your website first to get visual style recommendations
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messaging' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Messaging Preferences</h3>
              <p className="text-white/60 mb-6">
                How your brand communicates with customers
              </p>
            </div>

            {brandProfile?.messaging_preferences && (
              <div className="space-y-4">
                <div className="glass rounded-xl p-4">
                  <p className="text-white/60 text-sm mb-1">CTA Style</p>
                  <p className="text-white font-medium capitalize">{brandProfile.messaging_preferences.cta_style}</p>
                </div>

                {brandProfile.messaging_preferences.common_ctas && (
                  <div className="glass rounded-xl p-4">
                    <p className="text-white/60 text-sm mb-2">Common CTAs</p>
                    <div className="flex flex-wrap gap-2">
                      {brandProfile.messaging_preferences.common_ctas.map((cta, i) => (
                        <span key={i} className="glass rounded-lg px-3 py-1 text-sm text-white">
                          {cta}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!brandProfile?.messaging_preferences && (
              <div className="glass rounded-xl p-6 text-center">
                <Globe className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">
                  Analyze your website first to get messaging recommendations
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

