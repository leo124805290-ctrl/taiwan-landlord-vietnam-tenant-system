import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Filter, 
  Wrench, 
  Hammer, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  DollarSign,
  User,
  Home,
  ChevronRight,
  FileText,
  Download
} from 'lucide-react'

export default function RoomMaintenancePage({ params }: { params: { id: string } }) {
  const roomId = params.id
  
  // 模擬房間資料
  const room = {
    id: roomId,
    code: 'A101',
    name: '溫馨套房',
    type: 'suite',
    status: 'occupied',
    
    tenant: {
      id: 't001',
      name: '王小明',
      phone: '0912-345-678',
    },
  }
  
  // 模擬維修記錄資料
  const maintenanceRecords = [
    {
      id: 1,
      title: '浴室水管漏水',
      description: '浴室洗手台下方水管漏水，造成地板積水',
      type: 'repair',
      status: 'completed',
      date: '2026-02-20',
      cost: 2500,
      actualCost: 2300,
      technician: '張師傅',
      completionDate: '2026-02-21',
      urgency: 'normal',
      paymentStatus: 'paid',
      invoiceNumber: 'INV-2026-001',
      images: ['photo1.jpg', 'photo2.jpg']
    },
    {
      id: 2,
      title: '冷氣不冷',
      description: '房間冷氣出風口有風但不冷，需要檢查冷媒',
      type: 'repair',
      status: 'in-progress',
      date: '2026-02-22',
      estimatedCost: 3500,
      technician: '李師傅',
      estimatedCompletion: '2026-02-25',
      urgency: 'urgent',
      notes: '租客反映晚上無法睡覺'
    },
    {
      id: 3,
      title: '牆面粉刷更新',
      description: '房間牆面有污漬和刮痕，需要重新粉刷',
      type: 'renovation',
      status: 'pending',
      date: '2026-02-18',
      estimatedCost: 8000,
      urgency: 'normal',
      notes: '等租客下個月出差時進行'
    },
    {
      id: 4,
      title: '門鎖更換',
      description: '大門鎖頭卡頓，需要更換新鎖',
      type: 'repair',
      status: 'completed',
      date: '2026-02-10',
      cost: 1800,
      actualCost: 1500,
      technician: '王師傅',
      completionDate: '2026-02-10',
      paymentStatus: 'paid',
      invoiceNumber: 'INV-2026-002'
    },
    {
      id: 5,
      title: '燈具更換',
      description: '房間主燈閃爍，需要更換LED燈具',
      type: 'repair',
      status: 'assigned',
      date: '2026-02-23',
      estimatedCost: 1200,
      technician: '陳師傅',
      estimatedCompletion: '2026-02-24',
      urgency: 'normal'
    }
  ]
  
  // 計算統計
  const stats = {
    total: maintenanceRecords.length,
    completed: maintenanceRecords.filter(r => r.status === 'completed').length,
    pending: maintenanceRecords.filter(r => r.status === 'pending' || r.status === 'assigned').length,
    inProgress: maintenanceRecords.filter(r => r.status === 'in-progress').length,
    totalCost: maintenanceRecords.reduce((sum, r) => sum + (r.actualCost || r.cost || 0), 0),
    estimatedCost: maintenanceRecords.reduce((sum, r) => sum + (r.estimatedCost || 0), 0)
  }
  
  // 狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'assigned': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }
  
  // 狀態文字
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待處理'
      case 'assigned': return '已指派'
      case 'in-progress': return '進行中'
      case 'completed': return '已完成'
      default: return status
    }
  }
  
  // 類型顏色
  const getTypeColor = (type: string) => {
    return type === 'renovation' 
      ? 'bg-green-100 text-green-800 border-green-300' 
      : 'bg-blue-100 text-blue-800 border-blue-300'
  }
  
  // 類型文字
  const getTypeText = (type: string) => {
    return type === 'renovation' ? '裝修' : '報修'
  }
  
  // 緊急程度顏色
  const getUrgencyColor = (urgency: string) => {
    return urgency === 'urgent' 
      ? 'bg-red-100 text-red-800 border-red-300' 
      : 'bg-gray-100 text-gray-800 border-gray-300'
  }
  
  // 格式化金額
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0
    }).format(amount)
  }
  
  // 標籤頁
  const tabs = [
    { id: 'overview', label: '房間概覽', href: `/rooms/${roomId}` },
    { id: 'tenant', label: '租客資訊', href: `/rooms/${roomId}/tenant` },
    { id: 'contract', label: '合約管理', href: `/rooms/${roomId}/contract` },
    { id: 'financial', label: '財務設定', href: `/rooms/${roomId}/financial` },
    { id: 'maintenance', label: '維修記錄', href: `/rooms/${roomId}/maintenance` },
    { id: 'settings', label: '房間設定', href: `/rooms/${roomId}/settings` },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* 導航與標題 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/rooms/${roomId}`}
              className="btn-outline inline-flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回房間
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {room.code} - {room.name}
              </h1>
              <p className="text-gray-600 mt-1">維修與裝修記錄管理</p>
            </div>
          </div>
          <button className="btn-primary inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            新增記錄
          </button>
        </div>
      </div>

      {/* 標籤頁 */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`inline-flex items-center py-4 px-1 border-b-2 text-sm font-medium ${
                  tab.id === 'maintenance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.id === 'overview' && <Home className="h-4 w-4 mr-2" />}
                {tab.id === 'tenant' && <User className="h-4 w-4 mr-2" />}
                {tab.id === 'contract' && <FileText className="h-4 w-4 mr-2" />}
                {tab.id === 'financial' && <DollarSign className="h-4 w-4 mr-2" />}
                {tab.id === 'maintenance' && <Wrench className="h-4 w-4 mr-2" />}
                {tab.id === 'settings' && <AlertCircle className="h-4 w-4 mr-2" />}
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 左側：統計與篩選 */}
        <div className="lg:col-span-1 space-y-6">
          {/* 快速統計 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">統計概覽</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">總記錄數</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">已完成</p>
                  <p className="text-xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">待處理</p>
                  <p className="text-xl font-bold text-orange-600">{stats.pending}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">總費用</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(stats.totalCost)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  預計費用: {formatCurrency(stats.estimatedCost)}
                </p>
              </div>
            </div>
          </div>

          {/* 篩選器 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">篩選條件</h2>
            <div className="space-y-4">
              {/* 搜尋 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  搜尋記錄
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="輸入關鍵字..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              {/* 狀態篩選 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  狀態
                </label>
                <div className="space-y-2">
                  {['all', 'pending', 'assigned', 'in-progress', 'completed'].map((status) => (
                    <button
                      key={status}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          {status === 'all' ? '全部狀態' : getStatusText(status)}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 類型篩選 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  類型
                </label>
                <div className="space-y-2">
                  {['all', 'repair', 'renovation'].map((type) => (
                    <button
                      key={type}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          {type === 'all' ? '全部類型' : 
                           type === 'repair' ? '報修' : '裝修'}
                        </span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* 時間篩選 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  時間範圍
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="all">全部時間</option>
                  <option value="month">本月</option>
                  <option value="quarter">本季</option>
                  <option value="year">今年</option>
                  <option value="custom">自訂範圍</option>
                </select>
              </div>
            </div>
          </div>

          {/* 快速操作 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
            <div className="space-y-3">
              <button className="w-full btn-primary inline-flex items-center justify-center">
                <Plus className="h-4 w-4 mr-2" />
                新增報修
              </button>
              <button className="w-full btn-outline inline-flex items-center justify-center">
                <Hammer className="h-4 w-4 mr-2" />
                新增裝修
              </button>
              <button className="w-full btn-outline inline-flex items-center justify-center">
                <Download className="h-4 w-4 mr-2" />
                匯出記錄
              </button>
            </div>
          </div>
        </div>

        {/* 右側：記錄列表 */}
        <div className="lg:col-span-3">
          {/* 列表標頭 */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">維修記錄</h2>
                <p className="text-gray-600 mt-1">
                  房間 {room.code} 的所有報修與裝修記錄
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Filter className="h-5 w-5 text-gray-600" />
                </button>
                <div className="text-sm text-gray-500">
                  共 {maintenanceRecords.length} 筆記錄
                </div>
              </div>
            </div>

            {/* 記錄列表 */}
            <div className="space-y-4">
              {maintenanceRecords.map((record) => (
                <div key={record.id} className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="p-5">
                    {/* 標頭 */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                            {record.type === 'renovation' ? (
                              <Hammer className="h-3 w-3 mr-1" />
                            ) : (
                              <Wrench className="h-3 w-3 mr-1" />
                            )}
                            {getTypeText(record.type)}
                          </span>
                          
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status === 'completed' ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : record.status === 'in-progress' ? (
                              <Clock className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {getStatusText(record.status)}
                          </span>
                          
                          {record.urgency === 'urgent' && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(record.urgency)}`}>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              緊急
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 text-lg">{record.title}</h3>
                        <p className="text-gray-600 mt-1">{record.description}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {record.date}
                        </div>
                        {(record.actualCost || record.estimatedCost) && (
                          <div className={`text-lg font-bold ${
                            record.actualCost ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(record.actualCost || record.estimatedCost || 0)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 詳細資訊 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                      {/* 左側資訊 */}
                      <div className="space-y-3">
                        {record.technician && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-xs text-gray-500">負責師傅</div>
                              <div className="text-sm font-medium">{record.technician}</div>
                            </div>
                          </div>
                        )}
                        
                        {record.estimatedCompletion && (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-xs text-gray-500">預計完成</div>
                              <div className="text-sm font-medium">{record.estimatedCompletion}</div>
                            </div>
                          </div>
                        )}
                        
                        {record.completionDate && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-xs text-gray-500">實際完成</div>
                              <div className="text-sm font-medium">{record.completionDate}</div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* 右側資訊 */}
                      <div className="space-y-3">
                        {record.paymentStatus && (
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-xs text-gray-500">付款狀態</div>
                              <div className={`text-sm font-medium ${
                                record.paymentStatus === 'paid' ? 'text-green-600' :
                                record.paymentStatus === 'partial' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {record.paymentStatus === 'paid' ? '已付款' :
                                 record.paymentStatus === 'partial' ? '部分付款' : '未付款'}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {record.invoiceNumber && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-xs text-gray-500">發票號碼</div>
                              <div className="text-sm font-medium">{record.invoiceNumber}</div>
                            </div>
                          </div>
                        )}
                        
                        {record.notes && (
                          <div>
                            <div className="text-xs text-gray-500 mb-1">備註</div>
                            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {record.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                        查看詳情
                      </button>
                      <button className="flex-1 px-3 py-2 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50">
                        編輯記錄
                      </button>
                      {record.status !== 'completed' && (
                        <button className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                          標記完成
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 空狀態 */}
            {maintenanceRecords.length === 0 && (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">尚無維修記錄</h3>
                <p className="text-gray-600 mb-6">此房間目前沒有任何報修或裝修記錄</p>
                <button className="btn-primary inline-flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  新增第一筆記錄
                </button>
              </div>
            )}

            {/* 分頁 */}
            {maintenanceRecords.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  顯示 1-{maintenanceRecords.length} 筆，共 {maintenanceRecords.length} 筆
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                    上一頁
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                    下一頁
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 費用統計 */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">費用統計</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">總維修費用</div>
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(stats.totalCost)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {maintenanceRecords.filter(r => r.type === 'repair').length} 筆報修
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">總裝修預算</div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(stats.estimatedCost)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {maintenanceRecords.filter(r => r.type === 'renovation').length} 筆裝修
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">平均費用</div>
                <div className="text-2xl font-bold text-purple-700">
                  {formatCurrency(stats.totalCost / Math.max(stats.total, 1))}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  每筆記錄平均
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}