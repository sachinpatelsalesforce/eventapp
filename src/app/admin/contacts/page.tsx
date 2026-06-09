'use client'

import { useState, useEffect } from 'react'
import { Contact } from '@/types'
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/admin/DataTable'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/contacts').then(r => r.json()).then(data => { setContacts(data); setLoading(false) })
  }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">{contacts.length} registered</p>
        </div>
        <a href="/api/contacts/export">
          <Button variant="secondary" size="sm">Export CSV</Button>
        </a>
      </div>
      {loading ? <LoadingSpinner /> : (
        <DataTable
          rows={contacts}
          columns={[
            { key: 'id', label: 'ID', className: 'w-12' },
            { key: 'first_name', label: 'First' },
            { key: 'last_name', label: 'Last' },
            { key: 'email', label: 'Email' },
            { key: 'company', label: 'Company' },
            { key: 'job_title', label: 'Title' },
            { key: 'consent', label: 'Consent', render: (r) => r.consent ? '✓' : '✗' },
            { key: 'created_at', label: 'Registered', render: (r) => new Date(r.created_at as string).toLocaleDateString() },
          ]}
        />
      )}
    </div>
  )
}
