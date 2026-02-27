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
    localStorage.setItem('auth_token', token);
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
  migration: migrationAPI,
  health: healthAPI,
  getToken,
  setToken,
  removeToken,
};