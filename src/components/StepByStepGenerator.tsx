import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, ChevronRight, Sparkles, RefreshCw, Edit2, 
  Target, FileText, Image as ImageIcon, Layout, Eye 
} from 'lucide-react';

interface StepByStepGeneratorProps {
  token: string;
}

type Step = 'strategy' | 'copy' | 'images' | 'layout' | 'preview';

export default function StepByStepGenerator({ token }: StepByStepGeneratorProps) {
  const [currentStep, setCurrentStep] = useState<Step>('strategy');
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  
  // User input
  const [campaignBrief, setCampaignBrief] = useState('');
  const [campaignType, setCampaignType] = useState('promotional');
  const [tone, setTone] = useState('professional');
  
  // Step data
  const [strategyData, setStrategyData] = useState<any>(null);
  const [copyData, setCopyData] = useState<any>(null);
  const [imageData, setImageData] = useState<any>(null);
  const [layoutData, setLayoutData] = useState<any>(null);

  const steps = [
    { id: 'strategy' as Step, label: 'Strategy', icon: Target, desc: 'AI analyzes your campaign' },
    { id: 'copy' as Step, label: 'Copy', icon: FileText, desc: 'Review & edit headlines' },
    { id: 'images' as Step, label: 'Images', icon: ImageIcon, desc: 'Select products & images' },
    { id: 'layout' as Step, label: 'Layout', icon: Layout, desc: 'Choose email design' },
    { id: 'preview' as Step, label: 'Preview', icon: Eye, desc: 'Final review & export' }
  ];

  const approveStep = (step: Step, data: any) => {
    setCompletedSteps([...completedSteps, step]);
    
    // Save step data
    switch (step) {
      case 'strategy':
        setStrategyData(data);
        setCurrentStep('copy');
        break;
      case 'copy':
        setCopyData(data);
        setCurrentStep('images');
        break;
      case 'images':
        setImageData(data);
        setCurrentStep('layout');
        break;
      case 'layout':
        setLayoutData(data);
        setCurrentStep('preview');
        break;
    }
  };

  const regenerateStep = (step: Step) => {
    // Remove from completed and regenerate
    setCompletedSteps(completedSteps.filter(s => s !== step));
    // Trigger AI regeneration for this step
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="glass-card">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.id);
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'glass-button'
                      : isCompleted
                      ? 'glass-hover cursor-pointer'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                  disabled={!isCompleted && !isActive}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive ? 'bg-white/20' : isCompleted ? 'bg-green-500/20' : 'bg-white/5'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-green-300" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{step.label}</div>
                    <div className="text-[10px] opacity-70">{step.desc}</div>
                  </div>
                </button>
                
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-2 text-white/20" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Campaign Details</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Campaign Brief</label>
            <textarea
              value={campaignBrief}
              onChange={(e) => setCampaignBrief(e.target.value)}
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/20 resize-none"
              placeholder="e.g., Black Friday snowboard sale - 30% off all boards"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Campaign Type</label>
              <select
                value={campaignType}
                onChange={(e) => setCampaignType(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-white cursor-pointer"
              >
                <option value="promotional" className="bg-slate-900">Promotional</option>
                <option value="product_launch" className="bg-slate-900">Product Launch</option>
                <option value="newsletter" className="bg-slate-900">Newsletter</option>
                <option value="seasonal" className="bg-slate-900">Seasonal</option>
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-white cursor-pointer"
              >
                <option value="professional" className="bg-slate-900">Professional</option>
                <option value="luxury" className="bg-slate-900">Luxury</option>
                <option value="casual" className="bg-slate-900">Casual</option>
                <option value="playful" className="bg-slate-900">Playful</option>
                <option value="urgent" className="bg-slate-900">Urgent</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 'strategy' && (
          <StrategyStep 
            campaignBrief={campaignBrief}
            campaignType={campaignType}
            tone={tone}
            onApprove={(data) => approveStep('strategy', data)}
            onRegenerate={() => regenerateStep('strategy')}
          />
        )}
        
        {currentStep === 'copy' && (
          <CopyStep 
            strategyData={strategyData}
            onApprove={(data) => approveStep('copy', data)}
            onRegenerate={() => regenerateStep('copy')}
            onBack={() => setCurrentStep('strategy')}
          />
        )}
        
        {currentStep === 'images' && (
          <ImagesStep 
            strategyData={strategyData}
            copyData={copyData}
            onApprove={(data) => approveStep('images', data)}
            onRegenerate={() => regenerateStep('images')}
            onBack={() => setCurrentStep('copy')}
          />
        )}
        
        {currentStep === 'layout' && (
          <LayoutStep 
            strategyData={strategyData}
            copyData={copyData}
            imageData={imageData}
            onApprove={(data) => approveStep('layout', data)}
            onBack={() => setCurrentStep('images')}
          />
        )}
        
        {currentStep === 'preview' && (
          <PreviewStep 
            strategyData={strategyData}
            copyData={copyData}
            imageData={imageData}
            layoutData={layoutData}
            onBack={() => setCurrentStep('layout')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Step 1: Strategy Analysis
function StrategyStep({ campaignBrief, campaignType, tone, onApprove, onRegenerate }: any) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const canAnalyze = campaignBrief.trim().length > 0;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;
    
    setAnalyzing(true);
    // Mock analysis for now - will connect to real AI
    setTimeout(() => {
      setAnalysis({
        campaignType: campaignType,
        keywords: campaignBrief.toLowerCase().split(' ').filter(w => w.length > 3).slice(0, 5),
        targetAudience: campaignType === 'promotional' ? 'Deal seekers' : 'Product enthusiasts',
        urgency: campaignBrief.toLowerCase().includes('sale') ? 'high' : 'medium',
        suggestedProducts: 6,
        suggestedLayout: 'hero-grid',
        estimatedSections: ['hero', 'product-grid', 'cta', 'footer']
      });
      setAnalyzing(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-purple-300" />
        <div>
          <h3 className="text-xl font-bold text-white">Step 1: AI Strategy Analysis</h3>
          <p className="text-white/50 text-sm">AI analyzes your campaign brief</p>
        </div>
      </div>

      {!canAnalyze && (
        <div className="glass rounded-xl p-4 bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-yellow-200 text-sm">
            ⚠️ Please enter a campaign brief above to continue
          </p>
        </div>
      )}

      {!analysis ? (
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !canAnalyze}
          className="glass-button w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {analyzing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Analyze Campaign
            </>
          )}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-white/50 text-xs mb-1">Campaign Type</p>
              <p className="text-white font-medium">{analysis.campaignType}</p>
            </div>
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-white/50 text-xs mb-1">Urgency Level</p>
              <p className="text-white font-medium capitalize">{analysis.urgency}</p>
            </div>
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-white/50 text-xs mb-1">Keywords</p>
              <p className="text-white font-medium">{analysis.keywords.join(', ')}</p>
            </div>
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-white/50 text-xs mb-1">Target Audience</p>
              <p className="text-white font-medium">{analysis.targetAudience}</p>
            </div>
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-white/50 text-xs mb-1">Suggested Products</p>
              <p className="text-white font-medium">{analysis.suggestedProducts} products</p>
            </div>
            <div className="glass rounded-xl p-4 bg-white/5">
              <p className="text-white/50 text-xs mb-1">Suggested Layout</p>
              <p className="text-white font-medium capitalize">{analysis.suggestedLayout.replace('-', ' ')}</p>
            </div>
          </div>
          
          <div className="glass rounded-xl p-4 bg-purple-500/10 border border-purple-500/30">
            <p className="text-purple-200 text-sm font-medium mb-2">✨ AI Recommendation:</p>
            <p className="text-white/70 text-sm">
              Based on your brief, I recommend a <strong>{analysis.urgency}</strong> urgency approach 
              with <strong>{analysis.suggestedProducts}</strong> products in a <strong>{analysis.suggestedLayout}</strong> layout.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onApprove(analysis)}
              className="glass-button flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve & Continue
            </button>
            <button
              onClick={onRegenerate}
              className="glass-hover px-6 py-3 rounded-xl text-white/80 font-medium border border-white/20 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Step 2: Copy Review
function CopyStep({ strategyData, onApprove, onRegenerate, onBack }: any) {
  const [generating, setGenerating] = useState(false);
  const [copy, setCopy] = useState<any>(null);
  const [editingHeadline, setEditingHeadline] = useState(false);
  const [selectedHeadline, setSelectedHeadline] = useState(0);

  const handleGenerate = async () => {
    setGenerating(true);
    // Mock AI generation - will connect to real API
    setTimeout(() => {
      setCopy({
        headlineOptions: [
          "Gear Up for Winter - Premium Snowboards on Sale",
          "Hit the Slopes in Style - Save Big on Boards",
          "Your Best Season Starts Here - Limited Time Offer"
        ],
        subheadline: "Discover our premium collection of snowboards - perfect for every skill level",
        bodyParagraph: "Looking for the perfect snowboard? Our curated collection features top-tier boards designed for every riding style. From beginners to pros, find your ideal match and conquer the mountain.",
        heroCtaText: "Shop Snowboards",
        products: [
          {
            name: "The Collection Snowboard: Hydrogen",
            description: "Experience unmatched versatility with the Hydrogen - engineered for all-mountain performance and precision control",
            price: "$729.95",
            ctaText: "Buy Now"
          },
          {
            name: "The Collection Snowboard: Oxygen",
            description: "Elevate your ride with the Oxygen - premium craftsmanship meets cutting-edge design for ultimate performance",
            price: "$1,025.00",
            ctaText: "Shop Now"
          },
          {
            name: "The Multi-managed Snowboard",
            description: "Versatility redefined - handle any terrain with confidence and style with this adaptive all-mountain board",
            price: "$729.95",
            ctaText: "Discover More"
          }
        ]
      });
      setGenerating(false);
    }, 3000);
  };

  const updateHeadline = (index: number, value: string) => {
    const newOptions = [...copy.headlineOptions];
    newOptions[index] = value;
    setCopy({ ...copy, headlineOptions: newOptions });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-blue-300" />
        <div>
          <h3 className="text-xl font-bold text-white">Step 2: Review & Edit Copy</h3>
          <p className="text-white/50 text-sm">AI writes headlines and descriptions</p>
        </div>
      </div>

      {!copy ? (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="glass-button w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-3"
        >
          {generating ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="w-5 h-5" />
              </motion.div>
              Generating Copy...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Email Copy
            </>
          )}
        </button>
      ) : (
        <div className="space-y-6">
          {/* Headline Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-white/80 text-sm font-medium">
                Choose Headline (or edit)
              </label>
              <button
                onClick={onRegenerate}
                className="text-purple-300 text-xs hover:text-purple-200 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Regenerate All
              </button>
            </div>
            
            <div className="space-y-2">
              {copy.headlineOptions.map((headline: string, index: number) => (
                <div
                  key={index}
                  className={`glass rounded-xl p-4 cursor-pointer transition-all ${
                    selectedHeadline === index
                      ? 'border-2 border-purple-400/60 bg-purple-500/20'
                      : 'border border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedHeadline(index)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedHeadline === index ? 'border-purple-400 bg-purple-500' : 'border-white/20'
                      }`}>
                        {selectedHeadline === index && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>
                      {editingHeadline && selectedHeadline === index ? (
                        <input
                          type="text"
                          value={headline}
                          onChange={(e) => updateHeadline(index, e.target.value)}
                          onBlur={() => setEditingHeadline(false)}
                          className="flex-1 bg-transparent text-white outline-none"
                          autoFocus
                        />
                      ) : (
                        <span className="text-white font-medium flex-1">{headline}</span>
                      )}
                    </div>
                    {selectedHeadline === index && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingHeadline(true);
                        }}
                        className="text-purple-300 hover:text-purple-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subheadline */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Subheadline</label>
            <input
              type="text"
              value={copy.subheadline}
              onChange={(e) => setCopy({ ...copy, subheadline: e.target.value })}
              className="glass-input w-full px-4 py-3 rounded-xl text-white"
            />
          </div>

          {/* Body Paragraph */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-white/80 text-sm font-medium">Body Paragraph</label>
              <span className="text-white/40 text-xs">Optional</span>
            </div>
            <textarea
              value={copy.bodyParagraph}
              onChange={(e) => setCopy({ ...copy, bodyParagraph: e.target.value })}
              rows={3}
              className="glass-input w-full px-4 py-3 rounded-xl text-white resize-none"
            />
          </div>

          {/* Hero CTA */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">Main CTA Text</label>
            <input
              type="text"
              value={copy.heroCtaText}
              onChange={(e) => setCopy({ ...copy, heroCtaText: e.target.value })}
              className="glass-input w-full px-4 py-3 rounded-xl text-white"
            />
          </div>

          {/* Product Descriptions */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-3">
              Product Descriptions ({copy.products?.length || 0} products)
            </label>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {copy.products?.map((product: any, index: number) => (
                <div key={index} className="glass rounded-xl p-4 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white font-medium text-sm">{product.name}</p>
                    <span className="text-purple-300 text-sm font-semibold">{product.price}</span>
                  </div>
                  <textarea
                    value={product.description}
                    onChange={(e) => {
                      const newProducts = [...copy.products];
                      newProducts[index].description = e.target.value;
                      setCopy({ ...copy, products: newProducts });
                    }}
                    rows={2}
                    className="glass-input w-full px-3 py-2 rounded-lg text-white text-sm resize-none"
                  />
                  <div className="mt-2">
                    <input
                      type="text"
                      value={product.ctaText}
                      onChange={(e) => {
                        const newProducts = [...copy.products];
                        newProducts[index].ctaText = e.target.value;
                        setCopy({ ...copy, products: newProducts });
                      }}
                      className="glass-input w-full px-3 py-2 rounded-lg text-white text-xs"
                      placeholder="CTA text"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Complete Preview */}
          <div className="glass rounded-xl p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30">
            <p className="text-purple-200 text-sm font-medium mb-4">✨ Email Preview:</p>
            <div className="space-y-4">
              {/* Hero */}
              <div className="pb-4 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white mb-2">{copy.headlineOptions[selectedHeadline]}</h2>
                <p className="text-white/70 mb-3">{copy.subheadline}</p>
                {copy.bodyParagraph && (
                  <p className="text-white/60 text-sm mb-3">{copy.bodyParagraph}</p>
                )}
                <button className="glass-button px-6 py-3 rounded-lg text-white font-semibold">
                  {copy.heroCtaText}
                </button>
              </div>
              
              {/* Products */}
              <div>
                <p className="text-white/50 text-xs mb-2">PRODUCTS</p>
                {copy.products?.slice(0, 2).map((product: any, i: number) => (
                  <div key={i} className="mb-3">
                    <p className="text-white font-semibold text-sm">{product.name} - {product.price}</p>
                    <p className="text-white/60 text-xs">{product.description}</p>
                  </div>
                ))}
                {copy.products?.length > 2 && (
                  <p className="text-white/40 text-xs">+ {copy.products.length - 2} more products...</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={onBack}
              className="glass-hover px-6 py-3 rounded-xl text-white/80 border border-white/20"
            >
              Back
            </button>
            <button 
              onClick={() => onApprove({
                ...copy,
                selectedHeadline: copy.headlineOptions[selectedHeadline]
              })} 
              className="glass-button flex-1 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Approve & Continue
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Step 3: Image Selection
function ImagesStep({ onApprove, onBack }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <ImageIcon className="w-6 h-6 text-green-300" />
        <h3 className="text-xl font-bold text-white">Step 3: Select Images</h3>
      </div>
      
      <p className="text-white/50 text-sm mb-4">Image selection coming soon...</p>
      
      <div className="flex gap-3">
        <button onClick={onBack} className="glass-hover px-6 py-3 rounded-xl">Back</button>
        <button onClick={() => onApprove({})} className="glass-button flex-1 py-3 rounded-xl">
          Approve & Continue
        </button>
      </div>
    </motion.div>
  );
}

// Step 4: Layout Choice
function LayoutStep({ onApprove, onBack }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <Layout className="w-6 h-6 text-yellow-300" />
        <h3 className="text-xl font-bold text-white">Step 4: Choose Layout</h3>
      </div>
      
      <p className="text-white/50 text-sm mb-4">Layout selection coming soon...</p>
      
      <div className="flex gap-3">
        <button onClick={onBack} className="glass-hover px-6 py-3 rounded-xl">Back</button>
        <button onClick={() => onApprove({})} className="glass-button flex-1 py-3 rounded-xl">
          Generate Email
        </button>
      </div>
    </motion.div>
  );
}

// Step 5: Final Preview
function PreviewStep({ onBack }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <Eye className="w-6 h-6 text-pink-300" />
        <h3 className="text-xl font-bold text-white">Step 5: Final Preview</h3>
      </div>
      
      <p className="text-white/50 text-sm mb-4">Email preview coming soon...</p>
      
      <button onClick={onBack} className="glass-hover px-6 py-3 rounded-xl">Back</button>
    </motion.div>
  );
}

