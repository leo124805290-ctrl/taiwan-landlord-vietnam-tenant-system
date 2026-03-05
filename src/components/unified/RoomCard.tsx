'use client'

// 本地類型定義，避免導入問題
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
  electricity?: {
    currentMeter: number;  // 當前電表讀數
    lastMeter: number;     // 上次電表讀數
    rate: number;          // 電費費率（元/度）
    lastUpdated?: string;  // 最後更新時間
  };
  createdAt: string;
  updatedAt: string;
}

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

// 本地工具函數
const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('zh-TW')}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('zh-TW');
};

interface RoomCardProps {
  room: SimpleRoom
  isSelected: boolean
  onSelect: () => void
  onAction: (action: string, roomId: string, data?: any) => void
}

export default function RoomCard({ room, isSelected, onSelect, onAction }: RoomCardProps) {
  // 狀態顏色映射
  const statusColorMap = {
    available: 'bg-green-100 text-green-800 border-green-200',
    occupied: 'bg-blue-100 text-blue-800 border-blue-200',
    maintenance: 'bg-orange-100 text-orange-800 border-orange-200',
  }

  // 狀態圖標映射
  const statusIconMap = {
    available: '🟢',
    occupied: '🔵',
    maintenance: '🟠',
  }

  // 計算剩餘天數（如果已出租）
  const getDaysRemaining = () => {
    if (room.status !== 'occupied' || !room.lease?.checkOutDate) {
      return null
    }
    
    const today = new Date()
    const checkOutDate = new Date(room.lease.checkOutDate)
    const diffTime = checkOutDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  // 計算電費（如果有電費資訊）
  const getElectricityFee = () => {
    if (!room.electricity) {
      return 0
    }
    
    if (!room.electricity?.currentMeter || !room.electricity?.lastMeter) {
      return 0
    }
    const usage = room.electricity.currentMeter - room.electricity.lastMeter
    return usage > 0 ? usage * (room.electricity.rate || 0) : 0
  }

  const daysRemaining = getDaysRemaining()
  const electricityFee = getElectricityFee()
  const statusColor = statusColorMap[room.status]
  const statusIcon = statusIconMap[room.status]

  return (
    <div 
      className={`room-card border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:shadow-sm hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      {/* 房間標頭 */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-gray-800">{room.number}</h3>
            <span className="text-sm text-gray-500">• {room.floor}F</span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            月租: <span className="font-semibold">{formatCurrency(room.monthlyRent)}</span>
          </div>
        </div>
        
        {/* 狀態標籤 */}
        <span className={`status-badge px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
          {statusIcon} {roomStatusDisplayNames[room.status]}
        </span>
      </div>

      {/* 租客資訊（如果已出租） */}
      {room.status === 'occupied' && room.tenant && (
        <div className="tenant-info mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600">👤</span>
            </div>
            <div>
              <div className="font-medium text-gray-800">{room.tenant.name}</div>
              <div className="text-sm text-gray-600">{room.tenant.phone}</div>
            </div>
          </div>
          
          {room.lease && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-gray-500">入住</div>
                <div className="font-medium">{formatDate(room.lease.checkInDate)}</div>
              </div>
              <div>
                <div className="text-gray-500">到期</div>
                <div className="font-medium">{formatDate(room.lease.checkOutDate)}</div>
              </div>
            </div>
          )}
          
          {/* 合約提醒 */}
          {daysRemaining !== null && daysRemaining <= 30 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
              <span className="text-yellow-700">⏳ 合約剩餘 {daysRemaining} 天</span>
            </div>
          )}
        </div>
      )}

      {/* 電費資訊 */}
      {electricityFee > 0 && (
        <div className="electricity-info mb-4 p-2 bg-orange-50 border border-orange-100 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-orange-600">⚡</span>
              <span className="text-sm text-orange-700">本期電費</span>
            </div>
            <div className="font-bold text-orange-800">{formatCurrency(electricityFee)}</div>
          </div>
          {room.electricity && (
            <div className="text-xs text-orange-600 mt-1">
              電錶: {room.electricity.lastMeter} → {room.electricity.currentMeter} 
              ({room.electricity.currentMeter - room.electricity.lastMeter}度)
            </div>
          )}
        </div>
      )}

      {/* 押金資訊 */}
      <div className="deposit-info mb-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">押金</span>
          <span className="font-semibold">{formatCurrency(room.deposit)}</span>
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="room-actions flex flex-wrap gap-2">
        {room.status === 'available' && (
          <>
            <button
              className="btn-action bg-green-600 text-white hover:bg-green-700"
              onClick={(e) => {
                e.stopPropagation()
                onAction('check-in', room.id)
              }}
            >
              入住
            </button>
            <button
              className="btn-action bg-gray-600 text-white hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation()
                onAction('maintenance', room.id)
              }}
            >
              維修
            </button>
          </>
        )}
        
        {room.status === 'occupied' && (
          <>
            <button
              className="btn-action bg-blue-600 text-white hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation()
                onAction('collect-rent', room.id)
              }}
            >
              收租
            </button>
            <button
              className="btn-action bg-red-600 text-white hover:bg-red-700"
              onClick={(e) => {
                e.stopPropagation()
                onAction('check-out', room.id)
              }}
            >
              退房
            </button>
            <button
              className="btn-action bg-purple-600 text-white hover:bg-purple-700"
              onClick={(e) => {
                e.stopPropagation()
                onAction('renew', room.id)
              }}
            >
              續約
            </button>
          </>
        )}
        
        {room.status === 'maintenance' && (
          <button
            className="btn-action bg-green-600 text-white hover:bg-green-700"
            onClick={(e) => {
              e.stopPropagation()
              onAction('available', room.id)
            }}
          >
            恢復可出租
          </button>
        )}
        
        {/* 通用操作 */}
        <button
          className="btn-action bg-gray-200 text-gray-700 hover:bg-gray-300"
          onClick={(e) => {
            e.stopPropagation()
            onAction('edit', room.id)
          }}
        >
          編輯
        </button>
        <button
          className="btn-action bg-red-100 text-red-700 hover:bg-red-200"
          onClick={(e) => {
            e.stopPropagation()
            if (confirm(`確定要刪除房間 ${room.number} 嗎？此操作無法撤銷。`)) {
              onAction('delete', room.id)
            }
          }}
        >
          刪除
        </button>
      </div>

      {/* 最後更新時間 */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          更新於: {formatDate(room.updatedAt)}
        </div>
      </div>
    </div>
  )
}

// 樣式組件（實際項目中應該在CSS中定義）
const styles = `
.room-card {
  position: relative;
}

.btn-action {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
  flex: 1;
  min-width: 70px;
  text-align: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.rooms-grid {
  min-height: 400px;
}

.empty-state {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 2px dashed #cbd5e1;
}

.stat-card {
  min-width: 120px;
}
`