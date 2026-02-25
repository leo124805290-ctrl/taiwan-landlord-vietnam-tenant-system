'use client'

import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'
import Rooms from '@/components/Rooms'
import AllPropertiesRooms from '@/components/AllPropertiesRooms'
import AllPropertiesPayments from '@/components/AllPropertiesPayments'
import FinancialOverview from '@/components/FinancialOverview'
import Payments from '@/components/Payments'
import PropertyExpenses from '@/components/PropertyExpenses'
import Utilities from '@/components/Utilities'
import Reports from '@/components/Reports'
import Settings from '@/components/Settings'
import PaymentHistory from '@/components/PaymentHistory'
import Modal from '@/components/Modal'
import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
  const { state, updateState, openModal, getCurrentProperty } = useApp()

  // 渲染內容
  const renderContent = () => {
    const property = getCurrentProperty()
    
    // 檢查是否選擇了「全部物業」
    const isAllProperties = state.currentProperty === 'all' || state.currentProperty === null
    
    if (isAllProperties) {
      // 顯示所有物業的內容
      switch (state.tab) {
        case 'rooms':
          return <AllPropertiesRooms properties={state.data.properties || []} />
        case 'financial':
          return <FinancialOverview properties={state.data.properties || []} />
        case 'payments':
          return <AllPropertiesPayments />
        case 'dashboard':
        case 'paymentHistory':
        case 'expenses':
        case 'utilities':
        case 'reports':
        case 'settings':
          return (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h2 className="text-2xl font-bold mb-4">全部物業模式</h2>
              <p className="text-gray-600 mb-6">
                在「全部物業」模式下，目前只支援房間管理、財務總覽和繳費功能。
                <br />
                請選擇特定物業以使用其他功能。
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {state.data.properties.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => updateState({ currentProperty: p.id })}
                    className="btn bg-blue-600 text-white"
                  >
                    🏠 切換到 {p.name || '未命名物業'}
                  </button>
                ))}
              </div>
            </div>
          )
        default:
          return <AllPropertiesRooms properties={state.data.properties || []} />
      }
    }
    
    // 如果沒有選擇任何物業（包括全部物業）
    if (!property) {
      return (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold mb-4">【測試】尚未建立物業</h2>
          <button 
            onClick={() => openModal('addProperty')}
            className="btn btn-primary"
          >
            ➕ 新增第一個物業
          </button>
        </div>
      )
    }

    // 單一物業模式
    switch (state.tab) {
      case 'dashboard':
        return <Dashboard property={property} />
      case 'rooms':
        return state.currentProperty === 'all' 
          ? <AllPropertiesRooms properties={state.data.properties} />
          : <Rooms property={property} />
      case 'financial':
        return <FinancialOverview properties={state.currentProperty === 'all' ? state.data.properties : [property]} />
      case 'payments':
        return state.currentProperty === 'all'
          ? <AllPropertiesPayments />
          : <Payments property={property} />
      case 'paymentHistory':
        return <PaymentHistory property={property} />
      case 'expenses':
        return <PropertyExpenses property={property} />
      case 'utilities':
        return <Utilities />
      case 'reports':
        return <Reports />
      case 'settings':
        return <Settings />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {renderContent()}
      </main>

      {state.modal && (
        <Modal />
      )}
    </div>
  )
}