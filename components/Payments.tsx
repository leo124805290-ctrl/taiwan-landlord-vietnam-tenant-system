'use client'

import React, { useState } from 'react'
import { t } from '@/lib/translations'
import { formatCurrency } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import PaymentStatsPanel from './PaymentStatsPanel'
import PaymentViews from './PaymentViews'

interface PaymentsProps {
  property: any
}

export default function Payments({ property }: PaymentsProps) {
  const { state, updateState, updateData } = useApp()
  
  // 視圖模式狀態
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'list'>('table')
  
  // 分類篩選狀態
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'new_tenant' | 'current_month' | 'overdue' | 'collected'>('all')
  
  // 獲取所有付款記錄（待付款 + 歷史）
  // 注意：已歸檔的付款記錄不會在待收列表中顯示
  const allPayments = [...property.payments, ...(property.history || [])]
    .sort((a, b) => (b.paid || b.due).localeCompare(a.paid || a.due))
  
  // 獲取補登記錄（isBackfill: true）
  const backfillPayments = allPayments.filter(p => p.isBackfill === true)
  
  // 獲取待收款項（未歸檔的 pending 狀態，排除補登記錄）
  const pendingPayments = allPayments.filter(p => 
    p.s === 'pending' && !p.archived && !p.isBackfill
  )
  
  // 獲取已收款項（已歸檔的 paid 狀態）
  const collectedPayments = allPayments.filter(p => 
    p.s === 'paid' && p.archived
  )

  // 獲取所有唯一的月份、房間和租客（用於篩選）
  const allMonths = Array.from(new Set(allPayments.map((p: any) => p.m))).sort().reverse()
  const allRooms = Array.from(new Set(allPayments.map((p: any) => p.n))).sort()
  const allTenants = Array.from(new Set(allPayments.map((p: any) => p.t))).sort()
  
  // 篩選狀態
  const [monthFilter, setMonthFilter] = React.useState('all')
  const [roomFilter, setRoomFilter] = React.useState('all')
  const [tenantFilter, setTenantFilter] = React.useState('all')
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'pending' | 'paid'>('all')
  const [backfillFilter, setBackfillFilter] = React.useState<'all' | 'backfill' | 'normal'>('all')
  const [searchTerm, setSearchTerm] = React.useState('')
  
  // 批量操作狀態
  const [selectedBackfillIds, setSelectedBackfillIds] = React.useState<number[]>([])
  const [showBulkConfirm, setShowBulkConfirm] = React.useState(false)

  // 分類篩選邏輯
  const filterByCategory = (payment: any) => {
    if (categoryFilter === 'all') {
      // 全部待收：只顯示未歸檔的待收款項
      return payment.s === 'pending' && !payment.archived
    }
    
    const today = new Date()
    const dueDate = payment.due ? new Date(payment.due) : null
    
    switch (categoryFilter) {
      case 'new_tenant':
        // 新租客款項：押金或首月租金（未歸檔）
        return payment.s === 'pending' && 
               !payment.archived && 
               (payment.paymentType === 'deposit' || 
                (payment.tenantType === 'new' && payment.paymentType === 'rent'))
      
      case 'current_month':
        // 舊租客當月款項：本月到期且未逾期（未歸檔）
        const currentMonth = today.toISOString().slice(0, 7).replace('-', '/')
        return payment.s === 'pending' && 
               !payment.archived &&
               payment.m === currentMonth && 
               (!dueDate || dueDate >= today) &&
               payment.tenantType === 'existing'
      
      case 'overdue':
        // 逾期款項：已過期且未付款（未歸檔）
        return payment.s === 'pending' && 
               !payment.archived &&
               dueDate && 
               dueDate < today
      
      case 'collected':
        // 已收款項：已歸檔的付款記錄
        return payment.s === 'paid' && payment.archived
      
      default:
        return payment.s === 'pending' && !payment.archived
    }
  }
  
  // 篩選付款記錄
  const filteredPayments = allPayments.filter(payment => {
    // 分類篩選
    if (!filterByCategory(payment)) return false
    
    // 月份篩選
    if (monthFilter && monthFilter !== 'all' && payment.m !== monthFilter) return false
    
    // 房間篩選
    if (roomFilter && roomFilter !== 'all' && payment.n !== roomFilter) return false
    
    // 租客篩選
    if (tenantFilter && tenantFilter !== 'all' && payment.t !== tenantFilter) return false
    
    // 狀態篩選
    if (statusFilter === 'pending' && payment.s !== 'pending') return false
    if (statusFilter === 'paid' && payment.s !== 'paid') return false
    
    // 補登記錄篩選
    if (backfillFilter === 'backfill' && !payment.isBackfill) return false
    if (backfillFilter === 'normal' && payment.isBackfill) return false
    
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

  // 排序邏輯：補登記錄優先，然後按房號和月份排序
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    // 補登記錄優先（isBackfill: true）
    if (a.isBackfill && !b.isBackfill) return -1
    if (!a.isBackfill && b.isBackfill) return 1
    
    // 狀態優先：待確認的補登記錄優先
    if (a.isBackfill && b.isBackfill) {
      if (a.s === 'pending' && b.s !== 'pending') return -1
      if (a.s !== 'pending' && b.s === 'pending') return 1
    }
    
    // 然後按房號排序
    const roomCompare = (a.n || '').localeCompare(b.n || '')
    if (roomCompare !== 0) return roomCompare
    
    // 房號相同時按月份排序（新的月份在前）
    return (b.m || '').localeCompare(a.m || '')
  })

  // 計算統計（使用前面定義的 pendingPayments）
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

  // 恢復付款函數
  const restorePayment = (paymentId: number) => {
    // 設置當前要恢復的付款記錄
    updateState({ 
      modal: {
        type: 'restorePayment',
        data: paymentId
      }
    })
  }

  // 調試函數：檢查付款記錄
  const debugPayments = () => {
    console.log('=== 付款記錄調試信息 ===')
    console.log('當前物業:', property.name)
    console.log('待付款記錄數量:', property.payments?.length || 0)
    console.log('歷史記錄數量:', property.history?.length || 0)
    
    // 檢查所有付款記錄
    const allPaymentsDebug = [...property.payments, ...(property.history || [])]
    console.log('總付款記錄數量:', allPaymentsDebug.length)
    
    // 檢查逾期記錄
    const today = new Date()
    const overduePayments = allPaymentsDebug.filter(p => {
      if (p.s !== 'pending' || p.archived) return false
      if (!p.due) return false
      
      const dueDate = new Date(p.due)
      return dueDate < today
    })
    
    console.log('逾期付款記錄數量:', overduePayments.length)
    console.log('逾期記錄詳情:', overduePayments.map(p => ({
      房間: p.n,
      租客: p.t,
      月份: p.m,
      到期日: p.due,
      狀態: p.s,
      歸檔: p.archived,
      金額: p.total
    })))
    
    alert(`調試信息已輸出到控制台\n逾期記錄: ${overduePayments.length}筆`)
  }

  // 獲取房間的上期電錶讀數
  const getLastMeterReading = (roomId: number) => {
    const room = property.rooms.find((r: any) => r.id === roomId)
    return room?.lastMeter || room?.lm || 0
  }

  // 批量確認補登記錄
  const bulkConfirmBackfillPayments = () => {
    if (selectedBackfillIds.length === 0) {
      alert('請先選擇要確認的補登記錄')
      return
    }
    
    const password = prompt('請輸入密碼以批量確認補登記錄（密碼：123456）')
    if (password !== '123456') {
      alert('密碼錯誤，操作取消')
      return
    }
    
    // 獲取選中的補登記錄
    const selectedBackfillPayments = allPayments.filter(p => 
      selectedBackfillIds.includes(p.id) && p.isBackfill && p.s === 'pending'
    )
    
    if (selectedBackfillPayments.length === 0) {
      alert('沒有找到待確認的補登記錄')
      return
    }
    
    // 更新付款記錄狀態
    const updatedPayments = property.payments.map((payment: any) => {
      if (selectedBackfillIds.includes(payment.id) && payment.isBackfill && payment.s === 'pending') {
        return {
          ...payment,
          s: 'paid',
          paid: new Date().toISOString().split('T')[0],
          archived: true
        }
      }
      return payment
    })
    
    // 更新物業數據
    updateData({
      properties: state.data.properties.map((p: any) => 
        p.id === property.id 
          ? { ...p, payments: updatedPayments }
          : p
      )
    })
    
    // 顯示成功訊息
    alert(`成功確認 ${selectedBackfillPayments.length} 筆補登記錄`)
    
    // 重置選擇
    setSelectedBackfillIds([])
    setShowBulkConfirm(false)
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
    <div className="space-y-6">
      {/* 頁面標題和視圖控制 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>💰</span>
            {t('paymentsTab', state.lang)}
          </h1>
          <div className="text-sm text-gray-500 mt-1">
            {property.name} - {totalPendingRooms} {t('rooms', state.lang)} {t('pendingPayment', state.lang)}
          </div>
        </div>
        
        {/* 視圖模式切換和調試按鈕 */}
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">視圖模式：</div>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              title="表格視圖"
            >
              📊
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1 rounded ${viewMode === 'card' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              title="卡片視圖"
            >
              🃏
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
              title="列表視圖"
            >
              📋
            </button>
          </div>
          
          {/* 調試按鈕 */}
          <button
            onClick={debugPayments}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            title="檢查付款記錄"
          >
            🔍 調試
          </button>
        </div>
      </div>

      {/* 統計面板 */}
      <PaymentStatsPanel 
        property={property}
        payments={allPayments}
        rooms={property.rooms || []}
      />

      {/* 分類篩選 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-2 rounded-lg ${categoryFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          📋 全部待收 ({pendingPayments.length})
        </button>
        <button
          onClick={() => setCategoryFilter('new_tenant')}
          className={`px-3 py-2 rounded-lg ${categoryFilter === 'new_tenant' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          🆕 新租客款項 ({pendingPayments.filter(p => 
            p.paymentType === 'deposit' || 
            (p.tenantType === 'new' && p.paymentType === 'rent')
          ).length})
        </button>
        <button
          onClick={() => setCategoryFilter('current_month')}
          className={`px-3 py-2 rounded-lg ${categoryFilter === 'current_month' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          👥 舊租客當月 ({pendingPayments.filter(p => {
            const today = new Date()
            const currentMonth = today.toISOString().slice(0, 7).replace('-', '/')
            const dueDate = p.due ? new Date(p.due) : null
            return p.m === currentMonth && 
                   (!dueDate || dueDate >= today) &&
                   p.tenantType === 'existing'
          }).length})
        </button>
        <button
          onClick={() => setCategoryFilter('overdue')}
          className={`px-3 py-2 rounded-lg ${categoryFilter === 'overdue' ? 'bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          ⚠️ 逾期款項 ({pendingPayments.filter(p => 
            p.due && 
            new Date(p.due) < new Date()
          ).length})
        </button>
        <button
          onClick={() => setCategoryFilter('collected')}
          className={`px-3 py-2 rounded-lg ${categoryFilter === 'collected' ? 'bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          📜 繳費歷史 ({collectedPayments.length})
        </button>
      </div>

      {/* 篩選面板 */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
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
          
          {/* 補登記錄篩選 */}
          <div>
            <div className="text-sm text-gray-600 mb-1">記錄類型</div>
            <select 
              value={backfillFilter}
              onChange={(e) => setBackfillFilter(e.target.value as any)}
              className="w-full input-field"
            >
              <option value="all">全部記錄</option>
              <option value="backfill">只看補登記錄 ({backfillPayments.length})</option>
              <option value="normal">排除補登記錄</option>
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
              {/* 批量確認補登記錄按鈕 */}
              {selectedBackfillIds.length > 0 && (
                <button
                  onClick={bulkConfirmBackfillPayments}
                  className="px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
                  title="批量確認選中的補登記錄"
                >
                  📅 批量確認補登記錄 ({selectedBackfillIds.length})
                </button>
              )}
              
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

      {/* 付款記錄視圖 */}
      <div className="mt-4">
        {sortedPayments.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-lg font-bold text-gray-600">
              {categoryFilter === 'collected' 
                ? '無繳費歷史記錄'
                : categoryFilter === 'overdue'
                ? '無逾期款項'
                : categoryFilter === 'new_tenant'
                ? '無新租客款項'
                : categoryFilter === 'current_month'
                ? '無當月待收款項'
                : '無待收款項'}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {categoryFilter === 'collected' 
                ? '所有已收款的歷史記錄將顯示在此'
                : '所有待收款項將顯示在此'}
            </div>
          </div>
        ) : (
          <PaymentViews
            payments={sortedPayments}
            viewMode={viewMode}
            onCollectPayment={collectPayment}
            onUpdateElectricity={updateElectricityFee}
            onRestorePayment={restorePayment}
            onToggleBackfillSelection={(paymentId, checked) => {
              if (checked) {
                setSelectedBackfillIds(prev => [...prev, paymentId])
              } else {
                setSelectedBackfillIds(prev => prev.filter(id => id !== paymentId))
              }
            }}
            selectedBackfillIds={selectedBackfillIds}
            lang={state.lang}
          />
        )}
      </div>
    </div>
  )
}