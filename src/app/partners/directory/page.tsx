'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PartnerProfile } from '@/types'
import { CAPABILITIES, PARTNER_TIERS, REGIONS, INDUSTRIES } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input, Select } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

const tierColors: Record<string, 'gold' | 'gray' | 'orange' | 'blue'> = {
  summit: 'gold', platinum: 'gray', gold: 'orange', silver: 'blue'
}

export default function PartnerDirectoryPage() {
  const [profiles, setProfiles] = useState<PartnerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ capability: '', industry: '', region: '', tier: '' })

  const fetch_ = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.capability) params.set('capability', filters.capability)
    if (filters.industry) params.set('industry', filters.industry)
    if (filters.region) params.set('region', filters.region)
    if (filters.tier) params.set('tier', filters.tier)
    const data = await fetch(`/api/partners/profiles?${params}`).then(r => r.json())
    setProfiles(data)
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [filters])

  return (
    <div>
      <Header title="Partner Directory" subtitle="Find partners to collaborate with" back={{ href: '/partners', label: 'Partner Hub' }} />

      <div className="max-w-4xl mx-auto px-4 py-5">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 mb-5 sm:grid-cols-4">
          <Select value={filters.capability} onChange={e => setFilters(f => ({ ...f, capability: e.target.value }))}>
            <option value="">All capabilities</option>
            {CAPABILITIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </Select>
          <Select value={filters.industry} onChange={e => setFilters(f => ({ ...f, industry: e.target.value }))}>
            <option value="">All industries</option>
            {INDUSTRIES.map(i => <option key={i.key} value={i.key}>{i.label}</option>)}
          </Select>
          <Select value={filters.region} onChange={e => setFilters(f => ({ ...f, region: e.target.value }))}>
            <option value="">All regions</option>
            {REGIONS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </Select>
          <Select value={filters.tier} onChange={e => setFilters(f => ({ ...f, tier: e.target.value }))}>
            <option value="">All tiers</option>
            {PARTNER_TIERS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </Select>
        </div>

        {loading ? <LoadingSpinner /> : (
          <>
            <p className="text-sm text-gray-500 mb-3">{profiles.length} partner{profiles.length !== 1 ? 's' : ''} found</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {profiles.map(p => (
                <Link key={p.id} href={`/partners/directory/${p.id}`}>
                  <Card hover className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900">{p.si_name}</h3>
                      <Badge variant={tierColors[p.partner_tier] ?? 'gray'}>
                        {PARTNER_TIERS.find(t => t.key === p.partner_tier)?.label ?? p.partner_tier}
                      </Badge>
                    </div>
                    {p.bio && <p className="text-sm text-gray-500 line-clamp-2 mb-2">{p.bio}</p>}
                    {p.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.capabilities.slice(0, 4).map(cap => {
                          const found = CAPABILITIES.find(c => c.key === cap)
                          return found ? (
                            <Badge key={cap} variant="blue" className="text-[10px]">{found.label}</Badge>
                          ) : null
                        })}
                        {p.capabilities.length > 4 && (
                          <Badge variant="gray" className="text-[10px]">+{p.capabilities.length - 4}</Badge>
                        )}
                      </div>
                    )}
                    {p.regions_covered.length > 0 && (
                      <p className="text-xs text-gray-400 mt-2">{p.regions_covered.join(' · ')}</p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
            {profiles.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No partners match your filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
