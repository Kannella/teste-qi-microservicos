'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreditCard, Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

// Inicializar Stripe (substitua pela sua chave pública)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...')

export default function CardPayment() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const email = searchParams.get('email') || ''
  
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
    email: email
  })

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value)
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value)
    } else if (field === 'cvc') {
      formattedValue = value.replace(/[^0-9]/g, '').substring(0, 4)
    }
    
    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }))
  }

  const validateCard = () => {
    const { number, expiry, cvc, name, email } = cardData
    
    if (!number || number.replace(/\s/g, '').length < 13) {
      setError('Número do cartão inválido')
      return false
    }
    
    if (!expiry || expiry.length !== 5) {
      setError('Data de validade inválida')
      return false
    }
    
    if (!cvc || cvc.length < 3) {
      setError('CVV inválido')
      return false
    }
    
    if (!name.trim()) {
      setError('Nome do titular é obrigatório')
      return false
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Email inválido')
      return false
    }
    
    return true
  }

  const handlePayment = async () => {
    setError('')
    
    if (!validateCard()) {
      return
    }
    
    setLoading(true)
    
    try {
      // Simular processamento do pagamento com Stripe
      // Em produção, você faria uma chamada para sua API backend
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Simular sucesso (90% de chance)
      if (Math.random() > 0.1) {
        setSuccess(true)
        
        // Redirecionar para página de sucesso após 2 segundos
        setTimeout(() => {
          router.push(`/payment/success?email=${encodeURIComponent(cardData.email)}&method=card`)
        }, 2000)
      } else {
        setError('Pagamento recusado. Verifique os dados do cartão.')
      }
    } catch (err) {
      setError('Erro no processamento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Pagamento Aprovado!</h2>
            <p className="text-green-600 mb-4">Redirecionando...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">Pagamento com Cartão</h1>
        </div>

        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center">
              <CreditCard className="h-6 w-6 mr-2" />
              Dados do Cartão
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email para receber o resultado</Label>
              <Input
                id="email"
                type="email"
                value={cardData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="number">Número do Cartão</Label>
              <Input
                id="number"
                value={cardData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="name">Nome do Titular</Label>
              <Input
                id="name"
                value={cardData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="NOME COMO NO CARTÃO"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiry">Validade</Label>
                <Input
                  id="expiry"
                  value={cardData.expiry}
                  onChange={(e) => handleInputChange('expiry', e.target.value)}
                  placeholder="MM/AA"
                  maxLength={5}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="cvc">CVV</Label>
                <Input
                  id="cvc"
                  value={cardData.cvc}
                  onChange={(e) => handleInputChange('cvc', e.target.value)}
                  placeholder="123"
                  maxLength={4}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo do Pedido */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Teste de QI + Certificado</span>
              <span className="font-semibold">R$ 5,00</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span className="text-green-600">R$ 5,00</span>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Pagamento */}
        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-lg"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processando...
            </div>
          ) : (
            <div className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Pagar R$ 5,00
            </div>
          )}
        </Button>

        {/* Segurança */}
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Lock className="h-4 w-4 mr-1" />
            Pagamento 100% seguro e criptografado
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Seus dados são protegidos por criptografia SSL
          </p>
        </div>
      </div>
    </div>
  )
}