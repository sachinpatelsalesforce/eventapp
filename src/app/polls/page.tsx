'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useContactId } from '@/hooks/useContactId'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface PollOption { id: number; label: string; vote_count: number; percentage: number }
interface Poll {
  id: number; question: string; is_active: boolean
  contact_voted: boolean; contact_option_id: number | null
  options: PollOption[]
}

export default function PollsPage() {
  const contactId = useContactId()
  const { data: polls, mutate, isLoading } = useSWR<Poll[]>(
    `/api/polls?contact_id=${contactId ?? 0}`,
    fetcher,
    { refreshInterval: 5000 }
  )

  const vote = async (pollId: number, optionId: number) => {
    if (!contactId) return
    await fetch(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_id: contactId, option_id: optionId }),
    })
    mutate()
  }

  return (
    <div>
      <Header title="Partner Pulse" subtitle="Live polls — results update in real time" />
      <div className="max-w-4xl mx-auto px-4 py-5 space-y-4">
        {!contactId && (
          <div className="bg-[#0070D2]/10 border border-[#0070D2]/20 rounded-2xl p-4 text-sm text-[#5EB3FF]">
            <Link href="/contact" className="font-semibold hover:underline">Register first</Link>
            <span className="text-white/60"> to vote in polls.</span>
          </div>
        )}
        {isLoading ? <LoadingSpinner /> : polls?.length === 0 ? (
          <p className="text-center text-white/30 py-12">No active polls right now.</p>
        ) : (
          polls?.map(poll => (
            <Card key={poll.id} className="p-5">
              <h2 className="font-bold text-white mb-4">{poll.question}</h2>
              <div className="space-y-2">
                {poll.options.map(option => {
                  const isSelected = poll.contact_option_id === option.id
                  const showResults = poll.contact_voted

                  return (
                    <div key={option.id}>
                      <button
                        onClick={() => vote(poll.id, option.id)}
                        disabled={!contactId}
                        className={`w-full text-left rounded-xl border transition-all relative overflow-hidden ${
                          isSelected
                            ? 'border-[#0070D2] bg-[#0070D2]/20'
                            : 'border-white/10 hover:border-white/20 bg-white/[0.04]'
                        } ${!contactId ? 'cursor-default' : ''}`}
                      >
                        {showResults && (
                          <div
                            className="absolute inset-y-0 left-0 bg-[#0070D2]/20 transition-all"
                            style={{ width: `${option.percentage}%` }}
                          />
                        )}
                        <div className="relative flex items-center justify-between px-3 py-2.5 gap-2">
                          <span className={`text-sm font-medium ${isSelected ? 'text-[#5EB3FF]' : 'text-white/80'}`}>
                            {option.label}
                          </span>
                          {showResults && (
                            <span className="text-sm font-bold text-white/40 flex-shrink-0">
                              {option.percentage}%
                              <span className="text-xs font-normal ml-1">({option.vote_count})</span>
                            </span>
                          )}
                        </div>
                      </button>
                    </div>
                  )
                })}
              </div>
              {poll.contact_voted && (
                <p className="text-xs text-white/30 mt-3 text-right">
                  {poll.options.reduce((s, o) => s + o.vote_count, 0)} votes total · updates live
                </p>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
