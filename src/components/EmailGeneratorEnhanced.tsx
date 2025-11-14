import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle, XCircle, Wand2, Package, AlertCircle, Code } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://aidesign-production.up.railway.app/api/v1';

interface Product {
  id: number;
  title: string;
  images: Array<{ src: string }>;
  price: string;
}

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
  
  // Product selection
  const [useAI, setUseAI] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  
  // Dev tools
  const [showDebug, setShowDebug] = useState(false);
  const [apiError, setApiError] = useState<any>(null);

  // Load collections on mount
  useEffect(() => {
    loadCollections();
  }, []);

  // Load products when switching to manual mode or collection changes
  useEffect(() => {
    if (!useAI) {
      loadProducts();
    }
  }, [useAI, selectedCollection]);

  const loadCollections = async () => {
    try {
      const response = await axios.get(`${API_URL}/shopify/collections`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCollections(response.data.collections || []);
    } catch (error) {
      console.error('Failed to load collections:', error);
    }
  };

  const loadProducts = async () => {
    setLoadingProducts(true);
    setApiError(null);
    try {
      let url = `${API_URL}/shopify/products-enhanced?limit=50&inStockOnly=true`;
      if (selectedCollection) {
        url += `&collectionId=${selectedCollection}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data.products || []);
    } catch (error: any) {
      console.error('Failed to load products:', error);
      setApiError({ endpoint: '/shopify/products', error: error.response?.data || error.message });
    } finally {
      setLoadingProducts(false);
    }
  };

  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : prev.length < 6 ? [...prev, productId] : prev // Max 6 products
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setGeneratedEmail(null);
    setApiError(null);

    try {
      const payload: any = {
        campaignBrief: brief,
        campaignType,
        tone,
      };

      if (!useAI && selectedProducts.length > 0) {
        payload.targetProducts = selectedProducts;
      }

      const response = await axios.post(
        `${API_URL}/emails/generate`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJobId(response.data.jobId);
    } catch (error: any) {
      console.error('Generation failed:', error);
      setApiError({ endpoint: '/emails/generate', error: error.response?.data || error.message });
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
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setStatus(response.data);

        if (response.data.status === 'completed') {
          clearInterval(interval);
          setLoading(false);

          const emailResponse = await axios.get(
            `${API_URL}/emails/${response.data.emailId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('Generated email data:', emailResponse.data);
          setGeneratedEmail(emailResponse.data);
        } else if (response.data.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (error: any) {
        setApiError({ endpoint: '/emails/generation-status', error: error.response?.data || error.message });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, token]);

  return (
    <div className="space-y-6">
      {/* Debug Panel */}
      {apiError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card border-red-500/30 bg-red-500/10"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-red-300 font-medium mb-2">API Error</p>
              <p className="text-white/60 text-sm mb-2">Endpoint: {apiError.endpoint}</p>
              <button
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-purple-300 hover:text-purple-200 flex items-center gap-1"
              >
                <Code className="w-3 h-3" />
                {showDebug ? 'Hide' : 'Show'} Details
              </button>
              {showDebug && (
                <pre className="mt-2 text-xs text-white/40 overflow-auto max-h-40 bg-black/20 p-2 rounded">
                  {JSON.stringify(apiError.error, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Generator Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="glass rounded-xl p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Sparkles className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Generate Email</h2>
            <p className="text-white/50 text-sm">Describe your campaign and let AI create something amazing</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Campaign Brief */}
          <div>
            <label className="block text-white/90 font-medium mb-3 text-sm">
              Campaign Brief
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/20 focus:outline-none resize-none"
              placeholder="e.g., Holiday gift card sale - perfect for last-minute shoppers"
              required
            />
            <p className="text-white/30 text-xs mt-2">
              💡 Be specific about products, discount, and target audience
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/90 font-medium mb-3 text-sm">
                Campaign Type
              </label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-white focus:outline-none cursor-pointer"
              >
                <option value="promotional" className="bg-slate-900">Promotional Sale</option>
                <option value="product_launch" className="bg-slate-900">Product Launch</option>
                <option value="newsletter" className="bg-slate-900">Newsletter</option>
                <option value="seasonal" className="bg-slate-900">Seasonal</option>
              </select>
            </div>

            <div>
              <label className="block text-white/90 font-medium mb-3 text-sm">
                Brand Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-white focus:outline-none cursor-pointer"
              >
                <option value="professional" className="bg-slate-900">Professional</option>
                <option value="luxury" className="bg-slate-900">Luxury</option>
                <option value="casual" className="bg-slate-900">Casual</option>
                <option value="playful" className="bg-slate-900">Playful</option>
                <option value="urgent" className="bg-slate-900">Urgent</option>
              </select>
            </div>
          </div>

          {/* Product Selection Mode */}
          <div>
            <label className="block text-white/90 font-medium mb-3 text-sm">
              Product Selection
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUseAI(true)}
                className={`relative overflow-hidden px-4 py-4 rounded-xl font-medium transition-all duration-300 ${
                  useAI
                    ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white border border-white/20 shadow-lg'
                    : 'glass-hover text-white/60 border border-white/10'
                }`}
              >
                {useAI && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse" />
                )}
                <div className="relative flex items-center justify-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  <span>Let AI Decide</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => setUseAI(false)}
                className={`relative overflow-hidden px-4 py-4 rounded-xl font-medium transition-all duration-300 ${
                  !useAI
                    ? 'bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white border border-white/20 shadow-lg'
                    : 'glass-hover text-white/60 border border-white/10'
                }`}
              >
                {!useAI && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 animate-pulse" />
                )}
                <div className="relative flex items-center justify-center gap-2">
                  <Package className="w-5 h-5" />
                  <span>Choose Products</span>
                </div>
              </button>
            </div>
          </div>

          {/* Manual Product Selection */}
          <AnimatePresence>
            {!useAI && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white/90 font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Select Products
                    <span className="text-sm font-normal text-purple-300">
                      ({selectedProducts.length}/6 selected)
                    </span>
                  </h3>
                  {loadingProducts && (
                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                  )}
                </div>

                {/* Collection Filter */}
                {collections.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-white/70 text-sm mb-2">Filter by Collection</label>
                    <select
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                      className="glass-input w-full px-4 py-2 rounded-lg text-white text-sm cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">All Products</option>
                      {collections.map((col) => (
                        <option key={col.id} value={col.shopify_collection_id} className="bg-slate-900">
                          {col.title} ({col.products_count} products)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
                    {products.map((product) => {
                      const isSelected = selectedProducts.includes(product.id);
                      return (
                        <motion.button
                          key={product.id}
                          type="button"
                          onClick={() => toggleProduct(product.id)}
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`relative glass rounded-xl p-3 border transition-all group ${
                            isSelected
                              ? 'border-purple-400/60 bg-purple-500/20 shadow-lg shadow-purple-500/20'
                              : 'border-white/10 hover:border-white/20'
                          }`}
                        >
                          {/* Product Image */}
                          {product.images[0] && (
                            <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-white/5">
                              <img
                                src={product.images[0].src}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                  <div className="glass rounded-full p-2 bg-purple-500/80">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Product Info */}
                          <p className="text-white text-sm font-medium truncate mb-1">
                            {product.title}
                          </p>
                          <p className="text-purple-300 text-sm font-semibold">
                            ${product.price}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    {loadingProducts ? (
                      <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
                    ) : (
                      <>
                        <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50 mb-2">No products found</p>
                        <p className="text-white/30 text-sm">
                          Go to Shopify tab and click "Sync Products"
                        </p>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Button */}
          <motion.button
            type="submit"
            disabled={loading || (!useAI && selectedProducts.length === 0)}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            className="glass-button w-full py-4 rounded-xl text-white font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
          >
            {!loading && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-pink-600/20 to-purple-600/0 animate-pulse" />
            )}
            <div className="relative flex items-center gap-3">
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Generating with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Email
                  {!useAI && selectedProducts.length > 0 && (
                    <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">
                      {selectedProducts.length} products
                    </span>
                  )}
                </>
              )}
            </div>
          </motion.button>
        </form>
      </motion.div>

      {/* Progress Indicator */}
      <AnimatePresence>
        {loading && status && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card border-purple-500/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                  <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-lg" />
                </div>
                <span className="text-white/90 font-medium">
                  {status.currentStep || 'AI is working...'}
                </span>
              </div>
              <span className="text-purple-300 font-bold text-xl">
                {status.progress || 0}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 relative"
                initial={{ width: 0 }}
                animate={{ width: `${status.progress || 0}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success State */}
      <AnimatePresence>
        {status?.status === 'completed' && generatedEmail && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card border-2 border-green-400/30 bg-green-500/5"
          >
            <div className="flex items-start gap-4">
              <div className="glass rounded-xl p-3 bg-green-500/20 border border-green-400/30">
                <CheckCircle className="w-7 h-7 text-green-300" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  Email Generated!
                  <span className="text-base font-normal text-green-300">✨</span>
                </h3>
                
                <div className="space-y-2 mb-6">
                  <div className="glass rounded-lg p-3 bg-white/5">
                    <p className="text-white/50 text-xs mb-1">Subject Line</p>
                    <p className="text-white font-medium">
                      {generatedEmail?.subject_line || generatedEmail?.email?.subject_line || 'No subject'}
                    </p>
                  </div>
                  {(generatedEmail?.preview_text || generatedEmail?.email?.preview_text) && (
                    <div className="glass rounded-lg p-3 bg-white/5">
                      <p className="text-white/50 text-xs mb-1">Preview Text</p>
                      <p className="text-white/80 text-sm">
                        {generatedEmail?.preview_text || generatedEmail?.email?.preview_text}
                      </p>
                    </div>
                  )}
                  
                  <div className="glass rounded-lg p-3 bg-white/5">
                    <p className="text-white/50 text-xs mb-1">Details</p>
                    <div className="text-white/60 text-xs space-y-1">
                      <p>Model: {generatedEmail?.model_used}</p>
                      <p>Products: {generatedEmail?.images_used?.length || 0} images</p>
                      <p>Cost: ${generatedEmail?.cost_usd}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const html = generatedEmail?.html_content || generatedEmail?.email?.html_content;
                      if (html) {
                        const win = window.open('', '_blank');
                        if (win) {
                          win.document.write(html);
                          win.document.close();
                        }
                      } else {
                        alert('No HTML content available');
                      }
                    }}
                    className="glass-button px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    View Email
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const html = generatedEmail?.html_content || generatedEmail?.email?.html_content;
                      if (html) {
                        const blob = new Blob([html], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `email-${Date.now()}.html`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                    className="glass-hover px-6 py-3 rounded-xl text-white/80 font-medium border border-white/20 flex items-center gap-2"
                  >
                    <Code className="w-4 h-4" />
                    Download HTML
                  </button>
                  <button
                    type="button"
                    className="glass-hover px-6 py-3 rounded-xl text-white/80 font-medium border border-white/20 flex items-center gap-2"
                  >
                    <Code className="w-4 h-4" />
                    View HTML
                  </button>
                  <button
                    type="button"
                    className="glass-hover px-6 py-3 rounded-xl text-white/80 font-medium border border-white/20"
                  >
                    Export to Klaviyo
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Failure State */}
        {status?.status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card border-2 border-red-400/30 bg-red-500/5"
          >
            <div className="flex items-start gap-4">
              <div className="glass rounded-xl p-3 bg-red-500/20 border border-red-400/30">
                <XCircle className="w-7 h-7 text-red-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Generation Failed
                </h3>
                <p className="text-white/60 mb-3">{status.error}</p>
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-sm text-purple-300 hover:text-purple-200 flex items-center gap-1"
                >
                  <Code className="w-3 h-3" />
                  {showDebug ? 'Hide' : 'Show'} Debug Info
                </button>
                {showDebug && status && (
                  <pre className="mt-3 text-xs text-white/40 overflow-auto max-h-40 bg-black/30 p-3 rounded-lg">
                    {JSON.stringify(status, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
