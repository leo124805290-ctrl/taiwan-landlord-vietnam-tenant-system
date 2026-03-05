'use client'

interface RoomActionsProps {
  onAddRoom: () => void
  onBulkAction: (action: string) => void
  selectedRoomId: string | null
}

export default function RoomActions({
  onAddRoom,
  onBulkAction,
  selectedRoomId
}: RoomActionsProps) {
  // 批量操作選項
  const bulkActions = [
    { id: 'export', label: '匯出資料', icon: '📥' },
    { id: 'print', label: '列印清單', icon: '🖨️' },
    { id: 'maintenance', label: '批量維修', icon: '🔧' },
    { id: 'available', label: '批量恢復', icon: '🔄' },
  ]

  // 快速操作選項
  const quickActions = [
    { id: 'check-in', label: '快速入住', icon: '🏠', color: 'bg-green-100 text-green-700' },
    { id: 'collect-rent', label: '收租提醒', icon: '💰', color: 'bg-blue-100 text-blue-700' },
    { id: 'check-out', label: '退房結算', icon: '🚪', color: 'bg-red-100 text-red-700' },
    { id: 'renew', label: '續約管理', icon: '📅', color: 'bg-purple-100 text-purple-700' },
  ]

  return (
    <div className="room-actions-container">
      {/* 主要操作按鈕 */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {/* 新增房間按鈕 */}
          <button
            onClick={onAddRoom}
            className="btn-primary flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-lg">➕</span>
            <span>新增房間</span>
          </button>

          {/* 批量操作下拉選單 */}
          <div className="relative group">
            <button className="btn-secondary flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <span>📦 批量操作</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className="absolute left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              {bulkActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => onBulkAction(action.id)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 選中房間時的額外操作 */}
          {selectedRoomId && (
            <>
              <button
                onClick={() => onBulkAction('edit-selected')}
                className="btn-secondary flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <span>✏️</span>
                <span>編輯選中</span>
              </button>
              
              <button
                onClick={() => onBulkAction('delete-selected')}
                className="btn-secondary flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <span>🗑️</span>
                <span>刪除選中</span>
              </button>
            </>
          )}
        </div>

        {/* 視圖切換 */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">視圖:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button className="px-3 py-1 rounded-md bg-white shadow-sm text-sm">
              🏠 卡片
            </button>
            <button className="px-3 py-1 rounded-md text-sm text-gray-600 hover:text-gray-800">
              📋 列表
            </button>
            <button className="px-3 py-1 rounded-md text-sm text-gray-600 hover:text-gray-800">
              📊 表格
            </button>
          </div>
        </div>
      </div>

      {/* 快速操作卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => onBulkAction(action.id)}
            className={`quick-action-card p-4 rounded-lg border transition-all hover:shadow-md ${action.color}`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{action.icon}</div>
              <div className="text-left">
                <div className="font-medium">{action.label}</div>
                <div className="text-sm opacity-75">快速處理</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 操作提示 */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">💡</div>
          <div className="flex-1">
            <div className="font-medium text-blue-800 mb-1">操作提示</div>
            <div className="text-sm text-blue-700">
              {selectedRoomId 
                ? '已選擇房間，可以使用編輯、刪除等操作。點擊房間卡片可取消選擇。'
                : '點擊房間卡片可選擇房間，或使用上方的快速操作按鈕。'
              }
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-800 text-sm">
            隱藏提示
          </button>
        </div>
      </div>

      {/* 統計摘要 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-600 mb-1">今日提醒</div>
          <div className="font-medium">3個房間租金到期</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-600 mb-1">本週待辦</div>
          <div className="font-medium">2個房間需要維修</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-600 mb-1">本月統計</div>
          <div className="font-medium">已收租金 $85,000</div>
        </div>
      </div>
    </div>
  )
}

// 樣式定義
const styles = `
.btn-primary {
  font-weight: 500;
}

.btn-secondary {
  font-weight: 500;
}

.quick-action-card {
  cursor: pointer;
}

.room-actions-container {
  background: linear-gradient(to bottom, #ffffff, #f8fafc);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e2e8f0;
}

.group:hover .group-hover\\:visible {
  visibility: visible;
}

.group:hover .group-hover\\:opacity-100 {
  opacity: 1;
}
`