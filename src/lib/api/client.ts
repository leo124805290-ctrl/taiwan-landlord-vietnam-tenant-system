// API客戶端 - 簡化套房出租管理系統
import { 
  SimpleRoom, SimplePayment, SimpleTenant, SimpleProperty,
  ApiResponse, PaginatedResponse,
  CreateRoomRequest, UpdateRoomRequest, CheckInRequest, CheckOutRequest, CreatePaymentRequest
} from '@/src/types/simple'

// API配置
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000, // 10秒超時
  headers: {
    'Content-Type': 'application/json',
  },
}

// 錯誤處理類
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public details?: any,
    public status?: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API客戶端類
export class ApiClient {
  private baseURL: string
  private timeout: number

  constructor(config = API_CONFIG) {
    this.baseURL = config.baseURL
    this.timeout = config.timeout
  }

  // 基礎請求方法
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const url = `${this.baseURL}${endpoint}`
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...API_CONFIG.headers,
          ...options.headers,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data: ApiResponse<T> = await response.json()

      if (!data.success) {
        throw new ApiError(
          data.error?.code || 'UNKNOWN_ERROR',
          data.error?.message || '未知錯誤',
          data.error?.details,
          response.status
        )
      }

      return data.data as T

    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof ApiError) {
        throw error
      }
      
      if (error.name === 'AbortError') {
        throw new ApiError('TIMEOUT', '請求超時', null, 408)
      }
      
      throw new ApiError(
        'NETWORK_ERROR',
        error instanceof Error ? error.message : '網路錯誤',
        null,
        0
      )
    }
  }

  // ==================== 房間管理 API ====================

  // 獲取房間列表
  async getRooms(params?: {
    page?: number
    pageSize?: number
    status?: string
    propertyId?: string
    search?: string
  }): Promise<PaginatedResponse<SimpleRoom>> {
    const query = new URLSearchParams()
    
    if (params?.page) query.set('page', params.page.toString())
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString())
    if (params?.status) query.set('status', params.status)
    if (params?.propertyId) query.set('propertyId', params.propertyId)
    if (params?.search) query.set('search', params.search)
    
    const queryString = query.toString()
    const endpoint = `/rooms${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<SimpleRoom>>(endpoint)
  }

  // 獲取單個房間
  async getRoom(roomId: string): Promise<SimpleRoom> {
    return this.request<SimpleRoom>(`/rooms/${roomId}`)
  }

  // 創建房間
  async createRoom(data: CreateRoomRequest): Promise<SimpleRoom> {
    return this.request<SimpleRoom>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // 更新房間
  async updateRoom(roomId: string, data: UpdateRoomRequest): Promise<SimpleRoom> {
    return this.request<SimpleRoom>(`/rooms/${roomId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // 刪除房間
  async deleteRoom(roomId: string): Promise<{ deleted: boolean }> {
    return this.request<{ deleted: boolean }>(`/rooms/${roomId}`, {
      method: 'DELETE',
    })
  }

  // 入住操作
  async checkInRoom(roomId: string, data: CheckInRequest): Promise<{
    room: SimpleRoom
    payment?: SimplePayment
  }> {
    return this.request<{
      room: SimpleRoom
      payment?: SimplePayment
    }>(`/rooms/${roomId}/check-in`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // 退房操作
  async checkOutRoom(roomId: string, data: CheckOutRequest): Promise<{
    room: SimpleRoom
    finalPayment?: SimplePayment
    depositRefund?: number
  }> {
    return this.request<{
      room: SimpleRoom
      finalPayment?: SimplePayment
      depositRefund?: number
    }>(`/rooms/${roomId}/check-out`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // 設為維修
  async setRoomMaintenance(
    roomId: string, 
    data?: { reason?: string; estimatedDays?: number }
  ): Promise<SimpleRoom> {
    return this.request<SimpleRoom>(`/rooms/${roomId}/maintenance`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    })
  }

  // ==================== 付款管理 API ====================

  // 獲取付款記錄
  async getPayments(params?: {
    roomId?: string
    type?: string
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<SimplePayment>> {
    const query = new URLSearchParams()
    
    if (params?.roomId) query.set('roomId', params.roomId)
    if (params?.type) query.set('type', params.type)
    if (params?.status) query.set('status', params.status)
    if (params?.startDate) query.set('startDate', params.startDate)
    if (params?.endDate) query.set('endDate', params.endDate)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString())
    
    const queryString = query.toString()
    const endpoint = `/payments${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<SimplePayment>>(endpoint)
  }

  // 創建付款記錄
  async createPayment(data: CreatePaymentRequest): Promise<SimplePayment> {
    return this.request<SimplePayment>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // 更新付款狀態
  async updatePaymentStatus(
    paymentId: string, 
    status: string
  ): Promise<SimplePayment> {
    return this.request<SimplePayment>(`/payments/${paymentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // ==================== 租客管理 API ====================

  // 獲取租客列表
  async getTenants(params?: {
    search?: string
    page?: number
    pageSize?: number
  }): Promise<PaginatedResponse<SimpleTenant>> {
    const query = new URLSearchParams()
    
    if (params?.search) query.set('search', params.search)
    if (params?.page) query.set('page', params.page.toString())
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString())
    
    const queryString = query.toString()
    const endpoint = `/tenants${queryString ? `?${queryString}` : ''}`
    
    return this.request<PaginatedResponse<SimpleTenant>>(endpoint)
  }

  // 獲取租客詳情
  async getTenant(tenantId: string): Promise<
    SimpleTenant & {
      currentRooms: SimpleRoom[]
      paymentHistory: SimplePayment[]
    }
  > {
    return this.request<
      SimpleTenant & {
        currentRooms: SimpleRoom[]
        paymentHistory: SimplePayment[]
      }
    >(`/tenants/${tenantId}`)
  }

  // ==================== 統計報表 API ====================

  // 房間統計
  async getRoomStats(propertyId?: string): Promise<{
    total: number
    available: number
    occupied: number
    maintenance: number
    occupancyRate: number
    totalMonthlyRent: number
    averageRent: number
    totalDeposit: number
  }> {
    const query = new URLSearchParams()
    if (propertyId) query.set('propertyId', propertyId)
    
    const queryString = query.toString()
    const endpoint = `/stats/rooms${queryString ? `?${queryString}` : ''}`
    
    return this.request(endpoint)
  }

  // 財務統計
  async getFinancialStats(params?: {
    startDate?: string
    endDate?: string
    propertyId?: string
  }): Promise<{
    totalRentReceived: number
    totalDepositHeld: number
    totalElectricityDue: number
    pendingPayments: number
    pendingPaymentsCount: number
    monthlyTrend?: Array<{
      month: string
      rent: number
      electricity: number
      other: number
    }>
  }> {
    const query = new URLSearchParams()
    
    if (params?.startDate) query.set('startDate', params.startDate)
    if (params?.endDate) query.set('endDate', params.endDate)
    if (params?.propertyId) query.set('propertyId', params.propertyId)
    
    const queryString = query.toString()
    const endpoint = `/stats/financial${queryString ? `?${queryString}` : ''}`
    
    return this.request(endpoint)
  }

  // ==================== 工具方法 ====================

  // 批量操作
  async batchOperation<T>(operations: Array<() => Promise<T>>): Promise<T[]> {
    return Promise.all(operations.map(op => op()))
  }

  // 重試機制
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: Error
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        // 如果是客戶端錯誤，不重試
        if (error instanceof ApiError && error.status && error.status < 500) {
          throw error
        }
        
        // 最後一次嘗試，直接拋出錯誤
        if (i === maxRetries - 1) {
          throw error
        }
        
        // 等待後重試
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
      }
    }
    
    throw lastError!
  }
}

// 創建全局API客戶端實例
export const apiClient = new ApiClient()

// React Hook for API（可選）
export function useApi() {
  return apiClient
}

// 工具函數：處理API錯誤
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    // 根據錯誤碼返回用戶友好的消息
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return '輸入數據驗證失敗，請檢查後重試'
      case 'NOT_FOUND':
        return '請求的資源不存在'
      case 'UNAUTHORIZED':
        return '請先登入'
      case 'FORBIDDEN':
        return '沒有權限執行此操作'
      case 'CONFLICT':
        return '資源衝突，請檢查後重試'
      case 'TIMEOUT':
        return '請求超時，請檢查網路連接'
      case 'NETWORK_ERROR':
        return '網路錯誤，請檢查連接'
      default:
        return error.message || '發生未知錯誤'
    }
  }
  
  return error instanceof Error ? error.message : '發生未知錯誤'
}

// 工具函數：創建API響應
export function createApiResponse<T>(
  data?: T,
  error?: { code: string; message: string; details?: any }
): ApiResponse<T> {
  return {
    success: !error,
    data: error ? undefined : data,
    error,
    timestamp: new Date().toISOString(),
  }
}