'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { systemSelfCheck } from '@/lib/utils'
import { useState } from 'react'
import * as XLSX from 'xlsx'

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

  const exportData = () => {
    // 創建多個工作表
    const wb = XLSX.utils.book_new()
    
    // 1. 物業資料工作表
    const propertiesData = state.data.properties.map(property => ({
      '物業ID': property.id,
      '物業名稱': property.name,
      '地址': property.address || '',
      '房間數量': property.rooms.length,
      '月租金': property.propertyRentalCost?.monthlyRent || 0,
      '押金': property.propertyRentalCost?.deposit || 0,
      '合約開始日': property.propertyRentalCost?.contractStartDate || '',
      '合約結束日': property.propertyRentalCost?.contractEndDate || '',
      '付款日': property.propertyRentalCost?.paymentDay || '',
      '備註': property.propertyRentalCost?.notes || ''
    }))
    const propertiesWs = XLSX.utils.json_to_sheet(propertiesData)
    XLSX.utils.book_append_sheet(wb, propertiesWs, '物業資料')
    
    // 2. 房間資料工作表
    const roomsData = state.data.properties.flatMap(property => 
      property.rooms.map(room => ({
        '物業名稱': property.name,
        '房間ID': room.id,
        '房間名稱': room.n,
        '狀態': room.s === 'occupied' ? '已出租' : '空房',
        '租金': room.r,
        '租客姓名': room.t || '',
        '入住日期': room.in || '',
        '退租日期': room.out || '',
        '電費單價': room.elecRate || state.data.electricityRate,
        '上期電錶': room.lastMeter || 0,
        '本期電費': room.elecFee || 0,
        '押金': room.deposit || 0
      }))
    )
    const roomsWs = XLSX.utils.json_to_sheet(roomsData)
    XLSX.utils.book_append_sheet(wb, roomsWs, '房間資料')
    
    // 3. 付款記錄工作表
    const paymentsData = state.data.properties.flatMap(property => 
      property.payments.map(payment => ({
        '物業名稱': property.name,
        '房間名稱': payment.n,
        '租客姓名': payment.t,
        '月份': payment.m,
        '租金': payment.r,
        '用電度數': payment.u,
        '電費': payment.e,
        '總金額': payment.total,
        '到期日': payment.due,
        '付款日': payment.paid || '',
        '狀態': payment.s === 'paid' ? '已付款' : '待付款',
        '付款方式': payment.paymentMethod || '',
        '備註': payment.notes || ''
      }))
    )
    const paymentsWs = XLSX.utils.json_to_sheet(paymentsData)
    XLSX.utils.book_append_sheet(wb, paymentsWs, '付款記錄')
    
    // 4. 支出記錄工作表
    const expensesData = state.data.properties.flatMap(property => 
      (property.utilityExpenses || []).map(expense => ({
        '物業名稱': property.name,
        '類型': expense.type === 'taipower' ? '台電帳單' : 
                expense.type === 'water' ? '水費帳單' : '租金支出',
        '期間': expense.period,
        '金額': expense.amount,
        '付款日期': expense.paidDate,
        '備註': expense.notes || ''
      }))
    )
    const expensesWs = XLSX.utils.json_to_sheet(expensesData)
    XLSX.utils.book_append_sheet(wb, expensesWs, '支出記錄')
    
    // 5. 補充收入工作表
    const incomesData = state.data.properties.flatMap(property => 
      (property.additionalIncomes || []).map(income => ({
        '物業名稱': property.name,
        '類型': income.type === 'washing-machine' ? '洗衣機收入' : '其他收入',
        '月份': income.month,
        '金額': income.amount,
        '收款日期': income.receivedDate,
        '說明': income.description
      }))
    )
    const incomesWs = XLSX.utils.json_to_sheet(incomesData)
    XLSX.utils.book_append_sheet(wb, incomesWs, '補充收入')
    
    // 6. 系統設定工作表
    const settingsData = [{
      '電費單價(收租客)': state.data.electricityRate,
      '電費單價(實際)': state.data.actualElectricityRate || 4.5,
      '資料版本': 'v2.0',
      '匯出時間': new Date().toLocaleString('zh-TW')
    }]
    const settingsWs = XLSX.utils.json_to_sheet(settingsData)
    XLSX.utils.book_append_sheet(wb, settingsWs, '系統設定')
    
    // 生成Excel文件
    const fileName = `租賃管理系統_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    alert(`✅ 資料已匯出為 Excel 檔案：${fileName}`)
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        
        // 檢查是否為JSON文件（後退兼容）
        if (file.name.endsWith('.json')) {
          const importedData = JSON.parse(data as string)
          updateData(importedData)
          updateState({ currentProperty: importedData.properties[0]?.id || null })
          alert('✅ JSON 資料匯入成功')
          return
        }
        
        // 檢查是否為Excel文件
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('檔案格式不正確')
        }
        
        // 從Excel讀取數據並轉換為系統格式
        // 這裡需要根據實際的Excel結構進行解析
        // 目前先顯示提示，未來可以實現完整的Excel導入
        alert('📊 Excel 檔案已讀取成功！\n\n目前支持 JSON 格式完整導入，Excel 格式需要根據檔案結構進行解析。\n\n請先使用 JSON 格式進行資料遷移。')
        
      } catch (error) {
        alert(`❌ 匯入失敗：${(error as Error).message}`)
      }
    }
    
    if (file.name.endsWith('.json')) {
      reader.readAsText(file)
    } else {
      reader.readAsBinaryString(file)
    }
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
                className="flex-1 input-field"
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
                className="flex-1 input-field"
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

      {/* 資料管理 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">{t('dataManagement', state.lang)}</h2>
        
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-bold text-green-800 mb-2">📊 Excel 匯出</h3>
            <p className="text-sm text-green-700 mb-3">
              將所有資料匯出為 Excel 檔案，包含多個工作表：
              <br/>• 物業資料 • 房間資料 • 付款記錄 • 支出記錄 • 補充收入 • 系統設定
            </p>
            <button 
              onClick={exportData}
              className="btn bg-green-600 text-white w-full"
            >
              📥 匯出為 Excel (.xlsx)
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-800 mb-2">📁 資料匯入</h3>
            <p className="text-sm text-blue-700 mb-3">
              支援 JSON 格式完整匯入，Excel 格式需根據檔案結構解析
            </p>
            <div className="space-y-2">
              <button 
                onClick={() => document.getElementById('importJson')?.click()}
                className="btn bg-blue-600 text-white w-full"
              >
                📤 匯入 JSON 檔案
              </button>
              
              <button 
                onClick={() => document.getElementById('importExcel')?.click()}
                className="btn bg-indigo-600 text-white w-full"
              >
                📤 匯入 Excel 檔案
              </button>
            </div>
            
            <input 
              type="file" 
              id="importJson" 
              accept=".json" 
              style={{ display: 'none' }}
              onChange={importData}
            />
            
            <input 
              type="file" 
              id="importExcel" 
              accept=".xlsx,.xls" 
              style={{ display: 'none' }}
              onChange={importData}
            />
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">
            💡 建議定期備份資料，避免資料遺失
          </p>
          
          <button 
            onClick={resetAll}
            className="btn bg-red-600 text-white w-full"
          >
            🗑️ {t('resetAllData', state.lang)}
          </button>
        </div>
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