'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PartnerProfile } from '@/types'
import { CAPABILITIES, PARTNER_TIERS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/admin/DataTable'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const tierColors: Record<string, 'gold' | 'gray' | 'orange' | 'blue'> = { summit: 'gold', platinum: 'gray', gold: 'orange', silver: 'blue' }

export default function AdminPartnersPage() {
  const [profiles, setProfiles] = useState<PartnerProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/partners/profiles').then(r => r.json()).then(data => { setProfiles(data); setLoading(false) })
  }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Profiles</h1>
          <p className="text-sm text-gray-500 mt-1">{profiles.length} registered</p>
        </div>
        <a href="/api/admin/partners/profiles/export"><Button variant="secondary" size="sm">Export CSV</Button></a>
      </div>
      {loading ? <LoadingSpinner /> : (
        <DataTable
          rows={profiles}
          columns={[
            { key: 'si_name', label: 'SI Name', render: (r) => <Link href={`/admin/partners/${r.id}`} className="text-[#0070D2] hover:underline font-medium">{r.si_name as string}</Link> },
            { key: 'partner_tier', label: 'Tier', render: (r) => <Badge variant={tierColors[r.partner_tier as string] ?? 'gray'}>{PARTNER_TIERS.find(t => t.key === r.partner_tier)?.label ?? String(r.partner_tier)}</Badge> },
            { key: 'capabilities', label: 'Capabilities', render: (r) => {
              const caps = r.capabilities as string[]
              return (
                <div className="flex flex-wrap gap-1">
                  {caps.slice(0, 3).map(c => {
                    const found = CAPABILITIES.find(cap => cap.key === c)
                    return found ? <Badge key={c} variant="blue" className="text-[10px]">{found.label}</Badge> : null
                  })}
                  {caps.length > 3 && <Badge variant="gray" className="text-[10px]">+{caps.length - 3}</Badge>}
                </div>
              )
            }},
            { key: 'contact_email', label: 'Contact Email' },
            { key: 'regions_covered', label: 'Regions', render: (r) => (r.regions_covered as string[]).join(', ') || '-' },
          ]}
        />
      )}
    </div>
  )
}
