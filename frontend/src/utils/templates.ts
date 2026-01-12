// Envelope Templates for Quick Creation

export interface EnvelopeTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'inheritance' | 'gift' | 'savings' | 'payment';
  defaultAmount?: string;
  unlockDays: number; // Days from now
  expiryDays: number; // Days from unlock
  secretHint?: string;
}

export const ENVELOPE_TEMPLATES: EnvelopeTemplate[] = [
  // Inheritance Templates
  {
    id: 'college-fund',
    name: 'College Fund',
    description: 'Lock funds for education until child reaches 18',
    icon: '🎓',
    category: 'inheritance',
    defaultAmount: '5000',
    unlockDays: 365 * 5, // 5 years
    expiryDays: 365, // 1 year to claim
    secretHint: 'Your birth year + city name'
  },
  {
    id: 'emergency-fund',
    name: 'Emergency Fund',
    description: 'Family emergency fund with delayed access',
    icon: '🚨',
    category: 'savings',
    defaultAmount: '1000',
    unlockDays: 30, // 1 month
    expiryDays: 90, // 3 months to claim
    secretHint: 'Emergency contact name'
  },
  {
    id: 'will-inheritance',
    name: 'Will Inheritance',
    description: 'Long-term inheritance for beneficiaries',
    icon: '📜',
    category: 'inheritance',
    defaultAmount: '10000',
    unlockDays: 365 * 10, // 10 years
    expiryDays: 365 * 2, // 2 years to claim
    secretHint: 'Family secret phrase'
  },
  
  // Gift Templates
  {
    id: 'birthday-gift',
    name: 'Birthday Gift',
    description: 'Unlock on birthday for a special surprise',
    icon: '🎂',
    category: 'gift',
    defaultAmount: '100',
    unlockDays: 30, // Can adjust to actual birthday
    expiryDays: 30, // 1 month after birthday
    secretHint: 'Your favorite color + age'
  },
  {
    id: 'wedding-gift',
    name: 'Wedding Gift',
    description: 'Gift that unlocks on wedding day',
    icon: '💒',
    category: 'gift',
    defaultAmount: '500',
    unlockDays: 180, // ~6 months planning time
    expiryDays: 60, // 2 months to claim
    secretHint: 'Wedding venue name'
  },
  {
    id: 'graduation-gift',
    name: 'Graduation Gift',
    description: 'Reward for completing education',
    icon: '🎓',
    category: 'gift',
    defaultAmount: '250',
    unlockDays: 365, // 1 year
    expiryDays: 90,
    secretHint: 'School mascot name'
  },
  
  // Savings Templates
  {
    id: 'vacation-fund',
    name: 'Vacation Fund',
    description: 'Save for future vacation',
    icon: '✈️',
    category: 'savings',
    defaultAmount: '2000',
    unlockDays: 180, // 6 months
    expiryDays: 90,
    secretHint: 'Dream destination'
  },
  {
    id: 'house-deposit',
    name: 'House Deposit',
    description: 'Save for home down payment',
    icon: '🏠',
    category: 'savings',
    defaultAmount: '20000',
    unlockDays: 365 * 2, // 2 years
    expiryDays: 180,
    secretHint: 'Desired city + street'
  },
  {
    id: 'retirement-fund',
    name: 'Retirement Fund',
    description: 'Long-term retirement savings',
    icon: '🌴',
    category: 'savings',
    defaultAmount: '50000',
    unlockDays: 365 * 20, // 20 years
    expiryDays: 365 * 5, // 5 years to claim
    secretHint: 'Retirement dream activity'
  },
  
  // Payment Templates
  {
    id: 'monthly-allowance',
    name: 'Monthly Allowance',
    description: 'Regular monthly payment',
    icon: '💰',
    category: 'payment',
    defaultAmount: '500',
    unlockDays: 30, // 1 month
    expiryDays: 15,
    secretHint: 'Month name + year'
  },
  {
    id: 'business-payment',
    name: 'Business Payment',
    description: 'Delayed business transaction',
    icon: '💼',
    category: 'payment',
    defaultAmount: '1000',
    unlockDays: 14, // 2 weeks
    expiryDays: 30,
    secretHint: 'Invoice number'
  },
  {
    id: 'charity-donation',
    name: 'Charity Donation',
    description: 'Scheduled charitable giving',
    icon: '❤️',
    category: 'payment',
    defaultAmount: '100',
    unlockDays: 7, // 1 week
    expiryDays: 30,
    secretHint: 'Charity organization name'
  },
];

// Helper to calculate dates from template
export function getTemplateDefaults(template: EnvelopeTemplate) {
  const now = new Date();
  const unlockTime = new Date(now.getTime() + template.unlockDays * 24 * 60 * 60 * 1000);
  const expiryTime = new Date(unlockTime.getTime() + template.expiryDays * 24 * 60 * 60 * 1000);
  
  return {
    amount: template.defaultAmount || '',
    unlockTime: unlockTime.toISOString().slice(0, 16),
    expiryTime: expiryTime.toISOString().slice(0, 16),
    secretHint: template.secretHint || '',
  };
}

// Group templates by category
export function getTemplatesByCategory() {
  return {
    inheritance: ENVELOPE_TEMPLATES.filter(t => t.category === 'inheritance'),
    gift: ENVELOPE_TEMPLATES.filter(t => t.category === 'gift'),
    savings: ENVELOPE_TEMPLATES.filter(t => t.category === 'savings'),
    payment: ENVELOPE_TEMPLATES.filter(t => t.category === 'payment'),
  };
}
