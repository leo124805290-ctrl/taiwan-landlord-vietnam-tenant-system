'use client'

import { useMemo } from 'react'
import { SimpleRoom } from '@/src/types/simple'

interface RoomStatsProps {
  rooms: SimpleRoom[]
}

export default function RoomStats({ rooms }: RoomStatsProps) {
  const stats = useMemo(() => {
    const total = rooms.length
    const available = rooms.filter(r => r.status === 'available').length
    const occupied = rooms.filter(r => r.status === 'occupied').length
    const maintenance = rooms.filter(r => r.status === 'maintenance').length
    
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0
    const totalRent = rooms.reduce((sum, room) => sum + room.monthlyRent, 0)
    
    return {
      total,
      available,
      occupied,
      maintenance,
      occupancyRate,
      totalRent
    }
  }, [rooms])
  
  return (
    <div className="room-stats grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {/* 總房間數 */}
      <div className="stat-card bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-indigo-600">🏢</div>
          <div className="text-sm font-medium text-gray-700">總房間數</div>
        </div>
        <div className="text-2xl font-bold text-indigo-700">{stats.total}</div>
        <div className="text-xs text-gray-500 mt-1">間</div>
      </div>
      
      {/* 空房 */}
      <div className="stat-card bg-green-50 border border-green-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-green-600">✅</div>
          <div className="text-sm font-medium text-gray-700">空房可出租</div>
        </div>
        <div className="text-2xl font-bold text-green-700">{stats.available}</div>
        <div className="text-xs text-gray-500 mt-1">間</div>
      </div>
      
      {/* 已出租 */}
      <div className="stat-card bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-blue-600">🏠</div>
          <div className="text-sm font-medium text-gray-700">已出租入住中</div>
        </div>
        <div className="text-2xl font-bold text-blue-700">{stats.occupied}</div>
        <div className="text-xs text-gray-500 mt-1">間</div>
      </div>
      
      {/* 維修中 */}
      <div className="stat-card bg-orange-50 border border-orange-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-orange-600">🔧</div>
          <div className="text-sm font-medium text-gray-700">維修中</div>
        </div>
        <div className="text-2xl font-bold text-orange-700">{stats.maintenance}</div>
        <div className="text-xs text-gray-500 mt-1">間</div>
      </div>
      
      {/* 出租率 */}
      <div className="stat-card bg-purple-50 border border-purple-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-purple-600">📊</div>
          <div className="text-sm font-medium text-gray-700">出租率</div>
        </div>
        <div className="text-2xl font-bold text-purple-700">{stats.occupancyRate}%</div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.occupied}/{stats.total}
        </div>
      </div>
      
      {/* 總月租金 */}
      <div className="stat-card bg-teal-50 border border-teal-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-teal-600">💰</div>
          <div className="text-sm font-medium text-gray-700">總月租金</div>
        </div>
        <div className="text-2xl font-bold text-teal-700">
          ${stats.totalRent.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-1">元/月</div>
      </div>
    </div>
  )
}