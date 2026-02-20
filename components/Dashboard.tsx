'use client'

import { AppState, Property } from '@/lib/types'
import { t } from '@/lib/translations'
import { calculateStats, analyzeElectricity, formatCurrency } from '@/lib/utils'

interface DashboardProps {
  property: Property
  state: AppState
  updateState: (updates: Partial<AppState>) => void
  openModal: (type: string, data?: any) => void
}

export default function Dashboard({ property, state, updateState, openModal }: DashboardProps) {
  const stats = calculateStats(
    property, 
    state.data, 
    state.revenueTimeScope, 
    state.revenueYear, 
    state.revenueMonth,
    state.elecTimeScope,
    state.elecYear,
    state.elecMonth
  )
  
  const elecAnalysis = analyzeElectricity(stats.elec)

  const statCards = [
    {
      title: t('total', state.lang),
      value: stats.total.toString(),
      subText: `${t('rate', state.lang)} ${stats.rate}%`,
      from: '#3b82f6',
      to: '#2563eb'
    },
    {
      title: t('occupied', state.lang),
      value: stats.occupied.toString(),
      subText: `${t('available', state.lang)} ${stats.available}`,
      from: '#10b981',
      to: '#059669'
    },
    {
      title: t('received', state.lang),
      value: `$${Math.round(stats.received / 1000)}K`,
      subText: `${(property.history || []).length} ${t('items', state.lang)}`,
      from: '#8b5cf6',
      to: '#7c3aed'
    },
    {
      title: t('pending', state.lang),
      value: `$${Math.round(stats.pending / 1000)}K`,
      subText: `${stats.pendingCount} ${t('items', state.lang)}`,
      from: '#f59e0b',
      to: '#d97706'
    }
  ]

  const revenueCards = [
    {
      title: t('totalRent', state.lang),
      value: formatCurrency(stats.totalRent),
      subText: `${stats.occupied} ${t('rooms', state.lang)}`,
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    {
      title: t('avgRent', state.lang),
      value: formatCurrency(stats.avgRent),
      subText: t('perRoom', state.lang),
      bg: 'bg-green-50',
      text: 'text-green-600'
    },
    {
      title: t('monthlyElec', state.lang),
      value: formatCurrency(Math.round(stats.totalElec)),
      subText: `$${state.data.electricityRate}${t('perUnit', state.lang)}`,
      bg: 'bg-purple-50',
      text: 'text-purple-600'
    },
    {
      title: t('totalDeposit', state.lang),
      value: formatCurrency(stats.totalDeposit),
      subText: `${stats.occupied} ${t('rooms', state.lang)}`,
      bg: 'bg-indigo-50',
      text: 'text-indigo-600'
    },
    {
      title: t('electricityReceivable', state.lang),
      value: formatCurrency(Math.round(stats.elecReceivable)),
      subText: t('monthlyElec', state.lang),
      bg: 'bg-emerald-50',
      text: 'text-emerald-600'
    }
  ]

  const elecCards = [
    {
      title: t('chargedElec', state.lang),
      value: formatCurrency(Math.round(stats.elec.charged)),
      subText: `$${stats.elec.chargedRate}${t('perUnit', state.lang)}`,
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    {
      title: t('totalUsage', state.lang),
      value: Math.round(stats.elec.usage).toString(),
      subText: t('degree', state.lang),
      bg: 'bg-orange-50',
      text: 'text-orange-600'
    },
    {
      title: t('taipowerCost', state.lang),
      value: formatCurrency(Math.round(stats.elec.actualCost)),
      subText: `$${stats.elec.actualRate}${t('perUnit', state.lang)}`,
      bg: 'bg-red-50',
      text: 'text-red-600'
    },
    {
      title: elecAnalysis.profit >= 0 ? t('elecProfit', state.lang) : t('elecLoss', state.lang),
      value: `${elecAnalysis.profit >= 0 ? '+' : ''}${formatCurrency(Math.round(elecAnalysis.profit))}`,
      subText: `${elecAnalysis.profit >= 0 ? t('earn', state.lang) : t('lose', state.lang)} ${Math.abs(elecAnalysis.profitRate).toFixed(1)}%`,
      bg: elecAnalysis.profit >= 0 ? 'bg-green-50' : 'bg-red-50',
      text: elecAnalysis.profit >= 0 ? 'text-green-600' : 'text-red-600'
    },
    {
      title: t('recommend', state.lang),
      value: elecAnalysis.recommendation.ok ? t('priceOk', state.lang) : t('adjustPrice', state.lang),
      subText: elecAnalysis.recommendation.ok 
        ? t('continueUse', state.lang)
        : `${t('adjustTo', state.lang)} $${elecAnalysis.recommendation.suggestedRate}${t('perUnit', state.lang)}`,
      bg: elecAnalysis.recommendation.ok ? 'bg-emerald-50' : 'bg-orange-50',
      text: elecAnalysis.recommendation.ok ? 'text-emerald-600' : 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* 物業標題 */}
      <div className="card gradient-bg text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">{property.name}</h2>
            <p className="opacity-90">{property.address}</p>
            <p className="text-sm opacity-75 mt-2">
              {property.floors} {t('floor', state.lang)} · {property.rooms.length} {t('rooms', state.lang)}
            </p>
          </div>
          <button 
            onClick={() => openModal('editProperty', property.id)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm"
          >
            ✏️ {t('edit', state.lang)}
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div 
            key={index}
            className="stat-card"
            style={{
              background: `linear-gradient(135deg, ${card.from}, ${card.to})`
            }}
          >
            <div className="text-4xl font-bold mb-1">{card.value}</div>
            <div className="text-sm opacity-90">{card.title}</div>
            <div className="text-xs opacity-75 mt-2">{card.subText}</div>
          </div>
        ))}
      </div>

      {/* 營收分析 */}
      <div className="card">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>💰</span>
            <span>{t('revenueAnalysis', state.lang)}</span>
          </h2>
          <div className="flex gap-2 flex-wrap">
            <select 
              value={state.revenueTimeScope}
              onChange={(e) => updateState({ revenueTimeScope: e.target.value as any })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">{t('allTime', state.lang)}</option>
              <option value="year">{t('selectYear', state.lang)}</option>
              <option value="month">{t('selectMonth', state.lang)}</option>
            </select>
            
            {state.revenueTimeScope === 'year' && (
              <input 
                type="number"
                value={state.revenueYear}
                onChange={(e) => updateState({ revenueYear: parseInt(e.target.value) })}
                className="w-24 px-3 py-2 border rounded-lg text-sm"
              />
            )}
            
            {state.revenueTimeScope === 'month' && (
              <input 
                type="month"
                value={state.revenueMonth}
                onChange={(e) => updateState({ revenueMonth: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {revenueCards.map((card, index) => (
            <div key={index} className={`p-4 ${card.bg} rounded-lg`}>
              <div className="text-xs text-gray-600 mb-1">{card.title}</div>
              <div className={`text-2xl font-bold ${card.text}`}>{card.value}</div>
              <div className="text-xs text-gray-500 mt-1">{card.subText}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 電費分析 */}
      <div className="card">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>⚡</span>
            <span>{t('elecAnalysis', state.lang)}</span>
          </h2>
          <div className="flex gap-2 flex-wrap">
            <select 
              value={state.elecTimeScope}
              onChange={(e) => updateState({ elecTimeScope: e.target.value as any })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">{t('allTime', state.lang)}</option>
              <option value="year">{t('selectYear', state.lang)}</option>
              <option value="month">{t('selectMonth', state.lang)}</option>
            </select>
            
            {state.elecTimeScope === 'year' && (
              <input 
                type="number"
                value={state.elecYear}
                onChange={(e) => updateState({ elecYear: parseInt(e.target.value) })}
                className="w-24 px-3 py-2 border rounded-lg text-sm"
              />
            )}
            
            {state.elecTimeScope === 'month' && (
              <input 
                type="month"
                value={state.elecMonth}
                onChange={(e) => updateState({ elecMonth: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {elecCards.map((card, index) => (
            <div key={index} className={`p-4 ${card.bg} rounded-lg`}>
              <div className="text-xs text-gray-600 mb-1">{card.title}</div>
              <div className={`text-2xl font-bold ${card.text}`}>{card.value}</div>
              <div className="text-xs text-gray-500 mt-1">{card.subText}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t('explanation', state.lang)}</span>
            <span className="text-gray-700">
              {t('charged', state.lang)} {formatCurrency(Math.round(stats.elec.charged))} - 
              {t('actualPay', state.lang)} {formatCurrency(Math.round(stats.elec.actualCost))} = 
              {elecAnalysis.profit >= 0 ? t('earn', state.lang) : t('lose', state.lang)} {formatCurrency(Math.round(Math.abs(elecAnalysis.profit)))}
            </span>
          </div>
        </div>
      </div>

      {/* 樓層分析 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">
          <span>🏢</span> {t('floorAnalysis', state.lang)}
        </h2>
        
        {stats.floors.map(floor => (
          <div key={floor.f} className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between mb-3">
              <div>
                <span className="text-lg font-bold">
                  {floor.f} {t('floor', state.lang)}
                </span>
                <span className="text-sm text-gray-600 ml-3">
                  {floor.occ}/{floor.total} {t('rentedRooms', state.lang)}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${floor.rate === 100 ? 'text-green-600' : 'text-blue-600'}`}>
                  {floor.rate}%
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full ${floor.rate === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${floor.rate}%` }}
              />
            </div>
            
            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <span>
                {t('monthlyIncome', state.lang)}: {formatCurrency(stats.rentByFloor[floor.f - 1]?.rent || 0)}
              </span>
              <span>
                {t('vacantRooms', state.lang)}: {floor.total - floor.occ}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 待收租金明細 */}
      {stats.pendingCount > 0 ? (
        <div className="card">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">
              <span>📋</span> {t('pendingDetails', state.lang)}
            </h2>
            <span className="badge bg-orange-100 text-orange-700">
              {stats.pendingCount} {t('items', state.lang)}
            </span>
          </div>
          
          <div className="space-y-2">
            {property.payments
              .filter(p => p.s === 'pending')
              .map(payment => (
                <div key={payment.id} className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                  <div className="flex-1">
                    <div className="font-bold text-lg">
                      {payment.n} - {payment.t}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      🏠 {t('rent', state.lang)} {formatCurrency(payment.r)} + 
                      ⚡ {t('electricity', state.lang)} {payment.u}{t('degree', state.lang)} × 
                      ${state.data.electricityRate} = {formatCurrency(payment.e)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {t('dueDate', state.lang)}: {payment.due}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(payment.total)}
                    </div>
                    <button 
                      onClick={() => openModal('quickPay', payment.id)}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      {t('collect', state.lang)}
                    </button>
                  </div>
                </div>
              ))}
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <span className="font-bold">{t('totalPending', state.lang)}:</span>
            <span className="text-3xl font-bold text-orange-600">
              {formatCurrency(stats.pending)}
            </span>
          </div>
        </div>
      ) : (
        <div className="card bg-green-50 border-2 border-green-200 text-center">
          <div className="text-6xl mb-3">✅</div>
          <div className="text-2xl font-bold text-green-700 mb-2">
            {t('allCollected', state.lang)}
          </div>
          <div className="text-green-600">{t('allPaid', state.lang)}</div>
        </div>
      )}

      {/* 重要提醒 */}
      {(stats.expiring > 0 || 
        (property.maintenance || []).filter(m => m.s === 'pending' || m.s === 'assigned').length > 0 || 
        stats.available > 0) && (
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            <span>⚠️</span> {t('importantAlerts', state.lang)}
          </h2>
          
          <div className="space-y-3">
            {stats.expiring > 0 && (
              <div 
                onClick={() => openModal('expiringContracts')}
                className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded cursor-pointer hover:bg-yellow-100"
              >
                <div className="flex gap-3 items-start">
                  <span className="text-3xl">📅</span>
                  <div className="flex-1">
                    <div className="font-bold text-yellow-800">
                      {t('contractExpiring', state.lang)}
                    </div>
                    <div className="text-sm text-yellow-700 mt-1">
                      {t('has', state.lang)} {stats.expiring} {t('contractsWillExpire', state.lang)}
                    </div>
                  </div>
                  <button className="text-sm text-yellow-700 underline">
                    {t('viewDetails', state.lang)}
                  </button>
                </div>
              </div>
            )}
            
            {(property.maintenance || []).filter(m => m.s === 'pending' || m.s === 'assigned').length > 0 && (
              <div 
                onClick={() => updateState({ tab: 'maintenance' })}
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded cursor-pointer hover:bg-red-100"
              >
                <div className="flex gap-3 items-start">
                  <span className="text-3xl">🔧</span>
                  <div className="flex-1">
                    <div className="font-bold text-red-800">
                      {t('pendingMaint', state.lang)}
                    </div>
                    <div className="text-sm text-red-700 mt-1">
                      {t('has', state.lang)} {(property.maintenance || []).filter(m => m.s === 'pending' || m.s === 'assigned').length} {t('maintCount', state.lang)}
                    </div>
                  </div>
                  <button className="text-sm text-red-700 underline">
                    {t('viewDetails', state.lang)}
                  </button>
                </div>
              </div>
            )}
            
            {stats.available > 0 && (
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <div className="flex gap-3">
                  <span className="text-3xl">🏠</span>
                  <div>
                    <div className="font-bold text-blue-800">
                      {t('vacantForRunt', state.lang)}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      {t('currently', state.lang)} {stats.available} {t('vacantAvailable', state.lang)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
