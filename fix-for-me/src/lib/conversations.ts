import { supabase } from './supabaseClient'

export async function getOrCreateConversation(
  requestId: string,
  customerId: string,
  providerId: string,
) {
  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('id')
    .eq('request_id', requestId)
    .eq('provider_id', providerId)
    .maybeSingle()

  if (fetchError) throw fetchError
  if (existing) return existing.id

  const { data: created, error: insertError } = await supabase
    .from('conversations')
    .insert({ request_id: requestId, customer_id: customerId, provider_id: providerId })
    .select('id')
    .single()

  if (insertError) throw insertError
  return created.id
}