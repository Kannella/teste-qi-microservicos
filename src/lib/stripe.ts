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

// Criar pagamento PIX
export async function createPixPayment(data: PixPaymentData) {
  try {
    // No Stripe, PIX ainda não está disponível diretamente
    // Você pode usar outros provedores como Mercado Pago, PagSeguro, etc.
    
    // Simulação de resposta PIX
    const pixCode = generateMockPixCode()
    
    return {
      success: true,
      pixCode,
      qrCode: `data:image/png;base64,${generateMockQRCode()}`,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
      paymentId: `pix_${Date.now()}`
    }
  } catch (error) {
    console.error('Erro ao criar pagamento PIX:', error)
    return {
      success: false,
      error: 'Erro ao processar pagamento PIX'
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

// Verificar status do pagamento
export async function checkPaymentStatus(paymentId: string) {
  try {
    if (paymentId.startsWith('pix_')) {
      // Simulação de verificação PIX
      // Em produção, você consultaria a API do provedor PIX
      return {
        status: Math.random() > 0.8 ? 'paid' : 'pending',
        paymentId
      }
    } else {
      // Verificar pagamento Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId)
      return {
        status: paymentIntent.status,
        paymentId
      }
    }
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error)
    return {
      status: 'error',
      paymentId
    }
  }
}

// Funções auxiliares para simulação PIX
function generateMockPixCode(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  return `00020126580014BR.GOV.BCB.PIX013636c4b8c4-4c4c-4c4c-4c4c-4c4c4c4c4c4c5204000053039865802BR5925TESTE QI PROFISSIONAL6009SAO PAULO62070503***6304${random}`
}

function generateMockQRCode(): string {
  // Base64 de um QR code simples (em produção, use uma biblioteca real)
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
}

export default stripe