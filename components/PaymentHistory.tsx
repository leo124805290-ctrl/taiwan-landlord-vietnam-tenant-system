'use client'

import React from 'react'
import { t } from '@/lib/translations'
import { formatCurrency } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

interface PaymentHistoryProps {
  property: any
}

export default function PaymentHistory({ property }: PaymentHistoryProps) {
  const { state } = useApp()
  
  // 獲取所有歷史付款記錄（已付款的）
  const allHistory = [...(property.history || [])]
    .sort((a, b) => b.paid.localeCompare(a.paid))
  
  // 獲取所有唯一的月份、房間和租客
  const allMonths = Array.from(new Set(allHistory.map((p: any) => p.m))).sort().reverse()
  const allRooms = Array.from(new Set(allHistory.map((p: any) => p.n))).sort()
  const allTenants = Array.from(new Set(allHistory.map((p: any) => p.t))).sort()
  
  // 使用本地狀態管理篩選
  const [monthFilter, setMonthFilter] = React.useState('all')
  const [roomFilter, setRoomFilter] = React.useState('all')
  const [tenantFilter, setTenantFilter] = React.useState('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  
  const filteredHistory = allHistory.filter(payment => {
    // 月份篩選
    if (monthFilter && monthFilter !== 'all' && payment.m !== monthFilter) return false
    
    // 房間篩選
    if (roomFilter && roomFilter !== 'all' && payment.n !== roomFilter) return false
    
    // 租客篩選
    if (tenantFilter && tenantFilter !== 'all' && payment.t !== tenantFilter) return false
    
    // 搜索篩選
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const roomName = payment.n?.toLowerCase() || ''
      const tenantName = payment.t?.toLowerCase() || ''
      const month = payment.m?.toLowerCase() || ''
      const notes = payment.notes?.toLowerCase() || ''
      
      if (!roomName.includes(term) && 
          !tenantName.includes(term) && 
          !month.includes(term) && 
          !notes.includes(term)) {
        return false
      }
    }
    
    return true
  })

  // 計算統計
  const totalAmount = filteredHistory.reduce((sum: number, p: any) => sum + p.total, 0)
  const totalRecords = filteredHistory.length

  return (
    <div className="space-y-4">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📜</span>
          {t('paymentHistory', state.lang)}
        </h1>
        <div className="text-sm text-gray-500">
          {property.name} - {totalRecords} {t('records', state.lang)}
        </div>
      </div>

      {/* 篩選面板 */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
          
          {/* 租客篩選 */}
          <div>
            <div className="text-sm text-gray-600 mb-1">{t('tenant', state.lang)}</div>
            <select 
              value={tenantFilter}
              onChange={(e) => setTenantFilter(e.target.value)}
              className="w-full input-field"
            >
              <option value="all">{t('allTenants', state.lang)}</option>
              {allTenants.map(tenant => (
                <option key={tenant} value={tenant}>{tenant}</option>
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
              {t('totalRecords', state.lang)}: <span className="font-bold">{totalRecords}</span>
            </div>
            <div>
              {t('totalAmount', state.lang)}: <span className="font-bold text-green-600">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 歷史記錄列表 */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-lg font-bold text-gray-600">
              {t('noPaymentHistory', state.lang)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {t('noPaymentHistoryDescription', state.lang)}
            </div>
          </div>
        ) : (
          filteredHistory.map(payment => (
            <div key={payment.id} className="card hover:bg-gray-50">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="font-bold text-lg">
                    {payment.n} - {payment.t}
                  </div>
                  <div className="text-sm text-gray-600">{payment.m}</div>
                  <div className="text-sm mt-2">
                    {t('rent', state.lang)} {formatCurrency(payment.r)} + 
                    {t('electricity', state.lang)} {payment.u || 0}{t('degree', state.lang)} × 
                    ${payment.electricityRate || state.data?.electricityRate || 6} = 
                    <span className="font-bold"> {formatCurrency(payment.total)}</span>
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    ✓ {payment.paid} {t('paidOn', state.lang)}
                    {payment.paymentMethod && ` · ${t('paymentMethod', state.lang)}: ${payment.paymentMethod}`}
                  </div>
                  {payment.notes && (
                    <div className="text-xs text-gray-500 mt-1">
                      📝 {payment.notes}
                    </div>
                  )}
                </div>
                <span className="badge bg-green-100 text-green-700 ml-4 h-fit">
                  {t('paid', state.lang)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}