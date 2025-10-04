import nodemailer from 'nodemailer'

interface EmailData {
  email: string
  fullName: string
  testScore: number
  paymentId: string
  paymentAmount: number
}

// Configurar transporter do nodemailer
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendTestResultEmail(data: EmailData) {
  try {
    const { email, fullName, testScore, paymentId, paymentAmount } = data

    // Determinar classificação do QI
    const classification = getIQClassification(testScore)
    const percentile = getPercentile(testScore)

    const htmlContent = generateEmailHTML({
      fullName,
      testScore,
      classification,
      percentile,
      paymentId,
      paymentAmount
    })

    const mailOptions = {
      from: {
        name: 'QI Test IA - Resultados Profissionais',
        address: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@qitestia.com'
      },
      to: email,
      subject: `🎉 Parabéns ${fullName}! Seu Resultado do Teste de QI Profissional`,
      html: htmlContent,
      attachments: [
        {
          filename: 'certificado-qi.pdf',
          content: await generateCertificatePDF(data),
          contentType: 'application/pdf'
        }
      ]
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Email enviado com sucesso:', result.messageId)
    
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    throw error
  }
}

function getIQClassification(score: number): string {
  if (score >= 140) return 'Genial'
  if (score >= 130) return 'Muito Superior'
  if (score >= 120) return 'Superior'
  if (score >= 110) return 'Acima da Média'
  if (score >= 90) return 'Média'
  if (score >= 80) return 'Abaixo da Média'
  if (score >= 70) return 'Limítrofe'
  return 'Muito Baixo'
}

function getPercentile(score: number): number {
  // Cálculo aproximado do percentil baseado na distribuição normal
  if (score >= 140) return 99.9
  if (score >= 130) return 98
  if (score >= 120) return 91
  if (score >= 110) return 75
  if (score >= 100) return 50
  if (score >= 90) return 25
  if (score >= 80) return 9
  if (score >= 70) return 2
  return 0.1
}

function generateEmailHTML(data: {
  fullName: string
  testScore: number
  classification: string
  percentile: number
  paymentId: string
  paymentAmount: number
}): string {
  const { fullName, testScore, classification, percentile, paymentId, paymentAmount } = data

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resultado do Teste de QI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 10px; font-weight: 700; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .congratulations { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
        .congratulations h2 { font-size: 24px; margin-bottom: 10px; }
        .congratulations p { font-size: 16px; opacity: 0.95; }
        .result-card { background: #f8f9fa; border-left: 5px solid #667eea; padding: 25px; margin: 25px 0; border-radius: 8px; }
        .score-display { text-align: center; margin: 30px 0; }
        .score-number { font-size: 48px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .score-classification { font-size: 20px; color: #28a745; font-weight: 600; margin-bottom: 5px; }
        .score-percentile { font-size: 14px; color: #6c757d; }
        .analysis { background: white; border: 1px solid #e9ecef; border-radius: 8px; padding: 25px; margin: 25px 0; }
        .analysis h3 { color: #495057; margin-bottom: 15px; font-size: 18px; }
        .analysis p { color: #6c757d; margin-bottom: 12px; }
        .certificate-info { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0; }
        .certificate-info h3 { color: #856404; margin-bottom: 10px; }
        .certificate-info p { color: #856404; }
        .footer { background: #343a40; color: white; padding: 30px; text-align: center; }
        .footer p { margin-bottom: 10px; opacity: 0.8; }
        .social-links { margin-top: 20px; }
        .social-links a { color: #667eea; text-decoration: none; margin: 0 10px; }
        .payment-info { background: #e8f5e8; border: 1px solid #c3e6c3; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 12px; color: #155724; }
        @media (max-width: 600px) {
            .container { margin: 0; }
            .header, .content, .footer { padding: 20px; }
            .score-number { font-size: 36px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 QI Test IA</h1>
            <p>Avaliação Profissional de Inteligência</p>
        </div>

        <div class="content">
            <div class="congratulations">
                <h2>🎉 Parabéns, ${fullName}!</h2>
                <p>Você concluiu com sucesso seu Teste de QI Profissional. Estamos orgulhosos de apresentar seus resultados!</p>
            </div>

            <div class="score-display">
                <div class="score-number">${testScore}</div>
                <div class="score-classification">${classification}</div>
                <div class="score-percentile">Você superou ${percentile}% da população</div>
            </div>

            <div class="result-card">
                <h3>📊 Análise Detalhada do Seu Resultado</h3>
                <p><strong>Pontuação Obtida:</strong> ${testScore} pontos</p>
                <p><strong>Classificação:</strong> ${classification}</p>
                <p><strong>Percentil:</strong> ${percentile}% (você superou ${percentile}% das pessoas)</p>
                <p><strong>Data da Avaliação:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>

            <div class="analysis">
                <h3>🎯 Interpretação Profissional</h3>
                <p>Seu resultado de <strong>${testScore} pontos</strong> indica um nível de inteligência <strong>${classification}</strong>, colocando você entre os <strong>${100 - percentile}%</strong> melhores resultados da população.</p>
                
                ${getDetailedAnalysis(testScore, classification)}
                
                <p>Este resultado reflete suas habilidades em raciocínio lógico, resolução de problemas, compreensão verbal e processamento de informações complexas.</p>
            </div>

            <div class="certificate-info">
                <h3>📜 Certificado Digital</h3>
                <p>Em anexo, você encontrará seu <strong>Certificado Digital Oficial</strong> com seus resultados. Este documento pode ser usado para fins profissionais, acadêmicos ou pessoais.</p>
            </div>

            <div class="analysis">
                <h3>💡 Recomendações Personalizadas</h3>
                ${getRecommendations(testScore)}
            </div>

            <div class="payment-info">
                <strong>Detalhes da Compra:</strong><br>
                Produto: Teste de QI Profissional + Certificado<br>
                Valor: R$ ${paymentAmount.toFixed(2)}<br>
                ID do Pagamento: ${paymentId}<br>
                Data: ${new Date().toLocaleDateString('pt-BR')}
            </div>
        </div>

        <div class="footer">
            <p><strong>QI Test IA - Avaliação Profissional de Inteligência</strong></p>
            <p>Obrigado por confiar em nossos serviços!</p>
            <p>Este resultado é confidencial e destinado exclusivamente a ${fullName}</p>
            
            <div class="social-links">
                <a href="mailto:contato@qitestia.com">📧 Suporte</a>
                <a href="#">🌐 Website</a>
                <a href="#">📱 WhatsApp</a>
            </div>
        </div>
    </div>
</body>
</html>
  `
}

function getDetailedAnalysis(score: number, classification: string): string {
  if (score >= 140) {
    return `
      <p>Você demonstra capacidades intelectuais excepcionais, típicas de indivíduos com potencial para contribuições significativas em áreas que exigem alta complexidade cognitiva.</p>
      <p>Suas habilidades incluem pensamento abstrato avançado, resolução criativa de problemas e capacidade superior de aprendizado.</p>
    `
  } else if (score >= 130) {
    return `
      <p>Você possui habilidades intelectuais muito superiores à média, demonstrando excelente capacidade de raciocínio e resolução de problemas complexos.</p>
      <p>Este nível de inteligência é frequentemente associado ao sucesso acadêmico e profissional em áreas que demandam alto nível cognitivo.</p>
    `
  } else if (score >= 120) {
    return `
      <p>Seu resultado indica habilidades intelectuais superiores, com excelente capacidade de compreensão e análise de informações complexas.</p>
      <p>Você demonstra facilidade para aprender novos conceitos e aplicá-los de forma eficiente em diferentes contextos.</p>
    `
  } else if (score >= 110) {
    return `
      <p>Você apresenta habilidades intelectuais acima da média, com boa capacidade de raciocínio lógico e resolução de problemas.</p>
      <p>Este resultado sugere potencial para bom desempenho em atividades que exigem pensamento analítico e compreensão conceitual.</p>
    `
  } else {
    return `
      <p>Seu resultado está dentro da faixa média de inteligência, indicando capacidades cognitivas adequadas para a maioria das atividades cotidianas e profissionais.</p>
      <p>Lembre-se de que a inteligência é multifacetada e pode ser desenvolvida através de prática e aprendizado contínuo.</p>
    `
  }
}

function getRecommendations(score: number): string {
  if (score >= 130) {
    return `
      <p>• Considere desafios intelectuais mais complexos em sua área de atuação</p>
      <p>• Explore oportunidades de liderança e mentoria</p>
      <p>• Busque projetos que exijam pensamento estratégico e inovação</p>
      <p>• Continue desenvolvendo suas habilidades através de aprendizado contínuo</p>
    `
  } else if (score >= 110) {
    return `
      <p>• Aproveite suas habilidades analíticas em projetos desafiadores</p>
      <p>• Considere especializações em sua área de interesse</p>
      <p>• Desenvolva habilidades de comunicação para maximizar seu potencial</p>
      <p>• Busque oportunidades de crescimento profissional</p>
    `
  } else {
    return `
      <p>• Foque no desenvolvimento contínuo de suas habilidades</p>
      <p>• Pratique exercícios de raciocínio lógico regularmente</p>
      <p>• Leia livros e materiais que desafiem seu intelecto</p>
      <p>• Considere cursos e treinamentos para expandir seus conhecimentos</p>
    `
  }
}

async function generateCertificatePDF(data: EmailData): Promise<Buffer> {
  // Aqui você implementaria a geração do PDF do certificado
  // Por enquanto, retornamos um buffer vazio como placeholder
  // Em produção, use bibliotecas como puppeteer, jsPDF ou PDFKit
  
  const certificateContent = `
CERTIFICADO DE TESTE DE QI PROFISSIONAL

Este certificado atesta que ${data.fullName}
completou com sucesso o Teste de QI Profissional
obtendo a pontuação de ${data.testScore} pontos.

Classificação: ${getIQClassification(data.testScore)}
Data: ${new Date().toLocaleDateString('pt-BR')}
ID: ${data.paymentId}

QI Test IA - Avaliação Profissional de Inteligência
  `
  
  // Retorna um buffer simples (em produção, gere um PDF real)
  return Buffer.from(certificateContent, 'utf-8')
}