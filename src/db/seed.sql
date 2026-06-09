-- Commerce Connect — Seed Data: Commerce Summit 2026

-- Feature flags (all enabled by default)
INSERT INTO app_settings (key, value, label, description) VALUES
  ('agenda',    'true', 'Agenda',              'Event agenda with session details'),
  ('speakers',  'true', 'Speakers',            'Speaker profiles and bios'),
  ('contact',   'true', 'Contact Capture',     'Attendee registration form'),
  ('questions', 'true', 'Q&A',                 'Session questions from attendees'),
  ('feedback',  'true', 'Feedback',            'Event and session feedback'),
  ('partners',  'true', 'Partner Hub',         'Partner profiles, deals, passport, action plan'),
  ('polls',     'true', 'Partner Pulse Polls', 'Live polling for partner sentiment'),
  ('gtm',       'true', 'GTM Idea Wall',       'Submit and vote on GTM ideas'),
  ('concierge', 'true', 'AI Concierge',        'AI-powered event assistant')
ON CONFLICT (key) DO NOTHING;

-- Event
INSERT INTO events (id, name, date, venue, short_description, welcome_message) VALUES
(1,
 'Commerce Summit 2026',
 '2026-09-15',
 'Moscone Center, San Francisco, CA',
 'The premier gathering of Salesforce Commerce partners, SIs, and ISVs — built for co-creation, pipeline generation, and ecosystem growth.',
 'Welcome to Commerce Summit 2026. We''re thrilled to bring together the best minds in commerce to learn, connect, and build the future of retail and B2B together. Today is about more than sessions — it''s about partnerships that win. Let''s make it count.'
) ON CONFLICT (id) DO NOTHING;

-- Speakers
INSERT INTO speakers (id, event_id, name, job_title, company, bio, photo_url, linkedin_url) VALUES
(1, 1, 'Sarah Chen', 'VP Commerce Engineering', 'Salesforce',
 'Sarah leads the Commerce Cloud platform team at Salesforce, driving the product roadmap across B2C, B2B, and OMS. She has spent 12 years building distributed commerce systems and is a regular keynote speaker at Dreamforce and TrailblazerDX.',
 'https://ui-avatars.com/api/?name=Sarah+Chen&background=0070d2&color=fff&size=256&bold=true',
 'https://linkedin.com/in/sarahchen'),
(2, 1, 'Marcus Williams', 'Chief Digital Officer', 'RetailCo',
 'Marcus has led digital transformation across three Fortune 500 retailers. His journey from legacy ERP to a fully composable commerce stack at RetailCo is one of the most referenced case studies in the Salesforce partner ecosystem.',
 'https://ui-avatars.com/api/?name=Marcus+Williams&background=0070d2&color=fff&size=256&bold=true',
 'https://linkedin.com/in/marcuswilliams'),
(3, 1, 'Priya Patel', 'Head of AI Commerce', 'TechVentures',
 'Priya leads AI and personalisation strategy at TechVentures, a Summit-tier Salesforce SI. Her team built one of the first production Agentforce deployments for a Tier 1 retailer, cutting customer service costs by 40% in 6 months.',
 'https://ui-avatars.com/api/?name=Priya+Patel&background=0070d2&color=fff&size=256&bold=true',
 'https://linkedin.com/in/priyapatel'),
(4, 1, 'James O''Brien', 'Principal Solutions Architect', 'Salesforce',
 'James has architected over 80 Commerce Cloud implementations across EMEA and APAC. His specialisms are headless storefronts, OMS integrations, and composable architecture patterns. He runs the Commerce Architect community on Slack.',
 'https://ui-avatars.com/api/?name=James+OBrien&background=0070d2&color=fff&size=256&bold=true',
 'https://linkedin.com/in/jamesobrien')
ON CONFLICT (id) DO NOTHING;

-- Agenda Items
INSERT INTO agenda_items (id, event_id, session_title, start_time, end_time, speaker_id, room, description, sort_order, resource_url) VALUES
(1,  1, 'Registration & Breakfast',
 '2026-09-15 08:00:00-07', '2026-09-15 09:00:00-07',
 NULL, 'Main Lobby',
 'Check in, collect your badge, grab breakfast and coffee. Network with fellow partners before the day kicks off.',
 1, NULL),
(2,  1, 'Opening Keynote: The Partner-Led Commerce Era',
 '2026-09-15 09:00:00-07', '2026-09-15 10:00:00-07',
 1, 'Hall A',
 'Sarah Chen sets the agenda for the year ahead — what''s shipping in Commerce Cloud, where Agentforce is headed, and how the partner ecosystem will drive the next wave of growth. Product announcements and live demos.',
 2, 'https://docs.google.com/presentation/d/example-keynote'),
(3,  1, 'AI-Powered Commerce: From Prototype to Production',
 '2026-09-15 10:15:00-07', '2026-09-15 11:00:00-07',
 3, 'Room 201',
 'Priya Patel shares how TechVentures took Agentforce from a hackathon concept to a production deployment handling 2M+ customer interactions per month. Real architecture, real numbers, real lessons.',
 3, NULL),
(4,  1, 'Headless Commerce Patterns at Scale',
 '2026-09-15 10:15:00-07', '2026-09-15 11:00:00-07',
 4, 'Room 202',
 'James O''Brien covers the 5 headless architecture patterns he sees winning in 2026, from MACH-native builds to pragmatic composable upgrades. Includes a live code walkthrough of the SFRA-to-PWA migration playbook.',
 4, 'https://docs.google.com/presentation/d/example-headless'),
(5,  1, 'Networking Lunch',
 '2026-09-15 11:00:00-07', '2026-09-15 12:30:00-07',
 NULL, 'Atrium',
 'Lunch is on us. Industry tables are organised by vertical — join Retail, Manufacturing, or Financial Services tables to connect with partners working the same accounts.',
 5, NULL),
(6,  1, 'Digital Transformation at Scale: The RetailCo Story',
 '2026-09-15 12:30:00-07', '2026-09-15 13:15:00-07',
 2, 'Hall A',
 'Marcus Williams tells the unfiltered story of RetailCo''s 3-year digital transformation — what worked, what didn''t, and what he wishes the SI partner had told him on day one.',
 6, NULL),
(7,  1, 'OMS Modernisation: The Hidden Revenue Unlock',
 '2026-09-15 13:30:00-07', '2026-09-15 14:15:00-07',
 4, 'Room 201',
 'Most retailers leave 15–20% of revenue on the table due to legacy order management. James breaks down the OMS modernisation playbook — including a partner-led fast-track methodology that delivers live in 12 weeks.',
 7, NULL),
(8,  1, 'Closing Keynote & Partner Q&A',
 '2026-09-15 14:30:00-07', '2026-09-15 15:30:00-07',
 NULL, 'Hall A',
 'All speakers return to the stage for an open Q&A. Submit your questions through the app. Closing remarks and partner award announcements follow.',
 8, NULL)
ON CONFLICT (id) DO NOTHING;

-- Session Partner Tags
INSERT INTO session_partner_tags (agenda_item_id, partner_type) VALUES
-- Keynote: all types
(2, 'b2c_delivery'), (2, 'b2b_delivery'), (2, 'oms_partner'), (2, 'data_cloud_partner'),
(2, 'loyalty_partner'), (2, 'isv_app_partner'), (2, 'agentforce_partner'), (2, 'composable_mach'),
-- AI session: agentforce + data cloud + b2c
(3, 'agentforce_partner'), (3, 'data_cloud_partner'), (3, 'b2c_delivery'),
-- Headless: composable + b2c
(4, 'composable_mach'), (4, 'b2c_delivery'),
-- OMS session
(7, 'oms_partner'), (7, 'b2b_delivery'), (7, 'b2c_delivery'),
-- Closing: all types
(8, 'b2c_delivery'), (8, 'b2b_delivery'), (8, 'oms_partner'), (8, 'agentforce_partner')
ON CONFLICT DO NOTHING;

-- Polls
INSERT INTO polls (id, question, is_active) VALUES
(1, 'Where are you seeing the most Commerce demand in 2026?', true),
(2, 'What blocks deals most often?', true),
(3, 'Which industries are most active for you right now?', true),
(4, 'Where do you need more enablement from Salesforce?', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO poll_options (poll_id, label, sort_order) VALUES
(1, 'B2C Re-platforming', 1), (1, 'B2B Commerce', 2), (1, 'OMS Modernisation', 3),
(1, 'Agentforce / AI', 4),
(2, 'Budget / ROI justification', 1), (2, 'Lack of internal resource', 2),
(2, 'Competitive pressure', 3), (2, 'Long procurement cycles', 4),
(3, 'Retail', 1), (3, 'Manufacturing', 2), (3, 'Financial Services', 3), (3, 'Consumer Goods', 4),
(4, 'Agentforce & AI', 1), (4, 'OMS delivery methodology', 2),
(4, 'B2B Commerce', 3), (4, 'Competitive objection handling', 4)
ON CONFLICT DO NOTHING;

-- GTM Play Templates
INSERT INTO gtm_play_templates (title, category, description, sort_order) VALUES
('Joint Pipeline — Commerce + Data Cloud',       'joint_pipeline',   'Co-develop a target account list with your Salesforce AE, run joint outbound with co-branded assets, and split pipeline attribution.', 1),
('Co-Sell — B2C Re-platforming Play',            'co_sell',          'Target SAP/Hybris/Magento accounts approaching end-of-life. Partner brings delivery capacity, Salesforce brings licence commercial and AE relationship.', 2),
('Agentforce for Commerce — Packaged POC',       'isv_integration',  'A 4-week fixed-scope POC delivering an autonomous commerce agent for order management, returns handling, or upsell recommendation.', 3),
('Partner-Led Enablement Workshop',              'enablement',       'Deliver a customer-facing Commerce Cloud enablement day co-branded with Salesforce. Drives deal progression and partner credibility.', 4),
('Composable Commerce MACH Migration',           'services_play',    'Headless storefront migration from legacy platform using SFCC B2C + composable front-end stack. Includes a published migration methodology and fixed-fee phase 1.', 5),
('OMS Quick Win — Order Visibility Dashboard',   'services_play',    'Fast-track OMS implementation focused on order tracking and inventory visibility. Live in 12 weeks. Designed as a land-and-expand motion.', 6),
('Loyalty Launch Accelerator',                   'marketing',        'Joint GTM for Loyalty Cloud launch: partner delivers implementation, Salesforce co-markets, customer gets 90-day go-live guarantee.', 7),
('Competitive Displacement — SAP/Hybris',        'competitive',      'Target accounts on legacy SAP with joint displacement messaging, migration ROI calculator, and reference customer introductions.', 8),
('B2B Commerce Self-Service Portal',             'services_play',    'Packaged B2B portal play for manufacturing and distribution verticals. Fixed scope, fixed price, referenceable outcomes.', 9),
('Data Cloud + Commerce 360 Personalisation',    'product_feedback', 'Instrument storefront with Data Cloud; demonstrate personalised category pages, triggered abandon cart flows, and AI-driven product recommendations.', 10)
ON CONFLICT DO NOTHING;

-- Reset sequences
SELECT setval('events_id_seq',     (SELECT MAX(id) FROM events));
SELECT setval('speakers_id_seq',   (SELECT MAX(id) FROM speakers));
SELECT setval('agenda_items_id_seq', (SELECT MAX(id) FROM agenda_items));
SELECT setval('polls_id_seq',      (SELECT MAX(id) FROM polls));
SELECT setval('gtm_play_templates_id_seq', (SELECT MAX(id) FROM gtm_play_templates));
