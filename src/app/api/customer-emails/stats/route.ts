import { NextRequest, NextResponse } from 'next/server'
import { CustomerEmailsDB } from '@/lib/customer-emails-db'

// GET - Buscar estatísticas dos emails
export async function GET() {
  try {
    const stats = await CustomerEmailsDB.getStats()
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}