export const EVENT_ID = 1

export const CAPABILITIES = [
  { key: 'sfcc_b2c', label: 'SFCC B2C' },
  { key: 'b2b_commerce', label: 'B2B Commerce' },
  { key: 'oms', label: 'OMS' },
  { key: 'data_cloud', label: 'Data Cloud' },
  { key: 'loyalty', label: 'Loyalty' },
  { key: 'marketing_cloud', label: 'Marketing Cloud' },
  { key: 'agentforce', label: 'Agentforce' },
  { key: 'composable_mach', label: 'Composable/MACH' },
] as const

export const PARTNER_TIERS = [
  { key: 'summit', label: 'Summit', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { key: 'platinum', label: 'Platinum', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  { key: 'gold', label: 'Gold', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { key: 'silver', label: 'Silver', color: 'text-gray-500 bg-gray-50 border-gray-200' },
] as const

export const PARTNER_TYPES = [
  { key: 'b2c_delivery', label: 'B2C Delivery' },
  { key: 'b2b_delivery', label: 'B2B Delivery' },
  { key: 'oms_partner', label: 'OMS Partner' },
  { key: 'data_cloud_partner', label: 'Data Cloud Partner' },
  { key: 'loyalty_partner', label: 'Loyalty Partner' },
  { key: 'isv_app_partner', label: 'ISV App Partner' },
  { key: 'agentforce_partner', label: 'Agentforce Partner' },
  { key: 'composable_mach', label: 'Composable/MACH' },
] as const

export const QUESTION_TOPICS = [
  { key: 'product_roadmap', label: 'Product Roadmap' },
  { key: 'commercials', label: 'Commercials' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'enablement', label: 'Enablement' },
  { key: 'gtm', label: 'GTM' },
  { key: 'competitive_objections', label: 'Competitive' },
  { key: 'agentforce', label: 'Agentforce' },
] as const

export const GTM_CATEGORIES = [
  { key: 'joint_pipeline', label: 'Joint Pipeline' },
  { key: 'co_sell', label: 'Co-Sell' },
  { key: 'enablement', label: 'Enablement' },
  { key: 'product_feedback', label: 'Product Feedback' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'isv_integration', label: 'ISV Integration' },
  { key: 'services_play', label: 'Services Play' },
  { key: 'customer_success', label: 'Customer Success' },
  { key: 'competitive', label: 'Competitive' },
  { key: 'custom', label: 'Custom' },
] as const

export const DEAL_STATUSES = [
  { key: 'active', label: 'Active', color: 'bg-green-100 text-green-800' },
  { key: 'stalled', label: 'Stalled', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'won', label: 'Won', color: 'bg-blue-100 text-blue-800' },
  { key: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800' },
] as const

export const REGIONS = [
  { key: 'EMEA', label: 'EMEA' },
  { key: 'AMER', label: 'AMER' },
  { key: 'APAC', label: 'APAC' },
  { key: 'LATAM', label: 'LATAM' },
  { key: 'Global', label: 'Global' },
] as const

export const INDUSTRIES = [
  { key: 'Retail', label: 'Retail' },
  { key: 'Manufacturing', label: 'Manufacturing' },
  { key: 'Financial Services', label: 'Financial Services' },
  { key: 'Healthcare', label: 'Healthcare' },
  { key: 'Consumer Goods', label: 'Consumer Goods' },
  { key: 'Media & Entertainment', label: 'Media & Entertainment' },
  { key: 'Travel & Hospitality', label: 'Travel & Hospitality' },
  { key: 'Automotive', label: 'Automotive' },
  { key: 'Technology', label: 'Technology' },
  { key: 'Nonprofit', label: 'Nonprofit' },
  { key: 'Education', label: 'Education' },
] as const

export const FEATURE_FLAGS = [
  'agenda', 'speakers', 'contact', 'questions', 'feedback',
  'partners', 'polls', 'gtm', 'concierge',
] as const

export type FeatureFlag = typeof FEATURE_FLAGS[number]
