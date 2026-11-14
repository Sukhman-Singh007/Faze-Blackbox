// Supabase Edge Function: validate-answer
// POST { room_code, stage_id, guess } -> { correct: boolean }
// The plaintext answer is NEVER in the client bundle and NEVER returned.
// The function hashes the normalized guess and compares it to the hash
// stored in public.stage_answers (service-role read only).
// Deploy: supabase functions deploy validate-answer
// Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (server-side only).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function normalize(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  try {
    const { room_code, stage_id, guess } = await req.json()
    if (!room_code || !stage_id || typeof guess !== 'string') {
      return Response.json({ correct: false, error: 'Missing room_code, stage_id or guess' }, { status: 400 })
    }
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data, error } = await supabase.from('stage_answers').select('answer_hash').eq('stage_id', stage_id).single()
    if (error || !data) return Response.json({ correct: false, error: 'Unknown stage' }, { status: 404 })
    const correct = (await sha256Hex(normalize(guess))) === data.answer_hash
    if (correct) {
      // Advance the room server-side so a client cannot fake progression.
      const { data: room } = await supabase.from('rooms').select('stage,status').eq('code', room_code).single()
      if (room) {
        const nextStage = stage_id >= 3 ? 4 : stage_id + 1
        await supabase.from('rooms').update({
          stage: nextStage,
          status: stage_id >= 3 ? 'completed' : 'playing',
          completed_at: stage_id >= 3 ? new Date().toISOString() : null,
          last_event: `Stage ${stage_id} solved`,
        }).eq('code', room_code)
      }
    }
    return Response.json({ correct })
  } catch {
    return Response.json({ correct: false, error: 'Validation failed' }, { status: 500 })
  }
})
