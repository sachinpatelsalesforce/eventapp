import Image from 'next/image'
import Link from 'next/link'
import { query } from '@/lib/db'
import { Speaker } from '@/types'
import { EVENT_ID } from '@/lib/constants'

export const dynamic = 'force-dynamic'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'

export const metadata = { title: 'Speakers | Commerce Connect' }

async function getSpeakers(): Promise<Speaker[]> {
  return query<Speaker>('SELECT * FROM speakers WHERE event_id = $1 ORDER BY name', [EVENT_ID])
}

export default async function SpeakersPage() {
  const speakers = await getSpeakers()

  return (
    <div>
      <Header title="Speakers" subtitle={`${speakers.length} speaker${speakers.length !== 1 ? 's' : ''}`} />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {speakers.map(speaker => (
            <Card key={speaker.id} className="p-5">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={speaker.photo_url ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(speaker.name)}&background=0070d2&color=fff&size=128&bold=true`}
                      alt={speaker.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-gray-900 text-base">{speaker.name}</h2>
                  {(speaker.job_title || speaker.company) && (
                    <p className="text-sm text-[#0070D2] font-medium mt-0.5">
                      {[speaker.job_title, speaker.company].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {speaker.bio && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{speaker.bio}</p>
                  )}
                  {speaker.linkedin_url && (
                    <a
                      href={speaker.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 text-xs text-[#0070D2] hover:underline font-medium"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {speakers.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">Speakers coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
