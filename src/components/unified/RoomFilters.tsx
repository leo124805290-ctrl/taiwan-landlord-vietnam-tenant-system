'use client'

import { SimpleRoomStatus, roomStatusDisplayNames } from '~/types/simple'

interface RoomFiltersProps {
  filterStatus: SimpleRoomStatus | 'all'
  onFilterChange: (status: SimpleRoomStatus | 'all') => void
  searchQuery: string
  onSearchChange: (query: string) => void
  stats: {
    total: number
    available: number
    occupied: number
    maintenance: number
    occupancyRate: number
  }
}

export default function RoomFilters({
  filterStatus,
  onFilterChange,
  searchQuery,
  onSearchChange,
  stats
}: RoomFiltersProps) {
  // 過濾器選項
  const filterOptions: Array<{ value: SimpleRoomStatus | 'all', label: string, count?: number }> = [
    { value: 'all', label: '全部房間', count: stats.total },
    { value: 'available', label: roomStatusDisplayNames.available, count: stats.available },
    { value: 'occupied', label: roomStatusDisplayNames.occupied, count: stats.occupied },
    { value: 'maintenance', label: roomStatusDisplayNames.maintenance, count: stats.maintenance },
  ]

  return (
    <div className="room-filters bg-white p-4 rounded-lg border shadow-sm mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* 搜索框 */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="搜尋房間號、租客姓名或電話..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 狀態過濾器 */}
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === option.value
                  ? getFilterButtonStyle(option.value, true)
                  : getFilterButtonStyle(option.value, false)
              }`}
            >
              <span className="flex items-center gap-2">
                {option.label}
                {option.count !== undefined && (
                  <span className={`count-badge px-2 py-0.5 rounded-full text-xs ${
                    filterStatus === option.value ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {option.count}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 高級過濾器（可展開） */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-sm text-gray-600 hover:text-gray-800">
            <span>🔍 高級過濾選項</span>
            <svg className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 租金範圍 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                月租範圍
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="最低"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="最高"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* 樓層過濾 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                樓層
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">所有樓層</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(floor => (
                  <option key={floor} value={floor}>{floor}樓</option>
                ))}
              </select>
            </div>

            {/* 合約狀態 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                合約狀態
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="">全部</option>
                <option value="expiring">即將到期 (&lt;30天)</option>
                <option value="new">新租約 (&lt;7天)</option>
                <option value="long-term">長期合約 (&gt;6個月)</option>
              </select>
            </div>
          </div>

          {/* 過濾器操作按鈕 */}
          <div className="mt-4 flex justify-end gap-2">
            <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
              重置過濾
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              應用過濾
            </button>
          </div>
        </details>
      </div>
    </div>
  )
}

// 獲取過濾按鈕樣式
function getFilterButtonStyle(status: SimpleRoomStatus | 'all', isActive: boolean): string {
  if (isActive) {
    switch (status) {
      case 'all': return 'bg-gray-800 text-white shadow';
      case 'available': return 'bg-green-600 text-white shadow';
      case 'occupied': return 'bg-blue-600 text-white shadow';
      case 'maintenance': return 'bg-orange-600 text-white shadow';
      default: return 'bg-gray-600 text-white shadow';
    }
  } else {
    switch (status) {
      case 'all': return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
      case 'available': return 'bg-green-50 text-green-700 hover:bg-green-100';
      case 'occupied': return 'bg-blue-50 text-blue-700 hover:bg-blue-100';
      case 'maintenance': return 'bg-orange-50 text-orange-700 hover:bg-orange-100';
      default: return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  }
}