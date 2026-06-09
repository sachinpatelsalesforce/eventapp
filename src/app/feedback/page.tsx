'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { StarRating } from '@/components/ui/StarRating'
import { useContactId } from '@/hooks/useContactId'

export default function FeedbackPage() {
  const contactId = useContactId()
  const [form, setForm] = useState({ rating: 0, enjoyed: '', improve: '', future_topics: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.rating) { setError('Please give a rating.'); return }
    setLoading(true)
    setError('')
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, contact_id: contactId }),
    })
    if (res.ok) setDone(true)
    else setError('Failed to submit. Please try again.')
    setLoading(false)
  }

  if (done) {
    return (
      <div>
        <Header title="Thank you!" />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 bg-[#E3F5E1] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#04844B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback received</h2>
          <p className="text-gray-500 mb-2">Thanks for helping us improve.</p>
          <p className="text-sm text-[#0070D2] font-medium mb-8">Your Feedback Form passport stamp has been awarded! 🎉</p>
          <Link href="/partners/passport">
            <Button>View your Passport</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header title="Feedback" subtitle="Help us improve" />
      <div className="max-w-md mx-auto px-4 py-6">
        {!contactId ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500 mb-4">Register first to leave feedback</p>
            <Link href="/contact"><Button>Register</Button></Link>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall rating <span className="text-red-500">*</span>
                </label>
                <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} size="lg" />
              </div>
              <Textarea
                label="What did you enjoy?" id="enjoyed" rows={3}
                value={form.enjoyed}
                onChange={e => setForm(f => ({ ...f, enjoyed: e.target.value }))}
                placeholder="What worked well today?"
              />
              <Textarea
                label="What could be better?" id="improve" rows={3}
                value={form.improve}
                onChange={e => setForm(f => ({ ...f, improve: e.target.value }))}
                placeholder="What would you change?"
              />
              <Textarea
                label="What would you like to see at future events?" id="future" rows={3}
                value={form.future_topics}
                onChange={e => setForm(f => ({ ...f, future_topics: e.target.value }))}
                placeholder="Topics, formats, activities…"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="w-full" size="lg">
                Submit Feedback
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  )
}
