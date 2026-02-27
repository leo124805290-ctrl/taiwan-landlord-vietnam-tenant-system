'use client';

import React, { useState } from 'react';
import { Cloud, Upload, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { cloudData } from '@/lib/cloudDataService';
import api from '@/lib/api';

interface MigrateToCloudProps {
  onComplete?: () => void;
}

const MigrateToCloud: React.FC<MigrateToCloudProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<{
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    details?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 獲取本地數據
  const getLocalData = () => {
    if (typeof window === 'undefined') return { properties: [], rooms: [], payments: [] };

    const getData = (key: string): any[] => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
      } catch {
        return [];
      }
    };

    return {
      properties: getData('properties'),
      rooms: getData('rooms'),
      payments: getData('payments'),
      history: getData('history'),
      maintenance: getData('maintenance'),
      utilityExpenses: getData('utilityExpenses'),
    };
  };

  const handleStartMigration = async () => {
    setIsLoading(true);
    setStatus({ message: '開始遷移...', type: 'info' });
    setStep(1);

    try {
      // 步驟 1: 檢查登入狀態
      if (!api.auth.isAuthenticated()) {
        setStatus({ 
          message: '請先登入雲端帳號', 
          type: 'error',
          details: '需要雲端帳號才能遷移數據'
        });
        setIsLoading(false);
        return;
      }

      setStatus({ message: '已登入，檢查本地數據...', type: 'info' });
      await new Promise(resolve => setTimeout(resolve, 500));

      // 步驟 2: 獲取本地數據
      const localData = getLocalData();
      const totalRecords = Object.values(localData).reduce((sum, arr) => sum + arr.length, 0);
      
      if (totalRecords === 0) {
        setStatus({ 
          message: '本地沒有數據可遷移', 
          type: 'warning',
          details: '請先在本地創建一些數據'
        });
        setIsLoading(false);
        return;
      }

      setStep(2);
      setStatus({ 
        message: `找到 ${totalRecords} 條本地記錄`, 
        type: 'info',
        details: `物業: ${localData.properties.length}, 房間: ${localData.rooms.length}, 付款: ${localData.payments.length}`
      });
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 步驟 3: 上傳到雲端
      setStep(3);
      setStatus({ message: '上傳數據到雲端...', type: 'info' });

      const uploadResult = await cloudData.uploadToCloud(localData);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message);
      }

      // 步驟 4: 同步最新數據
      setStep(4);
      setStatus({ message: '同步雲端數據...', type: 'info' });

      const syncResult = await cloudData.syncFromCloud();
      
      if (!syncResult.success) {
        throw new Error(syncResult.message);
      }

      // 完成
      setStep(5);
      setStatus({ 
        message: '遷移完成！', 
        type: 'success',
        details: `成功遷移 ${syncResult.stats?.properties || 0} 個物業到雲端`
      });

      // 觸發完成回調
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1500);
      }

    } catch (error) {
      setStatus({ 
        message: '遷移失敗', 
        type: 'error',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    const username = prompt('請輸入用戶名:');
    if (!username) return;
    
    const password = prompt('請輸入密碼:');
    if (!password) return;

    try {
      const result = await api.auth.login({ username, password });
      if (result.success) {
        setStatus({ message: '登入成功！', type: 'success' });
        // 重新開始遷移
        setTimeout(() => handleStartMigration(), 1000);
      } else {
        setStatus({ message: `登入失敗: ${result.message}`, type: 'error' });
      }
    } catch (error) {
      setStatus({ message: `登入錯誤: ${error.message}`, type: 'error' });
    }
  };

  const handleRegister = async () => {
    const username = prompt('請輸入用戶名:');
    if (!username) return;
    
    const password = prompt('請輸入密碼:');
    if (!password) return;

    try {
      const result = await api.auth.register({ 
        username, 
        password, 
        role: 'admin',
        full_name: username
      });
      if (result.success) {
        setStatus({ message: '註冊成功！已自動登入', type: 'success' });
        // 重新開始遷移
        setTimeout(() => handleStartMigration(), 1000);
      } else {
        setStatus({ message: `註冊失敗: ${result.message}`, type: 'error' });
      }
    } catch (error) {
      setStatus({ message: `註冊錯誤: ${error.message}`, type: 'error' });
    }
  };

  const getStepIcon = (stepNumber: number) => {
    if (step > stepNumber) return <CheckCircle className="text-green-500" size={20} />;
    if (step === stepNumber) return <RefreshCw className="text-blue-500 animate-spin" size={20} />;
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
  };

  const getStepText = (stepNumber: number) => {
    const steps = [
      '檢查登入狀態',
      '分析本地數據',
      '上傳到雲端',
      '同步數據',
      '完成遷移'
    ];
    return steps[stepNumber - 1] || `步驟 ${stepNumber}`;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-lg transition-all"
      >
        <Cloud size={20} />
        <span>遷移到雲端</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* 標題欄 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Cloud size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">遷移到雲端</h2>
              <p className="text-sm text-gray-600">將本地數據遷移到雲端資料庫</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        {/* 內容區域 */}
        <div className="p-6">
          {/* 步驟指示器 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4, 5].map((stepNum) => (
                <div key={stepNum} className="flex flex-col items-center">
                  {getStepIcon(stepNum)}
                  <span className="text-xs mt-1 text-gray-600">{getStepText(stepNum)}</span>
                </div>
              ))}
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-purple-600 transition-all duration-500"
                style={{ width: `${(step - 1) * 25}%` }}
              />
            </div>
          </div>

          {/* 狀態訊息 */}
          {status && (
            <div className={`mb-6 p-4 rounded-lg ${
              status.type === 'success' ? 'bg-green-50 border border-green-200' :
              status.type === 'error' ? 'bg-red-50 border border-red-200' :
              status.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              <div className="flex items-start gap-3">
                {status.type === 'success' ? <CheckCircle size={20} className="text-green-500 mt-0.5" /> :
                 status.type === 'error' ? <XCircle size={20} className="text-red-500 mt-0.5" /> :
                 <RefreshCw size={20} className="text-blue-500 mt-0.5" />}
                <div>
                  <p className={`font-medium ${
                    status.type === 'success' ? 'text-green-800' :
                    status.type === 'error' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>
                    {status.message}
                  </p>
                  {status.details && (
                    <p className="text-sm mt-1 text-gray-600">{status.details}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="space-y-3">
            {!api.auth.isAuthenticated() ? (
              <>
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <Cloud size={20} />
                  <span>登入雲端帳號</span>
                </button>

                <button
                  onClick={handleRegister}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <Cloud size={20} />
                  <span>註冊雲端帳號</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleStartMigration}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-lg transition-colors"
              >
                {isLoading ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <Upload size={20} />
                )}
                <span>{isLoading ? '遷移中...' : '開始遷移到雲端'}</span>
              </button>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isLoading}
            >
              取消
            </button>
          </div>

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">遷移說明</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 將本地數據永久保存到雲端</li>
              <li>• 支援多設備同步訪問</li>
              <li>• 數據不會因清除緩存而丟失</li>
              <li>• 需要網路連接</li>
              <li>• 遷移後可繼續在本地操作</li>
            </ul>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="border-t p-4 text-center text-sm text-gray-500">
          後端: {process.env.NEXT_PUBLIC_API_URL || '未設置'}
        </div>
      </div>
    </div>
  );
};

export default MigrateToCloud;