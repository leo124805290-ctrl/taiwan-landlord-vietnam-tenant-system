'use client'

import { useState, useMemo } from 'react'
// 本地類型定義
interface SimpleRoom {
  id: string;
  propertyId: string;
  number: string;
  floor: number;
  monthlyRent: number;
  deposit: number;
  status: 'available' | 'occupied' | 'maintenance';
  tenant?: {
    name: string;
    phone: string;
  };
  lease?: {
    checkInDate: string;
    checkOutDate: string;
  };
  createdAt: string;
  updatedAt: string;
}

type SimpleRoomStatus = 'available' | 'occupied' | 'maintenance';

const roomStatusDisplayNames = {
  available: '空房可出租',
  occupied: '已出租',
  maintenance: '維修中'
} as const;

const roomStatusColors = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-blue-100 text-blue-800',
  maintenance: 'bg-orange-100 text-orange-800'
} as const;

import RoomCard from './RoomCard'
import RoomFilters from './RoomFilters'
import RoomActions from './RoomActions'

interface RoomsSimpleProps {
  rooms: SimpleRoom[]
  propertyName?: string
  onRoomAction?: (action: string, roomId: string, data?: any) => void
}

export default function RoomsSimple({ 
  rooms, 
  propertyName = '當前物業',
  onRoomAction 
}: RoomsSimpleProps) {
  const [filterStatus, setFilterStatus] = useState<SimpleRoomStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)

  // 過濾房間
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      // 狀態過濾
      if (filterStatus !== 'all' && room.status !== filterStatus) {
        return false
      }
      
      // 搜索過濾
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          room.number.toLowerCase().includes(query) ||
          room.tenant?.name.toLowerCase().includes(query) ||
          room.tenant?.phone.includes(query)
        )
      }
      
      return true
    })
  }, [rooms, filterStatus, searchQuery])

  // 計算統計
  const stats = useMemo(() => {
    const total = rooms.length
    const available = rooms.filter(r => r.status === 'available').length
    const occupied = rooms.filter(r => r.status === 'occupied').length
    const maintenance = rooms.filter(r => r.status === 'maintenance').length
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0
    
    return { total, available, occupied, maintenance, occupancyRate }
  }, [rooms])

  // 處理房間操作
  const handleRoomAction = (action: string, roomId: string, data?: any) => {
    setSelectedRoomId(roomId)
    
    if (onRoomAction) {
      onRoomAction(action, roomId, data)
    }
    
    // 自動清除選擇（某些操作後）
    if (['check-in', 'check-out', 'delete'].includes(action)) {
      setTimeout(() => setSelectedRoomId(null), 1000)
    }
  }

  return (
    <div className="rooms-simple-container">
      {/* 標題和統計 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {propertyName} - 房間管理
        </h1>
        <div className="flex flex-wrap gap-4">
          <div className="stat-card bg-white p-3 rounded-lg shadow-sm border">
            <div className="text-sm text-gray-500">總房間數</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="stat-card bg-green-50 p-3 rounded-lg shadow-sm border border-green-100">
            <div className="text-sm text-green-600">空房可出租</div>
            <div className="text-2xl font-bold text-green-700">{stats.available}</div>
          </div>
          <div className="stat-card bg-blue-50 p-3 rounded-lg shadow-sm border border-blue-100">
            <div className="text-sm text-blue-600">已出租</div>
            <div className="text-2xl font-bold text-blue-700">{stats.occupied}</div>
          </div>
          <div className="stat-card bg-orange-50 p-3 rounded-lg shadow-sm border border-orange-100">
            <div className="text-sm text-orange-600">維修中</div>
            <div className="text-2xl font-bold text-orange-700">{stats.maintenance}</div>
          </div>
          <div className="stat-card bg-purple-50 p-3 rounded-lg shadow-sm border border-purple-100">
            <div className="text-sm text-purple-600">入住率</div>
            <div className="text-2xl font-bold text-purple-700">{stats.occupancyRate}%</div>
          </div>
        </div>
      </div>

      {/* 過濾器和搜索 */}
      <RoomFilters
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        stats={stats}
      />

      {/* 快速操作 */}
      <RoomActions
        onAddRoom={() => handleRoomAction('add', 'new')}
        onBulkAction={(action) => console.log('批量操作:', action)}
        selectedRoomId={selectedRoomId}
      />

      {/* 房間列表 */}
      <div className="rooms-grid mt-6">
        {filteredRooms.length === 0 ? (
          <div className="empty-state text-center py-12">
            <div className="text-5xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery || filterStatus !== 'all' ? '沒有符合條件的房間' : '還沒有房間'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? '嘗試調整搜索條件或過濾器'
                : '點擊「新增房間」開始添加第一個房間'}
            </p>
            <button
              onClick={() => handleRoomAction('add', 'new')}
              className="btn btn-primary"
            >
              ➕ 新增第一個房間
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                isSelected={selectedRoomId === room.id}
                onSelect={() => setSelectedRoomId(room.id)}
                onAction={handleRoomAction}
              />
            ))}
          </div>
        )}
      </div>

      {/* 選中房間操作面板 */}
      {selectedRoomId && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div>
              <span className="font-medium">已選擇房間: </span>
              <span className="text-blue-600">
                {rooms.find(r => r.id === selectedRoomId)?.number}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-sm" onClick={() => setSelectedRoomId(null)}>
                取消選擇
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => handleRoomAction('edit', selectedRoomId)}
              >
                編輯房間
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}