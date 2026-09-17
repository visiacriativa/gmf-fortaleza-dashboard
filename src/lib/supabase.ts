import { createClient } from '@supabase/supabase-js'

// A "publishable/anon" key é feita para ir no código do site — não é secreta.
// A segurança real vem das políticas de RLS configuradas no banco (ver supabase_schema.sql).
const SUPABASE_URL = 'https://bowcpcljiklwcdxdtflx.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dydypVfvUZ8NN89WdGFRjQ_5c_Lu2OV'

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  realtime: { params: { eventsPerSecond: 10 } },
})
