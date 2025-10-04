import { supabase } from './supabase'

export interface CustomerEmail {
  id?: number
  email: string
  full_name?: string
  phone?: string
  payment_method: 'card' | 'pix'
  payment_amount: number
  payment_status: 'pending' | 'completed' | 'failed'
  stripe_payment_id?: string
  test_score?: number
  created_at?: string
  updated_at?: string
  email_sent?: boolean
  email_sent_at?: string
}

export interface CustomerEmailStats {
  total: number
  completed: number
  pending: number
  failed: number
  totalRevenue: number
  averageScore: number
}

// Criar novo registro de email de cliente
export async function createCustomerEmail(data: Omit<CustomerEmail, 'id' | 'created_at' | 'updated_at'>): Promise<CustomerEmail | null> {
  try {
    const { data: result, error } = await supabase
      .from('customer_emails')
      .insert([{
        ...data,
        payment_status: data.payment_status || 'pending',
        email_sent: false
      }])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar email de cliente:', error)
      return null
    }

    return result
  } catch (error) {
    console.error('Erro ao criar email de cliente:', error)
    return null
  }
}

// Buscar todos os emails de clientes com filtros
export async function getCustomerEmails(filters?: {
  payment_status?: string
  payment_method?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<CustomerEmail[]> {
  try {
    let query = supabase
      .from('customer_emails')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.payment_status) {
      query = query.eq('payment_status', filters.payment_status)
    }

    if (filters?.payment_method) {
      query = query.eq('payment_method', filters.payment_method)
    }

    if (filters?.search) {
      query = query.or(`email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erro ao buscar emails de clientes:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Erro ao buscar emails de clientes:', error)
    return []
  }
}

// Buscar cliente por ID do pagamento
export async function getCustomerByPaymentId(paymentId: string): Promise<CustomerEmail | null> {
  try {
    const { data, error } = await supabase
      .from('customer_emails')
      .select('*')
      .eq('stripe_payment_id', paymentId)
      .single()

    if (error) {
      console.error('Erro ao buscar cliente por payment ID:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar cliente por payment ID:', error)
    return null
  }
}

// Atualizar status do pagamento
export async function updateCustomerPaymentStatus(
  paymentId: string, 
  status: 'pending' | 'completed' | 'failed'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customer_emails')
      .update({ 
        payment_status: status,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_id', paymentId)

    if (error) {
      console.error('Erro ao atualizar status do pagamento:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao atualizar status do pagamento:', error)
    return false
  }
}

// Marcar email como enviado
export async function markEmailAsSent(paymentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customer_emails')
      .update({ 
        email_sent: true,
        email_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_id', paymentId)

    if (error) {
      console.error('Erro ao marcar email como enviado:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao marcar email como enviado:', error)
    return false
  }
}

// Buscar estatísticas dos emails de clientes
export async function getCustomerEmailStats(): Promise<CustomerEmailStats> {
  try {
    const { data, error } = await supabase
      .from('customer_emails')
      .select('payment_status, payment_amount, test_score')

    if (error) {
      console.error('Erro ao buscar estatísticas:', error)
      return {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        totalRevenue: 0,
        averageScore: 0
      }
    }

    const stats = data.reduce((acc, item) => {
      acc.total++
      
      if (item.payment_status === 'completed') {
        acc.completed++
        acc.totalRevenue += item.payment_amount || 0
      } else if (item.payment_status === 'pending') {
        acc.pending++
      } else if (item.payment_status === 'failed') {
        acc.failed++
      }

      if (item.test_score) {
        acc.scoreSum = (acc.scoreSum || 0) + item.test_score
        acc.scoreCount = (acc.scoreCount || 0) + 1
      }

      return acc
    }, {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      totalRevenue: 0,
      scoreSum: 0,
      scoreCount: 0
    } as any)

    return {
      total: stats.total,
      completed: stats.completed,
      pending: stats.pending,
      failed: stats.failed,
      totalRevenue: stats.totalRevenue,
      averageScore: stats.scoreCount > 0 ? Math.round(stats.scoreSum / stats.scoreCount) : 0
    }
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      totalRevenue: 0,
      averageScore: 0
    }
  }
}

// Buscar cliente por email
export async function getCustomerByEmail(email: string): Promise<CustomerEmail | null> {
  try {
    const { data, error } = await supabase
      .from('customer_emails')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Erro ao buscar cliente por email:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Erro ao buscar cliente por email:', error)
    return null
  }
}

// Deletar registro de email de cliente
export async function deleteCustomerEmail(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customer_emails')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar email de cliente:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao deletar email de cliente:', error)
    return false
  }
}