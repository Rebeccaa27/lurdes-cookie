import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key || url.includes('SEU_PROJETO')) {
  console.warn('⚠️  Configure o arquivo .env com suas credenciais do Supabase.')
}

export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder')