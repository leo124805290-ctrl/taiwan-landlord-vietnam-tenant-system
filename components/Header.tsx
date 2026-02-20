'use client'

import { AppState } from '@/lib/types'
import { t } from '@/lib/translations'

interface HeaderProps {
  state: AppState
  updateState: (updates: Partial<AppState>) => void
  openModal: (type: string, data?: any) => void
}

export default function Header({ state, updateState, openModal }: HeaderProps) {
  const tabs = [
    { key: 'dashboard', icon: '📊', label: 'dashboard' },
    { key: 'rooms', icon: '🏠', label: 'roomsTab' },
    { key: 'payments', icon: '💰', label: 'paymentsTab' },
    { key: 'maintenance', icon: '🔧', label: 'maintenanceTab' },
    { key: 'settings', icon: '⚙️', label: 'settingsTab' },
  ]

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* 頂部欄 */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">🏢 {t('system', state.lang)}</h1>
            <p className="text-sm text-gray-500">
              {state.data.properties.length} {t('properties', state.lang)}
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* 語言切換 */}
            <button 
              onClick={() => updateState({ lang: 'zh-TW' })}
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                state.lang === 'zh-TW' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200'
              }`}
            >
              中文
            </button>
            <button 
              onClick={() => updateState({ lang: 'vi-VN' })}
              className={`px-3 py-2 rounded-lg font-medium text-sm ${
                state.lang === 'vi-VN' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200'
              }`}
            >
              Tiếng Việt
            </button>
            
            {/* 新增物業按鈕 */}
            <button 
              onClick={() => openModal('addProperty')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
            >
              ➕ {t('addProperty', state.lang)}
            </button>
          </div>
        </div>

        {/* 物業標籤 */}
        <div className="flex gap-2 overflow-x-auto mb-4 pb-2" style={{ scrollbarWidth: 'none' }}>
          {state.data.properties.map(prop => (
            <div 
              key={prop.id}
              onClick={() => updateState({ currentProperty: prop.id })}
              className={`property-tab ${
                state.currentProperty === prop.id ? 'active' : ''
              }`}
              style={{
                background: state.currentProperty === prop.id 
                  ? 'white' 
                  : 'rgba(255, 255, 255, 0.2)',
                color: state.currentProperty === prop.id 
                  ? '#3b82f6' 
                  : 'white',
              }}
            >
              <div className="font-bold text-sm">{prop.name}</div>
              <div className="text-xs opacity-75">
                {prop.rooms.length} {t('rooms', state.lang)}
              </div>
            </div>
          ))}
        </div>

        {/* 導航標籤 */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => updateState({ tab: tab.key as any })}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium text-sm ${
                state.tab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {tab.icon} {t(tab.label, state.lang)}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}