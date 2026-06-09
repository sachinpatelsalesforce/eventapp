'use client'

import { useState, useEffect } from 'react'
import { ActionPlan } from '@/types'

type ActionPlanRow = ActionPlan & { contact_name: string; si_name?: string }
import { Button } from '@/components/ui/Button'
import { DataTable } from '@/components/admin/DataTable'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function AdminActionPlansPage() {
  const [plans, setPlans] = useState<ActionPlanRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/action-plans').then(r => r.json()).then(data => { setPlans(data); setLoading(false) })
  }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Action Plans</h1>
          <p className="text-sm text-gray-500 mt-1">{plans.length} submitted</p>
        </div>
        <a href="/api/admin/action-plans/export"><Button variant="secondary" size="sm">Export CSV</Button></a>
      </div>
      {loading ? <LoadingSpinner /> : (
        <DataTable
          rows={plans}
          columns={[
            { key: 'contact_name', label: 'Contact' },
            { key: 'si_name', label: 'SI', render: (r) => String(r.si_name ?? '-') },
            { key: 'target_account_1', label: 'Account 1' },
            { key: 'target_account_2', label: 'Account 2', render: (r) => String(r.target_account_2 ?? '-') },
            { key: 'joint_play_1', label: 'Play 1', render: (r) => <span className="line-clamp-1 max-w-xs">{r.joint_play_1 as string}</span> },
            { key: 'sf_owner_name', label: 'SF Owner' },
            { key: 'follow_up_date', label: 'Follow-up', render: (r) => new Date(r.follow_up_date as string).toLocaleDateString() },
          ]}
        />
      )}
    </div>
  )
}
