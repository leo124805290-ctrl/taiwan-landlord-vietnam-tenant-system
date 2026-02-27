// 雲端數據服務 - 雲端為主架構
import api from './api';

// 數據類型
export interface CloudProperty {
  id: number;
  name: string;
  address?: string;
  owner_name?: string;
  owner_phone?: string;
  created_at: string;
  updated_at: string;
}

export interface CloudRoom {
  id: number;
  property_id: number;
  name: string;
  status: 'available' | 'occupied' | 'maintenance';
  tenant_name?: string;
  rent?: number;
  deposit?: number;
  check_in_date?: string;
  check_out_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CloudPayment {
  id: number;
  room_id: number;
  type: 'rent' | 'deposit' | 'electricity' | 'water' | 'other';
  amount: number;
  date: string;
  status: 'pending' | 'paid' | 'overdue';
  description?: string;
  created_at: string;
  updated_at: string;
}

// 雲端數據服務
export class CloudDataService {
  private static instance: CloudDataService;
  private localCache: {
    properties: CloudProperty[];
    rooms: CloudRoom[];
    payments: CloudPayment[];
    lastSync: string | null;
  } = {
    properties: [],
    rooms: [],
    payments: [],
    lastSync: null,
  };

  // 單例模式
  static getInstance(): CloudDataService {
    if (!CloudDataService.instance) {
      CloudDataService.instance = new CloudDataService();
    }
    return CloudDataService.instance;
  }

  // 私有構造函數
  private constructor() {
    this.loadLocalCache();
  }

  // 加載本地緩存
  private loadLocalCache(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cloud_data_cache');
      if (saved) {
        try {
          this.localCache = JSON.parse(saved);
        } catch (error) {
          console.error('加載本地緩存失敗:', error);
        }
      }
    }
  }

  // 保存本地緩存
  private saveLocalCache(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cloud_data_cache', JSON.stringify(this.localCache));
    }
  }

  // 檢查是否已登入
  isAuthenticated(): boolean {
    return api.auth.isAuthenticated();
  }

  // 同步所有數據（從雲端下載）
  async syncFromCloud(): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      // 1. 檢查登入狀態
      if (!this.isAuthenticated()) {
        throw new Error('請先登入雲端帳號');
      }

      // 2. 獲取物業列表
      const propertiesResult = await api.property.list();
      if (!propertiesResult.success) {
        throw new Error(`獲取物業失敗: ${propertiesResult.message}`);
      }

      // 3. 更新本地緩存
      this.localCache = {
        properties: propertiesResult.data.properties || [],
        rooms: [], // 暫時為空，需要實現房間 API
        payments: [], // 暫時為空，需要實現付款 API
        lastSync: new Date().toISOString(),
      };

      // 4. 保存緩存
      this.saveLocalCache();

      const stats = {
        properties: this.localCache.properties.length,
        rooms: this.localCache.rooms.length,
        payments: this.localCache.payments.length,
      };

      return {
        success: true,
        message: `同步成功！共同步 ${stats.properties} 個物業`,
        stats,
      };

    } catch (error) {
      return {
        success: false,
        message: `同步失敗: ${error.message}`,
      };
    }
  }

  // 上傳本地數據到雲端
  async uploadToCloud(localData: any): Promise<{ success: boolean; message: string }> {
    try {
      // 1. 檢查登入狀態
      if (!this.isAuthenticated()) {
        throw new Error('請先登入雲端帳號');
      }

      // 2. 上傳物業數據
      const properties = localData.properties || [];
      let uploadedCount = 0;

      for (const property of properties) {
        try {
          await api.property.create({
            name: property.name || '未命名物業',
            address: property.address,
            owner_name: property.owner_name,
            owner_phone: property.owner_phone,
          });
          uploadedCount++;
        } catch (error) {
          console.error(`上傳物業 ${property.name} 失敗:`, error);
        }
      }

      // 3. 同步最新數據
      await this.syncFromCloud();

      return {
        success: true,
        message: `上傳成功！共上傳 ${uploadedCount} 個物業`,
      };

    } catch (error) {
      return {
        success: false,
        message: `上傳失敗: ${error.message}`,
      };
    }
  }

  // 獲取物業列表
  getProperties(): CloudProperty[] {
    return [...this.localCache.properties];
  }

  // 獲取房間列表（根據物業）
  getRooms(propertyId?: number): CloudRoom[] {
    if (propertyId) {
      return this.localCache.rooms.filter(room => room.property_id === propertyId);
    }
    return [...this.localCache.rooms];
  }

  // 獲取付款記錄
  getPayments(roomId?: number): CloudPayment[] {
    if (roomId) {
      return this.localCache.payments.filter(payment => payment.room_id === roomId);
    }
    return [...this.localCache.payments];
  }

  // 創建物業
  async createProperty(data: Omit<CloudProperty, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; property?: CloudProperty; message: string }> {
    try {
      // 1. 上傳到雲端
      const result = await api.property.create(data);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // 2. 更新本地緩存
      this.localCache.properties.push(result.data.property);
      this.saveLocalCache();

      return {
        success: true,
        property: result.data.property,
        message: '創建物業成功',
      };

    } catch (error) {
      return {
        success: false,
        message: `創建物業失敗: ${error.message}`,
      };
    }
  }

  // 獲取同步狀態
  getSyncStatus() {
    return {
      lastSync: this.localCache.lastSync,
      stats: {
        properties: this.localCache.properties.length,
        rooms: this.localCache.rooms.length,
        payments: this.localCache.payments.length,
      },
      authenticated: this.isAuthenticated(),
    };
  }

  // 清除本地緩存
  clearCache(): void {
    this.localCache = {
      properties: [],
      rooms: [],
      payments: [],
      lastSync: null,
    };
    this.saveLocalCache();
  }

  // 轉換本地數據為雲端格式
  convertLocalToCloud(localData: any): {
    properties: Array<Omit<CloudProperty, 'id' | 'created_at' | 'updated_at'>>;
  } {
    const properties = (localData.properties || []).map((p: any) => ({
      name: p.name || '未命名物業',
      address: p.address,
      owner_name: p.owner_name,
      owner_phone: p.owner_phone,
    }));

    return { properties };
  }
}

// 導出單例
export const cloudData = CloudDataService.getInstance();

// React Hook
export const useCloudData = () => {
  return {
    // 數據
    properties: cloudData.getProperties(),
    rooms: cloudData.getRooms(),
    payments: cloudData.getPayments(),
    
    // 狀態
    syncStatus: cloudData.getSyncStatus(),
    isAuthenticated: cloudData.isAuthenticated(),
    
    // 操作
    syncFromCloud: () => cloudData.syncFromCloud(),
    uploadToCloud: (data: any) => cloudData.uploadToCloud(data),
    createProperty: (data: any) => cloudData.createProperty(data),
    clearCache: () => cloudData.clearCache(),
    convertLocalToCloud: (data: any) => cloudData.convertLocalToCloud(data),
  };
};

export default cloudData;