import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export interface Purchase {
  id: string
  email: string
  payment_method: 'card' | 'pix'
  payment_status: 'pending' | 'completed' | 'failed'
  stripe_payment_intent_id?: string
  amount: number
  test_result?: number
  created_at: string
  updated_at: string
}

// Função para salvar uma compra
export async function savePurchase(purchaseData: Omit<Purchase, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('purchases')
    .insert([purchaseData])
    .select()
    .single()

  if (error) {
    console.error('Erro ao salvar compra:', error)
    throw error
  }

  return data
}

// Função para atualizar status do pagamento
export async function updatePaymentStatus(
  paymentIntentId: string, 
  status: 'completed' | 'failed',
  testResult?: number
) {
  const { data, error } = await supabase
    .from('purchases')
    .update({ 
      payment_status: status,
      test_result: testResult,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar status do pagamento:', error)
    throw error
  }

  return data
}

// Função para buscar compra por email
export async function getPurchaseByEmail(email: string) {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('email', email)
    .eq('payment_status', 'completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar compra:', error)
    throw error
  }

  return data
}

// Função para listar todos os emails de compradores
export async function getAllPurchasedEmails() {
  const { data, error } = await supabase
    .from('purchases')
    .select('email, created_at, payment_method, amount')
    .eq('payment_status', 'completed')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar emails:', error)
    throw error
  }

  return data
}