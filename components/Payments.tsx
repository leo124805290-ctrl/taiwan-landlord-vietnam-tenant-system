'use client'

import { t } from '@/lib/translations'
import { formatCurrency } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

interface PaymentsProps {
  property: any
}

export default function Payments({ property }: PaymentsProps) {
  const { state, updateState, updateData } = useApp()
  const allPayments = [...property.payments, ...(property.history || [])]
    .sort((a, b) => (b.paid || b.due).localeCompare(a.paid || a.due))

  const filteredPayments = allPayments.filter(p => {
    if (state.filter === 'all') return true
    if (state.filter === 'unpaid') return p.s === 'pending'
    return p.s === state.filter
  })

  return (
    <div className="space-y-4">
      {/* 篩選按鈕 */}
      <div className="flex gap-2">
        {['all', 'unpaid', 'paid'].map(filter => (
          <button
            key={filter}
            onClick={() => updateState({ filter: filter as any })}
            className={`flex-1 btn ${state.filter === filter ? 'btn-primary' : 'bg-white'}`}
          >
            {t(filter, state.lang)}
          </button>
        ))}
      </div>

      {/* 付款列表 */}
      <div className="space-y-3">
        {filteredPayments.map(payment => (
          <div key={payment.id} className="card">
            <div className="flex justify-between">
              <div className="flex-1">
                <div className="font-bold text-lg">
                  {payment.n} - {payment.t}
                </div>
                <div className="text-sm text-gray-600">{payment.m}</div>
                <div className="text-sm mt-2">
                  {t('rent', state.lang)} {formatCurrency(payment.r)} + 
                  {t('electricity', state.lang)} {payment.u || 0}{t('degree', state.lang)}×
                  ${state.data.electricityRate} = 
                  <span className="font-bold"> {formatCurrency(payment.total)}</span>
                </div>
                {payment.paid && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ {payment.paid} {t('paidOn', state.lang)}
                  </div>
                )}
              </div>
              <span className={`badge ${
                payment.s === 'paid' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              } ml-4 h-fit`}>
                {t(payment.s, state.lang)}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              {payment.s === 'pending' ? (
                <button 
                  onClick={() => markAsPaid(payment.id)}
                  className="flex-1 btn bg-green-600 text-white text-sm"
                >
                  {t('markPaid', state.lang)}
                </button>
              ) : (
                <button 
                  onClick={() => markAsUnpaid(payment.id)}
                  className="flex-1 btn bg-orange-100 text-orange-700 text-sm"
                >
                  {t('markUnpaid', state.lang)}
                </button>
              )}
              <button 
                onClick={() => deletePayment(payment.id)}
                className="flex-1 btn bg-red-100 text-red-600 text-sm"
              >
                {t('delete', state.lang)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  function markAsPaid(paymentId: number) {
    const payment = property.payments.find((p: any) => p.id === paymentId)
    if (!payment) return

    const updatedPayment = {
      ...payment,
      s: 'paid' as const,
      paid: new Date().toISOString().split('T')[0]
    }

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            payments: p.payments.filter(pay => pay.id !== paymentId),
            history: [...(p.history || []), updatedPayment]
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('collected', state.lang))
  }

  function markAsUnpaid(paymentId: number) {
    const payment = property.history?.find((p: any) => p.id === paymentId)
    if (!payment) return

    const updatedPayment = {
      ...payment,
      s: 'pending' as const,
      paid: undefined
    }

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            payments: [...p.payments, updatedPayment],
            history: (p.history || []).filter(pay => pay.id !== paymentId)
          }
        : p
    )

    updateData({ properties: updatedProperties })
  }

  function deletePayment(paymentId: number) {
    if (!confirm(t('confirmDelete', state.lang))) return

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            payments: p.payments.filter(pay => pay.id !== paymentId),
            history: (p.history || []).filter(pay => pay.id !== paymentId)
          }
        : p
    )

    updateData({ properties: updatedProperties })
  }
}