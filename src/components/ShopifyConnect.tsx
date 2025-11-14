import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, CheckCircle, RefreshCw, Package, AlertCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = 'https://aidesign-production.up.railway.app/api/v1';

interface ShopifyConnectProps {
  token: string;
}

export default function ShopifyConnect({ token }: ShopifyConnectProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const response = await axios.post(
        `${API_URL}/shopify/sync`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSyncResult(response.data);
    } catch (error: any) {
      setSyncResult({ error: error.response?.data?.error || error.message || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="glass rounded-xl p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20">
            <ShoppingBag className="w-6 h-6 text-green-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Shopify Connection</h2>
            <p className="text-white/50 text-sm">Manage your product catalog</p>
          </div>
        </div>

        {/* Connection Info */}
        <div className="glass rounded-xl p-5 border border-green-400/20 bg-green-500/5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <CheckCircle className="w-6 h-6 text-green-300" />
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-md" />
              </div>
              <div>
                <p className="text-white font-semibold">Store Connected</p>
                <p className="text-white/50 text-sm font-mono">quickstart-dbfb6068.myshopify.com</p>
              </div>
            </div>
            
            <motion.button
              onClick={handleSync}
              disabled={syncing}
              whileHover={{ scale: syncing ? 1 : 1.05 }}
              whileTap={{ scale: syncing ? 1 : 0.95 }}
              className="glass-button px-5 py-3 rounded-xl text-white font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Products'}
            </motion.button>
          </div>
        </div>

        {/* Sync Results */}
        <AnimatePresence>
          {syncResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`glass rounded-xl p-5 border ${
                syncResult.error 
                  ? 'border-red-400/30 bg-red-500/5' 
                  : 'border-green-400/30 bg-green-500/5'
              }`}
            >
              {syncResult.error ? (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 font-medium mb-1">Sync Failed</p>
                    <p className="text-white/60 text-sm">{syncResult.error}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-green-300 mb-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Sync Complete!</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="glass rounded-lg p-4 bg-white/5 text-center">
                      <TrendingUp className="w-6 h-6 text-purple-300 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white mb-1">
                        {syncResult.productsSync || 0}
                      </p>
                      <p className="text-white/50 text-xs">Products</p>
                    </div>
                    
                    <div className="glass rounded-lg p-4 bg-white/5 text-center">
                      <Package className="w-6 h-6 text-blue-300 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white mb-1">
                        {syncResult.collectionsFound || 0}
                      </p>
                      <p className="text-white/50 text-xs">Collections</p>
                    </div>
                    
                    <div className="glass rounded-lg p-4 bg-white/5 text-center">
                      <ShoppingBag className="w-6 h-6 text-pink-300 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white mb-1">
                        {syncResult.imagesStored || 0}
                      </p>
                      <p className="text-white/50 text-xs">Images</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Box */}
        <div className="mt-6 glass rounded-xl p-4 border border-purple-500/20 bg-purple-500/5">
          <p className="text-white/70 text-sm leading-relaxed">
            <span className="text-purple-300 font-semibold">💡 Pro Tip:</span> Sync your products regularly to keep your catalog up-to-date. 
            All product images and data will be available when generating emails.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import { AnimatePresence } from 'framer-motion';
