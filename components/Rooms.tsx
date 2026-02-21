'use client'

import { t } from '@/lib/translations'
import { calculateStats, formatCurrency } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

interface RoomsProps {
  property: any
}

export default function Rooms({ property }: RoomsProps) {
  const { state, updateState, updateData, openModal } = useApp()
  const stats = calculateStats(
    property, 
    state.data, 
    state.revenueTimeScope, 
    state.revenueYear, 
    state.revenueMonth,
    state.elecTimeScope,
    state.elecYear,
    state.elecMonth
  )

  // 刪除房間
  const deleteRoom = (roomId: number) => {
    if (!confirm(t('confirmDeleteRoom', state.lang))) return
    
    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? { ...p, rooms: p.rooms.filter(r => r.id !== roomId) }
        : p
    )
    
    updateData({ properties: updatedProperties })
    alert(t('roomDeleted', state.lang))
  }

  return (
    <div className="space-y-4">
      {/* 房間總覽卡片 */}
      <div className="card gradient-bg text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs opacity-75 mb-1">總房間</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </div>
          <div>
            <div className="text-xs opacity-75 mb-1">本月應收電費</div>
            <div className="text-3xl font-bold">{formatCurrency(Math.round(stats.elecReceivable))}</div>
          </div>
          <div>
            <div className="text-xs opacity-75 mb-1">總押金</div>
            <div className="text-3xl font-bold">{formatCurrency(stats.totalDeposit)}</div>
          </div>
          <div>
            <div className="text-xs opacity-75 mb-1">空房</div>
            <div className="text-3xl font-bold">{stats.available}</div>
          </div>
        </div>
      </div>

      {/* 新增房間按鈕 */}
      <button 
        onClick={() => openModal('addRoom')}
        className="btn btn-primary w-full"
      >
        ➕ {t('addRoom', state.lang)}
      </button>

      {/* 房間列表 */}
      <div className="grid md:grid-cols-2 gap-4">
        {property.rooms.map((room: any) => {
          const elecFee = room.s === 'occupied' 
            ? ((room.cm || 0) - (room.pm || 0)) * state.data.electricityRate 
            : 0

          return (
            <div key={room.id} className="card">
              <div className="flex justify-between mb-3">
                <div>
                  <div className="text-xl font-bold">
                    {room.n} ({room.f}F)
                  </div>
                  <div className="text-sm text-gray-600">
                    {room.t || t('forRent', state.lang)}
                  </div>
                </div>
                <span className={`badge ${
                  room.s === 'occupied' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-green-100 text-green-700'
                }`}>
                  {t(room.s, state.lang)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <div className="text-xs text-gray-600">月租金</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(room.r)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">押金</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(room.d || 0)}
                  </div>
                </div>
              </div>

              {room.s === 'occupied' && (
                <div className="p-3 bg-gray-50 rounded-lg mb-3">
                  <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                    <div>
                      {t('lastMeter', state.lang)}: {room.lm || 0} {t('degree', state.lang)}
                    </div>
                    <div>
                      {t('currentMeter', state.lang)}: {room.cm || 0} {t('degree', state.lang)}
                    </div>
                    <div className="col-span-2 font-bold text-orange-600">
                      {t('electricityReceivable', state.lang)}: {formatCurrency(Math.round(elecFee))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {room.s === 'occupied' ? (
                  <>
                    <button 
                      onClick={() => openModal('roomDetail', room.id)}
                      className="flex-1 btn btn-primary text-sm"
                    >
                      {t('details', state.lang)}
                    </button>
                    <button 
                      onClick={() => openModal('updateMeter', room.id)}
                      className="flex-1 btn bg-blue-100 text-blue-600 text-sm"
                    >
                      {t('updateMeter', state.lang)}
                    </button>
                    <button 
                      onClick={() => openModal('moveOut', room.id)}
                      className="flex-1 btn bg-red-100 text-red-600 text-sm"
                    >
                      {t('moveOut', state.lang)}
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => openModal('rentOut', room.id)}
                      className="flex-1 btn bg-green-600 text-white text-sm"
                    >
                      {t('rentOut', state.lang)}
                    </button>
                    <button 
                      onClick={() => openModal('editRoom', room.id)}
                      className="flex-1 btn bg-gray-200 text-sm"
                    >
                      {t('edit', state.lang)}
                    </button>
                    <button 
                      onClick={() => deleteRoom(room.id)}
                      className="flex-1 btn bg-red-100 text-red-600 text-sm"
                    >
                      {t('delete', state.lang)}
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}