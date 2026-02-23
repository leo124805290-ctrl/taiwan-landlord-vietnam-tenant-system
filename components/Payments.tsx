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
  
  // 獲取所有付款記錄（待付款 + 歷史）
  const allPayments = [...property.payments, ...(property.history || [])]
    .sort((a, b) => (b.paid || b.due).localeCompare(a.paid || a.due))

  // 獲取所有唯一的月份、房間和租客（用於篩選）
  const allMonths = Array.from(new Set(allPayments.map((p: any) => p.m))).sort().reverse()
  const allRooms = Array.from(new Set(allPayments.map((p: any) => p.n))).sort()
  const allTenants = Array.from(new Set(allPayments.map((p: any) => p.t))).sort()
  
  // 篩選狀態
  const [monthFilter, setMonthFilter] = React.useState('all')
  const [roomFilter, setRoomFilter] = React.useState('all')
  const [tenantFilter, setTenantFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'pending' | 'paid'>('pending')
  const [searchTerm, setSearchTerm] = React.useState('')

  // 篩選付款記錄
  const filteredPayments = allPayments.filter(payment => {
    // 月份篩選
    if (monthFilter && monthFilter !== 'all' && payment.m !== monthFilter) return false
    
    // 房間篩選
    if (roomFilter && roomFilter !== 'all' && payment.n !== roomFilter) return false
    
    // 租客篩選
    if (tenantFilter && tenantFilter !== 'all' && payment.t !== tenantFilter) return false
    
    // 狀態篩選
    if (statusFilter === 'pending' && payment.s !== 'pending') return false
    if (statusFilter === 'paid' && payment.s !== 'paid') return false
    
    // 搜索篩選
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const roomName = payment.n?.toLowerCase() || ''
      const tenantName = payment.t?.toLowerCase() || ''
      const month = payment.m?.toLowerCase() || ''
      
      if (!roomName.includes(term) && 
          !tenantName.includes(term) && 
          !month.includes(term)) {
        return false
      }
    }
    
    return true
  })

  // 按房號排序
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    // 先按房號排序
    const roomCompare = (a.n || '').localeCompare(b.n || '')
    if (roomCompare !== 0) return roomCompare
    
    // 房號相同時按月份排序
    return (b.m || '').localeCompare(a.m || '')
  })

  // 計算統計
  const pendingPayments = sortedPayments.filter(p => p.s === 'pending')
  const totalPendingAmount = pendingPayments.reduce((sum: number, p: any) => sum + p.total, 0)
  const totalPendingRooms = new Set(pendingPayments.map(p => p.n)).size

  // 收款函數
  const collectPayment = (payment: any) => {
    // 設置當前要收款的記錄
    updateState({ 
      modal: {
        type: 'collectPayment',
        data: {
          paymentId: payment.id,
          roomNumber: payment.n,
          tenantName: payment.t,
          month: payment.m,
          rentAmount: payment.r,
          currentElectricityFee: payment.e || 0,
          currentElectricityUsage: payment.u || 0,
          lastMeterReading: getLastMeterReading(payment.rid)
        }
      }
    })
  }

  // 獲取房間的上期電錶讀數
  const getLastMeterReading = (roomId: number) => {
    const room = property.rooms.find((r: any) => r.id === roomId)
    return room?.lastMeter || room?.lm || 0
  }

  // 重新計算電費函數（保留現有功能）
  const recalculateElectricityFees = () => {
    if (!property || !property.rooms || !property.payments) {
      alert('無法重新計算電費：缺少必要數據')
      return
    }

    const pendingPayments = property.payments.filter((p: any) => p.s === 'pending')
    if (pendingPayments.length === 0) {
      alert('目前沒有待付款記錄需要重新計算')
      return
    }

    let updatedCount = 0
    const updatedPayments = property.payments.map((payment: any) => {
      if (payment.s === 'pending') {
        const room = property.rooms.find((r: any) => r.id === payment.rid)
        if (room && room.elecFee !== undefined) {
          const newElectricityFee = room.elecFee || 0
          const newUsage = room.lastMeterUsage || 0
          const newTotal = payment.r + newElectricityFee
          
          if (payment.e !== newElectricityFee) {
            updatedCount++
            return {
              ...payment,
              u: newUsage,
              e: newElectricityFee,
              total: newTotal,
              electricityRate: state.data.electricityRate
            }
          }
        }
      }
      return payment
    })

    if (updatedCount > 0) {
      const updatedProperties = state.data.properties.map(p => 
        p.id === property.id
          ? { ...p, payments: updatedPayments }
          : p
      )
      updateData({ properties: updatedProperties })
      alert(`✅ 成功更新 ${updatedCount} 筆待付款記錄的電費金額`)
    } else {
      alert('所有待付款記錄的電費金額已經是最新的')
    }
  }

  // 更新單筆電費
  const updateElectricityFee = (paymentId: number) => {
    if (!property || !property.rooms || !property.payments) {
      alert('無法更新電費：缺少必要數據')
      return
    }

    const paymentToUpdate = property.payments.find((p: any) => p.id === paymentId)
    if (!paymentToUpdate) {
      alert('找不到要更新的付款記錄')
      return
    }

    if (paymentToUpdate.s !== 'pending') {
      alert('只能更新待付款記錄的電費')
      return
    }

    const room = property.rooms.find((r: any) => r.id === paymentToUpdate.rid)
    if (!room) {
      alert('找不到對應的房間')
      return
    }

    const newElectricityFee = room.elecFee || 0
    const newUsage = room.lastMeterUsage || 0
    const newTotal = paymentToUpdate.r + newElectricityFee

    const updatedPayments = property.payments.map((payment: any) => 
      payment.id === paymentId
        ? {
            ...payment,
            u: newUsage,
            e: newElectricityFee,
            total: newTotal,
            electricityRate: state.data.electricityRate
          }
        : payment
    )

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? { ...p, payments: updatedPayments }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(`✅ 成功更新 ${paymentToUpdate.n} 房間的電費金額\n用電度數: ${newUsage} 度\n電費金額: ${formatCurrency(newElectricityFee)}`)
  }

  return (
    <div className="space-y-4">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>💰</span>
          {t('paymentsTab', state.lang)}
        </h1>
        <div className="text-sm text-gray-500">
          {property.name} - {totalPendingRooms} {t('rooms', state.lang)} {t('pendingPayment', state.lang)}
        </div>
      </div>

      {/* 篩選面板 */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
          
          {/* 狀態篩選 */}
          <div>
            <div className="text-sm text-gray-600 mb-1">{t('status', state.lang)}</div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full input-field"
            >
              <option value="pending">{t('pending', state.lang)}</option>
              <option value="paid">{t('paid', state.lang)}</option>
              <option value="all">{t('all', state.lang)}</option>
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
        
        {/* 操作按鈕和統計 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              {t('totalRecords', state.lang)}: <span className="font-bold">{sortedPayments.length}</span>
              {statusFilter === 'pending' && (
                <span className="ml-4">
                  {t('pendingAmount', state.lang)}: <span className="font-bold text-red-600">
                    {formatCurrency(totalPendingAmount)}
                  </span>
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={recalculateElectricityFees}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                title="根據最新電錶讀數重新計算待付款電費"
              >
                🔄 {t('recalculateElectricity', state.lang)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 待收款列表 */}
      <div className="space-y-3">
        {sortedPayments.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-lg font-bold text-gray-600">
              {statusFilter === 'pending' 
                ? t('noPendingPayments', state.lang)
                : t('noPaymentsFound', state.lang)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {statusFilter === 'pending'
                ? t('noPendingPaymentsDescription', state.lang)
                : t('noPaymentsFoundDescription', state.lang)}
            </div>
          </div>
        ) : (
          sortedPayments.map(payment => (
            <div key={payment.id} className="card hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* 房號和租客姓名 */}
                  <div className="font-bold text-lg">
                    {payment.n} - {payment.t}
                    <span className="ml-3 text-sm font-normal text-gray-600">
                      {payment.m}
                    </span>
                  </div>
                  
                  {/* 金額明細 */}
                  <div className="mt-2">
                    <div className="text-sm">
                      <span className="text-gray-700">🏠 {t('rent', state.lang)}: </span>
                      <span className="font-bold">{formatCurrency(payment.r)}</span>
                      
                      <span className="mx-2">+</span>
                      
                      <span className="text-gray-700">⚡ {t('electricity', state.lang)}: </span>
                      <span className="font-bold text-blue-600">{formatCurrency(payment.e || 0)}</span>
                      
                      <span className="mx-2">=</span>
                      
                      <span className="text-gray-700">💰 {t('total', state.lang)}: </span>
                      <span className="font-bold text-green-600">{formatCurrency(payment.total)}</span>
                    </div>
                    
                    {/* 電費詳細計算（如果電費為0，顯示提醒） */}
                    <div className="text-xs text-gray-500 mt-1">
                      {payment.e === 0 || payment.e === undefined ? (
                        <span className="text-orange-600">
                          ⚠️ {t('electricityNotCalculated', state.lang)}
                        </span>
                      ) : (
                        <span>
                          {t('electricityUsage', state.lang)}: {payment.u || 0}{t('degree', state.lang)} × 
                          ${payment.electricityRate || state.data?.electricityRate || 6} = {formatCurrency(payment.e)}
                        </span>
                      )}
                    </div>
                    
                    {/* 付款狀態和日期 */}
                    <div className="text-xs mt-2">
                      {payment.s === 'pending' ? (
                        <span className="text-red-600">
                          ⏳ {t('dueDate', state.lang)}: {payment.due}
                        </span>
                      ) : (
                        <span className="text-green-600">
                          ✓ {t('paidOn', state.lang)}: {payment.paid}
                          {payment.paymentMethod && ` · ${t('paymentMethod', state.lang)}: ${payment.paymentMethod}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* 操作按鈕 */}
                <div className="flex flex-col gap-2 ml-4">
                  {payment.s === 'pending' ? (
                    <>
                      <button
                        onClick={() => collectPayment(payment)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        💰 {t('collectPayment', state.lang)}
                      </button>
                      
                      {(payment.e === 0 || payment.e === undefined) && (
                        <button
                          onClick={() => updateElectricityFee(payment.id)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
                          title="從房間最新電錶數據更新電費"
                        >
                          ⚡ {t('updateElectricity', state.lang)}
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="badge bg-green-100 text-green-700 px-3 py-1">
                      ✓ {t('paid', state.lang)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}