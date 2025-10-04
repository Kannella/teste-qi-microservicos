'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Search, Users, CreditCard, Smartphone, TrendingUp, Mail, Filter } from 'lucide-react'

interface Customer {
  id: string
  email: string
  full_name?: string
  phone?: string
  payment_method: 'card' | 'pix'
  payment_amount: number
  payment_status: string
  test_score?: number
  purchase_date: string
  last_email_sent?: string
  email_count: number
}

interface Stats {
  total_customers: number
  paid_customers: number
  card_payments: number
  pix_payments: number
  total_revenue: number
  avg_test_score: number
  tests_completed: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterMethod, setFilterMethod] = useState<string>('all')
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, filterMethod])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar clientes
      const customersResponse = await fetch('/api/customers')
      const customersData = await customersResponse.json()
      setCustomers(customersData)

      // Carregar estatísticas
      const statsResponse = await fetch('/api/customers?action=stats')
      const statsData = await statsResponse.json()
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por método de pagamento
    if (filterMethod !== 'all') {
      filtered = filtered.filter(customer => customer.payment_method === filterMethod)
    }

    setFilteredCustomers(filtered)
  }

  const exportToCSV = async () => {
    try {
      const response = await fetch('/api/customers?action=export')
      const csvContent = await response.text()
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'compradores.csv'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados dos compradores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciamento de Compradores
          </h1>
          <p className="text-gray-600">
            Visualize e gerencie todos os emails dos compradores do teste de QI
          </p>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Compradores</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_customers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.paid_customers} pagamentos confirmados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</div>
                <p className="text-xs text-muted-foreground">
                  Média de {formatCurrency(stats.total_revenue / stats.paid_customers || 0)} por compra
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagamentos Cartão</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.card_payments}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.card_payments / stats.total_customers) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagamentos PIX</CardTitle>
                <Smartphone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pix_payments}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.pix_payments / stats.total_customers) * 100).toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtros e Ações */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros e Ações</CardTitle>
            <CardDescription>
              Busque e filtre os compradores ou exporte os dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por email ou nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os métodos</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Compradores */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Compradores ({filteredCustomers.length})</CardTitle>
            <CardDescription>
              Todos os emails dos compradores do teste de QI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pontuação</TableHead>
                    <TableHead>Data da Compra</TableHead>
                    <TableHead>Emails Enviados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {customer.email}
                        </div>
                      </TableCell>
                      <TableCell>{customer.full_name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={customer.payment_method === 'card' ? 'default' : 'secondary'}>
                          {customer.payment_method === 'card' ? (
                            <>
                              <CreditCard className="h-3 w-3 mr-1" />
                              Cartão
                            </>
                          ) : (
                            <>
                              <Smartphone className="h-3 w-3 mr-1" />
                              PIX
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(customer.payment_amount)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={customer.payment_status === 'completed' ? 'default' : 'destructive'}
                        >
                          {customer.payment_status === 'completed' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.test_score ? (
                          <Badge variant="outline">{customer.test_score} QI</Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{formatDate(customer.purchase_date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{customer.email_count}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum comprador encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}