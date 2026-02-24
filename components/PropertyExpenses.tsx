'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { 
  DollarSign,
  Calendar,
  Home,
  User,
  FileText,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Filter,
  Download,
  Upload,
  Building
} from 'lucide-react'

interface PropertyExpensesProps {
  property: any
}

export default function PropertyExpenses({ property }: PropertyExpensesProps) {
  const { state, updateState, updateData, openModal } = useApp()
  
  // 支出類型選項
  const expenseTypes = [
    { value: 'repair', label: '維修費用', color: 'bg-blue-100 text-blue-700' },
    { value: 'renovation', label: '裝修費用', color: 'bg-green-100 text-green-700' },
    { value: 'utility', label: '水電費用', color: 'bg-purple-100 text-purple-700' },
    { value: 'tax', label: '稅金費用', color: 'bg-red-100 text-red-700' },
    { value: 'management', label: '管理費用', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'other', label: '其他支出', color: 'bg-gray-100 text-gray-700' }
  ]
  
  // 付款方式選項
  const paymentMethods = [
    { value: 'cash', label: '現金' },
    { value: 'transfer', label: '轉帳' },
    { value: 'credit', label: '信用卡' },
    { value: 'check', label: '支票' }
  ]
  
  // 狀態選項
  const statusOptions = [
    { value: 'pending', label: '待付款', color: 'bg-orange-100 text-orange-700' },
    { value: 'paid', label: '已付款', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: '已取消', color: 'bg-red-100 text-red-700' }
  ]
  
  // 房間選項
  const roomOptions = useMemo(() => {
    const rooms = property.rooms || []
    const options = rooms.map((room: any) => ({
      value: room.n,
      label: `${room.n} - ${room.t || '空房'}`
    }))
    options.unshift({ value: 'common', label: '公共區域' })
    return options
  }, [property.rooms])
  
  // 新增支出表單狀態
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'repair',
    amount: '',
    description: '',
    room: 'common',
    vendor: '',
    paymentMethod: 'cash',
    status: 'pending',
    invoiceNumber: ''
  })
  
  // 所有支出記錄
  const allExpenses = property.expenses || []
  
  // 篩選狀態
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterMonth, setFilterMonth] = useState<string>('all')
  
  // 篩選支出記錄
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter((expense: any) => {
      if (filterType !== 'all' && expense.type !== filterType) return false
      if (filterStatus !== 'all' && expense.status !== filterStatus) return false
      if (filterMonth !== 'all') {
        const expenseMonth = expense.date?.substring(0, 7) // YYYY-MM
        if (expenseMonth !== filterMonth) return false
      }
      return true
    })
  }, [allExpenses, filterType, filterStatus, filterMonth])
  
  // 統計
  const stats = useMemo(() => {
    const totalAmount = allExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
    const paidAmount = allExpenses
      .filter((e: any) => e.status === 'paid')
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
    const pendingAmount = allExpenses
      .filter((e: any) => e.status === 'pending')
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
    
    // 按類型統計
    const byType: Record<string, number> = {}
    expenseTypes.forEach(type => {
      byType[type.value] = allExpenses
        .filter((e: any) => e.type === type.value)
        .reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
    })
    
    return {
      totalAmount,
      paidAmount,
      pendingAmount,
      totalCount: allExpenses.length,
      byType
    }
  }, [allExpenses, expenseTypes])
  
  // 處理表單輸入
  const handleInputChange = (field: string, value: string) => {
    setNewExpense(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // 新增支出
  const handleAddExpense = () => {
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      alert('請輸入有效的金額')
      return
    }
    
    if (!newExpense.description.trim()) {
      alert('請輸入說明')
      return
    }
    
    const newId = allExpenses.length > 0 
      ? Math.max(...allExpenses.map((e: any) => e.id || 0)) + 1
      : 1
    
    const expense = {
      id: newId,
      date: newExpense.date,
      type: newExpense.type as any, // 使用類型斷言
      amount: parseFloat(newExpense.amount),
      description: newExpense.description.trim(),
      room: newExpense.room,
      vendor: newExpense.vendor.trim(),
      paymentMethod: newExpense.paymentMethod as any, // 使用類型斷言
      status: newExpense.status as any, // 使用類型斷言
      invoiceNumber: newExpense.invoiceNumber.trim(),
      propertyId: property.id
    }
    
    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            expenses: [...(p.expenses || []), expense]
          }
        : p
    )
    
    updateData({ properties: updatedProperties })
    
    // 重置表單
    setNewExpense({
      date: new Date().toISOString().split('T')[0],
      type: 'repair',
      amount: '',
      description: '',
      room: 'common',
      vendor: '',
      paymentMethod: 'cash',
      status: 'pending',
      invoiceNumber: ''
    })
    
    alert('支出記錄已新增！')
  }
  
  // 刪除支出
  const handleDeleteExpense = (expenseId: number) => {
    if (!confirm('確定要刪除這筆支出記錄嗎？')) return
    
    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            expenses: (p.expenses || []).filter((e: any) => e.id !== expenseId)
          }
        : p
    )
    
    updateData({ properties: updatedProperties })
    alert('支出記錄已刪除')
  }
  
  // 標記為已付款
  const handleMarkAsPaid = (expenseId: number) => {
    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            expenses: (p.expenses || []).map((e: any) => 
              e.id === expenseId
                ? { ...e, status: 'paid' }
                : e
            )
          }
        : p
    )
    
    updateData({ properties: updatedProperties })
    alert('已標記為已付款')
  }
  
  // 獲取月份選項
  const monthOptions = useMemo(() => {
    const months = new Set<string>()
    allExpenses.forEach((expense: any) => {
      if (expense.date) {
        months.add(expense.date.substring(0, 7)) // YYYY-MM
      }
    })
    return Array.from(months).sort().reverse()
  }, [allExpenses])

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building className="w-6 h-6" />
            物業修繕/支出管理
          </h1>
          <p className="text-gray-600 mt-1">
            記錄和管理物業相關的所有支出
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => {/* 匯出功能 */}}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            匯出 Excel
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總支出</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            {stats.totalCount} 筆記錄
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已付款</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.paidAmount)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            已完成的支出
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">待付款</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <FileText className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            需要處理的支出
          </div>
        </div>
      </div>

      {/* 新增支出表單 - Excel 風格 */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新增支出記錄
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 日期 */}
          <div>
            <label className="block text-sm font-medium mb-2">日期 *</label>
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {/* 支出類型 */}
          <div>
            <label className="block text-sm font-medium mb-2">類型 *</label>
            <select
              value={newExpense.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {expenseTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 金額 */}
          <div>
            <label className="block text-sm font-medium mb-2">金額 *</label>
            <input
              type="number"
              value={newExpense.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {/* 房間 */}
          <div>
            <label className="block text-sm font-medium mb-2">房間/區域</label>
            <select
              value={newExpense.room}
              onChange={(e) => handleInputChange('room', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {roomOptions.map(room => (
                <option key={room.value} value={room.value}>
                  {room.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 說明 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">說明 *</label>
            <input
              type="text"
              value={newExpense.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="請輸入支出說明"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {/* 供應商 */}
          <div>
            <label className="block text-sm font-medium mb-2">供應商/收款人</label>
            <input
              type="text"
              value={newExpense.vendor}
              onChange={(e) => handleInputChange('vendor', e.target.value)}
              placeholder="供應商名稱"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* 付款方式 */}
          <div>
            <label className="block text-sm font-medium mb-2">付款方式</label>
            <select
              value={newExpense.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 狀態 */}
          <div>
            <label className="block text-sm font-medium mb-2">狀態</label>
            <select
              value={newExpense.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 發票號碼 */}
          <div>
            <label className="block text-sm font-medium mb-2">發票號碼</label>
            <input
              type="text"
              value={newExpense.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              placeholder="發票號碼"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* 提交按鈕 */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAddExpense}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增支出記錄
          </button>
        </div>
      </div>

      {/* 篩選器 */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold">篩選條件</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 類型篩選 */}
          <div>
            <label className="block text-sm font-medium mb-2">支出類型</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全部類型</option>
              {expenseTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 狀態篩選 */}
          <div>
            <label className="block text-sm font-medium mb-2">付款狀態</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全部狀態</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* 月份篩選 */}
          <div>
            <label className="block text-sm font-medium mb-2">月份</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全部月份</option>
              {monthOptions.map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* 篩選結果 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              找到 <span className="font-bold text-blue-600">{filteredExpenses.length}</span> 筆記錄
            </div>
            <div className="text-sm">
              {filterType !== 'all' && (
                <span className="inline-block px-2 py-1 bg-gray-100 rounded mr-2">
                  類型: {expenseTypes.find(t => t.value === filterType)?.label}
                </span>
              )}
              {filterStatus !== 'all' && (
                <span className="inline-block px-2 py-1 bg-gray-100 rounded mr-2">
                  狀態: {statusOptions.find(s => s.value === filterStatus)?.label}
                </span>
              )}
              {filterMonth !== 'all' && (
                <span className="inline-block px-2 py-1 bg-gray-100 rounded">
                  月份: {filterMonth}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 支出記錄表格 - Excel 風格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">類型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">金額</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">說明</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">房間</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">供應商</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">狀態</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-300 mb-2" />
                      <p>暫無支出記錄</p>
                      <p className="text-sm mt-1">請新增第一筆支出記錄</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense: any) => {
                  const typeInfo = expenseTypes.find(t => t.value === expense.type)
                  const statusInfo = statusOptions.find(s => s.value === expense.status)
                  
                  return (
                    <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{expense.date}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${typeInfo?.color || 'bg-gray-100 text-gray-700'}`}>
                          {typeInfo?.label || expense.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">
                        {formatCurrency(expense.amount || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate" title={expense.description}>
                        {expense.description}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {expense.room === 'common' ? '公共區域' : expense.room}
                      </td>
                      <td className="px-4 py-3 text-sm">{expense.vendor || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo?.color || 'bg-gray-100 text-gray-700'}`}>
                          {statusInfo?.label || expense.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {expense.status !== 'paid' && (
                            <button
                              onClick={() => handleMarkAsPaid(expense.id)}
                              className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs"
                              title="標記為已付款"
                            >
                              付款
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
                            title="刪除"
                          >
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* 表格底部統計 */}
        {filteredExpenses.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                共 {filteredExpenses.length} 筆記錄
              </div>
              <div className="text-sm font-medium">
                篩選後總金額: <span className="text-blue-600">{formatCurrency(
                  filteredExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0)
                )}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 類型統計 */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <h3 className="text-lg font-bold mb-4">支出類型統計</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {expenseTypes.map(type => {
            const amount = stats.byType[type.value] || 0
            const percentage = stats.totalAmount > 0 ? (amount / stats.totalAmount * 100).toFixed(1) : '0.0'
            
            return (
              <div key={type.value} className="text-center">
                <div className={`p-3 rounded-lg ${type.color} mb-2`}>
                  <span className="text-sm font-medium">{type.label}</span>
                </div>
                <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
                <div className="text-sm text-gray-500">{percentage}%</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}