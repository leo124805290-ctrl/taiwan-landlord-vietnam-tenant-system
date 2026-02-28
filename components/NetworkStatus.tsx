'use client'

import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertCircle } from 'lucide-react'

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineWarning, setShowOfflineWarning] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineWarning(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineWarning(true)
      
      // 5秒後自動隱藏警告（但保持狀態提示）
      setTimeout(() => {
        setShowOfflineWarning(false)
      }, 5000)
    }

    // 初始狀態
    setIsOnline(navigator.onLine)

    // 監聽網絡狀態變化
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!isOnline) {
    return (
      <>
        {/* 固定狀態欄 */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white p-2 text-center text-sm font-medium flex items-center justify-center gap-2">
          <WifiOff size={16} />
          <span>離線模式 - 只能查看內容，無法進行操作</span>
        </div>

        {/* 警告彈窗（僅首次顯示） */}
        {showOfflineWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-yellow-100">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">網絡已斷開</h3>
                  <p className="text-sm text-gray-600">您已進入離線模式</p>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">可以查看：</span>所有現有資料、歷史記錄、統計報表
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">無法操作：</span>出租房間、收款、入住退租、修改資料
                  </p>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="mt-1">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">恢復連線後：</span>所有功能將自動恢復正常
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowOfflineWarning(false)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white p-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <Wifi size={16} />
      <span>在線模式 - 所有功能正常使用</span>
    </div>
  )
}

export default NetworkStatus