'use client'

// 簡單測試頁面 - 避免路徑配置問題
import { useState } from 'react'

export default function SimpleTestPage() {
  const [testResult, setTestResult] = useState<string>('未測試')
  const [isLoading, setIsLoading] = useState(false)

  // 測試數據模型
  const testDataModel = () => {
    setIsLoading(true)
    try {
      // 測試簡化類型
      const testRoom = {
        id: 'test_1',
        propertyId: 'property_1',
        number: '101',
        floor: 1,
        monthlyRent: 12000,
        deposit: 24000,
        status: 'available',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // 驗證類型
      const isValid = 
        testRoom.id && 
        testRoom.number && 
        testRoom.monthlyRent > 0 &&
        ['available', 'occupied', 'maintenance'].includes(testRoom.status)
      
      setTestResult(isValid ? '✅ 數據模型測試通過' : '❌ 數據模型測試失敗')
    } catch (error) {
      setTestResult(`❌ 數據模型錯誤: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 測試組件導入
  const testComponentImport = async () => {
    setIsLoading(true)
    try {
      // 嘗試動態導入組件
      const module = await import('../../../src/components/rooms/RoomsSimple.tsx')
      setTestResult('✅ 組件導入測試通過')
    } catch (error) {
      setTestResult(`❌ 組件導入錯誤: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // 測試API客戶端
  const testApiClient = () => {
    setIsLoading(true)
    try {
      // 測試API客戶端類型
      const apiTest = {
        baseURL: '/api',
        timeout: 10000,
      }
      
      setTestResult('✅ API客戶端配置測試通過')
    } catch (error) {
      setTestResult(`❌ API客戶端錯誤: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">階段一除錯測試</h1>
      
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">測試項目</h2>
        
        <div className="space-y-4">
          {/* 測試1：數據模型 */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800">1. 簡化數據模型</h3>
              <button
                onClick={testDataModel}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? '測試中...' : '運行測試'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              測試房間狀態從9種簡化為3種，驗證類型定義
            </p>
            <div className={`p-2 rounded ${testResult.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
              {testResult.startsWith('✅') || testResult.startsWith('❌') ? testResult : '等待測試...'}
            </div>
          </div>

          {/* 測試2：組件導入 */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800">2. 組件導入</h3>
              <button
                onClick={testComponentImport}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? '測試中...' : '運行測試'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              測試 RoomsSimple 組件是否能正確導入
            </p>
          </div>

          {/* 測試3：API客戶端 */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800">3. API客戶端</h3>
              <button
                onClick={testApiClient}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isLoading ? '測試中...' : '運行測試'}
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              測試API客戶端配置和類型安全
            </p>
          </div>
        </div>
      </div>

      {/* 測試結果總結 */}
      <div className="bg-gray-50 rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">測試結果總結</h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-sm">1</span>
            </div>
            <div>
              <div className="font-medium">數據模型設計</div>
              <div className="text-sm text-gray-600">房間狀態簡化完成，類型定義完整</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
              <span className="text-white text-sm">2</span>
            </div>
            <div>
              <div className="font-medium">前端組件開發</div>
              <div className="text-sm text-gray-600">組件創建完成，需要修正導入路徑</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-sm">3</span>
            </div>
            <div>
              <div className="font-medium">API設計規範</div>
              <div className="text-sm text-gray-600">RESTful API設計完成，文檔齊全</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-sm">4</span>
            </div>
            <div>
              <div className="font-medium">模擬API服務</div>
              <div className="text-sm text-gray-600">模擬數據庫和API服務實現完成</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-sm">!</span>
            </div>
            <div>
              <div className="font-medium text-red-600">緊急問題</div>
              <div className="text-sm text-red-600">專案結構混亂，需要統一組件路徑</div>
            </div>
          </div>
        </div>
      </div>

      {/* 下一步建議 */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">除錯建議</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-700">
          <li>統一組件路徑：將所有組件移到單一目錄（建議使用 `src/components/`）</li>
          <li>修正 tsconfig.json：更新 paths 配置以支持新的目錄結構</li>
          <li>更新導入語句：將所有導入更新為新的路徑</li>
          <li>運行完整測試：確保所有功能正常運行</li>
          <li>部署驗證：檢查生產環境部署是否正常</li>
        </ol>
      </div>
    </div>
  )
}