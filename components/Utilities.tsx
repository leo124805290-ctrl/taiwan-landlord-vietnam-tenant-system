'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'

export default function Utilities() {
  const { state, updateState, openModal } = useApp()
  
  // 獲取當前物業
  const property = state.currentProperty === null 
    ? { id: 'all', name: t('allProperties', state.lang), utilityExpenses: [], additionalIncomes: [] }
    : state.data.properties.find(p => p.id === state.currentProperty) || state.data.properties[0]
  
  // 合併所有物業的數據（當選擇全部物業時）
  const allUtilityExpenses = state.currentProperty === null 
    ? state.data.properties.flatMap(p => p.utilityExpenses || [])
    : property.utilityExpenses || []
  
  const allAdditionalIncomes = state.currentProperty === null 
    ? state.data.properties.flatMap(p => p.additionalIncomes || [])
    : property.additionalIncomes || []
  
  // 篩選狀態
  const [typeFilter, setTypeFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('all')
  
  // 計算統計
  const totalTaipower = allUtilityExpenses
    .filter(e => e.type === 'taipower')
    .reduce((sum, e) => sum + e.amount, 0)
  
  const totalWater = allUtilityExpenses
    .filter(e => e.type === 'water')
    .reduce((sum, e) => sum + e.amount, 0)
  
  const totalIncome = allAdditionalIncomes.reduce((sum, i) => sum + i.amount, 0)
  const netBalance = totalIncome - (totalTaipower + totalWater)
  
  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">💰 {t('utilityExpenses', state.lang)} & {t('additionalIncomes', state.lang)}</h1>
        <div className="text-sm text-gray-600">
          {state.currentProperty === null 
            ? `${state.data.properties.length} ${t('properties', state.lang)}`
            : property.name}
        </div>
      </div>
      
      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 台電總支出 */}
        <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-700">
          <div className="text-4xl font-bold mb-1">{formatCurrency(totalTaipower)}</div>
          <div className="text-sm opacity-90">{t('taipowerBill', state.lang)}</div>
          <div className="text-xs opacity-75 mt-2">
            {allUtilityExpenses.filter(e => e.type === 'taipower').length} {t('items', state.lang)}
          </div>
        </div>
        
        {/* 水費總支出 */}
        <div className="stat-card bg-gradient-to-br from-cyan-500 to-cyan-700">
          <div className="text-4xl font-bold mb-1">{formatCurrency(totalWater)}</div>
          <div className="text-sm opacity-90">{t('waterBill', state.lang)}</div>
          <div className="text-xs opacity-75 mt-2">
            {allUtilityExpenses.filter(e => e.type === 'water').length} {t('items', state.lang)}
          </div>
        </div>
        
        {/* 補充總收入 */}
        <div className="stat-card bg-gradient-to-br from-green-500 to-green-700">
          <div className="text-4xl font-bold mb-1">{formatCurrency(totalIncome)}</div>
          <div className="text-sm opacity-90">{t('additionalIncomes', state.lang)}</div>
          <div className="text-xs opacity-75 mt-2">
            {allAdditionalIncomes.length} {t('items', state.lang)}
          </div>
        </div>
        
        {/* 淨收支 */}
        <div className={`stat-card ${netBalance >= 0 ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
          <div className="text-4xl font-bold mb-1">{formatCurrency(netBalance)}</div>
          <div className="text-sm opacity-90">{t('netProfit', state.lang)}</div>
          <div className="text-xs opacity-75 mt-2">
            {netBalance >= 0 ? '📈 盈餘' : '📉 赤字'}
          </div>
        </div>
      </div>
      
      {/* 功能按鈕 */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2">📊 水電收支管理</h3>
            <p className="text-sm text-gray-600">
              管理台電帳單、水費帳單和補充收入記錄
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => openModal('addUtilityExpense')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              ＋ {t('addUtilityExpense', state.lang)}
            </button>
            <button
              onClick={() => openModal('addAdditionalIncome')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              ＋ {t('addAdditionalIncome', state.lang)}
            </button>
          </div>
        </div>
      </div>
      
      {/* 使用說明 */}
      <div className="card bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-2">💡 使用說明</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚡</span>
            <div>
              <strong>台電帳單</strong>：每兩個月繳費一次（1月、3月、5月、7月、9月、11月）
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">💧</span>
            <div>
              <strong>水費帳單</strong>：每兩個月繳費一次（2月、4月、6月、8月、10月、12月）
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">💰</span>
            <div>
              <strong>補充收入</strong>：洗衣機收入或其他補充收入，建議按月記錄
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📊</span>
            <div>
              <strong>淨收支計算</strong>：補充收入 - (台電支出 + 水費支出) = 淨收支
            </div>
          </div>
        </div>
      </div>
      
      {/* 提示訊息 */}
      <div className="card bg-yellow-50 border-2 border-yellow-200">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">🚧 開發中功能</h3>
        <div className="space-y-2 text-sm text-yellow-700">
          <div>• 詳細記錄列表和篩選功能正在開發中</div>
          <div>• 編輯和刪除功能將在下一版本添加</div>
          <div>• 時間篩選和統計報表即將推出</div>
        </div>
      </div>
    </div>
  )
}