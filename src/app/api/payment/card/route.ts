import { NextRequest, NextResponse } from 'next/server'
import { createCardPayment } from '@/lib/stripe'
import { savePurchase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, cardToken, testResult } = await request.json()

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
      // Salvar a compra no banco de dados
      try {
        await savePurchase({
          email,
          payment_method: 'card',
          payment_status: 'pending',
          stripe_payment_intent_id: result.paymentId,
          amount: 500,
          test_result: testResult
        })
      } catch (dbError) {
        console.error('Erro ao salvar no banco:', dbError)
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