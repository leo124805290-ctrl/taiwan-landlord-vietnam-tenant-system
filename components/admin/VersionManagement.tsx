import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  Eye,
  GitCompare,
  BarChart3,
  Calendar,
  FileText,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  RefreshCw,
  Download,
  Upload,
  Shield,
  Loader,
  Search,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Version {
  id: string;
  backup_id: string | null;
  name: string;
  description: string;
  tags: string[];
  type: 'backup' | 'manual';
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  created_by: string;
  data_size: number;
  metadata: {
    property_count: number;
    room_count: number;
    tenant_count: number;
    payment_count: number;
  };
  last_restored?: string;
  restore_count?: number;
}

interface RestoreResult {
  id: string;
  version_id: string;
  version_name: string;
  status: string;
  started_at: string;
  completed_at: string;
  restored_items: {
    properties: number;
    rooms: number;
    tenants: number;
    payments: number;
  };
  options: any;
}

interface VersionStats {
  total_versions: number;
  active_versions: number;
  backup_versions: number;
  manual_versions: number;
  total_data_size: number;
  average_version_size: number;
  versions_by_month: Record<string, number>;
  restore_count: number;
}

const VersionManagement: React.FC = () => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [stats, setStats] = useState<VersionStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [restoring, setRestoring] = useState<string | null>(null);

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
    backup_id: ''
  });

  // API 調用函數
  const api = {
    get: async (endpoint: string) => {
      try {
        const response = await fetch(`/api${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        return await response.json();
      } catch (error) {
        console.error('API GET error:', error);
        return { success: false, error: 'Network error' };
      }
    },
    
    post: async (endpoint: string, data: any) => {
      try {
        const response = await fetch(`/api${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return await response.json();
      } catch (error) {
        console.error('API POST error:', error);
        return { success: false, error: 'Network error' };
      }
    },
    
    delete: async (endpoint: string) => {
      try {
        const response = await fetch(`/api${endpoint}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        return await response.json();
      } catch (error) {
        console.error('API DELETE error:', error);
        return { success: false, error: 'Network error' };
      }
    }
  };

  // Toast 通知函數
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else if (type === 'success') {
      alert(`✅ ${message}`);
    } else {
      alert(`ℹ️ ${message}`);
    }
  };

  // 載入版本列表
  const loadVersions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/versions');
      if (response.success) {
        setVersions(response.versions || []);
      }
    } catch (error) {
      console.error('載入版本列表失敗:', error);
      showToast('載入版本列表失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 載入統計數據
  const loadStats = async () => {
    try {
      const response = await api.get('/versions/stats');
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('載入統計數據失敗:', error);
    }
  };

  // 初始載入
  useEffect(() => {
    loadVersions();
    loadStats();
  }, []);

  // 創建新版本
  const handleCreateVersion = async () => {
    try {
      const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await api.post('/versions', {
        name: formData.name,
        description: formData.description,
        tags: tags,
        backup_id: formData.backup_id || null
      });
      
      if (response.success) {
        showToast('版本創建成功', 'success');
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          tags: '',
          backup_id: ''
        });
        loadVersions();
        loadStats();
      }
    } catch (error) {
      console.error('創建版本失敗:', error);
      showToast('創建版本失敗', 'error');
    }
  };

  // 恢復版本
  const handleRestoreVersion = async (version: Version) => {
    if (!confirm(`確定要恢復版本 "${version.name}" 嗎？這將覆蓋當前數據。`)) {
      return;
    }
    
    try {
      setRestoring(version.id);
      const response = await api.post(`/versions/${version.id}/restore`, {
        confirm: true,
        options: {
          preserve_current: false,
          notify_on_complete: true
        }
      });
      
      if (response.success) {
        showToast('版本恢復成功', 'success');
        loadVersions();
        loadStats();
      }
    } catch (error) {
      console.error('恢復版本失敗:', error);
      showToast('恢復版本失敗', 'error');
    } finally {
      setRestoring(null);
    }
  };

  // 刪除版本
  const handleDeleteVersion = async (version: Version) => {
    if (!confirm(`確定要永久刪除版本 "${version.name}" 嗎？此操作無法恢復。`)) {
      return;
    }
    
    try {
      const response = await api.delete(`/versions/${version.id}`);
      if (response.success) {
        showToast('版本刪除成功', 'success');
        loadVersions();
        loadStats();
      }
    } catch (error) {
      console.error('刪除版本失敗:', error);
      showToast('刪除版本失敗', 'error');
    }
  };

  // 比較版本
  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      showToast('請選擇兩個版本進行比較', 'error');
      return;
    }
    
    setShowCompareModal(true);
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化相對時間
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} 週前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} 個月前`;
    return `${Math.floor(diffDays / 365)} 年前`;
  };

  // 獲取版本類型標籤
  const getVersionTypeBadge = (type: string) => {
    switch (type) {
      case 'backup':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">備份版本</span>;
      case 'manual':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">手動版本</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{type}</span>;
    }
  };

  // 獲取狀態圖標
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'archived':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'deleted':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // 篩選和排序版本
  const filteredAndSortedVersions = versions
    .filter(version => {
      // 搜索篩選
      if (searchTerm && !version.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !version.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // 類型篩選
      if (filterType !== 'all' && version.type !== filterType) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = b.data_size - a.data_size;
          break;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });

  // 處理版本選擇
  const handleVersionSelect = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else {
      if (selectedVersions.length < 2) {
        setSelectedVersions([...selectedVersions, versionId]);
      } else {
        showToast('最多只能選擇兩個版本進行比較', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">載入版本數據中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 標題和操作按鈕 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">版本管理</h1>
          <p className="text-gray-600 mt-1">管理數據版本，支持恢復和比較</p>
        </div>
        <div className="flex space-x-3">
          {selectedVersions.length === 2 && (
            <button
              onClick={handleCompareVersions}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              比較版本
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            創建版本
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <History className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">總版本數</p>
                <p className="text-2xl font-bold">{stats.total_versions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">總數據大小</p>
                <p className="text-2xl font-bold">{formatFileSize(stats.total_data_size)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <RotateCcw className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">恢復次數</p>
                <p className="text-2xl font-bold">{stats.restore_count}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-orange-500" />
              <div className="ml-3">
                <p className="text-sm text-gray-600">平均大小</p>
                <p className="text-2xl font-bold">{formatFileSize(stats.average_version_size)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 搜索和篩選 */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索版本名稱或描述..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-gray-400 mr-2" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有類型</option>
                <option value="backup">備份版本</option>
                <option value="manual">手動版本</option>
              </select>
            </div>
            <div className="flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">按日期排序</option>
                <option value="name">按名稱排序</option>
                <option value="size">按大小排序</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="ml-2 p-2 text-gray-600 hover:text-gray-800"
                title={sortOrder === 'asc' ? '升序' : '降序'}
              >
                {sortOrder === 'asc' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            <button
              onClick={loadVersions}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="刷新"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 版本列表 */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">版本列表</h2>
              <p className="text-sm text-gray-600 mt-1">
                共 {filteredAndSortedVersions.length} 個版本，已選擇 {selectedVersions.length} 個
              </p>
            </div>
            <div className="text-sm text-gray-500">
              點擊版本選擇進行比較（最多2個）
            </div>
          </div>
        </div>
        
        {filteredAndSortedVersions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <History className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2">找不到符合條件的版本</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              創建第一個版本
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedVersions.length === filteredAndSortedVersions.length && filteredAndSortedVersions.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVersions(filteredAndSortedVersions.slice(0, 2).map(v => v.id));
                        } else {
                          setSelectedVersions([]);
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">版本名稱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">類型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">創建時間</th>
                  <th className="px6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">數據大小</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedVersions.map((version) => (
                  <tr 
                    key={version.id} 
                    className={`hover:bg-gray-50 ${selectedVersions.includes(version.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedVersions.includes(version.id)}
                        onChange={() => handleVersionSelect(version.id)}
                        disabled={!selectedVersions.includes(version.id) && selectedVersions.length >= 2}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium">{version.name}</p>
                          <p className="text-sm text-gray-500">{version.description || '無描述'}</p>
                          {version.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {version.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getVersionTypeBadge(version.type)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{formatDate(version.created_at)}</p>
                        <p className="text-sm text-gray-500">{formatRelativeTime(version.created_at)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <BarChart3 className="w-4 h-4 text-gray-400 mr-1" />
                        <span>{formatFileSize(version.data_size)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {version.metadata.property_count} 物業, {version.metadata.room_count} 房間
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(version.status)}
                        <span className="ml-2 capitalize">{version.status}</span>
                      </div>
                      {version.last_restored && (
                        <p className="text-xs text-gray-500 mt-1">
                          最後恢復: {formatRelativeTime(version.last_restored)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRestoreVersion(version)}
                          disabled={restoring === version.id}
                          className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          title="恢復版本"
                        >
                          {restoring === version.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedVersion(version);
                            // 這裡可以打開詳情模態框
                          }}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="查看詳情"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVersion(version)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="刪除版本"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 創建版本模態框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">創建新版本</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">版本名稱 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：2024年1月數據備份"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">版本描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="描述此版本的內容和用途"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">標籤（用逗號分隔）</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：月度備份,重要,測試"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備份 ID（可選）</label>
                <input
                  type="text"
                  value={formData.backup_id}
                  onChange={(e) => setFormData({ ...formData, backup_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="從哪個備份創建版本"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateVersion}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                創建版本
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 版本比較模態框 */}
      {showCompareModal && selectedVersions.length === 2 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="px-6 py-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">版本比較</h3>
                <button
                  onClick={() => setShowCompareModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {selectedVersions.map((versionId, index) => {
                  const version = versions.find(v => v.id === versionId);
                  if (!version) return null;
                  
                  return (
                    <div key={versionId} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{version.name}</h4>
                          <p className="text-sm text-gray-600">{formatDate(version.created_at)}</p>
                        </div>
                        {getVersionTypeBadge(version.type)}
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">數據統計</h5>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">物業數量</span>
                            <span className="font-medium">{version.metadata.property_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">房間數量</span>
                            <span className="font-medium">{version.metadata.room_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">租客數量</span>
                            <span className="font-medium">{version.metadata.tenant_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">付款記錄</span>
                            <span className="font-medium">{version.metadata.payment_count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">數據大小</span>
                            <span className="font-medium">{formatFileSize(version.data_size)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="font-medium mb-2">描述</h5>
                        <p className="text-gray-700">{version.description || '無描述'}</p>
                      </div>
                      
                      {version.tags.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">標籤</h5>
                          <div className="flex flex-wrap gap-1">
                            {version.tags.map((tag, tagIndex) => (
                              <span key={tagIndex} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-semibold mb-4">比較結果</h4>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800">
                    選擇要恢復的版本，然後點擊「恢復版本」按鈕。恢復操作將覆蓋當前數據。
                  </p>
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowCompareModal(false)}
                      className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                    >
                      關閉
                    </button>
                    <button
                      onClick={() => {
                        const version = versions.find(v => v.id === selectedVersions[0]);
                        if (version) {
                          handleRestoreVersion(version);
                          setShowCompareModal(false);
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      恢復第一個版本
                    </button>
                    <button
                      onClick={() => {
                        const version = versions.find(v => v.id === selectedVersions[1]);
                        if (version) {
                          handleRestoreVersion(version);
                          setShowCompareModal(false);
                        }
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      恢復第二個版本
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionManagement;