import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Shield, 
  Database, 
  Settings, 
  Bell, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
// import api from '@/lib/api'; // 暫時註釋，使用模擬數據

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  todayLogins: number;
  failedLogins: number;
  totalProperties: number;
  totalRooms: number;
  totalPayments: number;
  systemUptime: string;
  databaseSize: string;
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

const AdminDashboard: React.FC = () => {
  const { state } = useApp();
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    todayLogins: 0,
    failedLogins: 0,
    totalProperties: 0,
    totalRooms: 0,
    totalPayments: 0,
    systemUptime: '0天',
    databaseSize: '0 MB'
  });
  
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    { id: 1, user: 'admin', action: '登入成功', time: '5分鐘前', status: 'success' },
    { id: 2, user: 'user1', action: '嘗試登入失敗', time: '15分鐘前', status: 'warning' },
    { id: 3, user: 'super_admin', action: '更新系統設置', time: '30分鐘前', status: 'success' },
    { id: 4, user: 'user2', action: '創建新物業', time: '1小時前', status: 'success' },
    { id: 5, user: 'admin', action: '備份數據庫', time: '2小時前', status: 'success' }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 這裡可以調用後端 API 獲取真實數據
      // 暫時使用模擬數據
      const mockStats: SystemStats = {
        totalUsers: 12,
        activeUsers: 10,
        adminUsers: 3,
        todayLogins: 24,
        failedLogins: 2,
        totalProperties: 2,
        totalRooms: 21,
        totalPayments: 156,
        systemUptime: '15天 8小時',
        databaseSize: '45.2 MB'
      };
      
      setStats(mockStats);
      setError(null);
    } catch (err) {
      console.error('獲取儀表板數據失敗:', err);
      setError('無法載入儀表板數據');
    } finally {
      setLoading(false);
    }
  };
  
  const statCards = [
    {
      title: '總用戶數',
      value: stats.totalUsers.toString(),
      icon: <Users className="w-6 h-6" />,
      change: '+2',
      trend: 'up' as const,
      color: 'bg-blue-500'
    },
    {
      title: '活躍用戶',
      value: stats.activeUsers.toString(),
      icon: <Activity className="w-6 h-6" />,
      change: '+1',
      trend: 'up' as const,
      color: 'bg-green-500'
    },
    {
      title: '管理員用戶',
      value: stats.adminUsers.toString(),
      icon: <Shield className="w-6 h-6" />,
      change: '0',
      trend: 'stable' as const,
      color: 'bg-purple-500'
    },
    {
      title: '今日登入',
      value: stats.todayLogins.toString(),
      icon: <Clock className="w-6 h-6" />,
      change: '+5',
      trend: 'up' as const,
      color: 'bg-orange-500'
    },
    {
      title: '失敗登入',
      value: stats.failedLogins.toString(),
      icon: <AlertCircle className="w-6 h-6" />,
      change: '-1',
      trend: 'down' as const,
      color: 'bg-red-500'
    },
    {
      title: '數據庫大小',
      value: stats.databaseSize,
      icon: <Database className="w-6 h-6" />,
      change: '+2.1 MB',
      trend: 'up' as const,
      color: 'bg-indigo-500'
    }
  ];
  
  const quickActions = [
    {
      title: '管理用戶',
      description: '查看和編輯用戶帳號',
      icon: <Users className="w-8 h-8" />,
      path: '/admin/users',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: '查看日誌',
      description: '審計登入和操作記錄',
      icon: <Shield className="w-8 h-8" />,
      path: '/admin/audit-logs',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: '數據備份',
      description: '創建和恢復備份',
      icon: <Database className="w-8 h-8" />,
      path: '/admin/backup',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: '系統設置',
      description: '配置系統參數',
      icon: <Settings className="w-8 h-8" />,
      path: '/admin/settings',
      color: 'bg-orange-100 text-orange-600'
    }
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入儀表板數據中...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
          <div>
            <h2 className="text-xl font-bold text-red-800">載入失敗</h2>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              重試
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 歡迎標題 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">歡迎回來，{state.user?.username}！</h1>
        <p className="mt-2 opacity-90">
          系統運行正常，所有服務都在線。上次檢查時間：{new Date().toLocaleString('zh-TW')}
        </p>
      </div>
      
      {/* 統計卡片網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
                <div className="flex items-center mt-2">
                  {card.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
                  {card.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
                  <span className={`text-sm ${card.trend === 'up' ? 'text-green-600' : card.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {card.change} {card.trend === 'up' ? '增加' : card.trend === 'down' ? '減少' : '持平'}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${card.color} text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 快速操作 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">快速操作</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  onClick={() => window.location.href = action.path}
                >
                  <div className={`p-3 rounded-full ${action.color} mr-4`}>
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-gray-800">{action.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* 系統信息 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">系統信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">系統運行時間</span>
                  <span className="font-medium">{stats.systemUptime}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">總物業數</span>
                  <span className="font-medium">{stats.totalProperties}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">總房間數</span>
                  <span className="font-medium">{stats.totalRooms}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">總付款記錄</span>
                  <span className="font-medium">{stats.totalPayments}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">用戶角色</span>
                  <span className="font-medium capitalize">{state.user?.role}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">最後登入</span>
                  <span className="font-medium">剛剛</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 最近活動 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">最近活動</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              查看全部
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start">
                <div className={`mr-3 mt-1 ${
                  activity.status === 'success' ? 'text-green-500' :
                  activity.status === 'warning' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {activity.status === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.action}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* 系統狀態 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-bold text-gray-800 mb-3">系統狀態</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API 服務</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">資料庫</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  已連接
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">認證服務</span>
                <span className="flex items-center text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  正常
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;