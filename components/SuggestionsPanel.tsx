'use client'
import { useState, useEffect } from 'react'

interface Suggestion {
  id: number
  tenant_name: string
  room_number: string
  check_in_date: string
  rent_amount: number
  suggested_charges: Array<{
    type: 'deposit' | 'rent' | 'electricity'
    reason: string
    amount: number
    notes?: string
  }>
}

export default function SuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  
  const fetchSuggestions = async () => {
    setLoading(true)
    setError('')
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
      const response = await fetch(`${API_URL}/charges/suggested`)
      const data = await response.json()
      
      if (data.success) {
        setSuggestions(data.data.tenants || [])
      } else {
        setError(data.error || '計算失敗')
      }
    } catch (err: any) {
      setError(err.message || '網路錯誤')
    } finally {
      setLoading(false)
    }
  }
  
  const generatePayment = async (tenantId: number, chargeTypes: string[]) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
      const response = await fetch(`${API_URL}/charges/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          charges: chargeTypes
        })
      })
      
      const data = await response.json()
      if (data.success) {
        alert(`✅ 成功生成 ${data.data.summary.generated_count} 筆繳費記錄`)
        fetchSuggestions() // 重新載入
      } else {
        alert(`❌ 生成失敗: ${data.error}`)
      }
    } catch (err: any) {
      alert(`❌ 生成失敗: ${err.message}`)
    }
  }
  
  useEffect(() => {
    fetchSuggestions()
  }, [])
  
  const totalAmount = suggestions.reduce((sum, tenant) => {
    return sum + tenant.suggested_charges.reduce((s, charge) => s + charge.amount, 0)
  }, 0)
  
  return (
    <div className="mb-6">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-amber-800 flex items-center gap-2">
            <span>💡</span>
            建議繳費項目
            {suggestions.length > 0 && (
              <span className="text-xs bg-amber-600 text-white px-2 py-1 rounded-full">
                {suggestions.length}個租客
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchSuggestions}
              disabled={loading}
              className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-sm flex items-center gap-1"
            >
              {loading ? '🔄 計算中...' : '🔄 重新計算'}
            </button>
            
            {suggestions.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`確定要為所有 ${suggestions.length} 個租客生成繳費記錄嗎？`)) {
                    suggestions.forEach(tenant => {
                      const chargeTypes = tenant.suggested_charges.map(c => c.type)
                      if (chargeTypes.length > 0) {
                        generatePayment(tenant.id, chargeTypes)
                      }
                    })
                  }
                }}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-sm"
              >
                批量生成全部
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            ❌ {error}
          </div>
        )}
        
        {loading && suggestions.length === 0 ? (
          <div className="py-4 text-center text-gray-600">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto mb-2"></div>
            載入建議項目中...
          </div>
        ) : suggestions.length === 0 ? (
          <div className="py-4 text-center text-gray-600">
            目前沒有建議繳費項目
          </div>
        ) : (
          <>
            <div className="mb-3 text-sm text-gray-600">
              系統自動計算租客的應繳項目，總金額: <span className="font-bold">{new Intl.NumberFormat('zh-TW').format(totalAmount)}元</span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {suggestions.map((tenant) => {
                const tenantTotal = tenant.suggested_charges.reduce((sum, charge) => sum + charge.amount, 0)
                return (
                  <div key={tenant.id} className="p-3 bg-white border border-amber-100 rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">{tenant.tenant_name}</div>
                        <div className="text-sm text-gray-600">
                          {tenant.room_number} • 入住: {tenant.check_in_date.split('T')[0]} • 月租: {new Intl.NumberFormat('zh-TW').format(tenant.rent_amount)}元
                        </div>
                      </div>
                      <div className="font-bold text-amber-700">
                        {new Intl.NumberFormat('zh-TW').format(tenantTotal)}元
                      </div>
                    </div>
                    
                    <div className="mt-2 space-y-2">
                      {tenant.suggested_charges.map((charge, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center gap-2">
                            <span>
                              {charge.type === 'deposit' ? '🏦' : 
                               charge.type === 'rent' ? '💰' : '⚡'}
                            </span>
                            <span>{charge.reason}</span>
                          </div>
                          <div className="font-medium">
                            {new Intl.NumberFormat('zh-TW').format(charge.amount)}元
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => {
                        const chargeTypes = tenant.suggested_charges.map(c => c.type)
                        if (chargeTypes.length > 0) {
                          generatePayment(tenant.id, chargeTypes)
                        }
                      }}
                      className="mt-3 w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded text-sm"
                    >
                      為此租客生成繳費記錄
                    </button>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-4 pt-3 border-t border-amber-200 text-sm text-amber-700">
              💡 提示: 生成繳費記錄後，項目會出現在下方的「待收款項」中
            </div>
          </>
        )}
      </div>
    </div>
  )
}