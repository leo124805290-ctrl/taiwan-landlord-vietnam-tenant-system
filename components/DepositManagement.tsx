'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'

interface DepositRecord {
  id: number
  propertyId: number
  propertyName: string
  roomId: number
  roomNumber: string
  tenantName: string
  amount: number
  status: 'occupied' | 'pending'
  contractStart: string
  contractEnd: string
  receivedDate: string
  paymentId: number
  notes?: string
}

interface MonthDepositSummary {
  month: string  // YYYY/MM
  count: number
  totalAmount: number
  records: DepositRecord[]
}

export default function DepositManagement() {
  const { state } = useApp()
  
  // 狀態管理
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | number>('all')
  const [depositRecords, setDepositRecords] = useState<DepositRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<DepositRecord[]>([])
  const [summary, setSummary] = useState({
    totalAmount: 0,
    occupiedCount: 0,
    occupiedAmount: 0,
    pendingCount: 0,
    pendingAmount: 0
  })
  
  const [expiringDeposits, setExpiringDeposits] = useState<MonthDepositSummary[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const [selectedMonthDetails, setSelectedMonthDetails] = useState<DepositRecord[]>([])
  const [selectedDepositDetail, setSelectedDepositDetail] = useState<any>(null)
  
  // 獲取所有押金記錄
  const getAllDepositRecords = (): DepositRecord[] => {
    const records: DepositRecord[] = []
    
    // 遍歷所有物業
    state.data.properties.forEach(property => {
      // 如果選擇了特定物業，跳過其他物業
      if (selectedPropertyId !== 'all' && property.id !== Number(selectedPropertyId)) {
        return
      }
      
      // 獲取該物業的所有押金付款記錄
      const depositPayments = (property.payments || [])
        .filter((payment: any) => payment.paymentType === 'deposit')
      
      // 獲取該物業的所有房間
      const rooms = property.rooms || []
      
      // 處理每筆押金記錄
      depositPayments.forEach((payment: any) => {
        const room = rooms.find((r: any) => r.id === payment.rid)
        if (!room) return
        
        // 判斷押金狀態
        let status: 'occupied' | 'pending' = 'pending'
        
        if (room.s === 'occupied') {
          status = 'occupied'
        } else if (room.s === 'available' || room.s === 'maintenance') {
          status = 'pending'
        }
        
        // 只處理 occupied 和 pending 狀態的押金
        // 其他狀態（如已退租）的押金已經退還，不在此處顯示
        
        records.push({
          id: payment.id,
          propertyId: property.id,
          propertyName: property.name,
          roomId: payment.rid,
          roomNumber: room.n,
          tenantName: payment.t || room.t || '未知租客',
          amount: payment.total || payment.r || 0,
          status,
          contractStart: room.in || payment.due || '',
          contractEnd: room.out || '',
          receivedDate: payment.paid || payment.due || '',
          paymentId: payment.id,
          notes: payment.notes
        })
      })
    })
    
    return records
  }
  
  // 計算統計摘要
  const calculateSummary = (records: DepositRecord[]) => {
    const summary = {
      totalAmount: 0,
      occupiedCount: 0,
      occupiedAmount: 0,
      pendingCount: 0,
      pendingAmount: 0
    }
    
    records.forEach(record => {
      summary.totalAmount += record.amount
      
      if (record.status === 'occupied') {
        summary.occupiedCount++
        summary.occupiedAmount += record.amount
      } else if (record.status === 'pending') {
        summary.pendingCount++
        summary.pendingAmount += record.amount
      }
    })
    
    return summary
  }
  
  // 計算到期押金
  const calculateExpiringDeposits = (records: DepositRecord[]): MonthDepositSummary[] => {
    // 只計算已入住狀態的押金
    const occupiedDeposits = records.filter(r => r.status === 'occupied')
    
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1  // 1-12
    
    // 計算未來3個月的月份
    const nextMonths: string[] = []
    for (let i = 1; i <= 3; i++) {
      let year = currentYear
      let month = currentMonth + i
      
      if (month > 12) {
        year += Math.floor((month - 1) / 12)
        month = ((month - 1) % 12) + 1
      }
      
      nextMonths.push(`${year}/${String(month).padStart(2, '0')}`)
    }
    
    // 按月分組
    const monthSummaries: MonthDepositSummary[] = nextMonths.map(month => ({
      month,
      count: 0,
      totalAmount: 0,
      records: []
    }))
    
    // 填充數據
    occupiedDeposits.forEach(record => {
      if (!record.contractEnd) return
      
      const endDate = new Date(record.contractEnd)
      const endYear = endDate.getFullYear()
      const endMonth = endDate.getMonth() + 1
      const monthKey = `${endYear}/${String(endMonth).padStart(2, '0')}`
      
      const monthIndex = nextMonths.indexOf(monthKey)
      if (monthIndex !== -1) {
        monthSummaries[monthIndex].count++
        monthSummaries[monthIndex].totalAmount += record.amount
        monthSummaries[monthIndex].records.push(record)
      }
    })
    
    // 過濾掉沒有記錄的月份
    return monthSummaries.filter(month => month.count > 0)
  }
  
  // 初始化數據
  useEffect(() => {
    const allRecords = getAllDepositRecords()
    const newSummary = calculateSummary(allRecords)
    const newExpiringDeposits = calculateExpiringDeposits(allRecords)
    
    setDepositRecords(allRecords)
    setFilteredRecords(allRecords)
    setSummary(newSummary)
    setExpiringDeposits(newExpiringDeposits)
  }, [state.data, selectedPropertyId])
  
  // 處理月份卡片點擊
  const handleMonthCardClick = (month: string) => {
    const monthData = expiringDeposits.find(m => m.month === month)
    if (monthData) {
      setSelectedMonth(month)
      setSelectedMonthDetails(monthData.records)
    }
  }
  
  // 關閉詳細資料彈窗
  const closeDetailsModal = () => {
    setSelectedMonth(null)
    setSelectedMonthDetails([])
  }
  
  // 獲取詳細付款記錄
  const getPaymentDetail = (record: DepositRecord) => {
    const property = state.data.properties.find(p => p.id === record.propertyId)
    if (!property) return null
    
    const payment = (property.payments || []).find((p: any) => p.id === record.paymentId)
    return payment
  }
  
  // 查看押金詳細資料
  const viewDepositDetail = (record: DepositRecord) => {
    const paymentDetail = getPaymentDetail(record)
    if (paymentDetail) {
      setSelectedDepositDetail({
        ...record,
        paymentDetail
      })
    }
  }
  
  // 關閉押金詳細資料彈窗
  const closeDepositDetailModal = () => {
    setSelectedDepositDetail(null)
  }
  
  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💰</div>
            <div>
              <h1 className="text-2xl font-bold">押金管理</h1>
              <div className="text-gray-600 mt-1">管理押金（保管金）與合約到期預警</div>
            </div>
          </div>
          
          {/* 物業篩選器 */}
          <div className="w-64">
            <label className="block text-sm font-medium mb-1">篩選物業</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value="all">全部物業</option>
              {state.data.properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* 押金總覽 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 總押金金額 */}
        <div className="bg-white p-5 rounded-lg border">
          <div className="text-sm text-gray-600">總押金金額</div>
          <div className="text-2xl font-bold mt-2">{formatCurrency(summary.totalAmount)}</div>
          <div className="text-sm text-gray-500 mt-1">
            {summary.occupiedCount + summary.pendingCount} 筆記錄
          </div>
        </div>
        
        {/* 已入住押金 */}
        <div className="bg-white p-5 rounded-lg border">
          <div className="text-sm text-gray-600">已入住押金</div>
          <div className="text-2xl font-bold mt-2">{formatCurrency(summary.occupiedAmount)}</div>
          <div className="text-sm text-gray-500 mt-1">
            {summary.occupiedCount} 筆記錄
          </div>
          <div className="text-xs text-green-600 mt-1">
            ✅ 租客已入住
          </div>
        </div>
        
        {/* 待入住押金 */}
        <div className="bg-white p-5 rounded-lg border">
          <div className="text-sm text-gray-600">待入住押金</div>
          <div className="text-2xl font-bold mt-2">{formatCurrency(summary.pendingAmount)}</div>
          <div className="text-sm text-gray-500 mt-1">
            {summary.pendingCount} 筆記錄
          </div>
          <div className="text-xs text-amber-600 mt-1">
            ⏳ 等待入住
          </div>
        </div>
      </div>
      
      {/* 合約到期預警 */}
      <div className="bg-white p-5 rounded-lg border">
        <h3 className="text-lg font-bold mb-4">合約到期預警（未來3個月）</h3>
        
        {expiringDeposits.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <div className="text-4xl mb-3">🎉</div>
            <div>未來3個月內沒有即將到期的押金</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {expiringDeposits.map(monthData => (
              <button
                key={monthData.month}
                onClick={() => handleMonthCardClick(monthData.month)}
                className="p-4 border rounded-lg hover:shadow transition text-left bg-amber-50 border-amber-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-lg">{monthData.month}</div>
                  <div className="text-2xl">📅</div>
                </div>
                <div className="text-sm text-gray-600">即將到期押金</div>
                <div className="text-xl font-bold mt-1">{formatCurrency(monthData.totalAmount)}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {monthData.count} 筆記錄
                </div>
                <div className="text-xs text-amber-600 mt-2">
                  👆 點擊查看詳細資料
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* 押金詳細列表 */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-bold">押金詳細列表</h3>
          <div className="text-sm text-gray-600">
            共 {depositRecords.length} 筆押金記錄
          </div>
        </div>
        
        {depositRecords.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-3">📭</div>
            <div>沒有押金記錄</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left py-3 px-4 font-medium">物業</th>
                  <th className="text-left py-3 px-4 font-medium">房間</th>
                  <th className="text-left py-3 px-4 font-medium">租客</th>
                  <th className="text-left py-3 px-4 font-medium">押金金額</th>
                  <th className="text-left py-3 px-4 font-medium">狀態</th>
                  <th className="text-left py-3 px-4 font-medium">合約期間</th>
                  <th className="text-left py-3 px-4 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {depositRecords.map(record => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{record.propertyName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{record.roomNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{record.tenantName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{formatCurrency(record.amount)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        record.status === 'occupied'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {record.status === 'occupied' ? '✅ 已入住' : '⏳ 待入住'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {record.contractStart ? new Date(record.contractStart).toLocaleDateString('zh-TW') : '-'}
                        {' → '}
                        {record.contractEnd ? new Date(record.contractEnd).toLocaleDateString('zh-TW') : '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => viewDepositDetail(record)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded text-sm"
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 詳細資料彈窗 */}
      {selectedMonth && selectedMonthDetails.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* 彈窗標題 */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">{selectedMonth} 到期押金詳細資料</h3>
                <div className="text-sm text-gray-600">
                  {selectedMonthDetails.length} 筆記錄，總金額 {formatCurrency(
                    selectedMonthDetails.reduce((sum, record) => sum + record.amount, 0)
                  )}
                </div>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-2xl hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            {/* 詳細列表 */}
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-3 px-4 font-medium">物業</th>
                    <th className="text-left py-3 px-4 font-medium">房間</th>
                    <th className="text-left py-3 px-4 font-medium">租客</th>
                    <th className="text-left py-3 px-4 font-medium">押金金額</th>
                    <th className="text-left py-3 px-4 font-medium">合約結束日</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedMonthDetails.map(record => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{record.propertyName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{record.roomNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{record.tenantName}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{formatCurrency(record.amount)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          {record.contractEnd ? new Date(record.contractEnd).toLocaleDateString('zh-TW') : '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 彈窗底部 */}
            <div className="p-4 border-t">
              <button
                onClick={closeDetailsModal}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 押金詳細資料彈窗 */}
      {selectedDepositDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* 彈窗標題 */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold">押金詳細資料</h3>
                <div className="text-sm text-gray-600">
                  {selectedDepositDetail.propertyName} - {selectedDepositDetail.roomNumber}
                </div>
              </div>
              <button
                onClick={closeDepositDetailModal}
                className="text-2xl hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            {/* 詳細資料內容 */}
            <div className="overflow-y-auto max-h-[60vh] p-4">
              <div className="space-y-4">
                {/* 基本資訊 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">物業名稱</div>
                    <div className="font-medium">{selectedDepositDetail.propertyName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">房間號碼</div>
                    <div className="font-medium">{selectedDepositDetail.roomNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">租客姓名</div>
                    <div className="font-medium">{selectedDepositDetail.tenantName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">押金金額</div>
                    <div className="font-medium">{formatCurrency(selectedDepositDetail.amount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">狀態</div>
                    <div className={`px-2 py-1 rounded-full text-xs inline-block ${
                      selectedDepositDetail.status === 'occupied'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedDepositDetail.status === 'occupied' ? '✅ 已入住' : '⏳ 待入住'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">付款ID</div>
                    <div className="font-medium">{selectedDepositDetail.paymentId}</div>
                  </div>
                </div>
                
                {/* 合約期間 */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">合約期間</div>
                  <div className="font-medium">
                    {selectedDepositDetail.contractStart ? new Date(selectedDepositDetail.contractStart).toLocaleDateString('zh-TW') : '-'}
                    {' → '}
                    {selectedDepositDetail.contractEnd ? new Date(selectedDepositDetail.contractEnd).toLocaleDateString('zh-TW') : '-'}
                  </div>
                </div>
                
                {/* 收款資訊 */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">收款日期</div>
                  <div className="font-medium">
                    {selectedDepositDetail.receivedDate ? new Date(selectedDepositDetail.receivedDate).toLocaleDateString('zh-TW') : '-'}
                  </div>
                </div>
                
                {/* 付款記錄詳細資料 */}
                {selectedDepositDetail.paymentDetail && (
                  <div className="border-t pt-4">
                    <h4 className="font-bold mb-2">付款記錄詳細資料</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <pre className="text-sm whitespace-pre-wrap">
                        {JSON.stringify(selectedDepositDetail.paymentDetail, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {/* 備註 */}
                {selectedDepositDetail.notes && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">備註</div>
                    <div className="bg-gray-50 p-3 rounded">
                      {selectedDepositDetail.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* 彈窗底部 */}
            <div className="p-4 border-t">
              <button
                onClick={closeDepositDetailModal}
                className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 使用說明 */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-bold text-blue-800 mb-2">💡 使用說明</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>已入住押金</strong>：租客已入住，押金已收到並保管中</li>
          <li>• <strong>待入住押金</strong>：押金已收到，但租客尚未入住</li>
          <li>• <strong>合約到期預警</strong>：顯示未來3個月內即將到期的押金</li>
          <li>• <strong>點擊月份卡片</strong>：查看該月份到期的詳細客戶資料</li>
          <li>• <strong>點擊查看按鈕</strong>：查看押金記錄的完整建檔資料</li>
          <li>• <strong>物業篩選</strong>：使用右上角篩選器查看特定物業的押金</li>
          <li>• <strong>押金退還</strong>：一律按原押金金額退還，不考慮折舊或扣款</li>
          <li>• <strong>提前解約</strong>：已在退房時處理，不在此處計算</li>
        </ul>
      </div>
    </div>
  )
}