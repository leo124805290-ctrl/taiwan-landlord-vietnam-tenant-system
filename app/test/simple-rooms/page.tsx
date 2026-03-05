'use client'

import { useState, useEffect } from 'react'
import RoomsSimple from '@/components/rooms/RoomsSimple'
import { sampleRooms, handleRoomAction } from '@/data/sampleRooms'
import { mockApiService } from '@/lib/api/mockService'
import { SimpleRoom } from '@/types/simple'

export default function SimpleRoomsTestPage() {
  const [rooms, setRooms] = useState<SimpleRoom[]>(sampleRooms)
  const [isLoading, setIsLoading] = useState(true)
  const [apiMode, setApiMode] = useState<'mock' | 'local'>('local')
  const [stats, setStats] = useState<any>(null)

  // 加載數據
  useEffect(() => {
    loadData()
  }, [apiMode])

  const loadData = async () => {
    setIsLoading(true)
    
    try {
      if (apiMode === 'mock') {
        // 使用模擬API
        const response = await mockApiService.getRooms({ pageSize: 50 })
        if (response.success && response.data) {
          setRooms(response.data.items)
          
          // 獲取統計數據
          const statsResponse = await mockApiService.getRoomStats()
          if (statsResponse.success && statsResponse.data) {
            setStats(statsResponse.data)
          }
        }
      } else {
        // 使用本地數據
        setRooms(sampleRooms)
        
        // 計算本地統計
        const total = sampleRooms.length
        const available = sampleRooms.filter(r => r.status === 'available').length
        const occupied = sampleRooms.filter(r => r.status === 'occupied').length
        const maintenance = sampleRooms.filter(r => r.status === 'maintenance').length
        const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0
        
        setStats({
          total,
          available,
          occupied,
          maintenance,
          occupancyRate,
        })
      }
    } catch (error) {
      console.error('加載數據失敗:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 處理房間操作
  const handleRoomActionWithUpdate = async (action: string, roomId: string, data?: any) => {
    console.log('處理房間操作:', { action, roomId, data })
    
    // 調用示例處理函數
    handleRoomAction(action, roomId, data)
    
    // 根據操作類型更新狀態
    if (action === 'delete') {
      setRooms(prev => prev.filter(room => room.id !== roomId))
    } else if (action === 'check-in') {
      // 模擬入住操作
      const updatedRooms = rooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            status: 'occupied',
            tenant: {
              name: '新租客',
              phone: '0900-000-000',
            },
            lease: {
              checkInDate: new Date().toISOString().split('T')[0],
              checkOutDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            },
          }
        }
        return room
      })
      setRooms(updatedRooms)
    } else if (action === 'check-out') {
      // 模擬退房操作
      const updatedRooms = rooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            status: 'available',
            tenant: undefined,
            lease: undefined,
          }
        }
        return room
      })
      setRooms(updatedRooms)
    } else if (action === 'maintenance') {
      // 模擬設為維修
      const updatedRooms = rooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            status: 'maintenance',
          }
        }
        return room
      })
      setRooms(updatedRooms)
    } else if (action === 'available') {
      // 模擬恢復可出租
      const updatedRooms = rooms.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            status: 'available',
          }
        }
        return room
      })
      setRooms(updatedRooms)
    }
    
    // 重新加載數據
    setTimeout(() => loadData(), 500)
  }

  // 切換API模式
  const toggleApiMode = () => {
    setApiMode(prev => prev === 'mock' ? 'local' : 'mock')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          簡化房間管理 - 測試頁面
        </h1>
        <p className="text-gray-600">
          測試簡化版的房間管理組件和API接口
        </p>
      </div>

      {/* 控制面板 */}
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">測試控制</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleApiMode}
                className={`px-4 py-2 rounded-lg font-medium ${
                  apiMode === 'mock' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {apiMode === 'mock' ? '🔌 模擬API模式' : '💾 本地數據模式'}
              </button>
              
              <button
                onClick={loadData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                🔄 重新加載數據
              </button>
              
              <button
                onClick={() => setRooms(sampleRooms)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                📋 重置為示例數據
              </button>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">數據狀態</div>
            <div className="text-2xl font-bold text-blue-600">
              {rooms.length} 個房間
            </div>
            {stats && (
              <div className="text-sm text-gray-600">
                入住率: {stats.occupancyRate}%
              </div>
            )}
          </div>
        </div>
        
        {/* 狀態指示器 */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">空房可出租</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm">已出租</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm">維修中</span>
          </div>
        </div>
      </div>

      {/* 加載狀態 */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <div className="text-gray-600">加載數據中...</div>
        </div>
      ) : (
        <>
          {/* 房間管理組件 */}
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <RoomsSimple
              rooms={rooms}
              propertyName="幸福公寓"
              onRoomAction={handleRoomActionWithUpdate}
            />
          </div>

          {/* 測試信息 */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">測試說明</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-700 mb-2">已實現功能</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>✅ 房間卡片顯示（狀態、租客、租金）</li>
                  <li>✅ 過濾和搜索功能</li>
                  <li>✅ 狀態統計顯示</li>
                  <li>✅ 入住/退房/維修操作</li>
                  <li>✅ 響應式設計</li>
                  <li>✅ 模擬API集成</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-700 mb-2">測試方法</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>1. 點擊房間卡片選擇房間</li>
                  <li>2. 使用過濾器查看不同狀態房間</li>
                  <li>3. 嘗試入住、退房、維修操作</li>
                  <li>4. 切換API模式測試不同數據源</li>
                  <li>5. 檢查移動端響應式效果</li>
                </ul>
              </div>
            </div>
            
            {/* 當前配置 */}
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="text-sm">
                <span className="text-blue-700 font-medium">當前配置:</span>
                <span className="ml-2 text-blue-600">
                  {apiMode === 'mock' ? '模擬API服務' : '本地示例數據'} | 
                  {rooms.length}個房間 | 
                  TypeScript {rooms.every(r => r.id && r.number) ? '✅ 類型安全' : '❌ 類型錯誤'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 頁腳 */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>簡化套房出租管理系統 - 階段一測試版本</p>
        <p className="mt-1">更新時間: {new Date().toLocaleString('zh-TW')}</p>
      </div>
    </div>
  )
}