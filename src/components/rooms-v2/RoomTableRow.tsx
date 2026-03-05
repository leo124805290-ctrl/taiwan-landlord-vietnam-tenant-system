'use client'

import { SimpleRoom } from '@/src/types/simple'
import { useState } from 'react'

interface RoomTableRowProps {
  room: SimpleRoom
  onRoomAction: (
    roomId: string, 
    action: 'checkin' | 'checkout' | 'edit' | 'maintenance',
    data?: any
  ) => void
}

export default function RoomTableRow({ room, onRoomAction }: RoomTableRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const getStatusColor = (status: SimpleRoom['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'occupied': return 'bg-blue-100 text-blue-800'
      case 'maintenance': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusText = (status: SimpleRoom['status']) => {
    switch (status) {
      case 'available': return '空房可出租'
      case 'occupied': return '已出租入住中'
      case 'maintenance': return '維修中'
      default: return '未知狀態'
    }
  }
  
  const getElectricityInfo = () => {
    if (!room.electricity) return '無電費資訊'
    
    const { currentMeter, lastMeter, rate, lastUpdated } = room.electricity
    const usage = currentMeter - lastMeter
    const fee = usage * rate
    
    return (
      <div className="text-sm">
        <div>本期: {currentMeter} 度</div>
        <div>上期: {lastMeter} 度</div>
        <div>使用: {usage} 度</div>
        <div className="font-medium">費用: ${fee.toLocaleString()}</div>
        {lastUpdated && (
          <div className="text-xs text-gray-500">更新: {lastUpdated}</div>
        )}
      </div>
    )
  }
  
  return (
    <tr 
      className={`hover:bg-gray-50 transition-colors ${isHovered ? 'bg-gray-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 房號 / 樓層 */}
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{room.number}</div>
        <div className="text-sm text-gray-500">{room.floor}樓</div>
        <div className="text-xs text-gray-400 mt-1">ID: {room.id.substring(0, 8)}</div>
      </td>
      
      {/* 狀態 */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
          {getStatusText(room.status)}
        </span>
        <div className="text-xs text-gray-500 mt-1">
          創建: {new Date(room.createdAt).toLocaleDateString('zh-TW')}
        </div>
      </td>
      
      {/* 租金 / 押金 */}
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">
          ${room.monthlyRent.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          押金: ${room.deposit.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-1">月租金</div>
      </td>
      
      {/* 租客資訊 */}
      <td className="px-4 py-3">
        {room.tenant ? (
          <div>
            <div className="font-medium text-gray-900">{room.tenant.name}</div>
            <div className="text-sm text-gray-600">{room.tenant.phone}</div>
          </div>
        ) : (
          <div className="text-gray-400">無租客</div>
        )}
      </td>
      
      {/* 入住期間 */}
      <td className="px-4 py-3">
        {room.lease ? (
          <div>
            <div className="text-sm">
              <span className="font-medium">入住:</span> {room.lease.checkInDate}
            </div>
            <div className="text-sm">
              <span className="font-medium">到期:</span> {room.lease.checkOutDate}
            </div>
          </div>
        ) : (
          <div className="text-gray-400">無租約</div>
        )}
      </td>
      
      {/* 電費資訊 */}
      <td className="px-4 py-3">
        {getElectricityInfo()}
      </td>
      
      {/* 操作 */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          {room.status === 'available' && (
            <button
              onClick={() => onRoomAction(room.id, 'checkin')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              入住
            </button>
          )}
          
          {room.status === 'occupied' && (
            <button
              onClick={() => onRoomAction(room.id, 'checkout')}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              退房
            </button>
          )}
          
          <button
            onClick={() => onRoomAction(room.id, 'edit')}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
          >
            編輯
          </button>
          
          {room.status !== 'maintenance' ? (
            <button
              onClick={() => onRoomAction(room.id, 'maintenance')}
              className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
            >
              設為維修
            </button>
          ) : (
            <button
              onClick={() => onRoomAction(room.id, 'edit', { status: 'available' })}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              恢復可用
            </button>
          )}
        </div>
        
        {/* 備註 */}
        {room.notes && (
          <div className="mt-2 text-xs text-gray-500 max-w-[200px] truncate" title={room.notes}>
            📝 {room.notes}
          </div>
        )}
      </td>
    </tr>
  )
}