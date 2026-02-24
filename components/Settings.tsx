'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { systemSelfCheck } from '@/lib/utils'
import { useState } from 'react'
import ExcelJS from 'exceljs'

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

  const exportData = async () => {
    try {
      // 創建新的 Excel 工作簿
      const workbook = new ExcelJS.Workbook()
      workbook.creator = '台灣房東越南租客管理系統'
      workbook.created = new Date()
      
      // 1. 物業資料工作表
      const propertiesSheet = workbook.addWorksheet('物業資料')
      propertiesSheet.columns = [
        { header: '物業ID', key: 'id', width: 10 },
        { header: '物業名稱', key: 'name', width: 20 },
        { header: '地址', key: 'address', width: 30 },
        { header: '房間數量', key: 'roomCount', width: 12 },
        { header: '月租金', key: 'monthlyRent', width: 12, style: { numFmt: '#,##0' } },
        { header: '押金', key: 'deposit', width: 12, style: { numFmt: '#,##0' } },
        { header: '合約開始日', key: 'contractStart', width: 15 },
        { header: '合約結束日', key: 'contractEnd', width: 15 },
        { header: '付款日', key: 'paymentDay', width: 10 },
        { header: '備註', key: 'notes', width: 30 }
      ]
      
      state.data.properties.forEach(property => {
        propertiesSheet.addRow({
          id: property.id,
          name: property.name,
          address: property.address || '',
          roomCount: property.rooms.length,
          monthlyRent: property.propertyRentalCost?.monthlyRent || 0,
          deposit: property.propertyRentalCost?.deposit || 0,
          contractStart: property.propertyRentalCost?.contractStartDate || '',
          contractEnd: property.propertyRentalCost?.contractEndDate || '',
          paymentDay: property.propertyRentalCost?.paymentDay || '',
          notes: property.propertyRentalCost?.notes || ''
        })
      })
      
      // 2. 房間資料工作表
      const roomsSheet = workbook.addWorksheet('房間資料')
      roomsSheet.columns = [
        { header: '物業名稱', key: 'propertyName', width: 20 },
        { header: '房間ID', key: 'roomId', width: 10 },
        { header: '房間名稱', key: 'roomName', width: 15 },
        { header: '狀態', key: 'status', width: 10 },
        { header: '租金', key: 'rent', width: 12, style: { numFmt: '#,##0' } },
        { header: '租客姓名', key: 'tenantName', width: 15 },
        { header: '入住日期', key: 'checkInDate', width: 15 },
        { header: '退租日期', key: 'checkOutDate', width: 15 },
        { header: '電費單價', key: 'electricityRate', width: 12, style: { numFmt: '#,##0.00' } },
        { header: '上期電錶', key: 'lastMeter', width: 12, style: { numFmt: '#,##0' } },
        { header: '本期電費', key: 'electricityFee', width: 12, style: { numFmt: '#,##0' } },
        { header: '押金', key: 'roomDeposit', width: 12, style: { numFmt: '#,##0' } }
      ]
      
      state.data.properties.forEach(property => {
        property.rooms.forEach(room => {
          roomsSheet.addRow({
            propertyName: property.name,
            roomId: room.id,
            roomName: room.n,
            status: room.s === 'occupied' ? '已出租' : '空房',
            rent: room.r,
            tenantName: room.t || '',
            checkInDate: room.in || '',
            checkOutDate: room.out || '',
            electricityRate: room.elecRate || state.data.electricityRate,
            lastMeter: room.lastMeter || 0,
            electricityFee: room.elecFee || 0,
            roomDeposit: room.deposit || 0
          })
        })
      })
      
      // 3. 付款記錄工作表
      const paymentsSheet = workbook.addWorksheet('付款記錄')
      paymentsSheet.columns = [
        { header: '物業名稱', key: 'propertyName', width: 20 },
        { header: '房間名稱', key: 'roomName', width: 15 },
        { header: '租客姓名', key: 'tenantName', width: 15 },
        { header: '月份', key: 'month', width: 10 },
        { header: '租金', key: 'rent', width: 12, style: { numFmt: '#,##0' } },
        { header: '用電度數', key: 'electricityUsage', width: 12, style: { numFmt: '#,##0' } },
        { header: '電費', key: 'electricityFee', width: 12, style: { numFmt: '#,##0' } },
        { header: '總金額', key: 'totalAmount', width: 12, style: { numFmt: '#,##0' } },
        { header: '到期日', key: 'dueDate', width: 15 },
        { header: '付款日', key: 'paymentDate', width: 15 },
        { header: '狀態', key: 'status', width: 10 },
        { header: '付款方式', key: 'paymentMethod', width: 15 },
        { header: '備註', key: 'notes', width: 30 }
      ]
      
      state.data.properties.forEach(property => {
        property.payments.forEach(payment => {
          paymentsSheet.addRow({
            propertyName: property.name,
            roomName: payment.n,
            tenantName: payment.t,
            month: payment.m,
            rent: payment.r,
            electricityUsage: payment.u,
            electricityFee: payment.e,
            totalAmount: payment.total,
            dueDate: payment.due,
            paymentDate: payment.paid || '',
            status: payment.s === 'paid' ? '已付款' : '待付款',
            paymentMethod: payment.paymentMethod || '',
            notes: payment.notes || ''
          })
        })
      })
      
      // 4. 支出記錄工作表
      const expensesSheet = workbook.addWorksheet('支出記錄')
      expensesSheet.columns = [
        { header: '物業名稱', key: 'propertyName', width: 20 },
        { header: '類型', key: 'type', width: 15 },
        { header: '期間', key: 'period', width: 15 },
        { header: '金額', key: 'amount', width: 12, style: { numFmt: '#,##0' } },
        { header: '付款日', key: 'paymentDate', width: 15 },
        { header: '付款方式', key: 'paymentMethod', width: 15 },
        { header: '備註', key: 'notes', width: 30 }
      ]
      
      state.data.properties.forEach(property => {
        (property.utilityExpenses || []).forEach(expense => {
          expensesSheet.addRow({
            propertyName: property.name,
            type: expense.type === 'taipower' ? '台電帳單' : 
                  expense.type === 'water' ? '水費帳單' : '租金支出',
            period: expense.period,
            amount: expense.amount,
            paymentDate: expense.paymentDate || '',
            paymentMethod: expense.paymentMethod || '',
            notes: expense.notes || ''
          })
        })
      })
      
      // 5. 維修記錄工作表
      const maintenanceSheet = workbook.addWorksheet('維修記錄')
      maintenanceSheet.columns = [
        { header: '物業名稱', key: 'propertyName', width: 20 },
        { header: '房間名稱', key: 'roomName', width: 15 },
        { header: '標題', key: 'title', width: 25 },
        { header: '描述', key: 'description', width: 40 },
        { header: '日期', key: 'date', width: 15 },
        { header: '狀態', key: 'status', width: 10 },
        { header: '預算', key: 'estimatedCost', width: 12, style: { numFmt: '#,##0' } },
        { header: '實際費用', key: 'actualCost', width: 12, style: { numFmt: '#,##0' } },
        { header: '付款狀態', key: 'paymentStatus', width: 12 },
        { header: '師傅', key: 'technician', width: 15 },
        { header: '預計完成', key: 'estimatedCompletion', width: 15 },
        { header: '實際完成', key: 'actualCompletion', width: 15 }
      ]
      
      state.data.properties.forEach(property => {
        (property.maintenance || []).forEach(maintenance => {
          maintenanceSheet.addRow({
            propertyName: property.name,
            roomName: maintenance.n || '公共區域',
            title: maintenance.title,
            description: maintenance.desc,
            date: maintenance.date,
            status: maintenance.s === 'pending' ? '待處理' :
                    maintenance.s === 'assigned' ? '已指派' :
                    maintenance.s === 'in-progress' ? '進行中' :
                    maintenance.s === 'completed' ? '已完成' : '已取消',
            estimatedCost: maintenance.estimatedCost || 0,
            actualCost: maintenance.actualCost || maintenance.cost || 0,
            paymentStatus: maintenance.paymentStatus === 'paid' ? '已付款' :
                          maintenance.paymentStatus === 'partial' ? '部分付款' : '未付款',
            technician: maintenance.technician || '',
            estimatedCompletion: maintenance.estimatedCompletion || '',
            actualCompletion: maintenance.actualCompletionDate || ''
          })
        })
      })
      
      // 設定工作表樣式
      const sheets = [propertiesSheet, roomsSheet, paymentsSheet, expensesSheet, maintenanceSheet]
      sheets.forEach(sheet => {
        // 設定標題行樣式
        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' }
        }
        
        // 設定交替行顏色
        sheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1 && rowNumber % 2 === 0) {
            row.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF2F2F2' }
            }
          }
        })
        
        // 自動調整列寬
        sheet.columns.forEach(column => {
          if (column.width) {
            column.width = Math.max(column.width || 0, 10)
          }
        })
      })
      
      // 生成 Excel 檔案
      const buffer = await workbook.xlsx.writeBuffer()
      
      // 下載檔案
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `房東管理系統_資料匯出_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      alert(t('exportSuccess', state.lang))
    } catch (error) {
      console.error('匯出失敗:', error)
      alert(t('exportFailed', state.lang))
    }
  }

  const importData = () => {
    alert(t('importFeatureComingSoon', state.lang))
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
            onClick={exportData}
            className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            📊 {t('exportExcel', state.lang)}
          </button>
          
          <button 
            onClick={importData}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            📥 {t('importExcel', state.lang)}
          </button>
          
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
        </div>
      </div>
    </div>
  )
}