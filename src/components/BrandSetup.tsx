import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

interface BrandSetupProps {
  token: string;
}

export default function BrandSetup({ token }: BrandSetupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="glass rounded-xl p-2">
          <Palette className="w-6 h-6 text-blue-300" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Brand Setup</h2>
          <p className="text-white/60 text-sm">Configure your brand colors and style</p>
        </div>
      </div>

      <div className="text-center py-12 text-white/60">
        <p>Brand setup coming soon...</p>
        <p className="text-sm mt-2">For now, using default brand settings</p>
      </div>
    </motion.div>
  );
}

