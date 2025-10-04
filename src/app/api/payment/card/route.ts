import { NextRequest, NextResponse } from 'next/server'
import { createCardPayment } from '@/lib/stripe'
import { createCustomerEmail } from '@/lib/customer-emails-db'

export async function POST(request: NextRequest) {
  try {
    const { email, cardToken, testResult, fullName, phone } = await request.json()

    if (!email || !cardToken) {
      return NextResponse.json(
        { error: 'Email e dados do cartão são obrigatórios' },
        { status: 400 }
      )
    }

    const paymentData = {
      amount: 500, // R$ 5,00 em centavos
      currency: 'brl',
      email,
      description: 'Teste de QI Profissional - Resultado + Certificado',
      method: 'card' as const,
      cardToken
    }

    const result = await createCardPayment(paymentData)

    if (result.success) {
      // Salvar o email do comprador no banco de dados
      try {
        await createCustomerEmail({
          email,
          full_name: fullName,
          phone,
          payment_method: 'card',
          payment_amount: 5.00,
          payment_status: 'pending',
          stripe_payment_id: result.paymentId,
          test_score: testResult?.score,
          email_sent: false
        })
      } catch (dbError) {
        console.error('Erro ao salvar email do comprador:', dbError)
        // Continua mesmo se falhar ao salvar no banco
      }

      return NextResponse.json({
        success: true,
        clientSecret: result.clientSecret,
        paymentId: result.paymentId
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro na API Cartão:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}