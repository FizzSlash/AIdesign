import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mail, Palette, ShoppingBag, LogOut, Zap } from 'lucide-react';
import EmailGenerator from './EmailGeneratorEnhanced';
import BrandSetup from './BrandSetup';
import ShopifyConnect from './ShopifyConnect';

interface DashboardProps {
  token: string;
}

type View = 'generate' | 'brand' | 'shopify';

export default function Dashboard({ token }: DashboardProps) {
  const [currentView, setCurrentView] = useState<View>('generate');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  const navItems = [
    { id: 'generate' as View, icon: Zap, label: 'Generate Email', color: 'from-purple-500 to-pink-500' },
    { id: 'brand' as View, icon: Palette, label: 'Brand Setup', color: 'from-blue-500 to-cyan-500' },
    { id: 'shopify' as View, icon: ShoppingBag, label: 'Shopify', color: 'from-green-500 to-emerald-500' },
  ];

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ top: '20%', left: '10%' }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          style={{ bottom: '20%', right: '10%' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="glass rounded-xl p-2">
              <Sparkles className="w-6 h-6 text-purple-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI Email Designer</h1>
              <p className="text-white/60 text-sm">Create stunning emails with AI</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="glass-hover px-4 py-2 rounded-xl text-white/80 hover:text-white flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-2 mb-6 flex gap-2"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className="relative flex-1"
              >
                <motion.div
                  className={`
                    relative px-6 py-3 rounded-xl font-medium transition-all duration-300
                    ${isActive 
                      ? 'text-white' 
                      : 'text-white/60 hover:text-white/80'
                    }
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl opacity-80`}
                      transition={{ type: 'spring', duration: 0.6 }}
                    />
                  )}
                  <div className="relative flex items-center justify-center gap-2">
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </div>
                </motion.div>
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'generate' && <EmailGenerator token={token} />}
            {currentView === 'brand' && <BrandSetup token={token} />}
            {currentView === 'shopify' && <ShopifyConnect token={token} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

