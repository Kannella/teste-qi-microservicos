import { NextRequest, NextResponse } from 'next/server'

interface TestResult {
  iq: number
  classification: string
  correct: number
  total: number
  percentage: number
  categories: {
    logic: number
    math: number
    pattern: number
    vocabulary: number
    spatial: number
  }
}

// Simular cálculo do QI baseado nas respostas
function calculateIQ(answers: number[], questions: any[]): TestResult {
  let correct = 0
  const categories = {
    logic: { correct: 0, total: 0 },
    math: { correct: 0, total: 0 },
    pattern: { correct: 0, total: 0 },
    vocabulary: { correct: 0, total: 0 },
    spatial: { correct: 0, total: 0 }
  }

  // Calcular acertos por categoria
  answers.forEach((answer, index) => {
    const question = questions[index]
    if (question) {
      categories[question.category].total++
      if (answer === question.correct) {
        correct++
        categories[question.category].correct++
      }
    }
  })

  const percentage = (correct / questions.length) * 100

  // Fórmula simplificada para calcular QI
  // QI médio = 100, desvio padrão = 15
  let iq = 100 + ((percentage - 50) * 0.6)
  
  // Ajustar baseado na dificuldade das questões acertadas
  const difficultyBonus = answers.reduce((bonus, answer, index) => {
    const question = questions[index]
    if (question && answer === question.correct) {
      switch (question.difficulty) {
        case 'easy': return bonus + 0
        case 'medium': return bonus + 2
        case 'hard': return bonus + 5
        default: return bonus
      }
    }
    return bonus
  }, 0)

  iq += difficultyBonus / 4
  iq = Math.round(Math.max(70, Math.min(160, iq))) // Limitar entre 70-160

  // Classificação do QI
  let classification = ''
  if (iq >= 140) classification = 'Gênio'
  else if (iq >= 130) classification = 'Muito Superior'
  else if (iq >= 120) classification = 'Superior'
  else if (iq >= 110) classification = 'Acima da Média'
  else if (iq >= 90) classification = 'Média'
  else if (iq >= 80) classification = 'Abaixo da Média'
  else classification = 'Limítrofe'

  return {
    iq,
    classification,
    correct,
    total: questions.length,
    percentage: Math.round(percentage),
    categories: {
      logic: Math.round((categories.logic.correct / categories.logic.total) * 100) || 0,
      math: Math.round((categories.math.correct / categories.math.total) * 100) || 0,
      pattern: Math.round((categories.pattern.correct / categories.pattern.total) * 100) || 0,
      vocabulary: Math.round((categories.vocabulary.correct / categories.vocabulary.total) * 100) || 0,
      spatial: Math.round((categories.spatial.correct / categories.spatial.total) * 100) || 0
    }
  }
}

// Simular envio de email
async function sendResultEmail(email: string, result: TestResult) {
  // Em produção, você usaria um serviço como SendGrid, Nodemailer, etc.
  console.log(`Enviando resultado para ${email}:`, result)
  
  // Simular delay do envio
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return {
    success: true,
    message: 'Email enviado com sucesso'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, answers, paymentId } = await request.json()

    if (!email || !answers || !paymentId) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    // Simular questões (em produção, viria do banco de dados)
    const questions = Array.from({ length: 32 }, (_, i) => ({
      id: i + 1,
      correct: Math.floor(Math.random() * 4),
      category: ['logic', 'math', 'pattern', 'vocabulary', 'spatial'][Math.floor(Math.random() * 5)],
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
    }))

    // Calcular resultado
    const result = calculateIQ(answers, questions)

    // Enviar email
    const emailResult = await sendResultEmail(email, result)

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        result,
        message: 'Resultado enviado por email com sucesso'
      })
    } else {
      return NextResponse.json(
        { error: 'Erro ao enviar email' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Erro ao enviar resultado:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}