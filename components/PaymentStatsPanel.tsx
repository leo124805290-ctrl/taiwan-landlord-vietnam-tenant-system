'use client'

import { formatCurrency } from '@/lib/utils'
import { Payment, Room } from '@/lib/types'

interface PaymentStatsPanelProps {
  property: any
  payments: Payment[]
  rooms: Room[]
}

export default function PaymentStatsPanel({ property, payments, rooms }: PaymentStatsPanelProps) {
  // 過濾掉已歸檔的房間
  const activeRooms = rooms.filter(room => !room.archived)
  
  // 計算統計數據
  const calculateStats = () => {
    // 1. 前期欠收款項（逾期未付）
    const overduePayments = payments.filter(p => 
      p.s === 'pending' && 
      p.due && 
      new Date(p.due) < new Date() &&
      !p.archived
    )
    
    const previousOverdue = {
      rent: overduePayments.reduce((sum, p) => sum + (p.r || 0), 0),
      electricity: overduePayments.reduce((sum, p) => sum + (p.e || 0), 0),
      count: overduePayments.length
    }
    
    // 2. 本月應收款項
    const currentMonth = new Date().toISOString().slice(0, 7).replace('-', '/') // YYYY/MM
    const currentMonthPayments = payments.filter(p => 
      p.m === currentMonth && 
      p.s === 'pending' &&
      !p.archived
    )
    
    // 新租客應收押金
    const newTenantRooms = activeRooms.filter(room => 
      room.s === 'pending_checkin_unpaid' || room.s === 'reserved'
    )
    
    const currentMonthStats = {
      expectedRent: activeRooms.reduce((sum, room) => {
        // 已入住房間和待入住房間都應該收租金
        if (room.s === 'occupied' || 
            room.s === 'pending_checkin_paid' || 
            room.s === 'pending_checkin_unpaid') {
          return sum + (room.r || 0)
        }
        return sum
      }, 0),
      
      collectedRent: payments.filter(p => 
        p.m === currentMonth && 
        p.s === 'paid' && 
        p.paymentType === 'rent'
      ).reduce((sum, p) => sum + (p.r || 0), 0),
      
      expectedDeposit: newTenantRooms.reduce((sum, room) => 
        sum + (room.d || 0), 0
      ),
      
      collectedDeposit: payments.filter(p => 
        p.s === 'paid' && 
        p.paymentType === 'deposit'
      ).reduce((sum, p) => sum + (p.total || 0), 0),
      
      electricity: currentMonthPayments.reduce((sum, p) => sum + (p.e || 0), 0),
      
      count: currentMonthPayments.length
    }
    
    // 3. 計算收款率
    const totalExpected = 
      previousOverdue.rent + previousOverdue.electricity +
      currentMonthStats.expectedRent + currentMonthStats.expectedDeposit + currentMonthStats.electricity
    
    const totalCollected = 
      currentMonthStats.collectedRent + currentMonthStats.collectedDeposit
    
    const collectionRate = totalExpected > 0 ? 
      Math.round((totalCollected / totalExpected) * 100) : 0
    
    return {
      previousOverdue,
      currentMonth: currentMonthStats,
      totalExpected,
      totalCollected,
      collectionRate
    }
  }
  
  const stats = calculateStats()
  
  return (
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
  )
}