import type { Metadata, Viewport } from 'next'
import './globals.css'
import { BottomNav } from '@/components/layout/BottomNav'
import { SettingsProvider } from '@/contexts/SettingsContext'

export const metadata: Metadata = {
  title: 'Commerce Connect',
  description: 'The partner GTM engine for Salesforce Commerce events',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#061528',
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
