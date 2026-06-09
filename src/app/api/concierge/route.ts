import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { query, queryOne } from '@/lib/db'
import { EVENT_ID } from '@/lib/constants'

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? '' })
}

async function buildSystemPrompt(): Promise<string> {
  const event = await queryOne('SELECT * FROM events WHERE id = $1', [EVENT_ID])
  const speakers = await query('SELECT * FROM speakers WHERE event_id = $1 ORDER BY name', [EVENT_ID])
  const agenda = await query(`
    SELECT ai.*, s.name AS speaker_name, s.company AS speaker_company
    FROM agenda_items ai LEFT JOIN speakers s ON s.id = ai.speaker_id
    WHERE ai.event_id = $1 ORDER BY ai.sort_order, ai.start_time
  `, [EVENT_ID])

  const ev = event as Record<string, unknown>
  const agendaText = (agenda as Record<string, unknown>[]).map(a =>
    `- ${a.session_title} | ${a.start_time} – ${a.end_time} | Room: ${a.room ?? 'TBD'} | Speaker: ${a.speaker_name ?? 'N/A'} (${a.speaker_company ?? ''}) | ${a.description ?? ''}`
  ).join('\n')

  const speakersText = (speakers as Record<string, unknown>[]).map(s =>
    `- ${s.name}, ${s.job_title} at ${s.company}: ${s.bio}`
  ).join('\n')

  return `You are the AI Event Concierge for ${ev.name}, a Salesforce Commerce partner event.

Event: ${ev.name}
Date: ${ev.date}
Venue: ${ev.venue}
Description: ${ev.short_description}

AGENDA:
${agendaText}

SPEAKERS:
${speakersText}

You help attendees:
- Find relevant sessions ("Which sessions cover Agentforce?")
- Locate rooms and facilities ("Where is Room 201?")
- Discover speakers and topics
- Get personalised recommendations based on their role or interests
- Understand the event schedule

Be concise, helpful, and friendly. Answer only about this event. If you don't know something, say so honestly.
Format responses with clear structure — use bullet points or short paragraphs. Keep responses under 200 words unless a detailed answer is genuinely needed.`
}

export async function POST(request: NextRequest) {
  const { message, history } = await request.json()

  if (!message) {
    return NextResponse.json({ error: 'message required' }, { status: 400 })
  }

  try {
    const systemPrompt = await buildSystemPrompt()

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(history ?? []).slice(-8),
      { role: 'user', content: message },
    ]

    const stream = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      max_tokens: 500,
      temperature: 0.7,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? ''
          if (text) controller.enqueue(encoder.encode(text))
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (err) {
    console.error('Concierge error:', err)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 503 })
  }
}
