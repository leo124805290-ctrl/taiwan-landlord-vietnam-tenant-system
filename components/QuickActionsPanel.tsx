'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'

interface QuickAction {
  id: string
  icon: string
  label: string
  description: string
  color: string
  onClick: () => void
  enabled: boolean
}

export default function QuickActionsPanel() {
  const { state, openModal, getCurrentProperty } = useApp()
  const property = getCurrentProperty()

  const quickActions: QuickAction[] = [
    {
      id: 'collect-rent',
      icon: '💰',
      label: 'quickCollectRent',
      description: '收取選定房間的租金',
      color: 'bg-gradient-to-br from-green-500 to-emerald-600',
      onClick: () => openModal('quickCollectRent'),
      enabled: property?.rooms?.some((r: any) => r.s === 'occupied') || false
    },
    {
      id: 'record-meter',
      icon: '📝',
      label: 'batchMeterReading',
      description: '一次記錄多個房間電錶',
      color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
      onClick: () => openModal('batchMeterReading'),
      enabled: property?.rooms?.some((r: any) => r.s === 'occupied') || false
    },
    {
      id: 'add-expense',
      icon: '💸',
      label: 'addUtilityExpense',
      description: '記錄水電、租金等支出',
      color: 'bg-gradient-to-br from-purple-500 to-violet-600',
      onClick: () => openModal('addUtilityExpense'),
      enabled: true
    },
    {
      id: 'add-income',
      icon: '📈',
      label: 'addAdditionalIncome',
      description: '記錄洗衣機等補充收入',
      color: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      onClick: () => openModal('addAdditionalIncome'),
      enabled: true
    },
    {
      id: 'report-issue',
      icon: '🔧',
      label: 'addMaint',
      description: '記錄維修問題',
      color: 'bg-gradient-to-br from-orange-500 to-amber-600',
      onClick: () => openModal('addMaint'),
      enabled: true
    },
    {
      id: 'add-room',
      icon: '🏠',
      label: 'addRoom',
      description: '添加新房間或樓層',
      color: 'bg-gradient-to-br from-pink-500 to-rose-600',
      onClick: () => openModal('addRoom'),
      enabled: true
    }
  ]

  // 計算啟用的操作數量
  const enabledActions = quickActions.filter(action => action.enabled).length

  if (enabledActions === 0) {
    return null
  }

  return (
    <div className="quick-actions-panel mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="text-xl">⚡</span>
          {t('quickActions', state.lang)}
        </h3>
        <div className="text-sm text-gray-500">
          {enabledActions} {t('actionsAvailable', state.lang)}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={action.onClick}
            disabled={!action.enabled}
            className={`quick-action-btn relative overflow-hidden rounded-xl p-4 transition-all duration-200 ${
              action.enabled 
                ? `${action.color} text-white hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]` 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            title={action.description}
          >
            {/* 背景裝飾 */}
            <div className="absolute top-0 right-0 w-16 h-16 opacity-10">
              <div className="text-4xl">{action.icon}</div>
            </div>
            
            {/* 內容 */}
            <div className="relative z-10">
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="text-sm font-semibold leading-tight">
                {t(action.label, state.lang)}
              </div>
              
              {/* 啟用狀態指示器 */}
              {!action.enabled && (
                <div className="text-xs mt-1 opacity-75">
                  {t('notAvailable', state.lang)}
                </div>
              )}
            </div>
            
            {/* 懸停效果 */}
            {action.enabled && (
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-200" />
            )}
          </button>
        ))}
      </div>
      
      {/* 提示文字 */}
      <div className="mt-3 text-sm text-gray-500 text-center">
        💡 {t('quickActionsTip', state.lang)}
      </div>
    </div>
  )
}