export interface Event {
  id: number
  name: string
  date: string
  venue: string
  short_description: string | null
  welcome_message: string | null
}

export interface Speaker {
  id: number
  event_id: number
  name: string
  job_title: string | null
  company: string | null
  bio: string | null
  photo_url: string | null
  linkedin_url: string | null
}

export interface AgendaItem {
  id: number
  event_id: number
  session_title: string
  start_time: string
  end_time: string
  speaker_id: number | null
  speaker_name?: string | null
  speaker_company?: string | null
  speaker_photo?: string | null
  room: string | null
  description: string | null
  sort_order: number
  resource_url: string | null
  partner_types?: string[]
}

export interface Contact {
  id: number
  event_id: number
  first_name: string
  last_name: string
  email: string
  company: string | null
  job_title: string | null
  consent: boolean
  created_at: string
}

export interface Question {
  id: number
  contact_id: number
  session_id: number
  question_text: string
  submitted_at: string
  topic: string | null
  contact_name?: string
  session_title?: string
}

export interface Feedback {
  id: number
  contact_id: number
  event_id: number
  rating: number
  enjoyed: string | null
  improve: string | null
  future_topics: string | null
  submitted_at: string
  contact_name?: string
}

export interface PartnerProfile {
  id: number
  contact_id: number
  si_name: string
  partner_tier: 'summit' | 'platinum' | 'gold' | 'silver'
  commerce_specialisms: string[]
  industries_covered: string[]
  certifications: string[]
  key_customers: string[]
  sf_ae_name: string | null
  sf_se_name: string | null
  marketplace_url: string | null
  app_exchange_url: string | null
  regions_covered: string[]
  capabilities: string[]
  bio: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
  contact_first_name?: string
  contact_last_name?: string
  contact_email?: string
}

export interface Deal {
  id: number
  contact_id: number
  target_account: string
  opportunity_description: string
  blockers: string | null
  sf_support_needed: string | null
  next_steps: string | null
  status: 'active' | 'stalled' | 'won' | 'lost'
  created_at: string
  updated_at: string
}

export interface Poll {
  id: number
  question: string
  is_active: boolean
  created_at: string
  options?: PollOption[]
}

export interface PollOption {
  id: number
  poll_id: number
  label: string
  sort_order: number
  vote_count?: number
  percentage?: number
}

export interface PassportStamp {
  id: number
  contact_id: number
  stamp_type: string
  awarded_by: string
  admin_id: number | null
  stamped_at: string
}

export interface GtmIdea {
  id: number
  contact_id: number
  title: string
  category: string
  description: string
  is_approved: boolean
  created_at: string
  vote_count?: number
  user_voted?: boolean
  submitter_name?: string
}

export interface GtmPlayTemplate {
  id: number
  title: string
  category: string
  description: string
  sort_order: number
}

export interface ActionPlan {
  id: number
  contact_id: number
  target_account_1: string
  target_account_2: string | null
  target_account_3: string | null
  joint_play_1: string
  joint_play_2: string | null
  enablement_need: string
  sf_owner_name: string
  follow_up_date: string
  submitted_at: string
  updated_at: string
}

export interface AppSettings {
  [key: string]: boolean
}
