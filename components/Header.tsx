'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'

export default function Header() {
  const { state, updateState, openModal, getCurrentProperty } = useApp()
  const property = getCurrentProperty()
  const tabs = [
    { key: 'rooms', icon: '🏠', label: 'roomsTab' },
    { key: 'financial', icon: '💰', label: 'financialTab' },
    { key: 'payments', icon: '💵', label: 'paymentsTab' },
    { key: 'expenses', icon: '💸', label: 'expensesTab' },
    { key: 'utilities', icon: '💧', label: 'utilitiesTab' },
    { key: 'reports', icon: '📈', label: 'reportsTab' },
    { key: 'settings', icon: '⚙️', label: 'settingsTab' },
  ]

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* 頂部欄 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 w-full md:w-auto">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">🏢 {t('system', state.lang)}</h1>
              <p className="text-xs md:text-sm text-gray-500">
                {state.data.properties.length} {t('properties', state.lang)}
              </p>
            </div>
            
            {/* 物業切換下拉選單 */}
            {state.data.properties.length > 0 && (
              <div className="relative w-full md:w-auto">
                <select 
                  value={state.currentProperty || 'all'}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === 'all') {
                      updateState({ currentProperty: 'all' })
                    } else {
                      updateState({ currentProperty: parseInt(value) })
                    }
                  }}
                  className="w-full md:w-auto px-3 md:px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm md:text-base"
                >
                  <option value="all">
                    📊 {t('allProperties', state.lang)} ({state.data.properties.length})
                  </option>
                  {state.data.properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.name} ({property.rooms.length} {t('rooms', state.lang)})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-3 h-3 md:w-4 md:h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 w-full md:w-auto justify-end">
            {/* 語言切換 */}
            <div className="flex gap-1">
              <button 
                onClick={() => updateState({ lang: 'zh-TW' })}
                className={`px-2 md:px-3 py-2 rounded-lg font-medium text-xs md:text-sm ${
                  state.lang === 'zh-TW' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200'
                }`}
              >
                中文
              </button>
              <button 
                onClick={() => updateState({ lang: 'vi-VN' })}
                className={`px-2 md:px-3 py-2 rounded-lg font-medium text-xs md:text-sm ${
                  state.lang === 'vi-VN' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200'
                }`}
              >
                VN
              </button>
            </div>
            
            {/* 新增物業按鈕 */}
            <button 
              onClick={() => openModal('addProperty')}
              className="px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-xs md:text-sm whitespace-nowrap"
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
        <div className="header-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => updateState({ tab: tab.key as any })}
              className={`px-3 md:px-4 py-2 rounded-lg whitespace-nowrap font-medium text-xs md:text-sm ${
                state.tab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100'
              }`}
            >
              <span className="hidden sm:inline">{tab.icon} </span>
              {t(tab.label, state.lang)}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}