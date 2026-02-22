'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'

export default function Reports() {
  const { state, updateState, updateData, openModal } = useApp()
  
  // 獲取當前物業
  const currentProperty = state.currentProperty === null 
    ? null
    : state.data.properties.find(p => p.id === state.currentProperty)
  
  // 報表類型
  const [reportType, setReportType] = useState<'rental' | 'utilities' | 'maintenance' | 'summary'>('summary')
  
  // 時間範圍
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'quarter' | 'month'>('year')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedQuarter, setSelectedQuarter] = useState(1)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  
  // 生成年份選項
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year)
    }
    return years
  }
  
  // 計算租賃收入統計
  const calculateRentalStats = () => {
    const property = currentProperty || state.data.properties[0]
    if (!property) return { totalRent: 0, totalDeposit: 0, pendingAmount: 0, paidAmount: 0 }
    
    // 獲取所有支付記錄
    const allPayments = property.payments || []
    const allHistory = property.history || []
    
    // 合併支付記錄
    const allRecords = [...allPayments, ...allHistory]
    
    // 根據時間範圍篩選
    const filteredRecords = allRecords.filter(record => {
      const recordDate = record.paid || record.due // 使用 paid 或 due 日期
      if (!recordDate) return false
      
      const recordYear = parseInt(recordDate.split('-')[0])
      
      if (timeRange === 'year') {
        return recordYear === selectedYear
      } else if (timeRange === 'quarter') {
        const recordMonth = parseInt(recordDate.split('-')[1])
        const quarterStartMonth = (selectedQuarter - 1) * 3 + 1
        const quarterEndMonth = selectedQuarter * 3
        return recordYear === selectedYear && recordMonth >= quarterStartMonth && recordMonth <= quarterEndMonth
      } else if (timeRange === 'month') {
        const recordMonth = parseInt(recordDate.split('-')[1])
        return recordYear === selectedYear && recordMonth === selectedMonth
      }
      
      return true // 'all'
    })
    
    // 計算統計
    // 簡化：假設所有支付記錄都是租金相關
    const totalRent = filteredRecords
      .reduce((sum, r) => sum + (r.r || 0), 0) // 租金部分
    
    const totalDeposit = 0 // 簡化：暫時不計算押金
    
    const pendingAmount = filteredRecords
      .filter(r => r.s === 'pending')
      .reduce((sum, r) => sum + (r.total || 0), 0)
    
    const paidAmount = filteredRecords
      .filter(r => r.s === 'paid')
      .reduce((sum, r) => sum + (r.total || 0), 0)
    
    return { totalRent, totalDeposit, pendingAmount, paidAmount }
  }
  
  // 計算水電收支統計
  const calculateUtilityStats = () => {
    const property = currentProperty || state.data.properties[0]
    if (!property) return { taipowerTotal: 0, waterTotal: 0, incomeTotal: 0, netProfit: 0 }
    
    const utilityExpenses = property.utilityExpenses || []
    const additionalIncomes = property.additionalIncomes || []
    
    // 根據時間範圍篩選
    const filteredExpenses = utilityExpenses.filter(expense => {
      const expenseYear = expense.period ? parseInt(expense.period.match(/\d{4}/)?.[0] || '0') : 0
      const paidYear = expense.paidDate ? parseInt(expense.paidDate.split('-')[0]) : 0
      const year = expenseYear || paidYear
      
      if (timeRange === 'year') {
        return year === selectedYear
      } else if (timeRange === 'quarter') {
        // 簡化處理：只按年份篩選
        return year === selectedYear
      } else if (timeRange === 'month') {
        // 簡化處理：只按年份篩選
        return year === selectedYear
      }
      
      return true // 'all'
    })
    
    const filteredIncomes = additionalIncomes.filter(income => {
      const incomeYear = income.month ? parseInt(income.month.split('/')[0]) : 0
      const receivedYear = income.receivedDate ? parseInt(income.receivedDate.split('-')[0]) : 0
      const year = incomeYear || receivedYear
      
      if (timeRange === 'year') {
        return year === selectedYear
      } else if (timeRange === 'quarter') {
        return year === selectedYear
      } else if (timeRange === 'month') {
        return year === selectedYear
      }
      
      return true // 'all'
    })
    
    const taipowerTotal = filteredExpenses
      .filter(e => e.type === 'taipower')
      .reduce((sum, e) => sum + e.amount, 0)
    
    const waterTotal = filteredExpenses
      .filter(e => e.type === 'water')
      .reduce((sum, e) => sum + e.amount, 0)
    
    const incomeTotal = filteredIncomes
      .reduce((sum, i) => sum + i.amount, 0)
    
    const netProfit = incomeTotal - (taipowerTotal + waterTotal)
    
    return { taipowerTotal, waterTotal, incomeTotal, netProfit }
  }
  
  // 計算維護裝修統計
  const calculateMaintenanceStats = () => {
    const property = currentProperty || state.data.properties[0]
    if (!property) return { totalCost: 0, completedCount: 0, pendingCount: 0, avgCost: 0 }
    
    const maintenance = property.maintenance || []
    
    // 根據時間範圍篩選
    const filteredMaintenance = maintenance.filter(item => {
      const itemYear = item.date ? parseInt(item.date.split('-')[0]) : 0
      
      if (timeRange === 'year') {
        return itemYear === selectedYear
      } else if (timeRange === 'quarter') {
        const itemMonth = item.date ? parseInt(item.date.split('-')[1]) : 0
        const quarterStartMonth = (selectedQuarter - 1) * 3 + 1
        const quarterEndMonth = selectedQuarter * 3
        return itemYear === selectedYear && itemMonth >= quarterStartMonth && itemMonth <= quarterEndMonth
      } else if (timeRange === 'month') {
        const itemMonth = item.date ? parseInt(item.date.split('-')[1]) : 0
        return itemYear === selectedYear && itemMonth === selectedMonth
      }
      
      return true // 'all'
    })
    
    const totalCost = filteredMaintenance
      .filter(m => m.actualCost)
      .reduce((sum, m) => sum + (m.actualCost || 0), 0)
    
    const completedCount = filteredMaintenance
      .filter(m => m.s === 'completed')
      .length
    
    const pendingCount = filteredMaintenance
      .filter(m => m.s === 'pending' || m.s === 'in-progress')
      .length
    
    const avgCost = completedCount > 0 ? totalCost / completedCount : 0
    
    return { totalCost, completedCount, pendingCount, avgCost }
  }
  
  // 計算綜合統計
  const calculateSummaryStats = () => {
    const rentalStats = calculateRentalStats()
    const utilityStats = calculateUtilityStats()
    const maintenanceStats = calculateMaintenanceStats()
    
    const totalIncome = rentalStats.paidAmount + utilityStats.incomeTotal
    const totalExpense = utilityStats.taipowerTotal + utilityStats.waterTotal + maintenanceStats.totalCost
    const netProfit = totalIncome - totalExpense
    
    return {
      totalIncome,
      totalExpense,
      netProfit,
      rentalIncome: rentalStats.paidAmount,
      utilityIncome: utilityStats.incomeTotal,
      utilityExpense: utilityStats.taipowerTotal + utilityStats.waterTotal,
      maintenanceExpense: maintenanceStats.totalCost
    }
  }
  
  const yearOptions = generateYearOptions()
  const rentalStats = calculateRentalStats()
  const utilityStats = calculateUtilityStats()
  const maintenanceStats = calculateMaintenanceStats()
  const summaryStats = calculateSummaryStats()
  
  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold">📈 {t('reports', state.lang)}</h1>
        <div className="text-sm text-gray-600">
          {state.currentProperty === null 
            ? `${state.data.properties.length} ${t('properties', state.lang)}`
            : currentProperty?.name || state.data.properties[0]?.name}
        </div>
      </div>
      
      {/* 控制面板 */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          {/* 報表類型選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('reportType', state.lang)}
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setReportType('summary')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${reportType === 'summary' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                📊 {t('summaryReport', state.lang)}
              </button>
              <button
                onClick={() => setReportType('rental')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${reportType === 'rental' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                🏠 {t('rentalReport', state.lang)}
              </button>
              <button
                onClick={() => setReportType('utilities')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${reportType === 'utilities' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                💧 {t('utilitiesReport', state.lang)}
              </button>
              <button
                onClick={() => setReportType('maintenance')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${reportType === 'maintenance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              >
                🔧 {t('maintenanceReport', state.lang)}
              </button>
            </div>
          </div>
          
          {/* 時間範圍選擇 */}
          <div className="flex-1 min-w-[300px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('timeRange', state.lang)}
            </label>
            <div className="flex flex-wrap gap-2">
              <select 
                className="px-3 py-2 border rounded-lg text-sm"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
              >
                <option value="all">{t('allTime', state.lang)}</option>
                <option value="year">{t('year', state.lang)}</option>
                <option value="quarter">{t('quarter', state.lang)}</option>
                <option value="month">{t('month', state.lang)}</option>
              </select>
              
              {timeRange === 'year' && (
                <select 
                  className="px-3 py-2 border rounded-lg text-sm"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year} {t('year', state.lang)}</option>
                  ))}
                </select>
              )}
              
              {timeRange === 'quarter' && (
                <>
                  <select 
                    className="px-3 py-2 border rounded-lg text-sm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year} {t('year', state.lang)}</option>
                    ))}
                  </select>
                  <select 
                    className="px-3 py-2 border rounded-lg text-sm"
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                  >
                    <option value="1">Q1 (1-3{t('month', state.lang)})</option>
                    <option value="2">Q2 (4-6{t('month', state.lang)})</option>
                    <option value="3">Q3 (7-9{t('month', state.lang)})</option>
                    <option value="4">Q4 (10-12{t('month', state.lang)})</option>
                  </select>
                </>
              )}
              
              {timeRange === 'month' && (
                <>
                  <select 
                    className="px-3 py-2 border rounded-lg text-sm"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  >
                    {yearOptions.map(year => (
                      <option key={year} value={year}>{year} {t('year', state.lang)}</option>
                    ))}
                  </select>
                  <select 
                    className="px-3 py-2 border rounded-lg text-sm"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => (
                      <option key={month} value={month}>{month} {t('month', state.lang)}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
          
          {/* 導出按鈕 */}
          <div>
            <button
              onClick={() => alert(t('exportFeatureComingSoon', state.lang))}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              📥 {t('exportReport', state.lang)}
            </button>
          </div>
        </div>
      </div>
      
      {/* 綜合統計報表 */}
      {reportType === 'summary' && (
        <div className="space-y-6">
          {/* 關鍵指標 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-700">
              <div className="text-4xl font-bold mb-1">{formatCurrency(summaryStats.totalIncome)}</div>
              <div className="text-sm opacity-90">{t('totalIncome', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                🏠 {formatCurrency(summaryStats.rentalIncome)} + 💰 {formatCurrency(summaryStats.utilityIncome)}
              </div>
            </div>
            
            <div className="stat-card bg-gradient-to-br from-red-500 to-red-700">
              <div className="text-4xl font-bold mb-1">{formatCurrency(summaryStats.totalExpense)}</div>
              <div className="text-sm opacity-90">{t('totalExpense', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                ⚡💧 {formatCurrency(summaryStats.utilityExpense)} + 🔧 {formatCurrency(summaryStats.maintenanceExpense)}
              </div>
            </div>
            
            <div className={`stat-card ${summaryStats.netProfit >= 0 ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
              <div className="text-4xl font-bold mb-1">{formatCurrency(summaryStats.netProfit)}</div>
              <div className="text-sm opacity-90">{t('netProfit', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {summaryStats.netProfit >= 0 ? '📈 盈餘' : '📉 赤字'}
              </div>
            </div>
            
            <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-700">
              <div className="text-4xl font-bold mb-1">{rentalStats.pendingAmount > 0 ? '⚠️' : '✅'}</div>
              <div className="text-sm opacity-90">{t('financialHealth', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {rentalStats.pendingAmount > 0 
                  ? `${t('pendingAmount', state.lang)}: ${formatCurrency(rentalStats.pendingAmount)}`
                  : t('allPaid', state.lang)}
              </div>
            </div>
          </div>
          
          {/* 詳細分析 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 收入分析 */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">💰 {t('incomeAnalysis', state.lang)}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>{t('rentalIncome', state.lang)}</span>
                  <span className="font-bold text-blue-600">{formatCurrency(summaryStats.rentalIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('supplementaryIncome', state.lang)}</span>
                  <span className="font-bold text-green-600">{formatCurrency(summaryStats.utilityIncome)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>{t('totalIncome', state.lang)}</span>
                    <span className="text-lg">{formatCurrency(summaryStats.totalIncome)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 支出分析 */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">💸 {t('expenseAnalysis', state.lang)}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>{t('taipowerBill', state.lang)}</span>
                  <span className="font-bold text-red-600">{formatCurrency(utilityStats.taipowerTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('waterBill', state.lang)}</span>
                  <span className="font-bold text-red-600">{formatCurrency(utilityStats.waterTotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t('maintenanceCost', state.lang)}</span>
                  <span className="font-bold text-red-600">{formatCurrency(summaryStats.maintenanceExpense)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>{t('totalExpense', state.lang)}</span>
                    <span className="text-lg">{formatCurrency(summaryStats.totalExpense)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 建議與洞察 */}
          <div className="card bg-blue-50 border-2 border-blue-200">
            <h3 className="text-lg font-bold text-blue-800 mb-3">💡 {t('insightsAndRecommendations', state.lang)}</h3>
            <div className="space-y-2 text-sm text-blue-700">
              {summaryStats.netProfit < 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <strong>{t('warning', state.lang)}</strong>：{t('netLossDetected', state.lang)}
                  </div>
                </div>
              )}
              
              {rentalStats.pendingAmount > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-lg">💰</span>
                  <div>
                    <strong>{t('pendingPayments', state.lang)}</strong>：{t('pendingAmountDescription', state.lang).replace('{amount}', formatCurrency(rentalStats.pendingAmount))}
                  </div>
                </div>
              )}
              
              {maintenanceStats.pendingCount > 0 && (
                <div className="flex items-start gap-2">
                  <span className="text-lg">🔧</span>
                  <div>
                    <strong>{t('pendingMaintenance', state.lang)}</strong>：{t('pendingMaintenanceDescription', state.lang).replace('{count}', maintenanceStats.pendingCount.toString())}
                  </div>
                </div>
              )}
              
              <div className="flex items-start gap-2">
                <span className="text-lg">📊</span>
                <div>
                  <strong>{t('profitMargin', state.lang)}</strong>：{t('profitMarginCalculation', state.lang).replace('{margin}', summaryStats.totalIncome > 0 ? ((summaryStats.netProfit / summaryStats.totalIncome) * 100).toFixed(1) : '0.0')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 租賃收入報表 */}
      {reportType === 'rental' && (
        <div className="space-y-6">
          {/* 租賃統計卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-700">
              <div className="text-4xl font-bold mb-1">{formatCurrency(rentalStats.totalRent)}</div>
              <div className="text-sm opacity-90">{t('totalRent', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {timeRange === 'all' ? t('allTime', state.lang) : `${selectedYear} ${t('year', state.lang)}`}
              </div>
            </div>
            
            <div className="stat-card bg-gradient-to-br from-green-500 to-green-700">
              <div className="text-4xl font-bold mb-1">{formatCurrency(rentalStats.totalDeposit)}</div>
              <div className="text-sm opacity-90">{t('totalDeposit', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {t('depositDescription', state.lang)}
              </div>
            </div>
            
            <div className="stat-card bg-gradient-to-br from-yellow-500 to-yellow-700">
              <div className="text-4xl font-bold mb-1">{formatCurrency(rentalStats.pendingAmount)}</div>
              <div className="text-sm opacity-90">{t('pendingAmount', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {rentalStats.pendingAmount > 0 ? '⚠️ 待收' : '✅ 已收齊'}
              </div>
            </div>
            
            <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-700">
              <div className="text-4xl font-bold mb-1">{formatCurrency(rentalStats.paidAmount)}</div>
              <div className="text-sm opacity-90">{t('paidAmount', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {t('actualReceived', state.lang)}
              </div>
            </div>
          </div>
          
          {/* 租賃收入分析 */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">📊 {t('rentalIncomeAnalysis', state.lang)}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>{t('collectionRate', state.lang)}</span>
                  <span className="font-bold">
                    {rentalStats.totalRent > 0 
                      ? `${((rentalStats.paidAmount / rentalStats.totalRent) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${rentalStats.totalRent > 0 ? (rentalStats.paidAmount / rentalStats.totalRent) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">{t('expectedIncome', state.lang)}</div>
                  <div className="text-xl font-bold">{formatCurrency(rentalStats.totalRent)}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">{t('actualIncome', state.lang)}</div>
                  <div className="text-xl font-bold">{formatCurrency(rentalStats.paidAmount)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 水電收支報表 */}
      {reportType === 'utilities' && (
        <div className="space-y-6">
          {/* 水電統計卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-700">
              <div className="text-4xl font-bold mb-1">{formatCurrency(utilityStats.taipowerTotal)}</div>
              <div className="text-sm opacity-90">{t('taipowerBill', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {timeRange === 'all' ? t('allTime', state.lang) : `${selectedYear} ${t('year', state.lang)}`}
              </div>
            </div>
            
            <div className="stat-card bg-gradient-to-br from-cyan-500 to-cyan-700">
              <div className="text-4xl font-bold mb-1">{formatCurrency(utilityStats.waterTotal)}</div>
              <div className="text-sm opacity-90">{t('waterBill', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {t('waterBillingCycle', state.lang)}
              </div>
            </div>
            
            <div className="stat-card bg-gradient-to-br from-green-500 to-green-700">
              <div className="text-4xl font-bold mb-1">{formatCurrency(utilityStats.incomeTotal)}</div>
              <div className="text-sm opacity-90">{t('supplementaryIncome', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {t('additionalIncomeDescription', state.lang)}
              </div>
            </div>
            
            <div className={`stat-card ${utilityStats.netProfit >= 0 ? 'bg-gradient-to-br from-green-500 to-green-700' : 'bg-gradient-to-br from-red-500 to-red-700'}`}>
              <div className="text-4xl font-bold mb-1">{formatCurrency(utilityStats.netProfit)}</div>
              <div className="text-sm opacity-90">{t('netProfit', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {utilityStats.netProfit >= 0 ? '📈 盈餘' : '📉 赤字'}
              </div>
            </div>
          </div>
          
          {/* 水電收支分析 */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">📊 {t('utilitiesAnalysis', state.lang)}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>{t('expenseCoverage', state.lang)}</span>
                  <span className="font-bold">
                    {utilityStats.taipowerTotal + utilityStats.waterTotal > 0 
                      ? `${((utilityStats.incomeTotal / (utilityStats.taipowerTotal + utilityStats.waterTotal)) * 100).toFixed(1)}%`
                      : '∞%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${utilityStats.taipowerTotal + utilityStats.waterTotal > 0 ? Math.min((utilityStats.incomeTotal / (utilityStats.taipowerTotal + utilityStats.waterTotal)) * 100, 100) : 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {t('expenseCoverageDescription', state.lang)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-600">{t('totalExpense', state.lang)}</div>
                  <div className="text-xl font-bold text-red-600">{formatCurrency(utilityStats.taipowerTotal + utilityStats.waterTotal)}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">{t('totalIncome', state.lang)}</div>
                  <div className="text-xl font-bold text-green-600">{formatCurrency(utilityStats.incomeTotal)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 維護裝修報表 */}
      {reportType === 'maintenance' && (
        <div className="space-y-6">
          {/* 維護統計卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card bg-gradient-to-br from-orange-500 to-orange-700">
              <div className="text-4xl font-bold mb-1">{formatCurrency(maintenanceStats.totalCost)}</div>
              <div className="text-sm opacity-90">{t('totalCost', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {timeRange === 'all' ? t('allTime', state.lang) : `${selectedYear} ${t('year', state.lang)}`}
              </div>
            </div>
            
            <div className="stat-card bg-gradient-to-br from-green-500 to-green-700">
              <div className="text-4xl font-bold mb-1">{maintenanceStats.completedCount}</div>
              <div className="text-sm opacity-90">{t('completed', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {t('completedItems', state.lang)}
              </div>
            </div>
            
            <div className="stat-card bg-gradient-to-br from-yellow-500 to-yellow-700">
              <div className="text-4xl font-bold mb-1">{maintenanceStats.pendingCount}</div>
              <div className="text-sm opacity-90">{t('pending', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {t('pendingItems', state.lang)}
              </div>
            </div>
            
            <div className="stat-card bg-gradient-to-br from-purple-500 to-purple-700">
              <div className="text-4xl font-bold mb-1">{formatCurrency(maintenanceStats.avgCost)}</div>
              <div className="text-sm opacity-90">{t('averageCost', state.lang)}</div>
              <div className="text-xs opacity-75 mt-2">
                {t('perItem', state.lang)}
              </div>
            </div>
          </div>
          
          {/* 維護成本分析 */}
          <div className="card">
            <h3 className="text-lg font-bold mb-4">📊 {t('maintenanceAnalysis', state.lang)}</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>{t('completionRate', state.lang)}</span>
                  <span className="font-bold">
                    {maintenanceStats.completedCount + maintenanceStats.pendingCount > 0 
                      ? `${((maintenanceStats.completedCount / (maintenanceStats.completedCount + maintenanceStats.pendingCount)) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${maintenanceStats.completedCount + maintenanceStats.pendingCount > 0 ? (maintenanceStats.completedCount / (maintenanceStats.completedCount + maintenanceStats.pendingCount)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-gray-600">{t('totalMaintenanceCost', state.lang)}</div>
                  <div className="text-xl font-bold text-orange-600">{formatCurrency(maintenanceStats.totalCost)}</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">{t('costPerCompletedItem', state.lang)}</div>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(maintenanceStats.avgCost)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 使用說明 */}
      <div className="card bg-blue-50 border-2 border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-2">💡 {t('reportsUsageInstructions', state.lang)}</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-start gap-2">
            <span className="text-lg">📊</span>
            <div>
              <strong>{t('summaryReport', state.lang)}</strong>：{t('summaryReportDescription', state.lang)}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🏠</span>
            <div>
              <strong>{t('rentalReport', state.lang)}</strong>：{t('rentalReportDescription', state.lang)}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">💧</span>
            <div>
              <strong>{t('utilitiesReport', state.lang)}</strong>：{t('utilitiesReportDescription', state.lang)}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">🔧</span>
            <div>
              <strong>{t('maintenanceReport', state.lang)}</strong>：{t('maintenanceReportDescription', state.lang)}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-lg">📅</span>
            <div>
              <strong>{t('timeFiltering', state.lang)}</strong>：{t('timeFilteringDescription', state.lang)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}