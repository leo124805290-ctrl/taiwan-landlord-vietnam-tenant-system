'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { systemSelfCheck } from '@/lib/utils'
import { useState } from 'react'

export default function Settings() {
  const { state, updateState, updateData } = useApp()
  const [checkResults, setCheckResults] = useState<{ ok: boolean; issues: string[] } | null>(null)
  
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

  const backupData = () => {
    const dataStr = JSON.stringify(state.data, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `房東管理系統_備份_${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    alert(t('backupSuccess', state.lang))
  }

  const restoreData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result)
          
          if (!confirm(t('confirmRestoreData', state.lang))) return
          
          const password = prompt(t('enterPasswordToRestore', state.lang))
          if (password !== '123456') {
            alert(t('incorrectPassword', state.lang))
            return
          }
          
          updateData(data)
          alert(t('restoreSuccess', state.lang))
        } catch (error) {
          alert(t('invalidBackupFile', state.lang))
        }
      }
      reader.readAsText(file)
    }
    
    input.click()
  }

  const runSystemCheck = () => {
    const results = systemSelfCheck(state.data)
    setCheckResults(results)
  }

  const resetData = () => {
    if (!confirm(t('confirmResetAllData', state.lang))) return
    
    const password = prompt(t('enterPasswordToReset', state.lang))
    if (password !== '123456') {
      alert(t('incorrectPassword', state.lang))
      return
    }

    updateData({
      properties: [],
      electricityRate: 6.5,
      actualElectricityRate: 5.5
    })

    alert(t('dataReset', state.lang))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">⚙️ {t('settingsTab', state.lang)}</h1>
      
      {/* 電費設定 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">💡 {t('electricityRates', state.lang)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">{t('chargeRate', state.lang)}</label>
            <input 
              id="chargeRate"
              type="number" 
              step="0.1"
              defaultValue={state.data.electricityRate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">{t('chargeRateDesc', state.lang)}</p>
          </div>
          <div>
            <label className="block mb-2">{t('actualRate', state.lang)}</label>
            <input 
              id="actualRate"
              type="number" 
              step="0.1"
              defaultValue={state.data.actualElectricityRate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">{t('actualRateDesc', state.lang)}</p>
          </div>
        </div>
        <button 
          onClick={updateRates}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          💾 {t('updateRates', state.lang)}
        </button>
      </div>

      {/* 資料管理 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">💾 {t('dataManagement', state.lang)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={backupData}
            className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
          >
            💾 {t('backupData', state.lang)}
          </button>
          
          <button 
            onClick={restoreData}
            className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2"
          >
            🔄 {t('restoreData', state.lang)}
          </button>
          
          <button 
            onClick={resetData}
            className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            🗑️ {t('resetAllData', state.lang)}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          <strong>注意：</strong>已取消 Excel 匯入/匯出功能，僅保留 JSON 格式的備份/還原功能。
        </p>
      </div>

      {/* 系統檢查 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">🔍 {t('systemCheck', state.lang)}</h2>
        <button 
          onClick={runSystemCheck}
          className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
        >
          🔧 {t('runSystemCheck', state.lang)}
        </button>
        
        {checkResults && (
          <div className={`mt-4 p-4 rounded-lg ${checkResults.ok ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
            <h3 className="font-bold mb-2">
              {checkResults.ok ? '✅ 系統檢查通過' : '⚠️ 發現問題'}
            </h3>
            {checkResults.issues.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1">
                {checkResults.issues.map((issue, index) => (
                  <li key={index} className="text-sm">{issue}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">所有檢查項目都正常。</p>
            )}
          </div>
        )}
      </div>

      {/* 系統資訊 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">ℹ️ {t('systemInfo', state.lang)}</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">版本</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">物業數量</span>
            <span className="font-medium">{state.data.properties.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">房間總數</span>
            <span className="font-medium">
              {state.data.properties.reduce((sum, p) => sum + p.rooms.length, 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">租客總數</span>
            <span className="font-medium">
              {state.data.properties.reduce((sum, p) => 
                sum + p.rooms.filter(r => r.s === 'occupied').length, 0
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">語言</span>
            <span className="font-medium">{state.lang === 'zh-TW' ? '繁體中文' : 'Tiếng Việt'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">功能狀態</span>
            <span className="font-medium text-green-600">正常</span>
          </div>
        </div>
      </div>
    </div>
  )
}