// API 服務層 - 連接 Zeabur 後端
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api';

// 獲取 Token 從 localStorage
const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// 設置 Token 到 localStorage
const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('auth_token', token);
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        console.warn('localStorage 已滿，無法保存認證 Token')
      } else {
        console.error('localStorage 儲存失敗:', e)
      }
    }
  }
};

// 移除 Token
const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

// 通用 API 請求函數
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }));
    throw new Error(error.message || 'API 請求失敗');
  }

  return response.json();
};

// 用戶認證 API
export const authAPI = {
  // 註冊
  register: async (data: {
    username: string;
    password: string;
    role?: string;
    full_name?: string;
  }) => {
    const result = await apiRequest<{
      success: boolean;
      data?: { user: any; token: string };
      message: string;
      error?: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (result.success && result.data?.token) {
      setToken(result.data.token);
    }

    return result;
  },

  // 登入
  login: async (data: { username: string; password: string }) => {
    const result = await apiRequest<{
      success: boolean;
      data?: { user: any; token: string };
      message: string;
      error?: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (result.success && result.data?.token) {
      setToken(result.data.token);
    }

    return result;
  },

  // 獲取當前用戶
  getCurrentUser: async () => {
    return apiRequest<{
      success: boolean;
      data: { user: any };
      message: string;
    }>('/auth/me');
  },

  // 登出
  logout: () => {
    removeToken();
  },

  // 檢查是否已登入
  isAuthenticated: (): boolean => {
    return !!getToken();
  },
};

// 物業管理 API
export const propertyAPI = {
  // 創建物業
  create: async (data: {
    name: string;
    address?: string;
    owner_name?: string;
    owner_phone?: string;
  }) => {
    return apiRequest<{
      success: boolean;
      data: { property: any };
      message: string;
    }>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 獲取物業列表
  list: async () => {
    return apiRequest<{
      success: boolean;
      data: { properties: any[]; count: number };
      message: string;
    }>('/properties');
  },

  // 獲取單個物業
  get: async (id: number) => {
    return apiRequest<{
      success: boolean;
      data: { property: any };
      message: string;
    }>(`/properties/${id}`);
  },

  // 更新物業
  update: async (id: number, data: Partial<any>) => {
    return apiRequest<{
      success: boolean;
      data: { property: any };
      message: string;
    }>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 刪除物業
  delete: async (id: number) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  // 獲取物業的所有房間
  getRooms: async (propertyId: number, filters?: {
    status?: string;
    floor?: number;
    available_only?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.floor) queryParams.append('floor', filters.floor.toString());
    if (filters?.available_only) queryParams.append('available_only', 'true');
    
    const queryString = queryParams.toString();
    const url = `/properties/${propertyId}/rooms${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      success: boolean;
      data: { rooms: any[] };
      message: string;
    }>(url);
  },
};

// 房間管理 API
export const roomAPI = {
  // 獲取所有房間
  list: async (filters?: {
    property_id?: number;
    status?: string;
    floor?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.property_id) queryParams.append('property_id', filters.property_id.toString());
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.floor) queryParams.append('floor', filters.floor.toString());
    
    const queryString = queryParams.toString();
    const url = `/rooms${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      success: boolean;
      data: { rooms: any[]; count: number };
      message: string;
    }>(url);
  },

  // 獲取單個房間
  get: async (id: number) => {
    return apiRequest<{
      success: boolean;
      data: { room: any };
      message: string;
    }>(`/rooms/${id}`);
  },

  // 創建房間
  create: async (data: any) => {
    return apiRequest<{
      success: boolean;
      data: { room: any };
      message: string;
    }>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新房間
  update: async (id: number, data: Partial<any>) => {
    return apiRequest<{
      success: boolean;
      data: { room: any };
      message: string;
    }>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 刪除房間
  delete: async (id: number) => {
    return apiRequest<{
      success: boolean;
      data: { room: any };
      message: string;
    }>(`/rooms/${id}`, {
      method: 'DELETE',
    });
  },

  // 更新房間狀態（出租、退租等）
  updateStatus: async (id: number, data: {
    status: string;
    tenant_name?: string;
    check_in_date?: string;
    check_out_date?: string;
    rent?: number;
    deposit?: number;
  }) => {
    return apiRequest<{
      success: boolean;
      data: { room: any };
      message: string;
    }>(`/rooms/${id}/status`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 付款管理 API
export const paymentAPI = {
  // 獲取所有付款記錄
  list: async (filters?: {
    room_id?: number;
    month?: string;
    status?: string;
    payment_type?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.room_id) queryParams.append('room_id', filters.room_id.toString());
    if (filters?.month) queryParams.append('month', filters.month);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.payment_type) queryParams.append('payment_type', filters.payment_type);
    
    const queryString = queryParams.toString();
    const url = `/payments${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      success: boolean;
      data: { payments: any[]; count: number; stats: any };
      message: string;
    }>(url);
  },

  // 獲取單個付款記錄
  get: async (id: number) => {
    return apiRequest<{
      success: boolean;
      data: { payment: any };
      message: string;
    }>(`/payments/${id}`);
  },

  // 創建付款記錄
  create: async (data: any) => {
    return apiRequest<{
      success: boolean;
      data: { payment: any };
      message: string;
    }>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新付款記錄
  update: async (id: number, data: Partial<any>) => {
    return apiRequest<{
      success: boolean;
      data: { payment: any };
      message: string;
    }>(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 刪除付款記錄
  delete: async (id: number) => {
    return apiRequest<{
      success: boolean;
      data: { payment: any };
      message: string;
    }>(`/payments/${id}`, {
      method: 'DELETE',
    });
  },

  // 標記付款為已支付
  markAsPaid: async (id: number, data: {
    payment_method?: string;
    payment_date?: string;
    notes?: string;
  }) => {
    return apiRequest<{
      success: boolean;
      data: { payment: any };
      message: string;
    }>(`/payments/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// 租客管理 API
export const tenantAPI = {
  // 獲取所有租客
  list: async (filters?: {
    property_id?: number;
    room_id?: number;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.property_id) queryParams.append('property_id', filters.property_id.toString());
    if (filters?.room_id) queryParams.append('room_id', filters.room_id.toString());
    if (filters?.status) queryParams.append('status', filters.status);
    
    const queryString = queryParams.toString();
    const url = `/tenants${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      success: boolean;
      data: { tenants: any[]; count: number };
      message: string;
    }>(url);
  },

  // 獲取單個租客
  get: async (id: number) => {
    return apiRequest<{
      success: boolean;
      data: { tenant: any };
      message: string;
    }>(`/tenants/${id}`);
  },

  // 創建租客
  create: async (data: any) => {
    return apiRequest<{
      success: boolean;
      data: { tenant: any };
      message: string;
    }>('/tenants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新租客
  update: async (id: number, data: Partial<any>) => {
    return apiRequest<{
      success: boolean;
      data: { tenant: any };
      message: string;
    }>(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 刪除租客
  delete: async (id: number) => {
    return apiRequest<{
      success: boolean;
      data: { tenant: any };
      message: string;
    }>(`/tenants/${id}`, {
      method: 'DELETE',
    });
  },

  // 獲取租客的付款記錄
  getPayments: async (id: number) => {
    return apiRequest<{
      success: boolean;
      data: { tenant: any; payments: any[]; count: number };
      message: string;
    }>(`/tenants/${id}/payments`);
  },
};

// 數據同步 API
export const syncAPI = {
  // 獲取所有數據
  getAllData: async () => {
    return apiRequest<{
      success: boolean;
      data: {
        properties: any[];
        rooms: any[];
        payments: any[];
        tenants: any[];
        maintenance: any[];
        history: any[];
        sync_timestamp: string;
      };
      message: string;
    }>('/sync/all');
  },

  // 批量同步操作
  batchSync: async (operations: Array<{
    type: string;
    data: any;
    id?: number;
  }>) => {
    return apiRequest<{
      success: boolean;
      data: {
        results: any[];
        errors: any[];
        total: number;
        successful: number;
        failed: number;
      };
      message: string;
    }>('/sync/batch', {
      method: 'POST',
      body: JSON.stringify({ operations }),
    });
  },

  // 檢查同步狀態
  getStatus: async () => {
    return apiRequest<{
      success: boolean;
      data: {
        rooms: any;
        payments: any;
        tenants: any;
        last_sync: string;
        server_time: string;
      };
      message: string;
    }>('/sync/status');
  },
};

// 數據遷移 API（將 localStorage 數據遷移到後端）
export const migrationAPI = {
  // 遷移物業數據
  migrateProperties: async (properties: any[]) => {
    // 這裡可以實現批量遷移邏輯
    console.log('遷移物業數據:', properties.length);
    // 實際實現會遍歷 properties 並調用 propertyAPI.create
  },

  // 遷移房間數據
  migrateRooms: async (rooms: any[]) => {
    console.log('遷移房間數據:', rooms.length);
    // 待實現
  },

  // 遷移付款記錄
  migratePayments: async (payments: any[]) => {
    console.log('遷移付款記錄:', payments.length);
    // 待實現
  },
};

// 備份管理 API
export const backupAPI = {
  // 獲取所有備份排程
  getSchedules: async () => {
    return apiRequest<{
      success: boolean;
      data: { schedules: any[] };
      message: string;
    }>('/backup/schedules');
  },

  // 獲取單個備份排程
  getSchedule: async (id: number) => {
    return apiRequest<{
      success: boolean;
      data: { schedule: any };
      message: string;
    }>(`/backup/schedules/${id}`);
  },

  // 創建備份排程
  createSchedule: async (data: any) => {
    return apiRequest<{
      success: boolean;
      data: { schedule: any };
      message: string;
    }>('/backup/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新備份排程
  updateSchedule: async (id: number, data: Partial<any>) => {
    return apiRequest<{
      success: boolean;
      data: { schedule: any };
      message: string;
    }>(`/backup/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 刪除備份排程
  deleteSchedule: async (id: number) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>(`/backup/schedules/${id}`, {
      method: 'DELETE',
    });
  },

  // 獲取備份歷史
  getBackupHistory: async (filters?: {
    scheduleId?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.scheduleId) queryParams.append('scheduleId', filters.scheduleId.toString());
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.status) queryParams.append('status', filters.status);
    
    const queryString = queryParams.toString();
    const url = `/backup/history${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      success: boolean;
      data: { history: any[]; count: number };
      message: string;
    }>(url);
  },

  // 手動觸發備份
  triggerBackup: async (scheduleId?: number) => {
    const url = scheduleId ? `/backup/trigger/${scheduleId}` : '/backup/trigger';
    return apiRequest<{
      success: boolean;
      data: { backupId: number };
      message: string;
    }>(url, {
      method: 'POST',
    });
  },

  // 恢復備份
  restoreBackup: async (backupId: number) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>(`/backup/restore/${backupId}`, {
      method: 'POST',
    });
  },
};

// 版本管理 API
export const versionAPI = {
  // 獲取所有版本
  getVersions: async (filters?: {
    name?: string;
    startDate?: string;
    endDate?: string;
    tags?: string[];
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.name) queryParams.append('name', filters.name);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.tags) queryParams.append('tags', filters.tags.join(','));
    
    const queryString = queryParams.toString();
    const url = `/versions${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest<{
      success: boolean;
      data: { versions: any[]; count: number };
      message: string;
    }>(url);
  },

  // 獲取單個版本
  getVersion: async (id: number) => {
    return apiRequest<{
      success: boolean;
      data: { version: any };
      message: string;
    }>(`/versions/${id}`);
  },

  // 創建版本
  createVersion: async (data: any) => {
    return apiRequest<{
      success: boolean;
      data: { version: any };
      message: string;
    }>('/versions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 更新版本
  updateVersion: async (id: number, data: Partial<any>) => {
    return apiRequest<{
      success: boolean;
      data: { version: any };
      message: string;
    }>(`/versions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 刪除版本
  deleteVersion: async (id: number) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>(`/versions/${id}`, {
      method: 'DELETE',
    });
  },

  // 恢復到版本
  restoreVersion: async (id: number) => {
    return apiRequest<{
      success: boolean;
      message: string;
    }>(`/versions/${id}/restore`, {
      method: 'POST',
    });
  },

  // 比較版本
  compareVersions: async (versionId1: number, versionId2: number) => {
    return apiRequest<{
      success: boolean;
      data: { differences: any[] };
      message: string;
    }>(`/versions/compare/${versionId1}/${versionId2}`);
  },

  // 獲取版本統計
  getVersionStats: async () => {
    return apiRequest<{
      success: boolean;
      data: {
        totalVersions: number;
        byMonth: Record<string, number>;
        byCreator: Record<string, number>;
        averageSize: number;
        totalSize: number;
      };
      message: string;
    }>('/versions/stats');
  },
};

// 健康檢查
export const healthAPI = {
  check: async () => {
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/health`);
      return response.json();
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  },
};

export default {
  auth: authAPI,
  property: propertyAPI,
  room: roomAPI,
  payment: paymentAPI,
  tenant: tenantAPI,
  sync: syncAPI,
  backup: backupAPI,
  version: versionAPI,
  migration: migrationAPI,
  health: healthAPI,
  getToken,
  setToken,
  removeToken,
};