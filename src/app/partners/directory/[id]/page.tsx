import { queryOne } from '@/lib/db'
import { PartnerProfile } from '@/types'

export const dynamic = 'force-dynamic'
import { CAPABILITIES, PARTNER_TIERS } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { notFound } from 'next/navigation'

const tierColors: Record<string, 'gold' | 'gray' | 'orange' | 'blue'> = {
  summit: 'gold', platinum: 'gray', gold: 'orange', silver: 'blue'
}

export default async function PartnerProfileViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const profile = await queryOne<PartnerProfile & { contact_first_name: string; contact_last_name: string; contact_email: string }>(
    `SELECT pp.*, c.first_name AS contact_first_name, c.last_name AS contact_last_name, c.email AS contact_email
     FROM partner_profiles pp JOIN contacts c ON c.id = pp.contact_id WHERE pp.id = $1`,
    [id]
  )
  if (!profile) notFound()

  const tier = PARTNER_TIERS.find(t => t.key === profile.partner_tier)

  return (
    <div>
      <Header title={profile.si_name} back={{ href: '/partners/directory', label: 'Directory' }} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{profile.si_name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{profile.contact_first_name} {profile.contact_last_name}</p>
            </div>
            {tier && <Badge variant={tierColors[profile.partner_tier] ?? 'gray'}>{tier.label}</Badge>}
          </div>
          {profile.bio && <p className="text-sm text-gray-600 leading-relaxed">{profile.bio}</p>}
        </Card>

        {profile.capabilities.length > 0 && (
          <Card className="p-5">
            <h2 className="font-bold text-gray-900 mb-3">Capabilities</h2>
            <div className="flex flex-wrap gap-2">
              {profile.capabilities.map(cap => {
                const found = CAPABILITIES.find(c => c.key === cap)
                return found ? <Badge key={cap} variant="blue">{found.label}</Badge> : null
              })}
            </div>
          </Card>
        )}

        {(profile.industries_covered?.length > 0 || profile.regions_covered?.length > 0) && (
          <Card className="p-5 space-y-3">
            <h2 className="font-bold text-gray-900">Markets</h2>
            {profile.regions_covered?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Regions</p>
                <div className="flex flex-wrap gap-1">{profile.regions_covered.map(r => <Badge key={r} variant="teal">{r}</Badge>)}</div>
              </div>
            )}
            {profile.industries_covered?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Industries</p>
                <div className="flex flex-wrap gap-1">{profile.industries_covered.map(i => <Badge key={i} variant="purple">{i}</Badge>)}</div>
              </div>
            )}
          </Card>
        )}

        {profile.certifications?.length > 0 && (
          <Card className="p-5">
            <h2 className="font-bold text-gray-900 mb-2">Certifications</h2>
            <div className="flex flex-wrap gap-1">{profile.certifications.map(c => <Badge key={c} variant="green">{c}</Badge>)}</div>
          </Card>
        )}

        {(profile.sf_ae_name || profile.sf_se_name) && (
          <Card className="p-5">
            <h2 className="font-bold text-gray-900 mb-2">Salesforce Contacts</h2>
            {profile.sf_ae_name && <p className="text-sm text-gray-600">AE: <span className="font-medium">{profile.sf_ae_name}</span></p>}
            {profile.sf_se_name && <p className="text-sm text-gray-600 mt-1">SE: <span className="font-medium">{profile.sf_se_name}</span></p>}
          </Card>
        )}

        {(profile.app_exchange_url || profile.marketplace_url) && (
          <Card className="p-5 space-y-2">
            <h2 className="font-bold text-gray-900 mb-2">Links</h2>
            {profile.app_exchange_url && (
              <a href={profile.app_exchange_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#0070D2] hover:underline">
                AppExchange listing
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
            {profile.marketplace_url && (
              <a href={profile.marketplace_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#0070D2] hover:underline">
                Company website
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}
