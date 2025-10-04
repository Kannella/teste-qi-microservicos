import { NextRequest, NextResponse } from 'next/server'
import { 
  getAllCustomerEmails, 
  getCustomerStats, 
  exportCustomersToCSV,
  getCustomersByPaymentMethod 
} from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const method = searchParams.get('method') as 'card' | 'pix' | null

    switch (action) {
      case 'stats':
        const stats = await getCustomerStats()
        return NextResponse.json(stats)

      case 'export':
        const csvContent = await exportCustomersToCSV()
        return new NextResponse(csvContent, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="compradores.csv"'
          }
        })

      case 'by-method':
        if (!method) {
          return NextResponse.json({ error: 'Método de pagamento é obrigatório' }, { status: 400 })
        }
        const customersByMethod = await getCustomersByPaymentMethod(method)
        return NextResponse.json(customersByMethod)

      default:
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
        const customers = await getAllCustomerEmails(limit)
        return NextResponse.json(customers)
    }
  } catch (error) {
    console.error('Erro na API de emails:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, data } = body

    if (action === 'mark-sent' && email) {
      const { markEmailSent } = await import('@/lib/supabase')
      const result = await markEmailSent(email)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (error) {
    console.error('Erro na API de emails:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}