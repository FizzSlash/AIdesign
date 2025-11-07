import { motion } from 'framer-motion';
import { ShoppingBag, CheckCircle } from 'lucide-react';

interface ShopifyConnectProps {
  token: string;
}

export default function ShopifyConnect({ token }: ShopifyConnectProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="glass rounded-xl p-2">
          <ShoppingBag className="w-6 h-6 text-green-300" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Shopify Connection</h2>
          <p className="text-white/60 text-sm">Manage your Shopify integration</p>
        </div>
      </div>

      <div className="glass-hover rounded-xl p-6 border border-green-500/30">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-300" />
          <div>
            <p className="text-white font-medium">Shopify Connected</p>
            <p className="text-white/60 text-sm">quickstart-dbfb6068.myshopify.com</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

