import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Wrench, 
  CheckCircle, 
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react'

export default function RoomMaintenanceCleanPage({ params }: { params: { id: string } }) {
  const roomId = params.id
  
  // 模擬房間資料
  const room = {
    code: 'A101',
    name: '溫馨套房'
  }
  
  // 極簡記錄資料
  const records = [
    { id: 1, title: '水管漏水', type: '報修', status: '完成', date: '2/20', cost: 2300 },
    { id: 2, title: '冷氣維修', type: '報修', status: '處理中', date: '2/22', cost: 3500 },
    { id: 3, title: '牆面粉刷', type: '裝修', status: '待處理', date: '2/18', cost: 8000 },
    { id: 4, title: '門鎖更換', type: '報修', status: '完成', date: '2/10', cost: 1500 }
  ]
  
  // 簡單統計
  const total = records.length
  const completed = records.filter(r => r.status === '完成').length
  const totalCost = records.reduce((sum, r) => sum + r.cost, 0)

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* 頁面標頭 */}
      <div className="mb-8">
        <Link
          href={`/rooms/${roomId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          返回房間
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">維修記錄</h1>
            <p className="text-gray-600 mt-1">{room.code} - {room.name}</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            新增
          </button>
        </div>
      </div>

      {/* 搜尋框 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* 快速統計 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-gray-600 text-sm">記錄數</div>
          <div className="text-xl font-bold mt-1">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-gray-600 text-sm">已完成</div>
          <div className="text-xl font-bold text-green-600 mt-1">{completed}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-gray-600 text-sm">總費用</div>
          <div className="text-xl font-bold text-blue-600 mt-1">
            ${totalCost.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 狀態篩選 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg whitespace-nowrap">
          全部
        </button>
        <button className="px-4 py-2 bg-white border rounded-lg text-gray-700 whitespace-nowrap">
          待處理
        </button>
        <button className="px-4 py-2 bg-white border rounded-lg text-gray-700 whitespace-nowrap">
          處理中
        </button>
        <button className="px-4 py-2 bg-white border rounded-lg text-gray-700 whitespace-nowrap">
          已完成
        </button>
        <button className="px-4 py-2 bg-white border rounded-lg text-gray-700 whitespace-nowrap">
          報修
        </button>
        <button className="px-4 py-2 bg-white border rounded-lg text-gray-700 whitespace-nowrap">
          裝修
        </button>
      </div>

      {/* 記錄列表 */}
      <div className="space-y-3">
        {records.map((record) => (
          <div key={record.id} className="bg-white rounded-lg border p-4 hover:border-gray-400">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* 狀態與類型 */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    record.type === '裝修' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {record.type}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    record.status === '完成' ? 'bg-green-100 text-green-700' :
                    record.status === '處理中' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {record.status === '完成' ? (
                      <CheckCircle className="h-3 w-3 inline mr-1" />
                    ) : record.status === '處理中' ? (
                      <Clock className="h-3 w-3 inline mr-1" />
                    ) : null}
                    {record.status}
                  </span>
                </div>
                
                {/* 標題 */}
                <h3 className="font-semibold text-gray-900 mb-1">{record.title}</h3>
                
                {/* 日期與費用 */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {record.date}
                  </div>
                  <div className="flex items-center text-blue-600 font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    ${record.cost.toLocaleString()}
                  </div>
                </div>
              </div>
              
              {/* 操作按鈕 */}
              <div className="ml-4 flex flex-col gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 text-sm hover:bg-gray-50">
                  詳情
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  編輯
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空狀態 */}
      {records.length === 0 && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">沒有維修記錄</h3>
          <p className="text-gray-600 mb-6">開始記錄房間的維修事宜</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            新增記錄
          </button>
        </div>
      )}

      {/* 底部資訊 */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        共 {records.length} 筆記錄
      </div>
    </div>
  )
}