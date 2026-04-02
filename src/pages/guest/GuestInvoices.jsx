import { useState, useEffect } from 'react'
import { invoicesAPI } from '../../lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { formatDate, formatCurrency } from '../../lib/utils'

export default function GuestInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await invoicesAPI.getMyInvoices()
      setInvoices(data.invoices || data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoices.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (invoiceId) => {
    try {
      const { data } = await invoicesAPI.downloadPDF(invoiceId)
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${invoiceId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download PDF')
    }
  }

  const getStatusBadge = (status) => {
    if (status === 'paid') return <Badge variant="success">Paid</Badge>
    if (status === 'partial') return <Badge variant="warning">Partial</Badge>
    if (status === 'pending') return <Badge variant="outline">Pending</Badge>
    return <Badge variant="destructive">Overdue</Badge>
  }

  const getInvoiceId = (inv) => inv._id || inv.id

  return (
    <div className="flex flex-col gap-6" style={{ color: '#F8F4EF' }}>
      <div>
        <p className="text-xs font-body tracking-[0.3em] uppercase mb-1" style={{ color: '#C9A84C' }}>Billing</p>
        <h1 className="font-display font-light text-3xl" style={{ color: '#F8F4EF' }}>Invoices &amp; Billing</h1>
        <p className="font-body text-sm mt-1" style={{ color: 'rgba(248,244,239,0.45)' }}>View and download your invoices</p>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-destructive mb-3">{error}</p>
            <Button variant="outline" onClick={loadInvoices}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {!loading && !error && invoices.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No Invoices Yet</h3>
            <p className="text-muted-foreground">Your invoices will appear here after your stay.</p>
          </CardContent>
        </Card>
      )}

      {!loading && invoices.length > 0 && (
        <div className="flex flex-col gap-4">
          {invoices.map(invoice => (
            <div
              key={getInvoiceId(invoice)}
              className="rounded-2xl transition-all duration-300"
              style={{ background: '#111111', border: '1px solid #2A2A2A' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(201,168,76,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(201,168,76,0.1)' }}>
                      <svg className="w-6 h-6" style={{ color: '#C9A84C' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-body font-semibold text-sm" style={{ color: '#F8F4EF' }}>
                          {invoice.invoiceNumber || `INV-${getInvoiceId(invoice).slice(-8).toUpperCase()}`}
                        </span>
                        {getStatusBadge(invoice.payment?.status)}
                      </div>
                      <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>Issued: {formatDate(invoice.issuedDate)}</p>
                      {invoice.payment?.dueDate && (
                        <p className="text-xs font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>Due: {formatDate(invoice.payment.dueDate)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="font-display text-xl" style={{ color: '#C9A84C' }}>{formatCurrency(invoice.summary?.total || 0)}</p>
                    {invoice.payment?.paidAmount > 0 && invoice.payment?.status !== 'paid' && (
                      <p className="text-xs font-body" style={{ color: '#4ade80' }}>Paid: {formatCurrency(invoice.payment.paidAmount)}</p>
                    )}
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-xl text-xs font-body tracking-wide transition-all"
                        style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}
                        onClick={() => setSelectedInvoice(invoice)}>
                        View Details
                      </button>
                      <button className="px-3 py-1.5 rounded-xl text-xs font-body tracking-wide transition-all"
                        style={{ border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' }}
                        onClick={() => handleDownloadPDF(getInvoiceId(invoice))}>
                        ↓ PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Invoice ${selectedInvoice?.invoiceNumber || ''}`}
      >
        {selectedInvoice && (
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Issued</p>
                <p className="font-medium">{formatDate(selectedInvoice.issuedDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-medium">{formatDate(selectedInvoice.payment?.dueDate)}</p>
              </div>
            </div>

            {/* Line Items */}
            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">Items</p>
                <div className="flex flex-col gap-2">
                  {selectedInvoice.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div>
                        <span>{item.description}</span>
                        {item.quantity > 1 && <span className="text-muted-foreground ml-1">× {item.quantity}</span>}
                      </div>
                      <span className="font-medium">{formatCurrency(item.total || item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            {selectedInvoice.summary && (
              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.summary.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax ({selectedInvoice.summary.taxRate * 100}%)</span>
                  <span>{formatCurrency(selectedInvoice.summary.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.summary.total)}</span>
                </div>
                {selectedInvoice.payment?.paidAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Paid</span>
                    <span>− {formatCurrency(selectedInvoice.payment.paidAmount)}</span>
                  </div>
                )}
                {selectedInvoice.payment?.status !== 'paid' && (
                  <div className="flex justify-between font-semibold text-destructive">
                    <span>Balance Due</span>
                    <span>{formatCurrency((selectedInvoice.summary.total || 0) - (selectedInvoice.payment?.paidAmount || 0))}</span>
                  </div>
                )}
              </div>
            )}

            {selectedInvoice.notes && (
              <div className="p-3 bg-accent/30 rounded-lg text-sm">
                <p className="font-medium mb-1">Notes</p>
                <p className="text-muted-foreground">{selectedInvoice.notes}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={() => window.print()}>
                Print Invoice
              </Button>
              <Button className="flex-1" onClick={() => setSelectedInvoice(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
