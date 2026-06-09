'use client'

import { useState, useEffect } from 'react'
import { Feedback } from '@/types'
import { Button } from '@/components/ui/Button'
import { StarRating } from '@/components/ui/StarRating'
import { DataTable } from '@/components/admin/DataTable'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/feedback').then(r => r.json()).then(data => { setFeedback(data); setLoading(false) })
  }, [])

  const avg = feedback.length ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : '-'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
          <p className="text-sm text-gray-500 mt-1">{feedback.length} responses · avg rating {avg}/5</p>
        </div>
        <a href="/api/feedback/export"><Button variant="secondary" size="sm">Export CSV</Button></a>
      </div>
      {loading ? <LoadingSpinner /> : (
        <DataTable
          rows={feedback}
          columns={[
            { key: 'rating', label: 'Rating', render: (r) => <StarRating value={r.rating as number} readonly size="sm" /> },
            { key: 'contact_name', label: 'Contact' },
            { key: 'enjoyed', label: 'Enjoyed', render: (r) => <span className="line-clamp-1 max-w-xs">{r.enjoyed as string || '-'}</span> },
            { key: 'improve', label: 'Improve', render: (r) => <span className="line-clamp-1 max-w-xs">{r.improve as string || '-'}</span> },
            { key: 'submitted_at', label: 'Submitted', render: (r) => new Date(r.submitted_at as string).toLocaleString() },
          ]}
        />
      )}
    </div>
  )
}
