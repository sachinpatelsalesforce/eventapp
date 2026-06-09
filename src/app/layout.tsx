import type { Metadata } from 'next'
import './globals.css'
import { BottomNav } from '@/components/layout/BottomNav'
import { SettingsProvider } from '@/contexts/SettingsContext'

export const metadata: Metadata = {
  title: 'Commerce Connect',
  description: 'The partner GTM engine for Salesforce Commerce events',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0070D2',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>
          <main className="min-h-screen pb-20 md:pb-0">
            {children}
          </main>
          <BottomNav />
        </SettingsProvider>
      </body>
    </html>
  )
}
