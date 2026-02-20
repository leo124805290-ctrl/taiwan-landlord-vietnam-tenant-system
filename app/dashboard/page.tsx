import { 
  Building, 
  Users, 
  DollarSign, 
  Wrench, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

export default function DashboardPage() {
  const stats = [
    {
      title: '管理房產',
      value: '12',
      change: '+2',
      icon: <Building className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: '越南租客',
      value: '48',
      change: '+5',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: '本月租金',
      value: 'NT$ 240,000',
      change: '+8%',
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: '待處理維修',
      value: '8',
      change: '-3',
      icon: <Wrench className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: 'payment',
      title: '租金已收取',
      description: '王小明繳納 2月租金 NT$15,000',
      time: '2小時前',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    },
    {
      id: 2,
      type: 'maintenance',
      title: '維修申請',
      description: '台北市中山區房產 - 水管漏水報修',
      time: '4小時前',
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    },
    {
      id: 3,
      type: 'tenant',
      title: '新租客入住',
      description: '阮氏芳完成簽約，入住高雄市前金區',
      time: '1天前',
      icon: <Users className="h-5 w-5 text-blue-500" />,
    },
    {
      id: 4,
      type: 'payment',
      title: '租金逾期提醒',
      description: '陳大華 1月租金逾期未繳',
      time: '2天前',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: '租金收取日',
      date: '2026-02-25',
      description: '本月租金收取截止日',
      priority: 'high',
    },
    {
      id: 2,
      title: '租約到期',
      date: '2026-03-10',
      description: '阮文雄租約到期需續約',
      priority: 'medium',
    },
    {
      id: 3,
      title: '房屋檢查',
      date: '2026-03-15',
      description: '台北市大安區房產年度檢查',
      priority: 'low',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* 頁面標題 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">系統儀表板</h1>
        <p className="text-gray-600 mt-2">
          歡迎回來！以下是您的物業管理總覽
        </p>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  {stat.change} 本月
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 近期活動 */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">近期活動</h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mt-1">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {activity.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 即將到來的事件 */}
        <div>
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">即將到來</h2>
              <Calendar className="h-5 w-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{event.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.priority === 'high' 
                        ? 'bg-red-100 text-red-800'
                        : event.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {event.priority === 'high' ? '高' : event.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {event.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 快速操作 */}
          <div className="card mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">快速操作</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="btn-primary py-3">
                新增租客
              </button>
              <button className="btn-secondary py-3">
                記錄收款
              </button>
              <button className="btn-secondary py-3">
                報修處理
              </button>
              <button className="btn-primary py-3">
                產生報表
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 收入趨勢 */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">收入趨勢分析</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">收入圖表將在連接資料庫後顯示</p>
            <p className="text-sm text-gray-500 mt-2">目前顯示示範資料</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">NT$ 240K</div>
            <div className="text-sm text-gray-600">本月收入</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">NT$ 2.8M</div>
            <div className="text-sm text-gray-600">年度收入</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">95%</div>
            <div className="text-sm text-gray-600">收取率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">NT$ 12K</div>
            <div className="text-sm text-gray-600">平均租金</div>
          </div>
        </div>
      </div>
    </div>
  )
}