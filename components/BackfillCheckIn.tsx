'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency, formatDate, getMonthEndDate } from '@/lib/utils'
import { t } from '@/lib/translations'

export default function BackfillCheckIn() {
  const { state, updateData, getCurrentProperty } = useApp()
  
  // 狀態管理
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [checkInDate, setCheckInDate] = useState<string>('')
  const [tenantName, setTenantName] = useState('')
  const [tenantPhone, setTenantPhone] = useState('')
  const [contractMonths, setContractMonths] = useState(12)
  const [paymentOption, setPaymentOption] = useState<'full' | 'deposit_only' | 'reservation_only'>('full')
  const [backfillStatus, setBackfillStatus] = useState<'paid' | 'pending'>('paid')
  
  // 計算數據
  const [backfillPreview, setBackfillPreview] = useState<any[]>([])
  const [backfillSummary, setBackfillSummary] = useState({ total: 0, amount: 0, deposit: 0, rent: 0, electricity: 0 })
  const [electricityRates, setElectricityRates] = useState<{[key: string]: number}>({}) // 儲存各月電費金額
  const [electricityDetails, setElectricityDetails] = useState<{[key: string]: {
    previousReading: number
    currentReading: number
    rate: number
    usage: number
    amount: number
  }}>({}) // 儲存各月電費詳細資訊
  
  // 錯誤狀態
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // 獲取當前物業
  const property = selectedPropertyId 
    ? state.data.properties.find(p => p.id === selectedPropertyId)
    : getCurrentProperty()
  
  // 獲取所有物業
  const allProperties = state.data.properties
  
  // 獲取可補登的房間（空房或待出租）
  const availableRooms = property?.rooms?.filter(room => 
    room.s === 'available' || room.s === 'pending_rental'
  ) || []
  
  // 當選擇變化時重新計算補登預覽
  useEffect(() => {
    calculateBackfillPreview()
  }, [selectedRoomId, checkInDate, property])
  
  // 計算補登預覽
  const calculateBackfillPreview = () => {
    if (!selectedRoomId || !checkInDate || !property) {
      setBackfillPreview([])
      setBackfillSummary({ total: 0, amount: 0, deposit: 0, rent: 0, electricity: 0 })
      return
    }
    
    const room = property.rooms.find(r => r.id === selectedRoomId)
    if (!room) return
    
    const startDate = new Date(checkInDate)
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // 檢查是否為歷史日期
    if (startDate >= firstDayOfMonth) {
      setBackfillPreview([])
      setBackfillSummary({ total: 0, amount: 0, deposit: 0, rent: 0, electricity: 0 })
      return
    }
    
    // 計算需要補登的月份
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    
    // 計算月份差（從起租月到當前月）
    // 注意：需要包含當前月份，所以月份差要加1
    // 但如果是當月入住（startDate >= firstDayOfMonth），則不需要補登
    const monthDiff = (currentYear - startYear) * 12 + (currentMonth - startMonth)
    const backfillMonthCount = Math.max(0, monthDiff + 1) // 包含當前月份，所以要加1
    
    const preview = []
    let totalAmount = 0
    let depositCount = 0
    let rentCount = 0
    let electricityTotal = 0
    
    // 押金補登
    if (room.d && room.d > 0) {
      preview.push({
        type: 'deposit',
        month: `${startYear}/${String(startMonth + 1).padStart(2, '0')}`,
        amount: room.d,
        description: '押金（一次性）'
      })
      totalAmount += room.d
      depositCount++
    }
    
    // 租金補登（從起租月到當前月）
    for (let i = 0; i < backfillMonthCount; i++) {
      const monthOffset = i
      const backfillYear = startYear + Math.floor((startMonth + monthOffset) / 12)
      const backfillMonth = (startMonth + monthOffset) % 12 + 1
      
      // 判斷是否是入住當月（只有租金和押金，沒有電費）
      const isCheckInMonth = i === 0
      
      const monthKey = `${backfillYear}/${String(backfillMonth).padStart(2, '0')}`
      const electricityAmount = electricityRates[monthKey] || 0
      
      preview.push({
        type: 'rent',
        month: monthKey,
        amount: room.r,
        electricity: electricityAmount,
        total: room.r + electricityAmount,
        description: isCheckInMonth ? '月租金（入住當月）' : '月租金',
        isCheckInMonth: isCheckInMonth
      })
      totalAmount += room.r + electricityAmount
      electricityTotal += electricityAmount
      rentCount++
    }
    
    setBackfillPreview(preview)
    setBackfillSummary({
      total: preview.length,
      amount: totalAmount,
      deposit: depositCount,
      rent: rentCount,
      electricity: electricityTotal
    })
  }
  
  // 生成補登記錄
  const generateBackfillRecords = () => {
    // 防呆處理：檢查所有必填欄位
    const errors = []
    
    if (!selectedRoomId) {
      errors.push('請選擇房間')
    }
    
    if (!checkInDate) {
      errors.push('請選擇入住日期')
    } else {
      const startDate = new Date(checkInDate)
      const today = new Date()
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      
      if (startDate >= firstDayOfMonth) {
        errors.push('請選擇歷史日期（早於當前月份第一天）')
      }
    }
    
    if (!tenantName.trim()) {
      errors.push('請輸入租客姓名')
    }
    
    if (errors.length > 0) {
      alert(`❌ 請修正以下問題：\n\n• ${errors.join('\n• ')}`)
      return
    }
    
    if (!property) {
      alert('請選擇物業')
      return
    }
    
    const room = property.rooms.find(r => r.id === selectedRoomId)
    if (!room) return
    
    const startDate = new Date(checkInDate)
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // 再次檢查是否為歷史日期
    if (startDate >= firstDayOfMonth) {
      alert('請選擇歷史日期（早於當前月份第一天）')
      return
    }
    
    // 計算需要補登的月份
    const startYear = startDate.getFullYear()
    const startMonth = startDate.getMonth()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    
    // 計算月份差（從起租月到當前月）
    // 注意：需要包含當前月份，所以月份差要加1
    // 但如果是當月入住（startDate >= firstDayOfMonth），則不需要補登
    const monthDiff = (currentYear - startYear) * 12 + (currentMonth - startMonth)
    const backfillMonthCount = Math.max(0, monthDiff + 1) // 包含當前月份，所以要加1
    
    // 生成付款記錄
    const newPayments = []
    let paymentId = Math.max(...(property.payments || []).map((p: any) => p.id), 0) + 1
    
    // 押金補登記錄
    if (room.d && room.d > 0) {
      newPayments.push({
        id: paymentId++,
        rid: selectedRoomId,
        n: room.n,
        t: tenantName.trim(),
        m: `${startYear}/${String(startMonth + 1).padStart(2, '0')}`,
        r: 0,
        e: 0,
        total: room.d,
        due: checkInDate,
        s: backfillStatus,
        paid: backfillStatus === 'paid' ? checkInDate : undefined,
        archived: backfillStatus === 'paid',
        paymentType: 'deposit',
        isBackfill: true,
        notes: `歷史日期補登 - 押金 (${tenantName.trim()})`
      })
    }
    
    // 租金補登記錄（從起租月到當前月）
    for (let i = 0; i < backfillMonthCount; i++) {
      const monthOffset = i
      const backfillYear = startYear + Math.floor((startMonth + monthOffset) / 12)
      const backfillMonth = (startMonth + monthOffset) % 12 + 1
      const monthKey = `${backfillYear}/${String(backfillMonth).padStart(2, '0')}`
      const electricityAmount = electricityRates[monthKey] || 0
      
      const electricityDetail = electricityDetails[monthKey]
      
      newPayments.push({
        id: paymentId++,
        rid: selectedRoomId,
        n: room.n,
        t: tenantName.trim(),
        m: monthKey,
        r: room.r,
        e: electricityAmount,
        total: room.r + electricityAmount,
        due: `${backfillYear}-${String(backfillMonth).padStart(2, '0')}-28`,
        s: backfillStatus,
        paid: backfillStatus === 'paid' ? `${backfillYear}-${String(backfillMonth).padStart(2, '0')}-28` : undefined,
        archived: backfillStatus === 'paid',
        paymentType: 'rent',
        isBackfill: true,
        // 電費詳細資訊
        u: electricityDetail?.usage || 0, // 用電度數
        lastMeter: electricityDetail?.previousReading || 0, // 前期度數
        lastMeterUsage: electricityDetail?.usage || 0, // 用電度數
        electricityRate: electricityDetail?.rate || state.data.electricityRate || 5, // 電費單價
        notes: `歷史日期補登 - ${backfillYear}/${backfillMonth} 租金${electricityAmount > 0 ? ` + 電費${electricityAmount}元 (${electricityDetail?.usage || 0}度)` : ''} (${tenantName.trim()})`
      })
    }
    
    // 更新房間狀態
    const updatedRooms = property.rooms.map((r: any) => {
      if (r.id === selectedRoomId) {
        return {
          ...r,
          s: 'occupied',
          t: tenantName.trim(),
          p: tenantPhone.trim(),
          in: checkInDate,
          out: getMonthEndDate(checkInDate, contractMonths)
        }
      }
      return r
    })
    
    // 更新物業數據
    const updatedProperties = (state.data?.properties || []).map((p: any) => {
      if (p.id === property.id) {
        return {
          ...p,
          rooms: updatedRooms,
          payments: [...(p.payments || []), ...newPayments]
        }
      }
      return p
    })
    
    // 保存數據
    updateData({
      properties: updatedProperties
    })
    
    // 顯示成功訊息
    const statusText = backfillStatus === 'paid' ? '已收款' : '待確認'
    alert(`✅ 補登入住成功！
    
    • 房間：${room.n}
    • 租客：${tenantName.trim()}
    • 入住日期：${checkInDate}
    • 補登記錄：${newPayments.length} 筆
    • 收款狀態：${statusText}
    
    補登記錄已生成，可在繳費分頁中查看。`)
    
    // 重置表單
    resetForm()
  }
  
  // 更新電費詳細資訊
  const updateElectricityDetails = (monthKey: string, field: string, value: number) => {
    const currentDetails = electricityDetails[monthKey] || {
      previousReading: 0,
      currentReading: 0,
      rate: state.data.electricityRate || 5, // 默認每度5元
      usage: 0,
      amount: 0
    }
    
    const updatedDetails = { ...currentDetails }
    
    switch (field) {
      case 'previousReading':
        updatedDetails.previousReading = value
        break
      case 'currentReading':
        updatedDetails.currentReading = value
        break
      case 'rate':
        updatedDetails.rate = value
        break
    }
    
    // 計算用電度數和金額
    updatedDetails.usage = Math.max(0, updatedDetails.currentReading - updatedDetails.previousReading)
    updatedDetails.amount = updatedDetails.usage * updatedDetails.rate
    
    // 更新狀態
    setElectricityDetails(prev => ({
      ...prev,
      [monthKey]: updatedDetails
    }))
    
    setElectricityRates(prev => ({
      ...prev,
      [monthKey]: updatedDetails.amount
    }))
    
    // 重新計算預覽
    setTimeout(() => {
      calculateBackfillPreview()
    }, 100)
  }
  
  // 簡化函數：直接更新電費金額（兼容舊代碼）
  const updateElectricity = (monthKey: string, amount: number) => {
    const currentDetails = electricityDetails[monthKey] || {
      previousReading: 0,
      currentReading: 0,
      rate: state.data.electricityRate || 5,
      usage: 0,
      amount: 0
    }
    
    const updatedDetails = {
      ...currentDetails,
      amount: amount,
      usage: amount > 0 ? Math.ceil(amount / currentDetails.rate) : 0,
      currentReading: currentDetails.previousReading + Math.ceil(amount / currentDetails.rate)
    }
    
    setElectricityDetails(prev => ({
      ...prev,
      [monthKey]: updatedDetails
    }))
    
    setElectricityRates(prev => ({
      ...prev,
      [monthKey]: amount
    }))
    
    setTimeout(() => {
      calculateBackfillPreview()
    }, 100)
  }
  
  // 驗證函數
  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case 'tenantName':
        if (!value.trim()) {
          newErrors.tenantName = '請輸入租客姓名'
        } else {
          delete newErrors.tenantName
        }
        break
        
      case 'checkInDate':
        if (!value) {
          newErrors.checkInDate = '請選擇入住日期'
        } else {
          const startDate = new Date(value)
          const today = new Date()
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
          
          if (startDate >= firstDayOfMonth) {
            newErrors.checkInDate = '請選擇歷史日期（早於當前月份第一天）'
          } else {
            delete newErrors.checkInDate
          }
        }
        break
        
      case 'selectedRoomId':
        if (!value) {
          newErrors.selectedRoomId = '請選擇房間'
        } else {
          delete newErrors.selectedRoomId
        }
        break
    }
    
    setErrors(newErrors)
  }
  
  // 重置表單
  const resetForm = () => {
    setSelectedRoomId(null)
    setCheckInDate('')
    setTenantName('')
    setTenantPhone('')
    setContractMonths(12)
    setPaymentOption('full')
    setBackfillStatus('paid')
    setBackfillPreview([])
    setBackfillSummary({ total: 0, amount: 0, deposit: 0, rent: 0, electricity: 0 })
    setElectricityRates({})
    setElectricityDetails({})
    setErrors({})
  }
  
  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <span>📅</span>
          房間出租（補登）
        </h1>
        <div className="text-sm text-gray-500 mt-1">
          專門處理歷史日期入住的補登記錄生成
        </div>
      </div>
      
      {/* 主要表單 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側：基本資訊 */}
        <div className="space-y-6">
          {/* 物業選擇 */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">1. 選擇物業</h3>
            <div className="space-y-3">
              {allProperties.map(prop => (
                <button
                  key={prop.id}
                  onClick={() => setSelectedPropertyId(prop.id)}
                  className={`w-full p-3 border rounded-lg text-left hover:bg-gray-50 ${
                    selectedPropertyId === prop.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium">{prop.name}</div>
                  <div className="text-sm text-gray-600">
                    {prop.rooms?.filter(r => r.s === 'available').length || 0} 間空房
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* 房間選擇 - 表格列表 */}
          {property && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">2. 選擇房間</h3>
              
              {errors.selectedRoomId && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm text-red-600">{errors.selectedRoomId}</div>
                </div>
              )}
              
              {availableRooms.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <div className="text-4xl mb-2">🏚️</div>
                  <div>沒有可補登的空房間</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">房間</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">樓層</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">租金</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">押金</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">狀態</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableRooms.map(room => (
                        <tr 
                          key={room.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            selectedRoomId === room.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-medium">{room.n}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-gray-600">{room.f}F</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-amber-600">{formatCurrency(room.r)}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-blue-600">{formatCurrency(room.d || 0)}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-sm">
                              <span className={`px-2 py-1 rounded-full ${
                                room.s === 'available' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {room.s === 'available' ? '空房' : '待出租'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <button
                              onClick={() => {
                                setSelectedRoomId(room.id)
                                validateField('selectedRoomId', room.id)
                              }}
                              className={`px-4 py-1 rounded ${
                                selectedRoomId === room.id 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-200 hover:bg-gray-300'
                              }`}
                            >
                              {selectedRoomId === room.id ? '已選擇' : '選擇'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {/* 租客資訊 */}
          {selectedRoomId && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">3. 租客資訊</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">租客姓名 *</label>
                  <input
                    type="text"
                    value={tenantName}
                    onChange={(e) => {
                      setTenantName(e.target.value)
                      validateField('tenantName', e.target.value)
                    }}
                    onBlur={() => validateField('tenantName', tenantName)}
                    className={`input-field ${errors.tenantName ? 'border-red-500' : ''}`}
                    placeholder="請輸入租客姓名"
                  />
                  {errors.tenantName && (
                    <div className="text-xs text-red-500 mt-1">{errors.tenantName}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1">租客電話</label>
                  <input
                    type="tel"
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    className="input-field"
                    placeholder="請輸入租客電話"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* 右側：補登設定和預覽 */}
        <div className="space-y-6">
          {/* 入住日期和設定 */}
          {selectedRoomId && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">4. 補登設定</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">入住日期 *</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value)
                      validateField('checkInDate', e.target.value)
                    }}
                    onBlur={() => validateField('checkInDate', checkInDate)}
                    className={`input-field ${errors.checkInDate ? 'border-red-500' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.checkInDate ? (
                    <div className="text-xs text-red-500 mt-1">{errors.checkInDate}</div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-1">
                      請選擇歷史日期（早於當前月份第一天）
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm mb-1">合約月數</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 6, 12].map(months => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => setContractMonths(months)}
                        className={`px-3 py-1 rounded ${
                          contractMonths === months ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {months}個月
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">補登記錄收款狀態</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBackfillStatus('paid')}
                      className={`flex-1 px-3 py-2 rounded-lg ${
                        backfillStatus === 'paid' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      ✅ 默認已收款
                    </button>
                    <button
                      onClick={() => setBackfillStatus('pending')}
                      className={`flex-1 px-3 py-2 rounded-lg ${
                        backfillStatus === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      ⏳ 設為待確認
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {backfillStatus === 'paid' 
                      ? '補登記錄將標記為「已收款」，影響對應月份的現金流統計'
                      : '補登記錄將標記為「待確認」，需在繳費分頁手動確認收款'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* 補登預覽 */}
          {backfillPreview.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">📅 補登記錄預覽</h3>
              
              {/* 預覽列表 */}
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto pr-2">
                {backfillPreview.map((record, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      record.type === 'deposit' ? 'bg-blue-50 border-blue-200' :
                      record.type === 'rent' ? 'bg-amber-50 border-amber-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <div className="font-medium">{record.month}</div>
                        <div className="text-sm text-gray-600">{record.description}</div>
                      </div>
                      <div className="font-bold">
                        {formatCurrency(record.total || record.amount)}
                      </div>
                    </div>
                    
                    {record.type === 'deposit' && (
                      <div className="text-xs text-blue-600">一次性押金</div>
                    )}
                    
                    {record.type === 'rent' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">租金：</span>
                          <span className="font-medium">{formatCurrency(record.amount)}</span>
                        </div>
                        <div className="space-y-2 mt-2 p-2 bg-gray-50 rounded">
                          <div className="text-xs font-medium text-gray-700">電費計算：</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">前期度數</div>
                              <input
                                type="number"
                                value={electricityDetails[record.month]?.previousReading || 0}
                                onChange={(e) => updateElectricityDetails(record.month, 'previousReading', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="前期度數"
                                min="0"
                                step="1"
                              />
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">目前度數</div>
                              <input
                                type="number"
                                value={electricityDetails[record.month]?.currentReading || 0}
                                onChange={(e) => updateElectricityDetails(record.month, 'currentReading', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="目前度數"
                                min="0"
                                step="1"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs text-gray-600">每度電費</div>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={electricityDetails[record.month]?.rate || state.data.electricityRate || 5}
                                  onChange={(e) => updateElectricityDetails(record.month, 'rate', parseFloat(e.target.value) || 0)}
                                  className="w-16 px-2 py-1 border rounded text-sm"
                                  placeholder="單價"
                                  min="0"
                                  step="0.1"
                                />
                                <span className="text-xs text-gray-500">元/度</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-600">用電度數</div>
                              <div className="text-sm font-medium">
                                {electricityDetails[record.month]?.usage || 0} 度
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-600">電費金額</div>
                              <div className="text-sm font-medium text-green-600">
                                {formatCurrency(electricityDetails[record.month]?.amount || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm border-t border-amber-100 pt-1">
                          <span className="text-gray-700">小計：</span>
                          <span className="font-bold">{formatCurrency(record.total)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* 統計摘要 */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>總記錄數：</span>
                  <span className="font-bold">{backfillSummary.total} 筆</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>押金記錄：</span>
                  <span className="font-bold text-blue-600">{backfillSummary.deposit} 筆</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>租金記錄：</span>
                  <span className="font-bold text-amber-600">{backfillSummary.rent} 筆</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>電費總計：</span>
                  <span className="font-bold text-green-600">{formatCurrency(backfillSummary.electricity)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2 mt-2">
                  <span>總金額：</span>
                  <span>{formatCurrency(backfillSummary.amount)}</span>
                </div>
              </div>
              
              {/* 狀態說明 */}
              <div className={`mt-4 p-3 rounded-lg ${
                backfillStatus === 'paid' ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
              }`}>
                <div className="flex items-center gap-2">
                  <span>{backfillStatus === 'paid' ? '✅' : '⏳'}</span>
                  <span className="font-medium">
                    {backfillStatus === 'paid' ? '已收款模式' : '待確認模式'}
                  </span>
                </div>
                <div className="text-sm mt-1">
                  {backfillStatus === 'paid' 
                    ? '補登記錄將自動標記為「已收款」，影響對應月份的現金流統計。'
                    : '補登記錄將標記為「待確認」，需在繳費分頁手動確認收款。'}
                </div>
              </div>
            </div>
          )}
          
          {/* 操作按鈕 */}
          {selectedRoomId && checkInDate && tenantName.trim() && (
            <div className="card">
              <h3 className="text-lg font-bold mb-4">5. 確認操作</h3>
              <div className="space-y-3">
                <button
                  onClick={generateBackfillRecords}
                  disabled={Object.keys(errors).length > 0 || !selectedRoomId || !checkInDate || !tenantName.trim()}
                  className={`w-full btn py-3 text-lg ${
                    Object.keys(errors).length > 0 || !selectedRoomId || !checkInDate || !tenantName.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {Object.keys(errors).length > 0 ? '❌ 請修正錯誤' : '🚀 生成補登記錄並完成入住'}
                </button>
                
                <button
                  onClick={resetForm}
                  className="w-full btn btn-secondary py-2"
                >
                  🔄 重置表單
                </button>
                
                <div className="text-xs text-gray-500">
                  💡 提示：完成後可在「租客繳費」分頁中查看和管理補登記錄。
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 使用說明 */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-bold mb-3">📖 使用說明</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span>1.</span>
            <span>此功能專門處理<b>歷史日期入住</b>的補登記錄生成。</span>
          </div>
          <div className="flex items-start gap-2">
            <span>2.</span>
            <span>選擇歷史入住日期後，系統會自動計算需要補登的月份。</span>
          </div>
          <div className="flex items-start gap-2">
            <span>3.</span>
            <span>可選擇補登記錄的收款狀態：<b>已收款</b>或<b>待確認</b>。</span>
          </div>
          <div className="flex items-start gap-2">
            <span>4.</span>
            <span>所有補登記錄可在「租客繳費」分頁中查看和管理。</span>
          </div>
          <div className="flex items-start gap-2">
            <span>5.</span>
            <span>對於當月或未來日期的入住，請使用正常的「入住」功能。</span>
          </div>
        </div>
      </div>
    </div>
  )
}
