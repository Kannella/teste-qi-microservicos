import { NextRequest, NextResponse } from 'next/server'
import { getAllPurchasedEmails } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Buscar todos os emails de compradores
    const purchases = await getAllPurchasedEmails()

    return NextResponse.json({
      success: true,
      data: purchases,
      total: purchases.length
    })
  } catch (error) {
    console.error('Erro ao buscar emails:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Endpoint para exportar emails em formato CSV
export async function POST(request: NextRequest) {
  try {
    const { format } = await request.json()
    
    const purchases = await getAllPurchasedEmails()

    if (format === 'csv') {
      // Gerar CSV
      const csvHeader = 'Email,Data da Compra,Método de Pagamento,Valor\n'
      const csvData = purchases.map(purchase => 
        `${purchase.email},${new Date(purchase.created_at).toLocaleDateString('pt-BR')},${purchase.payment_method === 'card' ? 'Cartão' : 'PIX'},R$ ${(purchase.amount / 100).toFixed(2)}`
      ).join('\n')

      const csvContent = csvHeader + csvData

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="emails_compradores.csv"'
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: purchases,
      total: purchases.length
    })
  } catch (error) {
    console.error('Erro ao exportar emails:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}