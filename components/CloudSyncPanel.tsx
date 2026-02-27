'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  History,
  Trash2,
  Shield,
  Database
} from 'lucide-react';
import { cloudSync, useCloudSync, SyncStatus } from '@/lib/cloudSync';
import api from '@/lib/api';

const CloudSyncPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    message: string;
  } | null>(null);
  const [backupList, setBackupList] = useState<Array<{ timestamp: string; stats: any }>>([]);
  const [userInfo, setUserInfo] = useState<{ username?: string; role?: string } | null>(null);
  
  const sync = useCloudSync();

  // 加載初始數據
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    // 檢查連接狀態
    const connection = await sync.checkConnection();
    setConnectionStatus(connection);

    // 獲取備份列表
    setBackupList(sync.getBackupList());

    // 如果已登入，獲取用戶信息
    if (api.auth.isAuthenticated()) {
      try {
        const result = await api.auth.getCurrentUser();
        if (result.success) {
          setUserInfo(result.data.user);
        }
      } catch (error) {
        console.error('獲取用戶信息失敗:', error);
      }
    }
  };

  const handleBackup = async () => {
    const result = await sync.backup();
    alert(result.message);
    
    if (result.success) {
      // 刷新備份列表
      setBackupList(sync.getBackupList());
      loadInitialData();
    }
  };

  const handleRestore = async (index: number) => {
    if (!confirm('確定要恢復這個備份嗎？這會覆蓋當前本地數據。')) {
      return;
    }

    const result = await sync.restore(index);
    alert(result.message);
    
    if (result.success) {
      // 刷新頁面以加載恢復的數據
      window.location.reload();
    }
  };

  const handleClearBackups = () => {
    if (confirm('確定要清除所有雲端備份嗎？')) {
      sync.clearBackups();
      setBackupList([]);
      alert('已清除所有備份');
    }
  };

  const handleStartAutoSync = () => {
    sync.startAutoSync(1); // 每小時自動同步
    alert('已啟用每小時自動同步');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} 分鐘前`;
    } else if (diffHours < 24) {
      return `${diffHours} 小時前`;
    } else {
      return `${diffDays} 天前`;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
      >
        <Cloud size={20} />
        <span>雲端同步</span>
        {sync.status.lastSync && (
          <span className="text-xs bg-blue-800 px-2 py-1 rounded">
            {formatTimeAgo(sync.status.lastSync)}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${connectionStatus?.connected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {connectionStatus?.connected ? <Cloud size={24} /> : <CloudOff size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">雲端同步</h2>
              <p className="text-sm text-gray-600">
                {connectionStatus?.connected ? '已連接雲端服務' : '雲端連接中斷'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 狀態卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Database size={18} className="text-blue-600" />
                <h3 className="font-medium text-blue-800">本地數據</h3>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">物業:</span>
                  <span className="font-medium">{sync.status.stats.properties}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">房間:</span>
                  <span className="font-medium">{sync.status.stats.rooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">付款記錄:</span>
                  <span className="font-medium">{sync.status.stats.payments}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cloud size={18} className="text-green-600" />
                <h3 className="font-medium text-green-800">同步狀態</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {sync.status.lastSync ? (
                    <>
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-sm">最後同步: {formatDate(sync.status.lastSync)}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-yellow-500" />
                      <span className="text-sm">從未同步</span>
                    </>
                  )}
                </div>
                {sync.status.syncInProgress && (
                  <div className="flex items-center gap-2">
                    <RefreshCw size={16} className="animate-spin text-blue-500" />
                    <span className="text-sm text-blue-600">同步進行中...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={18} className="text-purple-600" />
                <h3 className="font-medium text-purple-800">帳號狀態</h3>
              </div>
              <div className="space-y-2">
                {userInfo ? (
                  <>
                    <div className="text-sm">
                      <span className="text-gray-600">用戶: </span>
                      <span className="font-medium">{userInfo.username}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">權限: </span>
                      <span className="font-medium">{userInfo.role}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-600">
                    未登入雲端帳號
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 操作按鈕 */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={handleBackup}
              disabled={sync.status.syncInProgress || !connectionStatus?.connected}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <Upload size={20} />
              <span>立即備份到雲端</span>
            </button>

            <button
              onClick={handleStartAutoSync}
              disabled={!connectionStatus?.connected}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors"
            >
              <RefreshCw size={20} />
              <span>啟用自動同步</span>
            </button>
          </div>

          {/* 備份歷史 */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History size={20} className="text-gray-600" />
                <h3 className="font-medium text-gray-800">備份歷史</h3>
              </div>
              {backupList.length > 0 && (
                <button
                  onClick={handleClearBackups}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                  清除所有
                </button>
              )}
            </div>

            {backupList.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Cloud size={48} className="mx-auto mb-3 text-gray-300" />
                <p>還沒有雲端備份</p>
                <p className="text-sm mt-1">點擊「立即備份」創建第一個備份</p>
              </div>
            ) : (
              <div className="space-y-3">
                {backupList.map((backup, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border"
                  >
                    <div>
                      <div className="font-medium">{formatDate(backup.timestamp)}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        物業: {backup.stats.properties} | 
                        房間: {backup.stats.rooms} | 
                        記錄: {backup.stats.total}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(index)}
                        className="flex items-center gap-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm"
                      >
                        <Download size={14} />
                        恢復
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 連接狀態 */}
          {connectionStatus && (
            <div className={`mt-6 p-4 rounded-lg ${connectionStatus.connected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start gap-3">
                {connectionStatus.connected ? (
                  <CheckCircle size={20} className="text-green-500 mt-0.5" />
                ) : (
                  <XCircle size={20} className="text-red-500 mt-0.5" />
                )}
                <div>
                  <p className={`font-medium ${connectionStatus.connected ? 'text-green-800' : 'text-red-800'}`}>
                    {connectionStatus.connected ? '雲端服務正常' : '雲端服務異常'}
                  </p>
                  <p className="text-sm mt-1 text-gray-600">{connectionStatus.message}</p>
                  {!connectionStatus.connected && (
                    <p className="text-sm mt-2 text-gray-600">
                      請檢查網路連接，或確認後端服務是否正常運行。
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按鈕 */}
        <div className="border-t p-4 flex justify-between">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            關閉
          </button>
          <div className="text-sm text-gray-500">
            後端: {process.env.NEXT_PUBLIC_API_URL || '未設置'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudSyncPanel;