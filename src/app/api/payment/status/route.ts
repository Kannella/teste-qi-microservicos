import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/stripe'
import { updatePaymentStatus } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID é obrigatório' },
        { status: 400 }
      )
    }

    const result = await checkPaymentStatus(paymentId)

    // Atualizar status no banco de dados se o pagamento foi concluído
    if (result.status === 'succeeded') {
      try {
        await updatePaymentStatus(paymentId, 'completed')
      } catch (dbError) {
        console.error('Erro ao atualizar status no banco:', dbError)
        // Continua mesmo se falhar ao atualizar no banco
      }
    } else if (result.status === 'failed' || result.status === 'canceled') {
      try {
        await updatePaymentStatus(paymentId, 'failed')
      } catch (dbError) {
        console.error('Erro ao atualizar status no banco:', dbError)
        // Continua mesmo se falhar ao atualizar no banco
      }
    }

    return NextResponse.json({
      status: result.status,
      paymentId: result.paymentId
    })
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}