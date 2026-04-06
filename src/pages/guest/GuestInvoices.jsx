import { useState, useEffect } from 'react'
import { invoicesAPI } from '../../lib/api'
import { formatCurrency, formatDate } from '../../lib/utils'
import { FileText, Download, ExternalLink, Loader2, Receipt, Calendar, CreditCard } from 'lucide-react'

export default function GuestInvoices() {
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)
  const [viewingId, setViewingId] = useState(null)

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await invoicesAPI.getMyInvoices()
      // BUG 8 FIX: Sort by most recent first (createdAt descending)
      const sorted = (data.invoices || []).sort((a, b) => {
        return new Date(b.createdAt || b.issuedDate) - new Date(a.createdAt || a.issuedDate)
      })
      setInvoices(sorted)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invoices')
    } finally {
      setIsLoading(false)
    }
  }

  // BUG 8 FIX: Download PDF as a file
  const handleDownloadPDF = async (invoiceId) => {
    setDownloadingId(invoiceId)
    try {
      const response = await invoicesAPI.downloadPDF(invoiceId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const inv = invoices.find(i => i._id === invoiceId)
      link.download = `Invoice-${inv?.invoiceNumber || invoiceId}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download PDF. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

  // BUG 8 FIX: Open PDF in a NEW browser tab
  const handleViewPDF = async (invoiceId) => {
    setViewingId(invoiceId)
    try {
      const response = await invoicesAPI.downloadPDF(invoiceId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to open PDF. Please try again.')
    } finally {
      setViewingId(null)
    }
  }

  const getStatusStyle = (status) => {
    const styles = {
      paid: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: '#4ade80' },
      pending: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', color: '#fbbf24' },
      partial: { bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)', color: '#fb923c' },
      overdue: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', color: '#f87171' },
    }
    return styles[status] || styles.pending
  }

  return (
    <div className="min-h-screen pt-20 px-6 pb-12" style={{ background: '#0A0A0A', color: '#F8F4EF' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display font-light text-3xl" style={{ color: '#F8F4EF' }}>My Invoices</h1>
            <p className="text-sm font-body mt-1" style={{ color: 'rgba(248,244,239,0.45)' }}>
              {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={loadInvoices} disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-body tracking-widest uppercase transition-all disabled:opacity-50"
            style={{ border: '1px solid rgba(201,168,76,0.3)', color: '#C9A84C' }}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: '#C9A84C', borderTopColor: 'transparent' }} />
            <p className="text-sm font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>Loading invoices...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="py-12 text-center rounded-2xl" style={{ background: '#111111', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-sm font-body" style={{ color: '#f87171' }}>{error}</p>
            <button onClick={loadInvoices} className="mt-3 text-xs font-body px-4 py-2 rounded-lg" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && invoices.length === 0 && (
          <div className="py-20 text-center rounded-2xl" style={{ background: '#111111', border: '1px solid #1A1A1A' }}>
            <Receipt className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgba(248,244,239,0.1)' }} />
            <h3 className="font-display text-xl mb-2" style={{ color: '#F8F4EF' }}>No Invoices Yet</h3>
            <p className="text-sm font-body" style={{ color: 'rgba(248,244,239,0.4)' }}>
              Invoices will appear here after you make a booking.
            </p>
          </div>
        )}

        {/* Invoices list — sorted by most recent first */}
        {!isLoading && !error && invoices.length > 0 && (
          <div className="space-y-4">
            {invoices.map(invoice => {
              const statusStyle = getStatusStyle(invoice.payment?.status)
              const roomName = invoice.booking?.room?.name || invoice.booking?.room?.type || null
              const roomNumber = invoice.booking?.room?.roomNumber || null

              return (
                <div key={invoice._id} className="rounded-2xl overflow-hidden transition-all"
                  style={{ background: '#111111', border: '1px solid #1A1A1A' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.2)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A1A1A' }}>

                  {/* Top row: invoice number + status + total */}
                  <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.12)' }}>
                        <FileText className="w-5 h-5" style={{ color: '#C9A84C' }} />
                      </div>
                      <div>
                        <h4 className="font-mono text-sm font-medium" style={{ color: '#F8F4EF' }}>
                          {invoice.invoiceNumber || `INV-${(invoice._id || '').slice(-6).toUpperCase()}`}
                        </h4>
                        <p className="text-xs font-body mt-0.5" style={{ color: 'rgba(248,244,239,0.4)' }}>
                          Issued {formatDate(invoice.issuedDate || invoice.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-body uppercase px-2.5 py-1 rounded-full"
                        style={{ background: statusStyle.bg, border: `1px solid ${statusStyle.border}`, color: statusStyle.color }}>
                        {invoice.payment?.status || 'pending'}
                      </span>
                      <p className="font-display text-xl" style={{ color: '#C9A84C' }}>
                        {formatCurrency(invoice.summary?.total || 0)}
                      </p>
                    </div>
                  </div>

                  {/* Detail row: room, dates, items */}
                  <div className="px-5 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ borderTop: '1px solid #1A1A1A' }}>
                    <div>
                      <p className="text-[10px] font-body uppercase tracking-widest" style={{ color: 'rgba(248,244,239,0.3)' }}>Room</p>
                      <p className="text-sm font-body mt-0.5" style={{ color: '#F8F4EF' }}>
                        {roomName ? `${roomName}` : (roomNumber ? `Room ${roomNumber}` : '—')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-body uppercase tracking-widest" style={{ color: 'rgba(248,244,239,0.3)' }}>Check-in</p>
                      <p className="text-sm font-body mt-0.5" style={{ color: '#F8F4EF' }}>
                        {invoice.booking?.checkIn ? formatDate(invoice.booking.checkIn) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-body uppercase tracking-widest" style={{ color: 'rgba(248,244,239,0.3)' }}>Check-out</p>
                      <p className="text-sm font-body mt-0.5" style={{ color: '#F8F4EF' }}>
                        {invoice.booking?.checkOut ? formatDate(invoice.booking.checkOut) : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-body uppercase tracking-widest" style={{ color: 'rgba(248,244,239,0.3)' }}>Items</p>
                      <p className="text-sm font-body mt-0.5" style={{ color: '#F8F4EF' }}>{invoice.items?.length || 0}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="px-5 py-3 flex items-center gap-2" style={{ borderTop: '1px solid #1A1A1A' }}>
                    <button
                      onClick={() => handleViewPDF(invoice._id)}
                      disabled={viewingId === invoice._id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body tracking-wide uppercase transition-all disabled:opacity-50"
                      style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: '#C9A84C' }}>
                      {viewingId === invoice._id
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Opening...</>
                        : <><ExternalLink className="w-3.5 h-3.5" /> View PDF</>
                      }
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(invoice._id)}
                      disabled={downloadingId === invoice._id}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body tracking-wide uppercase transition-all disabled:opacity-50"
                      style={{ border: '1px solid #2A2A2A', color: 'rgba(248,244,239,0.5)' }}>
                      {downloadingId === invoice._id
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Downloading...</>
                        : <><Download className="w-3.5 h-3.5" /> Download</>
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
