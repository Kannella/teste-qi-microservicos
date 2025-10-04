'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, CheckCircle, Copy, RefreshCw, Clock, Smartphone, AlertCircle } from 'lucide-react'
import QRCode from 'qrcode'

interface PaymentData {
  pixCode: string
  qrCode?: string
  expiresAt: string
  paymentId: string
  isManual?: boolean
}

export default function PixPayment() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutos
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'approved' | 'expired' | 'failed'>('pending')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [testResult] = useState(() => {
    const stored = localStorage.getItem('testResult')
    return stored ? JSON.parse(stored) : null
  })

  // Inicializar pagamento PIX via Stripe
  useEffect(() => {
    if (email && testResult) {
      initializePixPayment()
    }
  }, [email, testResult])

  // Timer para expiração
  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === 'pending' && paymentData) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setPaymentStatus('expired')
    }
  }, [timeLeft, paymentStatus, paymentData])

  // Verificação automática de pagamento
  useEffect(() => {
    if (paymentStatus === 'pending' && paymentData?.paymentId) {
      const checkPayment = setInterval(async () => {
        try {
          const response = await fetch(`/api/payment/status?paymentId=${paymentData.paymentId}`)
          const result = await response.json()
          
          if (result.success && result.status === 'succeeded') {
            setPaymentStatus('approved')
            clearInterval(checkPayment)
            
            // Redirecionar para sucesso após 2 segundos
            setTimeout(() => {
              router.push(`/payment/success?email=${encodeURIComponent(email)}&method=pix`)
            }, 2000)
          }
        } catch (error) {
          console.error('Erro ao verificar pagamento:', error)
        }
      }, 5000) // Verificar a cada 5 segundos

      return () => clearInterval(checkPayment)
    }
  }, [paymentStatus, paymentData, email, router])

  const initializePixPayment = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/payment/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          testResult,
          fullName: searchParams.get('fullName') || '',
          phone: searchParams.get('phone') || ''
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPaymentData({
          pixCode: result.pixCode,
          qrCode: result.qrCode,
          expiresAt: result.expiresAt,
          paymentId: result.paymentId,
          isManual: result.isManual
        })

        // Gerar QR Code se não veio do Stripe
        if (!result.qrCode) {
          const qrUrl = await QRCode.toDataURL(result.pixCode, {
            width: 300,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          })
          setQrCodeUrl(qrUrl)
        } else {
          setQrCodeUrl(result.qrCode)
        }

        // Calcular tempo restante
        const expiresAt = new Date(result.expiresAt)
        const now = new Date()
        const timeRemaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
        setTimeLeft(timeRemaining)
      } else {
        console.error('Erro ao criar pagamento PIX:', result.error)
        setPaymentStatus('failed')
      }
    } catch (error) {
      console.error('Erro ao inicializar pagamento PIX:', error)
      setPaymentStatus('failed')
    } finally {
      setLoading(false)
    }
  }

  const copyPixCode = async () => {
    if (!paymentData?.pixCode) return
    
    try {
      await navigator.clipboard.writeText(paymentData.pixCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleManualCheck = async () => {
    if (!paymentData?.paymentId) return
    
    setPaymentStatus('checking')
    
    try {
      const response = await fetch(`/api/payment/status?paymentId=${paymentData.paymentId}`)
      const result = await response.json()
      
      if (result.success && result.status === 'succeeded') {
        setPaymentStatus('approved')
        setTimeout(() => {
          router.push(`/payment/success?email=${encodeURIComponent(email)}&method=pix`)
        }, 2000)
      } else {
        setPaymentStatus('pending')
      }
    } catch (error) {
      console.error('Erro na verificação manual:', error)
      setPaymentStatus('pending')
    }
  }

  if (paymentStatus === 'approved') {
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

  if (paymentStatus === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Clock className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">PIX Expirado</h2>
            <p className="text-red-600 mb-6">O tempo limite para pagamento foi atingido.</p>
            <Button
              onClick={initializePixPayment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Gerar Novo PIX
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Erro no Pagamento</h2>
            <p className="text-red-600 mb-6">Ocorreu um erro ao processar o pagamento.</p>
            <Button
              onClick={initializePixPayment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
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
          <h1 className="text-2xl font-bold text-gray-800">Pagamento PIX</h1>
        </div>

        {/* Timer */}
        {paymentData && (
          <Card className="mb-6 bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm opacity-90">Tempo restante para pagamento</p>
              <p className="text-2xl font-bold">{formatTime(timeLeft)}</p>
            </CardContent>
          </Card>
        )}

        {/* Email */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <Label htmlFor="email">Email para receber o resultado</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-1"
              disabled={!!paymentData}
            />
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-center">
              <Smartphone className="h-6 w-6 mr-2" />
              {paymentData?.isManual ? 'PIX Manual' : 'PIX via Stripe'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Gerando PIX via Stripe...</p>
              </div>
            ) : paymentData ? (
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <img src={qrCodeUrl} alt="QR Code PIX" className="w-64 h-64" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Abra o app do seu banco e escaneie o código
                </p>
                
                {/* Instruções */}
                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <h4 className="font-semibold text-blue-800 mb-2">Como pagar:</h4>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Abra o app do seu banco</li>
                    <li>2. Escolha a opção PIX</li>
                    <li>3. Escaneie o QR Code acima</li>
                    <li>4. Confirme o pagamento de R$ 5,00</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">Configure seu email para gerar o PIX</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Código PIX */}
        {paymentData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Ou copie o código PIX</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-gray-50 p-3 rounded-lg mb-3">
                <p className="text-xs text-gray-600 font-mono break-all">
                  {paymentData.pixCode}
                </p>
              </div>
              <Button
                onClick={copyPixCode}
                variant="outline"
                className="w-full"
                disabled={copied}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copiado!' : 'Copiar Código PIX'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Resumo */}
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

        {/* Verificação Manual */}
        {paymentData && (
          <Button
            onClick={handleManualCheck}
            disabled={paymentStatus === 'checking'}
            variant="outline"
            className="w-full mb-4"
          >
            {paymentStatus === 'checking' ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Verificando no Stripe...
              </div>
            ) : (
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 mr-2" />
                Já paguei - Verificar
              </div>
            )}
          </Button>
        )}

        {/* Status */}
        {paymentData && (
          <div className="text-center">
            <div className="flex items-center justify-center text-sm text-gray-500 mb-2">
              <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              {paymentData.isManual ? 'Aguardando confirmação manual...' : 'Monitorando pagamento via Stripe...'}
            </div>
            <p className="text-xs text-gray-400">
              O pagamento será detectado automaticamente
            </p>
          </div>
        )}

        {/* Botão para inicializar se não tiver dados */}
        {!paymentData && !loading && email && testResult && (
          <Button
            onClick={initializePixPayment}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Gerar PIX via Stripe
          </Button>
        )}
      </div>
    </div>
  )
}