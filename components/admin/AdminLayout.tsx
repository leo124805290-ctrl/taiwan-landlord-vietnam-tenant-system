import React, { ReactNode, useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Database, 
  Shield, 
  Bell, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Home
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = '管理後台', subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { state, logout } = useApp();
  
  const isAdmin = state.user?.role === 'admin' || state.user?.role === 'super_admin';
  
  // 導航菜單項目
  const navItems = [
    {
      id: 'dashboard',
      label: '儀表板',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/admin',
      roles: ['admin', 'super_admin', 'viewer']
    },
    {
      id: 'users',
      label: '用戶管理',
      icon: <Users className="w-5 h-5" />,
      path: '/admin/users',
      roles: ['admin', 'super_admin']
    },
    {
      id: 'audit',
      label: '登入日誌',
      icon: <Shield className="w-5 h-5" />,
      path: '/admin/audit-logs',
      roles: ['admin', 'super_admin']
    },
    {
      id: 'backup',
      label: '數據備份',
      icon: <Database className="w-5 h-5" />,
      path: '/admin/backup',
      roles: ['admin', 'super_admin']
    },
    {
      id: 'backup-schedules',
      label: '備份排程',
      icon: <ChevronRight className="w-5 h-5" />,
      path: '/admin/backup-schedules',
      roles: ['admin', 'super_admin']
    },
    {
      id: 'settings',
      label: '系統設置',
      icon: <Settings className="w-5 h-5" />,
      path: '/admin/settings',
      roles: ['admin', 'super_admin']
    },
    {
      id: 'notifications',
      label: '通知中心',
      icon: <Bell className="w-5 h-5" />,
      path: '/admin/notifications',
      roles: ['admin', 'super_admin', 'viewer']
    },
    {
      id: 'home',
      label: '返回主系統',
      icon: <Home className="w-5 h-5" />,
      path: '/',
      roles: ['admin', 'super_admin', 'viewer']
    }
  ];
  
  // 過濾當前用戶有權限的菜單
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(state.user?.role || 'viewer')
  );
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移動端菜單按鈕 */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-md hover:bg-gray-100"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>
      
      {/* 側邊欄 - 桌面版 */}
      <aside className={`
        hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 
        bg-gradient-to-b from-gray-900 to-gray-800 text-white
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* 側邊欄頭部 */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">管理後台</h1>
              <p className="text-sm text-gray-400 mt-1">台灣房東系統</p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <ChevronRight className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {/* 用戶信息 */}
          <div className="mt-6 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="font-bold">{state.user?.username?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <div className="ml-3">
                <p className="font-medium">{state.user?.username || '未登入'}</p>
                <p className="text-xs text-gray-400 capitalize">{state.user?.role || 'viewer'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 導航菜單 */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${window.location.pathname === item.path 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-700 text-gray-300'
                    }
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* 側邊欄底部 */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 rounded-lg
                     bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            登出管理後台
          </button>
        </div>
      </aside>
      
      {/* 移動端菜單 */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-gray-900 text-white">
            <div className="p-6 border-b border-gray-700">
              <h1 className="text-xl font-bold">管理後台</h1>
              <p className="text-sm text-gray-400 mt-1">台灣房東系統</p>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                {filteredNavItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-gray-700"
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-3 rounded-lg
                         bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-5 h-5 mr-2" />
                登出
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 主內容區域 */}
      <main className={`
        min-h-screen transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
      `}>
        {/* 頂部導航欄 */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                {subtitle && (
                  <p className="text-gray-600 mt-1">{subtitle}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {/* 通知鈴鐺 */}
                <button className="relative p-2 hover:bg-gray-100 rounded-full">
                  <Bell className="w-6 h-6 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* 用戶菜單 */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden md:block">
                    <p className="font-medium">{state.user?.username}</p>
                    <p className="text-sm text-gray-500 capitalize">{state.user?.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="font-bold text-white">
                      {state.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        {/* 頁面內容 */}
        <div className="p-6">
          {!isAdmin ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center">
                  <Shield className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <h2 className="text-xl font-bold text-yellow-800">權限不足</h2>
                    <p className="text-yellow-700 mt-1">
                      您需要管理員權限才能訪問管理後台。請聯繫系統管理員獲取權限。
                    </p>
                    <button
                      onClick={() => router.push('/')}
                      className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      返回主系統
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;