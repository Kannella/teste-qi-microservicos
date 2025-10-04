import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Listar todos os emails de compradores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    
    let query = supabase
      .from('customer_emails')
      .select('*', { count: 'exact' })
      .order('purchase_date', { ascending: false })

    // Filtro de busca por email
    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('Erro ao buscar emails:', error)
      return NextResponse.json({ error: 'Erro ao buscar emails' }, { status: 500 })
    }

    return NextResponse.json({
      emails: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// POST - Adicionar novo email de comprador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, payment_method, amount, status = 'completed' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('customer_emails')
      .insert([{
        email,
        payment_method,
        amount,
        status,
        purchase_date: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('Erro ao inserir email:', error)
      return NextResponse.json({ error: 'Erro ao salvar email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}