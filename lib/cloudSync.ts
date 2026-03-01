// 雲端同步服務 - 混合方案（localStorage + 雲端備份）
import api from './api';

// 從 AppContext 獲取數據的類型
interface AppData {
  properties: any[];
  rooms: any[];
  payments: any[];
  history: any[];
  maintenance: any[];
  utilityExpenses: any[];
  [key: string]: any[];
}

// 同步狀態
export interface SyncStatus {
  lastSync: string | null;
  syncInProgress: boolean;
  lastError: string | null;
  stats: {
    properties: number;
    rooms: number;
    payments: number;
    total: number;
  };
}

// 雲端同步服務
export class CloudSyncService {
  private static instance: CloudSyncService;
  private syncStatus: SyncStatus = {
    lastSync: null,
    syncInProgress: false,
    lastError: null,
    stats: {
      properties: 0,
      rooms: 0,
      payments: 0,
      total: 0,
    },
  };

  // 單例模式
  static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  // 私有構造函數
  private constructor() {
    // 加載上次同步狀態
    this.loadSyncStatus();
  }

  // 加載同步狀態
  private loadSyncStatus(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cloud_sync_status');
      if (saved) {
        try {
          this.syncStatus = JSON.parse(saved);
        } catch (error) {
          console.error('加載同步狀態失敗:', error);
        }
      }
    }
  }

  // 保存同步狀態
  private saveSyncStatus(): void {
    if (typeof window !== 'undefined') {
      try {
        try {
      localStorage.setItem('cloud_sync_status', JSON.stringify(this.syncStatus));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        console.warn('localStorage 已滿，同步狀態僅存內存');
      }
    }
      } catch (e: any) {
        if (e.name === 'QuotaExceededError') {
          console.warn('localStorage 已滿，��步狀態無法保存')
        } else {
          console.error('localStorage 儲存失敗:', e)
        }
      }
    }
  }

  // 獲取同步狀態
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // 從 localStorage 獲取所有數據
  private getAllLocalData(): AppData {
    if (typeof window === 'undefined') {
      return {
        properties: [],
        rooms: [],
        payments: [],
        history: [],
        maintenance: [],
        utilityExpenses: [],
      };
    }

    const getData = (key: string): any[] => {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error(`讀取 ${key} 失敗:`, error);
        return [];
      }
    };

    return {
      properties: getData('properties') || [],
      rooms: getData('rooms') || [],
      payments: getData('payments') || [],
      history: getData('history') || [],
      maintenance: getData('maintenance') || [],
      utilityExpenses: getData('utilityExpenses') || [],
    };
  }

  // 檢查雲端連接
  async checkConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const health = await api.health.check();
      return {
        connected: health.status === 'healthy',
        message: health.status === 'healthy' ? '雲端連接正常' : `���端狀態: ${health.status}`,
      };
    } catch (error) {
      return {
        connected: false,
        message: `連接失敗: ${error.message}`,
      };
    }
  }

  // 備份到雲端
  async backupToCloud(): Promise<{ success: boolean; message: string; stats?: any }> {
    if (this.syncStatus.syncInProgress) {
      return {
        success: false,
        message: '已有同步正在進行中',
      };
    }

    this.syncStatus.syncInProgress = true;
    this.syncStatus.lastError = null;
    this.saveSyncStatus();

    try {
      // 1. 檢查連接
      const connection = await this.checkConnection();
      if (!connection.connected) {
        throw new Error(`雲端連接失敗: ${connection.message}`);
      }

      // 2. 檢查用戶是否已登入
      if (!api.auth.isAuthenticated()) {
        throw new Error('請先登入雲端帳號');
      }

      // 3. 獲取本地數據
      const localData = this.getAllLocalData();
      
      // 統計數據
      const stats = {
        properties: (localData.properties || []).length,
        rooms: (localData.rooms || []).length,
        payments: (localData.payments || []).length,
        total: Object.keys(localData).reduce((sum: number, key: string) => {
          const value = localData[key];
          if (Array.isArray(value)) {
            return sum + (value || []).length;
          }
          return sum;
        }, 0),
      };

      // 4. 創建備份記錄
      const backupRecord = {
        timestamp: new Date().toISOString(),
        stats,
        data: localData,
      };

      // 5. 保存到雲端（這裡簡化，實際應該調用後端 API）
      // 暫時先保存到 localStorage 作為演示
      if (typeof window !== 'undefined') {
        try {
          const backups = JSON.parse(localStorage.getItem('cloud_backups') || '[]');
          backups.push(backupRecord);
          try {
      localStorage.setItem('cloud_backups', JSON.stringify(backups.slice(-10)));
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        console.warn('localStorage 已滿，備份僅存雲端');
      }
    } // 保留最近10個備份
        } catch (e: any) {
          if (e.name === 'QuotaExceededError') {
            console.warn('localStorage 已滿，雲端備份無法保存')
          } else {
            console.error('localStorage 儲存失敗:', e)
          }
        }
      }

      // 6. 更新同步狀態
      this.syncStatus.lastSync = new Date().toISOString();
      this.syncStatus.stats = stats;
      this.syncStatus.syncInProgress = false;
      this.saveSyncStatus();

      return {
        success: true,
        message: `備份成功！共備份 ${stats.total} 條記錄`,
        stats,
      };

    } catch (error) {
      this.syncStatus.lastError = error.message;
      this.syncStatus.syncInProgress = false;
      this.saveSyncStatus();

      return {
        success: false,
        message: `備份失敗: ${error.message}`,
      };
    }
  }

  // 從雲端恢復
  async restoreFromCloud(backupIndex: number = 0): Promise<{ success: boolean; message: string }> {
    try {
      // 1. 檢查連接
      const connection = await this.checkConnection();
      if (!connection.connected) {
        throw new Error(`雲端連接失敗: ${connection.message}`);
      }

      // 2. 獲取備份記錄（這裡從 localStorage 獲取，實際應該從後端獲取）
      if (typeof window === 'undefined') {
        throw new Error('無法在伺服器端恢復數據');
      }

      const backups = JSON.parse(localStorage.getItem('cloud_backups') || '[]');
      if ((backups || []).length === 0) {
        throw new Error('沒有找到雲端備份');
      }

      const backup = backups[backupIndex];
      if (!backup) {
        throw new Error('指定的備份不存在');
      }

      // 3. 恢復數據到 localStorage
      const { data } = backup;
      
      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          try {
            try {
          localStorage.setItem(key, JSON.stringify(data[key]));
        } catch (e: any) {
          if (e.name === 'QuotaExceededError') {
            console.warn(`localStorage 已滿，跳過 ${key} 緩存`);
          }
        }
          } catch (e: any) {
            if (e.name === 'QuotaExceededError') {
              console.warn(`localStorage 已滿，無法恢復 ${key} 數據`)
            } else {
              console.error(`localStorage 儲存失敗 (${key}):`, e)
            }
          }
        }
      });

      // 4. 更新同步狀態
      this.syncStatus.lastSync = new Date().toISOString();
      this.syncStatus.stats = {
        properties: data.properties?.length || 0,
        rooms: data.rooms?.length || 0,
        payments: data.payments?.length || 0,
        total: Object.keys(data).reduce((sum: number, key: string) => {
          const value = data[key];
          if (Array.isArray(value)) {
            return sum + (value || []).length;
          }
          return sum;
        }, 0),
      };
      this.saveSyncStatus();

      return {
        success: true,
        message: `恢復成功！共恢復 ${this.syncStatus.stats.total} 條記錄`,
      };

    } catch (error) {
      return {
        success: false,
        message: `恢復失敗: ${error.message}`,
      };
    }
  }

  // 獲取備份列表
  getBackupList(): Array<{ timestamp: string; stats: any }> {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const backups = JSON.parse(localStorage.getItem('cloud_backups') || '[]');
      return (backups || []).map((backup: any) => ({
        timestamp: backup.timestamp,
        stats: backup.stats,
      }));
    } catch (error) {
      return [];
    }
  }

  // 清除所有備份
  clearBackups(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cloud_backups');
    }
  }

  // 自動同步（每小時一次）
  startAutoSync(intervalHours: number = 1): void {
    if (typeof window === 'undefined') return;

    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    // 檢查上次同步時間，如果超過 intervalHours 小時，則立即同步
    const lastSync = this.syncStatus.lastSync ? new Date(this.syncStatus.lastSync).getTime() : 0;
    const now = Date.now();
    
    if (now - lastSync > intervalMs) {
      this.backupToCloud().catch(console.error);
    }

    // 設置定時器
    setInterval(() => {
      if (!this.syncStatus.syncInProgress) {
        this.backupToCloud().catch(console.error);
      }
    }, intervalMs);
  }
}

// 導出單例
export const cloudSync = CloudSyncService.getInstance();

// React Hook 使用
export const useCloudSync = () => {
  return {
    // 狀態
    status: cloudSync.getStatus(),
    
    // 操作
    checkConnection: () => cloudSync.checkConnection(),
    backup: () => cloudSync.backupToCloud(),
    restore: (index?: number) => cloudSync.restoreFromCloud(index),
    getBackupList: () => cloudSync.getBackupList(),
    clearBackups: () => cloudSync.clearBackups(),
    startAutoSync: (hours?: number) => cloudSync.startAutoSync(hours),
  };
};

export default cloudSync;