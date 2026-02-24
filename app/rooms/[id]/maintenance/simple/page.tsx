import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Wrench, 
  Hammer, 
  Clock, 
  CheckCircle, 
  Calendar,
  DollarSign,
  User,
  Filter,
  ChevronRight,
  FileText,
  AlertCircle
} from 'lucide-react'

export default function RoomMaintenanceSimplePage({ params }: { params: { id: string } }) {
  const roomId = params.id
  
  // 模擬房間資料
  const room = {
    id: roomId,
    code: 'A101',
    name: '溫馨套房',
  }
  
  // 模擬維修記錄（簡化版）
  const records = [
    {
      id: 1,
      title: '浴室水管漏水',
      type: 'repair',
      status: 'completed',
      date: '2月20日',
      cost: 2300,
      technician: '張師傅'
    },
    {
      id: 2,
      title: '冷氣不冷',
      type: 'repair',
      status: '進行中',
      date: '2月22日',
      estimatedCost: 3500,
      technician: '李師傅'
    },
    {
      id: 3,
      title: '牆面粉刷',
      type: '裝修',
      status: '待處理',
      date: '2月18日',
      estimatedCost: 8000
    },
    {
      id: 4,
      title: '門鎖更換',
      type: 'repair',
      status: 'completed',
      date: '2月10日',
      cost: 1500
    }
  ]
  
  // 計算統計
  const stats = {
    total: records.length,
    completed: records.filter(r => r.status === 'completed').length,
    pending: records.filter(r => r.status === '待處理' || r.status === '進行中').length,
    totalCost: records.reduce((sum, r) => sum + (r.cost || 0), 0)
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 頁面標頭 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/rooms/${roomId}`}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回房間
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {room.code} 維修記錄
            </h1>
            <p className="text-gray-600 mt-1">管理房間的報修與裝修事宜</p>
          </div>
          <button className="btn-primary inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            新增
          </button>
        </div>
      </div>

      {/* 快速統計 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600">總記錄</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600">已完成</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-sm text-gray-600">總費用</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            ${stats.totalCost.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 控制欄 */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* 搜尋 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋維修記錄..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* 篩選按鈕 */}
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Filter className="h-4 w-4 inline mr-2" />
              篩選
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              全部
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              待處理
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              已完成
            </button>
          </div>
        </div>
      </div>

      {/* 記錄列表 */}
      <div className="space-y-4">
        {records.map((record) => (
          <div key={record.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300">
            <div className="p-5">
              {/* 記錄標頭 */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  {/* 類型與狀態 */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      record.type === '裝修' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {record.type === '裝修' ? (
                        <Hammer className="h-3 w-3 mr-1" />
                      ) : (
                        <Wrench className="h-3 w-3 mr-1" />
                      )}
                      {record.type}
                    </span>
                    
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      record.status === 'completed' 
                        ? 'bg-green-100 text-green-700' 
                        : record.status === '進行中'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {record.status === 'completed' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : record.status === '進行中' ? (
                        <Clock className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {record.status}
                    </span>
                  </div>
                  
                  {/* 標題與日期 */}
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{record.title}</h3>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {record.date}
                  </div>
                </div>
                
                {/* 費用 */}
                <div className="text-right">
                  <div className="text-sm text-gray-500">費用</div>
                  <div className={`text-xl font-bold ${
                    record.cost ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    ${(record.cost || record.estimatedCost || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* 詳細資訊 */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                {record.technician && (
                  <div>
                    <div className="text-xs text-gray-500 mb-1">負責師傅</div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">{record.technician}</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="text-xs text-gray-500 mb-1">類型</div>
                  <div className="flex items-center">
                    {record.type === '裝修' ? (
                      <Hammer className="h-4 w-4 text-green-400 mr-2" />
                    ) : (
                      <Wrench className="h-4 w-4 text-blue-400 mr-2" />
                    )}
                    <span className="font-medium">{record.type}</span>
                  </div>
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  詳情
                </button>
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  編輯
                </button>
                {record.status !== 'completed' && (
                  <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    完成
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空狀態 */}
      {records.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">尚無維修記錄</h3>
          <p className="text-gray-600 mb-6">開始為這個房間新增第一筆維修記錄</p>
          <button className="btn-primary inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            新增記錄
          </button>
        </div>
      )}

      {/* 底部資訊 */}
      {records.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          顯示 {records.length} 筆記錄
        </div>
      )}
    </div>
  )
}