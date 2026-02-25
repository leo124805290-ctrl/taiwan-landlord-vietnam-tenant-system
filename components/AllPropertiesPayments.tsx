'use client'

import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import PaymentStatsPanel from './PaymentStatsPanel'
import PaymentViews from './PaymentViews'

export default function AllPropertiesPayments() {
  const { state, updateState, updateData } = useApp()
  
  // 視圖模式狀態
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'list'>('table')
  
  // 分類篩選狀態
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'new_tenant' | 'current_month' | 'overdue' | 'collected'>('all')
  
  // 物業篩選狀態
  const [propertyFilter, setPropertyFilter] = useState<string>('all')
  
  // 獲取所有物業
  const allProperties = state.data?.properties || []
  
  // 調試：檢查物業數據
  console.log('=== AllPropertiesPayments 調試 ===')
  console.log('物業數量:', allProperties.length)
  console.log('物業列表:', allProperties.map(p => ({ id: p.id, name: p.name, payments: p.payments?.length || 0, history: p.history?.length || 0 })))
  
  // 獲取所有物業的所有付款記錄
  const getAllPayments = () => {
    const allPayments: any[] = []
    
    allProperties.forEach(property => {
      const propertyPayments = [...(property.payments || []), ...(property.history || [])]
        .map((payment: any) => ({
          ...payment,
          propertyId: property.id,
          propertyName: property.name,
          propertyColor: property.color || '#3b82f6' // 默認藍色
        }))
      
      allPayments.push(...propertyPayments)
    })
    
    console.log('總付款記錄數量:', allPayments.length)
    
    return allPayments.sort((a, b) => (b.paid || b.due || '').localeCompare(a.paid || a.due || ''))
  }
  
  const allPayments = getAllPayments()
  
  // 獲取待收款項（未歸檔的 pending 狀態）
  const pendingPayments = allPayments.filter(p => 
    p.s === 'pending' && !p.archived
  )
  
  // 獲取已收款項（已歸檔的 paid 狀態）
  const collectedPayments = allPayments.filter(p => 
    p.s === 'paid' && p.archived
  )
  
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
  
  // 物業篩選邏輯
  const filterByProperty = (payment: any) => {
    if (propertyFilter === 'all') return true
    return payment.propertyId === parseInt(propertyFilter)
  }
  
  // 篩選付款記錄
  const filteredPayments = allPayments.filter(payment => {
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

  // 調試函數：檢查所有物業的付款記錄
  const debugAllPropertiesPayments = () => {
    console.log('=== 全部物業付款記錄調試 ===')
    console.log('總物業數量:', allProperties.length)
    
    // 檢查每個物業的付款記錄
    allProperties.forEach(property => {
      console.log(`\n物業: ${property.name} (ID: ${property.id})`)
      console.log('待付款記錄:', property.payments?.length || 0)
      console.log('歷史記錄:', property.history?.length || 0)
      
      // 檢查逾期記錄
      const allPropertyPayments = [...(property.payments || []), ...(property.history || [])]
      const today = new Date()
      const overduePayments = allPropertyPayments.filter(p => {
        if (p.s !== 'pending' || p.archived) return false
        if (!p.due) return false
        
        const dueDate = new Date(p.due)
        return dueDate < today
      })
      
      console.log('逾期記錄:', overduePayments.length)
      if (overduePayments.length > 0) {
        console.log('逾期詳情:', overduePayments.map(p => ({
          房間: p.n,
          租客: p.t,
          月份: p.m,
          到期日: p.due,
          金額: p.total
        })))
      }
    })
    
    // 檢查全部物業的合併數據
    console.log('\n=== 全部物業合併數據 ===')
    console.log('總付款記錄:', allPayments.length)
    console.log('待收款項:', pendingPayments.length)
    console.log('已收款項:', collectedPayments.length)
    
    alert(`全部物業調試信息已輸出到控制台\n總物業: ${allProperties.length}\n總付款記錄: ${allPayments.length}`)
  }
  
  // 計算所有物業的統計數據
  const calculateAllPropertiesStats = () => {
    let totalPreviousOverdueRent = 0
    let totalPreviousOverdueElectricity = 0
    let totalExpectedRent = 0
    let totalCollectedRent = 0
    let totalExpectedDeposit = 0
    let totalCollectedDeposit = 0
    let totalElectricity = 0
    
    allProperties.forEach(property => {
      const rooms = property.rooms || []
      const activeRooms = rooms.filter((room: any) => !room.archived)
      
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
      const newTenantRooms = activeRooms.filter((room: any) => 
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
        count: pendingPayments.filter(p => 
          p.due && new Date(p.due) < new Date()
        ).length
      },
      currentMonth: {
        expectedRent: totalExpectedRent,
        collectedRent: totalCollectedRent,
        expectedDeposit: totalExpectedDeposit,
        collectedDeposit: totalCollectedDeposit,
        electricity: totalElectricity,
        count: pendingPayments.filter(p => {
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
            共 {allProperties.length} 個物業 • {pendingPayments.length} 筆待收款項
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
            onClick={debugAllPropertiesPayments}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            title="檢查全部物業付款記錄"
          >
            🔍 調試全部
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
                <span>收款率</span>
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
        {allProperties.map(property => (
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
          ✅ 已收款項 ({collectedPayments.length})
        </button>
      </div>

      {/* 付款記錄視圖 */}
      <div className="mt-4">
        {sortedPayments.length === 0 ? (
          <div className="card text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-lg font-bold text-gray-600">
              {categoryFilter === 'collected' 
                ? '無已收款項記錄'
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
                ? '所有收款記錄將顯示在此'
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