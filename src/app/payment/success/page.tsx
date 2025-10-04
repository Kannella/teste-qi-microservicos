'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Mail, Award, RotateCcw, Share2, Download } from 'lucide-react'

export default function PaymentSuccess() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const email = searchParams.get('email') || ''
  const method = searchParams.get('method') || 'pix'
  
  const paymentMethod = method === 'card' ? 'Cartão de Crédito' : 'PIX'

  // Simular dados do resultado (em produção, viria da API)
  const mockResult = {
    iq: 127,
    classification: 'Superior',
    correct: 24,
    total: 32,
    percentage: 75
  }

  const handleNewTest = () => {
    router.push('/')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Teste de QI Profissional',
          text: `Acabei de descobrir meu QI: ${mockResult.iq} pontos! Faça você também:`,
          url: window.location.origin
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
      }
    } else {
      // Fallback para navegadores que não suportam Web Share API
      const text = `Acabei de descobrir meu QI: ${mockResult.iq} pontos! Faça você também: ${window.location.origin}`
      navigator.clipboard.writeText(text)
      alert('Link copiado para a área de transferência!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header de Sucesso */}
        <Card className="mb-6 bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-20 w-20" />
            </div>
            <CardTitle className="text-3xl font-bold">🎉 Pagamento Confirmado!</CardTitle>
            <p className="text-green-100 mt-2">Seu resultado foi enviado com sucesso!</p>
          </CardHeader>
        </Card>

        {/* Detalhes do Pagamento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="h-6 w-6 mr-2 text-green-600" />
              Detalhes do Envio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-semibold text-green-800">Email enviado com sucesso!</span>
              </div>
              <p className="text-green-700">
                Resultado completo enviado para: <br />
                <span className="font-semibold">{email}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600">Método de Pagamento</p>
                <p className="font-semibold">{paymentMethod}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-600">Valor Pago</p>
                <p className="font-semibold text-green-600">R$ 5,00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prévia do Resultado */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-6 w-6 mr-2 text-purple-600" />
              Seu Resultado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="text-6xl font-bold text-purple-600 mb-2">{mockResult.iq}</div>
              <div className="text-xl font-semibold text-gray-700 mb-2">{mockResult.classification}</div>
              <div className="text-gray-600">Inteligência acima da média</div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{mockResult.correct}</div>
                <div className="text-sm text-blue-700">Acertos</div>
              </div>
              <div className="text-center bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{mockResult.total}</div>
                <div className="text-sm text-green-700">Questões</div>
              </div>
              <div className="text-center bg-purple-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{mockResult.percentage}%</div>
                <div className="text-sm text-purple-700">Aproveitamento</div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">📧 O que você recebeu por email:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>✅ Resultado detalhado com seu QI: <strong>{mockResult.iq} pontos</strong></li>
                <li>✅ Classificação oficial: <strong>{mockResult.classification}</strong></li>
                <li>✅ Certificado oficial em PDF para download</li>
                <li>✅ Análise completa por categoria (lógica, matemática, etc.)</li>
                <li>✅ Comparação com a população mundial</li>
                <li>✅ Relatório completo de 15 páginas</li>
                <li>✅ Dicas para desenvolvimento cognitivo</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">📬 Não recebeu o email?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Verifique sua caixa de spam ou lixo eletrônico</li>
                <li>• O email pode levar até 5 minutos para chegar</li>
                <li>• Verifique se o endereço está correto: <strong>{email}</strong></li>
                <li>• Entre em contato conosco se não receber em 10 minutos</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="space-y-4">
          <Button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Compartilhar Resultado
          </Button>

          <Button
            onClick={handleNewTest}
            variant="outline"
            className="w-full py-3"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Fazer Novo Teste
          </Button>
        </div>

        {/* Rodapé */}
        <div className="text-center mt-8 text-gray-500">
          <p className="text-sm">
            Obrigado por usar nosso Teste de QI Profissional!
          </p>
          <p className="text-xs mt-2">
            Compartilhe com seus amigos e descubram juntos seus QIs!
          </p>
        </div>
      </div>
    </div>
  )
}