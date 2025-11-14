import { motion } from 'framer-motion';
import { Wand2, Target, Image, Type } from 'lucide-react';

interface EmailStrategyProps {
  strategy: any;
  onStrategyChange: (strategy: any) => void;
}

export default function EmailStrategy({ strategy, onStrategyChange }: EmailStrategyProps) {
  const updateStrategy = (field: string, value: any) => {
    onStrategyChange({ ...strategy, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="glass-card space-y-6"
    >
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <Wand2 className="w-5 h-5 text-purple-300" />
        <h3 className="text-lg font-semibold text-white">AI Email Strategy</h3>
        <span className="text-xs text-white/50">Optional - customize how AI generates your email</span>
      </div>

      {/* Email Goal */}
      <div>
        <label className="block text-white/80 text-sm mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" />
          Email Goal
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: 'sales', label: 'Drive Sales', desc: 'Urgent & conversion' },
            { value: 'awareness', label: 'Build Awareness', desc: 'Educational' },
            { value: 'launch', label: 'Product Launch', desc: 'Storytelling' },
            { value: 'engagement', label: 'Engage', desc: 'Community' }
          ].map((goal) => (
            <button
              key={goal.value}
              type="button"
              onClick={() => updateStrategy('emailGoal', goal.value)}
              className={`px-3 py-3 rounded-lg transition-all text-left ${
                strategy.emailGoal === goal.value
                  ? 'bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white border border-white/20'
                  : 'glass-hover text-white/60 border border-white/10'
              }`}
            >
              <div className="text-xs font-semibold">{goal.label}</div>
              <div className="text-[10px] opacity-70 mt-1">{goal.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Copy Strategy */}
      <div>
        <label className="block text-white/80 text-sm mb-3 flex items-center gap-2">
          <Type className="w-4 h-4" />
          Copy Strategy
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Headline Style */}
          <div>
            <label className="block text-white/70 text-xs mb-2">Headline Style</label>
            <select
              value={strategy.headlineStyle || 'benefit'}
              onChange={(e) => updateStrategy('headlineStyle', e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-lg text-white text-sm cursor-pointer"
            >
              <option value="benefit" className="bg-slate-900">Benefit-Focused</option>
              <option value="urgency" className="bg-slate-900">Create Urgency</option>
              <option value="curiosity" className="bg-slate-900">Build Curiosity</option>
              <option value="direct" className="bg-slate-900">Direct Offer</option>
            </select>
          </div>

          {/* Copy Length */}
          <div>
            <label className="block text-white/70 text-xs mb-2">Copy Length</label>
            <select
              value={strategy.copyLength || 'concise'}
              onChange={(e) => updateStrategy('copyLength', e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-lg text-white text-sm cursor-pointer"
            >
              <option value="minimal" className="bg-slate-900">Minimal (short)</option>
              <option value="concise" className="bg-slate-900">Concise (medium)</option>
              <option value="detailed" className="bg-slate-900">Detailed (long)</option>
            </select>
          </div>
        </div>

        {/* Copy Options */}
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={strategy.useUrgency || false}
              onChange={(e) => updateStrategy('useUrgency', e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 cursor-pointer"
            />
            <span className="text-white/70 text-sm group-hover:text-white transition-colors">
              Use urgency language ("Limited time", "Ending soon")
            </span>
          </label>
          
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={strategy.useSocialProof || false}
              onChange={(e) => updateStrategy('useSocialProof', e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 cursor-pointer"
            />
            <span className="text-white/70 text-sm group-hover:text-white transition-colors">
              Include social proof ("Bestseller", "Customer favorite")
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={strategy.includeDiscount || false}
              onChange={(e) => updateStrategy('includeDiscount', e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 cursor-pointer"
            />
            <span className="text-white/70 text-sm group-hover:text-white transition-colors">
              Show discount code in email
            </span>
          </label>

          {strategy.includeDiscount && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="ml-7"
            >
              <input
                type="text"
                value={strategy.discountCode || ''}
                onChange={(e) => updateStrategy('discountCode', e.target.value)}
                placeholder="e.g., BLACKFRIDAY30"
                className="glass-input px-3 py-2 rounded-lg text-white text-sm w-full"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Image Strategy */}
      <div>
        <label className="block text-white/80 text-sm mb-3 flex items-center gap-2">
          <Image className="w-4 h-4" />
          Image Strategy
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Hero Image Type */}
          <div>
            <label className="block text-white/70 text-xs mb-2">Hero Image</label>
            <select
              value={strategy.heroImageType || 'lifestyle'}
              onChange={(e) => updateStrategy('heroImageType', e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-lg text-white text-sm cursor-pointer"
            >
              <option value="lifestyle" className="bg-slate-900">Lifestyle (people/styled)</option>
              <option value="product" className="bg-slate-900">Product Focus</option>
              <option value="graphic" className="bg-slate-900">Graphic/Banner</option>
              <option value="collection" className="bg-slate-900">Collection View</option>
            </select>
          </div>

          {/* Product Image Style */}
          <div>
            <label className="block text-white/70 text-xs mb-2">Product Images</label>
            <select
              value={strategy.productImageStyle || 'front'}
              onChange={(e) => updateStrategy('productImageStyle', e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-lg text-white text-sm cursor-pointer"
            >
              <option value="front" className="bg-slate-900">Front View</option>
              <option value="styled" className="bg-slate-900">Styled/Context</option>
              <option value="lifestyle" className="bg-slate-900">Lifestyle Shots</option>
              <option value="multi" className="bg-slate-900">Multiple Angles</option>
            </select>
          </div>
        </div>

        {strategy.productImageStyle === 'multi' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3"
          >
            <label className="block text-white/70 text-xs mb-2">Images per Product</label>
            <select
              value={strategy.imagesPerProduct || 2}
              onChange={(e) => updateStrategy('imagesPerProduct', parseInt(e.target.value))}
              className="glass-input w-full px-3 py-2 rounded-lg text-white text-sm cursor-pointer"
            >
              <option value="1" className="bg-slate-900">1 image</option>
              <option value="2" className="bg-slate-900">2 images</option>
              <option value="3" className="bg-slate-900">3 images</option>
            </select>
          </motion.div>
        )}
      </div>

      {/* Strategy Summary */}
      <div className="glass rounded-xl p-4 bg-purple-500/10 border border-purple-500/30">
        <p className="text-purple-200 text-sm font-medium mb-2">AI will:</p>
        <ul className="text-white/70 text-xs space-y-1">
          <li>✓ Write {strategy.headlineStyle || 'benefit'}-focused headlines</li>
          <li>✓ Use {strategy.copyLength || 'concise'} copy style</li>
          <li>✓ Select {strategy.heroImageType || 'lifestyle'} for hero</li>
          <li>✓ Use {strategy.productImageStyle || 'front'} product images</li>
          {strategy.useUrgency && <li>✓ Add urgency language</li>}
          {strategy.useSocialProof && <li>✓ Include social proof</li>}
          {strategy.includeDiscount && <li>✓ Display discount code</li>}
        </ul>
      </div>
    </motion.div>
  );
}

