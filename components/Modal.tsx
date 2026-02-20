'use client'

import { AppState } from '@/lib/types'
import { t } from '@/lib/translations'
import { formatCurrency } from '@/lib/utils'

interface ModalProps {
  type: string
  data?: any
  state: AppState
  updateState: (updates: Partial<AppState>) => void
  updateData: (updates: any) => void
  closeModal: () => void
  getCurrentProperty: () => any
}

export default function Modal({ 
  type, 
  data, 
  state, 
  updateState, 
  updateData, 
  closeModal, 
  getCurrentProperty 
}: ModalProps) {
  
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
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">{t('propertyName', state.lang)}</label>
                <input type="text" id="pname" className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('address', state.lang)}</label>
                <input type="text" id="paddr" className="input-field" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t('floors', state.lang)}</label>
                <input type="number" id="pfloors" defaultValue={3} min={1} className="input-field" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('cancel', state.lang)}
              </button>
              <button onClick={saveAddProperty} className="flex-1 btn btn-primary">
                {t('save', state.lang)}
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
        const room = property?.rooms.find(r => r.id === data)
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
              
              {room.s === 'occupied' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-2">{t('tenantInfo', state.lang)}</h3>
                  <div className="text-sm text-gray-600">
                    {t('lastMeter', state.lang)}: {room.lm || 0} {t('degree', state.lang)}<br/>
                    {t('currentMeter', state.lang)}: {room.cm || 0} {t('degree', state.lang)}<br/>
                    {t('electricityReceivable', state.lang)}: {formatCurrency(Math.round(((room.cm || 0) - (room.lm || 0)) * state.data.electricityRate))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={closeModal} className="flex-1 btn bg-gray-200">
                {t('close', state.lang)}
              </button>
              <button 
                onClick={() => {
                  closeModal()
                  openModal(room.s === 'occupied' ? 'updateMeter' : 'editRoom', room.id)
                }}
                className="flex-1 btn btn-primary"
              >
                {room.s === 'occupied' ? t('updateMeter', state.lang) : t('edit', state.lang)}
              </button>
            </div>
          </>
        )

      case 'updateMeter':
        const meterRoom = property?.rooms.find(r => r.id === data)
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
        const rentRoom = property?.rooms.find(r => r.id === data)
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
    const lastMeter = property.rooms.find(r => r.id === roomId)?.lm || 0

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

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            rooms: p.rooms.map(r => 
              r.id === roomId
                ? { 
                    ...r, 
                    s: 'occupied' as const,
                    t: nameInput.value.trim(),
                    p: phoneInput.value.trim(),
                    cs: startInput.value,
                    ce: endInput.value,
                    lm: parseInt(meterInput.value) || 0,
                    cm: parseInt(meterInput.value) || 0
                  }
                : r
            )
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('roomRented', state.lang))
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