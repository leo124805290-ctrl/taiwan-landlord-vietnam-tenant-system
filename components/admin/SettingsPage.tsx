import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  Globe, 
  Shield, 
  Database, 
  Bell,
  CheckCircle,
  AlertCircle,
  Loader,
  Settings as SettingsIcon
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface SettingItem {
  key: string;
  value: string;
  category: string;
  description?: string;
  updated_at?: string;
}

interface SettingsData {
  [key: string]: SettingItem;
}

const SettingsPage: React.FC = () => {
  const { state } = useApp();
  const [settings, setSettings] = useState<SettingsData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 默認設置（如果API不可用）
  const defaultSettings: SettingsData = {
    system_name: { key: 'system_name', value: '台灣房東系統', category: 'general', description: '系統名稱' },
    system_language: { key: 'system_language', value: 'zh-TW', category: 'general', description: '默認語言' },
    timezone: { key: 'timezone', value: 'Asia/Taipei', category: 'general', description: '時區' },
    date_format: { key: 'date_format', value: 'YYYY-MM-DD', category: 'general', description: '日期格式' },
    currency_format: { key: 'currency_format', value: 'TWD', category: 'general', description: '貨幣格式' },
    password_min_length: { key: 'password_min_length', value: '6', category: 'security', description: '密碼最小長度' },
    session_timeout_hours: { key: 'session_timeout_hours', value: '24', category: 'security', description: '會話超時時間（小時）' },
    login_attempt_limit: { key: 'login_attempt_limit', value: '5', category: 'security', description: '登入嘗試限制' },
    backup_retention_days: { key: 'backup_retention_days', value: '30', category: 'backup', description: '備份保留天數' },
    auto_backup_enabled: { key: 'auto_backup_enabled', value: 'true', category: 'backup', description: '自動備份啟用' },
    notification_enabled: { key: 'notification_enabled', value: 'true', category: 'notification', description: '通知啟用' }
  };
  
  // 設置分組
  const settingGroups = [
    {
      id: 'general',
      title: '通用設置',
      icon: <Globe className="w-5 h-5" />,
      description: '系統基本配置',
      settings: ['system_name', 'system_language', 'timezone', 'date_format', 'currency_format']
    },
    {
      id: 'security',
      title: '安全設置',
      icon: <Shield className="w-5 h-5" />,
      description: '系統安全相關配置',
      settings: ['password_min_length', 'session_timeout_hours', 'login_attempt_limit']
    },
    {
      id: 'backup',
      title: '備份設置',
      icon: <Database className="w-5 h-5" />,
      description: '數據備份相關配置',
      settings: ['backup_retention_days', 'auto_backup_enabled']
    },
    {
      id: 'notification',
      title: '通知設置',
      icon: <Bell className="w-5 h-5" />,
      description: '系統通知配置',
      settings: ['notification_enabled']
    }
  ];
  
  useEffect(() => {
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 這裡應該調用後端 API
      // const response = await fetch('/api/settings');
      // const data = await response.json();
      
      // 暫時使用默認設置
      setTimeout(() => {
        setSettings(defaultSettings);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      console.error('獲取設置失敗:', err);
      setError('無法載入系統設置');
      setSettings(defaultSettings); // 使用默認設置
      setLoading(false);
    }
  };
  
  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };
  
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // 這裡應該調用後端 API
      // const response = await fetch('/api/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ settings })
      // });
      // const data = await response.json();
      
      // 模擬保存成功
      setTimeout(() => {
        setSuccess('系統設置已成功保存！');
        setSaving(false);
        
        // 3秒後清除成功訊息
        setTimeout(() => setSuccess(null), 3000);
      }, 1000);
      
    } catch (err) {
      console.error('保存設置失敗:', err);
      setError('保存設置失敗，請重試');
      setSaving(false);
    }
  };
  
  const handleResetToDefault = () => {
    if (window.confirm('確定要重置所有設置為默認值嗎？')) {
      setSettings(defaultSettings);
      setSuccess('已重置為默認設置');
      
      // 3秒後清除成功訊息
      setTimeout(() => setSuccess(null), 3000);
    }
  };
  
  // 渲染設置輸入框
  const renderSettingInput = (setting: SettingItem) => {
    const { key, value, description } = setting;
    
    switch (key) {
      case 'system_language':
        return (
          <select
            value={value}
            onChange={(e) => handleSettingChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="zh-TW">繁體中文</option>
            <option value="vi-VN">越南文</option>
            <option value="en">英文</option>
          </select>
        );
      
      case 'timezone':
        return (
          <select
            value={value}
            onChange={(e) => handleSettingChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Asia/Taipei">台北 (UTC+8)</option>
            <option value="Asia/Ho_Chi_Minh">胡志明市 (UTC+7)</option>
            <option value="UTC">UTC</option>
          </select>
        );
      
      case 'date_format':
        return (
          <select
            value={value}
            onChange={(e) => handleSettingChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="YYYY-MM-DD">YYYY-MM-DD (2026-02-28)</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY (28/02/2026)</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY (02/28/2026)</option>
          </select>
        );
      
      case 'currency_format':
        return (
          <select
            value={value}
            onChange={(e) => handleSettingChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="TWD">新台幣 (TWD)</option>
            <option value="VND">越南盾 (VND)</option>
            <option value="USD">美元 (USD)</option>
          </select>
        );
      
      case 'auto_backup_enabled':
      case 'notification_enabled':
        return (
          <select
            value={value}
            onChange={(e) => handleSettingChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="true">啟用</option>
            <option value="false">禁用</option>
          </select>
        );
      
      default:
        return (
          <input
            type={key.includes('password') ? 'password' : 'text'}
            value={value}
            onChange={(e) => handleSettingChange(key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入系統設置中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* 標題和操作按鈕 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">系統設置</h1>
          <p className="text-gray-600 mt-1">配置系統參數和行為</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetToDefault}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            重置默認
          </button>
          
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                保存設置
              </>
            )}
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
      
      {/* 設置分組 */}
      <div className="space-y-6">
        {settingGroups.map((group) => {
          const groupSettings = group.settings
            .map(key => settings[key])
            .filter(Boolean);
          
          if (groupSettings.length === 0) return null;
          
          return (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* 分組標題 */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 mr-3">
                    {group.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{group.title}</h2>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                </div>
              </div>
              
              {/* 設置項目 */}
              <div className="p-6">
                <div className="space-y-6">
                  {groupSettings.map((setting) => (
                    <div key={setting.key} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {setting.description || setting.key}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          鍵: {setting.key}
                        </p>
                      </div>
                      
                      <div className="md:col-span-2">
                        {renderSettingInput(setting)}
                        {setting.updated_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            最後更新: {new Date(setting.updated_at).toLocaleString('zh-TW')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 系統信息 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">系統信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">當前用戶</span>
              <span className="font-medium">{state.user?.username || '未登入'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">用戶角色</span>
              <span className="font-medium capitalize">{state.user?.role || 'viewer'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">設置數量</span>
              <span className="font-medium">{Object.keys(settings).length}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">本地時間</span>
              <span className="font-medium">{new Date().toLocaleString('zh-TW')}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">時區</span>
              <span className="font-medium">{settings.timezone?.value || 'Asia/Taipei'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">系統版本</span>
              <span className="font-medium">1.0.0</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 保存提示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <SettingsIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <p className="text-blue-800 font-medium">設置保存提示</p>
            <p className="text-blue-700 text-sm mt-1">
              修改設置後請點擊「保存設置」按鈕。某些設置可能需要重啟系統或重新登入才能生效。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;