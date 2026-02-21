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
  
  // 獲取已出租的房間
  const occupiedRooms = property.rooms.filter((room: any) => room.s === 'occupied')
  
  // 計算待提交房間數量
  const pendingRoomsCount = occupiedRooms.length - Object.keys(meterReadings).length
  
  // 快速填寫全部房間
  const quickFillAll = () => {
    const newReadings = { ...meterReadings }
    occupiedRooms.forEach((room: any) => {
      if (room.s === 'occupied') {
        // 增加10-50度作為預設值
        const increment = Math.floor(Math.random() * 40) + 10
        newReadings[room.id] = (room.cm || 0) + increment
      }
    })
    setMeterReadings(newReadings)
  }
  
  // 從上月複製
  const copyFromPrevious = () => {
    const newReadings = { ...meterReadings }
    occupiedRooms.forEach((room: any) => {
      if (room.s === 'occupied') {
        // 使用當前電錶讀數
        newReadings[room.id] = room.cm || 0
      }
    })
    setMeterReadings(newReadings)
  }
  
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
              onClick={quickFillAll}
              className="btn bg-blue-100 text-blue-700"
              disabled={occupiedRooms.length === 0}
            >
              ⚡ {t('quickFillAll', state.lang)}
            </button>
            
            <button
              onClick={copyFromPrevious}
              className="btn bg-green-100 text-green-700"
              disabled={occupiedRooms.length === 0}
            >
              📋 {t('copyFromPrevious', state.lang)}
            </button>
            
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
                  <div className="flex flex-wrap gap-4 items-center">
                    {/* 房間資訊 */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="font-bold">{room.n} ({room.f}F)</div>
                      <div className="text-sm text-gray-600">
                        {room.t || t('noTenant', state.lang)} • {t('lastMeter', state.lang)}: {lastMeter}
                      </div>
                    </div>
                    
                    {/* 電錶輸入 */}
                    <div className="flex-1 min-w-[150px]">
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
                          className="input-field flex-1"
                          min={lastMeter}
                          placeholder={lastMeter.toString()}
                        />
                        <span className="text-gray-500">{t('degree', state.lang)}</span>
                      </div>
                    </div>
                    
                    {/* 用電計算 */}
                    <div className="flex-1 min-w-[150px]">
                      <div className="text-sm text-gray-600">{t('electricityUsage', state.lang)}</div>
                      <div className="font-bold text-blue-600">
                        {usage} {t('degree', state.lang)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t('electricityFee', state.lang)}: {formatCurrency(electricityFee)}
                      </div>
                    </div>
                    
                    {/* 狀態指示器 */}
                    <div className="flex-1 min-w-[100px]">
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
          <h2 className="text-lg font-bold mb-4">📜 {t('meterReadingHistory', state.lang)}</h2>
          <div className="space-y-3">
            {meterHistory.slice(0, 5).map((record: any) => (
              <div key={record.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold">{record.month}</div>
                  <div className="text-sm text-gray-600">{record.date}</div>
                </div>
                <div className="text-sm text-gray-600">
                  {t('rooms', state.lang)}: {record.readings.length} • 
                  {t('totalElectricityFee', state.lang)}: {formatCurrency(
                    record.readings.reduce((sum: number, r: any) => sum + r.fee, 0)
                  )}
                </div>
                <button
                  onClick={() => openModal('meterReadingDetail', record.id)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  {t('viewDetails', state.lang)}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}