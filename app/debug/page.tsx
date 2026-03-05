'use client'

import { useState, useEffect } from 'react'

// 直接使用相對路徑導入，避免配置問題
import dynamic from 'next/dynamic'

// 動態導入組件，避免構建時錯誤
const RoomsSimple = dynamic(
  () => import('../../src/components/unified/RoomsSimple'),
  { 
    ssr: false,
    loading: () => <div className="text-center py-12">載入組件中...</div>
  }
)

// 本地測試數據
const localTestRooms = [
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
      name: '測試租客',
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
]

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // 收集除錯信息
    const info = []
    
    // 檢查環境
    info.push(`環境: ${process.env.NODE_ENV}`)
    info.push(`時間: ${new Date().toLocaleString('zh-TW')}`)
    
    // 檢查組件
    info.push('組件狀態: 使用動態導入')
    
    // 檢查數據
    info.push(`測試房間數: ${localTestRooms.length}`)
    
    setDebugInfo(info)
    setIsLoaded(true)
  }, [])

  // 簡單的房間操作處理
  const handleRoomAction = (action: string, roomId: string, data?: any) => {
    console.log('房間操作:', { action, roomId, data })
    alert(`執行操作: ${action} - 房間: ${roomId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">階段一除錯頁面</h1>
      <p className="text-gray-600 mb-6">驗證簡化房間管理系統的核心功能</p>

      {/* 除錯信息 */}
      <div className="bg-gray-50 border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-3">系統狀態</h2>
        <div className="space-y-2">
          {debugInfo.map((info, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-700">{info}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 功能測試區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 測試1：數據模型 */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-3">數據模型測試</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">房間狀態</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                3種 (簡化完成)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">類型安全</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                TypeScript
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">數據驗證</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                內置驗證
              </span>
            </div>
          </div>
        </div>

        {/* 測試2：組件功能 */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-3">組件功能測試</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">房間卡片</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                完成
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">過濾搜索</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                完成
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">操作按鈕</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                完成
              </span>
            </div>
          </div>
        </div>

        {/* 測試3：API設計 */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-medium text-gray-800 mb-3">API設計測試</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">RESTful設計</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                完成
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">錯誤處理</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                標準化
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">模擬API</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                可用
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要測試區域 */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">簡化房間管理 - 功能演示</h2>
          <p className="text-sm text-gray-600 mt-1">
            展示房間狀態從9種簡化為3種的核心界面
          </p>
        </div>
        
        <div className="p-4">
          {isLoaded ? (
            <RoomsSimple
              rooms={localTestRooms}
              propertyName="測試公寓"
              onRoomAction={handleRoomAction}
            />
          ) : (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <div className="text-gray-600">初始化組件中...</div>
            </div>
          )}
        </div>
      </div>

      {/* 測試說明 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">測試說明</h3>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>點擊房間卡片查看詳細信息</li>
          <li>使用過濾器查看不同狀態的房間</li>
          <li>嘗試入住、退房、維修等操作</li>
          <li>檢查響應式設計（調整瀏覽器大小）</li>
          <li>所有操作僅在前端演示，不會修改實際數據</li>
        </ul>
      </div>

      {/* 階段一完成狀態 */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">階段一完成狀態</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">1. 簡化數據模型設計</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">✅ 完成</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">2. 前端組件開發</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">✅ 完成</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">3. API設計規範</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">✅ 完成</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">4. 模擬API服務</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">✅ 完成</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">5. 除錯和測試</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">🔄 進行中</span>
          </div>
        </div>
      </div>
    </div>
  )
}