'use client'

import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'
import Rooms from '@/components/Rooms'
import Payments from '@/components/Payments'
import Maintenance from '@/components/Maintenance'
import Settings from '@/components/Settings'
import MeterReading from '@/components/MeterReading'
import Modal from '@/components/Modal'
import { useApp } from '@/contexts/AppContext'

export default function HomePage() {
  const { state, openModal, getCurrentProperty } = useApp()

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
        return <Dashboard property={property} />
      case 'rooms':
        return <Rooms property={property} />
      case 'payments':
        return <Payments property={property} />
      case 'meterReading':
        return <MeterReading property={property} />
      case 'maintenance':
        return <Maintenance property={property} />
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