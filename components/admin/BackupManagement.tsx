import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  RefreshCw, 
  Trash2, 
  Download,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  BarChart3,
  Calendar,
  FileText,
  Loader,
  Shield
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface Backup {
  id: number;
  name: string;
  description?: string;
  file_size?: number;
  record_count?: number;
  backup_type: 'manual' | 'auto' | 'scheduled';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_by?: number;
  created_by_username?: string;
  restored_by?: number;
  restored_by_username?: string;
  restored_at?: string;
  expires_at?: string;
  metadata?: any;
  created_at: string;
}

interface BackupStats {
  total_backups: number;
  completed_backups: number;
  failed_backups: number;
  restored_backups: number;
  total_size: string;
  manual_backups: number;
  auto_backups: number;
  scheduled_backups: number;
  last_7_days: number;
  last_30_days: number;
  last_backup_time?: string;
  first_backup_time?: string;
}

const BackupManagement: React.FC = () => {
  const { state } = useApp();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [filteredBackups, setFilteredBackups] = useState<Backup[]>([]);
  const [stats, setStats] = useState<BackupStats>({
    total_backups: 0,
    completed_backups: 0,
    failed_backups: 0,
    restored_backups: 0,
    total_size: '0 B',
    manual_backups: 0,
    auto_backups: 0,
    scheduled_backups: 0,
    last_7_days: 0,
    last_30_days: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 篩選狀態
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // 對話框狀態
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // 表單狀態
  const [newBackupName, setNewBackupName] = useState('');
  const [newBackupDescription, setNewBackupDescription] = useState('');
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  
  // 模擬備份數據
  const mockBackups: Backup[] = [
    {
      id: 1,
      name: '系統完整備份',
      description: '包含所有數據的完整備份',
      file_size: 45217890,
      record_count: 156,
      backup_type: 'manual',
      status: 'completed',
      created_by_username: 'super_admin',
      created_at: '2026-02-27T22:30:00Z',
      expires_at: '2026-03-28T22:30:00Z'
    },
    {
      id: 2,
      name: '每日自動備份',
      description: '系統自動生成的每日備份',
      file_size: 45123456,
      record_count: 154,
      backup_type: 'auto',
      status: 'completed',
      created_by_username: 'system',
      created_at: '2026-02-27T02:00:00Z',
      expires_at: '2026-03-28T02:00:00Z'
    },
    {
      id: 3,
      name: '用戶數據備份',
      description: '用戶和權限數據備份',
      file_size: 1234567,
      record_count: 12,
      backup_type: 'manual',
      status: 'completed',
      created_by_username: 'admin',
      created_at: '2026-02-26T15:45:00Z',
      expires_at: '2026-03-27T15:45:00Z'
    },
    {
      id: 4,
      name: '物業數據備份',
      description: '物業和房間數據備份',
      file_size: 23456789,
      record_count: 45,
      backup_type: 'scheduled',
      status: 'completed',
      created_by_username: 'system',
      created_at: '2026-02-25T03:00:00Z',
      expires_at: '2026-03-26T03:00:00Z'
    },
    {
      id: 5,
      name: '失敗的備份嘗試',
      description: '數據庫連接失敗',
      backup_type: 'auto',
      status: 'failed',
      created_by_username: 'system',
      created_at: '2026-02-24T02:00:00Z'
    },
    {
      id: 6,
      name: '正在進行的備份',
      description: '當前正在創建的備份',
      backup_type: 'manual',
      status: 'in_progress',
      created_by_username: 'admin',
      created_at: '2026-02-28T09:00:00Z'
    },
    {
      id: 7,
      name: '已恢復的備份',
      description: '測試恢復功能',
      file_size: 45217890,
      record_count: 156,
      backup_type: 'manual',
      status: 'completed',
      created_by_username: 'super_admin',
      restored_by_username: 'admin',
      restored_at: '2026-02-27T23:15:00Z',
      created_at: '2026-02-26T10:30:00Z',
      expires_at: '2026-03-27T10:30:00Z'
    }
  ];
  
  const mockStats: BackupStats = {
    total_backups: 7,
    completed_backups: 5,
    failed_backups: 1,
    restored_backups: 1,
    total_size: '165.4 MB',
    manual_backups: 3,
    auto_backups: 2,
    scheduled_backups: 1,
    last_7_days: 7,
    last_30_days: 7,
    last_backup_time: '2026-02-28T09:00:00Z',
    first_backup_time: '2026-02-24T02:00:00Z'
  };
  
  useEffect(() => {
    fetchBackups();
  }, []);
  
  useEffect(() => {
    filterBackups();
  }, [backups, statusFilter, typeFilter]);
  
  const fetchBackups = async () => {
    try {
      setLoading(true);
      
      // 這裡應該調用後端 API
      // const response = await fetch('/api/backups');
      // const data = await response.json();
      
      // 暫時使用模擬數據
      setTimeout(() => {
        setBackups(mockBackups);
        setFilteredBackups(mockBackups);
        setStats(mockStats);
        setTotalPages(Math.ceil(mockBackups.length / itemsPerPage));
        setError(null);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      console.error('獲取備份列表失敗:', err);
      setError('無法載入備份列表');
      setLoading(false);
    }
  };
  
  const filterBackups = () => {
    let filtered = [...backups];
    
    // 狀態篩選
    if (statusFilter !== 'all') {
      filtered = filtered.filter(backup => backup.status === statusFilter);
    }
    
    // 類型篩選
    if (typeFilter !== 'all') {
      filtered = filtered.filter(backup => backup.backup_type === typeFilter);
    }
    
    setFilteredBackups(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // 重置到第一頁
  };
  
  const handleCreateBackup = async () => {
    if (!newBackupName.trim()) {
      setError('請輸入備份名稱');
      return;
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // 這裡應該調用後端 API
      // const response = await fetch('/api/backup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     name: newBackupName,
      //     description: newBackupDescription
      //   })
      // });
      
      // 模擬創建成功
      setTimeout(() => {
        const newBackup: Backup = {
          id: backups.length + 1,
          name: newBackupName,
          description: newBackupDescription || undefined,
          backup_type: 'manual',
          status: 'in_progress',
          created_by_username: state.user?.username || 'admin',
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        setBackups([newBackup, ...backups]);
        setNewBackupName('');
        setNewBackupDescription('');
        setShowCreateModal(false);
        setSuccess(`備份 "${newBackupName}" 已開始創建`);
        setCreating(false);
        
        // 3秒後清除成功訊息
        setTimeout(() => setSuccess(null), 3000);
        
        // 模擬備份完成
        setTimeout(() => {
          setBackups(prev => prev.map(b => 
            b.id === newBackup.id 
              ? { ...b, status: 'completed', file_size: 45217890, record_count: 156 }
              : b
          ));
        }, 3000);
        
      }, 1000);
      
    } catch (err) {
      console.error('創建備份失敗:', err);
      setError('創建備份失敗，請重試');
      setCreating(false);
    }
  };
  
  const handleRestoreBackup = async (backup: Backup) => {
    if (backup.status !== 'completed') {
      setError('只能恢復已完成的備份');
      return;
    }
    
    if (!window.confirm(`確定要恢復備份 "${backup.name}" 嗎？這將覆蓋當前數據。`)) {
      return;
    }
    
    try {
      setRestoring(true);
      setError(null);
      
      // 這裡應該調用後端 API
      // const response = await fetch(`/api/backups/${backup.id}/restore`, {
      //   method: 'POST'
      // });
      
      // 模擬恢復成功
      setTimeout(() => {
        setBackups(prev => prev.map(b => 
          b.id === backup.id 
            ? { 
                ...b, 
                restored_by_username: state.user?.username || 'admin',
                restored_at: new Date().toISOString()
              }
            : b
        ));
        
        setRestoring(false);
        setSuccess(`備份 "${backup.name}" 已開始恢復`);
        
        // 3秒後清除成功訊息
        setTimeout(() => setSuccess(null), 3000);
      }, 1000);
      
    } catch (err) {
      console.error('恢復備份失敗:', err);
      setError('恢復備份失敗，請重試');
      setRestoring(false);
    }
  };
  
  const handleDeleteBackup = async (backup: Backup) => {
    if (!window.confirm(`確定要刪除備份 "${backup.name}" 嗎？此操作無法撤銷。`)) {
      return;
    }
    
    try {
      // 這裡應該調用後端 API
      // const response = await fetch(`/api/backups/${backup.id}`, {
      //   method: 'DELETE'
      // });
      
      // 更新本地狀態
      setBackups(prev => prev.filter(b => b.id !== backup.id));
      setSuccess(`備份 "${backup.name}" 已刪除`);
      
      // 3秒後清除成功訊息
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('刪除備份失敗:', err);
      setError('刪除備份失敗，請重試');
    }
  };
  
  const handleDownloadBackup = (backup: Backup) => {
    if (backup.status !== 'completed') {
      setError('只能下載已完成的備份');
      return;
    }
    
    // 這裡應該提供下載鏈接
    console.log('下載備份:', backup.name);
    setSuccess(`開始下載備份 "${backup.name}"`);
    
    // 3秒後清除成功訊息
    setTimeout(() => setSuccess(null), 3000);
  };
  
  // 分頁計算
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBackups = filteredBackups.slice(startIndex, endIndex);
  
  // 格式化文件大小
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '未知';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };
  
  // 格式化日期
  const formatDate = (dateString?: string) => {
    if (!dateString) return '從未';
    return new Date(dateString).toLocaleString('zh-TW');
  };
  
  // 獲取狀態信息
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: '完成', color: 'text-green-600', bg: 'bg-green-100', icon: <CheckCircle className="w-4 h-4" /> };
      case 'in_progress':
        return { text: '進行中', color: 'text-blue-600', bg: 'bg-blue-100', icon: <RefreshCw className="w-4 h-4 animate-spin" /> };
      case 'failed':
        return { text: '失敗', color: 'text-red-600', bg: 'bg-red-100', icon: <XCircle className="w-4 h-4" /> };
      case 'pending':
        return { text: '待處理', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: <Clock className="w-4 h-4" /> };
      default:
        return { text: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: <AlertCircle className="w-4 h-4" /> };
    }
  };
  
  // 獲取類型信息
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'manual':
        return { text: '手動', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'auto':
        return { text: '自動', color: 'text-green-600', bg: 'bg-green-100' };
      case 'scheduled':
        return { text: '計劃', color: 'text-purple-600', bg: 'bg-purple-100' };
      default:
        return { text: type, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };
  
  // 統計卡片
  const statCards = [
    {
      title: '總備份數',
      value: stats.total_backups.toString(),
      icon: <Database className="w-6 h-6" />,
      color: 'bg-blue-500',
      description: '所有備份記錄'
    },
    {
      title: '成功備份',
      value: stats.completed_backups.toString(),
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'bg-green-500',
      description: '已完成備份'
    },
    {
      title: '總大小',
      value: stats.total_size,
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-purple-500',
      description: '所有備份總大小'
    },
    {
      title: '最近7天',
      value: stats.last_7_days.toString(),
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-orange-500',
      description: '最近7天備份數'
    }
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入備份數據中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 標題和操作按鈕 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">數據備份管理</h1>
          <p className="text-gray-600 mt-1">管理系統數據備份和恢復</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          創建備份
        </button>
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
      
      {/* 篩選和搜索欄 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 狀態篩選 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">所有狀態</option>
              <option value="completed">完成</option>
              <option value="in_progress">進行中</option>
              <option value="failed">失敗</option>
              <option value="pending">待處理</option>
            </select>
          </div>
          
          {/* 類型篩選 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">所有類型</option>
              <option value="manual">手動</option>
              <option value="auto">自動</option>
              <option value="scheduled">計劃</option>
            </select>
          </div>
          
          {/* 刷新按鈕 */}
          <div className="flex items-end">
            <button
              onClick={fetchBackups}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              刷新列表
            </button>
          </div>
        </div>
        
        {/* 統計信息 */}
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            手動: {stats.manual_backups}
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            自動: {stats.auto_backups}
          </div>
          <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
            計劃: {stats.scheduled_backups}
          </div>
          <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            失敗: {stats.failed_backups}
          </div>
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            已恢復: {stats.restored_backups}
          </div>
        </div>
      </div>
      
      {/* 備份表格 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  備份信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  大小/記錄
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  創建時間
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBackups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Database className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">沒有找到匹配的備份</p>
                      <p className="text-gray-400 text-sm mt-1">嘗試調整篩選條件或創建新備份</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBackups.map((backup) => {
                  const statusInfo = getStatusInfo(backup.status);
                  const typeInfo = getTypeInfo(backup.backup_type);
                  
                  return (
                    <tr key={backup.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {backup.name}
                          </div>
                          {backup.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {backup.description}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            創建者: {backup.created_by_username || '系統'}
                            {backup.restored_by_username && (
                              <span className="ml-3">
                                恢復者: {backup.restored_by_username}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${typeInfo.bg} ${typeInfo.color}`}>
                          {typeInfo.text}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`mr-2 ${statusInfo.color}`}>
                            {statusInfo.icon}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          <div>{formatFileSize(backup.file_size)}</div>
                          {backup.record_count && (
                            <div className="text-xs text-gray-400">
                              {backup.record_count} 條記錄
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div>
                          <div>{formatDate(backup.created_at)}</div>
                          {backup.expires_at && (
                            <div className="text-xs text-gray-400">
                              過期: {formatDate(backup.expires_at)}
                            </div>
                          )}
                          {backup.restored_at && (
                            <div className="text-xs text-green-600">
                              恢復於: {formatDate(backup.restored_at)}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {backup.status === 'completed' && (
                            <>
                              <button
                                onClick={() => handleDownloadBackup(backup)}
                                className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                                title="下載備份"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleRestoreBackup(backup)}
                                disabled={restoring}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded disabled:opacity-50"
                                title="恢復備份"
                              >
                                <Upload className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          
                          {backup.status !== 'in_progress' && (
                            <button
                              onClick={() => handleDeleteBackup(backup)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="刪除備份"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* 分頁控制 */}
        {filteredBackups.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                顯示 <span className="font-medium">{startIndex + 1}</span> 到{' '}
                <span className="font-medium">{Math.min(endIndex, filteredBackups.length)}</span> 的{' '}
                <span className="font-medium">{filteredBackups.length}</span> 個結果
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
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={5}>5 條/頁</option>
                  <option value={10}>10 條/頁</option>
                  <option value={20}>20 條/頁</option>
                  <option value={50}>50 條/頁</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 創建備份模態框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">創建新備份</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備份名稱 *
                  </label>
                  <input
                    type="text"
                    value={newBackupName}
                    onChange={(e) => setNewBackupName(e.target.value)}
                    placeholder="例如：系統完整備份_20260228"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備份描述（可選）
                  </label>
                  <textarea
                    value={newBackupDescription}
                    onChange={(e) => setNewBackupDescription(e.target.value)}
                    placeholder="描述備份內容和用途"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <p className="text-blue-800 font-medium">備份提示</p>
                      <p className="text-blue-700 text-sm mt-1">
                        備份過程可能需要幾分鐘時間，請勿關閉頁面。
                        建議在系統空閒時進行備份操作。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBackupName('');
                    setNewBackupDescription('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateBackup}
                  disabled={creating || !newBackupName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <Loader className="w-4 h-4 inline mr-2 animate-spin" />
                      創建中...
                    </>
                  ) : (
                    '開始創建備份'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 系統提示 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">重要提示</p>
            <ul className="text-yellow-700 text-sm mt-1 list-disc list-inside space-y-1">
              <li>定期備份是保護數據安全的重要措施</li>
              <li>建議至少每週進行一次完整備份</li>
              <li>備份文件會保留30天，過期後自動刪除</li>
              <li>恢復備份會覆蓋當前數據，請謹慎操作</li>
              <li>只有超級管理員可以執行恢復操作</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupManagement;
