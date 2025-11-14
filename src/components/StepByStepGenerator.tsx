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

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 'strategy' && (
          <StrategyStep 
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
function StrategyStep({ onApprove, onRegenerate }: any) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    // Call AI to analyze campaign brief
    setTimeout(() => {
      setAnalysis({
        campaignType: 'Promotional',
        keywords: ['snowboard', 'winter', 'sports'],
        targetAudience: 'Outdoor enthusiasts',
        urgency: 'medium',
        suggestedTone: 'energetic'
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

      {!analysis ? (
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="glass-button w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-3"
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
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="glass-card"
    >
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-blue-300" />
        <h3 className="text-xl font-bold text-white">Step 2: Review Copy</h3>
      </div>
      
      <p className="text-white/50 text-sm mb-4">Copy step coming soon...</p>
      
      <div className="flex gap-3">
        <button onClick={onBack} className="glass-hover px-6 py-3 rounded-xl">Back</button>
        <button onClick={() => onApprove({})} className="glass-button flex-1 py-3 rounded-xl">
          Approve & Continue
        </button>
      </div>
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

