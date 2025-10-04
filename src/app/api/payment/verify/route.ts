import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/stripe'
import { updateCustomerPaymentStatus, getCustomerByPaymentId, markEmailAsSent } from '@/lib/customer-emails-db'
import { sendTestResultEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID do pagamento é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar status do pagamento
    const paymentStatus = await checkPaymentStatus(paymentId)

    if (paymentStatus.status === 'succeeded' || paymentStatus.status === 'paid') {
      // Buscar dados do cliente
      const customer = await getCustomerByPaymentId(paymentId)
      
      if (!customer) {
        return NextResponse.json(
          { error: 'Cliente não encontrado' },
          { status: 404 }
        )
      }

      // Atualizar status no banco
      await updateCustomerPaymentStatus(paymentId, 'completed')

      // Enviar email se ainda não foi enviado
      if (!customer.email_sent) {
        try {
          await sendTestResultEmail({
            email: customer.email,
            fullName: customer.full_name || 'Cliente',
            testScore: customer.test_score || 0,
            paymentId: paymentId,
            paymentAmount: customer.payment_amount || 5.00
          })

          // Marcar email como enviado
          await markEmailAsSent(paymentId)

          return NextResponse.json({
            success: true,
            status: 'completed',
            emailSent: true,
            message: 'Pagamento confirmado e email enviado!'
          })
        } catch (emailError) {
          console.error('Erro ao enviar email:', emailError)
          return NextResponse.json({
            success: true,
            status: 'completed',
            emailSent: false,
            message: 'Pagamento confirmado, mas houve erro no envio do email'
          })
        }
      } else {
        return NextResponse.json({
          success: true,
          status: 'completed',
          emailSent: true,
          message: 'Pagamento já confirmado e email já enviado'
        })
      }
    } else if (paymentStatus.status === 'failed' || paymentStatus.status === 'canceled') {
      // Atualizar status como falhou
      await updateCustomerPaymentStatus(paymentId, 'failed')
      
      return NextResponse.json({
        success: false,
        status: 'failed',
        message: 'Pagamento falhou ou foi cancelado'
      })
    } else {
      // Pagamento ainda pendente
      return NextResponse.json({
        success: false,
        status: 'pending',
        message: 'Pagamento ainda está sendo processado'
      })
    }
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}