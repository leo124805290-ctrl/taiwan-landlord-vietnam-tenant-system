import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  BellRing, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  RefreshCw,
  Settings,
  BarChart3,
  Send,
  Loader,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Shield,
  Calendar,
  User
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface Notification {
  id: number;
  user_id?: number;
  title: string;
  message: string;
  notification_type: 'system' | 'user' | 'alert' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'unread' | 'read' | 'dismissed' | 'archived';
  action_url?: string;
  action_label?: string;
  metadata?: any;
  expires_at?: string;
  read_at?: string;
  created_by?: number;
  created_by_username?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationStats {
  total_notifications: number;
  unread_notifications: number;
  read_notifications: number;
  dismissed_notifications: number;
  system_notifications: number;
  user_notifications: number;
  alert_notifications: number;
  reminder_notifications: number;
  urgent_notifications: number;
  high_notifications: number;
  medium_notifications: number;
  low_notifications: number;
  last_24h: number;
  last_7d: number;
  last_30d: number;
  users_with_notifications: number;
  notification_creators: number;
  last_notification_time?: string;
  first_notification_time?: string;
}

interface NotificationTrend {
  date: string;
  count: number;
  unread_count: number;
  urgent_count: number;
}

const Notifications: React.FC = () => {
  const { state } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<NotificationStats>({
    total_notifications: 0,
    unread_notifications: 0,
    read_notifications: 0,
    dismissed_notifications: 0,
    system_notifications: 0,
    user_notifications: 0,
    alert_notifications: 0,
    reminder_notifications: 0,
    urgent_notifications: 0,
    high_notifications: 0,
    medium_notifications: 0,
    low_notifications: 0,
    last_24h: 0,
    last_7d: 0,
    last_30d: 0,
    users_with_notifications: 0,
    notification_creators: 0
  });
  const [trend, setTrend] = useState<NotificationTrend[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 篩選狀態
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // 創建通知狀態
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    notification_type: 'system' as const,
    priority: 'medium' as const,
    user_id: '',
    action_url: '',
    action_label: '',
    expires_at: ''
  });
  
  // 詳細信息狀態
  const [expandedNotifications, setExpandedNotifications] = useState<Set<number>>(new Set());
  
  // 輪詢間隔（秒）
  const pollInterval = useRef<NodeJS.Timeout>();
  const POLL_INTERVAL_MS = 30000; // 30秒
  
  // 模擬通知數據
  const mockNotifications: Notification[] = [
    {
      id: 1,
      title: '系統維護通知',
      message: '系統將於今晚 23:00-01:00 進行維護，期間可能無法訪問。請提前保存您的工作。',
      notification_type: 'system',
      priority: 'medium',
      status: 'unread',
      created_by_username: 'system',
      created_at: '2026-02-28T09:30:00Z',
      updated_at: '2026-02-28T09:30:00Z'
    },
    {
      id: 2,
      user_id: 1,
      title: '安全警報',
      message: '檢測到異常登入嘗試，請檢查您的帳戶安全並考慮修改密碼。',
      notification_type: 'alert',
      priority: 'high',
      status: 'unread',
      created_by_username: 'security_system',
      created_at: '2026-02-28T09:15:00Z',
      updated_at: '2026-02-28T09:15:00Z'
    },
    {
      id: 3,
      title: '歡迎使用新功能',
      message: '通知系統已上線！您可以在這裡查看所有系統通知和管理您的通知設置。',
      notification_type: 'user',
      priority: 'low',
      status: 'read',
      action_url: '/admin/notifications',
      action_label: '查看通知',
      created_by_username: 'admin',
      created_at: '2026-02-28T09:00:00Z',
      updated_at: '2026-02-28T09:05:00Z',
      read_at: '2026-02-28T09:05:00Z'
    },
    {
      id: 4,
      user_id: 2,
      title: '數據備份完成',
      message: '系統自動備份已完成，共備份 156 條記錄，大小 45.2 MB。',
      notification_type: 'system',
      priority: 'low',
      status: 'read',
      created_by_username: 'backup_system',
      created_at: '2026-02-28T08:45:00Z',
      updated_at: '2026-02-28T08:45:00Z',
      read_at: '2026-02-28T08:50:00Z'
    },
    {
      id: 5,
      title: '緊急：系統錯誤',
      message: '檢測到資料庫連接異常，部分功能可能受影響。技術團隊正在處理。',
      notification_type: 'alert',
      priority: 'urgent',
      status: 'unread',
      created_by_username: 'monitoring_system',
      created_at: '2026-02-28T08:30:00Z',
      updated_at: '2026-02-28T08:30:00Z'
    },
    {
      id: 6,
      user_id: 3,
      title: '合約即將到期提醒',
      message: '您管理的「台北公寓 101 室」租約將於 2026-03-15 到期，請提前處理。',
      notification_type: 'reminder',
      priority: 'medium',
      status: 'unread',
      action_url: '/rooms',
      action_label: '查看房間',
      created_by_username: 'system',
      created_at: '2026-02-28T08:15:00Z',
      updated_at: '2026-02-28T08:15:00Z'
    },
    {
      id: 7,
      title: '新用戶註冊',
      message: '新用戶「viewer」已完成註冊，請審核其權限設置。',
      notification_type: 'system',
      priority: 'medium',
      status: 'read',
      created_by_username: 'system',
      created_at: '2026-02-28T08:00:00Z',
      updated_at: '2026-02-28T08:00:00Z',
      read_at: '2026-02-28T08:10:00Z'
    },
    {
      id: 8,
      user_id: 1,
      title: '密碼過期提醒',
      message: '您的密碼將在 7 天後過期，建議提前修改以確保帳戶安全。',
      notification_type: 'reminder',
      priority: 'medium',
      status: 'unread',
      action_url: '/admin/settings',
      action_label: '修改密碼',
      expires_at: '2026-03-07T08:00:00Z',
      created_by_username: 'security_system',
      created_at: '2026-02-28T07:45:00Z',
      updated_at: '2026-02-28T07:45:00Z'
    }
  ];
  
  const mockStats: NotificationStats = {
    total_notifications: 8,
    unread_notifications: 5,
    read_notifications: 3,
    dismissed_notifications: 0,
    system_notifications: 3,
    user_notifications: 1,
    alert_notifications: 2,
    reminder_notifications: 2,
    urgent_notifications: 1,
    high_notifications: 1,
    medium_notifications: 4,
    low_notifications: 2,
    last_24h: 8,
    last_7d: 8,
    last_30d: 8,
    users_with_notifications: 3,
    notification_creators: 3,
    last_notification_time: '2026-02-28T09:30:00Z',
    first_notification_time: '2026-02-28T07:45:00Z'
  };
  
  const mockTrend: NotificationTrend[] = [
    { date: '2026-02-22', count: 3, unread_count: 2, urgent_count: 0 },
    { date: '2026-02-23', count: 5, unread_count: 3, urgent_count: 1 },
    { date: '2026-02-24', count: 4, unread_count: 2, urgent_count: 0 },
    { date: '2026-02-25', count: 6, unread_count: 4, urgent_count: 1 },
    { date: '2026-02-26', count: 7, unread_count: 5, urgent_count: 2 },
    { date: '2026-02-27', count: 8, unread_count: 6, urgent_count: 1 },
    { date: '2026-02-28', count: 8, unread_count: 5, urgent_count: 1 }
  ];
  
  useEffect(() => {
    fetchNotifications();
    
    // 開始輪詢
    startPolling();
    
    // 清理輪詢
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);
  
  const startPolling = () => {
    if (pollInterval.current) {
      clearInterval(pollInterval.current);
    }
    
    pollInterval.current = setInterval(() => {
      fetchNotifications(true); // 靜默更新
    }, POLL_INTERVAL_MS);
  };
  
  const fetchNotifications = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      
      // 這裡應該調用後端 API
      // const response = await fetch('/api/notifications');
      // const data = await response.json();
      
      // 暫時使用模擬數據
      setTimeout(() => {
        setNotifications(mockNotifications);
        setUnreadCount(mockStats.unread_notifications);
        setStats(mockStats);
        setTrend(mockTrend);
        setError(null);
        
        if (!silent) {
          setLoading(false);
        }
      }, silent ? 100 : 500);
      
    } catch (err) {
      console.error('獲取通知失敗:', err);
      if (!silent) {
        setError('無法載入通知數據');
        setLoading(false);
      }
    }
  };
  
  const markAsRead = async (notificationId: number) => {
    try {
      setMarkingRead(true);
      
      // 這裡應該調用後端 API
      // const response = await fetch(`/api/notifications/${notificationId}/read`, {
      //   method: 'PUT'
      // });
      
      // 更新本地狀態
      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, status: 'read', read_at: new Date().toISOString() }
          : notif
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      setMarkingRead(false);
      
    } catch (err) {
      console.error('標記通知已讀失敗:', err);
      setError('標記通知已讀失敗');
      setMarkingRead(false);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      setMarkingRead(true);
      
      // 這裡應該調用後端 API
      // const response = await fetch('/api/notifications/read-all', {
      //   method: 'PUT'
      // });
      
      // 更新本地狀態
      setNotifications(prev => prev.map(notif => 
        notif.status === 'unread'
          ? { ...notif, status: 'read', read_at: new Date().toISOString() }
          : notif
      ));
      
      setUnreadCount(0);
      setMarkingRead(false);
      setSuccess('所有通知已標記為已讀');
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('標記所有通知已讀失敗:', err);
      setError('標記所有通知已讀失敗');
      setMarkingRead(false);
    }
  };
  
  const createNotification = async () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) {
      setError('通知標題和內容不能為空');
      return;
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // 這裡應該調用後端 API
      // const response = await fetch('/api/notifications', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newNotification)
      // });
      
      // 模擬創建成功
      setTimeout(() => {
        const newNotif: Notification = {
          id: notifications.length + 1,
          title: newNotification.title,
          message: newNotification.message,
          notification_type: newNotification.notification_type,
          priority: newNotification.priority,
          status: 'unread',
          user_id: newNotification.user_id ? parseInt(newNotification.user_id) : undefined,
          action_url: newNotification.action_url || undefined,
          action_label: newNotification.action_label || undefined,
          expires_at: newNotification.expires_at || undefined,
          created_by_username: state.user?.username || 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setNotifications([newNotif, ...notifications]);
        setUnreadCount(prev => prev + 1);
        setNewNotification({
          title: '',
          message: '',
          notification_type: 'system',
          priority: 'medium',
          user_id: '',
          action_url: '',
          action_label: '',
          expires_at: ''
        });
        setShowCreateModal(false);
        setCreating(false);
        setSuccess('通知創建成功');
        
        setTimeout(() => setSuccess(null), 3000);
      }, 1000);
      
    } catch (err) {
      console.error('創建通知失敗:', err);
      setError('創建通知失敗，請重試');
      setCreating(false);
    }
  };
  
  const deleteNotification = async (notificationId: number) => {
    if (!window.confirm('確定要刪除此通知嗎？此操作無法撤銷。')) {
      return;
    }
    
    try {
      // 這裡應該調用後端 API
      // const response = await fetch(`/api/notifications/${notificationId}`, {
      //   method: 'DELETE'
      // });
      
      // 更新本地狀態
      const notificationToDelete = notifications.find(n => n.id === notificationId);
      if (notificationToDelete?.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setSuccess('通知已刪除');
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('刪除通知失敗:', err);
      setError('刪除通知失敗');
    }
  };
  
  const sendTestNotifications = async () => {
    try {
      // 這裡應該調用後端 API
      // const response = await fetch('/api/notifications/test', {
      //   method: 'POST'
      // });
      
      // 模擬發送測試通知
      const testNotifications: Notification[] = [
        {
          id: notifications.length + 1,
          title: '測試通知 - 系統消息',
          message: '這是一條測試系統通知，用於驗證通知功能是否正常。',
          notification_type: 'system',
          priority: 'medium',
          status: 'unread',
          created_by_username: state.user?.username || 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: notifications.length + 2,
          title: '測試通知 - 安全警報',
          message: '這是一條測試安全警報，用於驗證高優先級通知的顯示。',
          notification_type: 'alert',
          priority: 'high',
          status: 'unread',
          created_by_username: state.user?.username || 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setNotifications([...testNotifications, ...notifications]);
      setUnreadCount(prev => prev + 2);
      setSuccess('測試通知已發送');
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('發送測試通知失敗:', err);
      setError('發送測試通知失敗');
    }
  };
  
  const toggleNotificationExpansion = (notificationId: number) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);
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
  
  // 獲取通知類型信息
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'system':
        return { text: '系統', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Settings className="w-4 h-4" /> };
      case 'user':
        return { text: '用戶', color: 'text-green-600', bg: 'bg-green-100', icon: <User className="w-4 h-4" /> };
      case 'alert':
        return { text: '警報', color: 'text-red-600', bg: 'bg-red-100', icon: <AlertCircle className="w-4 h-4" /> };
      case 'reminder':
        return { text: '提醒', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <Clock className="w-4 h-4" /> };
      default:
        return { text: type, color: 'text-gray-600', bg: 'bg-gray-100', icon: <Bell className="w-4 h-4" /> };
    }
  };
  
  // 獲取優先級信息
  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { text: '緊急', color: 'text-red-600', bg: 'bg-red-100', icon: <AlertCircle className="w-4 h-4" /> };
      case 'high':
        return { text: '高', color: 'text-orange-600', bg: 'bg-orange-100', icon: <AlertCircle className="w-4 h-4" /> };
      case 'medium':
        return { text: '中', color: 'text-blue-600', bg: 'bg-blue-100', icon: <Bell className="w-4 h-4" /> };
      case 'low':
        return { text: '低', color: 'text-gray-600', bg: 'bg-gray-100', icon: <Bell className="w-4 h-4" /> };
      default:
        return { text: priority, color: 'text-gray-600', bg: 'bg-gray-100', icon: <Bell className="w-4 h-4" /> };
    }
  };
  
  // 獲取狀態信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'unread':
        return { text: '未讀', color: 'text-red-600', bg: 'bg-red-100', icon: <EyeOff className="w-4 h-4" /> };
      case 'read':
        return { text: '已讀', color: 'text-green-600', bg: 'bg-green-100', icon: <Eye className="w-4 h-4" /> };
      case 'dismissed':
        return { text: '已關閉', color: 'text-gray-600', bg: 'bg-gray-100', icon: <XCircle className="w-4 h-4" /> };
      case 'archived':
        return { text: '已存檔', color: 'text-gray-600', bg: 'bg-gray-100', icon: <Archive className="w-4 h-4" /> };
      default:
        return { text: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: <Bell className="w-4 h-4" /> };
    }
  };
  
  // 檢查通知是否過期
  const isExpired = (notification: Notification) => {
    if (!notification.expires_at) return false;
    return new Date(notification.expires_at) < new Date();
  };
  
  // 過濾通知
  const filteredNotifications = notifications.filter(notification => {
    // 過期過濾
    if (!showExpired && isExpired(notification)) {
      return false;
    }
    
    // 狀態過濾
    if (statusFilter && notification.status !== statusFilter) {
      return false;
    }
    
    // 類型過濾
    if (typeFilter && notification.notification_type !== typeFilter) {
      return false;
    }
    
    // 優先級過濾
    if (priorityFilter && notification.priority !== priorityFilter) {
      return false;
    }
    
    return true;
  });
  
  // 分頁計算
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  
  // 統計卡片
  const statCards = [
    {
      title: '總通知數',
      value: stats.total_notifications.toString(),
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: '所有通知記錄'
    },
    {
      title: '未讀通知',
      value: stats.unread_notifications.toString(),
      icon: <BellRing className="w-6 h-6" />,
      color: 'bg-red-500',
      description: '待處理通知'
    },
    {
      title: '最近24小時',
      value: stats.last_24h.toString(),
      icon: <Clock className="w-6 h-6" />,
      color: 'bg-green-500',
      description: '24小時內通知'
    },
    {
      title: '緊急通知',
      value: stats.urgent_notifications.toString(),
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'bg-orange-500',
      description: '緊急優先級通知'
    }
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入通知數據中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 標題和操作按鈕 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">通知管理</h1>
          <p className="text-gray-600 mt-1">管理系統通知和用戶提醒</p>
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
            onClick={sendTestNotifications}
            className="flex items-center px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Send className="w-5 h-5 mr-2" />
            發送測試
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            創建通知
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
      
      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
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
      {showFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">篩選條件</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 狀態篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">所有狀態</option>
                <option value="unread">未讀</option>
                <option value="read">已讀</option>
                <option value="dismissed">已關閉</option>
                <option value="archived">已存檔</option>
              </select>
            </div>
            
            {/* 類型篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">所有類型</option>
                <option value="system">系統</option>
                <option value="user">用戶</option>
                <option value="alert">警報</option>
                <option value="reminder">提醒</option>
              </select>
            </div>
            
            {/* 優先級篩選 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">優先級</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">所有優先級</option>
                <option value="urgent">緊急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            
            {/* 過期篩選 */}
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showExpired}
                  onChange={(e) => setShowExpired(e.target.checked)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">顯示已過期通知</span>
              </label>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setStatusFilter('');
                setTypeFilter('');
                setPriorityFilter('');
                setShowExpired(false);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-3"
            >
              清除篩選
            </button>
            <button
              onClick={fetchNotifications}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              應用篩選
            </button>
          </div>
        </div>
      )}
      
      {/* 通知操作欄 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h3 className="text-lg font-medium text-gray-800">通知列表</h3>
            <p className="text-sm text-gray-600">
              共 {filteredNotifications.length} 條通知，其中 {unreadCount} 條未讀
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={markAllAsRead}
              disabled={markingRead || unreadCount === 0}
              className="flex items-center px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 disabled:opacity-50"
            >
              {markingRead ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              標記所有已讀
            </button>
            
            <button
              onClick={fetchNotifications}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </button>
          </div>
        </div>
      </div>
      
      {/* 通知表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  通知信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類型/優先級
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態/時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedNotifications.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Bell className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">沒有找到匹配的通知</p>
                      <p className="text-gray-400 text-sm mt-1">嘗試調整篩選條件或創建新通知</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedNotifications.map((notification) => {
                  const isExpanded = expandedNotifications.has(notification.id);
                  const typeInfo = getTypeInfo(notification.notification_type);
                  const priorityInfo = getPriorityInfo(notification.priority);
                  const statusInfo = getStatusInfo(notification.status);
                  const expired = isExpired(notification);
                  
                  return (
                    <React.Fragment key={notification.id}>
                      <tr className={`hover:bg-gray-50 ${expired ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className={`p-2 rounded-full ${typeInfo.bg} ${typeInfo.color} mr-3 mt-1`}>
                              {typeInfo.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                    {expired && (
                                      <span className="ml-2 text-xs text-gray-500">(已過期)</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {notification.message}
                                  </div>
                                </div>
                                {notification.status === 'unread' && (
                                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    新
                                  </span>
                                )}
                              </div>
                              
                              {notification.action_url && (
                                <div className="mt-2">
                                  <a
                                    href={notification.action_url}
                                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {notification.action_label || '查看詳情'}
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className={`px-2 py-1 text-xs rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                                {typeInfo.text}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className={`px-2 py-1 text-xs rounded-full ${priorityInfo.bg} ${priorityInfo.color}`}>
                                {priorityInfo.text}
                              </span>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatTimeAgo(notification.created_at)}
                            </div>
                            {notification.read_at && (
                              <div className="text-xs text-gray-400">
                                已讀: {formatTimeAgo(notification.read_at)}
                              </div>
                            )}
                            {notification.expires_at && (
                              <div className={`text-xs ${expired ? 'text-red-500' : 'text-gray-400'}`}>
                                過期: {formatDate(notification.expires_at)}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            {notification.status === 'unread' && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                disabled={markingRead}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                                title="標記為已讀"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => toggleNotificationExpansion(notification.id)}
                              className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="刪除通知"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* 展開的詳細信息 */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 bg-gray-50">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <h4 className="font-medium text-gray-800 mb-3">通知詳細信息</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600">基本信息</p>
                                  <p className="text-sm font-medium">標題: {notification.title}</p>
                                  <p className="text-sm mt-2">內容: {notification.message}</p>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-gray-600">分類信息</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className={`px-2 py-1 text-xs rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                                      {typeInfo.text}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${priorityInfo.bg} ${priorityInfo.color}`}>
                                      {priorityInfo.text}
                                    </span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                                      {statusInfo.text}
                                    </span>
                                  </div>
                                </div>
                                
                                <div>
                                  <p className="text-sm text-gray-600">時間信息</p>
                                  <p className="text-sm">創建時間: {formatDate(notification.created_at)}</p>
                                  <p className="text-sm">更新時間: {formatDate(notification.updated_at)}</p>
                                  {notification.read_at && (
                                    <p className="text-sm">閱讀時間: {formatDate(notification.read_at)}</p>
                                  )}
                                  {notification.expires_at && (
                                    <p className={`text-sm ${expired ? 'text-red-500' : ''}`}>
                                      過期時間: {formatDate(notification.expires_at)}
                                    </p>
                                  )}
                                </div>
                                
                                <div>
                                  <p className="text-sm text-gray-600">創建信息</p>
                                  <p className="text-sm">創建者: {notification.created_by_username || '系統'}</p>
                                  {notification.user_id && (
                                    <p className="text-sm">目標用戶ID: {notification.user_id}</p>
                                  )}
                                </div>
                                
                                {notification.action_url && (
                                  <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600">操作鏈接</p>
                                    <div className="flex items-center mt-1">
                                      <a
                                        href={notification.action_url}
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {notification.action_label || notification.action_url}
                                        <ExternalLink className="w-3 h-3 ml-1" />
                                      </a>
                                    </div>
                                  </div>
                                )}
                                
                                {notification.metadata && (
                                  <div className="md:col-span-2">
                                    <p className="text-sm text-gray-600">元數據</p>
                                    <div className="bg-gray-50 p-3 rounded-lg mt-1">
                                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                                        {JSON.stringify(notification.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分頁控制 */}
        {filteredNotifications.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                顯示 <span className="font-medium">{startIndex + 1}</span> 到{' '}
                <span className="font-medium">{Math.min(endIndex, filteredNotifications.length)}</span> 的{' '}
                <span className="font-medium">{filteredNotifications.length}</span> 個結果
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
        <h3 className="text-lg font-medium text-gray-800 mb-4">通知統計</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 類型分布 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">通知類型分布</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">系統通知</span>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">{stats.system_notifications} 條</span>
                  <span className="font-medium">
                    {stats.total_notifications > 0 
                      ? Math.round((stats.system_notifications / stats.total_notifications) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">用戶通知</span>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">{stats.user_notifications} 條</span>
                  <span className="font-medium">
                    {stats.total_notifications > 0 
                      ? Math.round((stats.user_notifications / stats.total_notifications) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">安全警報</span>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">{stats.alert_notifications} 條</span>
                  <span className="font-medium">
                    {stats.total_notifications > 0 
                      ? Math.round((stats.alert_notifications / stats.total_notifications) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">提醒通知</span>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-500">{stats.reminder_notifications} 條</span>
                  <span className="font-medium">
                    {stats.total_notifications > 0 
                      ? Math.round((stats.reminder_notifications / stats.total_notifications) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* 時間統計 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">時間範圍統計</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">最近24小時</span>
                <span className="font-medium">{stats.last_24h} 條</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">最近7天</span>
                <span className="font-medium">{stats.last_7d} 條</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">最近30天</span>
                <span className="font-medium">{stats.last_30d} 條</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">平均每天</span>
                <span className="font-medium">
                  {stats.last_30d > 0 ? Math.round(stats.last_30d / 30) : 0} 條
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 趨勢圖表 */}
        {trend.length > 0 && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-3">最近7天通知趨勢</p>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">總通知數</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">未讀通知</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-600">緊急通知</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end h-32 space-x-2">
                {trend.map((day, index) => {
                  const maxCount = Math.max(...trend.map(d => d.count));
                  const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                  const unreadPercent = maxCount > 0 ? (day.unread_count / maxCount) * 100 : 0;
                  const urgentPercent = maxCount > 0 ? (day.urgent_count / maxCount) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="relative w-full h-24">
                        {/* 緊急通知 */}
                        <div 
                          className="absolute bottom-0 left-1/4 w-1/2 bg-orange-500 rounded-t"
                          style={{ height: `${urgentPercent}%` }}
                        ></div>
                        {/* 未讀通知 */}
                        <div 
                          className="absolute bottom-0 left-1/4 w-1/2 bg-red-500 rounded-t"
                          style={{ height: `${unreadPercent}%` }}
                        ></div>
                        {/* 總通知數 */}
                        <div 
                          className="absolute bottom-0 left-1/4 w-1/2 bg-blue-500 rounded-t"
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(day.date).getDate()}日
                      </div>
                      <div className="text-xs font-medium mt-1">{day.count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 創建通知模態框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">創建新通知</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    通知標題 *
                  </label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="例如：系統維護通知"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    通知內容 *
                  </label>
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="詳細描述通知內容..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      通知類型
                    </label>
                    <select
                      value={newNotification.notification_type}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, notification_type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="system">系統通知</option>
                      <option value="user">用戶通知</option>
                      <option value="alert">安全警報</option>
                      <option value="reminder">提醒通知</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      優先級
                    </label>
                    <select
                      value={newNotification.priority}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                      <option value="urgent">緊急</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      目標用戶ID（可選）
                    </label>
                    <input
                      type="number"
                      value={newNotification.user_id}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, user_id: e.target.value }))}
                      placeholder="留空表示發送給所有用戶"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      過期時間（可選）
                    </label>
                    <input
                      type="datetime-local"
                      value={newNotification.expires_at}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, expires_at: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      操作鏈接（可選）
                    </label>
                    <input
                      type="url"
                      value={newNotification.action_url}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, action_url: e.target.value }))}
                      placeholder="https://example.com/action"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      操作標籤（可選）
                    </label>
                    <input
                      type="text"
                      value={newNotification.action_label}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, action_label: e.target.value }))}
                      placeholder="例如：查看詳情"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Bell className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-blue-800 font-medium">通知提示</p>
                      <ul className="text-blue-700 text-sm mt-1 list-disc list-inside space-y-1">
                        <li>系統通知會顯示給所有用戶</li>
                        <li>警報和緊急通知會有特殊標記</li>
                        <li>設置過期時間後，通知會在指定時間後自動隱藏</li>
                        <li>操作鏈接可以引導用戶到相關頁面</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewNotification({
                      title: '',
                      message: '',
                      notification_type: 'system',
                      priority: 'medium',
                      user_id: '',
                      action_url: '',
                      action_label: '',
                      expires_at: ''
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={createNotification}
                  disabled={creating || !newNotification.title.trim() || !newNotification.message.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                      創建中...
                    </>
                  ) : (
                    '創建通知'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 安全提示 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">通知使用提示</p>
            <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside space-y-1">
              <li>謹慎使用緊急優先級，僅用於真正重要的事件</li>
              <li>定期清理過期通知以保持列表整潔</li>
              <li>重要通知建議設置過期時間，避免長期顯示</li>
              <li>使用操作鏈接可以提升用戶體驗和操作效率</li>
              <li>測試通知功能時，請使用「發送測試」按鈕</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// 添加缺失的 Archive 圖標組件
const Archive: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

export default Notifications;