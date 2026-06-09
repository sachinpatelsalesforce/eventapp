'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function AdminLoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      router.push('/admin/agenda')
    } else {
      setError('Invalid username or password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#032D60] to-[#0070D2] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#0070D2] rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Commerce Connect</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username" required id="username" autoComplete="username"
            value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          />
          <Input
            label="Password" type="password" required id="password" autoComplete="current-password"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" loading={loading} className="w-full" size="lg">Sign in</Button>
        </form>
      </div>
    </div>
  )
}
