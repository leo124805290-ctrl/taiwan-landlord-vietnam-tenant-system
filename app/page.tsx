import Link from 'next/link'
import { Home, Building, Users, DollarSign, Wrench, BarChart } from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: <Building className="h-8 w-8" />,
      title: '房產管理',
      description: '管理多個房產，記錄詳細資訊和照片',
      link: '/properties',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: '租客管理',
      description: '越南租客資料管理，包含簽證和工作資訊',
      link: '/tenants',
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: '租金管理',
      description: '租金收取記錄、發票和逾期提醒',
      link: '/payments',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: '維修管理',
      description: '報修處理、維修進度和費用記錄',
      link: '/maintenance',
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: '報表分析',
      description: '財務報表、入住率和收入分析',
      link: '/reports',
      color: 'bg-red-100 text-red-600',
    },
    {
      icon: <Home className="h-8 w-8" />,
      title: '儀表板',
      description: '系統總覽和重要指標',
      link: '/dashboard',
      color: 'bg-indigo-100 text-indigo-600',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* 歡迎區塊 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          台灣房東越南租客管理系統
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          專為台灣房東設計的越南租客管理平台，簡化物業管理流程，提升管理效率
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/dashboard"
            className="btn-primary px-8 py-3 text-lg"
          >
            進入儀表板
          </Link>
          <Link
            href="/auth/login"
            className="btn-secondary px-8 py-3 text-lg"
          >
            登入系統
          </Link>
        </div>
      </div>

      {/* 系統特色 */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          系統特色功能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.link}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${feature.color}`}>
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 快速統計 */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          系統統計概覽
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">12</div>
            <div className="text-gray-600">管理房產</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">48</div>
            <div className="text-gray-600">越南租客</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">95%</div>
            <div className="text-gray-600">租金收取率</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">8</div>
            <div className="text-gray-600">待處理維修</div>
          </div>
        </div>
      </div>

      {/* 使用說明 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          開始使用指南
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg">
            <div className="text-blue-600 font-bold text-lg mb-2">1. 新增房產</div>
            <p className="text-gray-600">在房產管理頁面新增您的房產資訊</p>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <div className="text-green-600 font-bold text-lg mb-2">2. 登記租客</div>
            <p className="text-gray-600">為每個房產登記越南租客的基本資料</p>
          </div>
          <div className="bg-white p-6 rounded-lg">
            <div className="text-purple-600 font-bold text-lg mb-2">3. 開始管理</div>
            <p className="text-gray-600">使用系統功能進行租金、維修等管理</p>
          </div>
        </div>
      </div>
    </div>
  )
}