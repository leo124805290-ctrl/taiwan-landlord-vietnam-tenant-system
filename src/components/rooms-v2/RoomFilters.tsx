'use client'

interface RoomFiltersProps {
  filter: {
    status: 'all' | 'available' | 'occupied' | 'maintenance'
    search: string
  }
  onFilterChange: (filter: {
    status: 'all' | 'available' | 'occupied' | 'maintenance'
    search: string
  }) => void
  viewMode: 'table' | 'card'
  onViewModeChange: (mode: 'table' | 'card') => void
}

export default function RoomFilters({
  filter,
  onFilterChange,
  viewMode,
  onViewModeChange
}: RoomFiltersProps) {
  const handleStatusChange = (status: 'all' | 'available' | 'occupied' | 'maintenance') => {
    onFilterChange({ ...filter, status })
  }
  
  const handleSearchChange = (search: string) => {
    onFilterChange({ ...filter, search })
  }
  
  return (
    <div className="room-filters bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* 左側：搜尋框 */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="搜尋房號、租客姓名..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filter.search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>
        
        {/* 中間：狀態過濾器 */}
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
              onClick={() => handleStatusChange('available')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter.status === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              空房
            </button>
            <button
              onClick={() => handleStatusChange('occupied')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter.status === 'occupied'
                  ? 'bg-blue-100 text-blue-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              已出租
            </button>
            <button
              onClick={() => handleStatusChange('maintenance')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter.status === 'maintenance'
                  ? 'bg-orange-100 text-orange-800'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              維修中
            </button>
          </div>
        </div>
        
        {/* 右側：視圖切換 */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
      
      {/* 搜尋提示 */}
      {filter.search && (
        <div className="mt-3 text-sm text-gray-500">
          搜尋結果: 正在搜尋 "{filter.search}"
        </div>
      )}
      
      {/* 狀態提示 */}
      {filter.status !== 'all' && (
        <div className="mt-2 text-sm text-gray-500">
          篩選狀態: {getStatusLabel(filter.status)}
        </div>
      )}
    </div>
  )
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'available': return '空房可出租'
    case 'occupied': return '已出租入住中'
    case 'maintenance': return '維修中'
    default: return '全部'
  }
}