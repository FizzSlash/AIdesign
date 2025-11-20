import { motion } from 'framer-motion';
import { Star, TrendingUp, Palette, FileText, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface BrandAuditDisplayProps {
  audit: any;
}

export default function BrandAuditDisplay({ audit }: BrandAuditDisplayProps) {
  if (!audit.brand_identity && !audit.visual_dna && !audit.copy_audit && !audit.email_playbook) {
    return null;
  }

  return (
    <div className="space-y-6 mt-8">
      {/* Brand Score Header */}
      {audit.brand_identity?.brandScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Brand Audit Complete!</h3>
              <p className="text-white/80">{audit.brand_identity.brandSummary}</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {audit.brand_identity.brandScore}
              </div>
              <div className="text-white/60 text-sm">Brand Score</div>
              <div className="flex gap-1 mt-2 justify-center">
                {[...Array(10)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < audit.brand_identity.brandScore
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Stats Grid */}
      {audit.brand_identity && (
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Market Position</p>
            <p className="text-white font-bold capitalize">{audit.brand_identity.marketPosition}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Brand Archetype</p>
            <p className="text-white font-bold capitalize">{audit.brand_identity.brandArchetype}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-white/60 text-sm mb-1">Target Age</p>
            <p className="text-white font-bold">{audit.brand_identity.targetDemographic?.ageRange || 'N/A'}</p>
          </div>
        </div>
      )}

      {/* Visual DNA Section */}
      {audit.visual_dna && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-6 h-6 text-purple-300" />
            <h3 className="text-xl font-bold text-white">Visual DNA</h3>
          </div>

          <div className="space-y-4">
            {/* Design Philosophy */}
            {audit.visual_dna.designPhilosophy && (
              <div className="glass rounded-xl p-4">
                <p className="text-white/60 text-sm mb-2">Design Philosophy</p>
                <p className="text-white">{audit.visual_dna.designPhilosophy}</p>
              </div>
            )}

            {/* Color Psychology */}
            {audit.visual_dna.colorPsychology && (
              <div>
                <p className="text-white/80 font-medium mb-3">Color Psychology</p>
                <div className="grid grid-cols-3 gap-3">
                  {audit.visual_dna.colorPsychology.primary && (
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-lg border-2 border-white/20" 
                          style={{ backgroundColor: audit.visual_dna.colorPsychology.primary.hex }}
                        />
                        <p className="text-white/60 text-sm">Primary</p>
                      </div>
                      <p className="text-white text-sm font-medium mb-1">{audit.visual_dna.colorPsychology.primary.meaning}</p>
                      <p className="text-white/60 text-xs">{audit.visual_dna.colorPsychology.primary.emotion}</p>
                    </div>
                  )}
                  {audit.visual_dna.colorPsychology.secondary && (
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-lg border-2 border-white/20" 
                          style={{ backgroundColor: audit.visual_dna.colorPsychology.secondary.hex }}
                        />
                        <p className="text-white/60 text-sm">Secondary</p>
                      </div>
                      <p className="text-white text-sm font-medium">{audit.visual_dna.colorPsychology.secondary.meaning}</p>
                    </div>
                  )}
                  {audit.visual_dna.colorPsychology.accent && (
                    <div className="glass rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-lg border-2 border-white/20" 
                          style={{ backgroundColor: audit.visual_dna.colorPsychology.accent.hex }}
                        />
                        <p className="text-white/60 text-sm">Accent</p>
                      </div>
                      <p className="text-white text-sm font-medium">{audit.visual_dna.colorPsychology.accent.purpose}</p>
                    </div>
                  )}
                </div>
                {audit.visual_dna.colorPsychology.colorStory && (
                  <div className="glass rounded-xl p-4 mt-3">
                    <p className="text-white/60 text-xs mb-1">Color Story</p>
                    <p className="text-white text-sm">{audit.visual_dna.colorPsychology.colorStory}</p>
                  </div>
                )}
              </div>
            )}

            {/* Typography */}
            {audit.visual_dna.typography && (
              <div className="glass rounded-xl p-4">
                <p className="text-white/80 font-medium mb-3">Typography</p>
                <div className="grid grid-cols-2 gap-3">
                  {audit.visual_dna.typography.headingFont && (
                    <div>
                      <p className="text-white/60 text-xs mb-1">Heading Font</p>
                      <p className="text-white font-bold mb-1">{audit.visual_dna.typography.headingFont.name}</p>
                      <p className="text-white/60 text-xs">{audit.visual_dna.typography.headingFont.personality}</p>
                    </div>
                  )}
                  {audit.visual_dna.typography.bodyFont && (
                    <div>
                      <p className="text-white/60 text-xs mb-1">Body Font</p>
                      <p className="text-white mb-1">{audit.visual_dna.typography.bodyFont.name}</p>
                      <p className="text-white/60 text-xs">{audit.visual_dna.typography.bodyFont.readability}</p>
                    </div>
                  )}
                </div>
                {audit.visual_dna.typography.fontPairing && (
                  <p className="text-white/70 text-sm mt-2 italic">{audit.visual_dna.typography.fontPairing}</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Copy Audit Section */}
      {audit.copy_audit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-blue-300" />
            <h3 className="text-xl font-bold text-white">Copy & Messaging Audit</h3>
          </div>

          <div className="space-y-4">
            {/* Writing Style */}
            {audit.copy_audit.writingStyle && (
              <div className="glass rounded-xl p-4">
                <p className="text-white/80 font-medium mb-3">Writing Style</p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Sentence Length</p>
                    <p className="text-white capitalize">{audit.copy_audit.writingStyle.sentenceLength}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Complexity</p>
                    <p className="text-white capitalize">{audit.copy_audit.writingStyle.complexity}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Reading Level</p>
                    <p className="text-white capitalize">{audit.copy_audit.writingStyle.readingLevel}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Headline Formulas */}
            {audit.copy_audit.headlineFormulas && audit.copy_audit.headlineFormulas.length > 0 && (
              <div>
                <p className="text-white/80 font-medium mb-3">Headline Formulas</p>
                <div className="space-y-2">
                  {audit.copy_audit.headlineFormulas.map((formula: any, i: number) => (
                    <div key={i} className="glass rounded-xl p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm mb-1">{formula.pattern}</p>
                          <p className="text-white/60 text-xs italic">"{formula.example}"</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          formula.effectiveness === 'high' ? 'bg-green-500/20 text-green-300' :
                          formula.effectiveness === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {formula.effectiveness}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Emotional Drivers */}
            {audit.copy_audit.emotionalDrivers && audit.copy_audit.emotionalDrivers.length > 0 && (
              <div>
                <p className="text-white/80 font-medium mb-3">Emotional Drivers</p>
                <div className="flex flex-wrap gap-2">
                  {audit.copy_audit.emotionalDrivers.map((driver: any, i: number) => (
                    <div key={i} className="glass rounded-lg px-3 py-2">
                      <p className="text-white text-sm font-medium capitalize">{driver.emotion}</p>
                      <p className="text-white/60 text-xs">{driver.frequency} frequency</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messaging Pillars */}
            {audit.copy_audit.messagingPillars && audit.copy_audit.messagingPillars.length > 0 && (
              <div>
                <p className="text-white/80 font-medium mb-3">Messaging Pillars</p>
                <div className="space-y-2">
                  {audit.copy_audit.messagingPillars.map((pillar: any, i: number) => (
                    <div key={i} className="glass rounded-xl p-3">
                      <p className="text-white font-medium mb-1">{pillar.theme}</p>
                      <p className="text-white/70 text-sm">{pillar.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Email Playbook Section */}
      {audit.email_playbook && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-green-300" />
            <h3 className="text-xl font-bold text-white">Email Playbook</h3>
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Recommendations</span>
          </div>

          <div className="space-y-6">
            {/* Recommended Layouts */}
            {audit.email_playbook.recommendedLayouts && audit.email_playbook.recommendedLayouts.length > 0 && (
              <div>
                <p className="text-white/80 font-medium mb-3">Recommended Email Layouts</p>
                <div className="space-y-3">
                  {audit.email_playbook.recommendedLayouts.map((layout: any, i: number) => (
                    <div key={i} className="glass rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="glass rounded-lg p-2 mt-1">
                          <TrendingUp className="w-4 h-4 text-purple-300" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium mb-1">{layout.name}</p>
                          <p className="text-white/70 text-sm mb-2">{layout.description}</p>
                          <div className="flex gap-4 text-xs">
                            <div>
                              <span className="text-white/60">Best for: </span>
                              <span className="text-white">{layout.whenToUse}</span>
                            </div>
                          </div>
                          {layout.rationale && (
                            <p className="text-white/60 text-xs mt-2 italic">💡 {layout.rationale}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Headline Templates */}
            {audit.email_playbook.headlineTemplates && audit.email_playbook.headlineTemplates.length > 0 && (
              <div>
                <p className="text-white/80 font-medium mb-3">Headline Templates</p>
                <div className="space-y-2">
                  {audit.email_playbook.headlineTemplates.map((template: any, i: number) => (
                    <div key={i} className="glass rounded-xl p-3">
                      <p className="text-purple-300 text-sm font-mono mb-1">{template.template}</p>
                      <p className="text-white text-sm italic mb-1">"{template.example}"</p>
                      <p className="text-white/60 text-xs">{template.whenToUse}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audience Guidelines */}
            {audit.email_playbook.audienceGuidelines && (
              <div>
                <p className="text-white/80 font-medium mb-3">Audience-Specific Guidelines</p>
                <div className="grid gap-3">
                  {audit.email_playbook.audienceGuidelines.newCustomers && (
                    <div className="glass rounded-xl p-4">
                      <p className="text-white font-medium mb-2">🎯 New Customers</p>
                      <p className="text-white/70 text-sm mb-2">Tone: {audit.email_playbook.audienceGuidelines.newCustomers.tone}</p>
                      <p className="text-white/70 text-sm mb-2">Focus: {audit.email_playbook.audienceGuidelines.newCustomers.focus}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {audit.email_playbook.audienceGuidelines.newCustomers.ctas?.map((cta: string, i: number) => (
                          <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            {cta}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {audit.email_playbook.audienceGuidelines.loyal && (
                    <div className="glass rounded-xl p-4">
                      <p className="text-white font-medium mb-2">💎 Loyal Customers</p>
                      <p className="text-white/70 text-sm mb-2">Tone: {audit.email_playbook.audienceGuidelines.loyal.tone}</p>
                      <p className="text-white/70 text-sm mb-2">Focus: {audit.email_playbook.audienceGuidelines.loyal.focus}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {audit.email_playbook.audienceGuidelines.loyal.ctas?.map((cta: string, i: number) => (
                          <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                            {cta}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {audit.email_playbook.audienceGuidelines.vip && (
                    <div className="glass rounded-xl p-4">
                      <p className="text-white font-medium mb-2">👑 VIP Customers</p>
                      <p className="text-white/70 text-sm mb-2">Tone: {audit.email_playbook.audienceGuidelines.vip.tone}</p>
                      <p className="text-white/70 text-sm mb-2">Focus: {audit.email_playbook.audienceGuidelines.vip.focus}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {audit.email_playbook.audienceGuidelines.vip.ctas?.map((cta: string, i: number) => (
                          <span key={i} className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                            {cta}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Do's and Don'ts */}
            {(audit.email_playbook.doThis || audit.email_playbook.avoidThis) && (
              <div className="grid grid-cols-2 gap-4">
                {audit.email_playbook.doThis && (
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <p className="text-white font-medium">Do This</p>
                    </div>
                    <ul className="space-y-2">
                      {audit.email_playbook.doThis.map((item: string, i: number) => (
                        <li key={i} className="text-white/70 text-sm flex gap-2">
                          <span>✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {audit.email_playbook.avoidThis && (
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <p className="text-white font-medium">Avoid This</p>
                    </div>
                    <ul className="space-y-2">
                      {audit.email_playbook.avoidThis.map((item: string, i: number) => (
                        <li key={i} className="text-white/70 text-sm flex gap-2">
                          <span>✗</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

