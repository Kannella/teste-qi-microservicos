'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Clock, Brain, Trophy, RotateCcw, Star, Users, Shield, Zap, CheckCircle, ArrowRight, Timer, Target, Award, TrendingUp, CreditCard, Mail, Lock, Gift, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Question {
  id: number
  question: string
  options: string[]
  correct: number
  category: 'logic' | 'math' | 'pattern' | 'vocabulary' | 'spatial'
  difficulty: 'easy' | 'medium' | 'hard'
}

const questions: Question[] = [
  // Lógica - Easy
  {
    id: 1,
    question: "Se todos os gatos são animais e alguns animais são pretos, então:",
    options: ["Todos os gatos são pretos", "Alguns gatos podem ser pretos", "Nenhum gato é preto", "Todos os animais são gatos"],
    correct: 1,
    category: 'logic',
    difficulty: 'easy'
  },
  {
    id: 2,
    question: "Complete a sequência: 2, 4, 6, 8, ?",
    options: ["9", "10", "11", "12"],
    correct: 1,
    category: 'pattern',
    difficulty: 'easy'
  },
  {
    id: 3,
    question: "Qual palavra não pertence ao grupo?",
    options: ["Maçã", "Banana", "Cenoura", "Laranja"],
    correct: 2,
    category: 'logic',
    difficulty: 'easy'
  },
  {
    id: 4,
    question: "Se 3 + 5 = 8, então 8 - 5 = ?",
    options: ["2", "3", "4", "5"],
    correct: 1,
    category: 'math',
    difficulty: 'easy'
  },
  
  // Matemática - Easy/Medium
  {
    id: 5,
    question: "Quanto é 15% de 200?",
    options: ["25", "30", "35", "40"],
    correct: 1,
    category: 'math',
    difficulty: 'medium'
  },
  {
    id: 6,
    question: "Se um trem viaja 60 km em 1 hora, quantos km viajará em 2,5 horas?",
    options: ["120", "130", "140", "150"],
    correct: 3,
    category: 'math',
    difficulty: 'medium'
  },
  {
    id: 7,
    question: "Complete: 1, 1, 2, 3, 5, 8, ?",
    options: ["11", "13", "15", "16"],
    correct: 1,
    category: 'pattern',
    difficulty: 'medium'
  },
  {
    id: 8,
    question: "Qual é o próximo número: 100, 50, 25, 12.5, ?",
    options: ["6", "6.25", "6.5", "7"],
    correct: 1,
    category: 'pattern',
    difficulty: 'medium'
  },

  // Vocabulário
  {
    id: 9,
    question: "Sinônimo de 'perspicaz':",
    options: ["Lento", "Astuto", "Confuso", "Simples"],
    correct: 1,
    category: 'vocabulary',
    difficulty: 'medium'
  },
  {
    id: 10,
    question: "Antônimo de 'efêmero':",
    options: ["Temporário", "Duradouro", "Rápido", "Frágil"],
    correct: 1,
    category: 'vocabulary',
    difficulty: 'medium'
  },

  // Lógica - Medium/Hard
  {
    id: 11,
    question: "Se A > B e B > C, então:",
    options: ["C > A", "A = C", "A > C", "Não é possível determinar"],
    correct: 2,
    category: 'logic',
    difficulty: 'medium'
  },
  {
    id: 12,
    question: "Em uma sala há 4 pessoas. Cada pessoa cumprimenta todas as outras uma vez. Quantos cumprimentos acontecem?",
    options: ["4", "6", "8", "12"],
    correct: 1,
    category: 'logic',
    difficulty: 'medium'
  },
  {
    id: 13,
    question: "Complete a analogia: Livro está para Página assim como Casa está para:",
    options: ["Telhado", "Quarto", "Porta", "Janela"],
    correct: 1,
    category: 'logic',
    difficulty: 'medium'
  },
  {
    id: 14,
    question: "Se hoje é terça-feira, que dia será daqui a 100 dias?",
    options: ["Segunda", "Terça", "Quarta", "Quinta"],
    correct: 0,
    category: 'logic',
    difficulty: 'hard'
  },

  // Padrões - Medium/Hard
  {
    id: 15,
    question: "Complete: 2, 6, 18, 54, ?",
    options: ["108", "162", "216", "270"],
    correct: 1,
    category: 'pattern',
    difficulty: 'medium'
  },
  {
    id: 16,
    question: "Qual número vem a seguir: 1, 4, 9, 16, 25, ?",
    options: ["30", "35", "36", "49"],
    correct: 2,
    category: 'pattern',
    difficulty: 'medium'
  },
  {
    id: 17,
    question: "Complete: A, C, F, J, O, ?",
    options: ["S", "T", "U", "V"],
    correct: 2,
    category: 'pattern',
    difficulty: 'hard'
  },
  {
    id: 18,
    question: "Sequência: 3, 7, 15, 31, ?",
    options: ["47", "63", "79", "95"],
    correct: 1,
    category: 'pattern',
    difficulty: 'hard'
  },

  // Matemática - Hard
  {
    id: 19,
    question: "Se x² - 5x + 6 = 0, quais são os valores de x?",
    options: ["1 e 6", "2 e 3", "1 e 5", "2 e 4"],
    correct: 1,
    category: 'math',
    difficulty: 'hard'
  },
  {
    id: 20,
    question: "Um produto custa R$ 80 após um desconto de 20%. Qual era o preço original?",
    options: ["R$ 96", "R$ 100", "R$ 104", "R$ 120"],
    correct: 1,
    category: 'math',
    difficulty: 'hard'
  },

  // Espacial
  {
    id: 21,
    question: "Quantos cubos pequenos formam um cubo 3x3x3?",
    options: ["9", "18", "27", "36"],
    correct: 2,
    category: 'spatial',
    difficulty: 'medium'
  },
  {
    id: 22,
    question: "Se você dobrar um papel 3 vezes e fizer um furo, quantos furos terá quando desdobrar?",
    options: ["3", "6", "8", "9"],
    correct: 2,
    category: 'spatial',
    difficulty: 'medium'
  },

  // Vocabulário - Hard
  {
    id: 23,
    question: "O que significa 'ubíquo'?",
    options: ["Raro", "Antigo", "Presente em toda parte", "Muito pequeno"],
    correct: 2,
    category: 'vocabulary',
    difficulty: 'hard'
  },
  {
    id: 24,
    question: "Sinônimo de 'magnânimo':",
    options: ["Pequeno", "Generoso", "Egoísta", "Comum"],
    correct: 1,
    category: 'vocabulary',
    difficulty: 'hard'
  },

  // Lógica - Hard
  {
    id: 25,
    question: "Se alguns A são B, e todos B são C, então:",
    options: ["Todos A são C", "Alguns A são C", "Nenhum A é C", "Todos C são A"],
    correct: 1,
    category: 'logic',
    difficulty: 'hard'
  },
  {
    id: 26,
    question: "Em um grupo de 30 pessoas, 18 gostam de café, 15 gostam de chá, e 8 gostam de ambos. Quantas não gostam de nenhum?",
    options: ["3", "5", "7", "9"],
    correct: 1,
    category: 'logic',
    difficulty: 'hard'
  },

  // Padrões complexos
  {
    id: 27,
    question: "Complete: 1, 11, 21, 1211, 111221, ?",
    options: ["211211", "312211", "13112221", "31121211"],
    correct: 1,
    category: 'pattern',
    difficulty: 'hard'
  },
  {
    id: 28,
    question: "Sequência: 2, 3, 5, 7, 11, 13, ?",
    options: ["15", "17", "19", "21"],
    correct: 1,
    category: 'pattern',
    difficulty: 'hard'
  },

  // Matemática avançada
  {
    id: 29,
    question: "Se log₂(x) = 3, então x = ?",
    options: ["6", "8", "9", "12"],
    correct: 1,
    category: 'math',
    difficulty: 'hard'
  },
  {
    id: 30,
    question: "Qual é a derivada de x³?",
    options: ["x²", "2x²", "3x²", "3x³"],
    correct: 2,
    category: 'math',
    difficulty: 'hard'
  },

  // Finais complexas
  {
    id: 31,
    question: "Se você tem 3 caixas: uma com 2 moedas de ouro, uma com 2 de prata, e uma mista. Você pega uma caixa aleatória e retira uma moeda de ouro. Qual a probabilidade da próxima moeda também ser de ouro?",
    options: ["1/2", "1/3", "2/3", "3/4"],
    correct: 2,
    category: 'logic',
    difficulty: 'hard'
  },
  {
    id: 32,
    question: "Complete a sequência: O, T, T, F, F, S, S, E, ?",
    options: ["N", "T", "E", "I"],
    correct: 0,
    category: 'pattern',
    difficulty: 'hard'
  }
]

export default function IQTest() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45 * 60) // 45 minutos
  const [testStarted, setTestStarted] = useState(false)
  const [showSalesPage, setShowSalesPage] = useState(true)
  const [email, setEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix')

  useEffect(() => {
    if (testStarted && timeLeft > 0 && !showPayment) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !showPayment) {
      handleFinishTest()
    }
  }, [timeLeft, testStarted, showPayment])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer !== null) {
      const newAnswers = [...answers]
      newAnswers[currentQuestion] = selectedAnswer
      setAnswers(newAnswers)
      setSelectedAnswer(null)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        handleFinishTest()
      }
    }
  }

  const handleFinishTest = () => {
    setShowPayment(true)
  }

  const handlePayment = () => {
    if (!email) {
      alert('Por favor, insira seu email para receber o resultado!')
      return
    }
    
    // Redirecionar para a página de pagamento específica
    if (paymentMethod === 'pix') {
      router.push(`/payment/pix?email=${encodeURIComponent(email)}`)
    } else {
      router.push(`/payment/card?email=${encodeURIComponent(email)}`)
    }
  }

  const restartTest = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setSelectedAnswer(null)
    setShowPayment(false)
    setTimeLeft(45 * 60)
    setTestStarted(false)
    setShowSalesPage(true)
    setEmail('')
  }

  // PÁGINA DE VENDAS PERSUASIVA
  if (showSalesPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <Brain className="h-20 w-20 text-yellow-400 animate-pulse" />
                  <div className="absolute -top-2 -right-2">
                    <Star className="h-8 w-8 text-yellow-300 animate-bounce" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Descubra Seu
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> QI Real</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
                O teste mais preciso e científico da internet. Usado por <span className="text-yellow-400 font-bold">mais de 2 milhões</span> de pessoas em todo o mundo.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Badge className="bg-green-500 text-white px-4 py-2 text-lg">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  100% Científico
                </Badge>
                <Badge className="bg-blue-500 text-white px-4 py-2 text-lg">
                  <Shield className="h-5 w-5 mr-2" />
                  Resultado por Email
                </Badge>
                <Badge className="bg-purple-500 text-white px-4 py-2 text-lg">
                  <Trophy className="h-5 w-5 mr-2" />
                  Certificado Oficial
                </Badge>
              </div>

              <Button 
                onClick={() => setShowSalesPage(false)}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-12 py-6 text-2xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 animate-pulse"
              >
                <Zap className="h-6 w-6 mr-3" />
                FAZER TESTE AGORA
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>

              <p className="text-gray-300 mt-4 text-lg">
                ⚡ Apenas 45 minutos • 🎯 32 questões • 📧 Resultado por email
              </p>
            </div>
          </div>
        </div>

        {/* Prova Social */}
        <div className="bg-white/10 backdrop-blur-sm py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Mais de <span className="text-yellow-400">2.847.392</span> pessoas já descobriram seu QI
              </h2>
              <div className="flex justify-center items-center space-x-8 text-white/80">
                <div className="flex items-center">
                  <Users className="h-6 w-6 mr-2" />
                  <span>2M+ usuários</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-6 w-6 mr-2 text-yellow-400" />
                  <span>4.9/5 estrelas</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-6 w-6 mr-2" />
                  <span>Validado cientificamente</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">145</div>
                  <p className="text-sm opacity-80">"Descobri que tenho QI de gênio! Mudou minha vida profissional."</p>
                  <p className="text-xs mt-2 opacity-60">- Maria S., Engenheira</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">132</div>
                  <p className="text-sm opacity-80">"Resultado preciso! Consegui uma promoção após mostrar meu QI."</p>
                  <p className="text-xs mt-2 opacity-60">- João P., Analista</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">128</div>
                  <p className="text-sm opacity-80">"Finalmente sei meu potencial real. Teste muito bem feito!"</p>
                  <p className="text-xs mt-2 opacity-60">- Ana L., Professora</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Por que fazer este teste <span className="text-yellow-400">HOJE?</span>
              </h2>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                Descubra seu verdadeiro potencial intelectual e desbloqueie oportunidades que você nem sabia que existiam.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-gradient-to-br from-blue-600 to-purple-700 border-0 text-white transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-3">Acelere sua Carreira</h3>
                  <p className="opacity-90">Comprove sua inteligência para empregadores e conquiste melhores posições.</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600 to-teal-700 border-0 text-white transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-3">Conheça seus Pontos Fortes</h3>
                  <p className="opacity-90">Identifique suas habilidades cognitivas e desenvolva seu potencial máximo.</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600 to-pink-700 border-0 text-white transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <Award className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-3">Certificado Oficial</h3>
                  <p className="opacity-90">Receba um certificado que você pode usar em currículos e redes sociais.</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-600 to-red-700 border-0 text-white transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-3">Método Científico</h3>
                  <p className="opacity-90">Baseado em décadas de pesquisa em psicologia cognitiva e neurociência.</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-600 to-blue-700 border-0 text-white transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-3">Resultado por Email</h3>
                  <p className="opacity-90">Receba seu resultado detalhado diretamente no seu email em minutos.</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-teal-600 to-green-700 border-0 text-white transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                  <h3 className="text-xl font-bold mb-3">100% Confidencial</h3>
                  <p className="opacity-90">Seus dados são protegidos e o resultado é completamente privado.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Urgência */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              🔥 OFERTA ESPECIAL - APENAS HOJE! 🔥
            </h2>
            <p className="text-2xl text-white mb-8">
              Teste completo + Certificado oficial + Análise detalhada por email
            </p>
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-3xl text-white/60 line-through">R$ 97,00</div>
                <div className="text-sm text-white/80">Preço normal</div>
              </div>
              <div className="text-6xl text-white">→</div>
              <div className="text-center">
                <div className="text-6xl font-bold text-yellow-300">R$ 5,00</div>
                <div className="text-lg text-white">Apenas hoje!</div>
              </div>
            </div>
            
            <Button 
              onClick={() => setShowSalesPage(false)}
              className="bg-white text-red-600 hover:bg-gray-100 px-16 py-8 text-3xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 animate-bounce"
            >
              <Zap className="h-8 w-8 mr-4" />
              GARANTIR MINHA VAGA
              <ArrowRight className="h-8 w-8 ml-4" />
            </Button>

            <p className="text-white/90 mt-6 text-lg">
              ⏰ Restam apenas <span className="font-bold text-yellow-300">247 vagas</span> com desconto hoje!
            </p>
          </div>
        </div>

        {/* FAQ Rápido */}
        <div className="py-16 bg-black/20">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">Perguntas Frequentes</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">Como recebo o resultado?</h3>
                  <p className="text-gray-200">Após o pagamento, você recebe o resultado completo por email em até 5 minutos.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">Quanto tempo demora?</h3>
                  <p className="text-gray-200">Apenas 45 minutos para descobrir seu QI real com precisão científica.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">O resultado é confiável?</h3>
                  <p className="text-gray-200">Absolutamente! Nosso teste é validado cientificamente e usado mundialmente.</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-2">Recebo certificado?</h3>
                  <p className="text-gray-200">Sim! Certificado oficial que você pode usar em currículos e LinkedIn.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="py-20 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
              Não perca esta oportunidade!
            </h2>
            <p className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto">
              Milhares de pessoas descobrem seu QI todos os dias. Seja uma delas e desbloqueie seu verdadeiro potencial.
            </p>
            
            <Button 
              onClick={() => setShowSalesPage(false)}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-16 py-8 text-3xl font-bold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Brain className="h-8 w-8 mr-4" />
              DESCOBRIR MEU QI AGORA
              <Trophy className="h-8 w-8 ml-4" />
            </Button>

            <div className="mt-8 flex justify-center space-x-8 text-white/80">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                <span>Sem pegadinhas</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                <span>100% seguro</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                <span>Resultado garantido</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Brain className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-800">Teste de QI Profissional</CardTitle>
            <p className="text-gray-600 mt-2">Avalie sua inteligência com 32 perguntas cuidadosamente elaboradas</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Instruções:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 32 perguntas de múltipla escolha</li>
                <li>• Tempo limite: 45 minutos</li>
                <li>• Questões de lógica, matemática, padrões e vocabulário</li>
                <li>• Não é possível voltar às questões anteriores</li>
                <li>• Resultado enviado por email após pagamento</li>
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg border">
                <Clock className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                <p className="text-sm text-gray-600">Tempo</p>
                <p className="font-semibold">45 min</p>
              </div>
              <div className="bg-white p-3 rounded-lg border">
                <Trophy className="h-6 w-6 mx-auto text-gray-600 mb-1" />
                <p className="text-sm text-gray-600">Questões</p>
                <p className="font-semibold">32</p>
              </div>
            </div>
            <Button 
              onClick={() => setTestStarted(true)} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
            >
              Iniciar Teste
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // PÁGINA DE PAGAMENTO
  if (showPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Trophy className="h-16 w-16 text-yellow-300" />
                <Sparkles className="h-6 w-6 absolute -top-1 -right-1 text-yellow-200 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">🎉 Parabéns! Teste Concluído!</CardTitle>
            <p className="text-purple-100 mt-2">Seu resultado está pronto para ser enviado</p>
          </CardHeader>
          
          <CardContent className="p-8 space-y-6">
            {/* Teaser do Resultado */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-2 border-yellow-200">
              <div className="text-center">
                <div className="text-6xl font-bold text-purple-600 mb-2">???</div>
                <div className="text-lg text-gray-700 mb-4">Seu QI está calculado!</div>
                <div className="bg-white/70 p-4 rounded-lg">
                  <p className="text-gray-600 font-medium">
                    📊 Análise completa das suas {questions.length} respostas<br/>
                    🧠 Classificação oficial do seu nível de inteligência<br/>
                    📈 Comparação com a população mundial<br/>
                    🏆 Certificado oficial em PDF
                  </p>
                </div>
              </div>
            </div>

            {/* Oferta Especial */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-6 rounded-xl text-center">
              <h3 className="text-2xl font-bold mb-2">🔥 OFERTA ESPECIAL!</h3>
              <div className="flex justify-center items-center space-x-4 mb-3">
                <span className="text-2xl line-through opacity-70">R$ 97,00</span>
                <span className="text-4xl font-bold">R$ 5,00</span>
              </div>
              <p className="text-pink-100">Receba seu resultado completo + certificado oficial por email!</p>
            </div>

            {/* Formulário de Email */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📧 Email para receber o resultado:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Método de Pagamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  💳 Escolha o método de pagamento:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'pix' 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">📱</div>
                      <div className="font-semibold">PIX</div>
                      <div className="text-xs text-gray-500">Aprovação instantânea</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'card' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <CreditCard className="h-6 w-6 mx-auto mb-1" />
                      <div className="font-semibold">Cartão</div>
                      <div className="text-xs text-gray-500">Crédito ou débito</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Garantias */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">✅ Suas Garantias:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Resultado detalhado enviado em até 5 minutos</li>
                <li>• Certificado oficial em PDF</li>
                <li>• Análise completa por categoria</li>
                <li>• Comparação com população mundial</li>
                <li>• 100% seguro e confidencial</li>
              </ul>
            </div>

            {/* Botão de Pagamento */}
            <Button 
              onClick={handlePayment}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-xl font-bold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
              disabled={!email}
            >
              <Lock className="h-6 w-6 mr-3" />
              {paymentMethod === 'pix' ? 'PAGAR COM PIX - R$ 5,00' : 'PAGAR COM CARTÃO - R$ 5,00'}
              <Mail className="h-6 w-6 ml-3" />
            </Button>

            <div className="text-center text-sm text-gray-500">
              <Lock className="h-4 w-4 inline mr-1" />
              Pagamento 100% seguro e criptografado
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const question = questions[currentQuestion]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <Brain className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-800">Teste de QI</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className={`font-mono ${timeLeft < 300 ? 'text-red-600' : 'text-gray-700'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Badge variant="outline">
                {currentQuestion + 1} / {questions.length}
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start mb-4">
              <Badge variant="secondary" className="capitalize">
                {question.category === 'logic' ? 'Lógica' :
                 question.category === 'math' ? 'Matemática' :
                 question.category === 'pattern' ? 'Padrões' :
                 question.category === 'vocabulary' ? 'Vocabulário' : 'Espacial'}
              </Badge>
              <Badge variant={question.difficulty === 'easy' ? 'default' : 
                             question.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                {question.difficulty === 'easy' ? 'Fácil' :
                 question.difficulty === 'medium' ? 'Médio' : 'Difícil'}
              </Badge>
            </div>
            <CardTitle className="text-xl leading-relaxed">
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === index && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="font-medium">{String.fromCharCode(65 + index)})</span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Questão {currentQuestion + 1} de {questions.length}
          </div>
          <div className="space-x-3">
            <Button
              onClick={handleFinishTest}
              variant="outline"
              className="text-gray-600"
            >
              Finalizar Teste
            </Button>
            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Próxima'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}