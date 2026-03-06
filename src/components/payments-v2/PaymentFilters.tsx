'use client'

interface PaymentFiltersProps {
  filter: {
    status: 'all' | 'pending' | 'paid'
    type: 'all' | 'rent' | 'deposit' | 'electricity' | 'other'
    search: string
  }
  onFilterChange: (filter: {
    status: 'all' | 'pending' | 'paid'
    type: 'all' | 'rent' | 'deposit' | 'electricity' | 'other'
    search: string
  }) => void
  viewMode: 'table' | 'card'
  onViewModeChange: (mode: 'table' | 'card') => void
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onBatchConfirm: () => void
}

export default function PaymentFilters({
  filter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  selectedCount,
  totalCount,
  onSelectAll,
  onBatchConfirm
}: PaymentFiltersProps) {
  const handleStatusChange = (status: 'all' | 'pending' | 'paid') => {
    onFilterChange({ ...filter, status })
  }
  
  const handleTypeChange = (type: 'all' | 'rent' | 'deposit' | 'electricity' | 'other') => {
    onFilterChange({ ...filter, type })
  }
  
  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filter, search })
  }
  
  const isAllSelected = selectedCount === totalCount && totalCount > 0
  
  return (
    <div className="payment-filters bg-white border border-gray-200 rounded-lg p-4">
      <div className="space-y-4">
        {/* 第一行：搜尋和視圖切換 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* 搜尋框 */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="搜尋房間ID、備註..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filter.search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>
          
          {/* 視圖切換 */}
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 mr-2">視圖:</div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('table')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 002 2z" />
                </svg>
                表格
              </button>
              <button
                onClick={() => onViewModeChange('card')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'card'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                卡片
              </button>
            </div>
          </div>
        </div>
        
        {/* 第二行：狀態和類型過濾 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* 狀態過濾 */}
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 mr-2">狀態:</div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleStatusChange('all')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter.status === 'all'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => handleStatusChange('pending')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                待付款
              </button>
              <button
                onClick={() => handleStatusChange('paid')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter.status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                已付款
              </button>
            </div>
          </div>
          
          {/* 類型過濾 */}
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600 mr-2">類型:</div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleTypeChange('all')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter.type === 'all'
                    ? 'bg-white shadow-sm text-gray-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => handleTypeChange('rent')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter.type === 'rent'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                租金
              </button>
              <button
                onClick={() => handleTypeChange('deposit')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter.type === 'deposit'
                    ? 'bg-purple-100 text-purple-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                押金
              </button>
              <button
                onClick={() => handleTypeChange('electricity')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter.type === 'electricity'
                    ? 'bg-green-100 text-green-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                電費
              </button>
              <button
                onClick={() => handleTypeChange('other')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  filter.type === 'other'
                    ? 'bg-gray-100 text-gray-800'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                其他
              </button>
            </div>
          </div>
        </div>
        
        {/* 第三行：批量操作 */}
        {selectedCount > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  已選擇 {selectedCount} 筆付款
                </span>
              </div>
              <div className="text-sm text-gray-600">
                總金額: ${/* 這裡可以計算選擇的總金額 */}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onBatchConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
              >
                ✅ 批量確認付款
              </button>
              <button
                onClick={() => console.log('批量刪除')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
              >
                🗑️ 批量刪除
              </button>
            </div>
          </div>
        )}
        
        {/* 搜尋和過濾提示 */}
        <div className="text-sm text-gray-500">
          {filter.search && (
            <div className="mb-1">
              搜尋結果: 正在搜尋 "{filter.search}"
            </div>
          )}
          {filter.status !== 'all' && (
            <div className="mb-1">
              狀態篩選: {getStatusLabel(filter.status)}
            </div>
          )}
          {filter.type !== 'all' && (
            <div>
              類型篩選: {getTypeLabel(filter.type)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return '待付款'
    case 'paid': return '已付款'
    default: return '全部'
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'rent': return '租金'
    case 'deposit': return '押金'
    case 'electricity': return '電費'
    case 'other': return '其他'
    default: return '全部'
  }
}