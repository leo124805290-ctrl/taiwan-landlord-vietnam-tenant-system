'use client'

import { t } from '@/lib/translations'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { useState, useMemo } from 'react'
import { Room, RoomStatus, CheckInPaymentType, CheckOutType } from '@/lib/types'

interface RoomsProps {
  property: any
}

export default function Rooms({ property }: RoomsProps) {
  const { state, updateState, updateData, openModal } = useApp()
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'table'>('table')
  const [filterStatus, setFilterStatus] = useState<RoomStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // 計算統計資料
  const stats = useMemo(() => {
    const rooms = property.rooms || []
    return {
      total: rooms.length,
      available: rooms.filter((r: Room) => r.s === 'available').length,
      reserved: rooms.filter((r: Room) => r.s === 'reserved').length,
      pendingPayment: rooms.filter((r: Room) => r.s === 'pending_payment').length,
      occupied: rooms.filter((r: Room) => r.s === 'occupied').length,
      maintenance: rooms.filter((r: Room) => r.s === 'maintenance').length,
      totalRent: rooms.reduce((sum: number, r: Room) => sum + (r.r || 0), 0),
      totalDeposit: rooms.reduce((sum: number, r: Room) => sum + (r.d || 0), 0),
    }
  }, [property.rooms])

  // 過濾房間
  const filteredRooms = useMemo(() => {
    let rooms = property.rooms || []
    
    // 狀態過濾
    if (filterStatus !== 'all') {
      rooms = rooms.filter((r: Room) => r.s === filterStatus)
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
      case 'available': return 'bg-green-100 text-green-700'
      case 'reserved': return 'bg-blue-100 text-blue-700'
      case 'pending_payment': return 'bg-yellow-100 text-yellow-700'
      case 'occupied': return 'bg-purple-100 text-purple-700'
      case 'maintenance': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  // 獲取狀態圖標
  const getStatusIcon = (status: RoomStatus) => {
    switch (status) {
      case 'available': return '🟢'
      case 'reserved': return '📅'
      case 'pending_payment': return '⏳'
      case 'occupied': return '✅'
      case 'maintenance': return '🔧'
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

  // 處理補繳操作
  const handleCompletePayment = (roomId: number) => {
    openModal('completePayment', roomId)
  }

  // 處理取消預訂
  const handleCancelReservation = (roomId: number) => {
    if (!confirm(t('confirmCancelReservation', state.lang))) return
    
    const updatedProperties = state.data.properties.map(p => 
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
    
    const updatedProperties = state.data.properties.map(p => 
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
      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">{t('total', state.lang)}</div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">{t('rooms', state.lang)}</div>
        </div>
        
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">{t('occupied', state.lang)}</div>
          <div className="text-2xl font-bold text-purple-600">{stats.occupied}</div>
          <div className="text-xs text-gray-500 mt-1">{t('rentedRooms', state.lang)}</div>
        </div>
        
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">{t('available', state.lang)}</div>
          <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          <div className="text-xs text-gray-500 mt-1">{t('vacantRooms', state.lang)}</div>
        </div>
        
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">{t('totalRent', state.lang)}</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRent)}</div>
          <div className="text-xs text-gray-500 mt-1">{t('monthly', state.lang)}</div>
        </div>
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

          {/* 狀態過濾 */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              {t('all', state.lang)}
            </button>
            {(['available', 'reserved', 'pending_payment', 'occupied', 'maintenance'] as RoomStatus[]).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded ${filterStatus === status ? getStatusColor(status) : 'bg-gray-200'}`}
              >
                {getStatusIcon(status)} {t(status, state.lang)}
              </button>
            ))}
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
                        <div className="text-xs text-gray-500">{room.f}F</div>
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
                            <button
                              onClick={() => handleCheckIn(room.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              {t('checkIn', state.lang)}
                            </button>
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
                          
                          {room.s === 'pending_payment' && (
                            <button
                              onClick={() => handleCompletePayment(room.id)}
                              className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                            >
                              {t('completePayment', state.lang)}
                            </button>
                          )}
                          
                          {room.s === 'occupied' && (
                            <button
                              onClick={() => handleCheckOut(room.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                            >
                              {t('checkOut', state.lang)}
                            </button>
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
                    <button
                      onClick={() => handleCheckIn(room.id)}
                      className="flex-1 btn btn-primary text-sm"
                    >
                      {t('checkIn', state.lang)}
                    </button>
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
                  
                  {room.s === 'pending_payment' && (
                    <button
                      onClick={() => handleCompletePayment(room.id)}
                      className="flex-1 btn bg-yellow-600 text-white text-sm"
                    >
                      {t('completePayment', state.lang)}
                    </button>
                  )}
                  
                  {room.s === 'occupied' && (
                    <button
                      onClick={() => handleCheckOut(room.id)}
                      className="flex-1 btn bg-red-600 text-white text-sm"
                    >
                      {t('checkOut', state.lang)}
                    </button>
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
                      {room.t || t('forRent', state.lang)} • {t(room.s, state.lang)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {room.s === 'available' && (
                    <button
                      onClick={() => handleCheckIn(room.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      {t('checkIn', state.lang)}
                    </button>
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