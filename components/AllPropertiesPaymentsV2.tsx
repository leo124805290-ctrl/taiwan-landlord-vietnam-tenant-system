'use client'
import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import PaymentStatsPanel from './PaymentStatsPanel'
import PaymentViews from './PaymentViews'
import SuggestionsPanel from './SuggestionsPanel'
import { Payment, Room, Tenant } from '@/lib/types'

// 類型定義
interface Property {
  id: number;
  name: string;
  color?: string;
  payments?: Payment[];
  history?: Payment[];
  rooms?: Room[];
}

interface AllPropertiesPaymentsProps {
  // 可以添加 props 類型
}

export default function AllPropertiesPayments(props: AllPropertiesPaymentsProps) {
  const { state, updateState, updateData } = useApp()
  
  // 視圖模式狀態
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'list'>('table')
  
  // 分類篩選狀態
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'new_tenant' | 'current_month' | 'overdue' | 'collected'>('all')
  
  // 物業篩選狀態
  const [propertyFilter, setPropertyFilter] = useState<string>('all')
  
  // 建議繳費項目狀態
  const [suggestedCharges, setSuggestedCharges] = useState<any[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [generatingPayments, setGeneratingPayments] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  
  // 獲取所有物業
  const allProperties = state.data?.properties || []
  
  // 調試：檢查物業數據
  console.log('=== AllPropertiesPayments 調試 ===')
  console.log('物業數量:', (allProperties || []).length)
  console.log('物業列表:', (allProperties || []).map(p => ({ id: p.id, name: p.name, payments: p.payments?.length || 0, history: p.history?.length || 0 })))
  
  // 獲取所有物業的所有付款記錄
  const getAllPayments = () => {
    const allPaymentsList: Payment[] = [] as Payment[]
    
    (allProperties || []).forEach(property => {
      const propertyPayments = [...(property.payments || []), ...(property.history || [])]
        .map((payment: Payment) => ({
          ...payment,
          propertyId: property.id,
          propertyName: property.name,
          propertyColor: property.color || '#3b82f6' // 默認藍色
        }))
      
      allPayments.push(...propertyPayments)
    })
    
    console.log('總付款記錄數量:', (allPayments || []).length)
    
    return allPayments.sort((a, b) => (b.paid || b.due || '').localeCompare(a.paid || a.due || ''))
  }
  
  const allPayments = getAllPayments()
  
  // 獲取待收款項（未歸檔的 pending 狀態）
  const pendingPayments = (allPayments || []).filter(p => 
    p.s === 'pending' && !p.archived
  )
  
  // 計算建議繳費項目
  const calculateSuggestedCharges = async () => {
    setLoadingSuggestions(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
      const response = await fetch(`${API_URL}/charges/suggested`)
      const data = await response.json()
      
      if (data.success) {
        setSuggestedCharges(data.data.tenants || [])
      } else {
        console.error('計算建議繳費項目失敗:', data.error)
        setSuggestedCharges([])
      }
    } catch (error) {
      console.error('計算建議繳費項目失敗:', error)
      setSuggestedCharges([])
    } finally {
      setLoadingSuggestions(false)
    }
  }
  
  // 生成繳費記錄
  const generatePaymentRecords = async (tenantId: number, chargeTypes: string[]) => {
    setGeneratingPayments(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
      const response = await fetch(`${API_URL}/charges/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          charges: chargeTypes
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`✅ 成功生成 ${data.data.summary.generated_count} 筆繳費記錄，總金額 ${formatCurrency(data.data.summary.total_amount)}`)
        // 重新載入資料
        await updateData({})
        // 重新計算建議項目
        await calculateSuggestedCharges()
      } else {
        alert(`❌ 生成繳費記錄失敗: ${data.error}`)
      }
    } catch (error: any) {
      alert(`❌ 生成繳費記錄失敗: ${error.message}`)
    } finally {
      setGeneratingPayments(false)
    }
  }
  
  // 批量生成所有建議項目
  const generateAllSuggestedCharges = async () => {
    if (suggestedCharges.length === 0) {
      alert('沒有建議繳費項目可生成')
      return
    }
    
    if (!confirm(`確定要生成 ${suggestedCharges.length} 個租客的建議繳費項目嗎？`)) {
      return
    }
    
    setGeneratingPayments(true)
    let totalGenerated = 0
    let totalAmount = 0
    
    try {
      for (const tenant of suggestedCharges) {
        // 為每個租客生成所有建議項目
        const chargeTypes = tenant.suggested_charges.map((charge: any) => charge.type)
        
        if (chargeTypes.length > 0) {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
          const response = await fetch(`${API_URL}/charges/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tenant_id: tenant.id,
              charges: chargeTypes
            })
          })
          
          const data = await response.json()
          if (data.success) {
            totalGenerated += data.data.summary.generated_count
            totalAmount += data.data.summary.total_amount
          }
        }
      }
      
      alert(`✅ 批量生成完成！共生成 ${totalGenerated} 筆繳費記錄，總金額 ${formatCurrency(totalAmount)}`)
      // 重新載入資料
      await updateData({})
      // 重新計算建議項目
      await calculateSuggestedCharges()
      
    } catch (error: any) {
      alert(`❌ 批量生成失敗: ${error.message}`)
    } finally {
      setGeneratingPayments(false)
    }
  }
  
  // 初始化時計算建議項目
  useEffect(() => {
    if (showSuggestions) {
      calculateSuggestedCharges()
    }
  }, [showSuggestions])
  
  // 獲取已收款項（已歸檔的 paid 狀態）
  const collectedPayments = (allPayments || []).filter(p => 
    p.s === 'paid' && p.archived
  )
  
  // 分類篩選邏輯
// @ts-ignore
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
  
  // 物業篩選邏輯
// @ts-ignore
  const filterByProperty = (payment: any) => {
    if (propertyFilter === 'all') return true
    return payment.propertyId === parseInt(propertyFilter)
  }
  
  // 篩選付款記錄
  const filteredPayments = (allPayments || []).filter(payment => {
    // 分類篩選
    if (!filterByCategory(payment)) return false
    
    // 物業篩選
    if (!filterByProperty(payment)) return false
    
    return true
  })
  
  // 排序付款記錄
  const sortedPayments = [...filteredPayments].sort((a, b) => {
    // 先按物業排序
    const propertyCompare = (a.propertyName || '').localeCompare(b.propertyName || '')
    if (propertyCompare !== 0) return propertyCompare
    
    // 再按月份排序
    return (b.m || '').localeCompare(a.m || '')
  })
  
  // 收款函數
// @ts-ignore
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
          lastMeterReading: getLastMeterReading(payment.rid, payment.propertyId),
          propertyId: payment.propertyId
        }
      }
    })
  }
  
  // 獲取房間的上期電錶讀數
  const getLastMeterReading = (roomId: number, propertyId: number) => {
    const property = allProperties.find(p => p.id === propertyId)
    if (!property) return 0
    
// @ts-ignore
    const room = property.rooms.find((r: any) => r.id === roomId)
    if (!room) return 0
    
    return room.lastMeter || room.lm || 0
  }
  
  // 更新電費函數
  const updateElectricityFee = (paymentId: number) => {
    // 這裡可以實現更新電費的功能
    alert('更新電費功能開發中')
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

  
  
  // 計算所有物業的統計數據
  const calculateAllPropertiesStats = () => {
    let totalPreviousOverdueRent = 0
    let totalPreviousOverdueElectricity = 0
    let totalExpectedRent = 0
    let totalCollectedRent = 0
    let totalExpectedDeposit = 0 as number
    let totalCollectedDeposit = 0 as number
    let totalElectricity = 0 as number
    
    (allProperties || []).forEach(property => {
      const rooms = property.rooms || []
      const activeRooms = (rooms || []).filter((room: Room) => !room.archived)
      
      // 前期欠收
      const overduePayments = [...(property.payments || [])].filter(p => 
        p.s === 'pending' && 
        p.due && 
        new Date(p.due) < new Date() &&
        !p.archived
      )
      
      totalPreviousOverdueRent += overduePayments.reduce((sum, p) => sum + (p.r || 0), 0)
      totalPreviousOverdueElectricity += overduePayments.reduce((sum, p) => sum + (p.e || 0), 0)
      
      // 本月應收
      const currentMonth = new Date().toISOString().slice(0, 7).replace('-', '/')
      const currentMonthPayments = [...(property.payments || [])].filter(p => 
        p.m === currentMonth && 
        p.s === 'pending' &&
        !p.archived
      )
      
      // 新租客應收押金
      const newTenantRooms = (activeRooms || []).filter((room: Room) => 
        room.s === 'pending_checkin_unpaid' || room.s === 'reserved'
      )
      
      totalExpectedRent += activeRooms.reduce((sum, room) => {
        if (room.s === 'occupied' || 
            room.s === 'pending_checkin_paid' || 
            room.s === 'pending_checkin_unpaid') {
          return sum + (room.r || 0)
        }
        return sum
      }, 0)
      
      totalCollectedRent += [...(property.payments || []), ...(property.history || [])]
        .filter(p => p.m === currentMonth && p.s === 'paid' && p.paymentType === 'rent')
        .reduce((sum, p) => sum + (p.r || 0), 0)
      
      totalExpectedDeposit += newTenantRooms.reduce((sum, room) => 
        sum + (room.d || 0), 0
      )
      
      totalCollectedDeposit += [...(property.payments || []), ...(property.history || [])]
        .filter(p => p.s === 'paid' && p.paymentType === 'deposit')
        .reduce((sum, p) => sum + (p.total || 0), 0)
      
      totalElectricity += currentMonthPayments.reduce((sum, p) => sum + (p.e || 0), 0)
    })
    
    return {
      previousOverdue: {
        rent: totalPreviousOverdueRent,
        electricity: totalPreviousOverdueElectricity,
        count: (pendingPayments || []).filter(p => 
          p.due && new Date(p.due) < new Date()
        ).length
      },
      currentMonth: {
        expectedRent: totalExpectedRent,
        collectedRent: totalCollectedRent,
        expectedDeposit: totalExpectedDeposit,
        collectedDeposit: totalCollectedDeposit,
        electricity: totalElectricity,
        count: (pendingPayments || []).filter(p => {
          const today = new Date()
          const currentMonth = today.toISOString().slice(0, 7).replace('-', '/')
          return p.m === currentMonth
        }).length
      },
      totalExpected: totalPreviousOverdueRent + totalPreviousOverdueElectricity +
                    totalExpectedRent + totalExpectedDeposit + totalElectricity,
      totalCollected: totalCollectedRent + totalCollectedDeposit,
      collectionRate: (totalPreviousOverdueRent + totalPreviousOverdueElectricity +
                      totalExpectedRent + totalExpectedDeposit + totalElectricity) > 0 ? 
        Math.round((totalCollectedRent + totalCollectedDeposit) / 
                  (totalPreviousOverdueRent + totalPreviousOverdueElectricity +
                   totalExpectedRent + totalExpectedDeposit + totalElectricity) * 100) : 0
    }
  }
  
  const stats = calculateAllPropertiesStats()
  
  return (
    <div className="space-y-6">
      {/* 頁面標題和視圖控制 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span>💰</span>
            全部物業繳費管理
          </h1>
          <div className="text-sm text-gray-500 mt-1">
            共 {(allProperties || []).length} 個物業 • {(pendingPayments || []).length} 筆待收款項
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
          
          {/* 計算建議項目按鈕 */}
          <button
            onClick={calculateSuggestedCharges}
            disabled={loadingSuggestions}
            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm flex items-center gap-1"
            title="計算建議繳費項目"
          >
            {loadingSuggestions ? '🔄 計算中...' : '💡 計算建議項目'}
          </button>
        </div>
      </div>

      {/* 統計面板 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 前期欠收 */}
        <div className="card bg-red-50 border-red-200">
          <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
            <span>📅</span>
            前期欠收款項
            {stats.previousOverdue.count > 0 && (
              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">
                {stats.previousOverdue.count}筆
              </span>
            )}
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">欠收租金：</span>
              <span className="font-bold">{formatCurrency(stats.previousOverdue.rent)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">欠收電費：</span>
              <span className="font-bold">{formatCurrency(stats.previousOverdue.electricity)}</span>
            </div>
            <div className="pt-2 border-t border-red-200 mt-2">
              <div className="flex justify-between font-bold">
                <span>合計：</span>
                <span className="text-red-700">
                  {formatCurrency(stats.previousOverdue.rent + stats.previousOverdue.electricity)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 本月應收 */}
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
            <span>📅</span>
            本月應收款項
            <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
              {stats.currentMonth.count}筆
            </span>
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">應收租金：</span>
              <span className="font-bold">{formatCurrency(stats.currentMonth.expectedRent)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">實收租金：</span>
              <span className="font-bold text-green-600">
                {formatCurrency(stats.currentMonth.collectedRent)}
                <span className="text-xs text-gray-600 ml-1">
                  ({stats.currentMonth.expectedRent > 0 ? 
                    Math.round(stats.currentMonth.collectedRent / stats.currentMonth.expectedRent * 100) : 0}%)
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">應收押金：</span>
              <span className="font-bold">{formatCurrency(stats.currentMonth.expectedDeposit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">實收押金：</span>
              <span className="font-bold text-green-600">
                {formatCurrency(stats.currentMonth.collectedDeposit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">電費金額：</span>
              <span className="font-bold">{formatCurrency(stats.currentMonth.electricity)}</span>
            </div>
            <div className="pt-2 border-t border-blue-200 mt-2">
              <div className="flex justify-between font-bold">
                <span>本月合計：</span>
                <span className="text-blue-700">
                  {formatCurrency(
                    stats.currentMonth.expectedRent + 
                    stats.currentMonth.expectedDeposit + 
                    stats.currentMonth.electricity
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 收款進度 */}
        <div className="card bg-green-50 border-green-200">
          <h3 className="font-bold text-green-700 mb-2 flex items-center gap-2">
            <span>📊</span>
            收款進度
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">總應收：</span>
              <span className="font-bold">{formatCurrency(stats.totalExpected)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">總實收：</span>
              <span className="font-bold text-green-600">
                {formatCurrency(stats.totalCollected)}
              </span>
            </div>
            
            <div className="pt-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>������率</span>
                <span>{stats.collectionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(stats.collectionRate, 100)}%` }}
                ></div>
              </div>
              
              {/* 進度狀態提示 */}
              <div className="mt-2 text-xs">
                {stats.collectionRate >= 90 ? (
                  <div className="text-green-600">✅ 收款狀況良好</div>
                ) : stats.collectionRate >= 70 ? (
                  <div className="text-yellow-600">⚠️ 收款進度正常</div>
                ) : stats.collectionRate >= 50 ? (
                  <div className="text-orange-600">⚠️ 需加強催收</div>
                ) : (
                  <div className="text-red-600">❌ 收款狀況不佳，需立即處理</div>
                )}
              </div>
            </div>
            
            {/* 快速操作 */}
            <div className="pt-3 border-t border-green-200 mt-2">
              <div className="text-xs text-gray-600 mb-1">快速操作</div>
              <div className="flex gap-2">
                <button
                  className="flex-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => {
                    // 這裡可以實現發送催收通知的功能
                    alert('發送催收通知功能開發中')
                  }}
                >
                  📧 發送催收
                </button>
                <button
                  className="flex-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={() => {
                    // 這裡可以實現查看逾期款項的功能
                    alert('查看逾期款項功能開發中')
                  }}
                >
                  ⚠️ 查看逾期
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 物業篩選 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setPropertyFilter('all')}
          className={`px-3 py-2 rounded-lg ${propertyFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          🏢 全部物業
        </button>
        {(allProperties || []).map(property => (
          <button
            key={property.id}
            onClick={() => setPropertyFilter(property.id.toString())}
            className={`px-3 py-2 rounded-lg ${propertyFilter === property.id.toString() ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            style={propertyFilter === property.id.toString() ? { backgroundColor: property.color } : {}}
          >
            {property.name}
          </button>
        ))}
      </div>

      {/* 建議繳費項目面板 */}
      {showSuggestions && (
        <div className="card bg-amber-50 border-amber-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-amber-800 flex items-center gap-2">
              <span>💡</span>
              建議繳費項目
              <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded-full">
                {suggestedCharges.length}個租客
              </span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={calculateSuggestedCharges}
                disabled={loadingSuggestions}
                className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-sm"
              >
                {loadingSuggestions ? '計算中...' : '🔄 重新計算'}
              </button>
              <button
                onClick={generateAllSuggestedCharges}
                disabled={generatingPayments}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-sm"
              >
                {generatingPayments ? '生成中...' : '🚀 批量生成全部'}
              </button>
              <button
                onClick={() => setShowSuggestions(false)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
              >
                ✕ 隱藏
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {suggestedCharges.map((tenant) => {
              const totalAmount = tenant.suggested_charges.reduce((sum: number, charge: any) => sum + charge.amount, 0)
              
              return (
                <div key={tenant.id} className="border border-amber-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-800">
                        {tenant.tenant_name} • {tenant.room_number}
                      </div>
                      <div className="text-sm text-gray-500">
                        入住日期: {tenant.check_in_date} • 
                        月租: {formatCurrency(tenant.rent_amount)} • 
                        押金: {formatCurrency(tenant.deposit_amount)} ({tenant.deposit_status})
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-700">
                        總計: {formatCurrency(totalAmount)}
                      </div>
                      <button
                        onClick={() => {
                          const chargeTypes = tenant.suggested_charges.map((charge: any) => charge.type)
                          generatePaymentRecords(tenant.id, chargeTypes)
                        }}
                        disabled={generatingPayments}
                        className="mt-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-sm"
                      >
                        生成繳費記錄
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {tenant.suggested_charges.map((charge: any, index: number) => (
                      <div key={index} className={`p-3 rounded ${charge.is_urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">
                              {charge.type === 'deposit' ? '🏦 押金' : 
                               charge.type === 'rent' ? '💰 租金' : 
                               '⚡ 電費'}
                              {charge.is_urgent && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">緊急</span>}
                            </div>
                            <div className="text-sm text-gray-600">{charge.reason}</div>
                            {charge.notes && <div className="text-xs text-gray-500">{charge.notes}</div>}
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(charge.amount)}</div>
                            {charge.due_date && (
                              <div className="text-xs text-gray-500">
                                到期: {charge.due_date}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-amber-200 text-sm text-amber-700">
            💡 提示: 這些是系統計算出的建議繳費項目。點擊「生成繳費記錄」後，項目會出現在上方的待收款項中。
          </div>
        </div>
      )}
      
      {/* 如果沒有建議項目但顯示開關打開，顯示提示 */}
      {showSuggestions && suggestedCharges.length === 0 && !loadingSuggestions && (
        <div className="card bg-gray-50 border-gray-200 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-gray-600">
              <span className="font-medium">💡 建議繳費項目</span>
              <span className="ml-2 text-sm">目前沒有建議項目</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={calculateSuggestedCharges}
                disabled={loadingSuggestions}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
              >
                {loadingSuggestions ? '計算中...' : '🔄 重新計算'}
              </button>
              <button
                onClick={() => setShowSuggestions(false)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm"
              >
                ✕ 隱藏
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 如果建議項目被隱藏，顯示恢復按鈕 */}
      {!showSuggestions && (
        <div className="mb-6">
          <button
            onClick={() => {
              setShowSuggestions(true)
              calculateSuggestedCharges()
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2"
          >
            <span>💡</span>
            顯示建議繳費項目
          </button>
        </div>
      )}

      {/* 分類篩選 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-2 rounded-lg ${categoryFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          📋 全部待收 ({(pendingPayments || []).length})
        </button>
        <button
          onClick={() => setCategoryFilter('new_tenant')}
          className={`px-3 py-2 rounded-lg ${categoryFilter === 'new_tenant' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          🆕 新租客款項 ({(pendingPayments || []).filter(p => 
            p.paymentType === 'deposit' || 
            (p.tenantType === 'new' && p.paymentType === 'rent')
          ).length})
        </button>
        <button
          onClick={() => setCategoryFilter('current_month')}
          className={`px-3 py-2 rounded-lg ${categoryFilter === 'current_month' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          👥 舊租客當月 ({(pendingPayments || []).filter(p => {
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
          ⚠️ 逾期款項 ({(pendingPayments || []).filter(p => 
            p.due && 
            new Date(p.due) < new Date()
          ).length})
        </button>
        <button
          onClick={() => setCategoryFilter('collected')}
          className={`px-3 py-2 rounded-lg ${categoryFilter === 'collected' ? 'bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
        >
          📜 繳費歷史 ({(collectedPayments || []).length})
        </button>
      </div>

      {/* 付款記錄視圖 */}
      <div className="mt-4">
        {(sortedPayments || []).length === 0 ? (
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
            lang={state.lang}
          />
        )}
      </div>
    </div>
  )
}

// 格式化貨幣函數
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount)
}