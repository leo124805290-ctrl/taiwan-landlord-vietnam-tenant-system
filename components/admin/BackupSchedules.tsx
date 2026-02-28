import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  RefreshCw,
  Download,
  BarChart3,
  Settings,
  Bell,
  Shield,
  Loader
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  enabled: boolean;
  created_at: string;
  last_run: string | null;
  next_run: string;
  note?: string;
}

interface BackupExecution {
  id: string;
  schedule_id: string | null;
  manual: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  size: number;
}

const BackupSchedules: React.FC = () => {
  const { api, showToast } = useApp();
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [history, setHistory] = useState<BackupExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<BackupSchedule | null>(null);
  const [executing, setExecuting] = useState<string | null>(null);

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
    time: '02:00',
    enabled: true
  });

  // 載入排程列表
  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/backup/schedules');
      if (response.success) {
        setSchedules(response.schedules || []);
      }
    } catch (error) {
      console.error('載入備份排程失敗:', error);
      showToast('載入備份排程失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 載備份歷史
  const loadHistory = async () => {
    try {
      const response = await api.get('/backup/history?limit=20');
      if (response.success) {
        setHistory(response.history || []);
      }
    } catch (error) {
      console.error('載入備份歷史失敗:', error);
    }
  };

  // 初始載入
  useEffect(() => {
    loadSchedules();
    loadHistory();
  }, []);

  // 創建新排程
  const handleCreateSchedule = async () => {
    try {
      const response = await api.post('/backup/schedules', formData);
      if (response.success) {
        showToast('備份排程創建成功', 'success');
        setShowCreateModal(false);
        setFormData({
          name: '',
          frequency: 'daily',
          time: '02:00',
          enabled: true
        });
        loadSchedules();
      }
    } catch (error) {
      console.error('創建備份排程失敗:', error);
      showToast('創建備份排程失敗', 'error');
    }
  };

  // 更新排程
  const handleUpdateSchedule = async () => {
    if (!selectedSchedule) return;
    
    try {
      const response = await api.put(`/backup/schedules/${selectedSchedule.id}`, formData);
      if (response.success) {
        showToast('備份排程更新成功', 'success');
        setShowEditModal(false);
        setSelectedSchedule(null);
        loadSchedules();
      }
    } catch (error) {
      console.error('更新備份排程失敗:', error);
      showToast('更新備份排程失敗', 'error');
    }
  };

  // 刪除排程
  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('確定要刪除這個備份排程嗎？')) return;
    
    try {
      const response = await api.delete(`/backup/schedules/${id}`);
      if (response.success) {
        showToast('備份排程刪除成功', 'success');
        loadSchedules();
      }
    } catch (error) {
      console.error('刪除備份排程失敗:', error);
      showToast('刪除備份排程失敗', 'error');
    }
  };

  // 切換排程狀態
  const handleToggleSchedule = async (schedule: BackupSchedule) => {
    try {
      const response = await api.put(`/backup/schedules/${schedule.id}`, {
        enabled: !schedule.enabled
      });
      if (response.success) {
        showToast(`排程已${!schedule.enabled ? '啟用' : '停用'}`, 'success');
        loadSchedules();
      }
    } catch (error) {
      console.error('切換排程狀態失敗:', error);
      showToast('切換排程狀態失敗', 'error');
    }
  };

  // 手動執行備份
  const handleExecuteBackup = async (scheduleId?: string) => {
    try {
      setExecuting(scheduleId || 'manual');
      const response = await api.post('/backup/execute', {
        schedule_id: scheduleId,
        manual: true
      });
      if (response.success) {
        showToast('備份執行成功', 'success');
        loadSchedules();
        loadHistory();
      }
    } catch (error) {
      console.error('執行備份失敗:', error);
      showToast('執行備份失敗', 'error');
    } finally {
      setExecuting(null);
    }
  };

  // 格式化時間
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
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

  // 計算距離下次執行的時間
  const getTimeUntilNextRun = (nextRun: string) => {
    const now = new Date();
    const next = new Date(nextRun);
    const diffMs = next.getTime() - now.getTime();
    
    if (diffMs <= 0) return '即將執行';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}小時${diffMinutes}分鐘後`;
    } else {
      return `${diffMinutes}分鐘後`;
    }
  };

  // 獲取頻率顯示文字
  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '每日';
      case 'weekly': return '每週';
      case 'monthly': return '每月';
      default: return frequency;
    }
  };

  // 獲取狀態圖標
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress': return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">載入備份排程中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 標題和操作按鈕 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">自動備份排程</h1>
          <p className="text-gray-600 mt-1">設定和管理自動備份排程，確保數據安全</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleExecuteBackup()}
            disabled={executing === 'manual'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {executing === 'manual' ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            手動執行備份
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增排程
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">總排程數</p>
              <p className="text-2xl font-bold">{schedules.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">啟用排程</p>
              <p className="text-2xl font-bold">{schedules.filter(s => s.enabled).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">即將執行</p>
              <p className="text-2xl font-bold">
                {schedules.filter(s => s.enabled && new Date(s.next_run) <= new Date(Date.now() + 3600000)).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">今日備份</p>
              <p className="text-2xl font-bold">
                {history.filter(h => new Date(h.started_at).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 排程列表 */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">備份排程列表</h2>
          <p className="text-sm text-gray-600 mt-1">管理所有自動備份排程</p>
        </div>
        
        {schedules.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2">尚未設定任何備份排程</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              創建第一個排程
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排程名稱</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">頻率</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">執行時間</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">下次執行</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-blue-500 mr-2" />
                        <div>
                          <p className="font-medium">{schedule.name}</p>
                          <p className="text-sm text-gray-500">創建於 {formatDate(schedule.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {getFrequencyText(schedule.frequency)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-mono">{formatTime(schedule.time)}</span>
                        {schedule.last_run && (
                          <span className="ml-2 text-xs text-gray-500">
                            上次: {formatDate(schedule.last_run)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${new Date(schedule.next_run) <= new Date(Date.now() + 3600000) ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                          {getTimeUntilNextRun(schedule.next_run)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {schedule.enabled ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 flex items-center">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            啟用中
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 flex items-center">
                            <Pause className="w-3 h-3 mr-1" />
                            已停用
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleExecuteBackup(schedule.id)}
                          disabled={executing === schedule.id}
                          className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          title="立即執行"
                        >
                          {executing === schedule.id ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleSchedule(schedule)}
                          className="p-1 text-yellow-600 hover:text-yellow-800"
                          title={schedule.enabled ? '停用排程' : '啟用排程'}
                        >
                          {schedule.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setFormData({
                              name: schedule.name,
                              frequency: schedule.frequency,
                              time: schedule.time,
                              enabled: schedule.enabled
                            });
                            setShowEditModal(true);
                          }}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="編輯"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="刪除"
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

      {/* 備份歷史 */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">備份執行歷史</h2>
              <p className="text-sm text-gray-600 mt-1">最近的備份執行記錄</p>
            </div>
            <button
              onClick={loadHistory}
              className="p-2 text-gray-600 hover:text-gray-800"
              title="刷新"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto text-gray-300" />
            <p className="mt-2">尚無備份執行記錄</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">執行時間</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">類型</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">狀態</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">大小</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">持續時間</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{formatDate(item.started_at)}</p>
                        <p className="text-sm text-gray-500">ID: {item.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.manual ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">手動執行</span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">自動排程</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(item.status)}
                        <span className="ml-2 capitalize">{item.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Download className="w-4 h-4 text-gray-400 mr-1" />
                        <span>{(item.size / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.completed_at ? (
                        <span>
                          {Math.round((new Date(item.completed_at).getTime() - new Date(item.started_at).getTime()) / 1000)} 秒
                        </span>
                      ) : (
                        <span className="text-gray-400">進行中</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 創建排程模態框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">創建備份排程</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排程名稱</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例如：每日凌晨備份"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備份頻率</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">每日</option>
                  <option value="weekly">每週</option>
                  <option value="monthly">每月</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">執行時間</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">建議設定在系統使用率低的時段</p>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="enabled" className="ml-2 text-sm text-gray-700">
                  立即啟用此排程
                </label>
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
                onClick={handleCreateSchedule}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                創建排程
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯排程模態框 */}
      {showEditModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold">編輯備份排程</h3>
              <p className="text-sm text-gray-600">ID: {selectedSchedule.id}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">排程名稱</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備份頻率</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">每日</option>
                  <option value="weekly">每週</option>
                  <option value="monthly">每月</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">執行時間</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="edit-enabled" className="ml-2 text-sm text-gray-700">
                  啟用此排程
                </label>
              </div>
              {selectedSchedule.last_run && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">最後執行: {formatDate(selectedSchedule.last_run)}</p>
                  <p className="text-sm text-gray-600">下次執行: {formatDate(selectedSchedule.next_run)}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSchedule(null);
                }}
                className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleUpdateSchedule}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                更新排程
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupSchedules;