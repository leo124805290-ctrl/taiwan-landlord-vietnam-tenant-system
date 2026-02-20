'use client'

import { AppState, Property } from '@/lib/types'
import { t } from '@/lib/translations'

interface MaintenanceProps {
  property: Property
  state: AppState
  updateState: (updates: Partial<AppState>) => void
  updateData: (updates: any) => void
  openModal: (type: string, data?: any) => void
}

export default function Maintenance({ property, state, updateState, updateData, openModal }: MaintenanceProps) {
  return (
    <div className="space-y-4">
      {/* 新增報修按鈕 */}
      <button 
        onClick={() => openModal('addMaint')}
        className="btn btn-primary w-full"
      >
        ➕ {t('addMaint', state.lang)}
      </button>

      {/* 報修列表 */}
      <div className="space-y-3">
        {(property.maintenance || []).map(maint => (
          <div key={maint.id} className="card">
            <div className="flex gap-2 mb-2">
              <span className={`badge ${
                maint.urg === 'urgent' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {t(maint.urg, state.lang)}
              </span>
              <span className={`badge ${
                maint.s === 'pending' 
                  ? 'bg-orange-100 text-orange-700' 
                  : maint.s === 'assigned' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {t(maint.s + 'Status', state.lang)}
              </span>
            </div>

            <h3 className="font-bold text-lg mb-2">{maint.title}</h3>
            <p className="text-gray-600 mb-2">{maint.desc}</p>
            <div className="text-sm text-gray-500 mb-2">
              {maint.n} - {maint.t}
            </div>

            {maint.cost && (
              <div className="text-sm font-bold text-blue-600">
                維修費用: ${maint.cost.toLocaleString()}
              </div>
            )}
            
            {maint.repairDate && (
              <div className="text-xs text-gray-500">
                維修日期: {maint.repairDate}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => openModal('editMaint', maint.id)}
                className="flex-1 btn bg-blue-100 text-blue-700 text-sm"
              >
                {t('edit', state.lang)}
              </button>
              <button 
                onClick={() => deleteMaintenance(maint.id)}
                className="flex-1 btn bg-red-100 text-red-600 text-sm"
              >
                {t('delete', state.lang)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  function deleteMaintenance(maintId: number) {
    if (!confirm(t('confirmDelete', state.lang))) return

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            maintenance: (p.maintenance || []).filter(m => m.id !== maintId)
          }
        : p
    )

    updateData({ properties: updatedProperties })
  }
}