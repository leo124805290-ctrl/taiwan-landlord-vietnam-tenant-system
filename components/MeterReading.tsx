'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'

interface MeterReadingProps {
  property: any
}

export default function MeterReading({ property }: MeterReadingProps) {
  const { state, updateState, updateData, openModal } = useApp()
  
  // 當前月份（格式：YYYY/MM）
  const currentMonth = `${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}`
  
  // 電錶讀數狀態
  const [meterReadings, setMeterReadings] = useState<Record<number, number>>({})
  const [readingDate, setReadingDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 初始化電錶讀數
  useEffect(() => {
    const initialReadings: Record<number, number> = {}
    property.rooms.forEach((room: any) => {
      if (room.s === 'occupied') {
        // 預設使用當前電錶讀數
        initialReadings[room.id] = room.cm || 0
      }
    })
    setMeterReadings(initialReadings)
  }, [property])
  
  // 獲取已出租的房間，按房間號碼排序
  const occupiedRooms = property.rooms
    .filter((room: any) => room.s === 'occupied')
    .sort((a: any, b: any) => {
      // 按樓層和房號排序
      if (a.f !== b.f) return a.f - b.f
      // 提取數字部分進行排序
      const aNum = parseInt(a.n.replace(/\D/g, '')) || 0
      const bNum = parseInt(b.n.replace(/\D/g, '')) || 0
      return aNum - bNum
    })
  
  // 計算待提交房間數量
  const pendingRoomsCount = occupiedRooms.length - Object.keys(meterReadings).length
  
  // 計算電費
  const calculateElectricityFee = (room: any, newMeter: number) => {
    const lastMeter = room.lm || 0
    const usage = Math.max(0, newMeter - lastMeter)
    return Math.round(usage * state.data.electricityRate)
  }
  
  // 提交電錶讀數
  const submitMeterReadings = () => {
    if (isSubmitting) return
    
    if (Object.keys(meterReadings).length === 0) {
      alert(t('pleaseEnterMeterReading', state.lang))
      return
    }
    
    if (!readingDate) {
      alert(t('pleaseEnterReadingDate', state.lang))
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 更新房間電錶讀數
      const updatedProperties = state.data.properties.map(p => 
        p.id === property.id
          ? {
              ...p,
              rooms: p.rooms.map(room => {
                if (room.s === 'occupied' && meterReadings[room.id] !== undefined) {
                  const newMeter = meterReadings[room.id]
                  const lastMeter = room.lm || 0
                  const usage = Math.max(0, newMeter - lastMeter)
                  const electricityFee = Math.round(usage * state.data.electricityRate)
                  
                  // 更新電錶記錄
                  const updatedRoom = {
                    ...room,
                    lm: room.cm || 0, // 上次電錶變成當前電錶
                    cm: newMeter,     // 新電錶讀數
                  }
                  
                  // 為當前月份生成電費付款記錄（如果還沒有）
                  const currentMonthStr = currentMonth
                  const hasElectricityPayment = p.payments.some(
                    (payment: any) => 
                      payment.rid === room.id && 
                      payment.m === currentMonthStr &&
                      payment.e > 0
                  )
                  
                  let updatedPayments = [...p.payments]
                  
                  if (!hasElectricityPayment && usage > 0) {
                    // 找到該房間當月的租金付款記錄
                    const rentPaymentIndex = updatedPayments.findIndex(
                      (payment: any) => 
                        payment.rid === room.id && 
                        payment.m === currentMonthStr &&
                        payment.s === 'pending'
                    )
                    
                    if (rentPaymentIndex !== -1) {
                      // 更新現有的付款記錄，添加電費
                      updatedPayments[rentPaymentIndex] = {
                        ...updatedPayments[rentPaymentIndex],
                        u: usage,
                        e: electricityFee,
                        total: updatedPayments[rentPaymentIndex].r + electricityFee
                      }
                    } else {
                      // 創建新的電費付款記錄
                      const newPaymentId = Math.max(...updatedPayments.map((p: any) => p.id), 0) + 1
                      const dueDate = new Date()
                      dueDate.setDate(5) // 下個月5號
                      dueDate.setMonth(dueDate.getMonth() + 1)
                      
                      updatedPayments.push({
                        id: newPaymentId,
                        rid: room.id,
                        n: room.n,
                        t: room.t || '',
                        m: currentMonthStr,
                        r: 0,
                        u: usage,
                        e: electricityFee,
                        total: electricityFee,
                        due: dueDate.toISOString().split('T')[0],
                        s: 'pending' as const
                      })
                    }
                  }
                  
                  return updatedRoom
                }
                return room
              }),
              // 添加抄錶歷史記錄
              meterHistory: [
                ...(p.meterHistory || []),
                {
                  id: Math.max(...(p.meterHistory || []).map((m: any) => m.id), 0) + 1,
                  date: readingDate,
                  month: currentMonth,
                  readings: Object.entries(meterReadings).map(([roomId, reading]) => ({
                    rid: parseInt(roomId),
                    roomNumber: p.rooms.find((r: any) => r.id === parseInt(roomId))?.n || '',
                    reading,
                    usage: reading - (p.rooms.find((r: any) => r.id === parseInt(roomId))?.lm || 0),
                    fee: Math.round((reading - (p.rooms.find((r: any) => r.id === parseInt(roomId))?.lm || 0)) * state.data.electricityRate)
                  }))
                }
              ]
            }
          : p
      )
      
      updateData({ properties: updatedProperties })
      
      // 顯示成功訊息
      const totalRooms = Object.keys(meterReadings).length
      const totalElectricityFee = Object.entries(meterReadings).reduce((sum, [roomId, reading]) => {
        const room = property.rooms.find((r: any) => r.id === parseInt(roomId))
        if (room) {
          return sum + calculateElectricityFee(room, reading)
        }
        return sum
      }, 0)
      
      alert(`${t('meterReadingSubmitted', state.lang)}\n${t('roomsSubmitted', state.lang)}: ${totalRooms}\n${t('totalElectricityFee', state.lang)}: ${formatCurrency(totalElectricityFee)}`)
      
      // 重置表單
      setMeterReadings({})
      setReadingDate(new Date().toISOString().split('T')[0])
      
    } catch (error) {
      console.error('提交電錶讀數失敗:', error)
      alert(t('submitFailed', state.lang))
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 獲取抄錶歷史
  const meterHistory = property.meterHistory || []
  
  // 篩選狀態
  const [historyFilterYear, setHistoryFilterYear] = useState<string>('all')
  const [historyFilterMonth, setHistoryFilterMonth] = useState<string>('all')
  
  // 獲取所有可用的年份和月份
  const availableYears = Array.from(new Set(meterHistory.map((record: any) => record.month.split('/')[0]))).sort((a, b) => (b as string).localeCompare(a as string))
  const availableMonths = Array.from(new Set(meterHistory.map((record: any) => record.month))).sort((a, b) => (b as string).localeCompare(a as string))
  
  // 篩選抄錶歷史
  const filteredMeterHistory = meterHistory.filter((record: any) => {
    if (historyFilterYear !== 'all' && !record.month.startsWith(historyFilterYear)) return false
    if (historyFilterMonth !== 'all' && record.month !== historyFilterMonth) return false
    return true
  })
  
  return (
    <div className="space-y-6">
      {/* 標題 */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📝 {t('meterReading', state.lang)}</h1>
        <div className="text-sm text-gray-600">
          {currentMonth} • {property.name}
        </div>
      </div>
      
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600">{t('occupiedRooms', state.lang)}</div>
          <div className="text-2xl font-bold text-blue-700">
            {occupiedRooms.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {t('roomsNeedMeterReading', state.lang)}
          </div>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-600">{t('roomsSubmitted', state.lang)}</div>
          <div className="text-2xl font-bold text-green-700">
            {Object.keys(meterReadings).length}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {pendingRoomsCount > 0 
              ? `${pendingRoomsCount} ${t('roomsPending', state.lang)}`
              : t('allRoomsSubmitted', state.lang)}
          </div>
        </div>
        
        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-sm text-gray-600">{t('estimatedElectricityFee', state.lang)}</div>
          <div className="text-2xl font-bold text-purple-700">
            {formatCurrency(
              Object.entries(meterReadings).reduce((sum, [roomId, reading]) => {
                const room = property.rooms.find((r: any) => r.id === parseInt(roomId))
                return room ? sum + calculateElectricityFee(room, reading) : sum
              }, 0)
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {t('basedOnCurrentReadings', state.lang)}
          </div>
        </div>
      </div>
      
      {/* 控制面板 */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm mb-1">{t('meterReadingDate', state.lang)}</label>
            <input
              type="date"
              value={readingDate}
              onChange={(e) => setReadingDate(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={submitMeterReadings}
              className="btn btn-primary"
              disabled={isSubmitting || Object.keys(meterReadings).length === 0}
            >
              {isSubmitting ? '⏳' : '✅'} {t('submitMeterReading', state.lang)}
            </button>
          </div>
        </div>
      </div>
      
      {/* 電錶填寫表格 */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">{t('enterMeterReading', state.lang)}</h2>
        
        {occupiedRooms.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            🏠 {t('noOccupiedRooms', state.lang)}
          </div>
        ) : (
          <div className="space-y-4">
            {occupiedRooms.map((room: any) => {
              const currentReading = meterReadings[room.id] || 0
              const lastMeter = room.lm || 0
              const usage = Math.max(0, currentReading - lastMeter)
              const electricityFee = Math.round(usage * state.data.electricityRate)
              
              return (
                <div key={room.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                    {/* 房間資訊 */}
                    <div className="md:col-span-1">
                      <div className="font-bold text-lg">{room.n}</div>
                      <div className="text-sm text-gray-600">
                        {room.f}F • {room.t || t('noTenant', state.lang)}
                      </div>
                    </div>
                    
                    {/* 上期電錶 */}
                    <div>
                      <label className="block text-sm mb-1 text-gray-500">{t('previousMonthMeter', state.lang)}</label>
                      <div className="font-bold text-gray-700">
                        {lastMeter} {t('degree', state.lang)}
                      </div>
                    </div>
                    
                    {/* 本期電錶輸入 */}
                    <div>
                      <label className="block text-sm mb-1">{t('currentMonthMeter', state.lang)}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={currentReading || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            setMeterReadings(prev => ({
                              ...prev,
                              [room.id]: value
                            }))
                          }}
                          className="input-field w-full"
                          min={lastMeter}
                          placeholder={lastMeter.toString()}
                        />
                        <span className="text-gray-500">{t('degree', state.lang)}</span>
                      </div>
                    </div>
                    
                    {/* 用電計算 */}
                    <div>
                      <div className="text-sm text-gray-600">{t('electricityUsage', state.lang)}</div>
                      <div className="font-bold text-blue-600">
                        {usage} {t('degree', state.lang)}
                      </div>
                      <div className="text-sm">
                        {t('electricityFee', state.lang)}: <span className="font-bold">{formatCurrency(electricityFee)}</span>
                      </div>
                    </div>
                    
                    {/* 狀態指示器 */}
                    <div>
                      {currentReading > 0 ? (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                          ✅ {t('meterEntered', state.lang)}
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm">
                          ⏳ {t('meterPending', state.lang)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* 抄錶歷史 */}
      {meterHistory.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">📜 {t('meterReadingHistory', state.lang)}</h2>
            <div className="text-sm text-gray-600">
              {t('totalRecords', state.lang)}: {meterHistory.length}
            </div>
          </div>
          
          {/* 篩選器 */}
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm mb-1">{t('filterByYear', state.lang)}</label>
              <select 
                value={historyFilterYear}
                onChange={(e) => setHistoryFilterYear(e.target.value)}
                className="input-field"
              >
                <option value="all">{t('allYears', state.lang)}</option>
                {availableYears.map((year) => (
                  <option key={year as string} value={year as string}>{year as string}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm mb-1">{t('filterByMonth', state.lang)}</label>
              <select 
                value={historyFilterMonth}
                onChange={(e) => setHistoryFilterMonth(e.target.value)}
                className="input-field"
                disabled={historyFilterYear === 'all'}
              >
                <option value="all">{t('allMonths', state.lang)}</option>
                {availableMonths
                  .filter((month) => historyFilterYear === 'all' || (month as string).startsWith(historyFilterYear))
                  .map((month) => (
                    <option key={month as string} value={month as string}>{month as string}</option>
                  ))
                }
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredMeterHistory.slice(0, 10).map((record: any) => (
              <div key={record.id} className="p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold">{record.month}</div>
                  <div className="text-sm text-gray-600">{record.date}</div>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {t('rooms', state.lang)}: {record.readings.length} • 
                  {t('totalElectricityFee', state.lang)}: {formatCurrency(
                    record.readings.reduce((sum: number, r: any) => sum + r.fee, 0)
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('meterReadingDetail', record.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    🔍 {t('viewDetails', state.lang)}
                  </button>
                  <button
                    onClick={() => {
                      // 複製到當前抄錶
                      const newReadings: Record<number, number> = {}
                      record.readings.forEach((r: any) => {
                        newReadings[r.rid] = r.reading
                      })
                      setMeterReadings(newReadings)
                      setReadingDate(new Date().toISOString().split('T')[0])
                      alert(t('copiedToCurrent', state.lang))
                    }}
                    className="text-sm text-green-600 hover:text-green-800"
                  >
                    📋 {t('copyToCurrent', state.lang)}
                  </button>
                </div>
              </div>
            ))}
            
            {filteredMeterHistory.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                {t('noRecordsFound', state.lang)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}