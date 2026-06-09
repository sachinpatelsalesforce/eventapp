'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'interested_sessions'

export function useInterests(contactId: number | null) {
  const [interests, setInterests] = useState<Set<number>>(new Set())

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setInterests(new Set(JSON.parse(stored)))
      } catch {
        // ignore parse errors
      }
    }
  }, [])

  const isInterested = (agendaItemId: number) => interests.has(agendaItemId)

  const toggleInterest = async (agendaItemId: number) => {
    const next = new Set(interests)
    const action = next.has(agendaItemId) ? 'remove' : 'add'

    if (action === 'add') next.add(agendaItemId)
    else next.delete(agendaItemId)

    setInterests(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]))

    if (contactId) {
      fetch('/api/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact_id: contactId, agenda_item_id: agendaItemId, action }),
      }).catch(() => {})
    }
  }

  return { isInterested, toggleInterest, interests }
}
