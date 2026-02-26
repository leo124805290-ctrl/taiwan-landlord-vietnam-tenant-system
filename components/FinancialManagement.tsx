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
  Home,
  FileText,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Filter,
  Download,
  Upload,
  Building,
  TrendingUp,
  TrendingDown,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface FinancialManagementProps {
  property: any
}

export default function FinancialManagement({ property }: FinancialManagementProps) {
  const { state, updateState, updateData, openModal } = useApp()
  
  // 財務記錄狀態
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([])
  const [loading, setLoading] = useState(true)
  
  // 表單記錄類型（用於表單輸入，amount 為 string）
  interface FormRecord {
    major_category?: MajorCategory;
    minor_category?: MinorCategory;
    amount: string; // 表單輸入用 string
    currency?: string;
    transaction_date?: string;
    remarks?: string;
    remarks_hint?: string;
    property_id?: number;
    room_number?: string;
    payment_method?: 'cash' | 'transfer' | 'credit' | 'check' | 'other';
    status?: 'pending' | 'completed' | 'cancelled';
  }
  
  // 新增記錄表單狀態
  const [newRecord, setNewRecord] = useState<FormRecord>({
    major_category: MajorCategory.DAILY_EXPENSE,
    minor_category: MinorCategory.OTHER_DAILY,
    amount: '',
    currency: 'NTD',
    transaction_date: new Date().toISOString().split('T')[0],
    remarks: '',
    remarks_hint: MinorCategoryHints[MinorCategory.OTHER_DAILY],
    property_id: property?.id,
    payment_method: 'transfer',
    status: 'completed'
  })
  
  // 篩選狀態
  const [filterMajor, setFilterMajor] = useState<string>('all')
  const [filterMinor, setFilterMinor] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')
  const [filterAmountMin, setFilterAmountMin] = useState<string>('')
  const [filterAmountMax, setFilterAmountMax] = useState<string>('')
  const [searchText, setSearchText] = useState<string>('')
  
  // 顯示/隱藏篩選面板
  const [showFilters, setShowFilters] = useState(false)
  
  // 編輯模式
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // 初始化財務記錄（模擬資料）
  useEffect(() => {
    // 這裡應該從 API 或本地儲存載入資料
    // 暫時使用模擬資料
    const mockRecords: FinancialRecord[] = [
      {
        id: '1',
        major_category: MajorCategory.OPERATIONAL_INCOME,
        minor_category: MinorCategory.RENTAL_INCOME,
        amount: 45000,
        currency: 'NTD',
        transaction_date: '2026-02-25',
        remarks: 'A棟301房租金收入',
        remarks_hint: MinorCategoryHints[MinorCategory.RENTAL_INCOME],
        created_at: '2026-02-25 10:30:00',
        updated_at: '2026-02-25 10:30:00',
        property_id: property?.id,
        room_number: '301',
        payment_method: 'transfer',
        status: 'completed'
      },
      {
        id: '2',
        major_category: MajorCategory.DAILY_EXPENSE,
        minor_category: MinorCategory.ELECTRIC_BILL,
        amount: 12500,
        currency: 'NTD',
        transaction_date: '2026-02-20',
        remarks: '2月份公共區域電費',
        remarks_hint: MinorCategoryHints[MinorCategory.ELECTRIC_BILL],
        created_at: '2026-02-20 14:15:00',
        updated_at: '2026-02-20 14:15:00',
        property_id: property?.id,
        payment_method: 'transfer',
        status: 'completed'
      },
      {
        id: '3',
        major_category: MajorCategory.MAINTENANCE_EXPENSE,
        minor_category: MinorCategory.AC_MAINTENANCE,
        amount: 3000,
        currency: 'NTD',
        transaction_date: '2026-02-15',
        remarks: '301房冷氣清洗',
        remarks_hint: MinorCategoryHints[MinorCategory.AC_MAINTENANCE],
        created_at: '2026-02-15 09:45:00',
        updated_at: '2026-02-15 09:45:00',
        property_id: property?.id,
        room_number: '301',
        payment_method: 'cash',
        status: 'completed'
      }
    ]
    
    setFinancialRecords(mockRecords)
    setLoading(false)
  }, [property?.id])
  
  // 當選擇大項分類時，更新中項分類選項
  const minorCategoryOptions = useMemo(() => {
    if (!newRecord.major_category) return []
    return MajorToMinorCategories[newRecord.major_category as MajorCategory] || []
  }, [newRecord.major_category])
  
  // 當選擇中項分類時，更新備註提示
  useEffect(() => {
    if (newRecord.minor_category) {
      setNewRecord(prev => ({
        ...prev,
        remarks_hint: MinorCategoryHints[newRecord.minor_category as MinorCategory] || ''
      }))
    }
  }, [newRecord.minor_category])
  
  // 篩選財務記錄
  const filteredRecords = useMemo(() => {
    return financialRecords.filter(record => {
      // 大項分類篩選
      if (filterMajor !== 'all' && record.major_category !== filterMajor) return false
      
      // 中項分類篩選
      if (filterMinor !== 'all' && record.minor_category !== filterMinor) return false
      
      // 日期範圍篩選
      if (filterDateFrom && record.transaction_date < filterDateFrom) return false
      if (filterDateTo && record.transaction_date > filterDateTo) return false
      
      // 金額範圍篩選
      if (filterAmountMin && record.amount < parseFloat(filterAmountMin)) return false
      if (filterAmountMax && record.amount > parseFloat(filterAmountMax)) return false
      
      // 文字搜索
      if (searchText) {
        const searchLower = searchText.toLowerCase()
        return (
          record.remarks.toLowerCase().includes(searchLower) ||
          record.minor_category.toLowerCase().includes(searchLower) ||
          record.major_category.toLowerCase().includes(searchLower) ||
          (record.room_number && record.room_number.toLowerCase().includes(searchLower))
        )
      }
      
      return true
    })
  }, [financialRecords, filterMajor, filterMinor, filterDateFrom, filterDateTo, filterAmountMin, filterAmountMax, searchText])
  
  // 計算統計資料
  const stats = useMemo(() => {
    let totalIncome = 0
    let totalExpense = 0
    let netBalance = 0
    
    financialRecords.forEach(record => {
      if (record.major_category === MajorCategory.OPERATIONAL_INCOME) {
        totalIncome += record.amount
        netBalance += record.amount
      } else {
        totalExpense += record.amount
        netBalance -= record.amount
      }
    })
    
    return {
      totalIncome,
      totalExpense,
      netBalance,
      recordCount: financialRecords.length
    }
  }, [financialRecords])
  
  // 按分類統計
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number, total: number }> = {}
    
    financialRecords.forEach(record => {
      const key = `${record.major_category} - ${record.minor_category}`
      if (!stats[key]) {
        stats[key] = { count: 0, total: 0 }
      }
      stats[key].count += 1
      stats[key].total += record.amount
    })
    
    return Object.entries(stats)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total)
  }, [financialRecords])
  
  // 處理新增/更新記錄
  const handleSaveRecord = () => {
    if (!newRecord.amount || !newRecord.transaction_date) {
      alert('請填寫金額和交易日期')
      return
    }
    
    // 轉換金額為數字
    const amountValue = parseFloat(newRecord.amount) || 0
    
    if (editingId) {
      // 更新現有記錄
      setFinancialRecords(prev => prev.map(record => 
        record.id === editingId 
          ? { 
              ...record, 
              major_category: newRecord.major_category!,
              minor_category: newRecord.minor_category!,
              amount: amountValue,
              currency: newRecord.currency || 'NTD',
              transaction_date: newRecord.transaction_date!,
              remarks: newRecord.remarks || '',
              remarks_hint: newRecord.remarks_hint || '',
              updated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
              room_number: newRecord.room_number,
              payment_method: newRecord.payment_method,
              status: newRecord.status
            }
          : record
      ))
      setEditingId(null)
    } else {
      // 新增記錄
      const newId = Date.now().toString()
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19)
      
      const recordToAdd: FinancialRecord = {
        id: newId,
        major_category: newRecord.major_category!,
        minor_category: newRecord.minor_category!,
        amount: amountValue,
        currency: newRecord.currency || 'NTD',
        transaction_date: newRecord.transaction_date!,
        remarks: newRecord.remarks || '',
        remarks_hint: newRecord.remarks_hint || '',
        created_at: now,
        updated_at: now,
        property_id: property?.id,
        room_number: newRecord.room_number,
        payment_method: newRecord.payment_method,
        status: newRecord.status as any
      }
      
      setFinancialRecords(prev => [recordToAdd, ...prev])
    }
    
    // 重置表單
    setNewRecord({
      major_category: MajorCategory.DAILY_EXPENSE,
      minor_category: MinorCategory.OTHER_DAILY,
      amount: '',
      currency: 'NTD',
      transaction_date: new Date().toISOString().split('T')[0],
      remarks: '',
      remarks_hint: MinorCategoryHints[MinorCategory.OTHER_DAILY],
      property_id: property?.id,
      payment_method: 'transfer',
      status: 'completed'
    } as any)
  }
  
  // 處理編輯記錄
  const handleEditRecord = (record: FinancialRecord) => {
    setNewRecord({
      major_category: record.major_category,
      minor_category: record.minor_category,
      amount: record.amount.toString(),
      currency: record.currency,
      transaction_date: record.transaction_date,
      remarks: record.remarks,
      remarks_hint: record.remarks_hint,
      property_id: record.property_id,
      room_number: record.room_number,
      payment_method: record.payment_method,
      status: record.status
    })
    setEditingId(record.id)
  }
  
  // 處理刪除記錄
  const handleDeleteRecord = (id: string) => {
    if (confirm('確定要刪除這筆記錄嗎？')) {
      setFinancialRecords(prev => prev.filter(record => record.id !== id))
    }
  }
  
  // 匯出資料為 CSV
  const handleExportCSV = () => {
    const headers = ['日期', '大項分類', '中項分類', '金額(NTD)', '備註', '房間', '付款方式', '狀態']
    const csvRows = [
      headers.join(','),
      ...filteredRecords.map(record => [
        record.transaction_date,
        record.major_category,
        record.minor_category,
        record.amount,
        `"${record.remarks.replace(/"/g, '""')}"`,
        record.room_number || '',
        record.payment_method || '',
        record.status || ''
      ].join(','))
    ]
    
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `財務記錄_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  
  // 重置篩選
  const handleResetFilters = () => {
    setFilterMajor('all')
    setFilterMinor('all')
    setFilterDateFrom('')
    setFilterDateTo('')
    setFilterAmountMin('')
    setFilterAmountMax('')
    setSearchText('')
  }
  
  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">載入財務記錄中...</p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總收入</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(stats.totalIncome)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總支出</p>
              <p className="text-2xl font-bold text-red-700">
                {formatCurrency(stats.totalExpense)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className={`card bg-gradient-to-r ${stats.netBalance >= 0 ? 'from-blue-50 to-blue-100' : 'from-orange-50 to-orange-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">淨收支</p>
              <p className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {formatCurrency(stats.netBalance)}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${stats.netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
          </div>
        </div>
      </div>
      
      {/* 新增/編輯表單 */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">
          {editingId ? '編輯財務記錄' : '新增財務記錄'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 左側：分類選擇 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                大項分類 *
              </label>
              <select
                value={newRecord.major_category}
                onChange={(e) => {
                  const major = e.target.value as MajorCategory
                  const minors = MajorToMinorCategories[major] || []
                  const firstMinor = minors[0] || MinorCategory.OTHER_DAILY
                  
                  setNewRecord(prev => ({ 
                    ...prev, 
                    major_category: major,
                    minor_category: firstMinor
                  }))
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(MajorCategory).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                中項分類 *
              </label>
              <select
                value={newRecord.minor_category}
                onChange={(e) => setNewRecord(prev => ({ 
                  ...prev, 
                  minor_category: e.target.value as MinorCategory 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {minorCategoryOptions.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                金額 (NTD) *
              </label>
              <input
                type="number"
                value={newRecord.amount}
                onChange={(e) => setNewRecord(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="例如：15000.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                交易日期 *
              </label>
              <input
                type="date"
                value={newRecord.transaction_date}
                onChange={(e) => setNewRecord(prev => ({ ...prev, transaction_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* 右側：詳細資訊 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備註提示
              </label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                {newRecord.remarks_hint || '選擇中項分類後會顯示相關提示'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                備註 *
              </label>
              <textarea
                value={newRecord.remarks}
                onChange={(e) => setNewRecord(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="請輸入詳細備註..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  房間號碼
                </label>
                <input
                  type="text"
                  value={newRecord.room_number || ''}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, room_number: e.target.value }))}
                  placeholder="例如：301"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  付款方式
                </label>
                <select
                  value={newRecord.payment_method}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, payment_method: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">現金</option>
                  <option value="transfer">轉帳</option>
                  <option value="credit">信用卡</option>
                  <option value="check">支票</option>
                  <option value="other">其他</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null)
                setNewRecord({
                  major_category: MajorCategory.DAILY_EXPENSE,
                  minor_category: MinorCategory.OTHER_DAILY,
                  amount: '',
                  currency: 'NTD',
                  transaction_date: new Date().toISOString().split('T')[0],
                  remarks: '',
                  remarks_hint: MinorCategoryHints[MinorCategory.OTHER_DAILY],
                  property_id: property?.id,
                  payment_method: 'transfer',
                  status: 'completed'
                } as any)
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              取消編輯
            </button>
          )}
          <button
            onClick={handleSaveRecord}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {editingId ? '更新記錄' : '新增記錄'}
          </button>
        </div>
      </div>
      
      {/* 篩選和搜索 */}
      <div className="card">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              篩選
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="搜索備註、分類..."
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              重置篩選
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              匯出 CSV
            </button>
          </div>
        </div>
        
        {/* 篩選面板 */}
        {showFilters && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  大項分類
                </label>
                <select
                  value={filterMajor}
                  onChange={(e) => setFilterMajor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部</option>
                  {Object.values(MajorCategory).map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  中項分類
                </label>
                <select
                  value={filterMinor}
                  onChange={(e) => setFilterMinor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部</option>
                  {filterMajor !== 'all' 
                    ? MajorToMinorCategories[filterMajor as MajorCategory]?.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))
                    : Object.values(MinorCategory).map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))
                  }
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期從
                </label>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  日期到
                </label>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  金額從
                </label>
                <input
                  type="number"
                  value={filterAmountMin}
                  onChange={(e) => setFilterAmountMin(e.target.value)}
                  placeholder="最小金額"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  金額到
                </label>
                <input
                  type="number"
                  value={filterAmountMax}
                  onChange={(e) => setFilterAmountMax(e.target.value)}
                  placeholder="最大金額"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 財務記錄列表 */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">財務記錄</h2>
          <span className="text-sm text-gray-600">
            共 {filteredRecords.length} 筆記錄
          </span>
        </div>
        
        {filteredRecords.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">沒有找到符合條件的財務記錄</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    日期
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    分類
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    備註
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    房間
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {record.transaction_date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium">{record.major_category}</div>
                        <div className="text-gray-500 text-xs">{record.minor_category}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        record.major_category === MajorCategory.OPERATIONAL_INCOME 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {record.major_category === MajorCategory.OPERATIONAL_INCOME ? '+' : '-'}
                        {formatCurrency(record.amount)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm max-w-xs truncate" title={record.remarks}>
                        {record.remarks}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {record.room_number || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRecord(record)}
                          className="text-blue-600 hover:text-blue-800"
                          title="編輯"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-800"
                          title="刪除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* 分類統計 */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4">分類統計</h2>
        <div className="space-y-3">
          {categoryStats.slice(0, 10).map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium">{stat.category}</div>
                <div className="text-xs text-gray-500">{stat.count} 筆記錄</div>
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(stat.total)}
              </div>
            </div>
          ))}
          
          {categoryStats.length > 10 && (
            <div className="text-center pt-2">
              <button className="text-sm text-blue-600 hover:text-blue-800">
                顯示全部 {categoryStats.length} 個分類
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}