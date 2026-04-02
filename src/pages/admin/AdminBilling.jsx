import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import { invoicesAPI } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/utils'
import { 
  Search, 
  Download, 
  Eye, 
  Send, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Printer,
  RefreshCw
} from 'lucide-react'

export default function AdminBilling() {
  const [invoices, setInvoices] = useState([])
  const [apiStats, setApiStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [backfilling, setBackfilling] = useState(false)
  const [backfillMsg, setBackfillMsg] = useState(null)
  const printRef = useRef(null)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    setIsLoading(true)
    try {
      const { data } = await invoicesAPI.getAll()
      setInvoices(data.invoices || [])
      setApiStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // ── Fix #7: Filter wired correctly ──
  const filteredInvoices = invoices.filter(invoice => {
    const guestName = `${invoice.guest?.firstName || ''} ${invoice.guest?.lastName || ''}`.toLowerCase()
    const matchesSearch = guestName.includes(searchTerm.toLowerCase()) ||
                         (invoice.invoiceNumber || invoice._id || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.payment?.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalRevenue: apiStats?.totalRevenue || 0,
    pendingAmount: apiStats?.totalPending || 0,
    paidInvoices: invoices.filter(inv => inv.payment?.status === 'paid').length,
    overdueInvoices: invoices.filter(inv => inv.payment?.status === 'overdue').length
  }

  const getStatusBadge = (status) => {
    const variants = {
      paid: 'success',
      pending: 'warning',
      partial: 'warning',
      overdue: 'danger',
      cancelled: 'secondary'
    }
    return <Badge variant={variants[status] || 'secondary'}>{status || 'pending'}</Badge>
  }

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice)
    setShowInvoiceModal(true)
  }

  // ── Fix #3: Generate Report → print-ready billing report ──
  const handleGenerateReport = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700')
    if (!printWindow) { window.print(); return }
    
    const rows = filteredInvoices.map(inv => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-family:monospace;font-size:13px;">${inv.invoiceNumber || (inv._id || '').slice(-8).toUpperCase()}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${inv.guest?.firstName || ''} ${inv.guest?.lastName || ''}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${inv.issuedDate ? new Date(inv.issuedDate).toLocaleDateString() : '—'}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">${formatCurrency(inv.summary?.total || 0)}</td>
        <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-transform:capitalize;">${inv.payment?.status || 'pending'}</td>
      </tr>
    `).join('')

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Billing Report</title>
      <style>
        body{font-family:'Segoe UI',Arial,sans-serif;padding:40px;color:#1f2937}
        h1{font-size:24px;margin-bottom:4px}
        .subtitle{color:#6b7280;margin-bottom:24px}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:32px}
        .stat-card{border:1px solid #e5e7eb;border-radius:8px;padding:16px;text-align:center}
        .stat-value{font-size:22px;font-weight:700}
        .stat-label{color:#6b7280;font-size:13px;margin-top:4px}
        table{width:100%;border-collapse:collapse}
        th{background:#f3f4f6;padding:10px 8px;text-align:left;font-size:12px;text-transform:uppercase;color:#6b7280;border-bottom:2px solid #d1d5db}
        @media print{body{padding:20px;font-size:12px}.stats{margin-bottom:16px}}
      </style></head><body>
      <h1>Grand Azure — Billing Report</h1>
      <p class="subtitle">Generated ${new Date().toLocaleString()} · ${filteredInvoices.length} invoices${statusFilter !== 'all' ? ` (${statusFilter})` : ''}</p>
      <div class="stats">
        <div class="stat-card"><div class="stat-value">${formatCurrency(stats.totalRevenue)}</div><div class="stat-label">Total Revenue</div></div>
        <div class="stat-card"><div class="stat-value">${formatCurrency(stats.pendingAmount)}</div><div class="stat-label">Pending</div></div>
        <div class="stat-card"><div class="stat-value">${stats.paidInvoices}</div><div class="stat-label">Paid Invoices</div></div>
        <div class="stat-card"><div class="stat-value">${stats.overdueInvoices}</div><div class="stat-label">Overdue</div></div>
      </div>
      <table><thead><tr><th>Invoice ID</th><th>Guest</th><th>Date</th><th style="text-align:right">Amount</th><th>Status</th></tr></thead>
      <tbody>${rows}</tbody></table>
      <script>window.onload=function(){window.print()}</script>
    </body></html>`)
    printWindow.document.close()
  }

  // ── Fix #4: Export as CSV ──
  const handleExportCSV = () => {
    const header = ['Invoice ID', 'Guest', 'Email', 'Date', 'Amount', 'Status']
    const csvRows = [
      header.join(','),
      ...filteredInvoices.map(inv => [
        inv.invoiceNumber || (inv._id || '').slice(-8).toUpperCase(),
        `"${inv.guest?.firstName || ''} ${inv.guest?.lastName || ''}"`,
        inv.guest?.email || '',
        inv.issuedDate ? new Date(inv.issuedDate).toLocaleDateString() : '',
        inv.summary?.total || 0,
        inv.payment?.status || 'pending'
      ].join(','))
    ]
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `billing-report-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  // ── Fix #4: Per-row print ──
  const handlePrintInvoice = (invoice) => {
    const printWindow = window.open('', '_blank', 'width=600,height=500')
    if (!printWindow) return
    
    const items = (invoice.items || []).map(item => `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #eee">${item.description}</td>
        <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:center">${item.quantity || 1}</td>
        <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.total || item.unitPrice || 0)}</td>
      </tr>
    `).join('')

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Invoice ${invoice.invoiceNumber || ''}</title>
      <style>body{font-family:'Segoe UI',Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto}h1{font-size:20px}table{width:100%;border-collapse:collapse;margin:16px 0}th{text-align:left;font-size:12px;color:#6b7280;border-bottom:2px solid #d1d5db;padding:8px 0}@media print{body{padding:20px}}</style>
    </head><body>
      <h1>Invoice ${invoice.invoiceNumber || (invoice._id || '').slice(-8).toUpperCase()}</h1>
      <p style="color:#6b7280">Date: ${invoice.issuedDate ? new Date(invoice.issuedDate).toLocaleDateString() : '—'}</p>
      <p><strong>Guest:</strong> ${invoice.guest?.firstName || ''} ${invoice.guest?.lastName || ''}</p>
      <p><strong>Email:</strong> ${invoice.guest?.email || '—'}</p>
      <hr/>
      <table><thead><tr><th>Description</th><th style="text-align:center">Qty</th><th style="text-align:right">Amount</th></tr></thead><tbody>${items}</tbody></table>
      <div style="text-align:right;margin-top:16px;font-size:18px;font-weight:700">Total: ${formatCurrency(invoice.summary?.total || 0)}</div>
      <p style="margin-top:8px;text-align:right;color:#6b7280">Status: ${(invoice.payment?.status || 'pending').toUpperCase()}</p>
      <script>window.onload=function(){window.print()}</script>
    </body></html>`)
    printWindow.document.close()
  }

  // ── Fix #2: Backfill invoices for existing bookings ──
  const handleBackfillInvoices = async () => {
    setBackfilling(true)
    setBackfillMsg(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/invoices/backfill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      const data = await res.json()
      setBackfillMsg(data.message || `Created ${data.created || 0} invoices`)
      await loadInvoices()
    } catch (err) {
      setBackfillMsg('Failed to backfill invoices')
    } finally {
      setBackfilling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing & Invoices</h1>
          <p className="text-muted-foreground">Manage invoices and track payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackfillInvoices} disabled={backfilling}>
            <RefreshCw className={`w-4 h-4 mr-2 ${backfilling ? 'animate-spin' : ''}`} />
            {backfilling ? 'Backfilling…' : 'Backfill Invoices'}
          </Button>
          <Button onClick={handleGenerateReport}>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {backfillMsg && (
        <div className="p-3 rounded-lg text-sm bg-green-50 text-green-800 border border-green-200">
          {backfillMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{formatCurrency(stats.pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid Invoices</p>
                <p className="text-xl font-bold">{stats.paidInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-danger/10 rounded-lg">
                <XCircle className="w-5 h-5 text-danger" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-xl font-bold">{stats.overdueInvoices}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters — Fix #7: single clean row, no duplicate boxes */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-40"
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'cancelled', label: 'Cancelled' }
              ]}
            />
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Invoice ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Guest</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-mono text-sm">{invoice.invoiceNumber || (invoice._id || '').slice(-8).toUpperCase()}</td>
                    <td className="py-3 px-4">{invoice.guest?.firstName} {invoice.guest?.lastName}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {formatDate(invoice.issuedDate)}
                    </td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(invoice.summary?.total || 0)}</td>
                    <td className="py-3 px-4">{getStatusBadge(invoice.payment?.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handlePrintInvoice(invoice)}
                          title="Print Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {invoice.payment?.status === 'pending' && (
                          <Button variant="ghost" size="sm" title="Send Invoice">
                            <Send className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {isLoading && (
            <div className="py-12 text-center text-muted-foreground">
              Loading invoices...
            </div>
          )}
          {(!isLoading && filteredInvoices.length === 0) && (
            <div className="py-12 text-center text-muted-foreground">
              No invoices found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      <Modal 
        isOpen={showInvoiceModal} 
        onClose={() => setShowInvoiceModal(false)}
        title="Invoice Details"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Invoice {selectedInvoice.invoiceNumber || selectedInvoice._id}</h3>
                <p className="text-muted-foreground">{formatDate(selectedInvoice.issuedDate)}</p>
              </div>
              {getStatusBadge(selectedInvoice.payment?.status)}
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-2">Guest Information</h4>
              <p>{selectedInvoice.guest?.firstName} {selectedInvoice.guest?.lastName}</p>
              <p className="text-sm text-muted-foreground">{selectedInvoice.guest?.email}</p>
            </div>

            <div className="border-t border-border pt-4">
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-2">
                {selectedInvoice.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.description}</span>
                    <span>{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(selectedInvoice.summary?.total || 0)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={() => handlePrintInvoice(selectedInvoice)}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowInvoiceModal(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}