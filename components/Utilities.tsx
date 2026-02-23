'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'

export default function Utilities() {
  const { state, updateState, updateData, openModal } = useApp()
  
  // 獲取當前物業
  const currentProperty = state.currentProperty === null 
    ? null
    : state.data.properties.find(p => p.id === state.currentProperty)
  
  // 篩選狀態
  const [typeFilter, setTypeFilter] = useState('all') // all, taipower, water, income
  const [yearFilter, setYearFilter] = useState('all') // all, current-year, last-year, specific-year
  const [searchTerm, setSearchTerm] = useState('')
  
  // 獲取所有水電支出記錄（根據當前物業篩選）
  const getAllUtilityExpenses = () => {
    if (state.currentProperty === null) {
      // 所有物業
      return state.data.properties.flatMap(p => 
        (p.utilityExpenses || []).map(expense => ({
          ...expense,
          propertyName: p.name
        }))
      )
    } else {
      // 當前物業
      const property = currentProperty || state.data.properties[0]
      return (property.utilityExpenses || []).map(expense => ({
        ...expense,
        propertyName: property.name
      }))
    }
  }
  
  // 獲取所有補充收入記錄（根據當前物業篩選）
  const getAllAdditionalIncomes = () => {
    if (state.currentProperty === null) {
      // 所有物業
      return state.data.properties.flatMap(p => 
        (p.additionalIncomes || []).map(income => ({
          ...income,
          propertyName: p.name
        }))
      )
    } else {
      // 當前物業
      const property = currentProperty || state.data.properties[0]
      return (property.additionalIncomes || []).map(income => ({
        ...income,
        propertyName: property.name
      }))
    }
  }
  
  // 篩選函數
  const filterItems = (items: any[], itemType: 'expense' | 'income') => {
    return items.filter(item => {
      // 類型篩選
      if (typeFilter !== 'all') {
        if (typeFilter === 'taipower' && (item.type !== 'taipower' || itemType !== 'expense')) return false
        if (typeFilter === 'water' && (item.type !== 'water' || itemType !== 'expense')) return false
        if (typeFilter === 'rent' && (item.type !== 'rent' || itemType !== 'expense')) return false
        if (typeFilter === 'income' && itemType !== 'income') return false
      }
      
      // 年份篩選
      if (yearFilter !== 'all') {
        const currentYear = new Date().getFullYear()
        
        if (yearFilter === 'current-year') {
          // 檢查期間或月份是否包含當前年份
          if (item.period && item.period.includes(currentYear.toString())) return true
          if (item.month && item.month.startsWith(currentYear.toString())) return true
          if (item.paidDate && item.paidDate.startsWith(currentYear.toString())) return true
          if (item.receivedDate && item.receivedDate.startsWith(currentYear.toString())) return true
          return false
        }
        
        if (yearFilter === 'last-year') {
          const lastYear = currentYear - 1
          if (item.period && item.period.includes(lastYear.toString())) return true
          if (item.month && item.month.startsWith(lastYear.toString())) return true
          if (item.paidDate && item.paidDate.startsWith(lastYear.toString())) return true
          if (item.receivedDate && item.receivedDate.startsWith(lastYear.toString())) return true
          return false
        }
        
        // 特定年份篩選
        if (item.period && item.period.includes(yearFilter)) return true
        if (item.month && item.month.startsWith(yearFilter)) return true
        if (item.paidDate && item.paidDate.startsWith(yearFilter)) return true
        if (item.receivedDate && item.receivedDate.startsWith(yearFilter)) return true
        return false
      }
      
      // 搜索篩選
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        if (item.period && item.period.toLowerCase().includes(searchLower)) return true
        if (item.month && item.month.toLowerCase().includes(searchLower)) return true
        if (item.notes && item.notes.toLowerCase().includes(searchLower)) return true
        if (item.description && item.description.toLowerCase().includes(searchLower)) return true
        if (item.propertyName && item.propertyName.toLowerCase().includes(searchLower)) return true
        return false
      }
      
      return true
    })
  }
  
  // 獲取篩選後的數據
  const allUtilityExpenses = getAllUtilityExpenses()
  const allAdditionalIncomes = getAllAdditionalIncomes()
  
  const filteredTaipowerExpenses = filterItems(
    allUtilityExpenses.filter(e => e.type === 'taipower'),
    'expense'
  )
  
  const filteredWaterExpenses = filterItems(
    allUtilityExpenses.filter(e => e.type === 'water'),
    'expense'
  )
  
  const filteredRentExpenses = filterItems(
    allUtilityExpenses.filter(e => e.type === 'rent'),
    'expense'
  )
  
  const filteredAdditionalIncomes = filterItems(
    allAdditionalIncomes,
    'income'
  )
  
  // 計算統計
  const totalTaipower = filteredTaipowerExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalWater = filteredWaterExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalRent = filteredRentExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalIncome = filteredAdditionalIncomes.reduce((sum, i) => sum + i.amount, 0)
  const netBalance = totalIncome - (totalTaipower + totalWater + totalRent)
  
  // 生成年份選項
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = ['all', 'current-year', 'last-year']
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year.toString())
    }
    return years
  }
  
  const yearOptions = generateYearOptions()
  
  // 處理刪除水電支出
  const handleDeleteUtilityExpense = (id: number) => {
    if (!confirm(t('confirmDeleteUtilityExpense', state.lang))) return
    
    const password = prompt(t('enterPasswordToDeleteUtilityExpense', state.lang))
    if (password !== '123456') {
      alert(t('incorrectPassword', state.lang))
      return
    }
    
    if (state.currentProperty === null) {
      // 從所有物業中刪除
      const updatedProperties = state.data.properties.map(property => ({
        ...property,
        utilityExpenses: (property.utilityExpenses || []).filter(e => e.id !== id)
      }))
      updateData({ properties: updatedProperties })
    } else {
      // 從當前物業中刪除
      const propertyId = state.currentProperty
      const updatedProperties = state.data.properties.map(p => 
        p.id === propertyId
          ? { ...p, utilityExpenses: (p.utilityExpenses || []).filter(e => e.id !== id) }
          : p
      )
      updateData({ properties: updatedProperties })
    }
    
    alert(t('utilityExpenseDeleted', state.lang))
  }
  
  // 處理刪除補充收入
  const handleDeleteAdditionalIncome = (id: number) => {
    if (!confirm(t('confirmDeleteAdditionalIncome', state.lang))) return
    
    const password = prompt(t('enterPasswordToDeleteAdditionalIncome', state.lang))
    if (password !== '123456') {
      alert(t('incorrectPassword', state.lang))
      return
    }
    
    if (state.currentProperty === null) {
      // 從所有物業中刪除
      const updatedProperties = state.data.properties.map(property => ({
        ...property,
        additionalIncomes: (property.additionalIncomes || []).filter(i => i.id !== id)
      }))
      updateData({ properties: updatedProperties })
    } else {
      // 從當前物業中刪除
      const propertyId = state.currentProperty
      const updatedProperties = state.data.properties.map(p => 
        p.id === propertyId
          ? { ...p, additionalIncomes: (p.additionalIncomes || []).filter(i => i.id !== id) }
          : p
      )
      updateData({ properties: updatedProperties })
    }
    
    alert(t('additionalIncomeDeleted', state.lang))
  }
  
  // 獲取類型顯示名稱
  const getTypeDisplayName = (type: string) => {
    if (type === 'taipower') return t('taipowerBill', state.lang)
    if (type === 'water') return t('waterBill', state.lang)
    if (type === 'rent') return t('rentExpense', state.lang)
    if (type === 'washing-machine') return t('washingMachineIncome', state.lang)
    if (type === 'other') return t('otherIncome', state.lang)
    return type
  }
  
  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">💰 {t('utilityExpenses', state.lang)}</h1>
        <div className="text-sm text-gray-600">
          {state.currentProperty === null 
            ? `${state.data.properties.length} ${t('properties', state.lang)}`
            : currentProperty?.name || state.data.properties[0]?.name}
        </div>
      </div>
      
      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* 台電總支出 */}
        <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-700">
          <div className="text-4xl font-bold mb-1">{formatCurrency(totalTaipower)}</div>
          <div className="text-sm opacity-90">{t('taipowerBill', state.lang)}</div>
          <div className="text-xs opacity-75 mt-2">
            {filteredTaipowerExpenses.length} {t('items', state.lang)}
          </div>
        </div>
        
        {/* 水費總支出 */}
        <div className="stat-card bg-gradient-to-br from-cyan-500 to-cyan-700">
          <div className="text-4xl font-bold mb-1">{formatCurrency(totalWater)}</div>
          <div className="text-sm opacity-90">{t('waterBill', state.lang)}</div>
          <div className="text-xs opacity-75 mt-2">
            {filteredWaterExpenses.length} {t('items', state.lang)}
          </div>
        </div>
        
        {/* 租金總支出 */}
        <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-700">
          <div className="text-4xl font-bold mb-1">{formatCurrency(totalRent)}</div>
          <div className="text-sm opacity-90">{t('rentExpense', state.lang)}</div>
          <div className="text-xs opacity-75 mt-2">
            {filteredRentExpenses.length} {t('items', state.lang)}
          </div>
        </div>
        
        {/* 補充總收入 */}
        <div className="stat-card bg-gradient-to-br from-green-500 to-green-700">
          <div className="text-4xl font-bold mb-1">{formatCurrency(totalIncome)}</div>
          <div className="text-sm opacity-90">{t('additionalIncomes', state.lang)}</div>
          <div className="text-xs opacity-75 mt-2">
            {filteredAdditionalIncomes.length} {t('items', state.lang)}
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
      
      {/* 篩選控制 */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('search', state.lang)}
            </label>
            <input
              type="text"
              placeholder={t('searchPlaceholder', state.lang)}
              className="input-field"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('type', state.lang)}
            </label>
            <select 
              className="px-3 py-2 border rounded-lg text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">{t('all', state.lang)}</option>
              <option value="taipower">{t('taipowerBill', state.lang)}</option>
              <option value="water">{t('waterBill', state.lang)}</option>
              <option value="rent">{t('rentExpense', state.lang)}</option>
              <option value="income">{t('additionalIncomes', state.lang)}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('filterByYear', state.lang)}
            </label>
            <select 
              className="px-3 py-2 border rounded-lg text-sm"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              {yearOptions.map(year => (
                <option key={year} value={year}>
                  {year === 'all' ? t('allYears', state.lang) : 
                   year === 'current-year' ? `${t('current-year', state.lang)} (${new Date().getFullYear()})` :
                   year === 'last-year' ? `${t('last-year', state.lang)} (${new Date().getFullYear() - 1})` :
                   year}
                </option>
              ))}
            </select>
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
      
      {/* 台電帳單列表 */}
      {(typeFilter === 'all' || typeFilter === 'taipower') && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">⚡ {t('taipowerBill', state.lang)}</h2>
            <span className="badge bg-blue-100 text-blue-700">
              {filteredTaipowerExpenses.length} {t('items', state.lang)}
            </span>
          </div>
          
          {filteredTaipowerExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('billPeriod', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('amount', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('paidDate', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('notes', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('property', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('actions', state.lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTaipowerExpenses.map((expense, index) => (
                    <tr key={expense.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-3 border-b text-sm">{expense.period}</td>
                      <td className="py-2 px-3 border-b text-sm font-bold text-blue-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-2 px-3 border-b text-sm">{expense.paidDate}</td>
                      <td className="py-2 px-3 border-b text-sm text-gray-600">{expense.notes || '-'}</td>
                      <td className="py-2 px-3 border-b text-sm">
                        {expense.propertyName || '-'}
                      </td>
                      <td className="py-2 px-3 border-b text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal('editUtilityExpense', expense.id)}
                            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs"
                          >
                            {t('edit', state.lang)}
                          </button>
                          <button
                            onClick={() => handleDeleteUtilityExpense(expense.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                          >
                            {t('delete', state.lang)}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">📄</div>
              <div>{t('noRecordsFound', state.lang)}</div>
              <button
                onClick={() => openModal('addUtilityExpense')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                ＋ {t('addUtilityExpense', state.lang)}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 水費帳單列表 */}
      {(typeFilter === 'all' || typeFilter === 'water') && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">💧 {t('waterBill', state.lang)}</h2>
            <span className="badge bg-cyan-100 text-cyan-700">
              {filteredWaterExpenses.length} {t('items', state.lang)}
            </span>
          </div>
          
          {filteredWaterExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('billPeriod', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('amount', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('paidDate', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('notes', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('property', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('actions', state.lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWaterExpenses.map((expense, index) => (
                    <tr key={expense.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-3 border-b text-sm">{expense.period}</td>
                      <td className="py-2 px-3 border-b text-sm font-bold text-cyan-600">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="py-2 px-3 border-b text-sm">{expense.paidDate}</td>
                      <td className="py-2 px-3 border-b text-sm text-gray-600">{expense.notes || '-'}</td>
                      <td className="py-2 px-3 border-b text-sm">
                        {expense.propertyName || '-'}
                      </td>
                      <td className="py-2 px-3 border-b text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal('editUtilityExpense', expense.id)}
                            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs"
                          >
                            {t('edit', state.lang)}
                          </button>
                          <button
                            onClick={() => handleDeleteUtilityExpense(expense.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                          >
                            {t('delete', state.lang)}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">💧</div>
              <div>{t('noRecordsFound', state.lang)}</div>
              <button
                onClick={() => openModal('addUtilityExpense')}
                className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm"
              >
                ＋ {t('addUtilityExpense', state.lang)}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 補充收入列表 */}
      {(typeFilter === 'all' || typeFilter === 'income') && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">💰 {t('additionalIncomes', state.lang)}</h2>
            <span className="badge bg-green-100 text-green-700">
              {filteredAdditionalIncomes.length} {t('items', state.lang)}
            </span>
          </div>
          
          {filteredAdditionalIncomes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('type', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('month', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('amount', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('receivedDate', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('description', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('property', state.lang)}</th>
                    <th className="py-2 px-3 border-b text-left text-sm font-medium text-gray-600">{t('actions', state.lang)}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdditionalIncomes.map((income, index) => (
                    <tr key={income.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-2 px-3 border-b text-sm">
                        {getTypeDisplayName(income.type)}
                      </td>
                      <td className="py-2 px-3 border-b text-sm">{income.month}</td>
                      <td className="py-2 px-3 border-b text-sm font-bold text-green-600">
                        {formatCurrency(income.amount)}
                      </td>
                      <td className="py-2 px-3 border-b text-sm">{income.receivedDate}</td>
                      <td className="py-2 px-3 border-b text-sm text-gray-600">{income.description}</td>
                      <td className="py-2 px-3 border-b text-sm">
                        {income.propertyName || '-'}
                      </td>
                      <td className="py-2 px-3 border-b text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal('editAdditionalIncome', income.id)}
                            className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs"
                          >
                            {t('edit', state.lang)}
                          </button>
                          <button
                            onClick={() => handleDeleteAdditionalIncome(income.id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs"
                          >
                            {t('delete', state.lang)}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">💰</div>
              <div>{t('noRecordsFound', state.lang)}</div>
              <button
                onClick={() => openModal('addAdditionalIncome')}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
              >
                ＋ {t('addAdditionalIncome', state.lang)}
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* 使用說明 */}
      <div className="card bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-2">💡 {t('usageInstructions', state.lang)}</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚡</span>
            <div>
              <strong>{t('taipowerBill', state.lang)}</strong>：{t('taipowerBillingCycle', state.lang)}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">💧</span>
            <div>
              <strong>{t('waterBill', state.lang)}</strong>：{t('waterBillingCycle', state.lang)}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🏠</span>
            <div>
              <strong>{t('rentExpense', state.lang)}</strong>：{t('rentExpenseDescription', state.lang)}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">💰</span>
            <div>
              <strong>{t('additionalIncomes', state.lang)}</strong>：{t('additionalIncomeDescription', state.lang)}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📊</span>
            <div>
              <strong>{t('netProfitCalculation', state.lang)}</strong>：{t('netProfitFormula', state.lang)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
