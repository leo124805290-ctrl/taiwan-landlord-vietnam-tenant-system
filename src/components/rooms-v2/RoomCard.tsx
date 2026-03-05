'use client'

import { SimpleRoom } from '@/src/types/simple'
import { useState } from 'react'

interface RoomCardProps {
  room: SimpleRoom
  onRoomAction: (
    roomId: string, 
    action: 'checkin' | 'checkout' | 'edit' | 'maintenance',
    data?: any
  ) => void
}

export default function RoomCard({ room, onRoomAction }: RoomCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getStatusColor = (status: SimpleRoom['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200'
      case 'occupied': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
    if (!room.electricity) return null
    
    const { currentMeter, lastMeter, rate, lastUpdated } = room.electricity
    const usage = currentMeter - lastMeter
    const fee = usage * rate
    
    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="text-sm font-medium text-gray-700 mb-1">電費資訊</div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-gray-500">本期</div>
            <div className="font-medium">{currentMeter} 度</div>
          </div>
          <div>
            <div className="text-gray-500">上期</div>
            <div className="font-medium">{lastMeter} 度</div>
          </div>
          <div>
            <div className="text-gray-500">使用量</div>
            <div className="font-medium">{usage} 度</div>
          </div>
          <div>
            <div className="text-gray-500">費用</div>
            <div className="font-medium text-green-600">${fee.toLocaleString()}</div>
          </div>
        </div>
        {lastUpdated && (
          <div className="text-xs text-gray-500 mt-2">更新: {lastUpdated}</div>
        )}
      </div>
    )
  }
  
  return (
    <div className={`room-card bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${getStatusColor(room.status)}`}>
      {/* 卡片頭部 */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-gray-900">{room.number}</div>
              <div className="text-sm text-gray-500">{room.floor}樓</div>
            </div>
            <div className="text-xs text-gray-400 mt-1">ID: {room.id.substring(0, 8)}</div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
              {getStatusText(room.status)}
            </span>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              ${room.monthlyRent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">月租金</div>
          </div>
        </div>
        
        {/* 租客資訊 */}
        {room.tenant ? (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="font-medium text-gray-900">{room.tenant.name}</div>
            <div className="text-sm text-gray-600">{room.tenant.phone}</div>
            {room.lease && (
              <div className="text-xs text-gray-500 mt-2">
                <div>入住: {room.lease.checkInDate}</div>
                <div>到期: {room.lease.checkOutDate}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg text-center text-gray-400">
            無租客
          </div>
        )}
        
        {/* 押金資訊 */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-600">押金</div>
          <div className="font-medium">${room.deposit.toLocaleString()}</div>
        </div>
        
        {/* 展開/收起電費資訊 */}
        {room.electricity && (
          <div className="mb-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-800"
            >
              <span>電費資訊 {isExpanded ? '▲' : '▼'}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {isExpanded ? '收起' : '展開'}
              </span>
            </button>
            
            {isExpanded && getElectricityInfo()}
          </div>
        )}
        
        {/* 備註 */}
        {room.notes && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-100 rounded text-sm text-gray-700">
            <div className="font-medium text-yellow-700 mb-1">📝 備註</div>
            <div className="truncate">{room.notes}</div>
          </div>
        )}
      </div>
      
      {/* 操作按鈕 */}
      <div className="border-t border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-2">
          {room.status === 'available' && (
            <button
              onClick={() => onRoomAction(room.id, 'checkin')}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              入住
            </button>
          )}
          
          {room.status === 'occupied' && (
            <button
              onClick={() => onRoomAction(room.id, 'checkout')}
              className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              退房
            </button>
          )}
          
          <button
            onClick={() => onRoomAction(room.id, 'edit')}
            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            編輯
          </button>
          
          {room.status !== 'maintenance' ? (
            <button
              onClick={() => onRoomAction(room.id, 'maintenance')}
              className="px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              維修
            </button>
          ) : (
            <button
              onClick={() => onRoomAction(room.id, 'edit', { status: 'available' })}
              className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              恢復
            </button>
          )}
        </div>
        
        {/* 額外資訊 */}
        <div className="mt-3 text-xs text-gray-500 flex justify-between">
          <div>
            創建: {new Date(room.createdAt).toLocaleDateString('zh-TW')}
          </div>
          <div>
            更新: {new Date(room.updatedAt).toLocaleDateString('zh-TW')}
          </div>
        </div>
      </div>
    </div>
  )
}