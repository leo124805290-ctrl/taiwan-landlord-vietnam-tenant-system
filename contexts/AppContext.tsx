'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AppState, AppData } from '@/lib/types'
import { initData, calcAllPayments } from '@/lib/utils'
import { cloudConnection } from '@/lib/cloudConnection'

interface AppContextType {
  state: AppState
  updateState: (updates: Partial<AppState>) => void
  updateData: (updates: Partial<AppData>, options?: {
    requireConfirmation?: boolean
    confirmationMessage?: string
    immediateSync?: boolean
  }) => void
  openModal: (type: string, data?: any) => void
  closeModal: () => void
  getCurrentProperty: () => any
  // 雲端用戶相關
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // 初始化狀態
  const [state, setState] = useState<AppState>({
    tab: 'rooms',
    lang: 'zh-TW',
    modal: null,
    filter: 'all',
    currentProperty: null,
    revenueTimeScope: 'all',
    revenueYear: 2026,
    revenueMonth: '2026-02',
    elecTimeScope: 'all',
    elecYear: 2026,
    elecMonth: '2026-02',
    data: initData(),
    // 新增：臨時篩選狀態
    tempRevenueTimeScope: 'all',
    tempRevenueYear: 2026,
    tempRevenueMonth: '2026-02',
    tempElecTimeScope: 'all',
    tempElecYear: 2026,
    tempElecMonth: '2026-02',
  })

  // 載入資料（雲端優先策略）
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. 先嘗試從雲端加載
        console.log('嘗試從雲端加載資料...')
        
        // 檢查雲端連接
        const connectionStatus = await cloudConnection.checkConnectionStatus()
        
        if (connectionStatus.connected) {
          try {
            // 從雲端獲取所有數據
            const cloudData = await cloudConnection.getAllData()
            
            if (cloudData && cloudData.success) {
              console.log('從雲端加載資料成功')
              
              // 使用雲端數據
              setState(prev => ({
                ...prev,
                data: cloudData.data || initData(),
                currentProperty: cloudData.data?.properties?.[0]?.id || null
              }))
              
              // 保存到本地緩存
              localStorage.setItem('multiPropertyDataV2', JSON.stringify(cloudData.data || initData()))
              return
            }
          } catch (cloudError) {
            console.warn('從雲端加載失敗，使用本地數據:', cloudError)
          }
        }
        
        // 2. 如果雲端失敗，使用本地數據
        const saved = localStorage.getItem('multiPropertyDataV2')
        if (saved) {
          try {
            const parsedData: AppData = JSON.parse(saved)
            setState(prev => ({
              ...prev,
              data: parsedData,
              currentProperty: parsedData.properties[0]?.id || null
            }))
          } catch (error) {
            console.error('載入本地資料失敗:', error)
            // 使用初始數據
            const initialData = initData()
            setState(prev => ({
              ...prev,
              data: initialData,
              currentProperty: initialData.properties[0]?.id || null
            }))
          }
        } else {
          // 初始化資料
          const initialData = initData()
          setState(prev => ({
            ...prev,
            data: initialData,
            currentProperty: initialData.properties[0]?.id || null
          }))
        }
      } catch (error) {
        console.error('載入資料過程出錯:', error)
        // 確保有初始數據
        const initialData = initData()
        setState(prev => ({
          ...prev,
          data: initialData,
          currentProperty: initialData.properties[0]?.id || null
        }))
      }
    }
    
    loadData()
  }, [])

  // 初始化雲端連線
  useEffect(() => {
    cloudConnection.initialize()
    
    // 監聽雲端連線狀態變化
    const removeListener = cloudConnection.addListener((status) => {
      // 可以在這裡更新UI狀態或顯示通知
      console.log('雲端連線狀態:', status)
    })
    
    return () => {
      removeListener()
      cloudConnection.stopConnectionCheck()
    }
  }, [])

  // 計算付款（只在初始化時計算一次）
  useEffect(() => {
    // 只在數據為初始數據時計算付款
    const savedData = localStorage.getItem('multiPropertyDataV2')
    if (!savedData) {
      calcAllPayments(state.data)
    }
  }, [])

  // 儲存資料到本地儲存
  useEffect(() => {
    try {
      localStorage.setItem('multiPropertyDataV2', JSON.stringify(state.data))
    } catch (e: any) {
      if (e.name === 'QuotaExceededError') {
        console.warn('localStorage 已滿，資料僅存雲端')
        // 可以考慮在這裡觸發雲端同步
      } else {
        console.error('localStorage 儲存失敗:', e)
      }
    }
  }, [state.data])

  // 更新狀態的輔助函數
  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  // 更新資料的輔助函數（自動同步到雲端）
  const updateData = (updates: Partial<AppData>, options?: {
    requireConfirmation?: boolean
    confirmationMessage?: string
    immediateSync?: boolean
  }) => {
    const {
      requireConfirmation = false,
      confirmationMessage = '確定要保存變更到雲端嗎？此操作會同步到所有設備。',
      immediateSync = true
    } = options || {}
    
    // 1. 如果需要確認，顯示確認對話框
    if (requireConfirmation) {
      const confirmed = confirm(confirmationMessage)
      if (!confirmed) {
        console.log('用戶取消操作')
        return
      }
    }
    
    // 2. 更新本地狀態（樂觀更新）
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates }
    }))
    
    // 3. 自動同步到雲端
    if (immediateSync && Object.keys(updates).length > 0) {
      // 根據更新內容決定操作類型
      let operationType = 'update_data'
      
      if ('properties' in updates && updates.properties !== undefined) {
        operationType = 'update_properties'
      } else if ('payments' in updates && updates.payments !== undefined) {
        operationType = 'update_payments'
      } else if ('history' in updates && updates.history !== undefined) {
        operationType = 'update_history'
      } else if ('maintenance' in updates && updates.maintenance !== undefined) {
        operationType = 'update_maintenance'
      }
      
      // 非同步同步到雲端（不阻塞UI）
      cloudConnection.syncToCloud(updates, operationType)
        .then(success => {
          if (success) {
            console.log('雲端同步成功')
            // 顯示成功提示（如果用戶在頁面上）
            if (typeof window !== 'undefined') {
              // 簡單的 alert 或 console 提示
              console.log('✅ 數據已同步到雲端')
            }
          } else {
            console.warn('雲端同步失敗，已進入重試隊列')
            // 顯示警告提示
            if (typeof window !== 'undefined') {
              console.warn('⚠️ 雲端同步失敗，數據已保存到本地')
            }
          }
        })
        .catch(error => {
          console.error('雲端同步錯誤:', error)
        })
    }
  }

  // 開啟模態框
  const openModal = (type: string, data?: any) => {
    updateState({ modal: { type, data } })
  }

  // 關閉模態框
  const closeModal = () => {
    updateState({ modal: null })
  }

  // 取得當前物業
  const getCurrentProperty = () => {
    return state.data.properties.find(p => p.id === state.currentProperty)
  }

  // 臨時的登入函數（用於編譯）
  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('登入嘗試:', username);
    
    // 內置帳號密碼（自己用，避免忘記）
    const builtInAccounts = [
      { username: 'admin', password: 'admin123', role: 'admin' },
      { username: 'landlord', password: 'landlord2026', role: 'admin' },
      { username: 'user', password: 'user123', role: 'viewer' }
    ];
    
    // 檢查帳號密碼
    const account = builtInAccounts.find(acc => 
      acc.username === username && acc.password === password
    );
    
    if (account) {
      // 登入成功
      updateState({
        user: {
          id: 1,
          username: username,
          role: account.role as any,
          full_name: username,
          status: 'active'
        }
      });
      console.log('✅ 登入成功:', username);
      return true;
    } else {
      // 登入失敗
      console.log('❌ 登入失敗: 帳號或密碼錯誤');
      return false;
    }
  };

  // 臨時的登出函數
  const logout = () => {
    updateState({ user: undefined });
  };

  const value = {
    state,
    updateState,
    updateData,
    openModal,
    closeModal,
    getCurrentProperty,
    login,
    logout,
    isLoading: false
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}