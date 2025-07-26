/**
 * AI Model Configuration
 * Defines available AI models, their tiers, and pricing information
 */

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  tier: 'free' | 'premium';
  description: string;
  features: string[];
  requestsPerMonth: number;
  costPerRequest?: number;
  contextLength: number;
  recommended?: boolean;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    tier: 'free',
    description: 'Fast and efficient for basic medical documentation tasks',
    features: [
      'Case summarization',
      'Basic medical terminology assistance',
      'Standard report generation',
    ],
    requestsPerMonth: 100,
    contextLength: 4096,
    recommended: true,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    tier: 'premium',
    description: 'Advanced reasoning for complex medical analysis',
    features: [
      'Advanced case analysis',
      'Complex medical reasoning',
      'Detailed clinical insights',
      'Research assistance',
    ],
    requestsPerMonth: 1000,
    costPerRequest: 0.03,
    contextLength: 8192,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    tier: 'premium',
    description: 'Latest model with enhanced capabilities and speed',
    features: [
      'Fastest premium processing',
      'Latest medical knowledge',
      'Enhanced accuracy',
      'Extended context length',
    ],
    requestsPerMonth: 1000,
    costPerRequest: 0.01,
    contextLength: 128000,
    recommended: true,
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    tier: 'free',
    description: 'Fast and reliable for routine medical documentation',
    features: [
      'Quick responses',
      'Accurate medical terminology',
      'HIPAA-conscious processing',
    ],
    requestsPerMonth: 150,
    contextLength: 200000,
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    tier: 'premium',
    description: 'Balanced performance for comprehensive medical tasks',
    features: [
      'Detailed medical analysis',
      'Ethical reasoning',
      'Comprehensive documentation',
      'Research synthesis',
    ],
    requestsPerMonth: 1000,
    costPerRequest: 0.015,
    contextLength: 200000,
  },
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    tier: 'premium',
    description: 'Most capable model for complex medical reasoning',
    features: [
      'Superior clinical reasoning',
      'Complex case analysis',
      'Medical research assistance',
      'Publication-quality outputs',
    ],
    requestsPerMonth: 500,
    costPerRequest: 0.075,
    contextLength: 200000,
  },
];

export const getModelById = (modelId: string): AIModel | undefined => {
  return AI_MODELS.find(model => model.id === modelId);
};

export const getModelsByTier = (tier: 'free' | 'premium'): AIModel[] => {
  return AI_MODELS.filter(model => model.tier === tier);
};

export const getDefaultModel = (tier: 'free' | 'premium' = 'free'): AIModel => {
  const models = getModelsByTier(tier);
  const recommended = models.find(model => model.recommended);
  return recommended || models[0];
};

export const validateModelAccess = (modelId: string, userTier: 'free' | 'premium'): boolean => {
  const model = getModelById(modelId);
  if (!model) return false;
  
  if (model.tier === 'premium' && userTier === 'free') {
    return false;
  }
  
  return true;
};