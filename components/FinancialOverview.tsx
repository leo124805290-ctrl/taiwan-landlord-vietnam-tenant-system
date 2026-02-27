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
  
  // 物業篩選狀態（如果有多個物業）
  const [selectedProperty, setSelectedProperty] = useState<'all' | number>('all')
  
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
  
  // 互動篩選狀態
  const [activeFilter, setActiveFilter] = useState<{
    type: 'category' | 'month' | 'card' | null
    value: string | null
    label: string | null
  }>({
    type: null,
    value: null,
    label: null
  })
  
  // ==================== 數據初始化 ====================
  
  useEffect(() => {
    // 從物業數據中提取財務記錄
    const extractFinancialRecords = () => {
      const records: FinancialRecord[] = []
      
      // 1. 從物業的 expenses 提取支出記錄
      if (property?.expenses) {
        property.expenses.forEach((expense: any) => {
          // 這裡需要根據 expense 的結構轉換為 FinancialRecord
          // 暫時使用模擬數據，實際使用時需要根據 expense 結構調整
        })
      }
      
      // 2. 從物業的 maintenance 提取維修支出
      if (property?.maintenance) {
        property.maintenance.forEach((maintenance: any) => {
          if (maintenance.actualCost && maintenance.actualCost > 0) {
            records.push({
              id: `maintenance_${maintenance.id}`,
              major_category: MajorCategory.MAINTENANCE_EXPENSE,
              minor_category: MinorCategory.OTHER_MAINT,
              amount: maintenance.actualCost,
              currency: 'NTD',
              transaction_date: maintenance.actualCompletionDate || maintenance.date,
              remarks: `維修：${maintenance.title} - ${maintenance.desc}`,
              remarks_hint: MinorCategoryHints[MinorCategory.OTHER_MAINT],
              created_at: maintenance.date,
              updated_at: maintenance.date,
              property_id: property?.id
            })
          }
        })
      }
      
      // 3. 從物業的 utilityExpenses 提取水電支出
      if (property?.utilityExpenses) {
        property.utilityExpenses.forEach((utility: any) => {
          if (utility.amount && utility.amount > 0) {
            let minorCategory = MinorCategory.OTHER_DAILY
            let majorCategory = MajorCategory.DAILY_EXPENSE
            
            if (utility.type === 'taipower') {
              minorCategory = MinorCategory.ELECTRIC_BILL
            } else if (utility.type === 'water') {
              minorCategory = MinorCategory.WATER_BILL
            } else if (utility.type === 'rent') {
              minorCategory = MinorCategory.RENT_EXPENSE
              majorCategory = MajorCategory.DAILY_EXPENSE
            }
            
            records.push({
              id: `utility_${utility.id}`,
              major_category: majorCategory,
              minor_category: minorCategory,
              amount: utility.amount,
              currency: 'NTD',
              transaction_date: utility.paymentDate || utility.period,
              remarks: `${utility.type === 'taipower' ? '台電' : utility.type === 'water' ? '水費' : '租金'}: ${utility.period}`,
              remarks_hint: MinorCategoryHints[minorCategory],
              created_at: utility.paymentDate || utility.period,
              updated_at: utility.paymentDate || utility.period,
              property_id: property?.id
            })
          }
        })
      }
      
      // 4. 如果沒有真實數據，使用模擬數據
      if (records.length === 0) {
        records.push(
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
        )
      }
      
      return records
    }
    
    const records = extractFinancialRecords()
    setFinancialRecords(records)
    setLoading(false)
  }, [property?.id, property?.expenses, property?.maintenance, property?.utilityExpenses])
  
  // ==================== 數據計算函數 ====================
  
  // 獲取收入數據（從租客繳費記錄）
  const getIncomeData = useMemo(() => {
    let rentIncome = 0
    let electricityIncome = 0
    let additionalIncome = 0
    
    // 1. 從付款記錄中提取收入
    if (property?.payments) {
      property.payments.forEach((payment: any) => {
        if (payment.s === 'paid') {
          // 租金收入
          if (payment.paymentType === 'rent' || !payment.paymentType) {
            rentIncome += payment.r || 0
          }
          
          // 電費收入
          if (payment.paymentType === 'electricity' || payment.e) {
            electricityIncome += payment.e || 0
          }
          
          // 其他收入（押金、水費、網路等）
          if (payment.paymentType && 
              payment.paymentType !== 'rent' && 
              payment.paymentType !== 'electricity') {
            additionalIncome += payment.total || 0
          }
        }
      })
    }
    
    // 2. 從歷史記錄中提取收入
    if (property?.history) {
      property.history.forEach((payment: any) => {
        if (payment.s === 'paid') {
          // 租金收入
          if (payment.paymentType === 'rent' || !payment.paymentType) {
            rentIncome += payment.r || 0
          }
          
          // 電費收入
          if (payment.paymentType === 'electricity' || payment.e) {
            electricityIncome += payment.e || 0
          }
          
          // 其他收入
          if (payment.paymentType && 
              payment.paymentType !== 'rent' && 
              payment.paymentType !== 'electricity') {
            additionalIncome += payment.total || 0
          }
        }
      })
    }
    
    // 3. 從補充收入記錄中提取
    if (property?.additionalIncomes) {
      property.additionalIncomes.forEach((income: any) => {
        if (income.amount && income.amount > 0) {
          additionalIncome += income.amount
        }
      })
    }
    
    // 4. 如果沒有真實數據，使用模擬數據
    if (rentIncome === 0 && electricityIncome === 0 && additionalIncome === 0) {
      rentIncome = 120000
      electricityIncome = 45000
      additionalIncome = 8000
    }
    
    const totalIncome = rentIncome + electricityIncome + additionalIncome
    
    return {
      rentIncome,
      electricityIncome,
      additionalIncome,
      totalIncome
    }
  }, [property?.payments, property?.history, property?.additionalIncomes])
  
  // 篩選財務記錄
  const filteredRecords = useMemo(() => {
    let filtered = financialRecords
    
    // 1. 互動篩選優先
    if (activeFilter.type === 'category') {
      // 分類篩選
      filtered = filtered.filter(record => record.major_category === activeFilter.value)
    } else if (activeFilter.type === 'month') {
      // 月份篩選
      filtered = filtered.filter(record => 
        record.transaction_date.startsWith(activeFilter.value || '')
      )
    } else if (activeFilter.type === 'card') {
      // 卡片篩選（根據卡片類型）
      if (activeFilter.value === 'total-income') {
        // 總收入卡片：顯示所有記錄（收入和支出）
        // 不進行篩選
      } else if (activeFilter.value === 'total-expense') {
        // 總支出卡片：只顯示支出記錄
        filtered = filtered.filter(record => 
          record.major_category !== MajorCategory.OPERATIONAL_INCOME
        )
      } else if (activeFilter.value === 'net-income-without-onetime') {
        // 淨收支（不含一次性）：顯示經常性支出
        filtered = filtered.filter(record => 
          record.major_category !== MajorCategory.PRE_INVESTMENT &&
          record.major_category !== MajorCategory.DEPOSIT_EXPENSE &&
          record.major_category !== MajorCategory.OPERATIONAL_INCOME
        )
      } else if (activeFilter.value === 'net-income-with-onetime') {
        // 淨收支（含一次性）：顯示所有支出
        filtered = filtered.filter(record => 
          record.major_category !== MajorCategory.OPERATIONAL_INCOME
        )
      }
    }
    
    // 2. 時間篩選（如果沒有互動月份篩選）
    if (activeFilter.type !== 'month') {
      if (timeFilter === 'month') {
        // 本月篩選
        filtered = filtered.filter(record => 
          record.transaction_date.startsWith(selectedMonth)
        )
      } else if (timeFilter === 'property-start') {
        // 物業開始至今：顯示所有記錄
        // 這裡可以根據物業的創建日期進一步篩選
        // 暫時顯示所有記錄
      } else if (timeFilter === 'custom') {
        // 自選時間：需要實現日期範圍篩選
        // 暫時顯示所有記錄
      }
    }
    
    // 3. 分類篩選（如果沒有互動分類篩選）
    if (activeFilter.type !== 'category' && filterMajor !== 'all') {
      filtered = filtered.filter(record => record.major_category === filterMajor)
    }
    
    // 4. 文字搜索
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(record => 
        record.remarks.toLowerCase().includes(searchLower) ||
        record.minor_category.toLowerCase().includes(searchLower) ||
        record.major_category.toLowerCase().includes(searchLower)
      )
    }
    
    return filtered
  }, [financialRecords, timeFilter, selectedMonth, filterMajor, searchText, activeFilter])
  
  // 計算統計數據
  const stats = useMemo(() => {
    // 根據時間篩選計算收入數據
    const calculateFilteredIncome = () => {
      const incomeData = getIncomeData
      
      // 如果時間篩選是「本月」，需要過濾收入數據
      if (timeFilter === 'month') {
        let filteredRentIncome = 0
        let filteredElectricityIncome = 0
        let filteredAdditionalIncome = 0
        
        // 過濾付款記錄
        const allPayments = [...(property?.payments || []), ...(property?.history || [])]
        const selectedYearMonth = selectedMonth.replace('-', '/') // 轉換為 YYYY/MM 格式
        
        allPayments.forEach((payment: any) => {
          if (payment.s === 'paid' && payment.m === selectedYearMonth) {
            // 租金收入
            if (payment.paymentType === 'rent' || !payment.paymentType) {
              filteredRentIncome += payment.r || 0
            }
            
            // 電費收入
            if (payment.paymentType === 'electricity' || payment.e) {
              filteredElectricityIncome += payment.e || 0
            }
            
            // 其他收入
            if (payment.paymentType && 
                payment.paymentType !== 'rent' && 
                payment.paymentType !== 'electricity') {
              filteredAdditionalIncome += payment.total || 0
            }
          }
        })
        
        // 過濾補充收入記錄
        if (property?.additionalIncomes) {
          property.additionalIncomes.forEach((income: any) => {
            if (income.amount && income.amount > 0 && income.period === selectedYearMonth) {
              filteredAdditionalIncome += income.amount
            }
          })
        }
        
        // 如果過濾後有數據，使用過濾後的數據
        if (filteredRentIncome > 0 || filteredElectricityIncome > 0 || filteredAdditionalIncome > 0) {
          return {
            rentIncome: filteredRentIncome,
            electricityIncome: filteredElectricityIncome,
            additionalIncome: filteredAdditionalIncome,
            totalIncome: filteredRentIncome + filteredElectricityIncome + filteredAdditionalIncome
          }
        }
      }
      
      // 其他時間篩選使用全部收入數據
      return incomeData
    }
    
    const incomeData = calculateFilteredIncome()
    
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
  }, [filteredRecords, getIncomeData, timeFilter, selectedMonth, property])
  
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
    
    // 添加到本地狀態
    setFinancialRecords(prev => [recordToAdd, ...prev])
    
    // TODO: 這裡應該將記錄保存到後端或本地儲存
    // 實際使用時需要將記錄添加到 property.expenses 或其他適當的位置
    
    // 重置表單
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      major_category: MajorCategory.DAILY_EXPENSE,
      minor_category: MinorCategory.OTHER_DAILY,
      amount: '',
      remarks: '',
      remarks_hint: MinorCategoryHints[MinorCategory.OTHER_DAILY]
    })
    
    alert('記錄已新增！注意：目前僅保存在前端記憶體中，重新整理頁面會遺失。')
  }
  
  // 處理刪除記錄
  const handleDeleteRecord = (id: string) => {
    if (confirm('確定要刪除這筆記錄嗎？')) {
      setFinancialRecords(prev => prev.filter(record => record.id !== id))
    }
  }
  
  // ==================== 互動篩選函數 ====================
  
  // 處理卡片點擊
  const handleCardClick = (cardType: string, cardLabel: string) => {
    setActiveFilter({
      type: 'card',
      value: cardType,
      label: cardLabel
    })
    
    // 根據卡片類型設置其他篩選
    if (cardType === 'total-income') {
      setFilterMajor('all')
    } else if (cardType === 'total-expense') {
      setFilterMajor('all')
    } else if (cardType === 'net-income-without-onetime') {
      setFilterMajor('all')
      setIncludeOneTimeExpenses(false)
    } else if (cardType === 'net-income-with-onetime') {
      setFilterMajor('all')
      setIncludeOneTimeExpenses(true)
    }
  }
  
  // 處理月份點擊
  const handleMonthClick = (month: string, monthLabel: string) => {
    setActiveFilter({
      type: 'month',
      value: month,
      label: monthLabel
    })
    
    // 設置時間篩選
    setTimeFilter('month')
    setSelectedMonth(month)
  }
  
  // 處理分類點擊
  const handleCategoryClick = (category: string, categoryLabel: string) => {
    setActiveFilter({
      type: 'category',
      value: category,
      label: categoryLabel
    })
    
    // 設置分類篩選
    setFilterMajor(category)
  }
  
  // 清除所有篩選
  const clearAllFilters = () => {
    setActiveFilter({
      type: null,
      value: null,
      label: null
    })
    setFilterMajor('all')
    setSearchText('')
    setTimeFilter('month')
    setSelectedMonth(new Date().toISOString().substring(0, 7))
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
        <div 
          className={`card bg-gradient-to-r from-green-50 to-green-100 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeFilter.type === 'card' && activeFilter.value === 'total-income' 
              ? 'ring-2 ring-green-500 ring-offset-2' 
              : ''
          }`}
          onClick={() => handleCardClick('total-income', '總收入')}
          title="點擊篩選總收入相關記錄"
        >
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
        <div 
          className={`card bg-gradient-to-r from-red-50 to-red-100 cursor-pointer transition-all duration-200 hover:shadow-lg ${
            activeFilter.type === 'card' && activeFilter.value === 'total-expense' 
              ? 'ring-2 ring-red-500 ring-offset-2' 
              : ''
          }`}
          onClick={() => handleCardClick('total-expense', '總支出')}
          title="點擊篩選支出記錄"
        >
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
        <div 
          className={`card bg-gradient-to-r cursor-pointer transition-all duration-200 hover:shadow-lg ${
            stats.netIncomeWithoutOneTime >= 0 ? 'from-blue-50 to-blue-100' : 'from-orange-50 to-orange-100'
          } ${
            activeFilter.type === 'card' && activeFilter.value === 'net-income-without-onetime' 
              ? 'ring-2 ring-blue-500 ring-offset-2' 
              : ''
          }`}
          onClick={() => handleCardClick('net-income-without-onetime', '淨收支（不含一次性）')}
          title="點擊篩選經常性支出記錄"
        >
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
        <div 
          className={`card bg-gradient-to-r cursor-pointer transition-all duration-200 hover:shadow-lg ${
            stats.netIncomeWithOneTime >= 0 ? 'from-purple-50 to-purple-100' : 'from-amber-50 to-amber-100'
          } ${
            activeFilter.type === 'card' && activeFilter.value === 'net-income-with-onetime' 
              ? 'ring-2 ring-purple-500 ring-offset-2' 
              : ''
          }`}
          onClick={() => handleCardClick('net-income-with-onetime', '淨收支（含一次性）')}
          title="點擊篩選所有支出記錄"
        >
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
      
      {/* 當前篩選狀態 */}
      {activeFilter.type && (
        <div className="card bg-blue-50 border border-blue-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-700">
                當前篩選：
                <span className="font-medium text-blue-700 ml-1">
                  {activeFilter.label}
                </span>
              </span>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>清除篩選</span>
              <span className="text-lg">×</span>
            </button>
          </div>
        </div>
      )}
      
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
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => handleMonthClick(
                          record.transaction_date.substring(0, 7),
                          `${record.transaction_date.substring(0, 7)}月份`
                        )}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                        title="點擊篩選此月份"
                      >
                        {record.transaction_date}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <button
                        onClick={() => handleCategoryClick(
                          record.major_category,
                          record.major_category
                        )}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                        title="點擊篩選此分類"
                      >
                        {record.major_category}
                      </button>
                    </td>
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