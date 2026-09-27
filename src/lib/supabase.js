import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const offlineError = new Error('Supabase is not configured for this local preview.')

const createOfflineQuery = () => {
  const result = { data: null, error: offlineError }
  const query = {
    select: () => query,
    insert: () => query,
    update: () => query,
    upsert: () => query,
    delete: () => query,
    eq: () => query,
    ilike: () => query,
    single: () => Promise.resolve(result),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  }

  return query
}

const offlineSupabase = {
  from: () => createOfflineQuery(),
  auth: {
    signOut: async () => ({ error: null }),
    signUp: async () => ({ data: null, error: offlineError }),
    signInWithPassword: async () => ({ data: null, error: offlineError }),
  },
}

const hasSupabaseConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseAnonKey !== 'local-preview-only'

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : offlineSupabase
