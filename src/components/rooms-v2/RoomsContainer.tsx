'use client'

import { useState, useMemo } from 'react'
import { SimpleRoom } from '@/src/types/simple'
import RoomStats from './RoomStats'
import RoomFilters from './RoomFilters'
import RoomsView from './RoomsView'
import { useRooms } from '@/src/hooks/useRooms'

interface RoomsContainerProps {
  propertyId: string
}

export default function RoomsContainer({ propertyId }: RoomsContainerProps) {
  const { rooms, loading, error, refetch, updateRoom } = useRooms(propertyId)
  
  // 過濾狀態
  const [filter, setFilter] = useState({
    status: 'all' as 'all' | 'available' | 'occupied' | 'maintenance',
    search: ''
  })
  
  // 視圖模式
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  
  // 過濾後的房間
  const filteredRooms = useMemo(() => {
    if (!rooms) return []
    
    return rooms.filter(room => {
      // 狀態過濾
      if (filter.status !== 'all' && room.status !== filter.status) {
        return false
      }
      
      // 搜尋過濾
      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        const roomNumber = room.number.toLowerCase()
        const tenantName = room.tenant?.name?.toLowerCase() || ''
        
        if (!roomNumber.includes(searchLower) && !tenantName.includes(searchLower)) {
          return false
        }
      }
      
      return true
    })
  }, [rooms, filter])
  
  // 處理房間操作
  const handleRoomAction = async (
    roomId: string, 
    action: 'checkin' | 'checkout' | 'edit' | 'maintenance',
    data?: any
  ) => {
    try {
      let updates: Partial<SimpleRoom> = {}
      
      switch (action) {
        case 'checkin':
          updates = {
            status: 'occupied',
            tenant: data.tenant,
            lease: {
              checkInDate: data.checkInDate,
              checkOutDate: data.checkOutDate
            }
          }
          break
          
        case 'checkout':
          updates = {
            status: 'available',
            tenant: undefined,
            lease: undefined
          }
          break
          
        case 'edit':
          updates = data
          break
          
        case 'maintenance':
          updates = {
            status: 'maintenance'
          }
          break
      }
      
      const result = await updateRoom(roomId, updates)
      if (result.success) {
        console.log(`房間 ${roomId} ${action} 操作成功`)
      } else {
        console.error(`房間 ${roomId} ${action} 操作失敗:`, result.error)
      }
    } catch (error) {
      console.error(`房間操作錯誤:`, error)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">載入中...</div>
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
    <div className="rooms-container space-y-6">
      {/* 統計卡片 */}
      <RoomStats rooms={rooms || []} />
      
      {/* 過濾器 */}
      <RoomFilters 
        filter={filter}
        onFilterChange={setFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {/* 房間視圖 */}
      <RoomsView
        rooms={filteredRooms}
        viewMode={viewMode}
        onRoomAction={handleRoomAction}
      />
      
      {/* 操作提示 */}
      <div className="text-sm text-gray-500 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>空房可出租</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>已出租入住中</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>維修中不可出租</span>
        </div>
      </div>
    </div>
  )
}