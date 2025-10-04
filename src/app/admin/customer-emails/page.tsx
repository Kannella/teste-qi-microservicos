'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Download, Mail, Calendar, DollarSign, Users } from 'lucide-react'

interface CustomerEmail {
  id: string
  email: string
  purchase_date: string
  payment_method?: string
  amount?: number
  status: string
  created_at: string
}

interface EmailsResponse {
  emails: CustomerEmail[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function CustomerEmailsPage() {
  const [emails, setEmails] = useState<CustomerEmail[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    totalRevenue: 0
  })

  const fetchEmails = async (searchTerm = '') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '100',
        search: searchTerm
      })
      
      const response = await fetch(`/api/customer-emails?${params}`)
      const data: EmailsResponse = await response.json()
      
      if (response.ok) {
        setEmails(data.emails)
        calculateStats(data.emails)
      }
    } catch (error) {
      console.error('Erro ao carregar emails:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (emailList: CustomerEmail[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayCount = emailList.filter(email => 
      new Date(email.purchase_date) >= today
    ).length

    const weekCount = emailList.filter(email => 
      new Date(email.purchase_date) >= weekAgo
    ).length

    const totalRevenue = emailList.reduce((sum, email) => 
      sum + (email.amount || 0), 0
    )

    setStats({
      total: emailList.length,
      today: todayCount,
      thisWeek: weekCount,
      totalRevenue
    })
  }

  const handleSearch = () => {
    fetchEmails(search)
  }

  const exportToCSV = () => {
    const headers = ['Email', 'Data da Compra', 'Método de Pagamento', 'Valor', 'Status']
    const csvContent = [
      headers.join(','),
      ...emails.map(email => [
        email.email,
        new Date(email.purchase_date).toLocaleDateString('pt-BR'),
        email.payment_method || '',
        email.amount || '',
        email.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `emails-compradores-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Emails de Compradores
          </h1>
          <p className="text-gray-600">
            Gerencie todos os emails dos clientes que compraram o produto
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Compradores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeek}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros e Ações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Buscar por email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Emails List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Emails</CardTitle>
            <CardDescription>
              {emails.length} email(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando emails...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum email encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-left py-3 px-4 font-medium">Data da Compra</th>
                      <th className="text-left py-3 px-4 font-medium">Método</th>
                      <th className="text-left py-3 px-4 font-medium">Valor</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((email) => (
                      <tr key={email.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            {email.email}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(email.purchase_date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          {email.payment_method || '-'}
                        </td>
                        <td className="py-3 px-4">
                          {email.amount ? formatCurrency(email.amount) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={getStatusColor(email.status)}>
                            {email.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}