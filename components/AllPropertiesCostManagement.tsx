'use client'

import { t } from '@/lib/translations'
import { formatCurrency } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { useState, useMemo } from 'react'
import { 
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Building,
  Download,
  AlertCircle
} from 'lucide-react'
import CostManagement from './CostManagement'

interface AllPropertiesCostManagementProps {
  properties: any[]
}

export default function AllPropertiesCostManagement({ properties }: AllPropertiesCostManagementProps) {
  const { state, updateState } = useApp()
  
  // 計算所有物業的總統計
  const allStats = useMemo(() => {
    let totalIncome = 0
    let totalExpense = 0
    let totalNetIncome = 0
    
    // 匯總所有物業的統計
    (properties || []).forEach(property => {
      // 這裡需要從每個物業的數據中提取財務統計
      // 暫時使用模擬計算
      const propertyIncome = property?.localTotalIncome || 0
      const propertyExpense = property?.localTotalExpense || 0
      
      totalIncome += propertyIncome
      localTotalExpense += propertyExpense
    })
    
    totalNetIncome = totalIncome - totalExpense
    
    return {
      totalIncome,
      totalExpense,
      totalNetIncome,
      propertyCount: (properties || []).length
    }
  }, [properties])
  
  // 導出所有物業的統計數據
  const exportAllStatsToCSV = () => {
    const headers = ['物業名稱', '總收入(NTD)', '總支出(NTD)', '淨收支(NTD)', '物業狀態']
    const rows = (properties || []).map(property => {
      const income = property?.totalIncome || 0
      const expense = property?.totalExpense || 0
      const netIncome = income - expense
      
      return [
        property.name || '未命名物業',
        income.toString(),
        expense.toString(),
        netIncome.toString(),
        netIncome >= 0 ? '盈利' : '虧損'
      ]
    })
    
    // 添加總計行
    rows.push([
      '總計',
      allStats.totalIncome.toString(),
      allStats.totalExpense.toString(),
      allStats.totalNetIncome.toString(),
      allStats.totalNetIncome >= 0 ? '總盈利' : '總虧損'
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `全部物業成本統計_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert(`已導出 ${(properties || []).length} 個物業的統計數據`)
  }
  
  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">成本管理 - 全部物業</h1>
          <p className="text-gray-600">
            查看所有 {(properties || []).length} 個物業的成本支出統計
          </p>
        </div>
        
        <button
          onClick={exportAllStatsToCSV}
          className="px-4 py-2 rounded-lg text-sm bg-green-100 text-green-700 hover:bg-green-200 border border-green-300 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          導出全部物業統計
        </button>
      </div>
      
      {/* 全部物業統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 總收入卡片 */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500">全部物業總收入</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(allStats.totalIncome)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(properties || []).length} 個物業
              </div>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        {/* 總支出卡片 */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500">全部物業總支出</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(allStats.totalExpense)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(properties || []).length} 個物業
              </div>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        
        {/* 淨收支卡片 */}
        <div className="card">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-sm text-gray-500">全部物業淨收支</div>
              <div className="text-2xl font-bold mt-1">
                <span className={allStats.totalNetIncome >= 0 ? 'text-purple-600' : 'text-amber-600'}>
                  {formatCurrency(allStats.totalNetIncome)}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                收入 {formatCurrency(allStats.totalIncome)} - 
                支出 {formatCurrency(allStats.totalExpense)}
              </div>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              {allStats.totalNetIncome >= 0 ? (
                <TrendingUp className="h-6 w-6 text-purple-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-amber-600" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 物業列表 */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold">各物業成本管理</h2>
            <p className="text-sm text-gray-600">
              點擊物業名稱查看詳細成本記錄
            </p>
          </div>
          
          <div className="text-sm text-gray-600">
            <Building className="inline h-4 w-4 mr-1" />
            共 {(properties || []).length} 個物業
          </div>
        </div>
        
        {/* 物業表格 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">物業名稱</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">總收入</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">總支出</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">淨收支</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">狀態</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {(properties || []).map((property) => {
                const income = property?.totalIncome || 0
                const expense = property?.totalExpense || 0
                const netIncome = income - expense
                const isProfitable = netIncome >= 0
                
                return (
                  <tr key={property.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{property.name || '未命名物業'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-green-600 font-medium">
                      {formatCurrency(income)}
                    </td>
                    <td className="py-3 px-4 text-red-600 font-medium">
                      {formatCurrency(expense)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${isProfitable ? 'text-purple-600' : 'text-amber-600'}`}>
                        {formatCurrency(netIncome)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        isProfitable 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {isProfitable ? '盈利' : '虧損'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => updateState({ currentProperty: property.id })}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        查看詳細
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-700">全部物業模式說明</p>
              <p className="text-gray-600 mt-1">
                在「全部物業��模式下，您可以查看所有物業的匯總統計數據。
                點擊「查看詳細」按鈕可以切換到特定物業，查看詳細的成本記錄和管理功能。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}