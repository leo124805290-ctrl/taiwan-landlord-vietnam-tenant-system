'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'

export default function BackfillHistory() {
  const { state } = useApp()
  
  // 篩選狀態
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | number>('all')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedRoom, setSelectedRoom] = useState<string>('all')
  const [selectedTenant, setSelectedTenant] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  
  // 數據狀態
  const [backfillRecords, setBackfillRecords] = useState<any[]>([])
  const [summary, setSummary] = useState({
    total: 0,
    totalAmount: 0,
    paid: 0,
    pending: 0,
    deposit: 0,
    rent: 0
  })
  
  // 獲取所有物業
  const allProperties = state.data.properties
  
  // 獲取當前物業
  const currentProperty = selectedPropertyId === 'all' 
    ? null 
    : state.data.properties.find(p => p.id === Number(selectedPropertyId))
  
  // 獲取所有補登記錄
  const getAllBackfillRecords = () => {
    let allRecords: any[] = []
    
    // 遍歷所有物業
    state.data.properties.forEach(property => {
      if (selectedPropertyId !== 'all' && property.id !== Number(selectedPropertyId)) {
        return
      }
      
      // 獲取該物業的所有補登記錄
      const propertyBackfillRecords = (property.payments || [])
        .filter((payment: any) => payment.isBackfill)
        .map((payment: any) => ({
          ...payment,
          propertyName: property.name,
          propertyId: property.id
        }))
      
      allRecords = [...allRecords, ...propertyBackfillRecords]
    })
    
    return allRecords
  }
  
  // 應用篩選
  const applyFilters = (records: any[]) => {
    let filtered = [...records]
    
    // 按月份篩選
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(record => record.m === selectedMonth)
    }
    
    // 按房間篩選
    if (selectedRoom !== 'all') {
      filtered = filtered.filter(record => record.n === selectedRoom)
    }
    
    // 按租客篩選
    if (selectedTenant !== 'all') {
      filtered = filtered.filter(record => record.t === selectedTenant)
    }
    
    // 按狀態篩選
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(record => record.s === selectedStatus)
    }
    
    return filtered
  }
  
  // 計算統計
  const calculateSummary = (records: any[]) => {
    const summary = {
      total: records.length,
      totalAmount: 0,
      paid: 0,
      pending: 0,
      deposit: 0,
      rent: 0
    }
    
    records.forEach(record => {
      summary.totalAmount += record.total || 0
      
      if (record.s === 'paid') {
        summary.paid++
      } else if (record.s === 'pending') {
        summary.pending++
      }
      
      if (record.paymentType === 'deposit') {
        summary.deposit++
      } else if (record.paymentType === 'rent') {
        summary.rent++
      }
    })
    
    return summary
  }
  
  // 更新數據
  useEffect(() => {
    const allRecords = getAllBackfillRecords()
    const filteredRecords = applyFilters(allRecords)
    const newSummary = calculateSummary(filteredRecords)
    
    setBackfillRecords(filteredRecords)
    setSummary(newSummary)
  }, [selectedPropertyId, selectedMonth, selectedRoom, selectedTenant, selectedStatus, state.data])
  
  // 獲取可用的篩選選項
  const getFilterOptions = () => {
    const allRecords = getAllBackfillRecords()
    
    // 月份選項
    const months = Array.from(new Set(allRecords.map(record => record.m))).sort()
    
    // 房間選項
    const rooms = Array.from(new Set(allRecords.map(record => record.n))).sort()
    
    // 租客選項
    const tenants = Array.from(new Set(allRecords.map(record => record.t))).sort()
    
    return { months, rooms, tenants }
  }
  
  const { months, rooms, tenants } = getFilterOptions()
  
  // 導出數據
  const exportData = () => {
    const data = backfillRecords.map(record => ({
      物業: record.propertyName,
      房間: record.n,
      租客: record.t,
      月份: record.m,
      類型: record.paymentType === 'deposit' ? '押金' : '租金',
      租金: record.r,
      電費: record.e,
      總金額: record.total,
      狀態: record.s === 'paid' ? '已收款' : '待確認',
      備註: record.notes || ''
    }))
    
    const csv = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `補登記錄_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }
  
  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📊</div>
            <div>
              <h1 className="text-2xl font-bold">補登記錄查詢</h1>
              <div className="text-gray-600 mt-1">查詢和管理歷史補登記錄</div>
            </div>
          </div>
          <button
            onClick={exportData}
            disabled={backfillRecords.length === 0}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              backfillRecords.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <span>📥</span>
            <span>導出 CSV</span>
          </button>
        </div>
      </div>
      
      {/* 篩選面板 */}
      <div className="bg-white p-5 rounded-lg border">
        <h3 className="text-lg font-bold mb-4">篩選條件</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* 物業篩選 */}
          <div>
            <label className="block text-sm font-medium mb-1">物業</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">全部物業</option>
              {allProperties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* 月份篩選 */}
          <div>
            <label className="block text-sm font-medium mb-1">月份</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">全部月份</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          
          {/* 房間篩選 */}
          <div>
            <label className="block text-sm font-medium mb-1">房間</label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">全部房間</option>
              {rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
          
          {/* 租客篩選 */}
          <div>
            <label className="block text-sm font-medium mb-1">租客</label>
            <select
              value={selectedTenant}
              onChange={(e) => setSelectedTenant(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">全部租客</option>
              {tenants.map(tenant => (
                <option key={tenant} value={tenant}>{tenant}</option>
              ))}
            </select>
          </div>
          
          {/* 狀態篩選 */}
          <div>
            <label className="block text-sm font-medium mb-1">狀態</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="all">全部狀態</option>
              <option value="paid">已收款</option>
              <option value="pending">待確認</option>
            </select>
          </div>
        </div>
        
        {/* 重置按鈕 */}
        <div className="mt-4">
          <button
            onClick={() => {
              setSelectedPropertyId('all')
              setSelectedMonth('all')
              setSelectedRoom('all')
              setSelectedTenant('all')
              setSelectedStatus('all')
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            重置篩選
          </button>
        </div>
      </div>
      
      {/* 統計摘要 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">總記錄數</div>
          <div className="text-2xl font-bold mt-1">{summary.total}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">總金額</div>
          <div className="text-2xl font-bold mt-1">{formatCurrency(summary.totalAmount)}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">已收款</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{summary.paid}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">待確認</div>
          <div className="text-2xl font-bold mt-1 text-amber-600">{summary.pending}</div>
        </div>
      </div>
      
      {/* 記錄列表 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-bold">補登記錄</h3>
          <div className="text-sm text-gray-600">
            共 {backfillRecords.length} 筆記錄
          </div>
        </div>
        
        {backfillRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <div>沒有找到符合條件的補登記錄</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-medium">物業</th>
                  <th className="text-left py-3 px-4 font-medium">房間</th>
                  <th className="text-left py-3 px-4 font-medium">租客</th>
                  <th className="text-left py-3 px-4 font-medium">月份</th>
                  <th className="text-left py-3 px-4 font-medium">類型</th>
                  <th className="text-left py-3 px-4 font-medium">金額</th>
                  <th className="text-left py-3 px-4 font-medium">狀態</th>
                </tr>
              </thead>
              <tbody>
                {backfillRecords.map((record, index) => (
                  <tr 
                    key={index}
                    className={`border-b hover:bg-gray-50 ${
                      record.isBackfill ? 'bg-amber-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium">{record.propertyName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{record.n}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{record.t}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{record.m}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        record.paymentType === 'deposit' 
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {record.paymentType === 'deposit' ? '押金' : '租金'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{formatCurrency(record.total)}</div>
                      {record.e > 0 && (
                        <div className="text-xs text-gray-600">
                          電費: {formatCurrency(record.e)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        record.s === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {record.s === 'paid' ? '✅ 已收款' : '⏳ 待確認'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 使用說明 */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-bold text-blue-800 mb-2">💡 使用說明</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• 使用篩選條件查詢特定的補登記錄</li>
          <li>• 點擊「導出 CSV」按鈕可以下載查詢結果</li>
          <li>• 補登記錄會在繳費分頁中顯示，並標記為「補登」</li>
          <li>• 已收款的補登記錄會影響對應月份的現金流統計</li>
          <li>• 待確認的補登記錄需要在繳費分頁手動確認收款</li>
        </ul>
      </div>
    </div>
  )
}