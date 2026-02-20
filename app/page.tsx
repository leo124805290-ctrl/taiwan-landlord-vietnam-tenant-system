'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'
import Rooms from '@/components/Rooms'
import Payments from '@/components/Payments'
import Maintenance from '@/components/Maintenance'
import Settings from '@/components/Settings'
import Modal from '@/components/Modal'
import { AppState, AppData } from '@/lib/types'
import { initData, calcAllPayments } from '@/lib/utils'

export default function HomePage() {
  // 初始化狀態
  const [state, setState] = useState<AppState>({
    tab: 'dashboard',
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

  // 計算付款
  useEffect(() => {
    calcAllPayments(state.data)
  }, [state.data])

  // 儲存資料到本地儲存
  useEffect(() => {
    localStorage.setItem('multiPropertyDataV2', JSON.stringify(state.data))
  }, [state.data])

  // 更新狀態的輔助函數
  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  // 更新資料的輔助函數
  const updateData = (updates: Partial<AppData>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...updates }
    }))
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

  // 渲染內容
  const renderContent = () => {
    const property = getCurrentProperty()
    
    if (!property) {
      return (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold mb-4">尚未建立物業</h2>
          <button 
            onClick={() => openModal('addProperty')}
            className="btn btn-primary"
          >
            ➕ 新增第一個物業
          </button>
        </div>
      )
    }

    switch (state.tab) {
      case 'dashboard':
        return <Dashboard 
          property={property} 
          state={state} 
          updateState={updateState}
          openModal={openModal}
        />
      case 'rooms':
        return <Rooms 
          property={property} 
          state={state}
          updateState={updateState}
          updateData={updateData}
          openModal={openModal}
        />
      case 'payments':
        return <Payments 
          property={property} 
          state={state}
          updateState={updateState}
          updateData={updateData}
        />
      case 'maintenance':
        return <Maintenance 
          property={property} 
          state={state}
          updateState={updateState}
          updateData={updateData}
          openModal={openModal}
        />
      case 'settings':
        return <Settings 
          state={state}
          updateState={updateState}
          updateData={updateData}
          openModal={openModal}
        />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <Header 
        state={state}
        updateState={updateState}
        openModal={openModal}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {renderContent()}
      </main>

      {state.modal && (
        <Modal 
          type={state.modal.type}
          data={state.modal.data}
          state={state}
          updateState={updateState}
          updateData={updateData}
          closeModal={closeModal}
          getCurrentProperty={getCurrentProperty}
        />
      )}
    </div>
  )
}