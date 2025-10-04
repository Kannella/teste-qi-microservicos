import { NextRequest, NextResponse } from 'next/server'
import { createPixPayment } from '@/lib/stripe'
import { createCustomerEmail } from '@/lib/customer-emails-db'

export async function POST(request: NextRequest) {
  try {
    const { email, testResult, fullName, phone } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    const paymentData = {
      amount: 500, // R$ 5,00 em centavos
      currency: 'brl',
      email,
      description: 'Teste de QI Profissional - Resultado + Certificado',
      method: 'pix' as const
    }

    const result = await createPixPayment(paymentData)

    if (result.success) {
      // Salvar o email do comprador no banco de dados
      try {
        await createCustomerEmail({
          email,
          full_name: fullName,
          phone,
          payment_method: 'pix',
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
        pixCode: result.pixCode,
        qrCode: result.qrCode,
        expiresAt: result.expiresAt,
        paymentId: result.paymentId
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro na API PIX:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}