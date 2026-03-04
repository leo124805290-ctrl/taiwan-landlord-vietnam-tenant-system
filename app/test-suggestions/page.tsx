'use client'
import { useState, useEffect } from 'react'

export default function TestSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
      const response = await fetch(`${API_URL}/charges/suggested`)
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.data.tenants || [])
        alert(`✅ 計算成功！\n找到 ${data.data.tenants?.length || 0} 個租客\n總金額: ${new Intl.NumberFormat('zh-TW').format(data.data.summary?.total_suggested_amount || 0)}元`)
      } else {
        alert(`❌ 計算失敗: ${data.error}`)
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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">💡 建議繳費項目測試頁面</h1>
        <p className="text-gray-600 mb-8">這個頁面直接測試建議繳費項目API，避免所有快取問題。</p>
        
        <div className="mb-6 p-6 bg-white border rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">API測試</h2>
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            {loading ? '🔄 測試中...' : '🚀 測試建議項目API'}
          </button>
          
          <div className="mt-4 text-sm text-gray-600">
            測試網址: https://taiwan-landlord-test.zeabur.app/api/charges/suggested
          </div>
        </div>
        
        {suggestions.length > 0 && (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
              <span>💡</span>
              建議繳費項目 ({suggestions.length}個租客)
            </h2>
            
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
                        <div key={idx} className="flex justify-between p-2 bg-gray-50 rounded text-sm">
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
            
            <div className="mt-6 pt-4 border-t border-amber-200 text-sm text-amber-700">
              💡 這個測試頁面證明後端API正常，問題在前端部署或快取。
            </div>
          </div>
        )}
        
        <div className="mt-8 p-6 bg-gray-100 border rounded-lg">
          <h3 className="font-bold mb-3">問題診斷</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✅ 如果這個頁面能顯示建議項目，表示後端API正常</li>
            <li>✅ 如果這個頁面能正常運作，表示瀏覽器沒有CSP問題</li>
            <li>❌ 如果主頁面還是沒有建議面板，表示Vercel部署有問題</li>
            <li>🔧 解決方案: 等待Vercel部署完成，或清除瀏覽器快取</li>
          </ul>
        </div>
      </div>
    </div>
  )
}