// 雲端連線檢查系統
// 檢查是否與雲端資料庫保持連線並同步

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taiwan-landlord-test.zeabur.app/api'

// 通用 API 請求函數
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }))
    throw new Error(error.message || 'API 請求失敗')
  }

  return response.json()
}

// 雲端連線狀態
export interface CloudConnectionStatus {
  connected: boolean
  lastSync: string | null
  lastError: string | null
  syncInProgress: boolean
  pendingOperations: number
  serverTime: string | null
}

// 操作記錄（用於重試）
export interface OperationRecord {
  id: string
  type: string
  data: any
  timestamp: string
  retryCount: number
  lastError: string | null
}

class CloudConnectionManager {
  private static instance: CloudConnectionManager
  private status: CloudConnectionStatus = {
    connected: false,
    lastSync: null,
    lastError: null,
    syncInProgress: false,
    pendingOperations: 0,
    serverTime: null
  }
  
  private operationQueue: OperationRecord[] = []
  private listeners: Array<(status: CloudConnectionStatus) => void> = []
  private checkInterval: NodeJS.Timeout | null = null
  
  // 單例模式
  static getInstance(): CloudConnectionManager {
    if (!CloudConnectionManager.instance) {
      CloudConnectionManager.instance = new CloudConnectionManager()
    }
    return CloudConnectionManager.instance
  }
  
  // 初始化
  initialize() {
    // 開始定期檢查連線
    this.startConnectionCheck()
    
    // 加載未完成的操作隊列
    this.loadOperationQueue()
    
    // 嘗試初始連線
    this.checkConnection()
  }
  
  // 檢查雲端連線
  async checkConnection(): Promise<boolean> {
    try {
      this.status.syncInProgress = true
      this.notifyListeners()
      
      // 測試 API 連線 - 使用健康檢查端點
      const response = await fetch(`${API_URL.replace('/api', '')}/health`)
      const healthData = await response.json()
      
      if (response.ok && healthData.status === 'healthy') {
        this.status.connected = true
        this.status.lastError = null
        this.status.serverTime = healthData.timestamp || new Date().toISOString()
        
        // 連線成功，嘗試同步待處理操作
        if (this.operationQueue.length > 0) {
          this.processOperationQueue()
        }
      } else {
        this.status.connected = false
        this.status.lastError = healthData.error || '雲端服務不可用'
      }
      
      this.status.lastSync = new Date().toISOString()
      this.status.syncInProgress = false
      this.notifyListeners()
      
      return this.status.connected
    } catch (error) {
      this.status.connected = false
      this.status.lastError = error.message
      this.status.syncInProgress = false
      this.status.lastSync = new Date().toISOString()
      this.notifyListeners()
      
      return false
    }
  }
  
  // 開始定期檢查連線
  startConnectionCheck(intervalMs: number = 30000) {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    
    this.checkInterval = setInterval(() => {
      this.checkConnection()
    }, intervalMs)
  }
  
  // 停止檢查
  stopConnectionCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }
  
  // 同步數據到雲端
  async syncToCloud(data: any, operationType: string): Promise<boolean> {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const operation: OperationRecord = {
      id: operationId,
      type: operationType,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      lastError: null
    }
    
    // 添加到隊列
    this.operationQueue.push(operation)
    this.status.pendingOperations = this.operationQueue.length
    this.saveOperationQueue()
    this.notifyListeners()
    
    // 立即嘗試同步
    return this.processOperation(operation)
  }
  
  // 處理單個操作
  private async processOperation(operation: OperationRecord): Promise<boolean> {
    try {
      // 根據後端實際可用的 API 進行同步
      let result
      
      // 目前後端只有備份和版本管理 API
      // 所以我們將所有數據更新視為「創建版本」操作
      if (operation.type.startsWith('update_')) {
        // 將數據更新轉換為版本創建
        const versionData = {
          name: `自動同步 - ${operation.type}`,
          description: `自動同步操作: ${operation.type}`,
          data: operation.data,
          tags: ['auto-sync', operation.type]
        }
        
        // 調用版本創建 API
        result = await apiRequest('/versions', {
          method: 'POST',
          body: JSON.stringify(versionData)
        })
      } else {
        // 其他操作暫時不支持
        console.warn(`操作類型 ${operation.type} 目前不支援雲端同步`)
        result = { success: false, error: '不支援的操作類型' }
      }
      
      if (result.success) {
        // 同步成功，從隊列中移除
        this.operationQueue = this.operationQueue.filter(op => op.id !== operation.id)
        this.status.pendingOperations = this.operationQueue.length
        this.saveOperationQueue()
        this.notifyListeners()
        
        return true
      } else {
        // 同步失敗，更新重試次數
        operation.retryCount += 1
        operation.lastError = result.error || '同步失敗'
        
        if (operation.retryCount >= 3) {
          // 重試次數過多，移到失敗隊列
          console.error(`操作 ${operation.type} 同步失敗:`, operation.lastError)
          this.operationQueue = this.operationQueue.filter(op => op.id !== operation.id)
        }
        
        this.saveOperationQueue()
        this.notifyListeners()
        
        return false
      }
    } catch (error) {
      operation.retryCount += 1
      operation.lastError = error.message
      
      if (operation.retryCount >= 3) {
        console.error(`操作 ${operation.type} 同步失敗:`, error.message)
        this.operationQueue = this.operationQueue.filter(op => op.id !== operation.id)
      }
      
      this.saveOperationQueue()
      this.notifyListeners()
      
      return false
    }
  }
  
  // 處理操作隊列
  private async processOperationQueue() {
    if (this.operationQueue.length === 0 || this.status.syncInProgress) {
      return
    }
    
    this.status.syncInProgress = true
    this.notifyListeners()
    
    // 複製隊列，避免在處理過程中修改
    const queueToProcess = [...this.operationQueue]
    
    for (const operation of queueToProcess) {
      if (operation.retryCount < 3) {
        await this.processOperation(operation)
      }
    }
    
    this.status.syncInProgress = false
    this.notifyListeners()
  }
  
  // 保存操作隊列到本地存儲
  private saveOperationQueue() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cloud_operation_queue', JSON.stringify(this.operationQueue))
      } catch (e: any) {
        if (e.name === 'QuotaExceededError') {
          console.warn('localStorage 已滿，操作隊列無法保存')
        } else {
          console.error('localStorage 儲存失敗:', e)
        }
      }
    }
  }
  
  // 從本地存儲加載操作隊列
  private loadOperationQueue() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cloud_operation_queue')
      if (saved) {
        try {
          this.operationQueue = JSON.parse(saved)
          this.status.pendingOperations = this.operationQueue.length
        } catch (error) {
          console.error('加載操作隊列失敗:', error)
          this.operationQueue = []
        }
      }
    }
  }
  
  // 清空操作隊列
  clearOperationQueue() {
    this.operationQueue = []
    this.status.pendingOperations = 0
    this.saveOperationQueue()
    this.notifyListeners()
  }
  
  // 獲取當前狀態
  getStatus(): CloudConnectionStatus {
    return { ...this.status }
  }
  
  // 獲取操作隊列
  getOperationQueue(): OperationRecord[] {
    return [...this.operationQueue]
  }
  
  // 從雲端獲取所有數據
  async getAllData(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      this.status.syncInProgress = true
      this.notifyListeners()
      
      console.log('從雲端獲取所有數據...')
      
      // 使用 sync/all 端點獲取所有數據
      const response = await apiRequest('/sync/all', {
        method: 'GET'
      })
      
      this.status.syncInProgress = false
      this.status.lastSync = new Date().toISOString()
      this.status.lastError = null
      this.notifyListeners()
      
      console.log('從雲端獲取數據成功')
      
      return {
        success: true,
        data: response.data || {}
      }
    } catch (error: any) {
      console.error('從雲端獲取數據失敗:', error)
      
      this.status.syncInProgress = false
      this.status.lastError = error.message || '獲取數據失敗'
      this.notifyListeners()
      
      return {
        success: false,
        error: error.message || '無法從雲端獲取數據'
      }
    }
  }
  
  // 添加狀態監聽器
  addListener(listener: (status: CloudConnectionStatus) => void) {
    this.listeners.push(listener)
    
    // 立即通知當前狀態
    listener(this.getStatus())
    
    // 返回移除函數
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }
  
  // 通知所有監聽器
  private notifyListeners() {
    const status = this.getStatus()
    this.listeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('通知監聽器失敗:', error)
      }
    })
  }
  
  // 檢查是否允許操作（基於雲端連線狀態）
  canPerformOperation(operationType: string): { allowed: boolean; reason?: string } {
    // 高風險操作需要雲端連線
    const highRiskOperations = [
      'rent_room',
      'check_in',
      'check_out',
      'collect_payment',
      'update_tenant',
      'create_contract'
    ]
    
    const isHighRisk = highRiskOperations.includes(operationType)
    
    if (isHighRisk && !this.status.connected) {
      return {
        allowed: false,
        reason: '此操作需要雲端連線，請檢查網絡連接或稍後重試'
      }
    }
    
    // 如果有很多待處理操作，建議等待
    if (this.status.pendingOperations > 10) {
      return {
        allowed: true,
        reason: '系統有較多待同步操作，可能會稍有延遲'
      }
    }
    
    return { allowed: true }
  }
}

// 導出單例
export const cloudConnection = CloudConnectionManager.getInstance()

// React Hook
export const useCloudConnection = () => {
  // 這裡可以實現一個 React Hook
  // 但為了簡單起見，直接導出管理器
  return cloudConnection
}

export default cloudConnection