import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Loader2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://aidesign-production.up.railway.app/api/v1';

interface EmailGeneratorProps {
  token: string;
}

export default function EmailGenerator({ token }: EmailGeneratorProps) {
  const [brief, setBrief] = useState('');
  const [campaignType, setCampaignType] = useState('promotional');
  const [tone, setTone] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [generatedEmail, setGeneratedEmail] = useState<any>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setGeneratedEmail(null);

    try {
      const response = await axios.post(
        `${API_URL}/emails/generate`,
        {
          campaignBrief: brief,
          campaignType,
          tone,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setJobId(response.data.jobId);
    } catch (error: any) {
      console.error('Generation failed:', error);
      setLoading(false);
    }
  };

  // Poll for status
  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${API_URL}/emails/generation-status/${jobId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStatus(response.data);

        if (response.data.status === 'completed') {
          clearInterval(interval);
          setLoading(false);
          
          // Fetch the generated email
          const emailResponse = await axios.get(
            `${API_URL}/emails/${response.data.emailId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setGeneratedEmail(emailResponse.data);
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (error) {
        console.error('Status check failed:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, token]);

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="glass rounded-xl p-2">
            <Sparkles className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Generate Email</h2>
            <p className="text-white/60 text-sm">Describe your campaign and let AI do the rest</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Campaign Brief */}
          <div>
            <label className="block text-white/80 font-medium mb-2">
              Campaign Brief
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              placeholder="e.g., Summer dress sale - 30% off this weekend"
              required
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 font-medium mb-2 text-sm">
                Campaign Type
              </label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="promotional">Promotional</option>
                <option value="product_launch">Product Launch</option>
                <option value="newsletter">Newsletter</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 font-medium mb-2 text-sm">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="professional">Professional</option>
                <option value="luxury">Luxury</option>
                <option value="casual">Casual</option>
                <option value="playful">Playful</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Generate Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="glass-button w-full py-4 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Email
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Progress Indicator */}
      {loading && status && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-medium">AI is working...</span>
            <span className="text-purple-300 font-bold text-lg">{status.progress || 0}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${status.progress || 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {status.currentStep && (
            <p className="text-white/60 text-sm mt-3">{status.currentStep}</p>
          )}
        </motion.div>
      )}

      {/* Success/Error Messages */}
      <AnimatePresence>
        {status?.status === 'completed' && generatedEmail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-6 border-2 border-green-500/30"
          >
            <div className="flex items-start gap-4">
              <div className="glass rounded-xl p-2 bg-green-500/20">
                <CheckCircle className="w-6 h-6 text-green-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">
                  Email Generated Successfully!
                </h3>
                <p className="text-white/80 mb-4">
                  Subject: {generatedEmail.subject_line}
                </p>
                <div className="flex gap-3">
                  <button className="glass-button px-6 py-2 rounded-xl text-white font-medium">
                    View Email
                  </button>
                  <button className="glass-hover px-6 py-2 rounded-xl text-white/80 font-medium border border-white/20">
                    Export to Klaviyo
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {status?.status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-6 border-2 border-red-500/30"
          >
            <div className="flex items-start gap-4">
              <div className="glass rounded-xl p-2 bg-red-500/20">
                <XCircle className="w-6 h-6 text-red-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Generation Failed
                </h3>
                <p className="text-white/60">{status.error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

