'use client'

import { useState, useMemo } from 'react'
import { SimplePayment } from '@/src/types/simple'
import PaymentStats from './PaymentStats'
import PaymentFilters from './PaymentFilters'
import PaymentViews from './PaymentViews'
import { usePayments } from '@/src/hooks/usePayments'

interface PaymentsContainerProps {
  propertyId: string
}

export default function PaymentsContainer({ propertyId }: PaymentsContainerProps) {
  const { payments, loading, error, refetch, updatePayment, confirmPayment } = usePayments(propertyId)
  
  // 過濾狀態
  const [filter, setFilter] = useState({
    status: 'all' as 'all' | 'pending' | 'paid',
    type: 'all' as 'all' | 'rent' | 'deposit' | 'electricity' | 'other',
    search: ''
  })
  
  // 視圖模式
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  
  // 批量選擇
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  
  // 過濾後的付款
  const filteredPayments = useMemo(() => {
    if (!payments) return []
    
    return payments.filter(payment => {
      // 狀態過濾
      if (filter.status !== 'all' && payment.status !== filter.status) {
        return false
      }
      
      // 類型過濾
      if (filter.type !== 'all' && payment.type !== filter.type) {
        return false
      }
      
      // 搜尋過濾
      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        const roomId = payment.roomId.toLowerCase()
        const notes = payment.notes?.toLowerCase() || ''
        
        if (!roomId.includes(searchLower) && !notes.includes(searchLower)) {
          return false
        }
      }
      
      return true
    })
  }, [payments, filter])
  
  // 處理付款操作
  const handlePaymentAction = async (
    paymentId: string | string[],
    action: 'confirm' | 'edit' | 'delete',
    data?: any
  ) => {
    try {
      const paymentIds = Array.isArray(paymentId) ? paymentId : [paymentId]
      
      switch (action) {
        case 'confirm':
          for (const id of paymentIds) {
            await confirmPayment(id, data?.paidDate || new Date().toISOString().split('T')[0])
          }
          break
          
        case 'edit':
          if (!Array.isArray(paymentId)) {
            await updatePayment(paymentId, data)
          }
          break
          
        case 'delete':
          // 實際應該調用刪除API
          console.log('刪除付款:', paymentIds)
          break
      }
      
      // 清除選擇
      if (action === 'confirm') {
        setSelectedPayments([])
      }
      
    } catch (error) {
      console.error(`付款操作錯誤:`, error)
    }
  }
  
  // 處理批量選擇
  const handleSelectPayment = (paymentId: string, selected: boolean) => {
    if (selected) {
      setSelectedPayments(prev => [...prev, paymentId])
    } else {
      setSelectedPayments(prev => prev.filter(id => id !== paymentId))
    }
  }
  
  // 處理全選
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedPayments(filteredPayments.map(p => p.id))
    } else {
      setSelectedPayments([])
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">載入付款資料中...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-700 font-medium">載入錯誤</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
        >
          重新載入
        </button>
      </div>
    )
  }
  
  return (
    <div className="payments-container space-y-6">
      {/* 統計卡片 */}
      <PaymentStats payments={payments || []} />
      
      {/* 過濾器和批量操作 */}
      <PaymentFilters 
        filter={filter}
        onFilterChange={setFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedPayments.length}
        totalCount={filteredPayments.length}
        onSelectAll={() => handleSelectAll(selectedPayments.length !== filteredPayments.length)}
        onBatchConfirm={() => handlePaymentAction(selectedPayments, 'confirm')}
      />
      
      {/* 付款視圖 */}
      <PaymentViews
        payments={filteredPayments}
        viewMode={viewMode}
        selectedPayments={selectedPayments}
        onPaymentAction={handlePaymentAction}
        onSelectPayment={handleSelectPayment}
      />
      
      {/* 操作提示 */}
      <div className="text-sm text-gray-500 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>待付款 (pending)</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>已付款 (paid)</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>補登記錄 (isBackfill: true)</span>
        </div>
      </div>
    </div>
  )
}