'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AppState, AppData } from '@/lib/types'
import { initData, calcAllPayments } from '@/lib/utils'
import { cloudConnection } from '@/lib/cloudConnection'

interface AppContextType {
  state: AppState
  updateState: (updates: Partial<AppState>) => void
  updateData: (updates: Partial<AppData>) => void
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

  // 載入本地儲存資料
  useEffect(() => {
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
        console.error('載入資料失敗:', error)
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
    localStorage.setItem('multiPropertyDataV2', JSON.stringify(state.data))
  }, [state.data])

  // 更新狀態的輔助函數
  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  // 更新資料的輔助函數（自動同步到雲端）
  const updateData = (updates: Partial<AppData>) => {
    // 1. 更新本地狀態
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates }
    }))
    
    // 2. 自動同步到雲端
    if (Object.keys(updates).length > 0) {
      // 根據更新內容決定操作類型
      let operationType = 'update_data'
      
      if (updates.properties) {
        operationType = 'update_properties'
      } else if (updates.payments) {
        operationType = 'update_payments'
      } else if (updates.history) {
        operationType = 'update_history'
      } else if (updates.maintenance) {
        operationType = 'update_maintenance'
      }
      
      // 非同步同步到雲端（不阻塞UI）
      cloudConnection.syncToCloud(updates, operationType).catch(error => {
        console.error('雲端同步失敗:', error)
        // 失敗的操作會自動進入重試隊列
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