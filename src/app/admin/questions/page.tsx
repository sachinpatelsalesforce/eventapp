'use client'

import { useState, useEffect } from 'react'
import { Question } from '@/types'
import { QUESTION_TOPICS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { DataTable } from '@/components/admin/DataTable'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [topicFilter, setTopicFilter] = useState('')

  const fetch_ = async (topic?: string) => {
    const url = topic ? `/api/questions?topic=${topic}` : '/api/questions'
    const data = await fetch(url).then(r => r.json())
    setQuestions(data)
    setLoading(false)
  }

  useEffect(() => { fetch_() }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <p className="text-sm text-gray-500 mt-1">{questions.length} questions</p>
        </div>
        <a href="/api/questions/export"><Button variant="secondary" size="sm">Export CSV</Button></a>
      </div>
      <div className="flex gap-2 overflow-x-auto mb-4">
        <button onClick={() => { setTopicFilter(''); fetch_() }} className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border ${!topicFilter ? 'bg-[#0070D2] text-white border-[#0070D2]' : 'bg-white text-gray-600 border-gray-200'}`}>All</button>
        {QUESTION_TOPICS.map(t => (
          <button key={t.key} onClick={() => { setTopicFilter(t.key); fetch_(t.key) }} className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border ${topicFilter === t.key ? 'bg-[#0070D2] text-white border-[#0070D2]' : 'bg-white text-gray-600 border-gray-200'}`}>{t.label}</button>
        ))}
      </div>
      {loading ? <LoadingSpinner /> : (
        <DataTable
          rows={questions}
          columns={[
            { key: 'question_text', label: 'Question', render: (r) => <span className="line-clamp-2 max-w-sm">{r.question_text as string}</span> },
            { key: 'topic', label: 'Topic', render: (r) => r.topic ? <Badge variant="purple">{QUESTION_TOPICS.find(t => t.key === r.topic)?.label ?? String(r.topic)}</Badge> : <span className="text-gray-400">-</span> },
            { key: 'session_title', label: 'Session', render: (r) => <span className="line-clamp-1">{r.session_title as string}</span> },
            { key: 'contact_name', label: 'Contact' },
            { key: 'submitted_at', label: 'Submitted', render: (r) => new Date(r.submitted_at as string).toLocaleString() },
          ]}
        />
      )}
    </div>
  )
}
