'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'

export default function Settings() {
  const { state, updateState, updateData, openModal } = useApp()
  const updateRates = () => {
    const chargeRateInput = document.getElementById('chargeRate') as HTMLInputElement
    const actualRateInput = document.getElementById('actualRate') as HTMLInputElement

    const cr = parseFloat(chargeRateInput.value)
    const ar = parseFloat(actualRateInput.value)

    if (cr <= 0 || ar <= 0) {
      alert(t('rateMustBePositive', state.lang))
      return
    }

    updateData({
      electricityRate: cr,
      actualElectricityRate: ar
    })

    alert(t('updated', state.lang))
  }

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rental-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    alert(t('exported', state.lang))
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        updateData(importedData)
        updateState({ currentProperty: importedData.properties[0]?.id || null })
        alert(t('imported', state.lang))
      } catch (error) {
        alert(t('importFailed', state.lang) + (error as Error).message)
      }
    }
    reader.readAsText(file)
  }

  const resetAll = () => {
    if (!confirm(t('confirmReset', state.lang))) return
    if (!confirm(t('confirmResetFinal', state.lang))) return
    
    // 創建真正的空數據
    const emptyData = {
      properties: [],
      electricityRate: 6,
      actualElectricityRate: 4.5,
    }
    
    // 更新數據和狀態
    updateData(emptyData)
    updateState({ currentProperty: null })
    
    // 清除本地儲存
    localStorage.removeItem('multiPropertyDataV2')
    
    alert(t('resetCompleted', state.lang))
  }

  return (
    <div className="space-y-4">
      {/* 電費設定 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">{t('elecSettings', state.lang)}</h2>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('chargeRate', state.lang)}
            </label>
            <div className="flex gap-2">
              <input 
                type="number" 
                id="chargeRate" 
                defaultValue={state.data.electricityRate} 
                step="0.5"
                className="flex-1"
              />
              <span className="flex items-center px-3">
                {t('perUnit', state.lang)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('actualRate', state.lang)}
            </label>
            <div className="flex gap-2">
              <input 
                type="number" 
                id="actualRate" 
                defaultValue={state.data.actualElectricityRate} 
                step="0.1"
                className="flex-1"
              />
              <span className="flex items-center px-3">
                {t('perUnit', state.lang)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t('forAnalysis', state.lang)}
            </p>
          </div>
        </div>

        <button 
          onClick={updateRates}
          className="btn btn-primary w-full mt-4"
        >
          {t('updateRate', state.lang)}
        </button>
      </div>

      {/* 物業管理 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">{t('propertyManagement', state.lang)}</h2>
        
        <div className="space-y-2">
          {state.data.properties.map(property => (
            <div key={property.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <div className="font-bold">{property.name}</div>
                <div className="text-sm text-gray-600">
                  {property.rooms.length} {t('rooms', state.lang)}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => openModal('editProperty', property.id)}
                  className="btn bg-blue-100 text-blue-700 text-sm"
                >
                  {t('edit', state.lang)}
                </button>
                
                {state.data.properties.length > 1 && (
                  <button 
                    onClick={() => deleteProperty(property.id)}
                    className="btn bg-red-100 text-red-600 text-sm"
                  >
                    {t('delete', state.lang)}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 資料管理 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">{t('dataManagement', state.lang)}</h2>
        
        <button 
          onClick={exportData}
          className="btn bg-green-600 text-white w-full mb-2"
        >
          {t('exportData', state.lang)}
        </button>
        
        <button 
          onClick={() => document.getElementById('import')?.click()}
          className="btn bg-blue-600 text-white w-full"
        >
          {t('importData', state.lang)}
        </button>
        
        <input 
          type="file" 
          id="import" 
          accept=".json" 
          style={{ display: 'none' }}
          onChange={importData}
        />
      </div>

      {/* 危險操作 */}
      <div className="card bg-red-50 border-2 border-red-200">
        <h2 className="text-xl font-bold text-red-600 mb-4">
          {t('dangerZone', state.lang)}
        </h2>
        
        <button 
          onClick={resetAll}
          className="btn bg-red-600 text-white w-full"
        >
          {t('resetAll', state.lang)}
        </button>
      </div>
    </div>
  )

  function deleteProperty(propertyId: number) {
    if (!confirm(t('confirmDeleteProperty', state.lang))) return

    const updatedProperties = state.data.properties.filter(p => p.id !== propertyId)
    updateData({ properties: updatedProperties })
    
    if (state.currentProperty === propertyId) {
      updateState({ currentProperty: updatedProperties[0]?.id || null })
    }
  }
}