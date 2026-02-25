'use client'

import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'
import { t } from '@/lib/translations'
import { useState } from 'react'

// 物業統計類型
interface PropertyStats {
  id: string
  name: string
  location: string
  startDate: Date
  totalInvestment: number
  
  // 本月統計
  currentMonth: {
    expense: number
    income: number
    netAmount: number
  }
  
  // 累計統計
  cumulative: {
    totalExpense: number
    totalIncome: number
    netAmount: number
    averageMonthlyLoss: number
  }
}

// 時間軸項目類型
interface TimelineItem {
  date: Date
  type: 'expense' | 'income' | 'payment'
  category: string
  amount: number
  description: string
  status: 'paid' | 'pending' | 'overdue'
}

export default function PropertyDashboard() {
  const { state } = useApp()
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'dashboard' | 'property' | 'monthly'>('dashboard')
  const [displayMode, setDisplayMode] = useState<'overview' | 'table' | 'timeline' | 'chart'>('overview')
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom'>('month')

  // 計算物業統計數據（模擬數據 - 實際應從數據計算）
  const calculatePropertyStats = (): PropertyStats[] => {
    return state.data.properties.map(property => {
      // 從現有數據計算統計
      const rooms = property.rooms || []
      const payments = property.payments || []
      const history = property.history || []
      
      // 計算本月收入（從付款記錄）
      const currentMonth = new Date().getMonth() + 1
      const currentYear = new Date().getFullYear()
      
      const currentMonthPayments = payments.filter((p: any) => {
        if (!p.paidDate) return false
        const date = new Date(p.paidDate)
        return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear
      })
      
      const currentMonthIncome = currentMonthPayments.reduce((sum: number, p: any) => sum + (p.total || 0), 0)
      
      // 計算本月支出（模擬數據）
      const currentMonthExpense = Math.floor(Math.random() * 50000) + 30000
      
      // 計算累計收入（從歷史記錄）
      const totalIncome = history.reduce((sum: number, p: any) => sum + (p.total || 0), 0)
      
      // 計算累計支出（模擬數據）
      const totalExpense = Math.floor(Math.random() * 500000) + 200000
      
      // 計算經營月數
      const startDate = new Date('2024-01-01') // 假設開始日期
      const today = new Date()
      const monthsSinceStart = (today.getFullYear() - startDate.getFullYear()) * 12 + (today.getMonth() - startDate.getMonth())
      
      return {
        id: property.id,
        name: property.name,
        location: property.address || '未設定地址',
        startDate,
        totalInvestment: 850000, // 假設總投資
        
        currentMonth: {
          expense: currentMonthExpense,
          income: currentMonthIncome,
          netAmount: currentMonthIncome - currentMonthExpense
        },
        
        cumulative: {
          totalExpense,
          totalIncome,
          netAmount: totalIncome - totalExpense,
          averageMonthlyLoss: monthsSinceStart > 0 ? (totalIncome - totalExpense) / monthsSinceStart : 0
        }
      }
    })
  }

  // 計算總計統計
  const calculateTotalStats = (stats: PropertyStats[]) => {
    return {
      currentMonth: {
        expense: stats.reduce((sum, s) => sum + s.currentMonth.expense, 0),
        income: stats.reduce((sum, s) => sum + s.currentMonth.income, 0),
        netAmount: stats.reduce((sum, s) => sum + s.currentMonth.netAmount, 0)
      },
      cumulative: {
        totalExpense: stats.reduce((sum, s) => sum + s.cumulative.totalExpense, 0),
        totalIncome: stats.reduce((sum, s) => sum + s.cumulative.totalIncome, 0),
        netAmount: stats.reduce((sum, s) => sum + s.cumulative.netAmount, 0),
        averageMonthlyLoss: stats.length > 0 ? stats.reduce((sum, s) => sum + s.cumulative.averageMonthlyLoss, 0) / stats.length : 0
      }
    }
  }

  const propertyStats = calculatePropertyStats()
  const totalStats = calculateTotalStats(propertyStats)

  // 渲染物業總覽卡片
  const renderPropertyCard = (stats: PropertyStats) => (
    <div key={stats.id} className="card border-2 border-gray-200 hover:border-blue-300 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{stats.name}</h3>
          <p className="text-sm text-gray-600">{stats.location}</p>
        </div>
        <button 
          onClick={() => {
            setSelectedProperty(stats.id)
            setViewMode('property')
          }}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200"
        >
          查看詳情
        </button>
      </div>
      
      {/* 本月統計 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">本月統計</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-red-50 rounded">
            <div className="text-xs text-gray-600">支出</div>
            <div className="font-bold text-red-600">{formatCurrency(stats.currentMonth.expense)}</div>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <div className="text-xs text-gray-600">收入</div>
            <div className="font-bold text-green-600">{formatCurrency(stats.currentMonth.income)}</div>
          </div>
          <div className={`p-2 rounded ${stats.currentMonth.netAmount >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="text-xs text-gray-600">淨額</div>
            <div className={`font-bold ${stats.currentMonth.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.currentMonth.netAmount)}
            </div>
          </div>
        </div>
      </div>
      
      {/* 累計統計 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">累計統計</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">累計支出</div>
            <div className="font-bold">{formatCurrency(stats.cumulative.totalExpense)}</div>
          </div>
          <div className="p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">累計收入</div>
            <div className="font-bold">{formatCurrency(stats.cumulative.totalIncome)}</div>
          </div>
        </div>
        <div className="mt-2 p-2 bg-gray-100 rounded">
          <div className="text-xs text-gray-600">累計淨損</div>
          <div className="font-bold text-red-600">{formatCurrency(stats.cumulative.netAmount)}</div>
          <div className="text-xs text-gray-500 mt-1">
            平均月損: {formatCurrency(stats.cumulative.averageMonthlyLoss)}
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染總計卡片
  const renderTotalCard = () => (
    <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold">物業管理總覽</h2>
          <p className="text-sm text-gray-600">所有物業統計摘要</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">總計</div>
          <div className="text-3xl font-bold">{propertyStats.length} 個物業</div>
        </div>
      </div>
      
      {/* 本月總計 */}
      <div className="mb-4">
        <h3 className="text-lg font-bold mb-2">本月總計</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">總支出</div>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalStats.currentMonth.expense)}</div>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">總收入</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalStats.currentMonth.income)}</div>
          </div>
          <div className={`p-3 bg-white rounded-lg shadow-sm ${totalStats.currentMonth.netAmount >= 0 ? 'border-green-200' : 'border-red-200'} border-2`}>
            <div className="text-sm text-gray-600">總淨額</div>
            <div className={`text-2xl font-bold ${totalStats.currentMonth.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalStats.currentMonth.netAmount)}
            </div>
          </div>
        </div>
      </div>
      
      {/* 累計總計 */}
      <div>
        <h3 className="text-lg font-bold mb-2">累計總計</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">累計總支出</div>
            <div className="text-2xl font-bold">{formatCurrency(totalStats.cumulative.totalExpense)}</div>
          </div>
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">累計總收入</div>
            <div className="text-2xl font-bold">{formatCurrency(totalStats.cumulative.totalIncome)}</div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-white rounded-lg shadow-sm border-2 border-red-100">
          <div className="text-sm text-gray-600">累計總淨損</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalStats.cumulative.netAmount)}</div>
          <div className="text-sm text-gray-500 mt-1">
            平均月損: {formatCurrency(totalStats.cumulative.averageMonthlyLoss)}
          </div>
        </div>
      </div>
    </div>
  )

  // 渲染單一物業視圖
  const renderPropertyView = () => {
    const property = propertyStats.find(p => p.id === selectedProperty)
    if (!property) return null

    // 模擬時間軸數據
    const timelineItems: TimelineItem[] = [
      { date: new Date('2025-03-01'), type: 'expense', category: '固定支出', amount: 20000, description: '物業房租租金', status: 'paid' },
      { date: new Date('2025-03-05'), type: 'expense', category: '維修支出', amount: 8000, description: '浴室防水工程', status: 'paid' },
      { date: new Date('2025-03-08'), type: 'income', category: '補充收入', amount: 800, description: '洗衣機收入', status: 'paid' },
      { date: new Date('2025-03-12'), type: 'expense', category: '維修支出', amount: 2500, description: '廚房水龍頭', status: 'paid' },
      { date: new Date('2025-03-15'), type: 'income', category: '補充收入', amount: 850, description: '洗衣機收入', status: 'paid' },
      { date: new Date('2025-03-20'), type: 'expense', category: '裝修支出', amount: 13000, description: '房間油漆', status: 'paid' },
      { date: new Date('2025-03-31'), type: 'expense', category: '水電支出', amount: 8500, description: '台電帳單', status: 'pending' },
    ]

    return (
      <div className="space-y-6">
        {/* 返回按鈕 */}
        <button 
          onClick={() => {
            setSelectedProperty(null)
            setViewMode('dashboard')
          }}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          ← 返回物業總覽
        </button>

        {/* 物業標題 */}
        <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{property.name}</h1>
              <p className="text-gray-600">{property.location}</p>
              <div className="mt-2 text-sm text-gray-500">
                經營期間：2024年1月～迄今 · 總投資：{formatCurrency(property.totalInvestment)}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setDisplayMode('overview')}
                className={`px-4 py-2 rounded-lg ${displayMode === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                總覽
              </button>
              <button 
                onClick={() => setDisplayMode('table')}
                className={`px-4 py-2 rounded-lg ${displayMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                表格
              </button>
              <button 
                onClick={() => setDisplayMode('timeline')}
                className={`px-4 py-2 rounded-lg ${displayMode === 'timeline' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                時間軸
              </button>
            </div>
          </div>
        </div>

        {/* 統計面板 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-sm text-gray-600">經營期間</div>
            <div className="text-lg font-bold">2024年1月～迄今</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">總投資</div>
            <div className="text-lg font-bold">{formatCurrency(property.totalInvestment)}</div>
            <div className="text-xs text-gray-500">押金+裝修</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">累計淨損</div>
            <div className="text-lg font-bold text-red-600">{formatCurrency(property.cumulative.netAmount)}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">平均月損</div>
            <div className="text-lg font-bold text-red-600">{formatCurrency(property.cumulative.averageMonthlyLoss)}</div>
          </div>
        </div>

        {/* 時間軸視圖 */}
        {displayMode === 'timeline' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">📅 時間軸視圖 - 2025年3月</h2>
            <div className="space-y-3">
              {timelineItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="text-2xl">
                    {item.type === 'expense' ? '📅' : item.type === 'income' ? '💰' : '💳'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-bold">{item.category}</span>
                        <span className="ml-2 text-gray-600">· {item.description}</span>
                      </div>
                      <div className={`font-bold ${item.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                        {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.date.getDate()}日 · 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${item.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {item.status === 'paid' ? '✓ 已付款' : '⏳ 待繳'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                切換到表格視圖
              </button>
              <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                查看年度報表
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                匯出數據
              </button>
            </div>
          </div>
        )}

        {/* 表格視圖 */}
        {displayMode === 'table' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">📊 表格總覽 - 2025年3月</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-3 px-4 border-b text-left font-medium">日期</th>
                    <th className="py-3 px-4 border-b text-left font-medium">類型</th>
                    <th className="py-3 px-4 border-b text-left font-medium">類別</th>
                    <th className="py-3 px-4 border-b text-left font-medium">描述</th>
                    <th className="py-3 px-4 border-b text-left font-medium">金額</th>
                    <th className="py-3 px-4 border-b text-left font-medium">狀態</th>
                  </tr>
                </thead>
                <tbody>
                  {timelineItems.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b">{item.date.getDate()}日</td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-2 py-1 rounded text-xs ${item.type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                          {item.type === 'expense' ? '支出' : '收入'}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b">{item.category}</td>
                      <td className="py-3 px-4 border-b">{item.description}</td>
                      <td className={`py-3 px-4 border-b font-bold ${item.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                        {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 px-4 border-b">
                        <span className={`px-2 py-1 rounded text-xs ${item.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {item.status === 'paid' ? '已付款' : '待繳'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td colSpan={4} className="py-3 px-4 border-t font-bold">總計</td>
                    <td className="py-3 px-4 border-t font-bold text-red-600">
                      -{formatCurrency(timelineItems.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0))}
                    </td>
                    <td className="py-3 px-4 border-t font-bold text-green-600">
                      +{formatCurrency(timelineItems.filter(i => i.type === 'income').reduce((sum, i) => sum + i.amount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => setDisplayMode('timeline')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                切換到時間軸視圖
              </button>
              <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                查看年度報表
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                匯出Excel
              </button>
            </div>
          </div>
        )}

        {/* 總覽模式 */}
        {displayMode === 'overview' && (
          <div className="card">
            <h2 className="text-xl font-bold mb-4">📊 月度總覽 - 2025年3月</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold mb-3">支出分析</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-red-50 rounded">
                    <span>固定支出</span>
                    <span className="font-bold text-red-600">{formatCurrency(20000)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-50 rounded">
                    <span>維修支出</span>
                    <span className="font-bold text-red-600">{formatCurrency(10500)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-50 rounded">
                    <span>裝修支出</span>
                    <span className="font-bold text-red-600">{formatCurrency(13000)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-50 rounded">
                    <span>水電支出</span>
                    <span className="font-bold text-red-600">{formatCurrency(8500)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-100 rounded font-bold">
                    <span>總支出</span>
                    <span className="text-red-700">{formatCurrency(52000)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-3">收入分析</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-green-50 rounded">
                    <span>補充收入</span>
                    <span className="font-bold text-green-600">{formatCurrency(1650)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-green-100 rounded font-bold">
                    <span>總收入</span>
                    <span className="text-green-700">{formatCurrency(1650)}</span>
                  </div>
                  <div className="mt-4 p-3 bg-gray-100 rounded">
                    <div className="flex justify-between">
                      <span>本月淨額</span>
                      <span className="font-bold text-red-600">-{formatCurrency(50350)}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      支出 {formatCurrency(52000)} - 收入 {formatCurrency(1650)} = 淨損 {formatCurrency(50350)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => setDisplayMode('timeline')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                查看時間軸
              </button>
              <button 
                onClick={() => setDisplayMode('table')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                查看表格
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                匯出報表
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 主渲染邏輯
  return (
    <div className="space-y-6">
      {/* 查詢功能欄 */}
      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium mb-1">時間範圍</label>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="today">本日</option>
              <option value="week">本週</option>
              <option value="month">本月</option>
              <option value="quarter">本季</option>
              <option value="year">本年</option>
              <option value="custom">自訂</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">物業選擇</label>
            <select 
              value={selectedProperty || 'all'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setSelectedProperty(null)
                  setViewMode('dashboard')
                } else {
                  setSelectedProperty(e.target.value)
                  setViewMode('property')
                }
              }}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">全部物業</option>
              {propertyStats.map(property => (
                <option key={property.id} value={property.id}>{property.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">項目篩選</label>
            <select className="px-3 py-2 border rounded-lg">
              <option value="all">全部</option>
              <option value="expense">支出</option>
              <option value="income">收入</option>
              <option value="fixed">固定</option>
              <option value="variable">變動</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">視圖切換</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-2 rounded ${viewMode === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                總覽
              </button>
              <button 
                onClick={() => setViewMode('property')}
                className={`px-3 py-2 rounded ${viewMode === 'property' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                disabled={!selectedProperty}
              >
                物業
              </button>
              <button 
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-2 rounded ${viewMode === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                disabled={!selectedProperty}
              >
                月度
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 根據視圖模式渲染內容 */}
      {viewMode === 'dashboard' && (
        <>
          {renderTotalCard()}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {propertyStats.map(renderPropertyCard)}
          </div>
        </>
      )}

      {viewMode === 'property' && selectedProperty && renderPropertyView()}

      {viewMode === 'monthly' && selectedProperty && (
        <div className="card">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📅</div>
            <h2 className="text-2xl font-bold mb-2">月度詳細視圖</h2>
            <p className="text-gray-600 mb-4">選擇月份查看詳細的收支記錄</p>
            <div className="flex gap-2 justify-center">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                2025年3月
              </button>
              <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                2025年2月
              </button>
              <button className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
                2025年1月
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}