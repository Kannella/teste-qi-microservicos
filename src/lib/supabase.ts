import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para a tabela customer_emails
export interface CustomerEmail {
  id: string
  email: string
  purchase_date: string
  payment_method?: string
  amount?: number
  status: string
  created_at: string
  updated_at: string
}