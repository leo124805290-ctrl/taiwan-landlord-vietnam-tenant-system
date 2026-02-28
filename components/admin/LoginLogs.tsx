import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  Shield, 
  FileText, 
  Download,
  Filter,
  Calendar,
  User,
  Search,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Eye,
  Loader,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface LoginLog {
  id: number;
  user_id?: number;
  username: string;
  user_username?: string;
  user_role?: string;
  action: 'login' | 'logout' | 'login_failed';
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

interface OperationLog {
  id: number;
  user_id?: number;
  username?: string;
  role?: string;
  email?: string;
  action_type: string;
  resource_type: string;
  resource_id?: number;
  details?: any;
  created_at: string;
}

interface LoginStats {
  total_logs: number;
  successful_logins: number;
  failed_logins: number;
  logouts: number;
  login_failures: number;
  unique_users: number;
  unique_ips: number;
  first_login?: string;
  last_login?: string;
  recent: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
  };
}

interface OperationStats {
  total_operations: number;
  active_users: number;
  unique_action_types: number;
  unique_resource_types: number;
  first_operation?: string;
  last_operation?: string;
  action_types: Array<{
    action_type: string;
    count: number;
    users: number;
    first_time: string;
    last_time: string;
  }>;
}

const LoginLogs: React.FC = () => {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'operation'>('login');
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
  const [loginStats, setLoginStats] = useState<LoginStats>({
    total_logs: 0,
    successful_logins: 0,
    failed_logins: 0,
    logouts: 0,
    login_failures: 0,
    unique_users: 0,
    unique_ips: 0,
    recent: {
      last_24h: 0,
      last_7d: 0,
      last_30d: 0
    }
  });
  const [operationStats, setOperationStats] = useState<OperationStats>({
    total_operations: 0,
    active_users: 0,
    unique_action_types: 0,
    unique_resource_types: 0,
    action_types: []
  });
  
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 篩選狀態
  const [showFilters, setShowFilters] = useState(false);
  const [usernameFilter, setUsernameFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [successFilter, setSuccessFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // 詳細信息狀態
  const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
  
  // 模擬登入日誌數據
  const mockLoginLogs: LoginLog[] = [
    {
      id: 1,
      user_id: 1,
      username: 'super_admin',
      user_username: 'super_admin',
      user_role: 'super_admin',
      action: 'login',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true,
      created_at: '2026-02-28T09:30:00Z'
    },
    {
      id: 2,
      user_id: 2,
      username: 'admin',
      user_username: 'admin',
      user_role: 'admin',
      action: 'login',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      success: true,
      created_at: '2026-02-28T09:15:00Z'
    },
    {
      id: 3,
      username: 'unknown',
      action: 'login_failed',
      ip_address: '203.0.113.50',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: false,
      error_message: '無效的用戶名或密碼',
      created_at: '2026-02-28T09:10:00Z'
    },
    {
      id: 4,
      user_id: 1,
      username: 'super_admin',
      user_username: 'super_admin',
      user_role: 'super_admin',
      action: 'logout',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true,
      created_at: '2026-02-28T08:45:00Z'
    },
    {
      id: 5,
      user_id: 3,
      username: 'viewer',
      user_username: 'viewer',
      user_role: 'viewer',
      action: 'login',
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      success: true,
      created_at: '2026-02-28T08:30:00Z'
    },
    {
      id: 6,
      username: 'test_user',
      action: 'login',
      ip_address: '198.51.100.25',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: false,
      error_message: '帳號已停用',
      created_at: '2026-02-27T22:15:00Z'
    },
    {
      id: 7,
      user_id: 2,
      username: 'admin',
      user_username: 'admin',
      user_role: 'admin',
      action: 'login',
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      success: true,
      created_at: '2026-02-27T15:45:00Z'
    },
    {
      id: 8,
      user_id: 1,
      username: 'super_admin',
      user_username: 'super_admin',
      user_role: 'super_admin',
      action: 'login',
      ip_address: '203.0.113.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      success: true,
      created_at: '2026-02-27T10:20:00Z'
    }
  ];
  
  // 模擬操作日誌數據
  const mockOperationLogs: OperationLog[] = [
    {
      id: 1,
      user_id: 1,
      username: 'super_admin',
      role: 'super_admin',
      email: 'super@example.com',
      action_type: 'create',
      resource_type: 'user',
      resource_id: 3,
      details: { username: 'viewer', role: 'viewer' },
      created_at: '2026-02-28T09:25:00Z'
    },
    {
      id: 2,
      user_id: 2,
      username: 'admin',
      role: 'admin',
      email: 'admin@example.com',
      action_type: 'update',
      resource_type: 'settings',
      resource_id: 5,
      details: { key: 'system_name', old_value: '舊系統', new_value: '台灣房東系統' },
      created_at: '2026-02-28T09:20:00Z'
    },
    {
      id: 3,
      user_id: 1,
      username: 'super_admin',
      role: 'super_admin',
      email: 'super@example.com',
      action_type: 'create',
      resource_type: 'backup',
      resource_id: 1,
      details: { name: '系統完整備份', type: 'manual' },
      created_at: '2026-02-28T09:15:00Z'
    },
    {
      id: 4,
      user_id: 2,
      username: 'admin',
      role: 'admin',
      email: 'admin@example.com',
      action_type: 'delete',
      resource_type: 'user',
      resource_id: 4,
      details: { username: 'temp_user', reason: '測試帳號清理' },
      created_at: '2026-02-28T09:10:00Z'
    },
    {
      id: 5,
      user_id: 3,
      username: 'viewer',
      role: 'viewer',
      email: 'viewer@example.com',
      action_type: 'view',
      resource_type: 'property',
      resource_id: 1,
      details: { property_name: '台北公寓' },
      created_at: '2026-02-28T09:05:00Z'
    },
    {
      id: 6,
      user_id: 1,
      username: 'super_admin',
      role: 'super_admin',
      email: 'super@example.com',
      action_type: 'export',
      resource_type: 'logs',
      details: { log_type: 'login', format: 'csv', record_count: 8 },
      created_at: '2026-02-28T08:55:00Z'
    },
    {
      id: 7,
      user_id: 2,
      username: 'admin',
      role: 'admin',
      email: 'admin@example.com',
      action_type: 'update',
      resource_type: 'room',
      resource_id: 12,
      details: { room_number: '101', status: 'occupied', tenant_name: '張先生' },
      created_at: '2026-02-28T08:45:00Z'
    },
    {
      id: 8,
      user_id: 1,
      username: 'super_admin',
      role: 'super_admin',
      email: 'super@example.com',
      action_type: 'restore',
      resource_type: 'backup',
      resource_id: 2,
      details: { backup_name: '每日自動備份' },
      created_at: '2026-02-28T08:30:00Z'
    }
  ];
  
  const mockLoginStats: LoginStats = {
    total_logs: 8,
    successful_logins: 5,
    failed_logins: 2,
    logouts: 1,
    login_failures: 1,
    unique_users: 3,
    unique_ips: 5,
    first_login: '2026-02-27T10:20:00Z',
    last_login: '2026-02-28T09:30:00Z',
    recent: {
      last_24h: 8,
      last_7d: 8,
      last_30d: 8
    }
  };
  
  const mockOperationStats: OperationStats = {
    total_operations: 8,
    active_users: 3,
    unique_action_types: 6,
    unique_resource_types: 5,
    first_operation: '2026-02-28T08:30:00Z',
    last_operation: '2026-02-28T09:25:00Z',
    action_types: [
      { action_type: 'create', count: 2, users: 2, first_time: '2026-02-28T09:15:00Z', last_time: '2026-02-28T09:25:00Z' },
      { action_type: 'update', count: 2, users: 2, first_time: '2026-02-28T08:45:00Z', last_time: '2026-02-28T09:20:00Z' },
      { action_type: 'delete', count: 1, users: 1, first_time: '2026-02-28T09:10:00Z', last_time: '2026-02-28T09:10:00Z' },
      { action_type: 'view', count: 1, users: 1, first_time: '2026-02-28T09:05:00Z', last_time: '2026-02-28T09:05:00Z' },
      { action_type: 'export', count: 1, users: 1, first_time: '2026-02-28T08:55:00Z', last_time: '2026-02-28T08:55:00Z' },
      { action_type: 'restore', count: 1, users: 1, first_time: '2026-02-28T08:30:00Z', last_time: '2026-02-28T08:30:00Z' }
    ]
  };
  
  useEffect(() => {
    fetchLogs();
  }, [activeTab]);
  
  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 這裡應該調用後端 API
      // const response = await fetch(`/api/logs/${activeTab}`);
      // const data = await response.json();
      
      // 暫時使用模擬數據
      setTimeout(() => {
        if (activeTab === 'login') {
          setLoginLogs(mockLoginLogs);
          setLoginStats(mockLoginStats);
        } else {
          setOperationLogs(mockOperationLogs);
          setOperationStats(mockOperationStats);
        }
        setLoading(false);
      }, 500);
      
    } catch (err) {
      console.error('獲取日誌失敗:', err);
      setError('無法載入日誌數據');
      setLoading(false);
    }
  };
  
  const handleExportLogs = async (format: 'json' | 'csv') => {
    try {
      setExporting(true);
      setError(null);
      
      // 這裡應該調用後端 API
      // const response = await fetch(`/api/logs/export?type=${activeTab}&format=${format}`);
      
      // 模擬導出成功
      setTimeout(() => {
        setSuccess(`${format.toUpperCase()} 格式導出請求已提交`);
        setExporting(false);
        
        // 3秒後清除成功訊息
        setTimeout(() => setSuccess(null), 3000);
      }, 1000);
      
    } catch (err) {
      console.error('導出日誌失敗:', err);
      setError('導出日誌失敗，請重試');
      setExporting(false);
    }
  };
  
  const handleCleanupLogs = async () => {
    if (!window.confirm('確定要清理90天前的舊日誌嗎？此操作無法撤銷。')) {
      return;
    }
    
    try {
      setCleaning(true);
      setError(null);
      
      // 這裡應該調用後端 API
      // const response = await fetch('/api/logs/cleanup', { method: 'DELETE' });
      
      // 模擬清理成功
      setTimeout(() => {
        setSuccess('舊日誌清理完成');
        setCleaning(false);
        
        // 刷新日誌列表
        fetchLogs();
        
        // 3秒後清除成功訊息
        setTimeout(() => setSuccess(null), 3000);
      }, 1500);
      
    } catch (err) {
      console.error('清理日誌失敗:', err);
      setError('清理日誌失敗，請重試');
      setCleaning(false);
    }
  };
  
  const toggleLogExpansion = (logId: number) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW');
  };
  
  // 格式化時間差
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins}分鐘前`;
    if (diffHours < 24) return `${diffHours}小時前`;
    return `${diffDays}天前`;
  };
  
  // 獲取動作信息
  const getActionInfo = (action: string, success?: boolean) => {
    switch (action) {
      case 'login':
        return success 
          ? { text: '登入成功', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" /> }
          : { text: '登入失敗', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle className="w-4 h-4" /> };
      case 'logout':
        return { text: '登出', color: 'text-blue-600', bg: 'bg-blue-100', icon: <LogOut className="w-4 h-4" /> };
      case 'login_failed':
        return { text: '登入嘗試失敗', color: 'text-orange-600', bg: 'bg-orange-100', icon: <AlertCircle className="w-4 h-4" /> };
      default:
        return { text: action, color: 'text-gray-600', bg: 'bg-gray-100', icon: <Clock className="w-4 h-4" /> };
    }
  };
  
  // 獲取操作類型信息
  const getOperationActionInfo = (actionType: string) => {
    const colors: Record<string, { text: string, color: string, bg: string }> = {
      'create': { text: '創建', color: 'text-green-600', bg: 'bg-green-100' },
      'update': { text: '更新', color: 'text-blue-600', bg: 'bg-blue-100' },
      'delete': { text: '刪除', color: 'text-red-600', bg: 'bg-red-100' },
      'view': { text: '查看', color: 'text-gray-600', bg: 'bg-gray-100' },
      'export': { text: '導出', color: 'text-purple-600', bg: 'bg-purple-100' },
      'restore': { text: '恢復', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      'login': { text: '登入', color: 'text-green-600', bg: 'bg-green-100' },
      'logout': { text: '登出', color: 'text-blue-600', bg: 'bg-blue-100' }
    };
    
    return colors[actionType] || { text: actionType, color: 'text-gray-600', bg: 'bg-gray-100' };
  };
  
  // 獲取資源類型信息
  const getResourceTypeInfo = (resourceType: string) => {
    const icons: Record<string, string> = {
      'user': '👤',
      'settings': '⚙️',
      'backup': '💾',
      'property': '🏠',
      'room': '🚪',
      'logs': '📋',
      'payment': '💰'
    };
    
    return icons[resourceType] || '📄';
  };
  
  // 登入統計卡片
  const loginStatCards = [
    {
      title: '總登入次數',
      value: loginStats.total_logs.toString(),
      icon: <LogIn className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: '所有登入記錄'
    },
    {
      title: '成功登入',
      value: loginStats.successful_logins.toString(),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      description: '成功登入次數'
    },
    {
      title: '失敗登入',
      value: loginStats.failed_logins.toString(),
      icon: <XCircle className="w-6 h-6" />,
      color: 'bg-red-500',
      description: '登入失敗次數'
    },
    {
      title: '活躍用戶',
      value: loginStats.unique_users.toString(),
      icon: <User className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: '唯一登入用戶數'
    }
  ];
  
  // 操作統計卡片
  const operationStatCards = [
    {
      title: '總操作數',
      value: operationStats.total_operations.toString(),
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: '所有操作記錄'
    },
    {
      title: '活躍用戶',
      value: operationStats.active_users.toString(),
      icon: <User className="w-6 h-6" />,
      color: 'bg-green-500',
      description: '執行操作用戶數'
    },
    {
      title: '操作類型',
      value: operationStats.unique_action_types.toString(),
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: '不同操作類型數'
    },
    {
      title: '資源類型',
      value: operationStats.unique_resource_types.toString(),
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-orange-500',
      description: '不同資源類型數'
    }
  ];
  
  // 過濾日誌
  const filteredLoginLogs = loginLogs.filter(log => {
    if (usernameFilter && !log.username.toLowerCase().includes(usernameFilter.toLowerCase())) {
      return false;
    }
    if (actionFilter && log.action !== actionFilter) {
      return false;
    }
    if (successFilter && log.success.toString() !== successFilter) {
      return false;
    }
    if (startDate && new Date(log.created_at) < new Date(startDate)) {
      return false;
    }
    if (endDate && new Date(log.created_at) > new Date(endDate)) {
      return false;
    }
    return true;
  });
  
  const filteredOperationLogs = operationLogs.filter(log => {
    // 這裡可以添加操作日誌的過濾邏輯
    return true;
  });
  
  // 分頁計算
  const currentLogs = activeTab === 'login' ? filteredLoginLogs : filteredOperationLogs;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = currentLogs.slice(startIndex, endIndex);
  const totalPages = Math.ceil(currentLogs.length / itemsPerPage);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入日誌數據中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 標題和操作按鈕 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">系統日誌</h1>
          <p className="text-gray-600 mt-1">查看和管理系統登入及操作記錄</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" />
            {showFilters ? '隱藏篩選' : '顯示篩選'}
          </button>
          
          <button
            onClick={fetchLogs}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            刷新
          </button>
        </div>
      </div>
      
      {/* 成功/錯誤訊息 */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}
      
      {/* 標籤切換 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('login')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'login'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <LogIn className="w-4 h-4 mr-2" />
              登入日誌
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {loginStats.total_logs}
              </span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('operation')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'operation'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              操作日誌
              <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {operationStats.total_operations}
              </span>
            </div>
          </button>
        </nav>
      </div>
      
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(activeTab === 'login' ? loginStatCards : operationStatCards).map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </div>
              <div className={`p-3 rounded-full ${card.color} text-white`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 篩選面板 */}
      {showFilters && activeTab === 'login' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">篩選條件</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 用戶名篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用戶名</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={usernameFilter}
                  onChange={(e) => setUsernameFilter(e.target.value)}
                  placeholder="搜索用戶名..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* 動作篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">動作類型</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">所有動作</option>
                <option value="login">登入</option>
                <option value="logout">登出</option>
                <option value="login_failed">登入失敗</option>
              </select>
            </div>
            
            {/* 成功狀態篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">成功狀態</label>
              <select
                value={successFilter}
                onChange={(e) => setSuccessFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">所有狀態</option>
                <option value="true">成功</option>
                <option value="false">失敗</option>
              </select>
            </div>
            
            {/* 時間範圍 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日期</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setUsernameFilter('');
                setActionFilter('');
                setSuccessFilter('');
                setStartDate('');
                setEndDate('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-3"
            >
              清除篩選
            </button>
            <button
              onClick={fetchLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              應用篩選
            </button>
          </div>
        </div>
      )}
      
      {/* 日誌表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-800">
              {activeTab === 'login' ? '登入記錄' : '操作記錄'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              共 {currentLogs.length} 條記錄，顯示 {startIndex + 1}-{Math.min(endIndex, currentLogs.length)} 條
            </p>
          </div>
          
          <div className="flex items-center space-x-3 mt-3 sm:mt-0">
            {state.user?.role === 'super_admin' && (
              <button
                onClick={handleCleanupLogs}
                disabled={cleaning}
                className="flex items-center px-3 py-1.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                {cleaning ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                清理舊日誌
              </button>
            )}
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExportLogs('json')}
                disabled={exporting}
                className="flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {exporting ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                JSON
              </button>
              
              <button
                onClick={() => handleExportLogs('csv')}
                disabled={exporting}
                className="flex items-center px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                {exporting ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                CSV
              </button>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'login' ? '用戶/動作' : '用戶/操作'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'login' ? 'IP地址' : '資源類型'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態/詳情
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">沒有找到匹配的日誌記錄</p>
                      <p className="text-gray-400 text-sm mt-1">嘗試調整篩選條件或選擇其他時間範圍</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isExpanded = expandedLogs.has(log.id);
                  
                  if (activeTab === 'login') {
                    const loginLog = log as LoginLog;
                    const actionInfo = getActionInfo(loginLog.action, loginLog.success);
                    
                    return (
                      <React.Fragment key={loginLog.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {formatDate(loginLog.created_at)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTimeAgo(loginLog.created_at)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-full ${actionInfo.bg} ${actionInfo.color} mr-3`}>
                                {actionInfo.icon}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {loginLog.user_username || loginLog.username}
                                </div>
                                {loginLog.user_role && (
                                  <div className="text-xs text-gray-500">
                                    {loginLog.user_role}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {loginLog.ip_address || '未知'}
                            </div>
                            {loginLog.user_agent && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {loginLog.user_agent.substring(0, 50)}...
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${actionInfo.bg} ${actionInfo.color}`}>
                              {actionInfo.text}
                            </span>
                            {loginLog.error_message && (
                              <div className="text-xs text-red-600 mt-1">
                                {loginLog.error_message}
                              </div>
                            )}
                          </td>
                          
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleLogExpansion(loginLog.id)}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                        
                        {/* 展開的詳細信息 */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-800 mb-3">詳細信息</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-600">用戶信息</p>
                                    <p className="text-sm font-medium">
                                      用戶名: {loginLog.username}
                                      {loginLog.user_id && ` (ID: ${loginLog.user_id})`}
                                    </p>
                                    {loginLog.user_role && (
                                      <p className="text-sm">角色: {loginLog.user_role}</p>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-600">網絡信息</p>
                                    <p className="text-sm font-medium">IP地址: {loginLog.ip_address || '未知'}</p>
                                    <p className="text-sm">用戶代理: {loginLog.user_agent || '未知'}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-600">動作信息</p>
                                    <p className="text-sm font-medium">動作: {loginLog.action}</p>
                                    <p className="text-sm">成功: {loginLog.success ? '是' : '否'}</p>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-600">時間信息</p>
                                    <p className="text-sm font-medium">創建時間: {formatDate(loginLog.created_at)}</p>
                                    <p className="text-sm">相對時間: {formatTimeAgo(loginLog.created_at)}</p>
                                  </div>
                                  
                                  {loginLog.error_message && (
                                    <div className="md:col-span-2">
                                      <p className="text-sm text-gray-600">錯誤信息</p>
                                      <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                        {loginLog.error_message}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  } else {
                    const operationLog = log as OperationLog;
                    const actionInfo = getOperationActionInfo(operationLog.action_type);
                    
                    return (
                      <React.Fragment key={operationLog.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {formatDate(operationLog.created_at)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTimeAgo(operationLog.created_at)}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-3">
                                <span className="text-sm">{getResourceTypeInfo(operationLog.resource_type)}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {operationLog.username || '系統'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {operationLog.role || '系統操作'}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <span className={`px-2 py-1 text-xs rounded-full ${actionInfo.bg} ${actionInfo.color} mr-2`}>
                                {actionInfo.text}
                              </span>
                              <span className="text-sm text-gray-900">
                                {operationLog.resource_type}
                                {operationLog.resource_id && ` #${operationLog.resource_id}`}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            {operationLog.details ? (
                              <div className="text-sm text-gray-600">
                                {typeof operationLog.details === 'string' 
                                  ? operationLog.details.substring(0, 50) + '...'
                                  : JSON.stringify(operationLog.details).substring(0, 50) + '...'
                                }
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">無詳細信息</span>
                            )}
                          </td>
                          
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleLogExpansion(operationLog.id)}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                        
                        {/* 展開的詳細信息 */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 bg-gray-50">
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h4 className="font-medium text-gray-800 mb-3">操作詳細信息</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-600">用戶信息</p>
                                    <p className="text-sm font-medium">
                                      用戶: {operationLog.username || '系統'}
                                      {operationLog.user_id && ` (ID: ${operationLog.user_id})`}
                                    </p>
                                    {operationLog.role && (
                                      <p className="text-sm">角色: {operationLog.role}</p>
                                    )}
                                    {operationLog.email && (
                                      <p className="text-sm">郵箱: {operationLog.email}</p>
                                    )}
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-600">操作信息</p>
                                    <p className="text-sm font-medium">
                                      動作: <span className={`px-1.5 py-0.5 rounded ${actionInfo.bg} ${actionInfo.color}`}>
                                        {actionInfo.text}
                                      </span>
                                    </p>
                                    <p className="text-sm">
                                      資源: {operationLog.resource_type}
                                      {operationLog.resource_id && ` (ID: ${operationLog.resource_id})`}
                                    </p>
                                  </div>
                                  
                                  <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600">詳細信息</p>
                                    <div className="bg-gray-50 p-3 rounded-lg mt-1">
                                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                        {JSON.stringify(operationLog.details, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-sm text-gray-600">時間信息</p>
                                    <p className="text-sm font-medium">創建時間: {formatDate(operationLog.created_at)}</p>
                                    <p className="text-sm">相對時間: {formatTimeAgo(operationLog.created_at)}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  }
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分頁控制 */}
        {currentLogs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                顯示 <span className="font-medium">{startIndex + 1}</span> 到{' '}
                <span className="font-medium">{Math.min(endIndex, currentLogs.length)}</span> 的{' '}
                <span className="font-medium">{currentLogs.length}</span> 條結果
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一頁
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded text-sm ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-1">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="w-8 h-8 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一頁
                </button>
                
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={10}>10 條/頁</option>
                  <option value={20}>20 條/頁</option>
                  <option value={50}>50 條/頁</option>
                  <option value={100}>100 條/頁</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 統計信息面板 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">統計信息</h3>
        
        {activeTab === 'login' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">時間範圍統計</p>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">最近24小時</span>
                    <span className="font-medium">{loginStats.recent.last_24h}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">最近7天</span>
                    <span className="font-medium">{loginStats.recent.last_7d}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">最近30天</span>
                    <span className="font-medium">{loginStats.recent.last_30d}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">用戶統計</p>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">唯一用戶數</span>
                    <span className="font-medium">{loginStats.unique_users}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">唯一IP數</span>
                    <span className="font-medium">{loginStats.unique_ips}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">登出次數</span>
                    <span className="font-medium">{loginStats.logouts}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">時間信息</p>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">首次登入</span>
                    <span className="font-medium text-sm">
                      {loginStats.first_login ? formatDate(loginStats.first_login) : '無記錄'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">最後登入</span>
                    <span className="font-medium text-sm">
                      {loginStats.last_login ? formatDate(loginStats.last_login) : '無記錄'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">操作類型分布</p>
                <div className="mt-2 space-y-2">
                  {operationStats.action_types.map((action, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm">{action.action_type}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">{action.users} 用戶</span>
                        <span className="font-medium">{action.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">時間信息</p>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">首次操作</span>
                    <span className="font-medium text-sm">
                      {operationStats.first_operation ? formatDate(operationStats.first_operation) : '無記錄'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">最後操作</span>
                    <span className="font-medium text-sm">
                      {operationStats.last_operation ? formatDate(operationStats.last_operation) : '無記錄'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">平均每天操作</span>
                    <span className="font-medium">
                      {operationStats.total_operations > 0 ? Math.round(operationStats.total_operations / 30) : 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 安全提示 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">安全提示</p>
            <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside space-y-1">
              <li>日誌記錄是系統安全審計的重要組成部分</li>
              <li>定期檢查異常登入行為（如多次失敗嘗試）</li>
              <li>關注來自異常IP地址的登入活動</li>
              <li>敏感操作（如刪除、恢復）應有詳細記錄</li>
              <li>日誌保留時間建議至少90天以滿足審計要求</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginLogs;