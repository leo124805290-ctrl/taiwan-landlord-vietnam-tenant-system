'use client'

import React from 'react'
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

  // 獲取所有唯一的月份和房間
  const allMonths = Array.from(new Set(allPayments.map((p: any) => p.m))).sort().reverse()
  const allRooms = Array.from(new Set(allPayments.map((p: any) => p.n))).sort()
  
  // 使用本地狀態管理篩選（因為 AppState 中沒有這些屬性）
  const [localFilter, setLocalFilter] = React.useState<'all' | 'unpaid' | 'paid'>(state.filter || 'all')
  const [monthFilter, setMonthFilter] = React.useState('all')
  const [roomFilter, setRoomFilter] = React.useState('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  
  const filteredPayments = allPayments.filter(p => {
    // 狀態篩選
    if (localFilter === 'unpaid' && p.s !== 'pending') return false
    if (localFilter === 'paid' && p.s !== 'paid') return false
    
    // 月份篩選
    if (monthFilter && monthFilter !== 'all' && p.m !== monthFilter) return false
    
    // 房間篩選
    if (roomFilter && roomFilter !== 'all' && p.n !== roomFilter) return false
    
    // 搜索篩選
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const roomName = p.n?.toLowerCase() || ''
      const tenantName = p.t?.toLowerCase() || ''
      const month = p.m?.toLowerCase() || ''
      const notes = p.notes?.toLowerCase() || ''
      
      if (!roomName.includes(term) && 
          !tenantName.includes(term) && 
          !month.includes(term) && 
          !notes.includes(term)) {
        return false
      }
    }
    
    return true
  })

  return (
    <div className="space-y-4">
      {/* 篩選面板 */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* 狀態篩選 */}
          <div>
            <div className="text-sm text-gray-600 mb-1">{t('status', state.lang)}</div>
            <select 
              value={localFilter}
              onChange={(e) => setLocalFilter(e.target.value as 'all' | 'unpaid' | 'paid')}
              className="w-full input-field"
            >
              <option value="all">{t('all', state.lang)}</option>
              <option value="unpaid">{t('unpaid', state.lang)}</option>
              <option value="paid">{t('paid', state.lang)}</option>
            </select>
          </div>
          
          {/* 月份篩選 */}
          <div>
            <div className="text-sm text-gray-600 mb-1">{t('month', state.lang)}</div>
            <select 
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full input-field"
            >
              <option value="all">{t('allMonths', state.lang)}</option>
              {allMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          {/* 房間篩選 */}
          <div>
            <div className="text-sm text-gray-600 mb-1">{t('room', state.lang)}</div>
            <select 
              value={roomFilter}
              onChange={(e) => setRoomFilter(e.target.value)}
              className="w-full input-field"
            >
              <option value="all">{t('allRooms', state.lang)}</option>
              {allRooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
          
          {/* 搜索 */}
          <div>
            <div className="text-sm text-gray-600 mb-1">{t('search', state.lang)}</div>
            <input
              type="text"
              placeholder={t('searchPayments', state.lang)}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full input-field"
            />
          </div>
        </div>
        
        {/* 統計資訊 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <div>
              {t('totalRecords', state.lang)}: <span className="font-bold">{filteredPayments.length}</span>
            </div>
            <div>
              {t('pendingAmount', state.lang)}: <span className="font-bold text-red-600">
                {formatCurrency(filteredPayments.filter((p: any) => p.s === 'pending').reduce((sum: number, p: any) => sum + p.total, 0))}
              </span>
            </div>
          </div>
        </div>
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

    // 檢查該房間的當前狀態
    const room = property.rooms.find((r: any) => r.id === payment.rid)
    if (room && room.s !== 'occupied') {
      // 房間已退租或空置，需要警告
      const warningMessage = `⚠️ ${t('warning', state.lang)}\n\n`
        + `${t('tenantMovedOutWarning', state.lang)}: ${room.n}\n`
        + `${t('currentStatus', state.lang)}: ${t(room.s, state.lang)}\n\n`
        + `${t('confirmChangeToUnpaid', state.lang)}`
      
      if (!confirm(warningMessage)) {
        return // 用戶取消操作
      }
      
      // 需要密碼驗證
      const password = prompt(t('enterPasswordToChangeStatus', state.lang), '')
      if (password !== '123456') {
        alert(t('incorrectPassword', state.lang))
        return
      }
    }

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
    alert(t('statusChangedToUnpaid', state.lang))
  }

  function deletePayment(paymentId: number) {
    if (!confirm(t('confirmDelete', state.lang))) return
    
    // 密碼驗證
    const password = prompt(t('enterPasswordToDelete', state.lang), '')
    if (password !== '123456') {
      alert(t('incorrectPassword', state.lang))
      return
    }

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
    alert(t('paymentDeleted', state.lang))
  }
}