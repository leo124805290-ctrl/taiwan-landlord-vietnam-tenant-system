'use client'

import { AppState } from '@/lib/types'
import { t } from '@/lib/translations'

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