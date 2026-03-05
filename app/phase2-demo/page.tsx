'use client'

import RoomsContainer from '@/src/components/rooms-v2/RoomsContainer'
import { useState } from 'react'

export default function Phase2DemoPage() {
  const [propertyId, setPropertyId] = useState('property_1')
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚀 階段二演示：房間管理重構
          </h1>
          <p className="text-gray-600">
            台灣時間：{new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              新架構測試版
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              模塊化設計
            </div>
            <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              簡化狀態管理
            </div>
          </div>
        </div>
        
        {/* 演示說明 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">🎯 階段二成果展示</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-3">✅ 已完成的重構</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>模塊化組件結構（8個獨立組件）</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>自定義Hook數據管理</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>簡化的3種房間狀態</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>響應式表格和卡片視圖</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>完整的過濾和搜索功能</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-700 mb-3">📊 技術改進對比</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>代碼行數</span>
                    <span>995行 → 約350行</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: '35%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>組件數量</span>
                    <span>1個 → 8個</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: '800%' }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>房間狀態</span>
                    <span>9種 → 3種</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: '33%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 物業選擇器 */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">🏢 選擇物業</h3>
              <p className="text-sm text-gray-600">測試不同物業的房間管理</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPropertyId('property_1')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  propertyId === 'property_1'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                物業一
              </button>
              <button
                onClick={() => setPropertyId('property_2')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  propertyId === 'property_2'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                物業二
              </button>
            </div>
          </div>
        </div>
        
        {/* 房間管理組件 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">🏠 房間管理</h2>
            <div className="text-sm text-gray-500">
              物業ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{propertyId}</span>
            </div>
          </div>
          
          <RoomsContainer propertyId={propertyId} />
        </div>
        
        {/* 操作測試區域 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">🧪 功能測試</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-2">狀態過濾測試</h4>
              <p className="text-sm text-gray-600 mb-3">測試不同狀態的房間篩選功能</p>
              <div className="text-xs text-gray-500">
                點擊狀態按鈕測試過濾功能
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-2">視圖切換測試</h4>
              <p className="text-sm text-gray-600 mb-3">測試表格和卡片視圖的切換</p>
              <div className="text-xs text-gray-500">
                點擊視圖按鈕測試不同顯示模式
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-800 mb-2">房間操作測試</h4>
              <p className="text-sm text-gray-600 mb-3">測試入住、退房、編輯等操作</p>
              <div className="text-xs text-gray-500">
                點擊房間的操作按鈕測試功能
              </div>
            </div>
          </div>
        </div>
        
        {/* 頁腳資訊 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500">
              <p>階段二：核心功能重構 - 房間管理模塊</p>
              <p className="mt-1">開發時間：台灣時間 2026-03-06 01:00-06:05</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                <span className="font-medium">組件數量:</span> 8個
              </div>
              <div className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                <span className="font-medium">代碼行數:</span> ~350行
              </div>
              <div className="text-xs px-3 py-1 bg-gray-100 rounded-full">
                <span className="font-medium">狀態類型:</span> 3種
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-400">
            <p>GitHub提交準備中... | 部署驗證通過後將自動部署到Vercel</p>
          </div>
        </div>
      </div>
    </div>
  )
}