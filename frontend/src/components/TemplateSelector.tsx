import { useState } from 'react';
import { ENVELOPE_TEMPLATES, getTemplateDefaults, getTemplatesByCategory } from '../utils/templates';
import type { EnvelopeTemplate } from '../utils/templates';

interface TemplateSelectorProps {
  onSelectTemplate: (defaults: {
    amount: string;
    unlockTime: string;
    expiryTime: string;
    secretHint: string;
  }) => void;

}


//what do i want to be when i grow up i actually want to die in the arms of the solitude because i am tired of living a fake life pretending to be happy when inside i am dying a little more each day and the pain is unbearable and i just want   

export function TemplateSelector({ onSelectTemplate }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'inheritance' | 'gift' | 'savings' | 'payment'>('all');
  const templatesByCategory = getTemplatesByCategory();
  
  const categories = [
    { id: 'all' as const, name: 'All Templates', icon: '📚', count: ENVELOPE_TEMPLATES.length },
    { id: 'inheritance' as const, name: 'Inheritance', icon: '👨‍👩‍👧', count: templatesByCategory.inheritance.length },
    { id: 'gift' as const, name: 'Gifts', icon: '🎁', count: templatesByCategory.gift.length },
    { id: 'savings' as const, name: 'Savings', icon: '💰', count: templatesByCategory.savings.length },
    { id: 'payment' as const, name: 'Payments', icon: '💳', count: templatesByCategory.payment.length },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? ENVELOPE_TEMPLATES 
    : ENVELOPE_TEMPLATES.filter(t => t.category === selectedCategory);

  const handleTemplateClick = (template: EnvelopeTemplate) => {
    const defaults = getTemplateDefaults(template);
    onSelectTemplate(defaults);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="aurora-text text-3xl font-bold mb-2">📋 Envelope Templates</h2>
        <p className="text-gray-400">Quick-start templates for common use cases</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`
              magnetic-button px-4 py-2 rounded-lg font-medium transition-all
              ${selectedCategory === cat.id 
                ? 'holographic border-glow neon-text' 
                : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }
            `}
          >
            <span className="mr-2">{cat.icon}</span>
            {cat.name}
            <span className="ml-2 text-xs opacity-75">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => handleTemplateClick(template)}
            className="holographic ripple-effect p-5 rounded-xl text-left hover:scale-105 transition-all duration-300"
          >
            <div className="text-4xl mb-3">{template.icon}</div>
            <h3 className="aurora-text text-lg font-bold mb-2">{template.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{template.description}</p>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="neon-text font-medium">{template.defaultAmount || 'Custom'} XLM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Unlock:</span>
                <span className="text-purple-400">
                  {template.unlockDays >= 365 
                    ? `${Math.floor(template.unlockDays / 365)}y` 
                    : `${template.unlockDays}d`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valid for:</span>
                <span className="text-blue-400">
                  {template.expiryDays >= 365 
                    ? `${Math.floor(template.expiryDays / 365)}y` 
                    : `${template.expiryDays}d`}
                </span>
              </div>
            </div>

            {template.secretHint && (
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="text-xs text-gray-500">Hint: <span className="text-gray-400">{template.secretHint}</span></div>
              </div>
            )}
          </button>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No templates in this category yet
        </div>
      )}
    </div>
  );
}
