'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { systemSelfCheck, formatCurrency } from '@/lib/utils'
import { useState } from 'react'

export default function Settings() {
  const { state, updateState, updateData, openModal } = useApp()
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
      utilityExpenses: [],
      additionalIncomes: [],
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

      {/* 水電支出管理 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">⚡💧 {t('utilityExpenses', state.lang)}</h2>
        
        {/* 簡單添加表單 */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">{t('type', state.lang)}</div>
              <select id="expenseType" className="w-full input-field">
                <option value="taipower">{t('taipowerBill', state.lang)}</option>
                <option value="water">{t('waterBill', state.lang)}</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">{t('billPeriod', state.lang)}</div>
              <input 
                type="text" 
                id="expensePeriod" 
                placeholder="2026年1-2月" 
                className="w-full input-field"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">{t('amount', state.lang)}</div>
              <input 
                type="number" 
                id="expenseAmount" 
                placeholder="0" 
                className="w-full input-field"
              />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">{t('paidDate', state.lang)}</div>
              <input 
                type="date" 
                id="expensePaidDate" 
                className="w-full input-field"
              />
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 mb-1">{t('notes', state.lang)} (選填)</div>
            <input 
              type="text" 
              id="expenseNotes" 
              placeholder="備註" 
              className="w-full input-field"
            />
          </div>
          
          <button 
            onClick={() => {
              const typeInput = document.getElementById('expenseType') as HTMLSelectElement
              const periodInput = document.getElementById('expensePeriod') as HTMLInputElement
              const amountInput = document.getElementById('expenseAmount') as HTMLInputElement
              const paidDateInput = document.getElementById('expensePaidDate') as HTMLInputElement
              const notesInput = document.getElementById('expenseNotes') as HTMLInputElement
              
              if (!periodInput.value || !amountInput.value || !paidDateInput.value) {
                alert('請填寫必要欄位')
                return
              }
              
              const newExpense = {
                id: Math.max(...(state.data.utilityExpenses || []).map(e => e.id), 0) + 1,
                type: typeInput.value as 'taipower' | 'water',
                period: periodInput.value,
                amount: parseFloat(amountInput.value),
                paidDate: paidDateInput.value,
                notes: notesInput.value || undefined
              }
              
              updateData({
                utilityExpenses: [...(state.data.utilityExpenses || []), newExpense]
              })
              
              // 清空表單
              periodInput.value = ''
              amountInput.value = ''
              paidDateInput.value = ''
              notesInput.value = ''
              
              alert('已新增水電支出記錄')
            }}
            className="btn btn-primary w-full mt-3"
          >
            ➕ {t('addUtilityExpense', state.lang)}
          </button>
        </div>
        
        {/* 支出列表 */}
        <div className="space-y-3">
          {state.data.utilityExpenses?.map(expense => (
            <div key={expense.id} className="p-3 border rounded-lg">
              <div className="flex justify-between">
                <div>
                  <div className="font-bold">
                    {expense.type === 'taipower' ? t('taipowerBill', state.lang) : t('waterBill', state.lang)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {expense.period} - {t('paidOn', state.lang)} {expense.paidDate}
                  </div>
                </div>
                <div className="text-lg font-bold">
                  {formatCurrency(expense.amount)}
                </div>
              </div>
              {expense.notes && (
                <div className="text-sm text-gray-500 mt-2">{expense.notes}</div>
              )}
            </div>
          ))}
          
          {(!state.data.utilityExpenses || state.data.utilityExpenses.length === 0) && (
            <div className="text-center text-gray-500 py-4">
              {t('noRecords', state.lang)}
            </div>
          )}
        </div>
      </div>

      {/* 補充收入管理 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">💰 {t('additionalIncomes', state.lang)}</h2>
        
        {/* 簡單添加表單 */}
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">{t('type', state.lang)}</div>
              <select id="incomeType" className="w-full input-field">
                <option value="washing-machine">{t('washingMachineIncome', state.lang)}</option>
                <option value="other">{t('otherIncome', state.lang)}</option>
              </select>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">{t('month', state.lang)}</div>
              <input 
                type="text" 
                id="incomeMonth" 
                placeholder="2026/01" 
                className="w-full input-field"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-sm text-gray-600 mb-1">{t('amount', state.lang)}</div>
              <input 
                type="number" 
                id="incomeAmount" 
                placeholder="0" 
                className="w-full input-field"
              />
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">{t('receivedDate', state.lang)}</div>
              <input 
                type="date" 
                id="incomeReceivedDate" 
                className="w-full input-field"
              />
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-600 mb-1">{t('description', state.lang)}</div>
            <input 
              type="text" 
              id="incomeDescription" 
              placeholder="描述" 
              className="w-full input-field"
            />
          </div>
          
          <button 
            onClick={() => {
              const typeInput = document.getElementById('incomeType') as HTMLSelectElement
              const monthInput = document.getElementById('incomeMonth') as HTMLInputElement
              const amountInput = document.getElementById('incomeAmount') as HTMLInputElement
              const receivedDateInput = document.getElementById('incomeReceivedDate') as HTMLInputElement
              const descriptionInput = document.getElementById('incomeDescription') as HTMLInputElement
              
              if (!monthInput.value || !amountInput.value || !receivedDateInput.value || !descriptionInput.value) {
                alert('請填寫必要欄位')
                return
              }
              
              const newIncome = {
                id: Math.max(...(state.data.additionalIncomes || []).map(i => i.id), 0) + 1,
                type: typeInput.value as 'washing-machine' | 'other',
                month: monthInput.value,
                amount: parseFloat(amountInput.value),
                description: descriptionInput.value,
                receivedDate: receivedDateInput.value
              }
              
              updateData({
                additionalIncomes: [...(state.data.additionalIncomes || []), newIncome]
              })
              
              // 清空表單
              monthInput.value = ''
              amountInput.value = ''
              receivedDateInput.value = ''
              descriptionInput.value = ''
              
              alert('已新增補充收入記錄')
            }}
            className="btn btn-primary w-full mt-3"
          >
            ➕ {t('addAdditionalIncome', state.lang)}
          </button>
        </div>
        
        {/* 收入列表 */}
        <div className="space-y-3">
          {state.data.additionalIncomes?.map(income => (
            <div key={income.id} className="p-3 border rounded-lg">
              <div className="flex justify-between">
                <div>
                  <div className="font-bold">
                    {income.type === 'washing-machine' ? t('washingMachineIncome', state.lang) : t('otherIncome', state.lang)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {income.month} - {income.description}
                  </div>
                </div>
                <div className="text-lg font-bold text-green-600">
                  +{formatCurrency(income.amount)}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {t('receivedDate', state.lang)}: {income.receivedDate}
              </div>
            </div>
          ))}
          
          {(!state.data.additionalIncomes || state.data.additionalIncomes.length === 0) && (
            <div className="text-center text-gray-500 py-4">
              {t('noRecords', state.lang)}
            </div>
          )}
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

      {/* 系統檢查 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">🔍 {t('systemCheck', state.lang)}</h2>
        
        <button 
          onClick={() => {
            const results = systemSelfCheck(state.data)
            setCheckResults(results)
          }}
          className="btn bg-purple-600 text-white w-full mb-4"
        >
          {t('runSystemCheck', state.lang)}
        </button>
        
        {checkResults && (
          <div className={`p-4 rounded-lg ${checkResults.ok ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
            <div className="font-bold mb-2">
              {checkResults.ok ? '✅ ' : '⚠️ '}
              {checkResults.ok ? t('systemCheckPassed', state.lang) : t('systemCheckIssues', state.lang)}
            </div>
            
            {checkResults.issues.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {checkResults.issues.map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-green-600">✅ {t('noIssuesFound', state.lang)}</div>
            )}
          </div>
        )}
        
        <div className="mt-4 text-sm text-gray-600">
          <div className="font-bold mb-1">{t('dataIntegrity', state.lang)}：</div>
          <div>• {t('contractExpiryCheck', state.lang)}</div>
          <div>• {t('duplicateRoomNumbers', state.lang)}</div>
          <div>• {t('paymentConsistency', state.lang)}</div>
        </div>
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
}