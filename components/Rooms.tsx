'use client'

import { t } from '@/lib/translations'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { useState, useMemo, useEffect } from 'react'
import { Room, RoomStatus, CheckInPaymentType, CheckOutType } from '@/lib/types'

interface RoomsProps {
  property: any
}

export default function Rooms({ property }: RoomsProps) {
  const { state, updateState, updateData, openModal } = useApp()
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'table'>('table')
  const [filterStatus, setFilterStatus] = useState<RoomStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 檢查房間狀態（入住日自動轉換）
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD格式
    
    let hasChanges = false
    const updatedRooms = property.rooms.map((room: Room) => {
      // 檢查待入住的房間
      if ((room.s === 'pending_checkin_paid' || room.s === 'pending_checkin_unpaid') && room.in) {
        const checkInDate = room.in
        
        // 如果入住日期已到或已過
        if (checkInDate <= today) {
          hasChanges = true
          
          // 根據當前狀態決定新狀態
          let newStatus: RoomStatus
          switch (room.s) {
            case 'pending_checkin_paid':
              // 已結清：轉為已出租
              newStatus = 'occupied'
              break
            case 'pending_checkin_unpaid':
              // 尚未結清：轉為待入住（尚未結清）- 保持不變，但標記為已到期
              newStatus = 'pending_checkin_unpaid'
              break
            default:
              newStatus = room.s
          }
          
          return {
            ...room,
            s: newStatus,
            // 標記入住日期已到
            checkInDatePassed: checkInDate <= today
          }
        }
      }
      
      return room
    })
    
    // 如果有變更，更新資料
    if (hasChanges) {
      const updatedProperties = (state.data?.properties || []).map(p => 
        p.id === property.id
          ? { ...p, rooms: updatedRooms }
          : p
      )
      
      updateData({ properties: updatedProperties })
    }
  }, [property.id, property.rooms, state.data.properties, updateData])

  // 計算統計資料（支持單一物業，為多物業擴展做準備）
  // 未來擴展：當選擇「全部物業」時，計算所有物業的合併統計
  /*
  const calculateAllPropertiesStats = (properties: any[]) => {
    return properties.reduce((acc, property) => {
      const rooms = property.rooms || []
      return {
        total: acc.total + rooms.length,
        available: acc.available + rooms.filter(r => r.s === 'available').length,
        pending_checkin_paid: acc.pending_checkin_paid + rooms.filter(r => 
          r.s === 'pending_checkin_paid' || r.s === 'fully_paid'
        ).length,
        pending_checkin_unpaid: acc.pending_checkin_unpaid + rooms.filter(r => 
          r.s === 'pending_checkin_unpaid' || 
          r.s === 'deposit_paid' || 
          r.s === 'reserved' || 
          r.s === 'pending_payment'
        ).length,
        occupied: acc.occupied + rooms.filter(r => r.s === 'occupied').length,
        maintenance: acc.maintenance + rooms.filter(r => r.s === 'maintenance').length,
        totalRent: acc.totalRent + rooms.reduce((sum, r) => sum + (r.r || 0), 0),
        totalDeposit: acc.totalDeposit + rooms.reduce((sum, r) => sum + (r.d || 0), 0),
      }
    }, {
      total: 0, available: 0, pending_checkin_paid: 0, pending_checkin_unpaid: 0,
      occupied: 0, maintenance: 0, totalRent: 0, totalDeposit: 0
    })
  }
  */
  
  const stats = useMemo(() => {
    const rooms = (property.rooms || []).filter((r: Room) => !r.archived)
    
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
      total: rooms.length,
      available: rooms.filter((r: Room) => r.s === 'available').length,
      pending_checkin_paid: pendingCheckinPaid,
      pending_checkin_unpaid: pendingCheckinUnpaid,
      occupied: rooms.filter((r: Room) => r.s === 'occupied').length,
      maintenance: rooms.filter((r: Room) => r.s === 'maintenance').length,
      totalRent: rooms.reduce((sum: number, r: Room) => sum + (r.r || 0), 0),
      totalDeposit: rooms.reduce((sum: number, r: Room) => sum + (r.d || 0), 0),
      // 為多物業擴展準備的字段
      propertyName: property.name || '未命名物業',
      propertyCount: 1, // 當前只有一個物業
    }
  }, [property.rooms, property.name])

  // 過濾房間
  const filteredRooms = useMemo(() => {
    let rooms = property.rooms || []
    
    // 過濾掉已歸檔的房間
    rooms = rooms.filter((r: Room) => !r.archived)
    
    // 狀態過濾
    if (filterStatus !== 'all') {
      if (filterStatus === 'pending_checkin_unpaid') {
        // 待入住（尚未結清）：包含多種舊狀態
        rooms = rooms.filter((r: Room) => 
          r.s === 'pending_checkin_unpaid' ||
          r.s === 'deposit_paid' ||
          r.s === 'reserved' ||
          r.s === 'pending_payment'
        )
      } else if (filterStatus === 'pending_checkin_paid') {
        // 待入住（已結清）：包含舊狀態
        rooms = rooms.filter((r: Room) => 
          r.s === 'pending_checkin_paid' ||
          r.s === 'fully_paid'
        )
      } else {
        // 其他狀態：直接匹配
        rooms = rooms.filter((r: Room) => r.s === filterStatus)
      }
    }
    
    // 搜尋過濾
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      rooms = rooms.filter((r: Room) => 
        r.n.toLowerCase().includes(query) ||
        (r.t || '').toLowerCase().includes(query) ||
        (r.p || '').includes(query)
      )
    }
    
    return rooms
  }, [property.rooms, filterStatus, searchQuery])

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

  // 處理入住操作
  const handleCheckIn = (roomId: number) => {
    openModal('checkIn', roomId)
  }

  // 處理退房操作
  const handleCheckOut = (roomId: number) => {
    openModal('checkOut', roomId)
  }

  // 處理續租
  const handleRenewLease = (roomId: number) => {
    openModal('renewLease', roomId)
  }

  // 處理刪除房間
  const handleDeleteRoom = (roomId: number) => {
    openModal('deleteRoom', roomId)
  }

  // 處理補繳操作
  const handleCompletePayment = (roomId: number) => {
    openModal('completePayment', roomId)
  }

  // 處理取消預訂
  const handleCancelReservation = (roomId: number) => {
    if (!confirm(t('confirmCancelReservation', state.lang))) return
    
    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: p.rooms.map(r => 
              r.id === roomId
                ? { ...r, s: 'available' as RoomStatus, t: undefined, p: undefined, in: undefined }
                : r
            )
          }
        : p
    )
    
       updateData({ properties: updatedProperties })
  }

  // 處理房間狀態變更
  const handleChangeRoomStatus = (roomId: number, newStatus: RoomStatus) => {
    const room = property.rooms.find((r: Room) => r.id === roomId)
    if (!room) return
    
    let confirmMessage = ''
    switch (newStatus) {
      case 'maintenance':
        confirmMessage = `確定要將房間 ${room.n} 設為「維修中/無法出租」狀態嗎？`
        break
      case 'available':
        if (room.s === 'maintenance') {
          confirmMessage = `確定要將房間 ${room.n} 恢復為「可出租」狀態嗎？`
        }
        break
      default:
        confirmMessage = `確定要將房間 ${room.n} 的狀態變更為「${t(newStatus, state.lang)}」嗎？`
    }
    
    if (confirmMessage && !confirm(confirmMessage)) return
    
    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: p.rooms.map(r => 
              r.id === roomId
                ? { 
                    ...r, 
                    s: newStatus,
                    // 如果設為維修中，清除租客資訊
                    ...(newStatus === 'maintenance' ? { 
                      t: undefined, 
                      p: undefined, 
                      in: undefined, 
                      out: undefined 
                    } : {}),
                    // 如果從維修中恢復為可出租，保留基本資訊
                    ...(room.s === 'maintenance' && newStatus === 'available' ? {
                      t: undefined,
                      p: undefined,
                      in: undefined,
                      out: undefined
                    } : {})
                  }
                : r
            )
          }
        : p
    )
    
    // 同步後端
    const _apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
    const _syncRoom = property.rooms.find((r: Room) => r.id === roomId)
    if (_syncRoom) {
      fetch(_apiUrl + '/rooms/' + roomId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          floor: _syncRoom.f,
          room_number: _syncRoom.n,
          monthly_rent: _syncRoom.r,
          deposit: _syncRoom.d,
          status: newStatus,
          tenant_name: newStatus === 'maintenance' ? null : (_syncRoom.t || null),
          check_in_date: _syncRoom.in || null,
          check_out_date: _syncRoom.out || null,
          current_meter: _syncRoom.cm || 0,
          previous_meter: _syncRoom.pm || 0
        })
      }).catch(e => console.error('狀態同步失敗:', e))
    }

    updateData({ properties: updatedProperties })
  }

  // 計算電費
  const calculateElectricityFee = (room: Room) => {
    if (room.s !== 'occupied') return 0
    const usage = (room.cm || 0) - (room.pm || 0)
    return Math.max(0, usage) * state.data.electricityRate
  }

  // 計算合約剩餘天數
  const calculateDaysRemaining = (room: Room) => {
    if (!room.out || room.s !== 'occupied') return null
    const endDate = new Date(room.out)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6">
      {/* 固定統計顯示面板 */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>🏢</span>
            房間狀態統計
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({property.name || '未命名物業'})
            </span>
          </h2>
          <div className="text-sm text-gray-500">
            總房間數：{stats.total} 間 | 出租率：{stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%
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
                  ({filteredRooms.length} 間房間)
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

      {/* 控制面板 */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 視圖模式 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded ${viewMode === 'table' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              📊 {t('tableView', state.lang)}
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded ${viewMode === 'card' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              🏠 {t('cardView', state.lang)}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'text-gray-600'}`}
            >
              📋 {t('listView', state.lang)}
            </button>
          </div>

          {/* 搜尋框 */}
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('searchRooms', state.lang)}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 新增房間按鈕 */}
          <button 
            onClick={() => {
              const password = prompt(t('enterPasswordToAddRoom', state.lang), '')
              if (password !== '123456') {
                alert(t('incorrectPassword', state.lang))
                return
              }
              openModal('addRoom')
            }}
            className="btn btn-primary whitespace-nowrap"
          >
            ➕ {t('addRoom', state.lang)}
          </button>
        </div>
      </div>

      {/* 房間列表 - 表格視圖 */}
      {viewMode === 'table' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('roomNumber', state.lang)}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('status', state.lang)}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('monthlyRent', state.lang)}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('tenantName', state.lang)}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('moveInDate', state.lang)}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('contractEnd', state.lang)}</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t('actions', state.lang)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRooms.map((room: Room) => {
                  const daysRemaining = calculateDaysRemaining(room)
                  const electricityFee = calculateElectricityFee(room)
                  
                  return (
                    <tr key={room.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-bold">{room.n}</div>
                        <div className="text-xs text-gray-500">
                          {property.name || '未命名物業'} • {room.f}F
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(room.s)}`}>
                          {getStatusIcon(room.s)} {t(room.s, state.lang)}
                        </span>
                        {daysRemaining !== null && daysRemaining <= 30 && (
                          <div className="text-xs text-red-600 mt-1">
                            ⏳ {daysRemaining} {t('daysToExpire', state.lang)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-blue-600">{formatCurrency(room.r)}</div>
                        <div className="text-xs text-gray-500">
                          {t('deposit', state.lang)}: {formatCurrency(room.d || 0)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{room.t || '-'}</div>
                        <div className="text-xs text-gray-500">{room.p || ''}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{room.in ? formatDate(room.in) : '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{room.out ? formatDate(room.out) : '-'}</div>
                        {electricityFee > 0 && (
                          <div className="text-xs text-orange-600">
                            ⚡ {formatCurrency(electricityFee)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {room.s === 'available' && (
                            <>
                              <button
                                onClick={() => handleCheckIn(room.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                {t('checkIn', state.lang)}
                              </button>
                              <button
                                onClick={() => handleDeleteRoom(room.id)}
                                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                title="刪除房間（僅限空屋）"
                              >
                                🗑️ 刪除
                              </button>
                            </>
                          )}
                          
                          {room.s === 'reserved' && (
                            <>
                              <button
                                onClick={() => handleCompletePayment(room.id)}
                                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                              >
                                {t('completePayment', state.lang)}
                              </button>
                              <button
                                onClick={() => handleCancelReservation(room.id)}
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
                                onClick={() => handleCompletePayment(room.id)}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                title={room.s === 'pending_checkin_paid' || room.s === 'fully_paid' ? '查看付款記錄' : '補繳租金'}
                              >
                                {room.s === 'pending_checkin_paid' || room.s === 'fully_paid' ? '📋 查看' : '💰 補繳'}
                              </button>
                              <button
                                onClick={() => openModal('roomDetail', room.id)}
                                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                title="房間詳情"
                              >
                                👁️ 詳情
                              </button>
                            </>
                          )}
                          
                          {room.s === 'pending_payment' && (
                            <button
                              onClick={() => handleCompletePayment(room.id)}
                              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                            >
                              {t('completePayment', state.lang)}
                            </button>
                          )}
                          
                          {room.s === 'occupied' && (
                            <>
                              <button
                                onClick={() => handleRenewLease(room.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                title="續租（押金不動）"
                              >
                                🔄 續租
                              </button>
                              <button
                                onClick={() => handleCheckOut(room.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                {t('checkOut', state.lang)}
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => openModal('roomDetail', room.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            {t('details', state.lang)}
                          </button>
                          
                          <button
                            onClick={() => openModal('editRoom', room.id)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            title="編輯房間詳情"
                          >
                            ✏️ {t('edit', state.lang)}
                          </button>
                          
                          {/* 狀態管理按鈕 */}
                          {room.s !== 'maintenance' && room.s !== 'occupied' && (
                            <button
                              onClick={() => handleChangeRoomStatus(room.id, 'maintenance')}
                              className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
                              title="設為維修中/無法出租"
                            >
                              🔧 維修中
                            </button>
                          )}
                          
                          {room.s === 'maintenance' && (
                            <button
                              onClick={() => handleChangeRoomStatus(room.id, 'available')}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              title="恢復為可出租"
                            >
                              ✅ 恢復出租
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {filteredRooms.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {t('noRoomsFound', state.lang)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 房間列表 - 卡片視圖 */}
      {viewMode === 'card' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRooms.map((room: Room) => {
            const daysRemaining = calculateDaysRemaining(room)
            const electricityFee = calculateElectricityFee(room)
            
            return (
              <div key={room.id} className="card">
                {/* 房間標頭 */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-xl font-bold">
                      {room.n} ({room.f}F)
                    </div>
                    <div className="text-sm text-gray-600">
                      {room.t || t('forRent', state.lang)}
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(room.s)}`}>
                    {getStatusIcon(room.s)} {t(room.s, state.lang)}
                  </span>
                </div>

                {/* 租金資訊 */}
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

                {/* 租客資訊 */}
                {room.s === 'occupied' && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-2">{t('tenantInfo', state.lang)}</div>
                    <div className="text-sm space-y-1">
                      <div>📞 {room.p}</div>
                      <div>📅 {t('moveInDate', state.lang)}: {room.in ? formatDate(room.in) : '-'}</div>
                      <div>📅 {t('contractEnd', state.lang)}: {room.out ? formatDate(room.out) : '-'}</div>
                      {daysRemaining !== null && daysRemaining <= 30 && (
                        <div className="text-red-600 font-medium">
                          ⏳ {daysRemaining} {t('daysToExpire', state.lang)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 電費資訊 */}
                {room.s === 'occupied' && electricityFee > 0 && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium mb-1">{t('electricityInfo', state.lang)}</div>
                    <div className="text-sm">
                      <div>⚡ {t('currentMeter', state.lang)}: {room.cm || 0}</div>
                      <div>💰 {t('electricityFee', state.lang)}: {formatCurrency(electricityFee)}</div>
                    </div>
                  </div>
                )}

                {/* 操作按鈕 */}
                <div className="flex flex-wrap gap-2">
                  {room.s === 'available' && (
                    <>
                      <button
                        onClick={() => handleCheckIn(room.id)}
                        className="flex-1 btn btn-primary text-sm"
                      >
                        {t('checkIn', state.lang)}
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="flex-1 btn bg-gray-600 text-white text-sm"
                        title="刪除房間（僅限空屋）"
                      >
                        🗑️ 刪除
                      </button>
                    </>
                  )}
                  
                  {room.s === 'reserved' && (
                    <>
                      <button
                        onClick={() => handleCompletePayment(room.id)}
                        className="flex-1 btn bg-yellow-600 text-white text-sm"
                      >
                        {t('completePayment', state.lang)}
                      </button>
                      <button
                        onClick={() => handleCancelReservation(room.id)}
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
                        onClick={() => handleCompletePayment(room.id)}
                        className="flex-1 btn bg-blue-600 text-white text-sm"
                        title={room.s === 'pending_checkin_paid' || room.s === 'fully_paid' ? '查看付款記錄' : '補繳租金'}
                      >
                        {room.s === 'pending_checkin_paid' || room.s === 'fully_paid' ? '📋 查看' : '💰 補繳'}
                      </button>
                      <button
                        onClick={() => openModal('roomDetail', room.id)}
                        className="flex-1 btn bg-gray-600 text-white text-sm"
                        title="房間詳情"
                      >
                        👁️ 詳情
                      </button>
                    </>
                  )}
                  
                  {room.s === 'pending_payment' && (
                    <button
                      onClick={() => handleCompletePayment(room.id)}
                      className="flex-1 btn bg-yellow-600 text-white text-sm"
                    >
                      {t('completePayment', state.lang)}
                    </button>
                  )}
                  
                  {room.s === 'occupied' && (
                    <>
                      <button
                        onClick={() => handleRenewLease(room.id)}
                        className="flex-1 btn bg-green-600 text-white text-sm"
                        title="續租（押金不動）"
                      >
                        🔄 續租
                      </button>
                      <button
                        onClick={() => handleCheckOut(room.id)}
                        className="flex-1 btn bg-red-600 text-white text-sm"
                      >
                        {t('checkOut', state.lang)}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => openModal('roomDetail', room.id)}
                    className="flex-1 btn bg-blue-600 text-white text-sm"
                  >
                    {t('details', state.lang)}
                  </button>
                  
                  <button
                    onClick={() => openModal('editRoom', room.id)}
                    className="flex-1 btn bg-blue-600 text-white text-sm"
                    title="編輯房間詳情"
                  >
                    ✏️ {t('edit', state.lang)}
                  </button>
                  
                  {/* 狀態管理按鈕 */}
                  {room.s !== 'maintenance' && room.s !== 'occupied' && (
                    <button
                      onClick={() => handleChangeRoomStatus(room.id, 'maintenance')}
                      className="flex-1 btn bg-orange-600 text-white text-sm"
                      title="設為維修中/無法出租"
                    >
                      🔧 維修中
                    </button>
                  )}
                  
                  {room.s === 'maintenance' && (
                    <button
                      onClick={() => handleChangeRoomStatus(room.id, 'available')}
                      className="flex-1 btn bg-green-600 text-white text-sm"
                      title="恢復為可出租"
                    >
                      ✅ 恢復出租
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 房間列表 - 列表視圖 */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {filteredRooms.map((room: Room) => {
            const daysRemaining = calculateDaysRemaining(room)
            const electricityFee = calculateElectricityFee(room)
            
            return (
              <div key={room.id} className="card flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(room.s).split(' ')[0]}`}></div>
                  <div>
                    <div className="font-bold">
                      {room.n} ({room.f}F) - {formatCurrency(room.r)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {property.name || '未命名物業'} • {room.t || t('forRent', state.lang)} • {t(room.s, state.lang)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {room.s === 'available' && (
                    <>
                      <button
                        onClick={() => handleCheckIn(room.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                      >
                        {t('checkIn', state.lang)}
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
                        title="刪除房間（僅限空屋）"
                      >
                        🗑️ 刪除
                      </button>
                    </>
                  )}
                  
                  {room.s === 'occupied' && (
                    <button
                      onClick={() => handleCheckOut(room.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                    >
                      {t('checkOut', state.lang)}
                    </button>
                  )}
                  
                  <button
                    onClick={() => openModal('roomDetail', room.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    {t('details', state.lang)}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 空狀態 */}
      {filteredRooms.length === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold mb-4">{t('noRoomsFound', state.lang)}</h2>
          <p className="text-gray-600 mb-6">{t('noRoomsFoundDescription', state.lang)}</p>
          <button 
            onClick={() => {
              const password = prompt(t('enterPasswordToAddRoom', state.lang), '')
              if (password !== '123456') {
                alert(t('incorrectPassword', state.lang))
                return
              }
              openModal('addRoom')
            }}
            className="btn btn-primary"
          >
            ➕ {t('addFirstRoom', state.lang)}
          </button>
        </div>
      )}
    </div>
  )
}