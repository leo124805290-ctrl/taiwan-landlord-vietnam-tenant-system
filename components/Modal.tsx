'use client'

import { Room } from '@/lib/types'
import { t } from '@/lib/translations'
import { formatCurrency } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

export default function Modal() {
  const { state, updateState, updateData, closeModal, getCurrentProperty } = useApp()
  
  const type = state.modal?.type || ''
  const data = state.modal?.data
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }

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
              <button 
                onClick={() => {
                  closeModal()
                  // 這裡無法直接調用 openModal，需要其他方式
                  // 暫時只關閉 modal
                }}
                className="flex-1 btn btn-primary"
              >
                {room.s === 'occupied' ? t('updateMeter', state.lang) : t('edit', state.lang)}
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

    const newId = Math.max(...state.data.properties.map(p => p.id), 0) + 1
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
  const saveAddPropertyWithRooms = () => {
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
        floorRooms.push(4) // 預設值
      }
    }

    const newId = Math.max(...state.data.properties.map(p => p.id), 0) + 1
    
    // 自動生成房間
    const rooms = []
    let roomId = 1
    
    for (let floor = 1; floor <= floors; floor++) {
      const roomsOnFloor = floorRooms[floor - 1]
      for (let roomNum = 1; roomNum <= roomsOnFloor; roomNum++) {
        rooms.push({
          id: roomId++,
          f: floor,
          n: `${floor}${roomNum.toString().padStart(2, '0')}`, // 如 101, 102, 201, 202
          r: defaultRent,
          d: defaultDeposit,
          s: 'available' as const
        })
      }
    }

    const newProperty = {
      id: newId,
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
    
    updateState({ currentProperty: newId })
    
    // 顯示成功訊息
    alert(`✅ 物業建立成功！\n已自動建立 ${rooms.length} 間房間`)
    closeModal()
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

    const updatedProperties = state.data.properties.map(p => 
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

    const updatedProperties = state.data.properties.map(p => 
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

    const updatedProperties = state.data.properties.map(p => 
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

    const updatedProperties = state.data.properties.map(p => 
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

    const updatedProperties = state.data.properties.map(p => 
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

  // 儲存新增裝修
  const saveAddRenovation = () => {
    const property = getCurrentProperty()
    if (!property) return

    const nameInput = document.getElementById('addRenovationName') as HTMLInputElement
    const descInput = document.getElementById('addRenovationDesc') as HTMLTextAreaElement
    const typeInput = document.getElementById('addRenovationType') as HTMLSelectElement
    const budgetInput = document.getElementById('addRenovationBudget') as HTMLInputElement
    const startInput = document.getElementById('addRenovationStart') as HTMLInputElement
    const endInput = document.getElementById('addRenovationEnd') as HTMLInputElement
    const contractorInput = document.getElementById('addRenovationContractor') as HTMLInputElement
    const statusInput = document.getElementById('addRenovationStatus') as HTMLSelectElement

    if (!nameInput?.value.trim()) {
      alert(t('pleaseEnterProjectName', state.lang))
      return
    }

    const newId = Math.max(...(property.maintenance || []).map((m: any) => m.id), 0) + 1
    const newRenovation = {
      id: newId,
      rid: 0, // 默認房間ID
      n: '', // 默認房號
      t: '', // 默認租客姓名
      title: nameInput.value.trim(),
      desc: descInput.value.trim(),
      urg: 'normal' as const, // 裝修默認緊急程度為普通
      type: 'renovation' as const,
      renovationType: typeInput.value,
      date: new Date().toISOString().split('T')[0], // 創建日期
      budget: budgetInput.value ? parseInt(budgetInput.value) : undefined,
      startDate: startInput.value || undefined,
      estimatedEndDate: endInput.value || undefined,
      contractor: contractorInput.value.trim() || undefined,
      s: statusInput.value as any
    }

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            maintenance: [...(p.maintenance || []), newRenovation]
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('renovationAdded', state.lang))
    closeModal()
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
      type: typeInput.value as 'taipower' | 'water',
      period: periodInput.value.trim(),
      amount: parseFloat(amountInput.value),
      paidDate: paidDateInput.value,
      notes: notesInput.value.trim() || undefined,
      propertyId: property.id
    }

    const updatedProperties = state.data.properties.map(p => 
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

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            utilityExpenses: (p.utilityExpenses || []).map(e => 
              e.id === expenseId
                ? {
                    ...e,
                    type: typeInput.value as 'taipower' | 'water',
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

    const updatedProperties = state.data.properties.map(p => 
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

    const updatedProperties = state.data.properties.map(p => 
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

    const updatedProperties = state.data.properties.map(p => 
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

    const updatedProperties = state.data.properties.map(p => 
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

    const updatedProperties = state.data.properties.map(p => 
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

    // 確認繳費（如果總費用大於0）
    let feesPaid = false
    if (totalDue > 0) {
      const confirmMessage = `💰 ${t('totalDue', state.lang)}: ${formatCurrency(totalDue)}\n\n`
        + `${t('confirmPaymentAndMoveOut', state.lang)}`
      
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

    const updatedProperties = state.data.properties.map(p => 
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
            meterHistory: updatedMeterHistory
          }
        : p
    )

    updateData({ properties: updatedProperties })
    
    // 顯示成功訊息
    if (totalDue > 0) {
      alert(`✅ ${t('moveOutCompleted', state.lang)}\n\n💰 ${t('totalDue', state.lang)}: ${formatCurrency(totalDue)}\n📝 ${t('allFeesPaid', state.lang)}`)
    } else {
      alert(t('moveOutCompleted', state.lang))
    }
    
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

    const updatedProperties = state.data.properties.map(p => 
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

  // 儲存出租房間
  const saveRentOut = (roomId: number) => {
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

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: p.rooms.map(r => 
              r.id === roomId ? updatedRoom : r
            ),
            payments: [...p.payments, ...newPayments]
          }
        : p
    )

    updateData({ properties: updatedProperties })
    
    // 顯示成功訊息，包含生成的付款記錄數量
    if (newPayments.length > 0) {
      alert(`${t('roomRented', state.lang)}\n已為此房間生成 ${newPayments.length} 筆待繳費記錄`)
    } else {
      alert(t('roomRented', state.lang))
    }
    
    closeModal()
  }

  // 儲存新增房間
  const saveAddRoom = () => {
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

    const newRoomId = Math.max(...property.rooms.map((r: any) => r.id), 0) + 1
    const newRoom = {
      id: newRoomId,
      f: parseInt(floorInput.value) || 1,
      n: roomNumInput.value.trim(),
      r: parseInt(rentInput.value) || 7000,
      d: parseInt(depositInput.value) || 14000,
      s: 'available' as const
    }

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? { ...p, rooms: [...p.rooms, newRoom] }
        : p
    )

    updateData({ properties: updatedProperties })
    closeModal()
  }

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