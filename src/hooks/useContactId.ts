'use client'

import { useEffect, useState } from 'react'

export function useContactId(): number | null {
  const [contactId, setContactId] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('contact_id')
    if (stored) setContactId(parseInt(stored, 10))
  }, [])

  return contactId
}

export function saveContactId(id: number): void {
  localStorage.setItem('contact_id', String(id))
}
