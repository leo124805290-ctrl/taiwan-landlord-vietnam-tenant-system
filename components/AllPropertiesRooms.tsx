'use client'

import { t } from '@/lib/translations'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { useState, useMemo, useEffect } from 'react'
import { Room, RoomStatus } from '@/lib/types'

interface AllPropertiesRoomsProps {
  properties: any[]
}

export default function AllPropertiesRooms({ properties }: AllPropertiesRoomsProps) {
  const { state, updateState, updateData, openModal } = useApp()
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'table'>('table')
  const [filterStatus, setFilterStatus] = useState<RoomStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 獲取所有物業的所有房間（帶物業信息）
  const allRooms = useMemo(() => {
    return properties.flatMap(property => 
      (property.rooms || []).map((room: Room) => ({
        ...room,
        propertyName: property.name || '未命名物業',
        propertyId: property.id
      }))
    )
  }, [properties])

  // 計算所有物業的統計資料
  const stats = useMemo(() => {
    return properties.reduce((acc, property) => {
      const rooms = property.rooms || []
      
      // 計算新狀態統計
      const pendingCheckinPaid = rooms.filter((r: Room) => 
        r.s === 'pending_checkin_paid' || r.s === 'fully_paid'
      ).length
      
      const pendingCheckinUnpaid = rooms.filter((r: Room) => 
        r.s === 'pending_checkin_unpaid' || 
        r.s === 'deposit_paid' || 
        r.s === 'reserved' || 
        r.s === 'pending_payment'
      ).length
      
      return {
        total: acc.total + rooms.length,
        available: acc.available + rooms.filter((r: Room) => r.s === 'available').length,
        pending_checkin_paid: acc.pending_checkin_paid + pendingCheckinPaid,
        pending_checkin_unpaid: acc.pending_checkin_unpaid + pendingCheckinUnpaid,
        occupied: acc.occupied + rooms.filter((r: Room) => r.s === 'occupied').length,
        maintenance: acc.maintenance + rooms.filter((r: Room) => r.s === 'maintenance').length,
        totalRent: acc.totalRent + rooms.reduce((sum: number, r: Room) => sum + (r.r || 0), 0),
        totalDeposit: acc.totalDeposit + rooms.reduce((sum: number, r: Room) => sum + (r.d || 0), 0),
      }
    }, {
      total: 0,
      available: 0,
      pending_checkin_paid: 0,
      pending_checkin_unpaid: 0,
      occupied: 0,
      maintenance: 0,
      totalRent: 0,
      totalDeposit: 0
    })
  }, [properties])

  // 獲取狀態顏色
  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 text-emerald-700'
      case 'pending_checkin_unpaid': return 'bg-blue-100 text-blue-700'
      case 'pending_checkin_paid': return 'bg-yellow-100 text-yellow-700'
      case 'occupied': return 'bg-green-100 text-green-700'
      case 'maintenance': return 'bg-gray-100 text-gray-700'
      // 兼容舊狀態
      case 'reserved': return 'bg-orange-100 text-orange-700'
      case 'deposit_paid': return 'bg-blue-100 text-blue-700'
      case 'fully_paid': return 'bg-yellow-100 text-yellow-700'
      case 'pending_payment': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // 獲取狀態圖標
  const getStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case 'available': return '🟢'
      case 'pending_checkin_unpaid': return '💵'
      case 'pending_checkin_paid': return '💰'
      case 'occupied': return '✅'
      case 'maintenance': return '🔧'
      // 兼容舊狀態
      case 'reserved': return '📅'
      case 'deposit_paid': return '💵'
      case 'fully_paid': return '💰'
      case 'pending_payment': return '⏳'
      default: return '⚪'
    }
  }

  // 篩選房間
  const filteredRooms = useMemo(() => {
    let rooms = allRooms
    
    // 狀態篩選
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending_checkin_unpaid') {
        // 待入住（尚未結清）：包含多種舊狀態
        rooms = rooms.filter((r: any) => 
          r.s === 'pending_checkin_unpaid' ||
          r.s === 'deposit_paid' ||
          r.s === 'reserved' ||
          r.s === 'pending_payment'
        )
      } else if (filterStatus === 'pending_checkin_paid') {
        // 待入住（已結清）：包含舊狀態
        rooms = rooms.filter((r: any) => 
          r.s === 'pending_checkin_paid' ||
          r.s === 'fully_paid'
        )
      } else {
        // 其他狀態：直接匹配
        rooms = rooms.filter((r: any) => r.s === filterStatus)
      }
    }
    
    // 搜索篩選
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      rooms = rooms.filter((r: any) => 
        r.n.toLowerCase().includes(query) ||
        (r.t || '').toLowerCase().includes(query) ||
        (r.p || '').includes(query) ||
        (r.propertyName || '').toLowerCase().includes(query)
      )
    }
    
    return rooms
  }, [allRooms, filterStatus, searchQuery])

  // 處理入住
  const handleCheckIn = (roomId: string, propertyId: string) => {
    // 先切換到對應的物業
    updateState({ currentProperty: parseInt(propertyId) })
    // 然後打開入住模態框
    openModal('checkIn', roomId)
  }

  // 處理完成付款
  const handleCompletePayment = (roomId: string, propertyId: string) => {
    updateState({ currentProperty: parseInt(propertyId) })
    openModal('completePayment', roomId)
  }

  // 處理取消預訂
  const handleCancelReservation = (roomId: string, propertyId: string) => {
    updateState({ currentProperty: parseInt(propertyId) })
    openModal('cancelReservation', roomId)
  }

  // 處理退房
  const handleCheckOut = (roomId: string, propertyId: string) => {
    updateState({ currentProperty: parseInt(propertyId) })
    openModal('checkOut', roomId)
  }

  // 處理續租
  const handleRenewLease = (roomId: string, propertyId: string) => {
    updateState({ currentProperty: parseInt(propertyId) })
    openModal('renewLease', roomId)
  }

  // 處理維修
  const handleMaintenance = (roomId: string, propertyId: string) => {
    updateState({ currentProperty: parseInt(propertyId) })
    openModal('maintenance', roomId)
  }

  // 處理恢復出租
  const handleRestore = (roomId: string, propertyId: string) => {
    updateState({ currentProperty: parseInt(propertyId) })
    openModal('restore', roomId)
  }

  // 計算電費
  const calculateElectricityFee = (room: any) => {
    if (!room.cm || !room.pm || !state.data.electricityRate) return 0
    return (room.cm - room.pm) * state.data.electricityRate
  }

  return (
    <div className="space-y-6">
      {/* 固定統計顯示面板 - 所有物業 */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🏢</span>
            全部物業房間狀態統計
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({properties.length} 個物業)
            </span>
          </h2>
          <div className="text-sm text-gray-500">
            總房間數：{stats.total} 間 | 總出租率：{stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {/* 總房間數 - 可點擊篩選（顯示全部） */}
          <button
            onClick={() => setFilterStatus('all')}
            className={`bg-indigo-50 p-3 rounded-lg border ${filterStatus === 'all' ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-indigo-200'} hover:bg-indigo-100 transition-colors`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-indigo-600">🏢</span>
              <div className="text-sm font-medium">總房間數</div>
            </div>
            <div className="text-2xl font-bold text-indigo-700">{stats.total}</div>
            <div className="text-xs text-gray-500">間</div>
          </button>
          
          {/* 已出租入住中 - 可點擊篩選 */}
          <button
            onClick={() => setFilterStatus('occupied')}
            className={`bg-green-50 p-3 rounded-lg border ${filterStatus === 'occupied' ? 'border-green-400 ring-2 ring-green-200' : 'border-green-200'} hover:bg-green-100 transition-colors`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-green-600">✅</span>
              <div className="text-sm font-medium">已出租入住中</div>
            </div>
            <div className="text-2xl font-bold text-green-700">{stats.occupied}</div>
            <div className="text-xs text-gray-500">間</div>
          </button>
          
          {/* 待入住（已結清） - 可點擊篩選 */}
          <button
            onClick={() => setFilterStatus('pending_checkin_paid')}
            className={`bg-yellow-50 p-3 rounded-lg border ${filterStatus === 'pending_checkin_paid' ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-yellow-200'} hover:bg-yellow-100 transition-colors`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-yellow-600">💰</span>
              <div className="text-sm font-medium">待入住（已結清）</div>
            </div>
            <div className="text-2xl font-bold text-yellow-700">{stats.pending_checkin_paid}</div>
            <div className="text-xs text-gray-500">間</div>
          </button>
          
          {/* 待入住（尚未結清） - 可點擊篩選 */}
          <button
            onClick={() => setFilterStatus('pending_checkin_unpaid')}
            className={`bg-blue-50 p-3 rounded-lg border ${filterStatus === 'pending_checkin_unpaid' ? 'border-blue-400 ring-2 ring-blue-200' : 'border-blue-200'} hover:bg-blue-100 transition-colors`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-blue-600">💵</span>
              <div className="text-sm font-medium">待入住（尚未結清）</div>
            </div>
            <div className="text-2xl font-bold text-blue-700">{stats.pending_checkin_unpaid}</div>
            <div className="text-xs text-gray-500">間</div>
          </button>
          
          {/* 空屋可出租 - 可點擊篩選 */}
          <button
            onClick={() => setFilterStatus('available')}
            className={`bg-emerald-50 p-3 rounded-lg border ${filterStatus === 'available' ? 'border-emerald-400 ring-2 ring-emerald-200' : 'border-emerald-200'} hover:bg-emerald-100 transition-colors`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-emerald-600">🟢</span>
              <div className="text-sm font-medium">空屋可出租</div>
            </div>
            <div className="text-2xl font-bold text-emerald-700">{stats.available}</div>
            <div className="text-xs text-gray-500">間</div>
          </button>
          
          {/* 維修中 - 可點擊篩選 */}
          <button
            onClick={() => setFilterStatus('maintenance')}
            className={`bg-gray-100 p-3 rounded-lg border ${filterStatus === 'maintenance' ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-300'} hover:bg-gray-200 transition-colors`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-600">🔧</span>
              <div className="text-sm font-medium">維修中</div>
            </div>
            <div className="text-2xl font-bold text-gray-700">{stats.maintenance}</div>
            <div className="text-xs text-gray-500">間</div>
          </button>
        </div>
        
        {/* 篩選狀態提示 */}
        {filterStatus !== 'all' && (
          <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-600">🔍</span>
                <span>正在篩選：</span>
                <span className="font-bold">
                  {(filterStatus as string) === 'all' ? '全部房間' :
                   filterStatus === 'occupied' ? '已出租入住中' :
                   filterStatus === 'pending_checkin_paid' ? '待入住（已結清）' :
                   filterStatus === 'pending_checkin_unpaid' ? '待入住（尚未結清）' :
                   filterStatus === 'available' ? '空屋可出租' :
                   filterStatus === 'maintenance' ? '維修中' : filterStatus as string}
                </span>
                <span className="text-gray-500">
                  ({filteredRooms.length} 間房間，來自 {new Set(filteredRooms.map(r => r.propertyId)).size} 個物業)
                </span>
              </div>
              <button
                onClick={() => setFilterStatus('all')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                清除篩選
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 搜索和視圖控制 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜尋房間號碼、租客姓名、電話或物業名稱..."
            className="w-full px-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4">
          {/* 視圖模式切換 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded ${viewMode === 'table' ? 'bg-white shadow' : ''}`}
            >
              📋
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-1 rounded ${viewMode === 'card' ? 'bg-white shadow' : ''}`}
            >
              🃏
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              📝
            </button>
          </div>
        </div>
      </div>

      {/* 房間列表 */}
      {viewMode === 'table' ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">房間 / 物業</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">狀態</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">租客資訊</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">租金 / 訂金</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">入住期間</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      {searchQuery.trim() ? '沒有找到符合搜尋條件的房間' : '暫無房間資料'}
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room: any) => {
                    const electricityFee = calculateElectricityFee(room)
                    return (
                      <tr key={`${room.propertyId}-${room.id}`} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-bold">{room.n}</div>
                          <div className="text-xs text-gray-500">
                            {room.propertyName} • {room.f}F
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(room.s)}`}>
                            {getStatusIcon(room.s)} {t(room.s, state.lang)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold">{room.t || t('forRent', state.lang)}</div>
                          <div className="text-xs text-gray-500">{room.p || ''}</div>
                          {room.idn && (
                            <div className="text-xs text-gray-500">{t('idNumber', state.lang)}: {room.idn}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-blue-600">{formatCurrency(room.r)}</div>
                          <div className="text-xs text-gray-500">
                            {t('deposit', state.lang)}: {formatCurrency(room.d || 0)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            {room.in ? `${t('checkIn', state.lang)}: ${formatDate(room.in)}` : ''}
                          </div>
                          <div className="text-sm">
                            {room.out ? `${t('checkOut', state.lang)}: ${formatDate(room.out)}` : ''}
                          </div>
                          {electricityFee > 0 && (
                            <div className="text-xs text-orange-600">
                              ⚡ {formatCurrency(electricityFee)}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {room.s === 'available' && (
                              <button
                                onClick={() => handleCheckIn(room.id, room.propertyId)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                {t('checkIn', state.lang)}
                              </button>
                            )}
                            
                            {room.s === 'reserved' && (
                              <>
                                <button
                                  onClick={() => handleCompletePayment(room.id, room.propertyId)}
                                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                                >
                                  {t('completePayment', state.lang)}
                                </button>
                                <button
                                  onClick={() => handleCancelReservation(room.id, room.propertyId)}
                                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                >
                                  {t('cancelReservation', state.lang)}
                                </button>
                              </>
                            )}
                            
                            {(room.s === 'pending_checkin_unpaid' || room.s === 'pending_checkin_paid' || 
                              room.s === 'deposit_paid' || room.s === 'fully_paid') && (
                              <>
                                <button
                                  onClick={() => handleCompletePayment(room.id, room.propertyId)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                  title={room.s === 'pending_checkin_paid' || room.s === 'fully_paid' ? '查看付款記錄' : '補繳租金'}
                                >
                                  {room.s === 'pending_checkin_paid' || room.s === 'fully_paid' ? '📋 查看' : '💰 補繳'}
                                </button>
                                <button
                                  onClick={() => {
                                    updateState({ currentProperty: parseInt(room.propertyId) })
                                    openModal('roomDetail', room.id)
                                  }}
                                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                  title="房間詳情"
                                >
                                  👁️ 詳情
                                </button>
                              </>
                            )}
                            
                            {room.s === 'pending_payment' && (
                              <button
                                onClick={() => handleCompletePayment(room.id, room.propertyId)}
                                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                              >
                                {t('completePayment', state.lang)}
                              </button>
                            )}
                            
                            {room.s === 'occupied' && (
                              <>
                                <button
                                  onClick={() => handleRenewLease(room.id, room.propertyId)}
                                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                  title="續租（押金不動）"
                                >
                                  🔄 續租
                                </button>
                                <button
                                  onClick={() => handleCheckOut(room.id, room.propertyId)}
                                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                >
                                  {t('checkOut', state.lang)}
                                </button>
                              </>
                            )}
                            
                            {room.s === 'maintenance' && (
                              <button
                                onClick={() => handleRestore(room.id, room.propertyId)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                {t('restore', state.lang)}
                              </button>
                            )}
                            
                            {(room.s === 'available' || room.s === 'occupied') && (
                              <button
                                onClick={() => handleMaintenance(room.id, room.propertyId)}
                                className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                              >
                                {t('maintenance', state.lang)}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-lg font-bold mb-2">
                {searchQuery.trim() ? '沒有找到符合搜尋條件的房間' : '暫無房間資料'}
              </h3>
            </div>
          ) : (
            filteredRooms.map((room: any) => {
              const electricityFee = calculateElectricityFee(room)
              return (
                <div key={`${room.propertyId}-${room.id}`} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(room.s).split(' ')[0]}`}></div>
                      <div>
                        <div className="font-bold">
                          {room.n} ({room.f}F) - {formatCurrency(room.r)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {room.propertyName} • {room.t || t('forRent', state.lang)} • {t(room.s, state.lang)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {room.s === 'available' && (
                        <button
                          onClick={() => handleCheckIn(room.id, room.propertyId)}
                          className="flex-1 btn btn-primary text-sm"
                        >
                          {t('checkIn', state.lang)}
                        </button>
                      )}
                      
                      {room.s === 'reserved' && (
                        <>
                          <button
                            onClick={() => handleCompletePayment(room.id, room.propertyId)}
                            className="flex-1 btn bg-yellow-600 text-white text-sm"
                          >
                            {t('completePayment', state.lang)}
                          </button>
                          <button
                            onClick={() => handleCancelReservation(room.id, room.propertyId)}
                            className="flex-1 btn bg-gray-600 text-white text-sm"
                          >
                            {t('cancelReservation', state.lang)}
                          </button>
                        </>
                      )}
                      
                      {(room.s === 'pending_checkin_unpaid' || room.s === 'pending_checkin_paid' || 
                        room.s === 'deposit_paid' || room.s === 'fully_paid') && (
                        <>
                          <button
                            onClick={() => handleCompletePayment(room.id, room.propertyId)}
                            className="flex-1 btn bg-blue-600 text-white text-sm"
                            title={room.s === 'pending_checkin_paid' || room.s === 'fully_paid' ? '查看付款記錄' : '補繳租金'}
                          >
                            {room.s === 'pending_checkin_paid' || room.s === 'fully_paid' ? '📋 查看' : '💰 補繳'}
                          </button>
                          <button
                            onClick={() => {
                              updateState({ currentProperty: parseInt(room.propertyId) })
                              openModal('roomDetail', room.id)
                            }}
                            className="flex-1 btn bg-gray-600 text-white text-sm"
                            title="房間詳情"
                          >
                            👁️ 詳情
                          </button>
                        </>
                      )}
                      
                      {room.s === 'pending_payment' && (
                        <button
                          onClick={() => handleCompletePayment(room.id, room.propertyId)}
                          className="flex-1 btn bg-yellow-600 text-white text-sm"
                        >
                          {t('completePayment', state.lang)}
                        </button>
                      )}
                      
                      {room.s === 'occupied' && (
                        <>
                          <button
                            onClick={() => handleRenewLease(room.id, room.propertyId)}
                            className="flex-1 btn bg-green-600 text-white text-sm"
                            title="續租（押金不動）"
                          >
                            🔄 續租
                          </button>
                          <button
                            onClick={() => handleCheckOut(room.id, room.propertyId)}
                            className="flex-1 btn bg-red-600 text-white text-sm"
                          >
                            {t('checkOut', state.lang)}
                          </button>
                        </>
                      )}
                      
                      {room.s === 'maintenance' && (
                        <button
                          onClick={() => handleRestore(room.id, room.propertyId)}
                          className="flex-1 btn bg-green-600 text-white text-sm"
                        >
                          {t('restore', state.lang)}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600">{t('monthlyRent', state.lang)}</div>
                      <div className="text-xl font-bold text-blue-600">{formatCurrency(room.r)}</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600">{t('deposit', state.lang)}</div>
                      <div className="text-xl font-bold text-green-600">{formatCurrency(room.d || 0)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div className="font-medium">{room.t || t('forRent', state.lang)}</div>
                      <div className="text-gray-600">{room.p || ''}</div>
                      {room.idn && (
                        <div className="text-gray-600">{t('idNumber', state.lang)}: {room.idn}</div>
                      )}
                    </div>
                    
                    <div className="text-sm">
                      {room.in && (
                        <div>📅 {t('checkIn', state.lang)}: {formatDate(room.in)}</div>
                      )}
                      {room.out && (
                        <div>📅 {t('checkOut', state.lang)}: {formatDate(room.out)}</div>
                      )}
                    </div>
                    
                    {electricityFee > 0 && (
                      <div className="bg-orange-50 p-2 rounded">
                        <div className="text-sm">
                          <div>⚡ {t('currentMeter', state.lang)}: {room.cm || 0}</div>
                          <div>💰 {t('electricityFee', state.lang)}: {formatCurrency(electricityFee)}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      ) : (
        // 列表視圖
        <div className="card">
          <div className="divide-y divide-gray-200">
            {filteredRooms.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                {searchQuery.trim() ? '沒有找到符合搜尋條件的房間' : '暫無房間資料'}
              </div>
            ) : (
              filteredRooms.map((room: any) => {
                const electricityFee = calculateElectricityFee(room)
                return (
                  <div key={`${room.propertyId}-${room.id}`} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(room.s).split(' ')[0]}`}></div>
                        <div>
                          <div className="font-bold">
                            {room.n} ({room.f}F) - {formatCurrency(room.r)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {room.propertyName} • {room.t || t('forRent', state.lang)} • {t(room.s, state.lang)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {room.s === 'available' && (
                          <button
                            onClick={() => handleCheckIn(room.id, room.propertyId)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            {t('checkIn', state.lang)}
                          </button>
                        )}
                        
                        {room.s === 'reserved' && (
                          <>
                            <button
                              onClick={() => handleCompletePayment(room.id, room.propertyId)}
                              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                            >
                              {t('completePayment', state.lang)}
                            </button>
                            <button
                              onClick={() => handleCancelReservation(room.id, room.propertyId)}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              {t('cancelReservation', state.lang)}
                            </button>
                          </>
                        )}
                        
                        {(room.s === 'pending_checkin_unpaid' || room.s === 'pending_checkin_paid' || 
                          room.s === 'deposit_paid' || room.s === 'fully_paid') && (
                          <>
                            <button
                              onClick={() => handleCompletePayment(room.id, room.propertyId)}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              title={room.s === 'pending_checkin_paid' || room.s === 'fully_paid' ? '查看付款記錄' : '補繳租金'}
                            >
                              {room.s === 'pending_checkin_paid' || room.s === 'fully_paid' ? '📋 查看' : '💰 補繳'}
                            </button>
                            <button
                              onClick={() => {
                                updateState({ currentProperty: room.propertyId })
                                openModal('roomDetail', room.id)
                              }}
                              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                              title="房間詳情"
                            >
                              👁️ 詳情
                            </button>
                          </>
                        )}
                        
                        {room.s === 'pending_payment' && (
                          <button
                            onClick={() => handleCompletePayment(room.id, room.propertyId)}
                            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                          >
                            {t('completePayment', state.lang)}
                          </button>
                        )}
                        
                        {room.s === 'occupied' && (
                          <>
                            <button
                              onClick={() => handleRenewLease(room.id, room.propertyId)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              title="續租（押金不動）"
                            >
                              🔄 續租
                            </button>
                            <button
                              onClick={() => handleCheckOut(room.id, room.propertyId)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              {t('checkOut', state.lang)}
                            </button>
                          </>
                        )}
                        
                        {room.s === 'maintenance' && (
                          <button
                            onClick={() => handleRestore(room.id, room.propertyId)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            {t('restore', state.lang)}
                          </button>
                        )}
                        
                        {(room.s === 'available' || room.s === 'occupied') && (
                          <button
                            onClick={() => handleMaintenance(room.id, room.propertyId)}
                            className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                          >
                            {t('maintenance', state.lang)}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      {room.in && <span>入住: {formatDate(room.in)}</span>}
                      {room.out && <span className="ml-4">退房: {formatDate(room.out)}</span>}
                      {electricityFee > 0 && (
                        <span className="ml-4">電費: {formatCurrency(electricityFee)}</span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}