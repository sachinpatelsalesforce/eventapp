'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PartnerProfile } from '@/types'
import { CAPABILITIES, PARTNER_TIERS, PARTNER_TYPES, REGIONS, INDUSTRIES } from '@/lib/constants'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const tierColors: Record<string, 'gold' | 'gray' | 'orange' | 'blue'> = { summit: 'gold', platinum: 'gray', gold: 'orange', silver: 'blue' }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{title}</h3>
      {children}
    </div>
  )
}

export default function AdminPartnerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/partners/profiles/${id}`).then(r => r.json()).then(data => { setProfile(data); setLoading(false) })
  }, [id])

  if (loading) return <div className="p-6"><LoadingSpinner /></div>
  if (!profile) return <div className="p-6"><p className="text-gray-500">Profile not found.</p></div>

  const tier = PARTNER_TIERS.find(t => t.key === profile.partner_tier)

  return (
    <div className="p-6 max-w-3xl">
      <button onClick={() => router.back()} className="text-sm text-[#0070D2] hover:underline mb-4 block">← Back to Partners</button>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.si_name}</h1>
            {tier && <div className="mt-1"><Badge variant={tierColors[profile.partner_tier] ?? 'gray'}>{tier.label} Partner</Badge></div>}
          </div>
        </div>
        {profile.bio && <p className="text-gray-600 mt-3">{profile.bio}</p>}
        <div className="flex flex-wrap gap-2 mt-3">
          {profile.marketplace_url && <a href={profile.marketplace_url} target="_blank" rel="noreferrer" className="text-xs text-[#0070D2] hover:underline">Marketplace</a>}
          {profile.app_exchange_url && <a href={profile.app_exchange_url} target="_blank" rel="noreferrer" className="text-xs text-[#0070D2] hover:underline">AppExchange</a>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <Section title="Commerce Capabilities">
            <div className="flex flex-wrap gap-1">
              {profile.capabilities?.map(c => {
                const found = CAPABILITIES.find(cap => cap.key === c)
                return found ? <Badge key={c} variant="blue">{found.label}</Badge> : null
              })}
              {!profile.capabilities?.length && <span className="text-sm text-gray-400">None specified</span>}
            </div>
          </Section>

          <Section title="Industries">
            <div className="flex flex-wrap gap-1">
              {profile.industries_covered?.map(i => {
                const found = INDUSTRIES.find(ind => ind.key === i)
                return found ? <Badge key={i} variant="purple">{found.label}</Badge> : null
              })}
              {!profile.industries_covered?.length && <span className="text-sm text-gray-400">None specified</span>}
            </div>
          </Section>

          <Section title="Regions">
            <div className="flex flex-wrap gap-1">
              {profile.regions_covered?.map(r => {
                const found = REGIONS.find(reg => reg.key === r)
                return found ? <Badge key={r} variant="gray">{found.label}</Badge> : null
              })}
              {!profile.regions_covered?.length && <span className="text-sm text-gray-400">None specified</span>}
            </div>
          </Section>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <Section title="Certifications">
            {profile.certifications?.length ? (
              <ul className="space-y-1">
                {profile.certifications.map((c, i) => <li key={i} className="text-sm text-gray-700">• {c}</li>)}
              </ul>
            ) : <span className="text-sm text-gray-400">None listed</span>}
          </Section>

          <Section title="Key Customers">
            {profile.key_customers?.length ? (
              <ul className="space-y-1">
                {profile.key_customers.map((c, i) => <li key={i} className="text-sm text-gray-700">• {c}</li>)}
              </ul>
            ) : <span className="text-sm text-gray-400">None listed</span>}
          </Section>

          <Section title="Salesforce Contacts">
            <div className="space-y-1">
              {profile.sf_ae_name && <p className="text-sm text-gray-700"><span className="font-medium">AE:</span> {profile.sf_ae_name}</p>}
              {profile.sf_se_name && <p className="text-sm text-gray-700"><span className="font-medium">SE:</span> {profile.sf_se_name}</p>}
              {!profile.sf_ae_name && !profile.sf_se_name && <span className="text-sm text-gray-400">Not provided</span>}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}
