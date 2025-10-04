import Stripe from 'stripe'

// Inicializar Stripe no servidor
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export interface PaymentData {
  amount: number // em centavos (500 = R$ 5,00)
  currency: string
  email: string
  description: string
}

export interface PixPaymentData extends PaymentData {
  method: 'pix'
}

export interface CardPaymentData extends PaymentData {
  method: 'card'
  cardToken: string
}

// Criar pagamento PIX usando Stripe
export async function createPixPayment(data: PixPaymentData) {
  try {
    // Criar Payment Intent no Stripe para PIX
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      receipt_email: data.email,
      payment_method_types: ['pix'], // Stripe suporta PIX no Brasil
      metadata: {
        email: data.email,
        product: 'teste-qi',
        method: 'pix'
      }
    })

    // Confirmar o Payment Intent para gerar o código PIX
    const confirmedPayment = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: {
        type: 'pix',
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`
    })

    // Extrair dados do PIX da resposta do Stripe
    const pixData = confirmedPayment.next_action?.pix_display_qr_code

    if (!pixData) {
      throw new Error('Falha ao gerar código PIX')
    }

    return {
      success: true,
      pixCode: pixData.data,
      qrCode: pixData.image_url_png,
      expiresAt: new Date(pixData.expires_at * 1000),
      paymentId: paymentIntent.id
    }
  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error)
    
    // Fallback para código PIX manual se Stripe falhar
    const fallbackPixCode = '00020126360014br.gov.bcb.pix0114+551197661735052040000530398654045.005802BR5925GIOVANNI DE AQUINO CANELL6009SAO PAULO62450507TesteQI50300017br.gov.bcb.brcode01051.0.06304D924'
    
    return {
      success: true,
      pixCode: fallbackPixCode,
      qrCode: null, // Será gerado no frontend
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
      paymentId: `manual_pix_${Date.now()}`,
      isManual: true
    }
  }
}

// Criar pagamento com cartão
export async function createCardPayment(data: CardPaymentData) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      receipt_email: data.email,
      metadata: {
        email: data.email,
        product: 'teste-qi'
      }
    })

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    }
  } catch (error) {
    console.error('Erro ao criar pagamento com cartão:', error)
    return {
      success: false,
      error: 'Erro ao processar pagamento com cartão'
    }
  }
}

// Verificar status do pagamento no Stripe
export async function checkPaymentStatus(paymentId: string) {
  try {
    if (paymentId.startsWith('manual_pix_')) {
      // Para PIX manual, sempre retorna pending até webhook confirmar
      return {
        status: 'pending',
        paymentId
      }
    }

    // Verificar pagamento no Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId)
    
    return {
      status: paymentIntent.status,
      paymentId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    }
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return {
      status: 'error',
      paymentId
    }
  }
}

export default stripe