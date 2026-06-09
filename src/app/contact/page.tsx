'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { saveContactId } from '@/hooks/useContactId'

export default function ContactPage() {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', company: '', job_title: '', consent: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.consent) { setError('Please accept the privacy consent to continue.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Registration failed')
      const data = await res.json()
      saveContactId(data.id)
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div>
        <Header title="You're registered!" />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome!</h2>
          <p className="text-white/50 mb-8">You're all set. Explore the app and make the most of today.</p>
          <div className="space-y-3">
            <Link href="/agenda" className="block">
              <Button className="w-full" size="lg">View the Agenda</Button>
            </Link>
            <Link href="/partners/profile" className="block">
              <Button variant="secondary" className="w-full" size="lg">Build your Partner Profile</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Register" subtitle="Takes 30 seconds" />
      <div className="max-w-md mx-auto px-4 py-6">
        <Card className="p-6">
          <p className="text-sm text-white/50 mb-6">Register once to unlock Q&A, feedback, partner features, and your enablement passport.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name" required id="first_name" value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
              />
              <Input
                label="Last name" required id="last_name" value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
              />
            </div>
            <Input
              label="Email" type="email" required id="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
            <Input
              label="Company" id="company" value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
            />
            <Input
              label="Job title" id="job_title" value={form.job_title}
              onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))}
            />
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/[0.06] text-[#0070D2] focus:ring-[#0070D2]"
                checked={form.consent}
                onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
              />
              <span className="text-sm text-white/50 leading-snug">
                I consent to my contact details being stored and used by the event organiser in accordance with their privacy policy. <span className="text-red-400">*</span>
              </span>
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Register
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
