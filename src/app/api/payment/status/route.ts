import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/stripe'
import { getCustomerByPaymentId } from '@/lib/customer-emails-db'

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

    // Verificar status no Stripe
    const paymentStatus = await checkPaymentStatus(paymentId)
    
    // Verificar no banco de dados local
    const customer = await getCustomerByPaymentId(paymentId)

    return NextResponse.json({
      success: true,
      status: paymentStatus.status,
      paymentId,
      customer: customer ? {
        email: customer.email,
        paymentStatus: customer.payment_status,
        emailSent: customer.email_sent
      } : null
    })
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}