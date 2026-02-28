'use client'

import React, { useState, useEffect } from 'react'
import { Cloud, CloudOff, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { cloudConnection, CloudConnectionStatus } from '@/lib/cloudConnection'

const CloudConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<CloudConnectionStatus>(cloudConnection.getStatus())
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // 監聽雲端連線狀態變化
    const removeListener = cloudConnection.addListener((newStatus) => {
      setStatus(newStatus)
    })

    return () => {
      removeListener()
    }
  }, [])

  const handleRetry = () => {
    cloudConnection.checkConnection()
  }

  const handleManualSync = () => {
    // 手動觸發同步隊列
    const queue = cloudConnection.getOperationQueue()
    if (queue.length > 0) {
      // 這裡可以實現手動同步邏輯
      alert(`有 ${queue.length} 個待同步操作，系統會自動處理`)
    } else {
      alert('所有操作已同步完成')
    }
  }

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '從未同步'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return '剛剛'
    if (diffMins < 60) return `${diffMins} 分鐘前`
    
    const diffHours = Math.floor(diffMs / 3600000)
    if (diffHours < 24) return `${diffHours} 小時前`
    
    const diffDays = Math.floor(diffMs / 86400000)
    return `${diffDays} 天前`
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all ${
          status.connected
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : status.pendingOperations > 0
            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
        title="點擊查看雲端連線狀態"
      >
        {status.connected ? (
          <Cloud size={18} />
        ) : status.pendingOperations > 0 ? (
          <Clock size={18} />
        ) : (
          <CloudOff size={18} />
        )}
        
        <span className="text-sm font-medium">
          {status.connected ? '雲端連線' : '離線'}
          {status.pendingOperations > 0 && ` (${status.pendingOperations})`}
        </span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              status.connected
                ? 'bg-green-100 text-green-600'
                : status.pendingOperations > 0
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-red-100 text-red-600'
            }`}>
              {status.connected ? (
                <Cloud size={24} />
              ) : status.pendingOperations > 0 ? (
                <Clock size={24} />
              ) : (
                <CloudOff size={24} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">雲端連線狀態</h2>
              <p className="text-sm text-gray-600">即時同步到雲端資料庫</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 狀態內容 */}
        <div className="p-6 space-y-4">
          {/* 連線狀態 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status.connected ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-700">已連線到雲端</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-red-700">雲端連線中斷</span>
                </>
              )}
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw size={14} />
              重新連線
            </button>
          </div>

          {/* 最後同步時間 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">最後同步時間</span>
              <span className="text-sm font-medium">
                {formatTime(status.lastSync)}
              </span>
            </div>
            
            {status.lastSync && (
              <div className="text-xs text-gray-500">
                {new Date(status.lastSync).toLocaleString('zh-TW')}
              </div>
            )}
          </div>

          {/* 待同步操作 */}
          {status.pendingOperations > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">待同步操作</span>
                </div>
                <span className="font-bold text-yellow-800">
                  {status.pendingOperations} 個
                </span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                系統會自動重試同步，您也可以手動觸發
              </p>
              <button
                onClick={handleManualSync}
                className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm"
              >
                手動同步
              </button>
            </div>
          )}

          {/* 錯誤訊息 */}
          {status.lastError && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">最後錯誤</span>
              </div>
              <p className="text-sm text-red-700">{status.lastError}</p>
            </div>
          )}

          {/* 系統時間 */}
          {status.serverTime && (
            <div className="text-xs text-gray-500 text-center">
              雲端伺服器時間: {new Date(status.serverTime).toLocaleString('zh-TW')}
            </div>
          )}
        </div>

        {/* 操作按鈕 */}
        <div className="p-6 border-t">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsExpanded(false)}
              className="py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              關閉
            </button>
            <button
              onClick={handleRetry}
              className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              檢查連線
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CloudConnectionStatus