'use client'

import Header from '@/components/Header'
import Rooms from '@/components/Rooms'
import AllPropertiesRooms from '@/components/AllPropertiesRooms'
import AllPropertiesPayments from '@/components/AllPropertiesPayments'
import Payments from '@/components/Payments'
import CostManagement from '@/components/CostManagement'
import AllPropertiesCostManagement from '@/components/AllPropertiesCostManagement'
import BackfillCheckIn from '@/components/BackfillCheckIn'
import BackfillHistory from '@/components/BackfillHistory'
import DepositManagement from '@/components/DepositManagement'
import Settings from '@/components/Settings'
import Modal from '@/components/Modal'
import CloudSyncPanel from '@/components/CloudSyncPanel'
import MigrateToCloud from '@/components/MigrateToCloud'
import NetworkStatus from '@/components/NetworkStatus'
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
        case 'backfill-checkin':
          return (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h2 className="text-2xl font-bold mb-4">房間出租(補) - 全部物業模式</h2>
              <p className="text-gray-600 mb-6">
                在「全部物業」模式下，請選擇單一物業以使用補登入住功能。
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                {state.data.properties.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => updateState({ currentProperty: p.id })}
                    className="btn bg-amber-600 text-white"
                  >
                    📅 選擇 {p.name || '未命名物業'}
                  </button>
                ))}
              </div>
            </div>
          )
        case 'backfill-history':
          return <BackfillHistory />
        case 'deposit-management':
          return <DepositManagement />
        case 'cost-management':
          return <AllPropertiesCostManagement properties={state.data.properties || []} />
        case 'payments':
          return <AllPropertiesPayments />
        case 'settings':
          return (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h2 className="text-2xl font-bold mb-4">全部物業模式</h2>
              <p className="text-gray-600 mb-6">
                在「全部物業」模式下，您可以查看所有物業的匯總數據。
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
          return (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">❓</div>
              <h2 className="text-2xl font-bold mb-4">未知分頁</h2>
              <p className="text-gray-600">請選擇有效的分頁</p>
            </div>
          )
      }
    } else {
      // 顯示單一物業的內容
      if (!property) {
        return (
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold mb-4">請選擇物業</h2>
            <p className="text-gray-600">請從上方選擇要管理的物業</p>
          </div>
        )
      }
      
      switch (state.tab) {
        case 'rooms':
          return <Rooms property={property} />
        case 'backfill-checkin':
          return <BackfillCheckIn />
        case 'backfill-history':
          return <BackfillHistory />
        case 'deposit-management':
          return <DepositManagement />
        case 'cost-management':
          return <CostManagement property={property} />
        case 'payments':
          return <Payments property={property} />
        case 'settings':
          return <Settings />
        default:
          return (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">❓</div>
              <h2 className="text-2xl font-bold mb-4">未知分頁</h2>
              <p className="text-gray-600">請選擇有效的分頁</p>
            </div>
          )
      }
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
      
      {/* 網絡狀態監控 */}
      <NetworkStatus />
      
      {/* 雲端同步面板 */}
      <CloudSyncPanel />
      
      {/* 遷移到雲端按鈕 */}
      <MigrateToCloud />
      
      {/* 版本標記 - 僅開發環境顯示 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-2 right-2 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
          版本: 修復版 - 成本管理全部物業模式 + 雲端同步
        </div>
      )}
    </div>
  )
}