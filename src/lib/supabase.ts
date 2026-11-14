import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabaseConfigured = Boolean(url && anonKey)
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null

/** Production validation path — call the Edge Function instead of the
 *  client-side hash check. Returns true only if the server says so.
 *  Falls back to null (caller uses demo hash validation) when Supabase
 *  is not configured, so the demo still plays offline. */
export async function validateAnswerServer(
  roomCode: string,
  stageId: number,
  guess: string,
): Promise<boolean | null> {
  if (!supabase) return null
  const { data, error } = await supabase.functions.invoke('validate-answer', {
    body: { room_code: roomCode, stage_id: stageId, guess },
  })
  if (error) return null
  return Boolean((data as { correct?: boolean })?.correct)
}
