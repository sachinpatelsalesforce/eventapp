'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ActionPlan } from '@/types'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useContactId } from '@/hooks/useContactId'

export default function ActionPlanPage() {
  const contactId = useContactId()
  const [existing, setExisting] = useState<ActionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    target_account_1: '', target_account_2: '', target_account_3: '',
    joint_play_1: '', joint_play_2: '',
    enablement_need: '', sf_owner_name: '', follow_up_date: '',
  })

  useEffect(() => {
    if (!contactId) { setLoading(false); return }
    fetch(`/api/partners/action-plan?contact_id=${contactId}`)
      .then(r => r.json())
      .then(data => {
        if (data) {
          setExisting(data)
          setForm({
            target_account_1: data.target_account_1 ?? '',
            target_account_2: data.target_account_2 ?? '',
            target_account_3: data.target_account_3 ?? '',
            joint_play_1: data.joint_play_1 ?? '',
            joint_play_2: data.joint_play_2 ?? '',
            enablement_need: data.enablement_need ?? '',
            sf_owner_name: data.sf_owner_name ?? '',
            follow_up_date: data.follow_up_date ? data.follow_up_date.slice(0, 10) : '',
          })
        }
        setLoading(false)
      })
  }, [contactId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/partners/action-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, contact_id: contactId }),
    })
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!contactId) {
    return (
      <div>
        <Header title="Action Plan" back={{ href: '/partners', label: 'Partner Hub' }} />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <p className="text-white/50 mb-4">Register to create your action plan.</p>
          <Link href="/contact"><Button>Register</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Action Plan" subtitle="Leave with a concrete plan" back={{ href: '/partners', label: 'Partner Hub' }} />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? <LoadingSpinner /> : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <Card className="p-5 space-y-4">
              <div>
                <h2 className="font-bold text-white mb-1">Target Accounts</h2>
                <p className="text-xs text-white/40 mb-3">3 accounts you want to pursue after today</p>
              </div>
              <Input label="Account 1" required id="acc1" value={form.target_account_1}
                onChange={e => setForm(f => ({ ...f, target_account_1: e.target.value }))}
                placeholder="Company name" />
              <Input label="Account 2 (optional)" id="acc2" value={form.target_account_2}
                onChange={e => setForm(f => ({ ...f, target_account_2: e.target.value }))}
                placeholder="Company name" />
              <Input label="Account 3 (optional)" id="acc3" value={form.target_account_3}
                onChange={e => setForm(f => ({ ...f, target_account_3: e.target.value }))}
                placeholder="Company name" />
            </Card>

            <Card className="p-5 space-y-4">
              <div>
                <h2 className="font-bold text-white mb-1">Joint Plays</h2>
                <p className="text-xs text-white/40 mb-3">2 GTM plays you'll run with Salesforce</p>
              </div>
              <Textarea label="Play 1" required id="play1" rows={3} value={form.joint_play_1}
                onChange={e => setForm(f => ({ ...f, joint_play_1: e.target.value }))}
                placeholder="e.g. Agentforce POC package for Retail accounts" />
              <Textarea label="Play 2 (optional)" id="play2" rows={3} value={form.joint_play_2}
                onChange={e => setForm(f => ({ ...f, joint_play_2: e.target.value }))}
                placeholder="e.g. OMS modernisation play for Manufacturing" />
            </Card>

            <Card className="p-5 space-y-4">
              <h2 className="font-bold text-white">Follow-Up</h2>
              <Textarea label="Enablement need" required id="enablement" rows={2} value={form.enablement_need}
                onChange={e => setForm(f => ({ ...f, enablement_need: e.target.value }))}
                placeholder="What do you need from Salesforce to execute?" />
              <Input label="Named Salesforce owner" required id="sf_owner" value={form.sf_owner_name}
                onChange={e => setForm(f => ({ ...f, sf_owner_name: e.target.value }))}
                placeholder="Who is your Salesforce sponsor for these actions?" />
              <Input label="Follow-up date" required type="date" id="followup" value={form.follow_up_date}
                onChange={e => setForm(f => ({ ...f, follow_up_date: e.target.value }))} />
            </Card>

            {saved && (
              <div className="bg-green-500/15 border border-green-500/25 rounded-xl p-3 text-sm text-green-400 text-center font-medium">
                Action plan saved!
              </div>
            )}

            <Button type="submit" loading={saving} className="w-full" size="lg">
              {existing ? 'Update Action Plan' : 'Save Action Plan'}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
