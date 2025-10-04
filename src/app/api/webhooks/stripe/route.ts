import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { updateCustomerPaymentStatus, getCustomerByPaymentId } from '@/lib/customer-emails-db'
import { sendTestResultEmail } from '@/lib/email-service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Assinatura do webhook ausente' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Erro na verificação do webhook:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Processar eventos do Stripe
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro no webhook do Stripe:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentId = paymentIntent.id
    const customerEmail = paymentIntent.receipt_email || paymentIntent.metadata?.email

    if (!customerEmail) {
      console.error('Email do cliente não encontrado no pagamento:', paymentId)
      return
    }

    // Buscar dados do cliente no banco
    const customer = await getCustomerByPaymentId(paymentId)
    
    if (!customer) {
      console.error('Cliente não encontrado no banco para pagamento:', paymentId)
      return
    }

    // Atualizar status do pagamento no banco
    await updateCustomerPaymentStatus(paymentId, 'completed')

    // Enviar email com resultado do teste
    await sendTestResultEmail({
      email: customerEmail,
      fullName: customer.full_name || 'Cliente',
      testScore: customer.test_score || 0,
      paymentId: paymentId,
      paymentAmount: customer.payment_amount || 5.00
    })

    console.log(`Email de resultado enviado para: ${customerEmail}`)
  } catch (error) {
    console.error('Erro ao processar pagamento aprovado:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const paymentId = paymentIntent.id
    
    // Atualizar status do pagamento no banco
    await updateCustomerPaymentStatus(paymentId, 'failed')
    
    console.log(`Pagamento falhou: ${paymentId}`)
  } catch (error) {
    console.error('Erro ao processar pagamento falhou:', error)
  }
}