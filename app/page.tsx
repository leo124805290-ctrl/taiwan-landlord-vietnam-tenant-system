'use client'

import Header from '@/components/Header'
import Rooms from '@/components/Rooms'
import AllPropertiesRooms from '@/components/AllPropertiesRooms'
import AllPropertiesPayments from '@/components/AllPropertiesPayments'
import Payments from '@/components/Payments'
import IncomeManagement from '@/components/IncomeManagement'
import FinancialOverview from '@/components/FinancialOverview'
import Settings from '@/components/Settings'
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
        case 'income-management':
          return <IncomeManagement properties={state.data.properties || []} />
        case 'financial-overview':
        case 'settings':
          return (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h2 className="text-2xl font-bold mb-4">全部物業模式</h2>
              <p className="text-gray-600 mb-6">
                在「全部物業」模式下，收入管理功能可以查看所有物業的總收入。
                <br />
                成本管理功能需要選擇特定物業以記錄成本支出。
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
        case 'payments':
          return <AllPropertiesPayments />
        case 'income-management':
          return <IncomeManagement properties={state.data.properties || []} />
        case 'financial-overview':
        case 'settings':
          return (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h2 className="text-2xl font-bold mb-4">全部物業模式</h2>
              <p className="text-gray-600 mb-6">
                在「全部物業」模式下，收入管理功能可以查看所有物業的總收入。
                <br />
                財務視圖功能需要選擇特定物業以查看完整的財務狀況。
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
      case 'rooms':
        return state.currentProperty === 'all' 
          ? <AllPropertiesRooms properties={state.data.properties} />
          : <Rooms property={property} />
      case 'income-management':
        return <IncomeManagement properties={[property]} />
      case 'financial-overview':
        return <FinancialOverview property={property} />
      case 'payments':
        return state.currentProperty === 'all'
          ? <AllPropertiesPayments />
          : <Payments property={property} />
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