export type StampType =
  | 'roadmap_session'
  | 'demo_booth'
  | 'agentforce_session'
  | 'isv_sponsor_booth'
  | 'feedback_form'

export const SELF_SERVICE_STAMPS: StampType[] = [
  'roadmap_session',
  'demo_booth',
  'agentforce_session',
  'isv_sponsor_booth',
]

export const STAMP_LABELS: Record<StampType, string> = {
  roadmap_session: 'Roadmap Session',
  demo_booth: 'Demo Booth',
  agentforce_session: 'Agentforce Session',
  isv_sponsor_booth: 'ISV Sponsor Booth',
  feedback_form: 'Feedback Form',
}

export const STAMP_ICONS: Record<StampType, string> = {
  roadmap_session: '🗺️',
  demo_booth: '🖥️',
  agentforce_session: '🤖',
  isv_sponsor_booth: '🤝',
  feedback_form: '📝',
}
