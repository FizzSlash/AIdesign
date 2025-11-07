import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, CheckCircle, RefreshCw, Package } from 'lucide-react';
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
      setSyncResult({ error: error.response?.data?.error || 'Sync failed' });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Connection Status */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="glass rounded-xl p-2">
            <ShoppingBag className="w-6 h-6 text-green-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Shopify Connection</h2>
            <p className="text-white/60 text-sm">Manage your Shopify integration</p>
          </div>
        </div>

        <div className="glass-hover rounded-xl p-6 border border-green-500/30 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-300" />
              <div>
                <p className="text-white font-medium">Shopify Connected</p>
                <p className="text-white/60 text-sm">quickstart-dbfb6068.myshopify.com</p>
              </div>
            </div>
            
            <motion.button
              onClick={handleSync}
              disabled={syncing}
              whileHover={{ scale: syncing ? 1 : 1.05 }}
              whileTap={{ scale: syncing ? 1 : 0.95 }}
              className="glass-button px-6 py-3 rounded-xl text-white font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Products'}
            </motion.button>
          </div>
        </div>

        {/* Sync Result */}
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass rounded-xl p-6 border ${
              syncResult.error ? 'border-red-500/30' : 'border-green-500/30'
            }`}
          >
            {syncResult.error ? (
              <p className="text-red-300">Error: {syncResult.error}</p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-300">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Sync Complete!</span>
                </div>
                <div className="text-white/80 text-sm space-y-1">
                  <p>Products synced: {syncResult.productsSync || 0}</p>
                  <p>Collections found: {syncResult.collectionsFound || 0}</p>
                  <p>Images stored: {syncResult.imagesStored || 0}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="mt-6 glass rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm">
            💡 <strong className="text-white">Tip:</strong> Click "Sync Products" to pull all your Shopify products and images. 
            This makes them available when generating emails.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
