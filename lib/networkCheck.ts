// 網絡檢查工具
// 用於實現「即時同步 + 離線只讀」策略

/**
 * 檢查當前網絡狀態
 * @returns {boolean} 是否在線
 */
export const isOnline = (): boolean => {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

/**
 * 檢查是否允許操作
 * @param {string} operationType 操作類型
 * @returns {boolean} 是否允許
 */
export const canPerformOperation = (operationType: string): boolean => {
  // 如果離線，檢查是否為只讀操作
  if (!isOnline()) {
    const readOnlyOperations = [
      'view',
      'read',
      'export',
      'print',
      'search',
      'filter',
      'sort'
    ]
    
    // 檢查操作類型是否包含只讀關鍵字
    const isReadOnly = readOnlyOperations.some(op => 
      operationType.toLowerCase().includes(op)
    )
    
    return isReadOnly
  }
  
  // 在線時允許所有操作
  return true
}

/**
 * 獲取網絡狀態訊息
 * @returns {object} 狀態訊息
 */
export const getNetworkStatus = () => {
  const online = isOnline()
  
  return {
    online,
    message: online 
      ? '系統在線，所有功能正常' 
      : '系統離線，只能查看內容',
    icon: online ? '✅' : '⚠️',
    color: online ? 'green' : 'yellow'
  }
}

/**
 * 驗證操作並提供用戶反饋
 * @param {string} operationType 操作類型
 * @param {Function} onSuccess 成功回調
 * @param {Function} onFailure 失敗回調
 * @returns {boolean} 是否通過驗證
 */
export const validateOperation = (
  operationType: string,
  onSuccess?: () => void,
  onFailure?: (message: string) => void
): boolean => {
  const canPerform = canPerformOperation(operationType)
  
  if (!canPerform) {
    const message = `無法執行「${operationType}」操作：當前處於離線模式，只能查看內容。`
    
    if (onFailure) {
      onFailure(message)
    } else {
      alert(message)
    }
    
    return false
  }
  
  if (onSuccess) {
    onSuccess()
  }
  
  return true
}

/**
 * 高風險操作列表（必須在線）
 */
export const HIGH_RISK_OPERATIONS = [
  // 房間管理
  'rent_room',        // 出租房間
  'check_in',         // 入住
  'check_out',        // 退租
  'cancel_reservation', // 取消預訂
  'change_room_status', // 變更房間狀態
  
  // 財務操作
  'collect_payment',  // 收款
  'record_payment',   // 記錄付款
  'update_payment',   // 更新付款
  'refund_deposit',   // 退押金
  
  // 租客管理
  'add_tenant',       // 添加租客
  'update_tenant',    // 更新租客
  'remove_tenant',    // 移除租客
  
  // 合約管理
  'create_contract',  // 創建合約
  'update_contract',  // 更新合約
  'terminate_contract', // 終止合約
  
  // 維修管理
  'add_maintenance',  // 添加維修
  'update_maintenance', // 更新維修
  'complete_maintenance', // 完成維修
  
  // 系統設置
  'update_settings',  // 更新設置
  'backup_data',      // 備份數據
  'restore_data'      // 恢復數據
]

/**
 * 檢查是否為高風險操作
 * @param {string} operationType 操作類型
 * @returns {boolean} 是否為高風險
 */
export const isHighRiskOperation = (operationType: string): boolean => {
  return HIGH_RISK_OPERATIONS.some(op => 
    operationType.toLowerCase().includes(op.toLowerCase())
  )
}

/**
 * 執行帶網絡檢查的操作
 * @param {string} operationType 操作類型
 * @param {Function} operation 要執行的操作
 * @returns {Promise<any>} 操作結果
 */
export const executeWithNetworkCheck = async (
  operationType: string,
  operation: () => Promise<any>
): Promise<any> => {
  // 檢查網絡
  if (!isOnline()) {
    throw new Error(`無法執行「${operationType}」：請檢查網絡連接`)
  }
  
  // 檢查是否為高風險操作
  if (isHighRiskOperation(operationType) && !isOnline()) {
    throw new Error(`無法執行「${operationType}」：此操作需要網絡連接`)
  }
  
  try {
    // 執行操作
    const result = await operation()
    return result
  } catch (error) {
    console.error(`操作「${operationType}」失敗:`, error)
    throw error
  }
}

/**
 * 添加網絡狀態監聽器
 * @param {Function} callback 狀態變化回調
 * @returns {Function} 移除監聽器的函數
 */
export const addNetworkListener = (callback: (online: boolean) => void): () => void => {
  if (typeof window === 'undefined') {
    return () => {}
  }
  
  const handleOnline = () => callback(true)
  const handleOffline = () => callback(false)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // 返回移除函數
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}

export default {
  isOnline,
  canPerformOperation,
  getNetworkStatus,
  validateOperation,
  isHighRiskOperation,
  executeWithNetworkCheck,
  addNetworkListener
}