'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PartnerProfile } from '@/types'
import { CAPABILITIES, PARTNER_TIERS, REGIONS, INDUSTRIES } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useContactId } from '@/hooks/useContactId'

function MultiCheckbox({ options, selected, onChange, label }: {
  options: readonly { key: string; label: string }[]
  selected: string[]
  onChange: (v: string[]) => void
  label: string
}) {
  const toggle = (key: string) => {
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key])
  }
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o.key} type="button"
            onClick={() => toggle(o.key)}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              selected.includes(o.key)
                ? 'bg-[#0070D2] text-white border-[#0070D2]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function TagInput({ value, onChange, label, placeholder }: {
  value: string[]; onChange: (v: string[]) => void; label: string; placeholder: string
}) {
  const [inputVal, setInputVal] = useState('')
  const add = () => {
    const v = inputVal.trim()
    if (v && !value.includes(v)) { onChange([...value, v]); setInputVal('') }
  }
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <div className="flex gap-2">
        <input
          value={inputVal} onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#0070D2] focus:outline-none"
        />
        <Button type="button" variant="secondary" size="sm" onClick={add}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {value.map(v => (
          <span key={v} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
            {v}
            <button type="button" onClick={() => onChange(value.filter(x => x !== v))} className="text-gray-400 hover:text-gray-600">×</button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function PartnerProfilePage() {
  const contactId = useContactId()
  const router = useRouter()
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    si_name: '', partner_tier: '', capabilities: [] as string[],
    industries_covered: [] as string[], regions_covered: [] as string[],
    commerce_specialisms: [] as string[], certifications: [] as string[],
    key_customers: [] as string[], sf_ae_name: '', sf_se_name: '',
    marketplace_url: '', app_exchange_url: '', bio: '', logo_url: '',
  })

  useEffect(() => {
    if (!contactId) { setLoading(false); return }
    fetch(`/api/partners/profiles/me?contact_id=${contactId}`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setProfile(data)
          setForm({
            si_name: data.si_name ?? '',
            partner_tier: data.partner_tier ?? '',
            capabilities: data.capabilities ?? [],
            industries_covered: data.industries_covered ?? [],
            regions_covered: data.regions_covered ?? [],
            commerce_specialisms: data.commerce_specialisms ?? [],
            certifications: data.certifications ?? [],
            key_customers: data.key_customers ?? [],
            sf_ae_name: data.sf_ae_name ?? '',
            sf_se_name: data.sf_se_name ?? '',
            marketplace_url: data.marketplace_url ?? '',
            app_exchange_url: data.app_exchange_url ?? '',
            bio: data.bio ?? '',
            logo_url: data.logo_url ?? '',
          })
        }
        setLoading(false)
      })
  }, [contactId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactId) return
    setSaving(true)
    const payload = { ...form, contact_id: contactId }
    const res = profile
      ? await fetch(`/api/partners/profiles/${profile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/partners/profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
    if (res.ok) {
      const data = await res.json()
      setProfile(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
  }

  if (loading) return <div><Header title="Partner Profile" /><LoadingSpinner /></div>

  if (!contactId) {
    return (
      <div>
        <Header title="Partner Profile" back={{ href: '/partners', label: 'Partner Hub' }} />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 mb-4">Register first to create your partner profile.</p>
          <Button onClick={() => router.push('/contact')}>Register</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header
        title={profile ? 'Edit Profile' : 'Build Your Profile'}
        subtitle="Visible to other partners at this event"
        back={{ href: '/partners', label: 'Partner Hub' }}
      />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Company Details</h2>
            <Input label="SI / Company Name" required id="si_name" value={form.si_name}
              onChange={e => setForm(f => ({ ...f, si_name: e.target.value }))} />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Partner Tier <span className="text-red-500">*</span></p>
              <div className="flex flex-wrap gap-2">
                {PARTNER_TIERS.map(t => (
                  <button
                    key={t.key} type="button"
                    onClick={() => setForm(f => ({ ...f, partner_tier: t.key }))}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.partner_tier === t.key ? 'bg-[#0070D2] text-white border-[#0070D2]' : `${t.color} border`
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <Textarea label="Company bio" id="bio" rows={3} value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              placeholder="What does your company specialise in?" />
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Commerce Capabilities</h2>
            <MultiCheckbox
              label="Capability areas" options={CAPABILITIES}
              selected={form.capabilities}
              onChange={v => setForm(f => ({ ...f, capabilities: v }))}
            />
            <TagInput
              label="Commerce specialisms" value={form.commerce_specialisms}
              onChange={v => setForm(f => ({ ...f, commerce_specialisms: v }))}
              placeholder="e.g. Headless SFCC, B2B portals…"
            />
            <TagInput
              label="Certifications" value={form.certifications}
              onChange={v => setForm(f => ({ ...f, certifications: v }))}
              placeholder="e.g. Salesforce Commerce Developer"
            />
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Markets & Customers</h2>
            <MultiCheckbox
              label="Regions covered" options={REGIONS.map(r => ({ key: r.key, label: r.label }))}
              selected={form.regions_covered}
              onChange={v => setForm(f => ({ ...f, regions_covered: v }))}
            />
            <MultiCheckbox
              label="Industries covered" options={INDUSTRIES.map(i => ({ key: i.key, label: i.label }))}
              selected={form.industries_covered}
              onChange={v => setForm(f => ({ ...f, industries_covered: v }))}
            />
            <TagInput
              label="Key customers (optional)" value={form.key_customers}
              onChange={v => setForm(f => ({ ...f, key_customers: v }))}
              placeholder="e.g. ASOS, Unilever…"
            />
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Salesforce Contacts</h2>
            <Input label="Account Executive (AE)" id="ae" value={form.sf_ae_name}
              onChange={e => setForm(f => ({ ...f, sf_ae_name: e.target.value }))}
              placeholder="Your Salesforce AE name" />
            <Input label="Solutions Engineer (SE)" id="se" value={form.sf_se_name}
              onChange={e => setForm(f => ({ ...f, sf_se_name: e.target.value }))}
              placeholder="Your Salesforce SE name" />
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="font-bold text-gray-900">Links</h2>
            <Input label="AppExchange listing URL" id="appex" type="url" value={form.app_exchange_url}
              onChange={e => setForm(f => ({ ...f, app_exchange_url: e.target.value }))}
              placeholder="https://appexchange.salesforce.com/…" />
            <Input label="Marketplace / website URL" id="mkt" type="url" value={form.marketplace_url}
              onChange={e => setForm(f => ({ ...f, marketplace_url: e.target.value }))}
              placeholder="https://…" />
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => router.push('/partners')} className="flex-1">Cancel</Button>
            <Button type="submit" loading={saving} className="flex-1">
              {saving ? 'Saving…' : saved ? 'Saved!' : profile ? 'Save Changes' : 'Create Profile'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
