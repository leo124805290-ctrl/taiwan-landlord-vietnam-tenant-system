'use client'

import { useState } from 'react'
import MaintenanceOptimized from '@/components/MaintenanceOptimized'
import MaintenanceSimple from '@/components/MaintenanceSimple'
import MaintenanceClean from '@/components/MaintenanceClean'

// 模擬資料
const mockProperty = {
  id: 1,
  name: '示範物業',
  maintenance: [
    {
      id: 1,
      title: '浴室水管漏水',
      desc: 'A101房間浴室水管漏水，需要緊急維修',
      s: 'pending',
      n: 'A101',
      t: '王小明',
      date: '2026-02-24',
      urg: 'urgent',
      category: 'repair',
      cost: 1500,
      technician: '張師傅',
      estimatedCompletion: '2026-02-25'
    },
    {
      id: 2,
      title: '房間牆面粉刷',
      desc: 'B202房間牆面重新粉刷，改善外觀',
      s: 'in-progress',
      n: 'B202',
      t: '李小姐',
      date: '2026-02-20',
      category: 'renovation',
      estimatedCost: 8000,
      actualCost: 7500,
      technician: '陳師傅',
      estimatedCompletion: '2026-02-28',
      actualCompletionDate: '2026-02-27',
      paymentStatus: 'paid',
      invoiceNumber: 'INV-2026-002'
    },
    {
      id: 3,
      title: '冷氣維修',
      desc: 'C303房間冷氣不冷，需要檢查維修',
      s: 'completed',
      n: 'C303',
      t: '林先生',
      date: '2026-02-15',
      category: 'repair',
      actualCost: 3000,
      technician: '黃師傅',
      actualCompletionDate: '2026-02-16',
      paymentStatus: 'paid'
    },
    {
      id: 4,
      title: '廚房櫥櫃更新',
      desc: 'D404房間廚房櫥櫃老舊更新',
      s: 'assigned',
      n: 'D404',
      t: '陳太太',
      date: '2026-02-22',
      category: 'renovation',
      estimatedCost: 12000,
      technician: '王師傅',
      estimatedCompletion: '2026-03-05'
    },
    {
      id: 5,
      title: '電燈更換',
      desc: '公共區域電燈損壞更換',
      s: 'pending',
      n: '公共區域',
      date: '2026-02-23',
      category: 'repair',
      estimatedCost: 500
    },
    {
      id: 6,
      title: '陽台防水工程',
      desc: 'E505房間陽台防水處理',
      s: 'completed',
      n: 'E505',
      t: '吳先生',
      date: '2026-02-10',
      category: 'renovation',
      estimatedCost: 15000,
      actualCost: 14500,
      technician: '劉師傅',
      actualCompletionDate: '2026-02-18',
      paymentStatus: 'partial',
      invoiceNumber: 'INV-2026-001'
    }
  ]
}

export default function MaintenanceDemoPage() {
  const [view, setView] = useState<'optimized' | 'simple' | 'clean'>('optimized')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">報修/裝修頁面優化示範</h1>
          <p className="text-gray-600 mt-2">三種不同風格的優化版本，讓畫面更簡單清楚</p>
        </div>

        {/* 版本選擇 */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">選擇優化版本</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setView('optimized')}
              className={`p-4 rounded-lg border-2 transition-all ${
                view === 'optimized'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">完整版</div>
                <div className="text-sm text-gray-600 mt-1">功能完整，統計詳盡</div>
              </div>
            </button>
            
            <button
              onClick={() => setView('simple')}
              className={`p-4 rounded-lg border-2 transition-all ${
                view === 'simple'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">簡潔版</div>
                <div className="text-sm text-gray-600 mt-1">極簡設計，快速操作</div>
              </div>
            </button>
            
            <button
              onClick={() => setView('clean')}
              className={`p-4 rounded-lg border-2 transition-all ${
                view === 'clean'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">乾淨版</div>
                <div className="text-sm text-gray-600 mt-1">現代設計，清晰層次</div>
              </div>
            </button>
          </div>
        </div>

        {/* 版本說明 */}
        <div className="mb-8">
          <div className={`p-4 rounded-lg ${
            view === 'optimized' ? 'bg-blue-50 border border-blue-200' :
            view === 'simple' ? 'bg-green-50 border border-green-200' :
            'bg-purple-50 border border-purple-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded ${
                view === 'optimized' ? 'bg-blue-100 text-blue-600' :
                view === 'simple' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {view === 'optimized' ? '📊' : view === 'simple' ? '🎯' : '✨'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {view === 'optimized' ? '完整功能版' : 
                   view === 'simple' ? '極簡操作版' : 
                   '現代設計版'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {view === 'optimized' ? 
                    '提供完整的統計分析、多層篩選和詳細資訊展開功能，適合需要全面管理的使用者。' :
                   view === 'simple' ? 
                    '專注於快速查看和操作，簡化界面元素，提升操作效率。' :
                    '採用現代化設計語言，清晰的視覺層次和統一的色彩系統。'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 顯示選中的版本 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {view === 'optimized' ? '完整功能展示' : 
                     view === 'simple' ? '簡潔界面展示' : 
                     '現代設計展示'}
                  </h2>
                  <p className="text-gray-600 mt-1">使用模擬資料展示頁面效果</p>
                </div>
                <div className="text-sm text-gray-500">
                  共 {mockProperty.maintenance.length} 筆記錄
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {view === 'optimized' && <MaintenanceOptimized property={mockProperty} />}
            {view === 'simple' && <MaintenanceSimple property={mockProperty} />}
            {view === 'clean' && <MaintenanceClean property={mockProperty} />}
          </div>
        </div>

        {/* 使用說明 */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">如何使用這些優化版本</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">1. 導入組件</h3>
              <pre className="text-sm bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`import MaintenanceOptimized from '@/components/MaintenanceOptimized'
// 或
import MaintenanceSimple from '@/components/MaintenanceSimple'
// 或
import MaintenanceClean from '@/components/MaintenanceClean'`}
              </pre>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">2. 在頁面中使用</h3>
              <pre className="text-sm bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`export default function YourPage() {
  const property = { /* 你的物業資料 */ }
  
  return (
    <div>
      <MaintenanceOptimized property={property} />
    </div>
  )
}`}
              </pre>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">3. 自定義調整</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>修改顏色：調整 Tailwind CSS 顏色類別</li>
                <li>調整佈局：修改網格系統和間距</li>
                <li>增減功能：根據需求添加或移除功能模塊</li>
                <li>適配資料：確保資料結構符合組件要求</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 優化重點總結 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
              <span className="text-blue-600">🎨</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">視覺清晰</h3>
            <p className="text-gray-600 text-sm">
              統一的色彩系統，清晰的資訊層級，良好的視覺分隔，讓畫面更易讀。
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
              <span className="text-green-600">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">操作簡便</h3>
            <p className="text-gray-600 text-sm">
              快速篩選、一鍵操作、明確反饋，減少操作步驟，提升使用效率。
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
              <span className="text-purple-600">📱</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">響應式設計</h3>
            <p className="text-gray-600 text-sm">
              適應不同屏幕尺寸，移動設備優化，觸控友好的界面設計。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}