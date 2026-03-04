'use client'

import { Room, RoomStatus, Payment } from '@/lib/types'
import { t } from '@/lib/translations'
import { formatCurrency, formatDate, getMonthEndDate, getNextMonthEndDate } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { useEffect, useRef } from 'react'

export default function Modal() {
  const { state, updateState, updateData, reloadFromCloud, closeModal, getCurrentProperty } = useApp()
  
  const type = state.modal?.type || ''
  const data = state.modal?.data
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }

  // 退房結算計算函數
  const calculateElectricityCost = () => {
    if (type !== 'checkOut') return

    const initialMeterInput = document.getElementById('checkOutInitialMeter') as HTMLInputElement
    const finalMeterInput = document.getElementById('checkOutFinalMeter') as HTMLInputElement
    const rateInput = document.getElementById('checkOutElectricityRate') as HTMLInputElement
    const usageDisplay = document.getElementById('electricityUsageDisplay')
    const costDisplay = document.getElementById('electricityCostDisplay')

    if (!initialMeterInput || !finalMeterInput || !rateInput) return

    const initialMeter = parseInt(initialMeterInput.value) || 0
    const finalMeter = parseInt(finalMeterInput.value) || 0
    const rate = parseFloat(rateInput.value) || 6

    if (finalMeter < initialMeter) {
      alert('最後電錶讀數不能小於初始讀數')
      return
    }

    const usage = finalMeter - initialMeter
    const cost = usage * rate

    if (usageDisplay) {
      usageDisplay.textContent = `${usage} 度`
    }
    if (costDisplay) {
      costDisplay.textContent = formatCurrency(cost)
    }

    // 更新隱藏的電費輸入
    const electricityCostInput = document.getElementById('checkOutElectricityCost') as HTMLInputElement
    if (electricityCostInput) {
      electricityCostInput.value = cost.toString()
    }
    
    // 觸發總額計算
    calculateTotalSettlement()
  }

  const calculateTotalSettlement = () => {
    if (type !== 'checkOut') return

    const damageInput = document.getElementById('checkOutDamageDeduction') as HTMLInputElement
    const cleaningInput = document.getElementById('checkOutCleaningFee') as HTMLInputElement
    const otherInput = document.getElementById('checkOutOtherDeductions') as HTMLInputElement
    const electricityCostInput = document.getElementById('checkOutElectricityCost') as HTMLInputElement
    const deductionsDisplay = document.getElementById('totalDeductionsDisplay')
    const refundDisplay = document.getElementById('depositRefundDisplay')

    if (!damageInput || !cleaningInput || !otherInput) return

    const damage = parseFloat(damageInput.value) || 0
    const cleaning = parseFloat(cleaningInput.value) || 0
    const other = parseFloat(otherInput.value) || 0
    const electricity = parseFloat(electricityCostInput?.value || '0') || 0

    const totalDeductions = damage + cleaning + other + electricity
    
    // 獲取房間資訊
    const property = getCurrentProperty()
    const checkOutRoom = property?.rooms.find((r: Room) => r.id === data)
    const deposit = checkOutRoom?.d || 0
    const depositRefund = Math.max(0, deposit - totalDeductions)

    if (deductionsDisplay) {
      deductionsDisplay.textContent = formatCurrency(totalDeductions)
    }
    if (refundDisplay) {
      refundDisplay.textContent = formatCurrency(depositRefund)
    }

    // 更新隱藏的總扣款輸入
    const totalDeductionsInput = document.getElementById('checkOutTotalDeductions') as HTMLInputElement
    if (totalDeductionsInput) {
      totalDeductionsInput.value = totalDeductions.toString()
    }
  }

  // 初始化模態框輸入字段
  useEffect(() => {
    if (!type || !data) return

    const property = getCurrentProperty()
    if (!property) return

    // 初始化編輯水電支出
    if (type === 'editUtilityExpense') {
      const expense = property.utilityExpenses?.find((e: any) => e.id === data)
      if (expense) {
        const typeInput = document.getElementById('editUtilityType') as HTMLSelectElement
        const periodInput = document.getElementById('editUtilityPeriod') as HTMLInputElement
        const amountInput = document.getElementById('editUtilityAmount') as HTMLInputElement
        const paidDateInput = document.getElementById('editUtilityPaidDate') as HTMLInputElement
        const notesInput = document.getElementById('editUtilityNotes') as HTMLTextAreaElement

        if (typeInput) typeInput.value = expense.type || 'taipower'
        if (periodInput) periodInput.value = expense.period || ''
        if (amountInput) amountInput.value = expense.amount?.toString() || ''
        if (paidDateInput) paidDateInput.value = expense.paidDate || ''
        if (notesInput) notesInput.value = expense.notes || ''
      }
    }
  }, [type, data, getCurrentProperty])

  const renderModalContent = () => {
    const property = getCurrentProperty()
    
    switch (type) {
      case 'addProperty':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">{t('addProperty', state.lang)}</h2>
            <div className="space-y-4">
              {/* 基本資訊 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">{t('propertyName', state.lang)}</label>
                  <input type="text" id="pname" className="input-field" placeholder="例如：汐止大同路" />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('address', state.lang)}</label>
                  <input type="text" id="paddr" className="input-field" placeholder="詳細地址" />
                </div>
              </div>

              {/* 快速設定樓層房間 */}
              <div className="border-t pt-4">
                <h3 className="font-bold mb-3">🏢 {t('quickSetup', state.lang)}</h3>
                
                <div className="mb-3">
                  <label className="block text-sm mb-1">{t('floors', state.lang)}</label>
                  <input 
                    type="number" 
                    id="pfloors" 
                    defaultValue={3} 
                    min={1} 
                    max={10}
                    className="input-field"
                    onChange={(e) => {
                      const floors = parseInt(e.target.value) || 3
                      // 動態生成樓層設定
                      const floorConfigDiv = document.getElementById('floorConfig')
                      if (floorConfigDiv) {
                        let html = ''
                        for (let i = 1; i <= floors; i++) {
                          html += `
                            <div class="mb-2">
                              <label class="block text-sm mb-1">${t('floor', state.lang)} ${i} ${t('roomsPerFloor', state.lang)}</label>
                              <input type="number" id="floor${i}Rooms" value="4" min="1" max="20" class="input-field floor-room-input" />
                            </div>
                          `
                        }
                        floorConfigDiv.innerHTML = html
                      }
                    }}
                  />
                </div>

                {/* 樓層房間設定容器 */}
                <div id="floorConfig" className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {/* 預設顯示3層 */}
                  <div className="mb-2">
                    <label className="block text-sm mb-1">{t('floor', state.lang)} 1 {t('roomsPerFloor', state.lang)}</label>
                    <input type="number" id="floor1Rooms" defaultValue={4} min={1} max={20} className="input-field floor-room-input" />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm mb-1">{t('floor', state.lang)} 2 {t('roomsPerFloor', state.lang)}</label>
                    <input type="number" id="floor2Rooms" defaultValue={4} min={1} max={20} className="input-field floor-room-input" />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm mb-1">{t('floor', state.lang)} 3 {t('roomsPerFloor', state.lang)}</label>
                    <input type="number" id="floor3Rooms" defaultValue={4} min={1} max={20} className="input-field floor-room-input" />
                  </div>
                </div>

                {/* 預設租金和押金設定 */}
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm mb-1">{t('defaultRent', state.lang)}</label>
                    <input type="number" id="defaultRent" defaultValue={7000} min={1000} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{t('defaultDeposit', state.lang)}</label>
                    <input type="number" id="defaultDeposit" defaultValue={14000} min={0} className="input-field" />
                  </div>
                </div>

                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700">
                    💡 {t('autoGenerate', state.lang)}: {t('roomNumber', state.lang)} 101, 102, 103...
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={saveAddPropertyWithRooms} className="flex-1 btn btn-primary">
                🏢 {t('save', state.lang)} & {t('generateRooms', state.lang)}
              </button>
            </div>
          </>
        )

      case 'editProperty':
        const prop = state.data.properties.find(p => p.id === data)
        if (!prop) return null
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">{t('editProperty', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('propertyName', state.lang)}</label>
                <input type="text" id="pname" defaultValue={prop.name} className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('address', state.lang)}</label>
                <input type="text" id="paddr" defaultValue={prop.address} className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('floors', state.lang)}</label>
                <input type="number" id="pfloors" defaultValue={prop.floors} min={1} className="input-field" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveEditProperty(prop.id)} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )

      case 'addRoom':
        return (
          <>
            <h2 className="text-xl font-bold mb-4">{t('addRoom', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('roomNumber', state.lang)}</label>
                <input type="text" id="rn" className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('floor', state.lang)}</label>
                <input type="number" id="rf" defaultValue={1} className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('monthlyRent', state.lang)}</label>
                <input type="number" id="rr" defaultValue={7000} className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('deposit', state.lang)}</label>
                <input type="number" id="rd" defaultValue={14000} className="input-field" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={saveAddRoom} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )

      case 'roomDetail':
        const room = property?.rooms.find((r: Room) => r.id === data)
        if (!room) return null
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">🏠 {t('roomDetails', state.lang)}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">{t('roomNumber', state.lang)}</div>
                  <div className="text-lg font-bold">{room.n}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t('floor', state.lang)}</div>
                  <div className="text-lg font-bold">{room.f}F</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t('status', state.lang)}</div>
                  <div className={`badge ${
                    room.s === 'occupied' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {t(room.s, state.lang)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">{t('monthlyRent', state.lang)}</div>
                  <div className="text-lg font-bold text-blue-600">
                    {formatCurrency(room.r)}
                  </div>
                </div>
              </div>
              
              {/* 當前租客資訊 */}
              {room.s === 'occupied' && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold mb-2">👤 {t('currentTenant', state.lang)}</h3>
                  <div className="text-sm text-gray-600">
                    {t('tenantName', state.lang)}: {room.t || 'N/A'}<br/>
                    {t('phone', state.lang)}: {room.p || 'N/A'}<br/>
                    
                    {/* 出租日期和合約到期日 - 突出顯示 */}
                    <div className="mt-2 p-3 bg-white rounded border">
                      <div className="font-bold text-blue-700 mb-1">📅 租約資訊</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-xs text-gray-500">{t('contractStart', state.lang)}</div>
                          <div className="font-bold">{room.in || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">{t('contractEnd', state.lang)}</div>
                          <div className="font-bold">{room.out || 'N/A'}</div>
                        </div>
                      </div>
                      {room.in && room.out && (
                        <div className="mt-2 text-xs">
                          {(() => {
                            const start = new Date(room.in);
                            const end = new Date(room.out);
                            const today = new Date();
                            const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                            const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                            const months = Math.floor(totalDays / 30);
                            return `租期: ${months}個月 (${totalDays}天), 剩餘: ${daysLeft}天`;
                          })()}
                        </div>
                      )}
                    </div>
                    
                    {/* 電錶資訊 */}
                    <div className="mt-3">
                      {t('lastMeter', state.lang)}: {room.lm || 0} {t('degree', state.lang)}<br/>
                      {t('currentMeter', state.lang)}: {room.cm || 0} {t('degree', state.lang)}<br/>
                      {t('electricityReceivable', state.lang)}: {formatCurrency(Math.round(((room.cm || 0) - (room.lm || 0)) * state.data.electricityRate))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* 歷史租客資訊 */}
              {(room.previousTenant || room.moveOutDate) && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-2">📜 {t('previousTenant', state.lang)}</h3>
                  <div className="text-sm text-gray-600">
                    {room.previousTenant && (
                      <>
                        {t('tenantName', state.lang)}: {room.previousTenant}<br/>
                        {room.previousPhone && `${t('phone', state.lang)}: ${room.previousPhone}<br/>`}
                        {room.previousContractStart && room.previousContractEnd && 
                          `${t('contractPeriod', state.lang)}: ${room.previousContractStart} ~ ${room.previousContractEnd}<br/>`
                        }
                      </>
                    )}
                    {room.moveOutDate && `${t('moveOutDate', state.lang)}: ${room.moveOutDate}<br/>`}
                    {room.finalMeter && `${t('finalMeter', state.lang)}: ${room.finalMeter} ${t('degree', state.lang)}<br/>`}
                    {room.finalElectricityFee && `${t('finalElectricityFee', state.lang)}: ${formatCurrency(room.finalElectricityFee)}<br/>`}
                  </div>
                </div>
              )}
              
              {/* 房間統計 */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-bold mb-2">📊 {t('roomStatistics', state.lang)}</h3>
                <div className="text-sm text-gray-600">
                  {t('monthlyRent', state.lang)}: {formatCurrency(room.r)}<br/>
                  {t('deposit', state.lang)}: {formatCurrency(room.d)}<br/>
                  {t('roomStatus', state.lang)}: {t(room.s, state.lang)}<br/>
                  {room.s === 'renovation' && `${t('renovationStatus', state.lang)}: ${t('inProgress', state.lang)}`}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('close', state.lang)}
              </button>
            </div>
          </>
        )

      case 'updateMeter':
        const meterRoom = property?.rooms.find((r: Room) => r.id === data)
        if (!meterRoom) return null
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">⚡ {t('updateMeter', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">{t('room', state.lang)}</div>
                <div className="text-lg font-bold">{meterRoom.n} ({meterRoom.f}F)</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">{t('lastMeter', state.lang)}</div>
                <div className="text-lg">{meterRoom.lm || 0} {t('degree', state.lang)}</div>
              </div>
              <div>
                <label className="block text-sm mb-1">{t('currentMeter', state.lang)}</label>
                <input 
                  type="number" 
                  id="currentMeter" 
                  defaultValue={meterRoom.cm || meterRoom.lm || 0}
                  min={meterRoom.lm || 0}
                  className="input-field"
                />
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">{t('electricityRate', state.lang)}</div>
                <div className="text-lg font-bold text-blue-600">
                  ${state.data.electricityRate} {t('perUnit', state.lang)}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveMeterReading(data)} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )

      case 'rentOut':
        const rentRoom = property?.rooms.find((r: Room) => r.id === data)
        if (!rentRoom) return null
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">🏠 {t('rentOut', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">{t('room', state.lang)}</div>
                <div className="text-lg font-bold">{rentRoom.n} ({rentRoom.f}F)</div>
              </div>
              <div>
                <label className="block text-sm mb-1">{t('tenantName', state.lang)}</label>
                <input type="text" id="tenantName" className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('tenantPhone', state.lang)}</label>
                <input type="tel" id="tenantPhone" className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('contractStart', state.lang)}</label>
                <input type="date" id="contractStart" defaultValue={new Date().toISOString().split('T')[0]} className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('contractEnd', state.lang)}</label>
                <input type="date" id="contractEnd" className="input-field" />
                
                {/* 快速選擇租期 */}
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">{t('quickSelectLease', state.lang)}</div>
                  <div className="flex flex-wrap gap-2">
                    {[3, 6, 12, 24].map(months => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => {
                          const startInput = document.getElementById('contractStart') as HTMLInputElement;
                          const endInput = document.getElementById('contractEnd') as HTMLInputElement;
                          
                          if (startInput && startInput.value) {
                            const startDate = new Date(startInput.value);
                            const endDate = new Date(startDate);
                            endDate.setMonth(endDate.getMonth() + months);
                            
                            // 格式為 YYYY-MM-DD
                            const endDateStr = endDate.toISOString().split('T')[0];
                            endInput.value = endDateStr;
                          }
                        }}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                      >
                        {months} {t('months', state.lang)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">{t('initialMeter', state.lang)}</label>
                <input type="number" id="initialMeter" defaultValue={0} className="input-field" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveRentOut(data)} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )

      case 'checkIn':
        const checkInRoom = property?.rooms.find((r: Room) => r.id === data)
        if (!checkInRoom) return null
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">🏠 {t('checkInTitle', state.lang)}</h2>
            
            {/* 房間資訊 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold">{checkInRoom.n} ({checkInRoom.f}F)</div>
              <div className="text-sm text-gray-600">
                {t('monthlyRent', state.lang)}: {formatCurrency(checkInRoom.r)} • 
                {t('deposit', state.lang)}: {formatCurrency(checkInRoom.d || 0)}
              </div>
            </div>
            
            {/* 步驟1：選擇付款方式 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">1. {t('selectPaymentOption', state.lang)}</h3>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="paymentOption" value="full" defaultChecked className="mr-3" />
                  <div>
                    <div className="font-medium">✅ {t('paymentOptionFull', state.lang)}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(checkInRoom.r + (checkInRoom.d || 0))}
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="paymentOption" value="deposit_only" className="mr-3" />
                  <div>
                    <div className="font-medium">💰 {t('paymentOptionDeposit', state.lang)}</div>
                    <div className="text-sm text-gray-600">
                      {t('deposit', state.lang)}: {formatCurrency(checkInRoom.d || 0)}
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="paymentOption" value="reservation_only" className="mr-3" />
                  <div>
                    <div className="font-medium">📅 {t('paymentOptionReserve', state.lang)}</div>
                    <div className="text-sm text-gray-600">
                      {t('noPaymentRequired', state.lang)}
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* 步驟2：租客資訊 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">2. {t('tenantInformation', state.lang)}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">{t('tenantName', state.lang)} *</label>
                  <input type="text" id="checkInTenantName" className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('tenantPhone', state.lang)} *</label>
                  <input type="tel" id="checkInTenantPhone" className="input-field" required />
                </div>
              </div>
            </div>
            
            {/* 步驟3：合約詳情 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">3. {t('contractDetails', state.lang)}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">{t('contractStart', state.lang)} *</label>
                  <input 
                    type="date" 
                    id="checkInContractStart" 
                    defaultValue={new Date().toISOString().split('T')[0]} 
                    min={new Date().toISOString().split('T')[0]} // 不能選擇過去的日期
                    className="input-field" 
                    required 
                    onChange={(e) => {
                      // 歷史日期檢測和提醒
                      const startDate = new Date(e.target.value)
                      const today = new Date()
                      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
                      
                      // 檢查是否為歷史日期（早於當前月份第一天）
                      if (startDate < firstDayOfMonth) {
                        // 顯示補登提醒
                        const backfillAlert = document.getElementById('backfillAlert')
                        if (backfillAlert) {
                          backfillAlert.style.display = 'block'
                          
                          // 計算需要補登的月份
                          const startYear = startDate.getFullYear()
                          const startMonth = startDate.getMonth()
                          const currentYear = today.getFullYear()
                          const currentMonth = today.getMonth()
                          
                          // 計算月份差（從起租月到當前月）
                          const monthDiff = (currentYear - startYear) * 12 + (currentMonth - startMonth)
                          const backfillMonthCount = Math.max(0, monthDiff) // 包含當前月份
                          
                          // 更新提醒內容
                          const backfillList = document.getElementById('backfillList')
                          const backfillTotal = document.getElementById('backfillTotal')
                          const backfillSummary = document.getElementById('backfillSummary')
                          
                          if (backfillList && backfillTotal && backfillSummary) {
                            let previewHTML = ''
                            let totalRecords = 0
                            let totalAmount = 0
                            let depositCount = 0
                            let rentCount = 0
                            
                            // 押金補登
                            if (checkInRoom.d && checkInRoom.d > 0) {
                              previewHTML += `
                                <div className="flex justify-between items-center py-1 border-b border-amber-100">
                                  <div>
                                    <span className="font-medium">${startYear}/${String(startMonth + 1).padStart(2, '0')}</span>
                                    <span className="text-xs text-amber-600 ml-1">押金</span>
                                  </div>
                                  <div className="font-bold">${formatCurrency(checkInRoom.d)}</div>
                                </div>
                              `
                              totalRecords++
                              totalAmount += checkInRoom.d
                              depositCount++
                            }
                            
                            // 租金補登（從起租月到當前月）
                            for (let i = 0; i < backfillMonthCount; i++) {
                              const monthOffset = i
                              const backfillYear = startYear + Math.floor((startMonth + monthOffset) / 12)
                              const backfillMonth = (startMonth + monthOffset) % 12 + 1
                              
                              previewHTML += `
                                <div className="flex justify-between items-center py-1 border-b border-amber-100">
                                  <div>
                                    <span className="font-medium">${backfillYear}/${String(backfillMonth).padStart(2, '0')}</span>
                                    <span className="text-xs text-amber-600 ml-1">租金</span>
                                  </div>
                                  <div className="font-bold">${formatCurrency(checkInRoom.r)}</div>
                                </div>
                              `
                              totalRecords++
                              totalAmount += checkInRoom.r
                              rentCount++
                            }
                            
                            backfillList.innerHTML = previewHTML
                            backfillTotal.textContent = `${totalRecords} 筆記錄，${formatCurrency(totalAmount)}`
                            backfillSummary.textContent = `押金 ${depositCount} 筆，租金 ${rentCount} 筆`
                          }
                        }
                      } else {
                        // 隱藏補登提醒
                        const backfillAlert = document.getElementById('backfillAlert')
                        if (backfillAlert) {
                          backfillAlert.style.display = 'none'
                        }
                      }
                    }}
                  />
                </div>
                {/* 補登提醒區域 */}
                <div id="backfillAlert" className="hidden mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📅</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-800 mb-2">歷史日期補登預覽</h4>
                      <p className="text-sm text-amber-700 mb-3">
                        您選擇的入住日期是歷史日期，系統將自動生成以下補登記錄：
                      </p>
                      
                      {/* 補登預覽列表 */}
                      <div id="backfillPreview" className="mb-3">
                        <div className="text-sm text-amber-800 font-medium mb-1">補登記錄預覽：</div>
                        <div id="backfillList" className="text-sm text-amber-700 space-y-1 max-h-40 overflow-y-auto pr-2">
                          {/* 這裡會動態生成補登記錄預覽 */}
                          <div className="text-gray-500">選擇入住日期後顯示詳細記錄...</div>
                        </div>
                      </div>
                      
                      {/* 補登統計摘要 */}
                      <div className="text-sm border-t border-amber-200 pt-2">
                        <div className="flex justify-between">
                          <span>總計：</span>
                          <span id="backfillTotal" className="font-bold">0 筆記錄，$0</span>
                        </div>
                        <div className="flex justify-between text-xs text-amber-600">
                          <span>包含：</span>
                          <span id="backfillSummary">押金 0 筆，租金 0 筆</span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-amber-600 mt-2">
                        ⚠️ 注意：您選擇了歷史日期入住。請使用「房間出租(補)」分頁進行補登操作。
                      </div>
                      <button
                        onClick={() => {
                          // 關閉模態框
                          closeModal()
                          // 切換到補登分頁
                          updateState({ tab: 'backfill-checkin' })
                        }}
                        className="w-full mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium"
                      >
                        📅 前往「房間出租(補)」分頁
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">{t('contractMonths', state.lang)} *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 6, 12].map(months => (
                      <button
                        key={months}
                        type="button"
                        onClick={() => {
                          const startInput = document.getElementById('checkInContractStart') as HTMLInputElement
                          const endInput = document.getElementById('checkInContractEnd') as HTMLInputElement
                          
                          if (startInput && startInput.value) {
                            // 計算月底日期
                            const endDate = getMonthEndDate(startInput.value, months)
                            
                            if (endInput) {
                              endInput.value = endDate
                            }
                          }
                        }}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                      >
                        {months} {t('months', state.lang)}（月底）
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('contractEnd', state.lang)} *</label>
                  <input 
                    type="date" 
                    id="checkInContractEnd" 
                    defaultValue={getNextMonthEndDate(1)} 
                    className="input-field" 
                    required 
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    默認設置為下個月底，點擊上方按鈕可快速設置
                  </div>
                </div>
              </div>
            </div>
            
            {/* 步驟4：電費資訊 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">4. {t('electricityInfo', state.lang)}</h3>
              <div>
                <label className="block text-sm mb-1">{t('electricityMeter', state.lang)}</label>
                <input 
                  type="number" 
                  id="checkInElectricityMeter" 
                  className="input-field" 
                  placeholder={t('enterInitialMeter', state.lang)}
                />
              </div>
            </div>
            
            {/* 步驟5：付款摘要 */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-bold mb-3">5. {t('paymentSummary', state.lang)}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('monthlyRent', state.lang)}:</span>
                  <span className="font-bold">{formatCurrency(checkInRoom.r)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('deposit', state.lang)}:</span>
                  <span className="font-bold">{formatCurrency(checkInRoom.d || 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>{t('totalAmount', state.lang)}:</span>
                  <span>{formatCurrency(checkInRoom.r + (checkInRoom.d || 0))}</span>
                </div>
              </div>
            </div>
            
            {/* 步驟6：備註 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">6. {t('paymentNotes', state.lang)} ({t('optional', state.lang)})</h3>
              <textarea 
                id="checkInNotes" 
                className="input-field h-20" 
                placeholder={t('enterNotesHere', state.lang)}
              ></textarea>
            </div>
            
            {/* 操作按鈕 */}
            <div className="flex gap-2">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveCheckIn(data)} className="flex-1 btn btn-primary">
                {t('confirmAndSave', state.lang)}
              </button>
            </div>
          </>
        )

      case 'completePayment':
        const completePaymentRoom = property?.rooms.find((r: Room) => r.id === data)
        if (!completePaymentRoom || (completePaymentRoom.s !== 'reserved' && completePaymentRoom.s !== 'pending_payment')) return null
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">💰 {t('completePayment', state.lang)}</h2>
            
            {/* 房間資訊 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold">{completePaymentRoom.n} ({completePaymentRoom.f}F)</div>
              <div className="text-sm text-gray-600">
                {t('tenantName', state.lang)}: {completePaymentRoom.t || 'N/A'}<br/>
                {t('monthlyRent', state.lang)}: {formatCurrency(completePaymentRoom.r)}<br/>
                {t('deposit', state.lang)}: {formatCurrency(completePaymentRoom.d || 0)}
              </div>
            </div>
            
            {/* 付款詳情 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">{t('paymentType', state.lang)}</label>
                <div className="flex gap-2">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="completePaymentType" value="full" defaultChecked className="mr-3" />
                    <div>
                      <div className="font-medium">✅ {t('paymentFull', state.lang)}</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(completePaymentRoom.r + (completePaymentRoom.d || 0))}
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input type="radio" name="completePaymentType" value="rent_only" className="mr-3" />
                    <div>
                      <div className="font-medium">🏠 {t('paymentRentOnly', state.lang)}</div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(completePaymentRoom.r)}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('paymentMethod', state.lang)}</label>
                <select id="completePaymentMethod" className="input-field">
                  <option value="cash">💵 {t('cash', state.lang)}</option>
                  <option value="transfer">🏦 {t('transfer', state.lang)}</option>
                  <option value="other">📝 {t('other', state.lang)}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('paymentDate', state.lang)}</label>
                <input 
                  type="date" 
                  id="completePaymentDate" 
                  defaultValue={new Date().toISOString().split('T')[0]} 
                  className="input-field" 
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('notes', state.lang)}</label>
                <textarea 
                  id="completePaymentNotes" 
                  className="input-field" 
                  rows={3}
                  placeholder="可選：記錄付款相關備註"
                />
              </div>
            </div>
            
            {/* 操作按鈕 */}
            <div className="flex gap-2 mt-6">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button 
                onClick={() => processCompletePayment(completePaymentRoom.id)}
                className="flex-1 btn bg-green-600 text-white hover:bg-green-700"
              >
                💰 {t('confirmPayment', state.lang)}
              </button>
            </div>
          </>
        )

      case 'renewLease':
        const renewRoom = property?.rooms.find((r: Room) => r.id === data)
        if (!renewRoom || renewRoom.s !== 'occupied') return null
        
        // 計算新合約結束日期（預設延長一年）
        const currentEndDate = renewRoom.out ? new Date(renewRoom.out) : new Date()
        const newEndDate = new Date(currentEndDate)
        newEndDate.setFullYear(newEndDate.getFullYear() + 1)
        
        const formattedCurrentEndDate = currentEndDate.toISOString().split('T')[0]
        const formattedNewEndDate = newEndDate.toISOString().split('T')[0]
        
        return (
          <div className="modal">
            <div className="modal-content max-w-md">
              <div className="modal-header">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>🔄</span>
                  續租房間 {renewRoom.n}
                </h2>
                <button onClick={closeModal} className="modal-close">×</button>
              </div>
              
              <div className="modal-body space-y-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-sm text-gray-600">租客資訊</div>
                  <div className="font-bold">{renewRoom.t || '未填寫'}</div>
                  <div className="text-sm text-gray-600">{renewRoom.p || ''}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">原合約期間</div>
                    <div className="font-bold">
                      {renewRoom.in ? formatDate(renewRoom.in) : '未設定'} - {formattedCurrentEndDate}
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-sm text-gray-600">新合約期間</div>
                    <div className="font-bold">
                      {renewRoom.in ? formatDate(renewRoom.in) : '未設定'} - {formattedNewEndDate}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      租金調整（可選）
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-600">原租金</div>
                        <div className="font-bold">{formatCurrency(renewRoom.r || 0)}/月</div>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div className="flex-1">
                        <input
                          type="number"
                          defaultValue={renewRoom.r || 0}
                          className="w-full px-3 py-2 border rounded"
                          placeholder="新租金"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span>🏦</span>
                      <div className="font-medium">押金處理</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      ✅ 原押金 {formatCurrency(renewRoom.d || 0)} 將繼續保管
                      <br />
                      （無需退還再收取，減少資金流動）
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      備註（可選）
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded"
                      rows={2}
                      placeholder="例如：租金調整原因、特殊條款等"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={closeModal}
                  className="btn bg-gray-600 text-white"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    // 這裡實現續租邏輯
                    const newRentInput = document.querySelector('input[type="number"]') as HTMLInputElement
                    const notesInput = document.querySelector('textarea') as HTMLTextAreaElement
                    
                    const newRent = newRentInput ? parseInt(newRentInput.value) : renewRoom.r
                    const notes = notesInput ? notesInput.value : ''
                    
                    // 更新房間合約結束日期
                    const updatedRooms = property.rooms.map((r: Room) => 
                      r.id === data ? { ...r, out: formattedNewEndDate, r: newRent } : r
                    )
                    
                    // 更新物業
                    const updatedProperties = (state.data?.properties || []).map(p => 
                      p.id === property.id ? { ...p, rooms: updatedRooms } : p
                    )
                    
                    // 保存數據
                    updateData({ properties: updatedProperties })
                    
                    // 記錄續租歷史
                    const renewalRecord = {
                      roomId: data,
                      roomNumber: renewRoom.n,
                      tenantName: renewRoom.t,
                      oldEndDate: formattedCurrentEndDate,
                      newEndDate: formattedNewEndDate,
                      oldRent: renewRoom.r,
                      newRent: newRent,
                      depositRemained: renewRoom.d || 0,
                      date: new Date().toISOString().split('T')[0],
                      notes: notes
                    }
                    
                    // 這裡可以將 renewalRecord 保存到歷史記錄中
                    console.log('續租記錄:', renewalRecord)
                    
                    // 顯示成功訊息
                    alert(`房間 ${renewRoom.n} 已成功續租至 ${formattedNewEndDate}`)
                    
                    closeModal()
                  }}
                  className="btn bg-green-600 text-white"
                >
                  ✅ 確認續租
                </button>
              </div>
            </div>
          </div>
        )

      case 'restorePayment':
        const paymentToRestore = property?.history?.find((p: Payment) => p.id === data)
        if (!paymentToRestore) return null
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">🔄 恢復款項為待收</h2>
            
            {/* 警告訊息 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 text-xl">⚠️</div>
                <div>
                  <div className="font-bold text-yellow-800">確認要恢復此款項嗎？</div>
                  <div className="text-sm text-yellow-700 mt-1">
                    恢復後，此款項將重新出現在待收列表中，需要重新收款。
                  </div>
                </div>
              </div>
            </div>
            
            {/* 款項資訊 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-gray-600">房間</div>
                  <div className="font-bold">{paymentToRestore.n}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">租客</div>
                  <div className="font-bold">{paymentToRestore.t}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">月份</div>
                  <div className="font-bold">{paymentToRestore.m}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">總金額</div>
                  <div className="font-bold text-green-600">{formatCurrency(paymentToRestore.total)}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-600">收款日期</div>
                  <div className="font-bold">{paymentToRestore.paid}</div>
                </div>
              </div>
            </div>
            
            {/* 恢復原因 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                📝 恢復原因
              </label>
              <select
                id="restoreReason"
                className="w-full input-field"
                defaultValue="mistake"
              >
                <option value="mistake">誤操作標記</option>
                <option value="wrong_amount">金額有誤</option>
                <option value="tenant_request">租客要求修改</option>
                <option value="other">其他原因</option>
              </select>
            </div>
            
            {/* 備註 */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                📝 備註（選填）
              </label>
              <textarea
                id="restoreNotes"
                className="w-full input-field"
                rows={3}
                placeholder="請說明恢復的詳細原因..."
              ></textarea>
            </div>
            
            {/* 操作按鈕 */}
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 btn bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                ❌ 取消
              </button>
              <button
                onClick={() => processRestorePayment(data)}
                className="flex-1 btn bg-blue-600 text-white hover:bg-blue-700"
              >
                🔄 確認恢復
              </button>
            </div>
          </>
        )

      case 'deleteRoom':
        const deleteRoom = property?.rooms.find((r: Room) => r.id === data)
        if (!deleteRoom) return null
        
        // 檢查房間狀態 - 只有空房間可以刪除
        if (deleteRoom.s !== 'available') {
          return (
            <div className="modal">
              <div className="modal-content max-w-md">
                <div className="modal-header">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-red-600">
                    <span>❌</span>
                    無法刪除房間
                  </h2>
                  <button onClick={closeModal} className="modal-close">×</button>
                </div>
                
                <div className="modal-body space-y-4">
                  <div className="bg-red-50 p-4 rounded border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span>⚠️</span>
                      <div className="font-bold">房間狀態不符合刪除條件</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div>房間號碼：</div>
                        <div className="font-bold">{deleteRoom.n}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div>當前狀態：</div>
                        <div className="font-bold">
                          {deleteRoom.s === 'occupied' ? '已出租入住中' :
                           deleteRoom.s === 'pending_checkin_paid' ? '待入住（已結清）' :
                           deleteRoom.s === 'pending_checkin_unpaid' ? '待入住（尚未結清）' :
                           deleteRoom.s === 'maintenance' ? '維修中' : '未知狀態'}
                        </div>
                      </div>
                      
                      <div className="mt-3 p-2 bg-yellow-50 rounded text-sm">
                        <div className="font-medium">刪除條件：</div>
                        <div>✅ 房間必須為「空屋」狀態</div>
                        <div>✅ 無待處理款項或押金</div>
                        <div>✅ 無租客居住</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="font-medium">建議操作：</div>
                    
                    {deleteRoom.s === 'occupied' && (
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="font-medium mb-1">已入住房間</div>
                        <div className="text-sm text-gray-600 mb-2">
                          請先辦理退房流程，處理押金退還和租金結算。
                        </div>
                        <button
                          onClick={() => {
                            closeModal()
                            // 這裡需要重新打開 checkOut 模態框
                            // 由於在 Modal 組件內部，我們需要通過其他方式
                            // 暫時先關閉，用戶可以手動點擊退房按鈕
                            alert('請關閉此對話框後，點擊房間的「退房」按鈕')
                          }}
                          className="btn bg-blue-600 text-white text-sm"
                        >
                          🚪 前往退房
                        </button>
                      </div>
                    )}
                    
                    {(deleteRoom.s === 'pending_checkin_paid' || deleteRoom.s === 'pending_checkin_unpaid') && (
                      <div className="bg-orange-50 p-3 rounded">
                        <div className="font-medium mb-1">待入住房間</div>
                        <div className="text-sm text-gray-600 mb-2">
                          請先取消預訂，處理已收款項退還。
                        </div>
                        <button
                          onClick={() => {
                            closeModal()
                            // 這裡可以添加取消預訂的功能
                            alert('取消預訂功能開發中')
                          }}
                          className="btn bg-orange-600 text-white text-sm"
                        >
                          📝 取消預訂
                        </button>
                      </div>
                    )}
                    
                    {deleteRoom.s === 'maintenance' && (
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="font-medium mb-1">維修中房間</div>
                        <div className="text-sm text-gray-600 mb-2">
                          請先將房間狀態恢復為「空屋」。
                        </div>
                        <button
                          onClick={() => {
                            closeModal()
                            // 這裡需要重新打開 restore 模態框
                            alert('請關閉此對話框後，點擊房間的「恢復出租」按鈕')
                          }}
                          className="btn bg-purple-600 text-white text-sm"
                        >
                          🔧 恢復出租
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    onClick={closeModal}
                    className="btn bg-gray-600 text-white"
                  >
                    關閉
                  </button>
                </div>
              </div>
            </div>
          )
        }
        
        // 房間是空屋，顯示刪除確認
        return (
          <div className="modal">
            <div className="modal-content max-w-md">
              <div className="modal-header">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>🗑️</span>
                  刪除房間 {deleteRoom.n}
                </h2>
                <button onClick={closeModal} className="modal-close">×</button>
              </div>
              
              <div className="modal-body space-y-4">
                <div className="bg-red-50 p-4 rounded border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span>⚠️</span>
                    <div className="font-bold text-red-700">警告：此操作無法撤銷！</div>
                  </div>
                  <div className="text-sm text-red-600">
                    刪除後將無法恢復房間數據，請謹慎操作。
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600 mb-1">房間資訊</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <div>房間號碼：</div>
                        <div className="font-bold">{deleteRoom.n}</div>
                      </div>
                      <div className="flex justify-between">
                        <div>租金設定：</div>
                        <div className="font-bold">{formatCurrency(deleteRoom.r || 0)}/月</div>
                      </div>
                      <div className="flex justify-between">
                        <div>押金設定：</div>
                        <div className="font-bold">{formatCurrency(deleteRoom.d || 0)}</div>
                      </div>
                      <div className="flex justify-between">
                        <div>當前狀態：</div>
                        <div className="font-bold text-green-600">空屋 ✅</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      刪除原因（必填）
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded"
                      defaultValue=""
                      id="deleteReason"
                    >
                      <option value="" disabled>請選擇刪除原因</option>
                      <option value="停止出租">停止出租</option>
                      <option value="房間改建">房間改建（合併/分割）</option>
                      <option value="數據錯誤">數據輸入錯誤</option>
                      <option value="測試數據">測試數據清理</option>
                      <option value="其他">其他原因</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      備註說明（可選）
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border rounded"
                      rows={2}
                      placeholder="例如：改為倉庫使用、建築結構調整等"
                      id="deleteNotes"
                    />
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span>🔒</span>
                      <div className="font-medium">安全驗證</div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      請輸入管理密碼確認操作
                    </div>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border rounded"
                      placeholder="輸入管理密碼"
                      id="deletePassword"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      預設密碼：admin123（正式環境請修改）
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={closeModal}
                  className="btn bg-gray-600 text-white"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    // 獲取輸入值
                    const reasonSelect = document.getElementById('deleteReason') as HTMLSelectElement
                    const notesTextarea = document.getElementById('deleteNotes') as HTMLTextAreaElement
                    const passwordInput = document.getElementById('deletePassword') as HTMLInputElement
                    
                    const reason = reasonSelect?.value
                    const notes = notesTextarea?.value || ''
                    const password = passwordInput?.value || ''
                    
                    // 驗證輸入
                    if (!reason) {
                      alert('請選擇刪除原因')
                      return
                    }
                    
                    if (!password) {
                      alert('請輸入管理密碼')
                      return
                    }
                    
                    // 驗證密碼（這裡使用簡單驗證，正式環境應使用更安全的方式）
                    if (password !== 'admin123') {
                      alert('密碼錯誤')
                      return
                    }
                    
                    // 執行軟刪除 - 添加 archived 標記而不是真正刪除
                    const updatedRooms = property.rooms.map((r: Room) => 
                      r.id === data ? { 
                        ...r, 
                        archived: true,
                        archiveDate: new Date().toISOString().split('T')[0],
                        archiveReason: reason,
                        archiveNotes: notes
                      } : r
                    )
                    
                    // 更新物業
                    const updatedProperties = (state.data?.properties || []).map(p => 
                      p.id === property.id ? { ...p, rooms: updatedRooms } : p
                    )
                    
                    // 保存數據
                    updateData({ properties: updatedProperties })
                    
                    // 記錄刪除日誌
                    const deletionLog = {
                      roomId: data,
                      roomNumber: deleteRoom.n,
                      propertyId: property.id,
                      propertyName: property.name,
                      deleteReason: reason,
                      deleteNotes: notes,
                      deletedBy: '系統管理員',
                      deletedAt: new Date().toISOString(),
                      originalData: deleteRoom // 備份原始數據
                    }
                    
                    console.log('房間刪除記錄:', deletionLog)
                    
                    // 顯示成功訊息
                    alert(`房間 ${deleteRoom.n} 已成功刪除（已歸檔）`)
                    
                    closeModal()
                  }}
                  className="btn bg-red-600 text-white"
                >
                  🗑️ 確認刪除
                </button>
              </div>
            </div>
          </div>
        )

      case 'checkOut':
        const checkOutRoom = property?.rooms.find((r: Room) => r.id === data)
        if (!checkOutRoom || checkOutRoom.s !== 'occupied') return null
        
        // 計算初始電錶讀數和當前電錶讀數
        const initialMeter = checkOutRoom.initialElectricityMeter || checkOutRoom.pm || 0
        const currentMeter = checkOutRoom.cm || initialMeter
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">🚪 {t('checkOutTitle', state.lang)}</h2>
            
            {/* 房間和租客資訊 */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold">{checkOutRoom.n} ({checkOutRoom.f}F)</div>
              <div className="text-sm text-gray-600">
                {t('tenantName', state.lang)}: {checkOutRoom.t || '-'} • 
                {t('contractEnd', state.lang)}: {checkOutRoom.out || '-'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {t('monthlyRent', state.lang)}: {formatCurrency(checkOutRoom.r)} • 
                {t('deposit', state.lang)}: {formatCurrency(checkOutRoom.d || 0)}
              </div>
            </div>
            
            {/* 步驟1：退房類型 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">1. {t('checkOutType', state.lang)}</h3>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="checkOutType" value="scheduled" defaultChecked className="mr-3" />
                  <div>
                    <div className="font-medium">📅 {t('scheduledCheckOut', state.lang)}</div>
                    <div className="text-sm text-gray-600">
                      {t('contractEnd', state.lang)}: {checkOutRoom.out || '-'}
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="checkOutType" value="early" className="mr-3" />
                  <div>
                    <div className="font-medium">⚠️ {t('earlyCheckOut', state.lang)}</div>
                    <div className="text-sm text-gray-600">
                      {t('penaltyMayApply', state.lang)}
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            {/* 步驟2：電費結算 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">2. {t('electricityInfo', state.lang)}</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">{t('initialMeter', state.lang)}</label>
                    <input 
                      type="number" 
                      id="checkOutInitialMeter" 
                      defaultValue={initialMeter}
                      className="input-field bg-gray-100" 
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">{t('finalElectricityReading', state.lang)} *</label>
                    <input 
                      type="number" 
                      id="checkOutFinalMeter" 
                      defaultValue={currentMeter}
                      className="input-field" 
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">{t('electricityRate', state.lang)} (元/度)</label>
                  <input 
                    type="number" 
                    id="checkOutElectricityRate" 
                    defaultValue="6" 
                    className="input-field" 
                    step="0.1"
                  />
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex justify-between">
                    <span>{t('electricityUsage', state.lang)}:</span>
                    <span id="electricityUsageDisplay" className="font-bold">0 度</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>{t('electricityCost', state.lang)}:</span>
                    <span id="electricityCostDisplay" className="font-bold">$0</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => calculateElectricityCost()}
                    className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                  >
                    {t('calculateElectricity', state.lang)}
                  </button>
                </div>
              </div>
            </div>
            
            {/* 步驟3：扣款項目 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">3. {t('deductions', state.lang)}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">{t('damageDeduction', state.lang)}</label>
                  <input 
                    type="number" 
                    id="checkOutDamageDeduction" 
                    defaultValue="0" 
                    className="input-field" 
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('cleaningFee', state.lang)}</label>
                  <input 
                    type="number" 
                    id="checkOutCleaningFee" 
                    defaultValue="0" 
                    className="input-field" 
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('otherDeductions', state.lang)}</label>
                  <input 
                    type="number" 
                    id="checkOutOtherDeductions" 
                    defaultValue="0" 
                    className="input-field" 
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            {/* 步驟4：結算摘要 */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h3 className="text-lg font-bold mb-3">4. {t('settlementSummary', state.lang)}</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t('deposit', state.lang)}:</span>
                  <span className="font-bold">{formatCurrency(checkOutRoom.d || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('totalDeductions', state.lang)}:</span>
                  <span id="totalDeductionsDisplay" className="font-bold text-red-600">$0</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>{t('depositRefund', state.lang)}:</span>
                  <span id="depositRefundDisplay" className="font-bold">$0</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => calculateTotalSettlement()}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  {t('calculateTotal', state.lang)}
                </button>
              </div>
            </div>
            
            {/* 步驟5：備註 */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">5. {t('checkOutNotes', state.lang)}</h3>
              <textarea 
                id="checkOutNotes" 
                className="input-field h-20" 
                placeholder={t('enterNotesHere', state.lang)}
              ></textarea>
            </div>
            
            {/* 操作按鈕 */}
            <div className="flex gap-2">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveCheckOut(data)} className="flex-1 btn btn-primary">
                {t('confirmCheckOut', state.lang)}
              </button>
            </div>
          </>
        )

      case 'editRoom':
        const editRoom = property?.rooms.find((r: Room) => r.id === data)
        if (!editRoom) return null
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">✏️ {t('edit', state.lang)} {t('room', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('roomNumber', state.lang)}</label>
                <input type="text" id="editRoomNumber" defaultValue={editRoom.n} className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('floor', state.lang)}</label>
                <input type="number" id="editFloor" defaultValue={editRoom.f} className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('monthlyRent', state.lang)}</label>
                <input type="number" id="editRent" defaultValue={editRoom.r} className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('deposit', state.lang)}</label>
                <input type="number" id="editDeposit" defaultValue={editRoom.d || 0} className="input-field" />
              </div>
              
              {/* 起租日和到期日編輯 - 始終顯示，但根據房間狀態有不同的提示 */}
              <div>
                <label className="block text-sm mb-1">
                  {t('contractStart', state.lang)}
                  {editRoom.s !== 'occupied' && (
                    <span className="text-xs text-gray-500 ml-2">（僅在出租時填寫）</span>
                  )}
                </label>
                <input 
                  type="date" 
                  id="editContractStart" 
                  defaultValue={editRoom.in || ''} 
                  className="input-field"
                  placeholder={editRoom.s !== 'occupied' ? '請先設定房間為已出租' : ''}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">
                  {t('contractEnd', state.lang)}
                  {editRoom.s !== 'occupied' && (
                    <span className="text-xs text-gray-500 ml-2">（僅在出租時填寫）</span>
                  )}
                </label>
                <input 
                  type="date" 
                  id="editContractEnd" 
                  defaultValue={editRoom.out || ''} 
                  className="input-field"
                  placeholder={editRoom.s !== 'occupied' ? '請先設定房間為已出租' : ''}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveEditRoom(data)} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )

      case 'moveOut':
        const moveOutRoom = property?.rooms.find((r: Room) => r.id === data)
        if (!moveOutRoom) return null
        
        // 計算該房間的所有欠費
        const pendingPayments = property?.payments?.filter((p: any) => p.rid === data && p.s === 'pending') || []
        const totalPending = pendingPayments.reduce((sum: number, p: any) => sum + p.total, 0)
        
        // 計算最後電費（基於默認值）
        const defaultFinalMeter = moveOutRoom.cm || moveOutRoom.lm || 0
        const lastMeter = moveOutRoom.lm || 0
        const electricityUsage = Math.max(0, defaultFinalMeter - lastMeter)
        const electricityFee = electricityUsage * state.data.electricityRate
        
        // 總欠費 = 待繳費用 + 最後電費
        const totalDue = totalPending + electricityFee
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">🚪 {t('moveOut', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">{t('room', state.lang)}</div>
                <div className="text-lg font-bold">{moveOutRoom.n} ({moveOutRoom.f}F)</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">{t('tenantName', state.lang)}</div>
                <div className="text-lg">{moveOutRoom.t || t('noTenant', state.lang)}</div>
              </div>
              {/* 欠費檢查 */}
              {pendingPayments.length > 0 || electricityFee > 0 ? (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="font-bold text-red-800">⚠️ {t('outstandingFees', state.lang)}</div>
                  <div className="text-sm text-red-700 mt-2">
                    {pendingPayments.length > 0 && (
                      <div className="mb-2">
                        <div className="font-bold">{t('unpaidPayments', state.lang)}:</div>
                        <ul className="ml-4 mt-1">
                          {pendingPayments.map((p: any, index: number) => (
                            <li key={index} className="text-xs">
                              {p.m} - {formatCurrency(p.total)} ({t(p.s, state.lang)})
                            </li>
                          ))}
                        </ul>
                        <div className="mt-1 font-bold">
                          {t('totalUnpaid', state.lang)}: {formatCurrency(totalPending)}
                        </div>
                      </div>
                    )}
                    
                    {electricityFee > 0 && (
                      <div className="mt-2">
                        <div className="font-bold">{t('finalElectricityFee', state.lang)}:</div>
                        <div className="text-sm">
                          {electricityUsage} {t('degree', state.lang)} × ${state.data.electricityRate} = {formatCurrency(electricityFee)}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 p-2 bg-white rounded border border-red-300">
                      <div className="font-bold text-lg text-red-600">
                        {t('totalDue', state.lang)}: {formatCurrency(totalDue)}
                      </div>
                      <div className="text-xs text-red-500 mt-1">
                        {t('payBeforeMoveOut', state.lang)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                  <div className="font-bold text-green-800">✅ {t('noOutstandingFees', state.lang)}</div>
                  <div className="text-sm text-green-700 mt-1">
                    {t('readyForMoveOut', state.lang)}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm mb-1">{t('finalMeter', state.lang)}</label>
                <input 
                  type="number" 
                  id="finalMeter" 
                  defaultValue={moveOutRoom.cm || moveOutRoom.lm || 0} 
                  className="input-field" 
                  min={moveOutRoom.lm || 0}
                  onChange={(e) => {
                    // 計算並顯示應付電費
                    const finalMeter = parseInt(e.target.value) || 0
                    const lastMeter = moveOutRoom.lm || 0
                    const electricityUsage = Math.max(0, finalMeter - lastMeter)
                    const electricityFee = electricityUsage * state.data.electricityRate
                    
                    // 更新顯示
                    const feeDisplay = document.getElementById('electricityFeeDisplay')
                    if (feeDisplay) {
                      feeDisplay.textContent = `${formatCurrency(electricityFee)}`
                    }
                    
                    const usageDisplay = document.getElementById('electricityUsageDisplay')
                    if (usageDisplay) {
                      usageDisplay.textContent = `${electricityUsage} ${t('degree', state.lang)}`
                    }
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {t('lastMeter', state.lang)}: {moveOutRoom.lm || 0} {t('degree', state.lang)}
                </div>
              </div>
              
              {/* 電費計算結果顯示 */}
              <div id="electricityFeeSection" className="p-4 bg-blue-50 rounded-lg">
                <div className="font-bold text-blue-700 mb-2">⚡ {t('finalElectricityFee', state.lang)}</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-600">{t('electricityUsage', state.lang)}</div>
                    <div className="text-lg font-bold" id="electricityUsageDisplay">0 {t('degree', state.lang)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{t('electricityFee', state.lang)}</div>
                    <div className="text-2xl font-bold text-green-600" id="electricityFeeDisplay">
                      {formatCurrency(0)}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {t('electricityRate', state.lang)}: ${state.data.electricityRate} {t('perUnit', state.lang)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('moveOutDate', state.lang)}</label>
                <input type="date" id="moveOutDate" defaultValue={new Date().toISOString().split('T')[0]} className="input-field" />
              </div>
              
              {/* 其他扣款項目 */}
              <div className="border-t border-gray-200 pt-4">
                <div className="font-bold text-lg mb-3">📝 {t('otherDeductions', state.lang)}</div>
                <div className="space-y-3">
                  {/* 扣款項目1 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">{t('deductionReason', state.lang)}</div>
                      <select id="deductionReason1" className="w-full input-field">
                        <option value="">{t('selectDeductionReason', state.lang)}</option>
                        <option value="repair">{t('repairFee', state.lang)}</option>
                        <option value="cleaning">{t('cleaningFee', state.lang)}</option>
                        <option value="damage">{t('damageCompensation', state.lang)}</option>
                        <option value="late">{t('lateFee', state.lang)}</option>
                        <option value="other">{t('otherFee', state.lang)}</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">{t('amount', state.lang)}</div>
                      <input 
                        type="number" 
                        id="deductionAmount1" 
                        className="w-full input-field" 
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">{t('notes', state.lang)}</div>
                      <input 
                        type="text" 
                        id="deductionNotes1" 
                        className="w-full input-field" 
                        placeholder={t('optionalNotes', state.lang)}
                      />
                    </div>
                  </div>
                  
                  {/* 扣款項目2 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <select id="deductionReason2" className="w-full input-field">
                        <option value="">{t('selectDeductionReason', state.lang)}</option>
                        <option value="repair">{t('repairFee', state.lang)}</option>
                        <option value="cleaning">{t('cleaningFee', state.lang)}</option>
                        <option value="damage">{t('damageCompensation', state.lang)}</option>
                        <option value="late">{t('lateFee', state.lang)}</option>
                        <option value="other">{t('otherFee', state.lang)}</option>
                      </select>
                    </div>
                    <div>
                      <input 
                        type="number" 
                        id="deductionAmount2" 
                        className="w-full input-field" 
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        id="deductionNotes2" 
                        className="w-full input-field" 
                        placeholder={t('optionalNotes', state.lang)}
                      />
                    </div>
                  </div>
                  
                  {/* 扣款項目3 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <select id="deductionReason3" className="w-full input-field">
                        <option value="">{t('selectDeductionReason', state.lang)}</option>
                        <option value="repair">{t('repairFee', state.lang)}</option>
                        <option value="cleaning">{t('cleaningFee', state.lang)}</option>
                        <option value="damage">{t('damageCompensation', state.lang)}</option>
                        <option value="late">{t('lateFee', state.lang)}</option>
                        <option value="other">{t('otherFee', state.lang)}</option>
                      </select>
                    </div>
                    <div>
                      <input 
                        type="number" 
                        id="deductionAmount3" 
                        className="w-full input-field" 
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <input 
                        type="text" 
                        id="deductionNotes3" 
                        className="w-full input-field" 
                        placeholder={t('optionalNotes', state.lang)}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  💡 {t('deductionsWillBeRecorded', state.lang)}
                </div>
              </div>
              
              {/* 押金結算顯示 */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="font-bold text-amber-800 mb-2">💰 {t('depositSettlement', state.lang)}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('originalDeposit', state.lang)}:</span>
                    <span className="font-bold">{formatCurrency(moveOutRoom.d || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('totalDeductions', state.lang)}:</span>
                    <span className="font-bold text-red-600" id="totalDeductionsDisplay">
                      {formatCurrency(totalDue)} {/* 初始顯示待付款總額 */}
                    </span>
                  </div>
                  <div className="border-t border-amber-300 my-2"></div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t('depositToReturn', state.lang)}:</span>
                    <span className="text-green-600" id="depositToReturnDisplay">
                      {formatCurrency(Math.max(0, (moveOutRoom.d || 0) - totalDue))}
                    </span>
                  </div>
                  <div className="text-xs text-amber-600 mt-2">
                    ⚠️ {t('depositReturnReminder', state.lang)}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveMoveOut(data)} className="flex-1 btn bg-red-600 text-white">
                {t('confirmMoveOut', state.lang)}
              </button>
            </div>
          </>
        )

      case 'quickPay':
        const payment = property?.payments?.find((p: any) => p.id === data)
        if (!payment) return null
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">💰 {t('collect', state.lang)}</h2>
            <div className="space-y-4">
              {/* 付款資訊 */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-600">{t('roomNumber', state.lang)}</div>
                    <div className="text-lg font-bold">{payment.n}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{t('tenant', state.lang)}</div>
                    <div className="text-lg font-bold">{payment.t}</div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between mb-1">
                    <span>{t('rent', state.lang)}</span>
                    <span className="font-bold">{formatCurrency(payment.r)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>{t('electricity', state.lang)} ({payment.u}{t('degree', state.lang)})</span>
                    <span className="font-bold">{formatCurrency(payment.e)}</span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t font-bold text-lg">
                    <span>{t('total', state.lang)}</span>
                    <span className="text-green-600">{formatCurrency(payment.total)}</span>
                  </div>
                </div>
              </div>

              {/* 收款設定 */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">{t('paymentMethod', state.lang)}</label>
                  <select id="paymentMethod" className="input-field" defaultValue="cash">
                    <option value="cash">💵 {t('cash', state.lang)}</option>
                    <option value="transfer">🏦 {t('transfer', state.lang)}</option>
                    <option value="other">📱 {t('other', state.lang)}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('paymentDate', state.lang)}</label>
                  <input 
                    type="date" 
                    id="paymentDate" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('notes', state.lang)}</label>
                  <textarea 
                    id="paymentNotes" 
                    placeholder={t('optionalNotes', state.lang)}
                    className="input-field h-20" 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveQuickPay(payment.id)} className="flex-1 btn btn-primary">
                ✅ {t('confirmPayment', state.lang)}
              </button>
            </div>
          </>
        )

      case 'editMaint':
        const maint = property?.maintenance?.find((m: any) => m.id === data)
        if (!maint) return null
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">🔧 {t('editMaintenance', state.lang)}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">{t('category', state.lang)}</label>
                  <select id="editMaintCategory" defaultValue={maint.category || 'repair'} className="input-field">
                    <option value="repair">{t('categoryRepair', state.lang)}</option>
                    <option value="renovation">{t('categoryRenovation', state.lang)}</option>
                    <option value="other">{t('categoryOther', state.lang)}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('urgency', state.lang)}</label>
                  <select id="editMaintUrg" defaultValue={maint.urg} className="input-field">
                    <option value="urgent">{t('urgent', state.lang)}</option>
                    <option value="normal">{t('normal', state.lang)}</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('title', state.lang)}</label>
                <input type="text" id="editMaintTitle" defaultValue={maint.title} className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('description', state.lang)}</label>
                <textarea id="editMaintDesc" defaultValue={maint.desc} className="input-field h-24" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">{t('status', state.lang)}</label>
                  <select id="editMaintStatus" defaultValue={maint.s} className="input-field">
                    <option value="pending">{t('statusPending', state.lang)}</option>
                    <option value="assigned">{t('statusAssigned', state.lang)}</option>
                    <option value="in-progress">{t('statusInProgress', state.lang)}</option>
                    <option value="completed">{t('statusCompleted', state.lang)}</option>
                    <option value="cancelled">{t('statusCancelled', state.lang)}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('paymentStatus', state.lang)}</label>
                  <select id="editMaintPaymentStatus" defaultValue={maint.paymentStatus || 'unpaid'} className="input-field">
                    <option value="unpaid">{t('unpaidStatus', state.lang)}</option>
                    <option value="paid">{t('paidStatus', state.lang)}</option>
                    <option value="partial">{t('partialPayment', state.lang)}</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">{t('estimatedCost', state.lang)}</label>
                  <input type="number" id="editMaintEstimatedCost" defaultValue={maint.estimatedCost || 0} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('actualCost', state.lang)}</label>
                  <input type="number" id="editMaintActualCost" defaultValue={maint.actualCost || 0} className="input-field" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">{t('estimatedCompletion', state.lang)}</label>
                  <input type="date" id="editMaintEstimatedCompletion" defaultValue={maint.estimatedCompletion || ''} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('actualCompletionDate', state.lang)}</label>
                  <input type="date" id="editMaintActualCompletionDate" defaultValue={maint.actualCompletionDate || ''} className="input-field" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">{t('technician', state.lang)}</label>
                  <input type="text" id="editMaintTechnician" defaultValue={maint.technician || ''} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t('invoiceNumber', state.lang)}</label>
                  <input type="text" id="editMaintInvoiceNumber" defaultValue={maint.invoiceNumber || ''} className="input-field" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('notes', state.lang)}</label>
                <textarea id="editMaintNotes" defaultValue={maint.notes || ''} className="input-field h-20" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveEditMaintenance(data)} className="flex-1 btn btn-primary">
                {t('updateMaintenance', state.lang)}
              </button>
            </div>
          </>
        )

      case 'addMaint':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">🔧 {t('addMaintenance', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('title', state.lang)} *</label>
                <input type="text" id="addMaintTitle" className="input-field" placeholder={t('enterTitle', state.lang)} />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('description', state.lang)}</label>
                <textarea id="addMaintDesc" className="input-field h-24" placeholder={t('enterDescription', state.lang)} />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('urgency', state.lang)}</label>
                <select id="addMaintUrg" className="input-field" defaultValue="normal">
                  <option value="low">{t('low', state.lang)}</option>
                  <option value="normal">{t('normal', state.lang)}</option>
                  <option value="high">{t('high', state.lang)}</option>
                  <option value="urgent">{t('urgent', state.lang)}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{t('status', state.lang)}</label>
                <select id="addMaintStatus" className="input-field" defaultValue="pending">
                  <option value="pending">{t('pending', state.lang)}</option>
                  <option value="inProgress">{t('inProgress', state.lang)}</option>
                  <option value="completed">{t('completed', state.lang)}</option>
                  <option value="cancelled">{t('cancelled', state.lang)}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{t('estimatedCost', state.lang)}</label>
                <input type="number" id="addMaintCost" className="input-field" placeholder={t('enterCost', state.lang)} />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('repairDate', state.lang)}</label>
                <input type="date" id="addMaintDate" className="input-field" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveAddMaintenance()} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )

      case 'addRenovation':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">🏗️ {t('addRenovation', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('projectName', state.lang)} *</label>
                <input type="text" id="addRenovationName" className="input-field" placeholder={t('enterProjectName', state.lang)} />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('description', state.lang)}</label>
                <textarea id="addRenovationDesc" className="input-field h-24" placeholder={t('enterDescription', state.lang)} />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('renovationType', state.lang)}</label>
                <select id="addRenovationType" className="input-field" defaultValue="interior">
                  <option value="interior">{t('interior', state.lang)}</option>
                  <option value="exterior">{t('exterior', state.lang)}</option>
                  <option value="plumbing">{t('plumbing', state.lang)}</option>
                  <option value="electrical">{t('electrical', state.lang)}</option>
                  <option value="structural">{t('structural', state.lang)}</option>
                  <option value="other">{t('otherType', state.lang)}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">{t('budget', state.lang)}</label>
                <input type="number" id="addRenovationBudget" className="input-field" placeholder={t('enterBudget', state.lang)} />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('startDate', state.lang)}</label>
                <input type="date" id="addRenovationStart" className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('estimatedEndDate', state.lang)}</label>
                <input type="date" id="addRenovationEnd" className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('contractor', state.lang)}</label>
                <input type="text" id="addRenovationContractor" className="input-field" placeholder={t('enterContractor', state.lang)} />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('status', state.lang)}</label>
                <select id="addRenovationStatus" className="input-field" defaultValue="planned">
                  <option value="planned">{t('planned', state.lang)}</option>
                  <option value="inProgress">{t('inProgress', state.lang)}</option>
                  <option value="completed">{t('completed', state.lang)}</option>
                  <option value="delayed">{t('delayed', state.lang)}</option>
                  <option value="cancelled">{t('cancelled', state.lang)}</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveAddRenovation()} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )

      case 'meterReadingDetail':
        // 查找抄錶記錄
        const meterRecord = property?.meterHistory?.find((m: any) => m.id === data)
        if (!meterRecord) {
          return (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <h2 className="text-xl font-bold mb-2">找不到抄錶記錄</h2>
              <p className="text-gray-600 mb-4">指定的抄錶記錄不存在或已被刪除</p>
              <button onClick={closeModal} className="btn btn-primary">
                {t('close', state.lang)}
              </button>
            </div>
          )
        }
        
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">📝 {t('meterReadingDetail', state.lang)}</h2>
            <div className="space-y-4">
              {/* 基本資訊 */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-600">抄錶月份</div>
                    <div className="text-lg font-bold">{meterRecord.month}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">抄錶日期</div>
                    <div className="text-lg font-bold">{meterRecord.date || '未記錄'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">總房間數</div>
                    <div className="text-lg font-bold">{meterRecord.readings?.length || 0} 間</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">總電費</div>
                    <div className="text-lg font-bold text-green-600">
                      ${meterRecord.readings?.reduce((sum: number, r: any) => sum + (r.fee || 0), 0) || 0}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 房間抄錶詳情 */}
              <div>
                <h3 className="text-lg font-bold mb-3">房間抄錶詳情</h3>
                <div className="space-y-3">
                  {meterRecord.readings?.map((reading: any, index: number) => {
                    const room = property?.rooms?.find((r: any) => r.id === reading.rid)
                    return (
                      <div key={index} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <div className="font-bold">
                              {room?.n || `房間 ${reading.rid}`} ({room?.f || '?'}F)
                            </div>
                            <div className="text-sm text-gray-600">
                              租客: {room?.t || '未出租'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              ${reading.fee || 0}
                            </div>
                            <div className="text-sm text-gray-600">電費</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="p-2 bg-blue-50 rounded">
                            <div className="text-gray-600">上期讀數</div>
                            <div className="font-bold">{reading.previous || 0}</div>
                          </div>
                          <div className="p-2 bg-green-50 rounded">
                            <div className="text-gray-600">本期讀數</div>
                            <div className="font-bold">
                              <input 
                                type="number"
                                id={`reading-${reading.rid}`}
                                defaultValue={reading.reading}
                                min={reading.previous || 0}
                                className="w-full px-2 py-1 border rounded text-center"
                              />
                            </div>
                          </div>
                          <div className="p-2 bg-purple-50 rounded">
                            <div className="text-gray-600">用電度數</div>
                            <div className="font-bold">
                              {reading.reading - (reading.previous || 0)} 度
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          電費單價: ${state.data.electricityRate}/度
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* 操作按鈕 */}
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={closeModal}
                  className="flex-1 btn bg-gray-200"
                >
                  {t('cancel', state.lang)}
                </button>
                <button 
                  onClick={() => saveMeterReadingDetail(data)}
                  className="flex-1 btn btn-primary"
                >
                  💾 儲存修改
                </button>
                <button 
                  onClick={() => {
                    if (confirm('確定要刪除這筆抄錶記錄嗎？此操作無法復原。')) {
                      deleteMeterReading(data)
                    }
                  }}
                  className="flex-1 btn bg-red-100 text-red-700 hover:bg-red-200"
                >
                  🗑️ 刪除記錄
                </button>
              </div>
            </div>
          </>
        )

      case 'addUtilityExpense':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">⚡ {t('addUtilityExpense', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('type', state.lang)}</label>
                <select id="addUtilityType" className="input-field">
                  <option value="taipower">{t('taipowerBill', state.lang)}</option>
                  <option value="water">{t('waterBill', state.lang)}</option>
                  <option value="rent">{t('rentExpense', state.lang)}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('billPeriod', state.lang)}</label>
                <input type="text" id="addUtilityPeriod" className="input-field" placeholder="例如：2026年1-2月" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('amount', state.lang)}</label>
                <input type="number" id="addUtilityAmount" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('paidDate', state.lang)}</label>
                <input type="date" id="addUtilityPaidDate" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('notes', state.lang)} (選填)</label>
                <textarea id="addUtilityNotes" className="input-field h-20" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={saveAddUtilityExpense} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )
        
      case 'editUtilityExpense':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">⚡ {t('editUtilityExpense', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('type', state.lang)}</label>
                <select id="editUtilityType" className="input-field">
                  <option value="taipower">{t('taipowerBill', state.lang)}</option>
                  <option value="water">{t('waterBill', state.lang)}</option>
                  <option value="rent">{t('rentExpense', state.lang)}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('billPeriod', state.lang)}</label>
                <input type="text" id="editUtilityPeriod" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('amount', state.lang)}</label>
                <input type="number" id="editUtilityAmount" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('paidDate', state.lang)}</label>
                <input type="date" id="editUtilityPaidDate" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('notes', state.lang)} (選填)</label>
                <textarea id="editUtilityNotes" className="input-field h-20" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveEditUtilityExpense(data)} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )
        
      case 'addAdditionalIncome':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">💰 {t('addAdditionalIncome', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('type', state.lang)}</label>
                <select id="addIncomeType" className="input-field">
                  <option value="washing-machine">{t('washingMachineIncome', state.lang)}</option>
                  <option value="other">{t('otherIncome', state.lang)}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('month', state.lang)}</label>
                <input type="text" id="addIncomeMonth" className="input-field" placeholder="例如：2026/01" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('amount', state.lang)}</label>
                <input type="number" id="addIncomeAmount" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('description', state.lang)}</label>
                <input type="text" id="addIncomeDescription" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('receivedDate', state.lang)}</label>
                <input type="date" id="addIncomeReceivedDate" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('notes', state.lang)} (選填)</label>
                <textarea id="addIncomeNotes" className="input-field h-20" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={saveAddAdditionalIncome} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )
        
      case 'editAdditionalIncome':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">💰 {t('editAdditionalIncome', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('type', state.lang)}</label>
                <select id="editIncomeType" className="input-field">
                  <option value="washing-machine">{t('washingMachineIncome', state.lang)}</option>
                  <option value="other">{t('otherIncome', state.lang)}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('month', state.lang)}</label>
                <input type="text" id="editIncomeMonth" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('amount', state.lang)}</label>
                <input type="number" id="editIncomeAmount" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('description', state.lang)}</label>
                <input type="text" id="editIncomeDescription" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('receivedDate', state.lang)}</label>
                <input type="date" id="editIncomeReceivedDate" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('notes', state.lang)} (選填)</label>
                <textarea id="editIncomeNotes" className="input-field h-20" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveEditAdditionalIncome(data)} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )
        
      case 'updateCost':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">💰 {t('updateCost', state.lang)}</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('actualCost', state.lang)}</label>
                <input type="number" id="updateCostAmount" className="input-field" placeholder="實際發生金額" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('paymentStatus', state.lang)}</label>
                <select id="updateCostPaymentStatus" className="input-field">
                  <option value="unpaid">{t('unpaid', state.lang)}</option>
                  <option value="paid">{t('paid', state.lang)}</option>
                  <option value="partially-paid">{t('partiallyPaid', state.lang)}</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('actualCompletionDate', state.lang)}</label>
                <input type="date" id="updateCostCompletionDate" className="input-field" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('invoiceNumber', state.lang)} (選填)</label>
                <input type="text" id="updateCostInvoiceNumber" className="input-field" placeholder="發票號碼" />
              </div>
              
              <div>
                <label className="block text-sm mb-1">{t('notes', state.lang)} (選填)</label>
                <textarea id="updateCostNotes" className="input-field h-20" placeholder="備註說明" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={() => saveUpdateCost(data)} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
              </button>
            </div>
          </>
        )
        
      case 'quickCollectRent':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">💰 {t('quickCollectRent', state.lang)}</h2>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600">💰</span>
                  <span className="text-sm font-medium text-green-800">
                    快速收取租金
                  </span>
                </div>
                <p className="text-sm text-green-700">
                  選擇要收取租金的房間，系統會自動計算總金額並生成收據。
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1 font-medium">選擇房間（可多選）</label>
                  <div className="border rounded-lg p-3 max-h-60 overflow-y-auto bg-gray-50">
                    {property?.rooms?.filter((r: any) => r.s === 'occupied').map((room: any) => (
                      <div key={room.id} className="mb-3 p-3 bg-white rounded-lg border hover:border-green-300">
                        <div className="flex items-center gap-3 mb-2">
                          <input 
                            type="checkbox" 
                            id={`room-${room.id}`}
                            className="rounded h-5 w-5 text-green-600"
                            onChange={(e) => {
                              const detailsElement = document.getElementById(`room-details-${room.id}`)
                              if (detailsElement) {
                                detailsElement.style.display = e.target.checked ? 'block' : 'none'
                              }
                              calculateTotalAmount()
                            }}
                          />
                          <label htmlFor={`room-${room.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium text-gray-800">{room.n} - {room.t || '租客'}</div>
                            <div className="text-sm text-gray-500">
                              租金: {formatCurrency(room.r)} | 電費: {formatCurrency(room.elecFee || 0)}
                            </div>
                          </label>
                        </div>
                        
                        <div id={`room-details-${room.id}`} className="pl-8 mt-2 hidden">
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">本期電錶讀數</label>
                              <input 
                                type="number" 
                                id={`room-meter-${room.id}`}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="輸入讀數"
                                min={room.lastMeter || 0}
                                defaultValue={room.lastMeter || 0}
                                step="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">用電度數</label>
                              <div id={`room-usage-${room.id}`} className="text-sm font-medium text-blue-600">
                                0 度
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-green-600">
                            💰 應收總額: {formatCurrency(room.r + (room.elecFee || 0))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!property?.rooms || property.rooms.filter((r: any) => r.s === 'occupied').length === 0) && (
                      <div className="text-center py-4 text-gray-500">
                        🏠 目前沒有已出租的房間
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1 font-medium">收款月份</label>
                    <input 
                      type="text" 
                      id="collectMonth"
                      className="input-field"
                      placeholder="例如：2026年2月"
                      defaultValue={`${new Date().getFullYear()}年${new Date().getMonth() + 1}月`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1 font-medium">收款日期</label>
                    <input 
                      type="date" 
                      id="collectDate"
                      className="input-field"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1 font-medium">付款方式</label>
                  <select id="paymentMethod" className="input-field">
                    <option value="cash">現金</option>
                    <option value="transfer">銀行轉帳</option>
                    <option value="linepay">LINE Pay</option>
                    <option value="other">其他</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-1 font-medium">備註</label>
                  <textarea 
                    id="collectNotes"
                    className="input-field h-20"
                    placeholder="可填寫收款備註或特殊事項"
                  />
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-green-700">總金額</div>
                      <div id="totalAmount" className="text-3xl font-bold text-green-600">
                        {formatCurrency(0)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">已選擇</div>
                      <div id="selectedCount" className="text-xl font-bold text-gray-800">0 間房</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={processQuickCollectRent} className="flex-1 btn btn-primary">
                💰 確認收款
              </button>
            </div>
          </>
        )
        
      case 'batchMeterReading':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">📝 {t('batchMeterReading', state.lang)}</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600">📝</span>
                  <span className="text-sm font-medium text-blue-800">
                    批量記錄電錶讀數
                  </span>
                </div>
                <p className="text-sm text-blue-700">
                  一次記錄多個房間的電錶讀數，系統會自動計算用電度數和電費。
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1 font-medium">選擇房間（可多選）</label>
                  <div className="border rounded-lg p-3 max-h-60 overflow-y-auto bg-gray-50">
                    {property?.rooms?.filter((r: any) => r.s === 'occupied').map((room: any) => (
                      <div key={room.id} className="mb-3 p-3 bg-white rounded-lg border hover:border-blue-300">
                        <div className="flex items-center gap-3 mb-2">
                          <input 
                            type="checkbox" 
                            id={`meter-room-${room.id}`}
                            className="rounded h-5 w-5 text-blue-600"
                          />
                          <label htmlFor={`meter-room-${room.id}`} className="flex-1 cursor-pointer">
                            <div className="font-medium text-gray-800">{room.n}</div>
                            <div className="text-sm text-gray-500">
                              上期讀數: {room.lastMeter || 0} | 電費單價: {room.elecRate || state.data.electricityRate || 5}元/度
                            </div>
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-2 pl-8">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">本期讀數</label>
                            <input 
                              type="number" 
                              id={`meter-reading-${room.id}`}
                              className="w-full px-2 py-1 border rounded text-sm"
                              placeholder="輸入讀數"
                              min={room.lastMeter || 0}
                              defaultValue={room.lastMeter || 0}
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">用電度數</label>
                            <div id={`meter-usage-${room.id}`} className="text-sm font-medium text-blue-600">
                              0 度
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {(!property?.rooms || property.rooms.filter((r: any) => r.s === 'occupied').length === 0) && (
                      <div className="text-center py-4 text-gray-500">
                        🏠 目前沒有已出租的房間
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1 font-medium">抄錶月份</label>
                    <input 
                      type="text" 
                      id="meterMonth"
                      className="input-field"
                      placeholder="例如：2026年2月"
                      defaultValue={`${new Date().getFullYear()}年${new Date().getMonth() + 1}月`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-1 font-medium">抄錶日期</label>
                    <input 
                      type="date" 
                      id="meterDate"
                      className="input-field"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-1 font-medium">電費單價（元/度）</label>
                  <input 
                    type="number" 
                    id="electricityRate"
                    className="input-field"
                    defaultValue={state.data.electricityRate || 5}
                    step="0.1"
                    min="1"
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-blue-700">總用電度數</div>
                      <div id="totalUsage" className="text-2xl font-bold text-blue-600">0 度</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">總電費</div>
                      <div id="totalElectricityCost" className="text-2xl font-bold text-green-600">{formatCurrency(0)}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    已選擇 <span id="meterSelectedCount">0</span> 間房間
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={processBatchMeterReading} className="flex-1 btn btn-primary">
                📝 確認記錄
              </button>
            </div>
          </>
        )
        
      case 'collectPayment':
        return (
          <>
            <h2 className="text-2xl font-bold mb-4">💰 {t('collectPayment', state.lang)}</h2>
            
            {/* 收款資訊 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-blue-700">{t('room', state.lang)}</div>
                  <div className="font-bold text-lg">{data?.roomNumber || ''}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-700">{t('tenant', state.lang)}</div>
                  <div className="font-bold text-lg">{data?.tenantName || ''}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-blue-700">{t('month', state.lang)}</div>
                  <div className="font-bold text-lg">{data?.month || ''}</div>
                </div>
              </div>
            </div>
            
            {/* 電錶讀數輸入和計算 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  ⚡ {t('currentMeterReading', state.lang)}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="collectMeterReading"
                    defaultValue={data?.lastMeterReading || 0}
                    className="flex-1 input-field"
                    placeholder="輸入本期電錶讀數"
                    min="0"
                    step="1"
                    onChange={(e) => calculateElectricityFee(e.target.value)}
                  />
                  <span className="text-gray-500">{t('degree', state.lang)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {t('lastMeter', state.lang)}: {data?.lastMeterReading || 0} {t('degree', state.lang)}
                </div>
                
                {/* 確認計算按鈕 */}
                <button
                  onClick={() => {
                    const meterInput = document.getElementById('collectMeterReading') as HTMLInputElement
                    calculateElectricityFee(meterInput?.value || '0')
                  }}
                  className="mt-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm w-full"
                >
                  🔄 確認計算電費
                </button>
              </div>
              
              {/* 自動計算顯示 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium mb-2">📊 預計收款金額</div>
                
                <div className="space-y-2">
                  {/* 用電度數計算 */}
                  <div className="flex justify-between text-sm">
                    <span>{t('electricityUsage', state.lang)}:</span>
                    <span className="font-bold" id="electricityUsageDisplay">0 {t('degree', state.lang)}</span>
                  </div>
                  
                  {/* 電費計算 */}
                  <div className="flex justify-between text-sm">
                    <span>{t('electricityFee', state.lang)}:</span>
                    <span className="font-bold text-blue-600" id="electricityFeeDisplay">
                      {formatCurrency(0)}
                    </span>
                  </div>
                  
                  {/* 租金 */}
                  <div className="flex justify-between text-sm">
                    <span>🏠 {t('rent', state.lang)}:</span>
                    <span className="font-bold">{formatCurrency(data?.rentAmount || 0)}</span>
                  </div>
                  
                  {/* 分隔線 */}
                  <div className="border-t border-gray-300 my-2"></div>
                  
                  {/* 總金額 */}
                  <div className="flex justify-between text-lg font-bold">
                    <span>💰 總收款金額:</span>
                    <span className="text-green-600" id="totalAmountDisplay">
                      {formatCurrency((data?.rentAmount || 0) + (data?.currentElectricityFee || 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 操作按鈕 */}
            <div className="flex gap-2 mt-6">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button 
                onClick={() => processCollectPayment(data?.paymentId)}
                className="flex-1 btn bg-green-600 text-white hover:bg-green-700"
              >
                💰 {t('confirmPayment', state.lang)}
              </button>
            </div>
          </>
        )
        
      default:
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏢</div>
            <h2 className="text-xl font-bold mb-2">功能開發中</h2>
            <p className="text-gray-600 mb-4">此功能正在開發中，即將推出！</p>
            <button onClick={closeModal} className="btn btn-primary">
              {t('close', state.lang)}
            </button>
          </div>
        )
    }
  }

  // 儲存新增物業
  const saveAddProperty = () => {
    const nameInput = document.getElementById('pname') as HTMLInputElement
    const addrInput = document.getElementById('paddr') as HTMLInputElement
    const floorsInput = document.getElementById('pfloors') as HTMLInputElement

    if (!nameInput?.value.trim() || !addrInput?.value.trim()) {
      alert('請填寫所有必填欄位')
      return
    }

    const newId = Math.max(...(state.data?.properties || []).map(p => p.id), 0) + 1
    const newProperty = {
      id: newId,
      name: nameInput.value.trim(),
      address: addrInput.value.trim(),
      floors: parseInt(floorsInput.value) || 3,
      rooms: [],
      payments: [],
      history: [],
      maintenance: []
    }

    updateData({
      properties: [...state.data.properties, newProperty]
    })
    
    updateState({ currentProperty: newId })
    closeModal()
  }

  // 儲存新增物業（帶快速房間設定）
  const saveAddPropertyWithRooms = async () => {
    const nameInput = document.getElementById('pname') as HTMLInputElement
    const addrInput = document.getElementById('paddr') as HTMLInputElement
    const floorsInput = document.getElementById('pfloors') as HTMLInputElement
    const defaultRentInput = document.getElementById('defaultRent') as HTMLInputElement
    const defaultDepositInput = document.getElementById('defaultDeposit') as HTMLInputElement

    if (!nameInput?.value.trim() || !addrInput?.value.trim()) {
      alert('請填寫所有必填欄位')
      return
    }

    const floors = parseInt(floorsInput.value) || 3
    const defaultRent = parseInt(defaultRentInput.value) || 7000
    const defaultDeposit = parseInt(defaultDepositInput.value) || 14000
    
    // 收集每層樓的房間數
    const floorRooms: number[] = []
    for (let i = 1; i <= floors; i++) {
      const floorInput = document.getElementById(`floor${i}Rooms`) as HTMLInputElement
      if (floorInput) {
        floorRooms.push(parseInt(floorInput.value) || 4)
      } else {
        floorRooms.push(4)
      }
    }

    try {
      // 1. 先呼叫後端 API 新增物業，取得真實 ID
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
      const propRes = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameInput.value.trim(),
          address: addrInput.value.trim(),
          owner_name: '',
          owner_phone: ''
        })
      })
      const propData = await propRes.json()
      if (!propData.success) throw new Error('新增物業失敗')
      const newPropertyId = propData.data.id

      // 2. 逐一新增房間
      const rooms = []
      let roomNum = 1
      for (let floor = 1; floor <= floors; floor++) {
        const roomsOnFloor = floorRooms[floor - 1]
        for (let r = 1; r <= roomsOnFloor; r++) {
          const roomLabel = `${floor}${r.toString().padStart(2, '0')}`
          const roomRes = await fetch(`${API_URL}/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              property_id: newPropertyId,
              floor: floor.toString(),
              room_number: roomLabel,
              monthly_rent: defaultRent,
              deposit: defaultDeposit,
              status: 'available'
            })
          })
          const roomData = await roomRes.json()
          if (roomData.success) {
            rooms.push({
              id: roomData.data.id,
              f: floor.toString(),
              n: roomLabel,
              r: defaultRent,
              d: defaultDeposit,
              s: 'available' as const
            })
          }
          roomNum++
        }
      }

      // 3. 更新本地狀態
      const newProperty = {
        id: newPropertyId,
        name: nameInput.value.trim(),
        address: addrInput.value.trim(),
        floors: floors,
        rooms: rooms,
        payments: [],
        history: [],
        maintenance: []
      }

      updateData({
        properties: [...state.data.properties, newProperty]
      })
      
      updateState({ currentProperty: newPropertyId })
      
      // 顯示成功訊息
      alert(`✅ 物業建立成功！\n已自動建立 ${rooms.length} 間房間`)
      closeModal()
    } catch (err) {
      console.error('新增物業失敗:', err)
      alert('❌ 新增物業失敗，請稍後再試')
    }
  }

  // 儲存編輯物業
  const saveEditProperty = (id: number) => {
    const nameInput = document.getElementById('pname') as HTMLInputElement
    const addrInput = document.getElementById('paddr') as HTMLInputElement
    const floorsInput = document.getElementById('pfloors') as HTMLInputElement

    if (!nameInput?.value.trim() || !addrInput?.value.trim()) {
      alert('請填寫所有必填欄位')
      return
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === id 
        ? { 
            ...p, 
            name: nameInput.value.trim(),
            address: addrInput.value.trim(),
            floors: parseInt(floorsInput.value) || p.floors
          }
        : p
    )

    updateData({ properties: updatedProperties })
    closeModal()
  }

  // 儲存電錶讀數
  const saveMeterReading = (roomId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    const meterInput = document.getElementById('currentMeter') as HTMLInputElement
    const currentMeter = parseInt(meterInput.value) || 0
    const lastMeter = property.rooms.find((r: Room) => r.id === roomId)?.lm || 0

    if (currentMeter < lastMeter) {
      alert(t('meterCannotBeLess', state.lang))
      return
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: p.rooms.map(r => 
              r.id === roomId
                ? { ...r, cm: currentMeter }
                : r
            )
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('meterUpdated', state.lang))
    closeModal()
  }

  // 儲存編輯房間
  const saveEditRoom = (roomId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    const roomNumInput = document.getElementById('editRoomNumber') as HTMLInputElement
    const floorInput = document.getElementById('editFloor') as HTMLInputElement
    const rentInput = document.getElementById('editRent') as HTMLInputElement
    const depositInput = document.getElementById('editDeposit') as HTMLInputElement
    const contractStartInput = document.getElementById('editContractStart') as HTMLInputElement
    const contractEndInput = document.getElementById('editContractEnd') as HTMLInputElement

    if (!roomNumInput?.value.trim()) {
      alert(t('pleaseEnterRoomNumber', state.lang))
      return
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: p.rooms.map(r => 
              r.id === roomId
                ? { 
                    ...r, 
                    n: roomNumInput.value.trim(),
                    f: parseInt(floorInput.value) || r.f,
                    r: parseInt(rentInput.value) || r.r,
                    d: parseInt(depositInput.value) || r.d,
                    // 更新起租日和到期日（如果房間是已出租狀態）
                    ...(r.s === 'occupied' ? {
                      in: contractStartInput?.value || r.in || '',
                      out: contractEndInput?.value || r.out || ''
                    } : {
                      // 如果房間不是已出租狀態，清空日期
                      in: undefined,
                      out: undefined
                    })
                  }
                : r
            )
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('roomUpdated', state.lang))
    closeModal()
  }

  // 儲存編輯報修
  const saveEditMaintenance = (maintId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    // 獲取所有輸入元素
    const categoryInput = document.getElementById('editMaintCategory') as HTMLSelectElement
    const titleInput = document.getElementById('editMaintTitle') as HTMLInputElement
    const descInput = document.getElementById('editMaintDesc') as HTMLTextAreaElement
    const urgInput = document.getElementById('editMaintUrg') as HTMLSelectElement
    const statusInput = document.getElementById('editMaintStatus') as HTMLSelectElement
    const paymentStatusInput = document.getElementById('editMaintPaymentStatus') as HTMLSelectElement
    const estimatedCostInput = document.getElementById('editMaintEstimatedCost') as HTMLInputElement
    const actualCostInput = document.getElementById('editMaintActualCost') as HTMLInputElement
    const estimatedCompletionInput = document.getElementById('editMaintEstimatedCompletion') as HTMLInputElement
    const actualCompletionDateInput = document.getElementById('editMaintActualCompletionDate') as HTMLInputElement
    const technicianInput = document.getElementById('editMaintTechnician') as HTMLInputElement
    const invoiceNumberInput = document.getElementById('editMaintInvoiceNumber') as HTMLInputElement
    const notesInput = document.getElementById('editMaintNotes') as HTMLTextAreaElement

    if (!titleInput?.value.trim()) {
      alert(t('pleaseEnterTitle', state.lang))
      return
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            maintenance: (p.maintenance || []).map(m => 
              m.id === maintId
                ? {
                    ...m,
                    category: categoryInput.value as any,
                    title: titleInput.value.trim(),
                    desc: descInput.value.trim(),
                    urg: urgInput.value as any,
                    s: statusInput.value as any,
                    paymentStatus: paymentStatusInput.value as any,
                    estimatedCost: parseInt(estimatedCostInput.value) || undefined,
                    actualCost: parseInt(actualCostInput.value) || undefined,
                    estimatedCompletion: estimatedCompletionInput.value || undefined,
                    actualCompletionDate: actualCompletionDateInput.value || undefined,
                    technician: technicianInput.value.trim() || undefined,
                    invoiceNumber: invoiceNumberInput.value.trim() || undefined,
                    notes: notesInput.value.trim() || undefined
                  }
                : m
            )
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('maintenanceUpdated', state.lang))
    closeModal()
  }

  // 儲存新增報修
  const saveAddMaintenance = () => {
    const property = getCurrentProperty()
    if (!property) return

    const titleInput = document.getElementById('addMaintTitle') as HTMLInputElement
    const descInput = document.getElementById('addMaintDesc') as HTMLTextAreaElement
    const urgInput = document.getElementById('addMaintUrg') as HTMLSelectElement
    const statusInput = document.getElementById('addMaintStatus') as HTMLSelectElement
    const costInput = document.getElementById('addMaintCost') as HTMLInputElement
    const dateInput = document.getElementById('addMaintDate') as HTMLInputElement

    if (!titleInput?.value.trim()) {
      alert(t('pleaseEnterTitle', state.lang))
      return
    }

    const newId = Math.max(...(property.maintenance || []).map((m: any) => m.id), 0) + 1
    const newMaintenance = {
      id: newId,
      rid: 0, // 默認房間ID，用戶後續可以編輯
      n: '', // 默認房號
      t: '', // 默認租客姓名
      title: titleInput.value.trim(),
      desc: descInput.value.trim(),
      urg: urgInput.value as any,
      s: statusInput.value as any,
      date: new Date().toISOString().split('T')[0], // 報修日期
      cost: costInput.value ? parseInt(costInput.value) : undefined,
      repairDate: dateInput.value || undefined,
      type: 'maintenance' as const
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            maintenance: [...(p.maintenance || []), newMaintenance]
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('maintenanceAdded', state.lang))
    closeModal()
  }

  // 儲存新增裝修 - 修復版
  const saveAddRenovation = () => {
    try {
      console.log('開始儲存新增裝修...')
      
      const property = getCurrentProperty()
      if (!property) {
        alert('錯誤：找不到當前物業')
        return
      }

      // 獲取輸入元素 - 簡化版
      const titleInput = document.getElementById('addRenovationTitle') as HTMLInputElement
      const mainCategoryInput = document.getElementById('addRenovationMainCategory') as HTMLSelectElement
      const subCategoryInput = document.getElementById('addRenovationSubCategory') as HTMLSelectElement
      const statusInput = document.getElementById('addRenovationStatus') as HTMLSelectElement
      const dateInput = document.getElementById('addRenovationDate') as HTMLInputElement
      const amountInput = document.getElementById('addRenovationAmount') as HTMLInputElement
      const notesInput = document.getElementById('addRenovationNotes') as HTMLTextAreaElement

      // 驗證輸入
      if (!titleInput?.value.trim()) {
        alert('請輸入標題')
        return
      }

      // 獲取當前物業的維護記錄
      const currentMaintenance = property.maintenance || []
      console.log('當前維護記錄數量:', currentMaintenance.length)
      
      // 生成新 ID
      const maxId = currentMaintenance.length > 0 
        ? Math.max(...currentMaintenance.map((m: any) => m.id || 0))
        : 0
      const newId = maxId + 1
      console.log('新裝修記錄 ID:', newId)

      // 創建新的裝修記錄 - 簡化版
      const newRenovation = {
        id: newId,
        rid: 0, // 房間ID
        n: '公共區域', // 房號
        t: '', // 租客姓名
        title: titleInput.value.trim(),
        desc: notesInput?.value.trim() || '', // 備註作為描述
        urg: 'normal' as const, // 緊急程度
        s: (statusInput.value || 'pending') as any, // 狀態
        date: dateInput.value || new Date().toISOString().split('T')[0], // 日期
        // 金額
        cost: amountInput.value ? parseInt(amountInput.value) : 0,
        // 分類
        category: mainCategoryInput.value as any, // 大類：裝修或報修
        // 子分類存到 notes 或新增欄位
        subCategory: subCategoryInput.value || '',
        // 簡化：移除不必要的欄位
      }

      console.log('新裝修記錄:', newRenovation)

      // 更新物業資料
      const updatedProperties = (state.data?.properties || []).map(p => {
        if (p.id === property.id) {
          const updatedProperty = {
            ...p,
            maintenance: [...(p.maintenance || []), newRenovation]
          }
          console.log('更新後的物業維護記錄數量:', updatedProperty.maintenance.length)
          return updatedProperty
        }
        return p
      })

      // 更新資料
      updateData({ properties: updatedProperties })
      
      // 顯示成功訊息
      alert(`✅ 記錄已成功新增！\n標題：${titleInput.value.trim()}\n分類：${mainCategoryInput.value} - ${subCategoryInput.value}\n狀態：${statusInput.value}`)
      
      // 關閉模態框
      closeModal()
      
      // 強制重新渲染（可選）
      setTimeout(() => {
        updateState({ tab: state.tab }) // 觸發重新渲染
      }, 100)
      
    } catch (error) {
      console.error('儲存裝修時發生錯誤:', error)
      alert(`❌ 儲存失敗：${error instanceof Error ? error.message : '未知錯誤'}`)
    }
  }

  // 儲存新增水電支出
  const saveAddUtilityExpense = () => {
    const property = getCurrentProperty()
    if (!property) return

    const typeInput = document.getElementById('addUtilityType') as HTMLSelectElement
    const periodInput = document.getElementById('addUtilityPeriod') as HTMLInputElement
    const amountInput = document.getElementById('addUtilityAmount') as HTMLInputElement
    const paidDateInput = document.getElementById('addUtilityPaidDate') as HTMLInputElement
    const notesInput = document.getElementById('addUtilityNotes') as HTMLTextAreaElement

    if (!periodInput?.value.trim()) {
      alert(t('pleaseEnterPeriod', state.lang))
      return
    }

    if (!amountInput?.value || parseFloat(amountInput.value) <= 0) {
      alert(t('pleaseEnterAmount', state.lang))
      return
    }

    if (!paidDateInput?.value) {
      alert(t('pleaseEnterPaidDate', state.lang))
      return
    }

    const newId = Math.max(...(property.utilityExpenses || []).map((e: any) => e.id), 0) + 1
    const newExpense = {
      id: newId,
      type: typeInput.value as 'taipower' | 'water' | 'rent',
      period: periodInput.value.trim(),
      amount: parseFloat(amountInput.value),
      paidDate: paidDateInput.value,
      notes: notesInput.value.trim() || undefined,
      propertyId: property.id
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            utilityExpenses: [...(p.utilityExpenses || []), newExpense]
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('utilityExpenseAdded', state.lang))
    closeModal()
  }

  // 儲存編輯水電支出
  const saveEditUtilityExpense = (expenseId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    const typeInput = document.getElementById('editUtilityType') as HTMLSelectElement
    const periodInput = document.getElementById('editUtilityPeriod') as HTMLInputElement
    const amountInput = document.getElementById('editUtilityAmount') as HTMLInputElement
    const paidDateInput = document.getElementById('editUtilityPaidDate') as HTMLInputElement
    const notesInput = document.getElementById('editUtilityNotes') as HTMLTextAreaElement

    if (!periodInput?.value.trim()) {
      alert(t('pleaseEnterPeriod', state.lang))
      return
    }

    if (!amountInput?.value || parseFloat(amountInput.value) <= 0) {
      alert(t('pleaseEnterAmount', state.lang))
      return
    }

    if (!paidDateInput?.value) {
      alert(t('pleaseEnterPaidDate', state.lang))
      return
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            utilityExpenses: (p.utilityExpenses || []).map(e => 
              e.id === expenseId
                ? {
                    ...e,
                    type: typeInput.value as 'taipower' | 'water' | 'rent',
                    period: periodInput.value.trim(),
                    amount: parseFloat(amountInput.value),
                    paidDate: paidDateInput.value,
                    notes: notesInput.value.trim() || undefined
                  }
                : e
            )
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('utilityExpenseUpdated', state.lang))
    closeModal()
  }

  // 儲存新增補充收入
  const saveAddAdditionalIncome = () => {
    const property = getCurrentProperty()
    if (!property) return

    const typeInput = document.getElementById('addIncomeType') as HTMLSelectElement
    const monthInput = document.getElementById('addIncomeMonth') as HTMLInputElement
    const amountInput = document.getElementById('addIncomeAmount') as HTMLInputElement
    const descriptionInput = document.getElementById('addIncomeDescription') as HTMLInputElement
    const receivedDateInput = document.getElementById('addIncomeReceivedDate') as HTMLInputElement
    const notesInput = document.getElementById('addIncomeNotes') as HTMLTextAreaElement

    if (!monthInput?.value.trim()) {
      alert(t('pleaseEnterMonth', state.lang))
      return
    }

    if (!amountInput?.value || parseFloat(amountInput.value) <= 0) {
      alert(t('pleaseEnterAmount', state.lang))
      return
    }

    if (!descriptionInput?.value.trim()) {
      alert(t('pleaseEnterDescription', state.lang))
      return
    }

    if (!receivedDateInput?.value) {
      alert(t('pleaseEnterReceivedDate', state.lang))
      return
    }

    const newId = Math.max(...(property.additionalIncomes || []).map((i: any) => i.id), 0) + 1
    const newIncome = {
      id: newId,
      type: typeInput.value as 'washing-machine' | 'other',
      month: monthInput.value.trim(),
      amount: parseFloat(amountInput.value),
      description: descriptionInput.value.trim(),
      receivedDate: receivedDateInput.value,
      notes: notesInput.value.trim() || undefined,
      propertyId: property.id
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            additionalIncomes: [...(p.additionalIncomes || []), newIncome]
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('additionalIncomeAdded', state.lang))
    closeModal()
  }

  // 儲存編輯補充收入
  const saveEditAdditionalIncome = (incomeId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    const typeInput = document.getElementById('editIncomeType') as HTMLSelectElement
    const monthInput = document.getElementById('editIncomeMonth') as HTMLInputElement
    const amountInput = document.getElementById('editIncomeAmount') as HTMLInputElement
    const descriptionInput = document.getElementById('editIncomeDescription') as HTMLInputElement
    const receivedDateInput = document.getElementById('editIncomeReceivedDate') as HTMLInputElement
    const notesInput = document.getElementById('editIncomeNotes') as HTMLTextAreaElement

    if (!monthInput?.value.trim()) {
      alert(t('pleaseEnterMonth', state.lang))
      return
    }

    if (!amountInput?.value || parseFloat(amountInput.value) <= 0) {
      alert(t('pleaseEnterAmount', state.lang))
      return
    }

    if (!descriptionInput?.value.trim()) {
      alert(t('pleaseEnterDescription', state.lang))
      return
    }

    if (!receivedDateInput?.value) {
      alert(t('pleaseEnterReceivedDate', state.lang))
      return
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            additionalIncomes: (p.additionalIncomes || []).map(i => 
              i.id === incomeId
                ? {
                    ...i,
                    type: typeInput.value as 'washing-machine' | 'other',
                    month: monthInput.value.trim(),
                    amount: parseFloat(amountInput.value),
                    description: descriptionInput.value.trim(),
                    receivedDate: receivedDateInput.value,
                    notes: notesInput.value.trim() || undefined
                  }
                : i
            )
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('additionalIncomeUpdated', state.lang))
    closeModal()
  }

  // 儲存更新費用
  const saveUpdateCost = (maintenanceId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    const amountInput = document.getElementById('updateCostAmount') as HTMLInputElement
    const paymentStatusInput = document.getElementById('updateCostPaymentStatus') as HTMLSelectElement
    const completionDateInput = document.getElementById('updateCostCompletionDate') as HTMLInputElement
    const invoiceNumberInput = document.getElementById('updateCostInvoiceNumber') as HTMLInputElement
    const notesInput = document.getElementById('updateCostNotes') as HTMLTextAreaElement

    if (!amountInput?.value || parseFloat(amountInput.value) <= 0) {
      alert(t('pleaseEnterAmount', state.lang))
      return
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            maintenance: (p.maintenance || []).map(m => 
              m.id === maintenanceId
                ? {
                    ...m,
                    actualCost: parseFloat(amountInput.value),
                    paymentStatus: paymentStatusInput.value as any,
                    actualCompletionDate: completionDateInput.value || undefined,
                    invoiceNumber: invoiceNumberInput.value.trim() || undefined,
                    notes: notesInput.value.trim() || undefined,
                    s: 'completed' as const // 更新費用後標記為已完成
                  }
                : m
            )
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('costUpdated', state.lang))
    closeModal()
  }

  // 儲存抄錶記錄詳情修改
  const saveMeterReadingDetail = (recordId: number) => {
    const property = getCurrentProperty()
    if (!property || !property.meterHistory) return

    // 查找要修改的記錄
    const recordIndex = property.meterHistory.findIndex((m: any) => m.id === recordId)
    if (recordIndex === -1) {
      alert('找不到抄錶記錄')
      return
    }

    const updatedReadings = [...property.meterHistory[recordIndex].readings]
    let hasChanges = false

    // 更新每個房間的讀數
    updatedReadings.forEach((reading: any) => {
      const input = document.getElementById(`reading-${reading.rid}`) as HTMLInputElement
      if (input) {
        const newReading = parseInt(input.value)
        if (!isNaN(newReading) && newReading !== reading.reading) {
          // 檢查新讀數是否大於等於上期讀數
          if (newReading < (reading.previous || 0)) {
            alert(`房間 ${reading.rid} 的本期讀數不能小於上期讀數`)
            return
          }
          
          reading.reading = newReading
          // 重新計算用電度和電費
          reading.usage = newReading - (reading.previous || 0)
          reading.fee = reading.usage * state.data.electricityRate
          hasChanges = true
        }
      }
    })

    if (!hasChanges) {
      alert('沒有修改任何讀數')
      return
    }

    // 更新總電費
    const totalFee = updatedReadings.reduce((sum: number, r: any) => sum + (r.fee || 0), 0)

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            meterHistory: (p.meterHistory || []).map((m: any, idx: number) => 
              idx === recordIndex
                ? {
                    ...m,
                    readings: updatedReadings,
                    totalFee: totalFee,
                    updatedAt: new Date().toISOString().split('T')[0]
                  }
                : m
            )
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert('抄錶記錄已更新')
    closeModal()
  }

  // 刪除抄錶記錄
  const deleteMeterReading = (recordId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    if (!confirm('確定要永久刪除這筆抄錶記錄嗎？此操作無法復原。')) {
      return
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            meterHistory: (p.meterHistory || []).filter((m: any) => m.id !== recordId)
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert('抄錶記錄已刪除')
    closeModal()
  }

  // 儲存退租
  const saveMoveOut = (roomId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    const finalMeterInput = document.getElementById('finalMeter') as HTMLInputElement
    const moveOutDateInput = document.getElementById('moveOutDate') as HTMLInputElement

    const finalMeter = parseInt(finalMeterInput.value) || 0
    const moveOutDate = moveOutDateInput.value

    // 檢查是否有未繳費用
    const room = property.rooms.find((r: Room) => r.id === roomId)
    if (!room) return

    // 檢查該房間是否有待收款項
    const pendingPayments = property.payments.filter((p: any) => p.rid === roomId && p.s === 'pending')
    if (pendingPayments.length > 0) {
      const totalPending = pendingPayments.reduce((sum: number, p: any) => sum + p.total, 0)
      const confirmMessage = `⚠️ ${t('warning', state.lang)}\n\n${t('unpaidWarning', state.lang)} ${formatCurrency(totalPending)}\n\n${t('confirmMoveOutAnyway', state.lang)}`
      
      if (!confirm(confirmMessage)) {
        return // 用戶取消退租
      }
    }

    // 計算最後電費
    const lastMeter = room.lm || 0
    const electricityUsage = Math.max(0, finalMeter - lastMeter)
    const electricityFee = electricityUsage * state.data.electricityRate

    // 計算總費用（所有待繳費用 + 最後電費）
    const totalPending = pendingPayments.reduce((sum: number, p: any) => sum + p.total, 0)
    const totalDue = totalPending + electricityFee
    
    // 收集其他扣款項目
    const otherDeductions: Array<{reason: string, amount: number, notes: string}> = []
    let totalOtherDeductions = 0
    
    for (let i = 1; i <= 3; i++) {
      const reasonSelect = document.getElementById(`deductionReason${i}`) as HTMLSelectElement
      const amountInput = document.getElementById(`deductionAmount${i}`) as HTMLInputElement
      const notesInput = document.getElementById(`deductionNotes${i}`) as HTMLInputElement
      
      const reason = reasonSelect?.value || ''
      const amount = parseFloat(amountInput?.value || '0')
      const notes = notesInput?.value || ''
      
      if (reason && amount > 0) {
        otherDeductions.push({
          reason: getDeductionReasonText(reason, state.lang),
          amount: amount,
          notes: notes
        })
        totalOtherDeductions += amount
      }
    }
    
    // 總扣款 = 待繳費用 + 最後電費 + 其他扣款
    const totalDeductions = totalDue + totalOtherDeductions

    // 確認繳費和扣款（如果總扣款大於0）
    let feesPaid = false
    if (totalDeductions > 0) {
      let confirmMessage = `💰 ${t('totalDeductions', state.lang)}: ${formatCurrency(totalDeductions)}\n\n`
      
      // 顯示詳細扣款項目
      if (totalPending > 0) {
        confirmMessage += `🏠 ${t('unpaidPayments', state.lang)}: ${formatCurrency(totalPending)}\n`
      }
      if (electricityFee > 0) {
        confirmMessage += `⚡ ${t('finalElectricityFee', state.lang)}: ${formatCurrency(electricityFee)}\n`
      }
      if (totalOtherDeductions > 0) {
        confirmMessage += `📝 ${t('otherDeductions', state.lang)}: ${formatCurrency(totalOtherDeductions)}\n`
        otherDeductions.forEach(d => {
          confirmMessage += `  • ${d.reason}: ${formatCurrency(d.amount)}${d.notes ? ` (${d.notes})` : ''}\n`
        })
      }
      
      confirmMessage += `\n💰 ${t('originalDeposit', state.lang)}: ${formatCurrency(room.d || 0)}\n`
      confirmMessage += `💰 ${t('depositToReturn', state.lang)}: ${formatCurrency(Math.max(0, (room.d || 0) - totalDeductions))}\n\n`
      confirmMessage += `${t('confirmPaymentAndMoveOut', state.lang)}`
      
      if (!confirm(confirmMessage)) {
        alert(t('moveOutCancelled', state.lang))
        return // 用戶取消退租
      }
      
      feesPaid = true
    }

    // 處理繳費記錄：將所有待繳費用標記為「已繳費」並移動到 history
    const paidPayments = property.payments
      .filter((p: any) => p.rid === roomId && p.s === 'pending')
      .map((p: any) => ({
        ...p,
        s: 'paid' as const,
        paid: moveOutDate,
        notes: p.notes ? `${p.notes} (退租時一併繳清)` : '退租時一併繳清'
      }))
    
    // 更新 payments：移除已繳費的記錄
    const updatedPayments = property.payments.filter((p: any) => !(p.rid === roomId && p.s === 'pending'))
    
    // 更新 history：添加已繳費的記錄
    const updatedHistory = [...(property.history || []), ...paidPayments]
    
    // 如果有電費，創建已繳費的電費記錄並添加到 history
    if (electricityFee > 0 && feesPaid) {
      const paymentId = Math.max(
        ...updatedPayments.map((p: any) => p.id),
        ...updatedHistory.map((p: any) => p.id),
        0
      ) + 1
      
      const currentMonth = new Date().toISOString().slice(0, 7).replace('-', '/') // YYYY/MM
      
      const finalElectricityPayment = {
        id: paymentId,
        rid: roomId,
        n: room.n,
        t: room.t || '',
        m: currentMonth,
        r: 0, // 租金為0（只收電費）
        u: electricityUsage,
        e: electricityFee,
        total: electricityFee,
        due: moveOutDate,
        paid: moveOutDate,
        s: 'paid' as const,
        notes: `退租最後電費 - 最後讀數: ${finalMeter}, 上期讀數: ${lastMeter} (退租時一併繳清)`,
        isFinalElectricity: true, // 標記為最後電費
        electricityRate: state.data.electricityRate // 保存當時的電費單價
      }
      
      updatedHistory.push(finalElectricityPayment)
    }
    
    // 將其他扣款記錄到「其他收入」中
    let updatedAdditionalIncomes = property.additionalIncomes || []
    if (otherDeductions.length > 0) {
      const incomeId = Math.max(...updatedAdditionalIncomes.map((i: any) => i.id), 0) + 1
      const today = new Date().toISOString().split('T')[0]
      
      otherDeductions.forEach((deduction, index) => {
        const deductionIncome = {
          id: incomeId + index,
          date: today,
          type: 'other',
          amount: deduction.amount,
          notes: `退租扣款 - ${deduction.reason}: ${deduction.notes || '無備註'}`,
          relatedRoom: room.n,
          relatedTenant: room.t || '',
          isMoveOutDeduction: true
        }
        updatedAdditionalIncomes.push(deductionIncome)
      })
    }
    
    // 創建電表抄寫記錄（同步電表讀數）
    let updatedMeterHistory = property.meterHistory || []
    if (finalMeter > 0) {
      const meterRecordId = Math.max(...updatedMeterHistory.map((m: any) => m.id), 0) + 1
      const today = new Date().toISOString().split('T')[0]
      const meterMonth = new Date().toISOString().slice(0, 7).replace('-', '/')
      
      const finalMeterReading = {
        id: meterRecordId,
        date: today,
        month: meterMonth,
        readings: [{
          rid: roomId,
          roomNumber: room.n,
          reading: finalMeter,
          usage: electricityUsage,
          fee: electricityFee
        }],
        isFinalReading: true, // 標記為最後抄錶
        notes: `退租最後抄錶 - 租客: ${room.t || '未知'}`
      }
      
      updatedMeterHistory.push(finalMeterReading)
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: p.rooms.map(r => 
              r.id === roomId
                ? { 
                    ...r, 
                    s: 'available' as const,
                    // 保留歷史租客資訊（不刪除，只是標記為歷史）
                    previousTenant: r.t, // 保存前租客姓名
                    previousPhone: r.p, // 保存前租客電話
                    previousContractStart: r.in, // 保存合約開始日
                    previousContractEnd: r.out, // 保存合約結束日
                    // 清空當前租客資訊
                    t: undefined,
                    p: undefined,
                    in: undefined,
                    out: undefined,
                    cs: undefined,
                    ce: undefined,
                    cm: finalMeter,
                    // 記錄退租資訊
                    moveOutDate: moveOutDate,
                    finalMeter: finalMeter,
                    finalElectricityFee: electricityFee
                  }
                : r
            ),
            // 更新繳費記錄
            payments: updatedPayments,
            // 更新歷史記錄
            history: updatedHistory,
            // 更新電表抄寫歷史
            meterHistory: updatedMeterHistory,
            // 更新其他收入（扣款記錄）
            additionalIncomes: updatedAdditionalIncomes
          }
        : p
    )

    updateData({ properties: updatedProperties })
    
    // 顯示成功訊息
    let successMessage = `✅ ${t('moveOutCompleted', state.lang)}\n\n`
    
    if (totalDeductions > 0) {
      successMessage += `💰 ${t('totalDeductions', state.lang)}: ${formatCurrency(totalDeductions)}\n`
      
      if (totalPending > 0) {
        successMessage += `  🏠 ${t('unpaidPayments', state.lang)}: ${formatCurrency(totalPending)}\n`
      }
      if (electricityFee > 0) {
        successMessage += `  ⚡ ${t('finalElectricityFee', state.lang)}: ${formatCurrency(electricityFee)}\n`
      }
      if (totalOtherDeductions > 0) {
        successMessage += `  📝 ${t('otherDeductions', state.lang)}: ${formatCurrency(totalOtherDeductions)}\n`
      }
      
      successMessage += `\n💰 ${t('originalDeposit', state.lang)}: ${formatCurrency(room.d || 0)}\n`
      successMessage += `💰 ${t('depositToReturn', state.lang)}: ${formatCurrency(Math.max(0, (room.d || 0) - totalDeductions))}\n\n`
      successMessage += `📝 ${t('allFeesPaid', state.lang)}`
      
      if (totalOtherDeductions > 0) {
        successMessage += `\n\n✅ ${t('deductionsWillBeRecorded', state.lang)}`
      }
    } else {
      successMessage += t('moveOutCompleted', state.lang)
    }
    
    alert(successMessage)
    
    closeModal()
  }

  // 儲存快速收款
  const saveQuickPay = (paymentId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    const payment = property.payments.find((p: any) => p.id === paymentId)
    if (!payment) return

    const methodInput = document.getElementById('paymentMethod') as HTMLSelectElement
    const dateInput = document.getElementById('paymentDate') as HTMLInputElement
    const notesInput = document.getElementById('paymentNotes') as HTMLTextAreaElement

    const updatedPayment = {
      ...payment,
      s: 'paid' as const,
      paid: dateInput.value,
      paymentMethod: methodInput.value,
      notes: notesInput.value.trim() || undefined,
      electricityRate: payment.electricityRate || state.data.electricityRate // 保留原有或使用當前單價
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            payments: p.payments.filter(pay => pay.id !== paymentId),
            history: [...(p.history || []), updatedPayment]
          }
        : p
    )

    updateData({ properties: updatedProperties })
    
    // 顯示成功訊息
    alert(`✅ ${t('collected', state.lang)}\n${payment.n} - ${payment.t}\n${formatCurrency(payment.total)}`)
    closeModal()
  }

  // 儲存入住房間（三種付款方式）
  const saveCheckIn = async (roomId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    const paymentOption = (document.querySelector('input[name="paymentOption"]:checked') as HTMLInputElement)?.value
    if (!paymentOption) {
      alert('請選擇付款方式');
      return
    }

    const nameInput = document.getElementById('checkInTenantName') as HTMLInputElement
    const phoneInput = document.getElementById('checkInTenantPhone') as HTMLInputElement
    const startInput = document.getElementById('checkInContractStart') as HTMLInputElement
    const endInput = document.getElementById('checkInContractEnd') as HTMLInputElement

    if (!nameInput?.value.trim()) {
      alert('請填寫租客姓名');
      return
    }

    if (!startInput?.value) {
      alert('請填寫起租日');
      return
    }

    const room = property.rooms.find((r: any) => r.id === roomId)
    if (!room) return

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
    
    try {
      // 只呼叫一個新的原子性入住API
      const response = await fetch(`${API_URL}/checkin/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomId,
          tenant: {
            tenant_name: nameInput.value.trim(),
            tenant_phone: phoneInput?.value.trim() || '',
            check_in_date: startInput.value,
            check_out_date: endInput?.value || null
          },
          payment_option: paymentOption
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || '入住失敗')
      }

      // 重新載入資料
      await reloadFromCloud()
      alert('✅ 入住成功')
      closeModal()
    } catch (err: any) {
      alert('❌ 入住失敗：' + err.message)
    }
  }

  // 儲存退房結算
  const saveCheckOut = async (roomId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    // 獲取退房類型
    const checkOutTypeInput = document.querySelector('input[name="checkOutType"]:checked') as HTMLInputElement
    if (!checkOutTypeInput) {
      alert('請選擇退房類型')
      return
    }

    // 獲取電費資訊
    const finalMeterInput = document.getElementById('checkOutFinalMeter') as HTMLInputElement
    const electricityCostInput = document.getElementById('checkOutElectricityCost') as HTMLInputElement
    const totalDeductionsInput = document.getElementById('checkOutTotalDeductions') as HTMLInputElement
    
    // 獲取扣款項目
    const damageInput = document.getElementById('checkOutDamageDeduction') as HTMLInputElement
    const cleaningInput = document.getElementById('checkOutCleaningFee') as HTMLInputElement
    const otherInput = document.getElementById('checkOutOtherDeductions') as HTMLInputElement
    const notesInput = document.getElementById('checkOutNotes') as HTMLTextAreaElement

    // 驗證必填字段
    if (!finalMeterInput?.value) {
      alert('請填寫最後電錶讀數')
      return
    }

    const finalMeter = parseInt(finalMeterInput.value) || 0
    const electricityCost = parseFloat(electricityCostInput?.value || '0') || 0
    const totalDeductions = parseFloat(totalDeductionsInput?.value || '0') || 0
    const damage = parseFloat(damageInput?.value || '0') || 0
    const cleaning = parseFloat(cleaningInput?.value || '0') || 0
    const other = parseFloat(otherInput?.value || '0') || 0
    const notes = notesInput?.value || ''

    // 找到房間
    const room = property.rooms.find((r: Room) => r.id === roomId)
    if (!room) return

    const deposit = room.d || 0
    const depositRefund = Math.max(0, deposit - totalDeductions)

    // 更新房間狀態
    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: p.rooms.map(r => 
              r.id === roomId
                ? {
                    ...r,
                    s: 'available' as const, // 恢復為可出租狀態
                    t: '', // 清空租客姓名
                    p: '', // 清空租客電話
                    in: '', // 清空入住日期
                    out: '', // 清空退房日期
                    cm: finalMeter, // 更新最後電錶讀數
                    finalMeter, // 儲存最後電錶讀數
                    finalElectricityFee: electricityCost, // 儲存最後電費
                    checkOutType: checkOutTypeInput.value as 'scheduled' | 'early',
                    checkOutDate: new Date().toISOString().split('T')[0],
                    checkOutDeductions: {
                      damage,
                      cleaning,
                      other,
                      electricity: electricityCost,
                      total: totalDeductions
                    },
                    depositRefund,
                    checkOutNotes: notes
                  }
                : r
            ),
            // 添加退房記錄到歷史
            history: [
              ...(p.history || []),
              {
                id: Math.max(...(p.history || []).map((h: any) => h.id), 0) + 1,
                rid: roomId,
                n: room.n,
                t: room.t || '',
                m: new Date().toISOString().split('T')[0].substring(0, 7).replace('-', '/'),
                r: 0, // 租金為0（退房）
                u: finalMeter - (room.initialElectricityMeter || room.pm || 0), // 用電度數
                e: electricityCost, // 電費
                total: -totalDeductions, // 負數表示扣款
                due: new Date().toISOString().split('T')[0],
                paid: new Date().toISOString().split('T')[0],
                s: 'paid' as const,
                notes: `退房結算 - ${checkOutTypeInput.value === 'scheduled' ? '到期退房' : '臨時退房'}${notes ? ` (${notes})` : ''}`,
                isCheckOut: true,
                deductions: {
                  damage,
                  cleaning,
                  other,
                  electricity: electricityCost
                },
                depositRefund
              }
            ]
          }
        : p
    )

    
    // 同步後端
    const _API = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
    const _room = property?.rooms.find((r: any) => r.id === roomId)
    if (_room) {
      try {
        // 更新房間狀態為空房
        await fetch(`${_API}/rooms/${roomId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'available',
            tenant_name: null,
            tenant_phone: null,
            check_in_date: null,
            check_out_date: null,
            monthly_rent: _room.r,
            deposit: _room.d,
            floor: _room.f,
            room_number: _room.n,
            current_meter: _room.cm || 0,
            previous_meter: _room.pm || 0,
            current_tenant_id: null
          })
        })
        // 更新租約狀態為已退房
        if (_room.current_tenant_id) {
          await fetch(`${_API}/tenants/${_room.current_tenant_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'closed'
            })
          })
        }
        await reloadFromCloud()
      } catch (e) {
        console.error('退房同步失敗:', e)
      }
    }


    updateData({ properties: updatedProperties })
    
    // 顯示成功訊息
    let successMessage = `✅ 退房結算完成！\n\n`
    successMessage += `房間: ${room.n} (${room.f}F)\n`
    successMessage += `租客: ${room.t || '-'}\n`
    successMessage += `退房類型: ${checkOutTypeInput.value === 'scheduled' ? '到期退房' : '臨時退房'}\n`
    successMessage += `押金: ${formatCurrency(deposit)}\n`
    successMessage += `總扣款: ${formatCurrency(totalDeductions)}\n`
    successMessage += `應退押金: ${formatCurrency(depositRefund)}\n`
    
    if (notes) {
      successMessage += `\n備註: ${notes}`
    }
    
    alert(successMessage)
    closeModal()
  }

  // 儲存出租房間
  const saveRentOut = async (roomId: number) => {
    const property = getCurrentProperty()
    if (!property) return

    const nameInput = document.getElementById('tenantName') as HTMLInputElement
    const phoneInput = document.getElementById('tenantPhone') as HTMLInputElement
    const startInput = document.getElementById('contractStart') as HTMLInputElement
    const endInput = document.getElementById('contractEnd') as HTMLInputElement
    const meterInput = document.getElementById('initialMeter') as HTMLInputElement

    if (!nameInput?.value.trim()) {
      alert(t('pleaseEnterTenantName', state.lang))
      return
    }

    const startDate = new Date(startInput.value)
    const endDate = new Date(endInput.value)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // 清除時間部分
    
    // 獲取房間資訊（租金）
    const room = property.rooms.find((r: any) => r.id === roomId)
    if (!room) return
    
    // 準備更新房間
    const updatedRoom = { 
      ...room, 
      s: 'occupied' as const,
      t: nameInput.value.trim(),
      p: phoneInput.value.trim(),
      in: startInput.value,
      out: endInput.value,
      lm: parseInt(meterInput.value) || 0,
      cm: parseInt(meterInput.value) || 0
    }
    
    // 準備付款記錄
    const newPayments: any[] = []
    
    // 如果出租日期在過去，為過去的月份生成待繳費
    if (startDate < today) {
      // 計算從出租開始到上個月的所有月份
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth() + 1 // 1-based
      
      let year = startDate.getFullYear()
      let month = startDate.getMonth() + 1
      
      // 生成每個月的付款記錄，直到上個月
      while (year < currentYear || (year === currentYear && month < currentMonth)) {
        const monthStr = `${year}/${month.toString().padStart(2, '0')}`
        
        // 計算到期日（通常是該月5號）
        const dueDate = new Date(year, month - 1, 5) // 月份是0-based
        
        // 生成付款記錄
        newPayments.push({
          id: Math.max(...property.payments.map((p: any) => p.id), ...(property.history || []).map((p: any) => p.id), 0) + newPayments.length + 1,
          rid: roomId,
          n: room.n,
          t: nameInput.value.trim(),
          m: monthStr,
          r: room.r,
          u: 0, // 初始用電度數為0
          e: 0, // 初始電費為0
          total: room.r,
          due: dueDate.toISOString().split('T')[0],
          s: 'pending' as const,
          electricityRate: state.data.electricityRate // 保存當時的電費單價
        })
        
        // 移到下個月
        month++
        if (month > 12) {
          month = 1
          year++
        }
      }
    }
    
    // 也為當前月份生成付款記錄（如果還沒生成）
    const currentMonthStr = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}`
    const hasCurrentMonthPayment = newPayments.some(p => p.m === currentMonthStr) || 
                                   property.payments.some((p: any) => p.rid === roomId && p.m === currentMonthStr)
    
    if (!hasCurrentMonthPayment) {
      // 計算下個月的5號為到期日
      const nextMonth = new Date(today)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const dueDate = `${nextMonth.getFullYear()}-${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}-05`
      
      newPayments.push({
        id: Math.max(...property.payments.map((p: any) => p.id), ...(property.history || []).map((p: any) => p.id), 0) + newPayments.length + 1,
        rid: roomId,
        n: room.n,
        t: nameInput.value.trim(),
        m: currentMonthStr,
        r: room.r,
        u: 0,
        e: 0,
        total: room.r,
        due: dueDate,
        s: 'pending' as const,
        electricityRate: state.data.electricityRate // 保存當時的電費單價
      })
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: p.rooms.map(r => 
              r.id === roomId ? updatedRoom : r
            ),
            payments: [...p.payments, ...newPayments]
          }
        : p
    )    // 呼叫後端更新房間狀態
    const _apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
    const _room = property.rooms.find((r: any) => r.id === roomId)
    if (_room) {
      fetch(`${_apiUrl}/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          floor: _room.f,
          room_number: _room.n,
          monthly_rent: _room.r,
          deposit: _room.d,
          status: 'occupied',
          tenant_name: document.getElementById('tenantName') ? (document.getElementById('tenantName') as HTMLInputElement).value : _room.t,
          tenant_phone: document.getElementById('tenantPhone') ? (document.getElementById('tenantPhone') as HTMLInputElement).value : '',
          check_in_date: document.getElementById('startDate') ? (document.getElementById('startDate') as HTMLInputElement).value : '',
          check_out_date: document.getElementById('endDate') ? (document.getElementById('endDate') as HTMLInputElement).value : '',
          current_meter: _room.cm || 0,
          previous_meter: _room.pm || 0
        })
      }).catch(e => console.error('後端同步失敗:', e))
    }

    
    // 同步後端（續租邏輯）
    const _API2 = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
    const _room2 = property?.rooms.find((r: any) => r.id === roomId)
    if (_room2 && _room2.current_tenant_id) {
      try {
        // 舊租約標記為已續租
        await fetch(`${_API2}/tenants/${_room2.current_tenant_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'renewed'
          })
        })
        // 建立新租約（押金沿用）
        const newTenantRes = await fetch(`${_API2}/tenants/${_room2.current_tenant_id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: property.id,
            room_id: roomId,
            room_number: _room2.n,
            tenant_name: _room2.t,
            tenant_phone: _room2.p || '',
            check_in_date: (document.getElementById('renewStart') as HTMLInputElement)?.value || '',
            check_out_date: (document.getElementById('renewEnd') as HTMLInputElement)?.value || '',
            rent_amount: parseInt((document.getElementById('renewRent') as HTMLInputElement)?.value || _room2.r),
            deposit_amount: _room2.d,
            deposit_status: 'paid',
            deposit_carried_over: true,
            previous_tenant_id: _room2.current_tenant_id,
            status: 'active'
          })
        })
        const newTenantData = await newTenantRes.json()
        // 更新房間的 current_tenant_id
        if (newTenantData.success) {
          await fetch(`${_API2}/tenants/${_room2.current_tenant_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              current_tenant_id: newTenantData.data.id,
              check_out_date: (document.getElementById('renewEnd') as HTMLInputElement)?.value || '',
              monthly_rent: parseInt((document.getElementById('renewRent') as HTMLInputElement)?.value || _room2.r),
              deposit: _room2.d,
              floor: _room2.f,
              room_number: _room2.n,
              status: 'occupied',
              tenant_name: _room2.t,
              current_meter: _room2.cm || 0,
              previous_meter: _room2.pm || 0
            })
          })
        }
        await reloadFromCloud()
      } catch (e) {
        console.error('續租同步失敗:', e)
      }
    }


    updateData({ properties: updatedProperties })
    
    // 顯示成功訊息，包含生成的付款記錄數量
    if (newPayments.length > 0) {
      alert(`${t('roomRented', state.lang)}
已為此房間生成 ${newPayments.length} 筆待繳費記錄`)
    } else {
      alert(t('roomRented', state.lang))
    }
    
    closeModal()
  }

  // 儲存新增房間
  const saveAddRoom = async () => {
    const property = getCurrentProperty()
    if (!property) return

    const roomNumInput = document.getElementById('rn') as HTMLInputElement
    const floorInput = document.getElementById('rf') as HTMLInputElement
    const rentInput = document.getElementById('rr') as HTMLInputElement
    const depositInput = document.getElementById('rd') as HTMLInputElement

    if (!roomNumInput?.value.trim()) {
      alert('請填寫房號')
      return
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'
      const res = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          floor: parseInt(floorInput.value) || 1,
          room_number: roomNumInput.value.trim(),
          monthly_rent: parseInt(rentInput.value) || 7000,
          deposit: parseInt(depositInput.value) || 14000,
          status: 'available'
        })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || '新增失敗')

      const newRoom = {
        id: data.data.id,
        f: (data.data.floor || 1).toString(),
        n: data.data.room_number,
        r: data.data.rent_amount || parseInt(rentInput.value) || 7000,
        d: data.data.deposit_amount || parseInt(depositInput.value) || 14000,
        s: 'available' as const
      }

      const updatedProperties = (state.data?.properties || []).map(p => 
        p.id === property.id
          ? { ...p, rooms: [...p.rooms, newRoom] }
          : p
      )

      updateData({ properties: updatedProperties })
      alert('✅ 房間新增成功')
      closeModal()
    } catch (err: any) {
      alert('❌ 新增房間失敗：' + err.message)
    }
  }

  // 處理快速收租
  const processQuickCollectRent = () => {
    const property = getCurrentProperty()
    if (!property) return

    // 獲取選中的房間和電表讀數
    const selectedRooms: Array<{roomId: number, meterReading: number, electricityCost: number}> = []
    let totalAmount = 0
    
    const rateInput = document.getElementById('collectElectricityRate') as HTMLInputElement
    const electricityRate = parseFloat(rateInput?.value || state.data.electricityRate.toString() || '5')

    property.rooms.filter((r: any) => r.s === 'occupied').forEach((room: any) => {
      const checkbox = document.getElementById(`room-${room.id}`) as HTMLInputElement
      if (checkbox?.checked) {
        const meterInput = document.getElementById(`room-meter-${room.id}`) as HTMLInputElement
        const currentReading = parseFloat(meterInput?.value || '0')
        const lastReading = room.lastMeter || 0
        const usage = Math.max(0, currentReading - lastReading)
        const electricityCost = usage * electricityRate
        
        selectedRooms.push({
          roomId: room.id,
          meterReading: currentReading,
          electricityCost
        })
        
        totalAmount += room.r + electricityCost
      }
    })

    if (selectedRooms.length === 0) {
      alert('請選擇至少一個房間')
      return
    }

    const monthInput = document.getElementById('collectMonth') as HTMLInputElement
    const dateInput = document.getElementById('collectDate') as HTMLInputElement
    const methodInput = document.getElementById('paymentMethod') as HTMLSelectElement
    const notesInput = document.getElementById('collectNotes') as HTMLTextAreaElement

    if (!monthInput?.value.trim()) {
      alert('請填寫收款月份')
      return
    }

    // 為每個選中的房間創建付款記錄
    const newPayments: any[] = []
    const newHistory: any[] = []
    
    selectedRooms.forEach(({roomId, meterReading, electricityCost}) => {
      const room = property.rooms.find((r: any) => r.id === roomId)
      if (!room) return

      const paymentId = Math.max(
        ...property.payments.map((p: any) => p.id),
        ...(property.history || []).map((p: any) => p.id),
        0
      ) + newPayments.length + 1

      const lastReading = room.lastMeter || 0
      const usage = Math.max(0, meterReading - lastReading)

      const payment = {
        id: paymentId,
        rid: roomId,
        n: room.n,
        t: room.t || '租客',
        m: monthInput.value.trim(),
        r: room.r,
        u: usage,
        e: electricityCost,
        total: room.r + electricityCost,
        due: dateInput.value || new Date().toISOString().split('T')[0],
        paid: dateInput.value || new Date().toISOString().split('T')[0],
        s: 'paid' as const,
        paymentMethod: methodInput?.value || 'cash',
        notes: notesInput?.value || '',
        electricityRate: electricityRate,
        meterReading: meterReading
      }

      newPayments.push(payment)
      newHistory.push(payment)
    })

    // 更新房間的電錶讀數和電費
    const updatedRooms = property.rooms.map((room: any) => {
      const selectedRoom = selectedRooms.find(r => r.roomId === room.id)
      if (selectedRoom) {
        return {
          ...room,
          lastMeter: selectedRoom.meterReading,
          lastMeterUsage: Math.max(0, selectedRoom.meterReading - (room.lastMeter || 0)),
          elecFee: selectedRoom.electricityCost,
          lastMeterDate: dateInput.value || new Date().toISOString().split('T')[0],
          lastMeterMonth: monthInput.value.trim()
        }
      }
      return room
    })

    // 更新數據
    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: updatedRooms,
            payments: [...p.payments.filter((payment: any) => {
              // 移除待付款記錄（如果存在）
              const isSelectedRoom = selectedRooms.some(r => r.roomId === payment.rid)
              const isSameMonth = payment.m === monthInput.value.trim()
              return !(isSelectedRoom && isSameMonth && payment.s === 'pending')
            }), ...newPayments],
            history: [...(p.history || []), ...newHistory]
          }
        : p
    )

    updateData({ 
      properties: updatedProperties,
      electricityRate: electricityRate
    })
    
    // 顯示成功訊息
    alert(`✅ 成功收取 ${selectedRooms.length} 間房間的租金\n總金額：${formatCurrency(totalAmount)}`)
    closeModal()
  }

  // 計算總金額的函數
  const calculateTotalAmount = () => {
    const property = getCurrentProperty()
    if (!property) return

    let total = 0
    let selectedCount = 0
    
    property.rooms.filter((r: any) => r.s === 'occupied').forEach((room: any) => {
      const checkbox = document.getElementById(`room-${room.id}`) as HTMLInputElement
      if (checkbox?.checked) {
        total += room.r + (room.elecFee || 0)
        selectedCount++
      }
    })

    const totalElement = document.getElementById('totalAmount')
    const countElement = document.getElementById('selectedCount')
    
    if (totalElement) totalElement.textContent = formatCurrency(total)
    if (countElement) countElement.textContent = `${selectedCount} 間房`
  }

  // 計算總金額的函數（在模態框渲染後調用）
  useEffect(() => {
    if (type === 'quickCollectRent') {

      // 綁定事件監聽器
      const checkboxes = document.querySelectorAll('input[type="checkbox"]')
      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateTotalAmount)
      })

      // 初始計算
      calculateTotalAmount()

      return () => {
        checkboxes.forEach(checkbox => {
          checkbox.removeEventListener('change', calculateTotalAmount)
        })
      }
    }
  }, [type, getCurrentProperty])

  // 獲取扣款原因的文字描述
  const getDeductionReasonText = (reasonCode: string, lang: string): string => {
    const reasonMap: Record<string, Record<string, string>> = {
      'repair': { 'zh-TW': '修復費用', 'vi-VN': 'Phí sửa chữa' },
      'cleaning': { 'zh-TW': '清潔費用', 'vi-VN': 'Phí vệ sinh' },
      'damage': { 'zh-TW': '損壞賠償', 'vi-VN': 'Bồi thường thiệt hại' },
      'late': { 'zh-TW': '逾期費用', 'vi-VN': 'Phí trễ' },
      'other': { 'zh-TW': '其他費用', 'vi-VN': 'Phí khác' }
    }
    
    return reasonMap[reasonCode]?.[lang] || reasonCode
  }

  // 處理單筆收款
  // 處理補繳操作
  const processCompletePayment = (roomId: number) => {
    const property = getCurrentProperty()
    if (!property) {
      alert('無法處理補繳：找不到當前物業')
      return
    }

    // 獲取付款類型
    const paymentTypeInput = document.querySelector('input[name="completePaymentType"]:checked') as HTMLInputElement
    const paymentMethodSelect = document.getElementById('completePaymentMethod') as HTMLSelectElement
    const paymentDateInput = document.getElementById('completePaymentDate') as HTMLInputElement
    const notesInput = document.getElementById('completePaymentNotes') as HTMLTextAreaElement
    
    if (!paymentTypeInput || !paymentMethodSelect || !paymentDateInput) {
      alert('請填寫所有必填欄位')
      return
    }

    const paymentType = paymentTypeInput.value
    const paymentMethod = paymentMethodSelect.value
    const paymentDate = paymentDateInput.value
    const notes = notesInput?.value || ''

    // 找到房間
    const room = property.rooms.find((r: any) => r.id === roomId)
    if (!room) {
      alert('找不到房間')
      return
    }

    // 計算應收款項
    let amount = 0
    let description = ''
    
    if (paymentType === 'full') {
      amount = room.r + (room.d || 0)
      description = '全額租金+押金'
    } else if (paymentType === 'rent_only') {
      amount = room.r
      description = '租金'
    }

    // 確定房間的新狀態
    let newRoomStatus: any = 'occupied'
    if (paymentType === 'full') {
      newRoomStatus = 'occupied'
    } else if (paymentType === 'rent_only' && room.s === 'reserved') {
      newRoomStatus = 'pending_payment' // 只付租金，押金待付
    }

    // 更新房間狀態
    const updatedRooms = property.rooms.map((r: any) => 
      r.id === roomId
        ? {
            ...r,
            s: newRoomStatus,
            // 如果是全額付款，設置入住日期
            ...(paymentType === 'full' && !r.in ? { 
              in: new Date().toISOString().split('T')[0] 
            } : {})
          }
        : r
    )

    // 創建歷史記錄（補繳的記錄應該直接進入歷史，而不是待付款）
    const historyId = Math.max(...(property.history || []).map((h: any) => h.id), 0) + 1
    
    const currentMonth = new Date().toISOString().slice(0, 7).replace('-', '/')
    
    // 歷史記錄（補繳完成）
    const newHistory: any = {
      id: historyId,
      rid: roomId,
      n: room.n,
      t: room.t || '未命名租客',
      m: currentMonth,
      r: room.r,
      u: 0, // 用電度數（稍後更新）
      e: 0, // 電費（稍後更新）
      total: amount,
      due: new Date().toISOString().split('T')[0],
      s: 'paid' as const,
      paid: paymentDate,
      paymentMethod: paymentMethod,
      notes: `補繳：${description}${notes ? ` - ${notes}` : ''}`
    }

    // 更新數據
    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: updatedRooms,
            // 不添加到 payments 陣列，因為這是已付款的記錄
            // 只添加到 history 陣列
            history: [...(p.history || []), newHistory]
          }
        : p
    )

    updateData({ properties: updatedProperties })
    
    // 顯示成功訊息
    let successMessage = ''
    if (paymentType === 'full') {
      successMessage = `✅ 補繳成功！房間 ${room.n} 已設為「已出租」狀態。\n` +
                      `💰 收款金額：${formatCurrency(amount)}\n` +
                      `📅 付款日期：${paymentDate}\n` +
                      `💳 付款方式：${paymentMethod}`
    } else if (paymentType === 'rent_only') {
      successMessage = `✅ 租金補繳成功！\n` +
                      `💰 收款金額：${formatCurrency(amount)}\n` +
                      `📅 付款日期：${paymentDate}\n` +
                      `💳 付款方式：${paymentMethod}\n` +
                      `⚠️ 注意：押金尚未收取，房間狀態為「待付款」`
    }
    
    alert(successMessage)
    closeModal()
  }

  const processCollectPayment = (paymentId: number) => {
    const property = getCurrentProperty()
    if (!property || !paymentId) {
      alert('無法處理收款：缺少必要數據')
      return
    }

    // 獲取輸入的電錶讀數
    const meterInput = document.getElementById('collectMeterReading') as HTMLInputElement
    const currentMeterReading = parseFloat(meterInput?.value || '0')
    
    if (!currentMeterReading && currentMeterReading !== 0) {
      alert('請輸入本期電錶讀數')
      return
    }

    // 找到要更新的付款記錄
    const paymentToUpdate = property.payments.find((p: any) => p.id === paymentId)
    if (!paymentToUpdate) {
      alert('找不到要收款的付款記錄')
      return
    }

    if (paymentToUpdate.s !== 'pending') {
      alert('此筆款項已經收款完成')
      return
    }

    // 找到對應的房間
    const room = property.rooms.find((r: any) => r.id === paymentToUpdate.rid)
    if (!room) {
      alert('找不到對應的房間')
      return
    }

    // 計算用電度數和電費
    const lastMeterReading = room.lastMeter || room.lm || 0
    const electricityUsage = Math.max(0, currentMeterReading - lastMeterReading)
    const electricityRate = state.data.electricityRate || 6
    const electricityFee = electricityUsage * electricityRate
    
    // 驗證用電度數合理性
    if (electricityUsage > 1000) {
      if (!confirm(`用電度數異常：${electricityUsage} 度\n是否確定要繼續？`)) {
        return
      }
    }

    // 更新房間電錶數據
    const updatedRooms = property.rooms.map((r: any) => 
      r.id === room.id
        ? {
            ...r,
            lastMeter: currentMeterReading,
            lastMeterUsage: electricityUsage,
            elecFee: electricityFee,
            lastMeterDate: new Date().toISOString().split('T')[0],
            lastMeterMonth: paymentToUpdate.m
          }
        : r
    )

    // 更新付款記錄（標記為已付款並歸檔）
    const updatedPayments = property.payments.map((p: any) => 
      p.id === paymentId
        ? {
            ...p,
            u: electricityUsage,
            e: electricityFee,
            total: p.r + electricityFee,
            electricityRate: electricityRate,
            paid: new Date().toISOString().split('T')[0],
            s: 'paid',
            paymentMethod: 'cash', // 預設為現金，可以擴展選擇
            notes: `電錶讀數: ${lastMeterReading} → ${currentMeterReading} (${electricityUsage}度)`,
            archived: true, // 標記為已歸檔
            collectedBy: '管理員', // 收款人員（可以擴展為當前用戶）
            collectionDate: new Date().toISOString().split('T')[0], // 收款日期
            // 根據付款類型設置 tenantType 和 paymentType
            tenantType: p.tenantType || (p.paymentType === 'deposit' ? 'new' : 'existing'),
            paymentType: p.paymentType || 'rent'
          }
        : p
    )

    // 移動到歷史記錄（自動歸檔）
    const paidPayment = updatedPayments.find((p: any) => p.id === paymentId && p.s === 'paid')
    const remainingPayments = updatedPayments.filter((p: any) => p.id !== paymentId)
    const updatedHistory = [...(property.history || []), paidPayment].filter(Boolean)

    // 更新數據
    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: updatedRooms,
            payments: remainingPayments,
            history: updatedHistory
          }
        : p
    )

    updateData({ properties: updatedProperties })
    
    // 顯示成功訊息
    alert(`✅ 成功收款 ${paymentToUpdate.n} - ${paymentToUpdate.t}\n` +
          `💰 總金額: ${formatCurrency(paymentToUpdate.r + electricityFee)}\n` +
          `🏠 租金: ${formatCurrency(paymentToUpdate.r)}\n` +
          `⚡ 電費: ${formatCurrency(electricityFee)} (${electricityUsage}度 × ${electricityRate}元)`)
    
    closeModal()
  }

  // 處理恢復付款
  const processRestorePayment = (paymentId: number) => {
    const property = getCurrentProperty()
    if (!property || !paymentId) {
      alert('無法處理恢復：缺少必要數據')
      return
    }

    // 獲取恢復原因和備註
    const reasonSelect = document.getElementById('restoreReason') as HTMLSelectElement
    const notesTextarea = document.getElementById('restoreNotes') as HTMLTextAreaElement
    
    const restoreReason = reasonSelect?.value || 'mistake'
    const restoreNotes = notesTextarea?.value || ''

    // 找到要恢復的付款記錄（在歷史記錄中）
    const paymentToRestore = property.history?.find((p: any) => p.id === paymentId)
    if (!paymentToRestore) {
      alert('找不到要恢復的付款記錄')
      return
    }

    // 檢查是否可恢復：已付款且（已歸檔或在歷史記錄中）
    const isInHistory = property.history?.some((p: any) => p.id === paymentId) || false
    const isArchived = paymentToRestore.archived === true || isInHistory
    
    if (paymentToRestore.s !== 'paid' || !isArchived) {
      alert(`此款項無法恢復\n狀態: ${paymentToRestore.s}\n歸檔: ${paymentToRestore.archived}\n在歷史記錄中: ${isInHistory}`)
      return
    }

    // 檢查是否可恢復（例如：收款後7天內）
    const collectedDate = paymentToRestore.paid ? new Date(paymentToRestore.paid) : null
    const today = new Date()
    const daysSinceCollection = collectedDate ? 
      Math.floor((today.getTime() - collectedDate.getTime()) / (1000 * 60 * 60 * 24)) : 999
    
    if (daysSinceCollection > 7) {
      if (!confirm(`此款項已收款超過7天（${daysSinceCollection}天），確定要恢復嗎？`)) {
        return
      }
    }

    // 恢復為待收狀態
    const restoredPayment = {
      ...paymentToRestore,
      s: 'pending',
      archived: false,
      paid: undefined,
      paymentMethod: undefined,
      collectedBy: undefined,
      collectionDate: undefined,
      notes: `🔄 恢復原因：${getRestoreReasonText(restoreReason)}${restoreNotes ? `\n備註：${restoreNotes}` : ''}\n原收款日期：${paymentToRestore.paid}`
    }

    // 從歷史記錄移除，加回待付款列表
    const updatedHistory = property.history?.filter((p: any) => p.id !== paymentId) || []
    const updatedPayments = [...property.payments, restoredPayment]
    
    // 更新數據
    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            payments: updatedPayments,
            history: updatedHistory
          }
        : p
    )

    updateData({ properties: updatedProperties })
    
    // 顯示成功訊息
    alert(`✅ 成功恢復款項 ${paymentToRestore.n} - ${paymentToRestore.t}\n` +
          `💰 金額: ${formatCurrency(paymentToRestore.total)}\n` +
          `📅 月份: ${paymentToRestore.m}\n` +
          `🔄 恢復原因: ${getRestoreReasonText(restoreReason)}`)
    
    closeModal()
  }

  // 獲取恢復原因的文字描述
  const getRestoreReasonText = (reason: string) => {
    switch (reason) {
      case 'mistake': return '誤操作標記'
      case 'wrong_amount': return '金額有誤'
      case 'tenant_request': return '租客要求修改'
      case 'other': return '其他原因'
      default: return '未知原因'
    }
  }

  // 計算電費函數（用於收款模態框）
  const calculateElectricityFee = (currentReading: string) => {
    const reading = parseFloat(currentReading || '0')
    const lastReading = data?.lastMeterReading || 0
    const electricityRate = state.data.electricityRate || 6
    
    // 計算用電度數
    const electricityUsage = Math.max(0, reading - lastReading)
    
    // 計算電費
    const electricityFee = electricityUsage * electricityRate
    
    // 更新顯示
    const usageDisplay = document.getElementById('electricityUsageDisplay')
    const feeDisplay = document.getElementById('electricityFeeDisplay')
    const totalDisplay = document.getElementById('totalAmountDisplay')
    
    if (usageDisplay) {
      usageDisplay.textContent = `${electricityUsage} ${t('degree', state.lang)}`
    }
    
    if (feeDisplay) {
      feeDisplay.textContent = formatCurrency(electricityFee)
    }
    
    if (totalDisplay) {
      const rentAmount = data?.rentAmount || 0
      totalDisplay.textContent = formatCurrency(rentAmount + electricityFee)
    }
    
    // 返回計算結果
    return {
      electricityUsage,
      electricityFee,
      totalAmount: (data?.rentAmount || 0) + electricityFee
    }
  }

  // 處理批量抄表
  const processBatchMeterReading = () => {
    const property = getCurrentProperty()
    if (!property) return

    // 獲取選中的房間和讀數
    const meterReadings: Array<{roomId: number, reading: number, usage: number, cost: number}> = []
    let totalUsage = 0
    let totalCost = 0
    let selectedCount = 0
    
    const rateInput = document.getElementById('electricityRate') as HTMLInputElement
    const electricityRate = parseFloat(rateInput?.value || state.data.electricityRate.toString() || '5')

    property.rooms.filter((r: any) => r.s === 'occupied').forEach((room: any) => {
      const checkbox = document.getElementById(`meter-room-${room.id}`) as HTMLInputElement
      if (checkbox?.checked) {
        const readingInput = document.getElementById(`meter-reading-${room.id}`) as HTMLInputElement
        const currentReading = parseFloat(readingInput?.value || '0')
        const lastReading = room.lastMeter || 0
        const usage = Math.max(0, currentReading - lastReading)
        const cost = usage * electricityRate
        
        meterReadings.push({
          roomId: room.id,
          reading: currentReading,
          usage,
          cost
        })
        
        totalUsage += usage
        totalCost += cost
        selectedCount++
      }
    })

    if (selectedCount === 0) {
      alert('請選擇至少一個房間')
      return
    }

    const monthInput = document.getElementById('meterMonth') as HTMLInputElement
    const dateInput = document.getElementById('meterDate') as HTMLInputElement

    if (!monthInput?.value.trim()) {
      alert('請填寫抄錶月份')
      return
    }

    // 更新房間的電錶讀數和電費
    const updatedRooms = property.rooms.map((room: any) => {
      const reading = meterReadings.find(r => r.roomId === room.id)
      if (reading) {
        return {
          ...room,
          lastMeter: reading.reading,
          lastMeterUsage: reading.usage,
          elecFee: reading.cost,
          lastMeterDate: dateInput.value || new Date().toISOString().split('T')[0],
          lastMeterMonth: monthInput.value.trim()
        }
      }
      return room
    })

    // 更新付款記錄中的電費金額
    const updatedPayments = property.payments.map((payment: any) => {
      const reading = meterReadings.find(r => r.roomId === payment.rid)
      if (reading && payment.s === 'pending') {
        // 只更新待付款記錄的電費
        return {
          ...payment,
          u: reading.usage,
          e: reading.cost,
          total: payment.r + reading.cost,
          electricityRate: electricityRate
        }
      }
      return payment
    })

    // 更新數據
    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: updatedRooms,
            payments: updatedPayments
          }
        : p
    )

    updateData({ 
      properties: updatedProperties,
      electricityRate
    })
    
    // 顯示成功訊息
    alert(`✅ 成功記錄 ${selectedCount} 間房間的電錶讀數\n總用電度數：${totalUsage} 度\n總電費：${formatCurrency(totalCost)}\n\n📝 已更新對應房間的待付款電費金額`)
    closeModal()
  }

  // 批量抄表的計算函數
  useEffect(() => {
    if (type === 'batchMeterReading') {
      const calculateMeterTotals = () => {
        const property = getCurrentProperty()
        if (!property) return

        const rateInput = document.getElementById('electricityRate') as HTMLInputElement
        const electricityRate = parseFloat(rateInput?.value || state.data.electricityRate.toString() || '5')

        let totalUsage = 0
        let totalCost = 0
        let selectedCount = 0
        
        property.rooms.filter((r: any) => r.s === 'occupied').forEach((room: any) => {
          const checkbox = document.getElementById(`meter-room-${room.id}`) as HTMLInputElement
          if (checkbox?.checked) {
            const readingInput = document.getElementById(`meter-reading-${room.id}`) as HTMLInputElement
            const currentReading = parseFloat(readingInput?.value || '0')
            const lastReading = room.lastMeter || 0
            const usage = Math.max(0, currentReading - lastReading)
            const cost = usage * electricityRate
            
            totalUsage += usage
            totalCost += cost
            selectedCount++

            // 更新單個房間的用電度數顯示
            const usageElement = document.getElementById(`meter-usage-${room.id}`)
            if (usageElement) {
              usageElement.textContent = `${usage} 度`
            }
          }
        })

        // 更新總計顯示
        const totalUsageElement = document.getElementById('totalUsage')
        const totalCostElement = document.getElementById('totalElectricityCost')
        const selectedCountElement = document.getElementById('meterSelectedCount')
        
        if (totalUsageElement) totalUsageElement.textContent = `${totalUsage} 度`
        if (totalCostElement) totalCostElement.textContent = formatCurrency(totalCost)
        if (selectedCountElement) selectedCountElement.textContent = selectedCount.toString()
      }

      // 綁定事件監聽器
      const checkboxes = document.querySelectorAll('input[type="checkbox"][id^="meter-room-"]')
      const readingInputs = document.querySelectorAll('input[type="number"][id^="meter-reading-"]')
      const rateInput = document.getElementById('electricityRate')

      const updateCalculations = () => calculateMeterTotals()

      checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCalculations)
      })
      
      readingInputs.forEach(input => {
        input.addEventListener('input', updateCalculations)
      })
      
      if (rateInput) {
        rateInput.addEventListener('input', updateCalculations)
      }

      // 初始計算
      calculateMeterTotals()

      return () => {
        checkboxes.forEach(checkbox => {
          checkbox.removeEventListener('change', updateCalculations)
        })
        
        readingInputs.forEach(input => {
          input.removeEventListener('input', updateCalculations)
        })
        
        if (rateInput) {
          rateInput.removeEventListener('input', updateCalculations)
        }
      }
    }

    // 退房結算計算函數
    if (type === 'checkOut') {

      // 添加隱藏的輸入字段
      const addHiddenInputs = () => {
        const formContainer = document.querySelector('.modal-box')
        if (!formContainer) return

        // 檢查是否已存在
        if (!document.getElementById('checkOutElectricityCost')) {
          const electricityCostInput = document.createElement('input')
          electricityCostInput.type = 'hidden'
          electricityCostInput.id = 'checkOutElectricityCost'
          electricityCostInput.value = '0'
          formContainer.appendChild(electricityCostInput)
        }

        if (!document.getElementById('checkOutTotalDeductions')) {
          const totalDeductionsInput = document.createElement('input')
          totalDeductionsInput.type = 'hidden'
          totalDeductionsInput.id = 'checkOutTotalDeductions'
          totalDeductionsInput.value = '0'
          formContainer.appendChild(totalDeductionsInput)
        }
      }

      // 綁定事件
      const finalMeterInput = document.getElementById('checkOutFinalMeter')
      const rateInput = document.getElementById('checkOutElectricityRate')
      const damageInput = document.getElementById('checkOutDamageDeduction')
      const cleaningInput = document.getElementById('checkOutCleaningFee')
      const otherInput = document.getElementById('checkOutOtherDeductions')

      const bindEvents = () => {
        if (finalMeterInput) {
          finalMeterInput.addEventListener('input', calculateElectricityCost)
        }
        if (rateInput) {
          rateInput.addEventListener('input', calculateElectricityCost)
        }
        if (damageInput) {
          damageInput.addEventListener('input', calculateTotalSettlement)
        }
        if (cleaningInput) {
          cleaningInput.addEventListener('input', calculateTotalSettlement)
        }
        if (otherInput) {
          otherInput.addEventListener('input', calculateTotalSettlement)
        }
      }

      // 初始化
      addHiddenInputs()
      bindEvents()

      return () => {
        // 清理事件監聽器
        if (finalMeterInput) {
          finalMeterInput.removeEventListener('input', calculateElectricityCost)
        }
        if (rateInput) {
          rateInput.removeEventListener('input', calculateElectricityCost)
        }
        if (damageInput) {
          damageInput.removeEventListener('input', calculateTotalSettlement)
        }
        if (cleaningInput) {
          cleaningInput.removeEventListener('input', calculateTotalSettlement)
        }
        if (otherInput) {
          otherInput.removeEventListener('input', calculateTotalSettlement)
        }
      }
    }
  }, [type, getCurrentProperty, state.data.electricityRate])

  return (
    <div 
      className="modal"
      onClick={handleBackdropClick}
    >
      <div className="modal-box">
        {renderModalContent()}
      </div>
    </div>
  )
}