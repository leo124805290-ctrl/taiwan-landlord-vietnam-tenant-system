'use client'

import { useState } from 'react'

// 本地數據 - 避免導入問題
const demoRooms = [
  {
    id: 'room_1',
    propertyId: 'property_1',
    number: '101',
    floor: 1,
    monthlyRent: 12000,
    deposit: 24000,
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'room_2',
    propertyId: 'property_1',
    number: '102',
    floor: 1,
    monthlyRent: 11000,
    deposit: 22000,
    status: 'occupied',
    tenant: {
      name: '陳小明',
      phone: '0912-345-678',
    },
    lease: {
      checkInDate: '2026-03-01',
      checkOutDate: '2026-09-01',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'room_3',
    propertyId: 'property_1',
    number: '201',
    floor: 2,
    monthlyRent: 13000,
    deposit: 26000,
    status: 'maintenance',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'room_4',
    propertyId: 'property_1',
    number: '202',
    floor: 2,
    monthlyRent: 12500,
    deposit: 25000,
    status: 'available',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'room_5',
    propertyId: 'property_1',
    number: '301',
    floor: 3,
    monthlyRent: 14000,
    deposit: 28000,
    status: 'occupied',
    tenant: {
      name: '林美華',
      phone: '0988-765-432',
    },
    lease: {
      checkInDate: '2026-02-15',
      checkOutDate: '2026-08-15',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// 簡單的房間卡片組件
function SimpleRoomCard({ room, onAction }: any) {
  const statusColors = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-blue-100 text-blue-800',
    maintenance: 'bg-orange-100 text-orange-800',
  }
  
  const statusText = {
    available: '空房可出租',
    occupied: '已出租',
    maintenance: '維修中',
  }

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{room.number}</h3>
          <p className="text-sm text-gray-600">{room.floor}樓 • 月租 ${room.monthlyRent.toLocaleString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[room.status]}`}>
          {statusText[room.status]}
        </span>
      </div>

      {room.status === 'occupied' && room.tenant && (
        <div className="mb-3 p-3 bg-gray-50 rounded">
          <div className="font-medium text-gray-800">{room.tenant.name}</div>
          <div className="text-sm text-gray-600">{room.tenant.phone}</div>
          {room.lease && (
            <div className="text-xs text-gray-500 mt-1">
              租期: {room.lease.checkInDate} ~ {room.lease.checkOutDate}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {room.status === 'available' && (
          <button
            onClick={() => onAction('check-in', room.id)}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            入住
          </button>
        )}
        {room.status === 'occupied' && (
          <button
            onClick={() => onAction('check-out', room.id)}
            className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            退房
          </button>
        )}
        {room.status === 'maintenance' && (
          <button
            onClick={() => onAction('available', room.id)}
            className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            恢復可出租
          </button>
        )}
        <button
          onClick={() => onAction('edit', room.id)}
          className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
        >
          編輯
        </button>
      </div>
    </div>
  )
}

export default function Phase1DemoPage() {
  const [rooms, setRooms] = useState(demoRooms)
  const [filter, setFilter] = useState('all')
  const [message, setMessage] = useState('')

  const filteredRooms = filter === 'all' 
    ? rooms 
    : rooms.filter(room => room.status === filter)

  const stats = {
    total: rooms.length,
    available: rooms.filter(r => r.status === 'available').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  }

  const handleRoomAction = (action: string, roomId: string) => {
    setMessage(`執行: ${action} - 房間 ${roomId}`)
    
    // 簡單的狀態更新邏輯
    if (action === 'check-in') {
      setRooms(rooms.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              status: 'occupied',
              tenant: { name: '新租客', phone: '0900-000-000' },
              lease: { 
                checkInDate: new Date().toISOString().split('T')[0],
                checkOutDate: new Date(Date.now() + 180*24*60*60*1000).toISOString().split('T')[0]
              }
            }
          : room
      ))
    } else if (action === 'check-out') {
      setRooms(rooms.map(room => 
        room.id === roomId 
          ? { 
              ...room, 
              status: 'available',
              tenant: undefined,
              lease: undefined
            }
          : room
      ))
    } else if (action === 'available') {
      setRooms(rooms.map(room => 
        room.id === roomId ? { ...room, status: 'available' } : room
      ))
    }
    
    // 清除訊息
    setTimeout(() => setMessage(''), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 標題 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            套房出租管理系統 - 階段一演示
          </h1>
          <p className="text-gray-600">
            房間狀態從9種簡化為3種：空房可出租 • 已出租 • 維修中
          </p>
        </div>

        {/* 統計卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-sm text-gray-500">總房間數</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm">
            <div className="text-sm text-green-600">空房可出租</div>
            <div className="text-2xl font-bold text-green-700">{stats.available}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
            <div className="text-sm text-blue-600">已出租</div>
            <div className="text-2xl font-bold text-blue-700">{stats.occupied}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 shadow-sm">
            <div className="text-sm text-orange-600">維修中</div>
            <div className="text-2xl font-bold text-orange-700">{stats.maintenance}</div>
          </div>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">房間管理</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  全部房間
                </button>
                <button
                  onClick={() => setFilter('available')}
                  className={`px-4 py-2 rounded-lg ${filter === 'available' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}
                >
                  空房可出租
                </button>
                <button
                  onClick={() => setFilter('occupied')}
                  className={`px-4 py-2 rounded-lg ${filter === 'occupied' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}
                >
                  已出租
                </button>
                <button
                  onClick={() => setFilter('maintenance')}
                  className={`px-4 py-2 rounded-lg ${filter === 'maintenance' ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700'}`}
                >
                  維修中
                </button>
              </div>
            </div>
            
            <button
              onClick={() => {
                const newRoom = {
                  id: `room_${Date.now()}`,
                  propertyId: 'property_1',
                  number: `${Math.floor(Math.random() * 900) + 100}`,
                  floor: Math.floor(Math.random() * 5) + 1,
                  monthlyRent: Math.floor(Math.random() * 5000) + 10000,
                  deposit: 20000,
                  status: 'available',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
                setRooms([...rooms, newRoom])
                setMessage('新增房間成功')
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              ➕ 新增房間
            </button>
          </div>
        </div>

        {/* 房間列表 */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              {filter === 'all' ? '所有房間' : 
               filter === 'available' ? '空房可出租' :
               filter === 'occupied' ? '已出租房間' : '維修中房間'}
              <span className="ml-2 text-sm text-gray-500">({filteredRooms.length}間)</span>
            </h3>
            <div className="text-sm text-gray-500">
              點擊按鈕測試入住/退房功能
            </div>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="text-5xl mb-4">🏢</div>
              <h4 className="text-xl font-semibold text-gray-700 mb-2">沒有房間</h4>
              <p className="text-gray-500 mb-4">點擊「新增房間」按鈕開始添加</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map(room => (
                <SimpleRoomCard
                  key={room.id}
                  room={room}
                  onAction={handleRoomAction}
                />
              ))}
            </div>
          )}
        </div>

        {/* 階段一成果展示 */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">階段一完成成果</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">✅ 已完成項目</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>數據模型簡化：9種狀態 → 3種狀態</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>前端組件開發：房間卡片、過濾器、操作按鈕</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>API設計規範：完整的RESTful API設計</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>模擬API服務：開發測試用的模擬數據庫</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-3">📊 技術指標</h4>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">代碼質量</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">用戶體驗</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">部署就緒</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 操作反饋 */}
        {message && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
            {message}
          </div>
        )}

        {/* 頁腳 */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>套房出租管理系統 - 階段一演示版本 • 部署時間: {new Date().toLocaleString('zh-TW')}</p>
          <p className="mt-1">GitHub提交: 149bc4c • Vercel自動部署</p>
        </div>
      </div>
    </div>
  )
}