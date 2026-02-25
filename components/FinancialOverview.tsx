'use client'

import { t } from '@/lib/translations'
import { formatCurrency } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { useState, useMemo } from 'react'
import { Room } from '@/lib/types'

interface FinancialOverviewProps {
  properties: any[]
}

export default function FinancialOverview({ properties }: FinancialOverviewProps) {
  const { state, updateState, openModal } = useApp()
  const [selectedProperty, setSelectedProperty] = useState<'all' | number>('all')
  
  // 獲取當前顯示的物業
  const currentProperties = useMemo(() => {
    console.log('FinancialOverview - 收到的物業數據:', properties)
    console.log('FinancialOverview - 物業數量:', properties.length)
    console.log('FinancialOverview - 選擇的物業:', selectedProperty)
    
    if (selectedProperty === 'all') {
      return properties
    }
    const filtered = properties.filter(p => p.id === selectedProperty)
    console.log('FinancialOverview - 過濾後物業:', filtered.length)
    return filtered
  }, [properties, selectedProperty])
  
  // 獲取所有房間
  const allRooms = useMemo(() => {
    return currentProperties.flatMap(property => 
      (property.rooms || []).map((room: Room) => ({
        ...room,
        propertyName: property.name || '未命名物業',
        propertyId: property.id
      }))
    )
  }, [currentProperties])
  
  // 計算財務統計
  const financialStats = useMemo(() => {
    // 1. 租金收入潛力（全部房間）
    const totalRentPotential = allRooms.reduce((sum, room) => 
      sum + (room.r || 0), 0
    )
    
    // 2. 當月應收租金（已入住房間）
    const currentMonthExpectedRent = allRooms.reduce((sum, room) => {
      if (room.s === 'occupied' || 
          room.s === 'pending_checkin_paid' || 
          room.s === 'pending_checkin_unpaid') {
        return sum + (room.r || 0)
      }
      return sum
    }, 0)
    
    // 3. 押金統計
    const depositStats = allRooms.reduce((acc, room) => {
      const deposit = room.d || 0
      
      if (room.s === 'occupied') {
        // 已入住押金
        acc.occupiedDeposit += deposit
      } else if (room.s === 'pending_checkin_paid') {
        // 預付押金
        acc.prepaidDeposit += deposit
      }
      // 待入住未付押金不計算（還沒收到）
      
      return acc
    }, { 
      occupiedDeposit: 0, 
      prepaidDeposit: 0,
      totalDeposit: 0 
    })
    
    depositStats.totalDeposit = depositStats.occupiedDeposit + depositStats.prepaidDeposit
    
    // 4. 逾期未繳統計（簡單版本，後續從付款記錄計算）
    const overdueStats = {
      count: 0,
      amount: 0,
      rooms: [] as any[]
    }
    
    // 5. 租約到期統計（簡單版本）
    const today = new Date()
    const sevenDaysLater = new Date(today)
    sevenDaysLater.setDate(today.getDate() + 7)
    
    const thirtyDaysLater = new Date(today)
    thirtyDaysLater.setDate(today.getDate() + 30)
    
    const leaseExpiryStats = allRooms.reduce((acc, room) => {
      if (room.out) {
        const expiryDate = new Date(room.out)
        
        if (expiryDate <= sevenDaysLater && expiryDate >= today) {
          acc.expiringIn7Days.push(room)
        } else if (expiryDate <= thirtyDaysLater && expiryDate > sevenDaysLater) {
          acc.expiringIn30Days.push(room)
        }
      }
      return acc
    }, { 
      expiringIn7Days: [] as any[], 
      expiringIn30Days: [] as any[] 
    })
    
    return {
      totalRentPotential,
      currentMonthExpectedRent,
      depositStats,
      overdueStats,
      leaseExpiryStats,
      totalRooms: allRooms.length,
      occupiedRooms: allRooms.filter(r => r.s === 'occupied').length,
      propertiesCount: currentProperties.length
    }
  }, [allRooms])
  
  // 處理物業切換
  const handlePropertyChange = (propertyId: 'all' | number) => {
    setSelectedProperty(propertyId)
  }
  
  // 查看逾期詳情
  const handleViewOverdueDetails = () => {
    // 後續實現：顯示逾期房間列表
    openModal('overdueDetails')
  }
  
  // 查看到期詳情
  const handleViewExpiryDetails = (type: '7days' | '30days') => {
    // 後續實現：顯示到期房間列表
    openModal('leaseExpiryDetails', { type })
  }
  
  // 查看押金詳情
  const handleViewDepositDetails = (type: 'occupied' | 'prepaid') => {
    // 後續實現：顯示押金詳情
    openModal('depositDetails', { type })
  }
  
  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>💰</span>
          財務總覽
        </h1>
        
        {/* 物業選擇器 */}
        <div className="flex items-center gap-2">
          <select
            value={selectedProperty}
            onChange={(e) => handlePropertyChange(
              e.target.value === 'all' ? 'all' : parseInt(e.target.value)
            )}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">
              📊 {t('allProperties', state.lang)} ({properties.length})
            </option>
            {properties.map(property => (
              <option key={property.id} value={property.id}>
                🏢 {property.name || '未命名物業'}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* 財務統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 租金收入統計 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>💰</span>
              租金收入統計
            </h2>
            <span className="text-sm text-gray-500">
              {selectedProperty === 'all' ? '全部物業' : 
               properties.find(p => p.id === selectedProperty)?.name || '未命名物業'}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-gray-600">租金收入潛力</div>
              <div className="text-xl font-bold text-blue-600">
                {formatCurrency(financialStats.totalRentPotential)}/月
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-gray-600">當月應收租金</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(financialStats.currentMonthExpectedRent)}
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <div className="text-sm text-gray-500 mb-1">房間統計</div>
              <div className="flex justify-between text-sm">
                <div>總房間數：{financialStats.totalRooms} 間</div>
                <div>已出租：{financialStats.occupiedRooms} 間</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 押金管理 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>🏦</span>
              押金管理（保管金）
            </h2>
            <div className="text-sm text-gray-500">
              總保管：{formatCurrency(financialStats.depositStats.totalDeposit)}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>🏠</span>
                <div className="text-gray-600">已入住押金</div>
              </div>
              <div className="text-xl font-bold text-purple-600">
                {formatCurrency(financialStats.depositStats.occupiedDeposit)}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span>💰</span>
                <div className="text-gray-600">預付押金</div>
              </div>
              <div className="text-xl font-bold text-yellow-600">
                {formatCurrency(financialStats.depositStats.prepaidDeposit)}
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <div className="text-sm text-gray-500 mb-2">押金說明</div>
              <div className="text-xs text-gray-600">
                ⚠️ 此為租客財產，需專戶保管。退房時應全額退還（扣除損壞）。
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 提醒區域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 逾期提醒 */}
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-red-700">
              <span>⚠️</span>
              逾期提醒
            </h2>
            <button
              onClick={handleViewOverdueDetails}
              className="text-sm text-red-600 hover:text-red-800"
            >
              查看詳情
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-red-700">
              {financialStats.overdueStats.count > 0 ? (
                <>
                  <div className="font-bold">
                    {financialStats.overdueStats.count} 間未繳
                  </div>
                  <div className="text-lg">
                    共 {formatCurrency(financialStats.overdueStats.amount)}
                  </div>
                  <div className="text-sm mt-1">
                    (20號前需處理)
                  </div>
                </>
              ) : (
                <div className="text-green-600">
                  ✅ 目前無逾期未繳房間
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 租約到期提醒 */}
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2 text-blue-700">
              <span>📅</span>
              租約到期提醒
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleViewExpiryDetails('7days')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                7天內
              </button>
              <button
                onClick={() => handleViewExpiryDetails('30days')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                30天內
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center">
                <div className="text-blue-700">7天內到期</div>
                <div className="font-bold text-blue-800">
                  {financialStats.leaseExpiryStats.expiringIn7Days.length} 間
                </div>
              </div>
              {financialStats.leaseExpiryStats.expiringIn7Days.length > 0 && (
                <div className="text-sm text-blue-600 mt-1">
                  建議：聯繫續租或準備退租
                </div>
              )}
            </div>
            
            <div className="pt-2 border-t border-blue-100">
              <div className="flex justify-between items-center">
                <div className="text-blue-700">30天內到期</div>
                <div className="font-bold text-blue-800">
                  {financialStats.leaseExpiryStats.expiringIn30Days.length} 間
                </div>
              </div>
              {financialStats.leaseExpiryStats.expiringIn30Days.length > 0 && (
                <div className="text-sm text-blue-600 mt-1">
                  建議：提前規劃續租事宜
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 快速操作 */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">快速操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => updateState({ tab: 'rooms' })}
            className="btn bg-blue-600 text-white"
          >
            🏠 前往房間管理
          </button>
          
          <button
            onClick={() => updateState({ tab: 'payments' })}
            className="btn bg-green-600 text-white"
          >
            💰 前往收款管理
          </button>
          
          <button
            onClick={() => openModal('addProperty')}
            className="btn bg-purple-600 text-white"
          >
            🏢 新增物業
          </button>
          
          <button
            onClick={() => openModal('financialReport')}
            className="btn bg-orange-600 text-white"
          >
            📄 財務報表
          </button>
        </div>
      </div>
      
      {/* 統計摘要 */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">統計摘要</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {financialStats.propertiesCount}
            </div>
            <div className="text-sm text-gray-600">物業數</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-green-600">
              {financialStats.totalRooms}
            </div>
            <div className="text-sm text-gray-600">總房間數</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {financialStats.occupiedRooms}
            </div>
            <div className="text-sm text-gray-600">已出租</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(financialStats.depositStats.totalDeposit)}
            </div>
            <div className="text-sm text-gray-600">總保管押金</div>
          </div>
        </div>
      </div>
    </div>
  )
}