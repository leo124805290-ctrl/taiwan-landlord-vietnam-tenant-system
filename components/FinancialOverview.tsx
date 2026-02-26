'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'
import { 
  MajorCategory, 
  MinorCategory, 
  MinorCategoryHints, 
  MajorToMinorCategories,
  FinancialRecord 
} from '@/lib/types'
import { useState, useMemo, useEffect } from 'react'
import { 
  DollarSign,
  Calendar,
  Plus,
  Trash2,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart,
  Clock,
  Building,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface FinancialOverviewProps {
  property: any
}

export default function FinancialOverview({ property }: FinancialOverviewProps) {
  const { state } = useApp()
  
  // ==================== 狀態管理 ====================
  
  // 財務記錄狀態
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([])
  const [loading, setLoading] = useState(true)
  
  // 時間篩選狀態
  const [timeFilter, setTimeFilter] = useState<'month' | 'property-start' | 'custom'>('month')
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)) // YYYY-MM
  const [includeOneTimeExpenses, setIncludeOneTimeExpenses] = useState(false)
  
  // 新增記錄表單狀態（簡化版）
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    major_category: MajorCategory.DAILY_EXPENSE,
    minor_category: MinorCategory.OTHER_DAILY,
    amount: '',
    remarks: '',
    remarks_hint: MinorCategoryHints[MinorCategory.OTHER_DAILY]
  })
  
  // 篩選狀態
  const [filterMajor, setFilterMajor] = useState<string>('all')
  const [searchText, setSearchText] = useState<string>('')
  
  // ==================== 數據初始化 ====================
  
  useEffect(() => {
    // 初始化模擬數據
    const mockRecords: FinancialRecord[] = [
      // 前期支出（一次性）
      {
        id: '1',
        major_category: MajorCategory.PRE_INVESTMENT,
        minor_category: MinorCategory.FURNITURE,
        amount: 45000,
        currency: 'NTD',
        transaction_date: '2026-01-15',
        remarks: '購買家具：沙發、床、桌椅',
        remarks_hint: MinorCategoryHints[MinorCategory.FURNITURE],
        created_at: '2026-01-15 10:30:00',
        updated_at: '2026-01-15 10:30:00',
        property_id: property?.id
      },
      {
        id: '2',
        major_category: MajorCategory.PRE_INVESTMENT,
        minor_category: MinorCategory.AIR_CONDITIONER,
        amount: 80000,
        currency: 'NTD',
        transaction_date: '2026-01-20',
        remarks: '安裝3台分離式冷氣',
        remarks_hint: MinorCategoryHints[MinorCategory.AIR_CONDITIONER],
        created_at: '2026-01-20 14:15:00',
        updated_at: '2026-01-20 14:15:00',
        property_id: property?.id
      },
      // 押金支出（一次性）
      {
        id: '3',
        major_category: MajorCategory.DEPOSIT_EXPENSE,
        minor_category: MinorCategory.DEPOSIT,
        amount: 60000,
        currency: 'NTD',
        transaction_date: '2026-01-01',
        remarks: '給房東的押金',
        remarks_hint: MinorCategoryHints[MinorCategory.DEPOSIT],
        created_at: '2026-01-01 09:00:00',
        updated_at: '2026-01-01 09:00:00',
        property_id: property?.id
      },
      // 維修支出
      {
        id: '4',
        major_category: MajorCategory.MAINTENANCE_EXPENSE,
        minor_category: MinorCategory.AC_MAINTENANCE,
        amount: 3000,
        currency: 'NTD',
        transaction_date: '2026-02-10',
        remarks: '301房冷氣清洗',
        remarks_hint: MinorCategoryHints[MinorCategory.AC_MAINTENANCE],
        created_at: '2026-02-10 11:45:00',
        updated_at: '2026-02-10 11:45:00',
        property_id: property?.id
      },
      // 日常支出
      {
        id: '5',
        major_category: MajorCategory.DAILY_EXPENSE,
        minor_category: MinorCategory.ELECTRIC_BILL,
        amount: 12500,
        currency: 'NTD',
        transaction_date: '2026-02-20',
        remarks: '2月份公共區域電費',
        remarks_hint: MinorCategoryHints[MinorCategory.ELECTRIC_BILL],
        created_at: '2026-02-20 14:15:00',
        updated_at: '2026-02-20 14:15:00',
        property_id: property?.id
      },
      {
        id: '6',
        major_category: MajorCategory.DAILY_EXPENSE,
        minor_category: MinorCategory.WATER_BILL,
        amount: 3500,
        currency: 'NTD',
        transaction_date: '2026-02-22',
        remarks: '2月份水費',
        remarks_hint: MinorCategoryHints[MinorCategory.WATER_BILL],
        created_at: '2026-02-22 10:30:00',
        updated_at: '2026-02-22 10:30:00',
        property_id: property?.id
      }
    ]
    
    setFinancialRecords(mockRecords)
    setLoading(false)
  }, [property?.id])
  
  // ==================== 數據計算函數 ====================
  
  // 獲取收入數據（從租客繳費記錄 - 模擬數據）
  const getIncomeData = useMemo(() => {
    // 這裡應該從租客繳費記錄中提取數據
    // 暫時使用模擬數據
    return {
      rentIncome: 120000, // 租金收入
      electricityIncome: 45000, // 電費收入
      additionalIncome: 8000, // 補充收入（洗衣機、充電等）
      totalIncome: 173000 // 總收入
    }
  }, [])
  
  // 篩選財務記錄
  const filteredRecords = useMemo(() => {
    let filtered = financialRecords
    
    // 時間篩選
    if (timeFilter === 'month') {
      filtered = filtered.filter(record => 
        record.transaction_date.startsWith(selectedMonth)
      )
    }
    // 注意：'property-start' 和 'custom' 篩選需要更多邏輯
    
    // 分類篩選
    if (filterMajor !== 'all') {
      filtered = filtered.filter(record => record.major_category === filterMajor)
    }
    
    // 文字搜索
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(record => 
        record.remarks.toLowerCase().includes(searchLower) ||
        record.minor_category.toLowerCase().includes(searchLower) ||
        record.major_category.toLowerCase().includes(searchLower)
      )
    }
    
    return filtered
  }, [financialRecords, timeFilter, selectedMonth, filterMajor, searchText])
  
  // 計算統計數據
  const stats = useMemo(() => {
    const incomeData = getIncomeData
    
    // 計算支出
    let totalExpense = 0
    let oneTimeExpense = 0
    let recurringExpense = 0
    
    // 按分類統計
    const expenseByCategory: Record<string, number> = {}
    
    filteredRecords.forEach(record => {
      totalExpense += record.amount
      
      // 分類統計
      const category = record.major_category
      if (!expenseByCategory[category]) {
        expenseByCategory[category] = 0
      }
      expenseByCategory[category] += record.amount
      
      // 一次性 vs 經常性
      if (record.major_category === MajorCategory.PRE_INVESTMENT || 
          record.major_category === MajorCategory.DEPOSIT_EXPENSE) {
        oneTimeExpense += record.amount
      } else {
        recurringExpense += record.amount
      }
    })
    
    // 計算淨收支
    const netIncomeWithoutOneTime = incomeData.totalIncome - recurringExpense
    const netIncomeWithOneTime = incomeData.totalIncome - totalExpense
    
    return {
      // 收入
      rentIncome: incomeData.rentIncome,
      electricityIncome: incomeData.electricityIncome,
      additionalIncome: incomeData.additionalIncome,
      totalIncome: incomeData.totalIncome,
      
      // 支出
      totalExpense,
      oneTimeExpense,
      recurringExpense,
      expenseByCategory,
      
      // 淨收支
      netIncomeWithoutOneTime,
      netIncomeWithOneTime,
      
      // 記錄數量
      recordCount: filteredRecords.length
    }
  }, [filteredRecords, getIncomeData])
  
  // ==================== 處理函數 ====================
  
  // 處理新增記錄
  const handleAddRecord = () => {
    if (!newRecord.amount || !newRecord.date) {
      alert('請填寫金額和日期')
      return
    }
    
    const newId = Date.now().toString()
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
    
    const recordToAdd: FinancialRecord = {
      id: newId,
      major_category: newRecord.major_category as MajorCategory,
      minor_category: newRecord.minor_category as MinorCategory,
      amount: parseFloat(newRecord.amount),
      currency: 'NTD',
      transaction_date: newRecord.date,
      remarks: newRecord.remarks,
      remarks_hint: newRecord.remarks_hint,
      created_at: now,
      updated_at: now,
      property_id: property?.id
    }
    
    setFinancialRecords(prev => [recordToAdd, ...prev])
    
    // 重置表單
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      major_category: MajorCategory.DAILY_EXPENSE,
      minor_category: MinorCategory.OTHER_DAILY,
      amount: '',
      remarks: '',
      remarks_hint: MinorCategoryHints[MinorCategory.OTHER_DAILY]
    })
  }
  
  // 處理刪除記錄
  const handleDeleteRecord = (id: string) => {
    if (confirm('確定要刪除這筆記錄嗎？')) {
      setFinancialRecords(prev => prev.filter(record => record.id !== id))
    }
  }
  
  // ==================== 渲染函數 ====================
  
  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">載入財務數據中...</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 時間篩選和設定 */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="month">本月</option>
                <option value="property-start">物業開始至今</option>
                <option value="custom">自選時間</option>
              </select>
            </div>
            
            {timeFilter === 'month' && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeOneTime"
                checked={includeOneTimeExpenses}
                onChange={(e) => setIncludeOneTimeExpenses(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="includeOneTime" className="text-sm text-gray-700">
                包含一次性支出+押金
              </label>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <Building className="inline h-4 w-4 mr-1" />
            物業：{property?.name || '未命名物業'}
          </div>
        </div>
      </div>
      
      {/* 統計概覽卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 總收入卡片 */}
        <div className="card bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總收入</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(stats.totalIncome)}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                租金 {formatCurrency(stats.rentIncome)} + 
                電費 {formatCurrency(stats.electricityIncome)} + 
                其他 {formatCurrency(stats.additionalIncome)}
              </div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        {/* 總支出卡片 */}
        <div className="card bg-gradient-to-r from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總支出</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(stats.totalExpense)}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                經常性 {formatCurrency(stats.recurringExpense)} + 
                一次性 {formatCurrency(stats.oneTimeExpense)}
              </div>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        {/* 淨收支（不含一次性）卡片 */}
        <div className={`card bg-gradient-to-r ${
          stats.netIncomeWithoutOneTime >= 0 ? 'from-blue-50 to-blue-100' : 'from-orange-50 to-orange-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">淨收支（不含一次性）</p>
              <p className={`text-2xl font-bold ${
                stats.netIncomeWithoutOneTime >= 0 ? 'text-blue-700' : 'text-orange-700'
              }`}>
                {formatCurrency(stats.netIncomeWithoutOneTime)}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                收入 {formatCurrency(stats.totalIncome)} - 
                經常性支出 {formatCurrency(stats.recurringExpense)}
              </div>
            </div>
            <DollarSign className={`h-8 w-8 ${
              stats.netIncomeWithoutOneTime >= 0 ? 'text-blue-600' : 'text-orange-600'
            }`} />
          </div>
        </div>
        
        {/* 淨收支（含一次性）卡片 */}
        <div className={`card bg-gradient-to-r ${
          stats.netIncomeWithOneTime >= 0 ? 'from-purple-50 to-purple-100' : 'from-amber-50 to-amber-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">淨收支（含一次性）</p>
              <p className={`text-2xl font-bold ${
                stats.netIncomeWithOneTime >= 0 ? 'text-purple-700' : 'text-amber-700'
              }`}>
                {formatCurrency(stats.netIncomeWithOneTime)}
              </p>
              <div className="text-xs text-gray-500 mt-1">
                收入 {formatCurrency(stats.totalIncome)} - 
                總支出 {formatCurrency(stats.totalExpense)}
              </div>
            </div>
            <PieChart className={`h-8 w-8 ${
              stats.netIncomeWithOneTime >= 0 ? 'text-purple-600' : 'text-amber-600'
            }`} />
          </div>
        </div>
      </div>
      
      {/* 快速新增記錄（表格式輸入） */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">快速新增支出記錄</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              日期
            </label>
            <input
              type="date"
              value={newRecord.date}
              onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              大項分類
            </label>
            <select
              value={newRecord.major_category}
              onChange={(e) => {
                const major = e.target.value as MajorCategory
                setNewRecord(prev => ({ 
                  ...prev, 
                  major_category: major,
                  minor_category: MajorToMinorCategories[major][0] as MinorCategory,
                  remarks_hint: MinorCategoryHints[MajorToMinorCategories[major][0] as MinorCategory]
                }))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(MajorCategory).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              中項分類
            </label>
            <select
              value={newRecord.minor_category}
              onChange={(e) => {
                const minor = e.target.value as MinorCategory
                setNewRecord(prev => ({ 
                  ...prev, 
                  minor_category: minor,
                  remarks_hint: MinorCategoryHints[minor]
                }))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MajorToMinorCategories[newRecord.major_category as MajorCategory]?.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              金額 (NTD)
            </label>
            <input
              type="number"
              value={newRecord.amount}
              onChange={(e) => setNewRecord(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={handleAddRecord}
              className="btn bg-blue-600 text-white w-full flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              新增
            </button>
          </div>
        </div>
        
        {/* 備註輸入 */}
        <div className="mt-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            備註 {newRecord.remarks_hint && (
              <span className="text-gray-500 text-xs ml-2">
                （提示：{newRecord.remarks_hint}）
              </span>
            )}
          </label>
          <input
            type="text"
            value={newRecord.remarks}
            onChange={(e) => setNewRecord(prev => ({ ...prev, remarks: e.target.value }))}
            placeholder="請輸入詳細備註..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* 篩選和搜索 */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={filterMajor}
                onChange={(e) => setFilterMajor(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部分類</option>
                {Object.values(MajorCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索備註或分類..."
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            共 {filteredRecords.length} 筆記錄
          </div>
        </div>
      </div>
      
      {/* 記錄列表 */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">支出記錄明細</h2>
        
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            沒有找到符合條件的記錄
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">大項分類</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">中項分類</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">金額</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">備註</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{record.transaction_date}</td>
                    <td className="py-3 px-4 text-sm">{record.major_category}</td>
                    <td className="py-3 px-4 text-sm">{record.minor_category}</td>
                    <td className="py-3 px-4 text-sm font-medium text-red-600">
                      {formatCurrency(record.amount)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {record.remarks}
                      {record.remarks_hint && (
                        <div className="text-xs text-gray-400 mt-1">
                          提示：{record.remarks_hint}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="text-red-600 hover:text-red-800"
                        title="刪除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}