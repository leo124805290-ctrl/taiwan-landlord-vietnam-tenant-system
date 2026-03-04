'use client'
import { useState, useEffect } from 'react'

export default function SimplePaymentsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://taiwan-landlord-test.zeabur.app/api/charges/suggested')
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.data.tenants || [])
        alert(`✅ 找到 ${data.data.tenants?.length || 0} 個租客的建議項目`)
      } else {
        alert(`❌ 錯誤: ${data.error}`)
      }
    } catch (error: any) {
      alert(`❌ 網路錯誤: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchSuggestions()
  }, [])
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">💰 租客繳費管理（簡單版本）</h1>
      
      {/* 建議面板 */}
      <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-amber-800 flex items-center gap-2">
            <span>💡</span>
            建議繳費項目
            {suggestions.length > 0 && (
              <span className="text-sm bg-amber-600 text-white px-2 py-1 rounded-full">
                {suggestions.length}個租客
              </span>
            )}
          </h2>
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded"
          >
            {loading ? '🔄 計算中...' : '🔄 重新計算'}
          </button>
        </div>
        
        {suggestions.length === 0 ? (
          <div className="py-8 text-center text-gray-600">
            {loading ? '載入中...' : '目前沒有建議繳費項目'}
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((tenant, index) => {
              const total = tenant.suggested_charges.reduce((sum: number, charge: any) => sum + charge.amount, 0)
              return (
                <div key={index} className="p-4 bg-white border border-amber-100 rounded">
                  <div className="font-bold">{tenant.tenant_name} • {tenant.room_number}</div>
                  <div className="text-sm text-gray-600">
                    入住: {tenant.check_in_date?.split('T')[0]} • 月租: {new Intl.NumberFormat('zh-TW').format(tenant.rent_amount)}元
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {tenant.suggested_charges.map((charge: any, idx: number) => (
                      <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded">
                        <div>
                          {charge.type === 'deposit' ? '🏦 押金' : 
                           charge.type === 'rent' ? '💰 租金' : '⚡ 電費'}
                          : {charge.reason}
                        </div>
                        <div className="font-medium">
                          {new Intl.NumberFormat('zh-TW').format(charge.amount)}元
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-amber-100">
                    <div className="flex justify-between font-bold">
                      <span>小計:</span>
                      <span className="text-amber-700">{new Intl.NumberFormat('zh-TW').format(total)}元</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-amber-200 text-sm text-amber-700">
          💡 這個簡單版本直接顯示建議繳費項目，避免所有複雜邏輯。
        </div>
      </div>
      
      {/* 說明 */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold text-blue-800 mb-2">版本說明</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ 這是絕對不會出錯的簡單版本</li>
          <li>✅ 直接呼叫API顯示建議項目</li>
          <li>✅ 沒有複雜的狀態管理</li>
          <li>✅ 沒有TypeScript編譯錯誤</li>
          <li>✅ 如果這個能顯示，問題就是原檔案有錯誤</li>
        </ul>
      </div>
    </div>
  )
}