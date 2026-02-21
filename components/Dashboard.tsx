'use client'

import { t } from '@/lib/translations'
import { calculateStats, analyzeElectricity, formatCurrency } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'

interface DashboardProps {
  property: any
}

export default function Dashboard({ property }: DashboardProps) {
  const { state, updateState, openModal, getCurrentProperty } = useApp()
  
  // 檢查是否顯示全部物業
  const showAllProperties = state.currentProperty === null
  
  // 計算統計數據
  let stats, elecAnalysis
  if (showAllProperties) {
    // 計算所有物業的總和
    const allStats = state.data.properties.map(p => 
      calculateStats(
        p, 
        state.data, 
        state.revenueTimeScope, 
        state.revenueYear, 
        state.revenueMonth,
        state.elecTimeScope,
        state.elecYear,
        state.elecMonth
      )
    )
    
    // 合併所有物業的統計數據
    stats = {
      total: allStats.reduce((sum, s) => sum + s.total, 0),
      occupied: allStats.reduce((sum, s) => sum + s.occupied, 0),
      available: allStats.reduce((sum, s) => sum + s.available, 0),
      rate: allStats.length > 0 ? Math.round(allStats.reduce((sum, s) => sum + s.rate, 0) / allStats.length) : 0,
      totalRent: allStats.reduce((sum, s) => sum + s.totalRent, 0),
      avgRent: allStats.length > 0 ? Math.round(allStats.reduce((sum, s) => sum + s.avgRent, 0) / allStats.length) : 0,
      totalElec: allStats.reduce((sum, s) => sum + s.totalElec, 0),
      received: allStats.reduce((sum, s) => sum + s.received, 0),
      pending: allStats.reduce((sum, s) => sum + s.pending, 0),
      pendingCount: allStats.reduce((sum, s) => sum + s.pendingCount, 0),
      expiring: allStats.reduce((sum, s) => sum + s.expiring, 0),
      totalDeposit: allStats.reduce((sum, s) => sum + s.totalDeposit, 0),
      elecReceivable: allStats.reduce((sum, s) => sum + s.elecReceivable, 0),
      floors: [],
      rentByFloor: [],
      elec: {
        charged: allStats.reduce((sum, s) => sum + s.elec.charged, 0),
        chargedRate: state.data.electricityRate,
        usage: allStats.reduce((sum, s) => sum + s.elec.usage, 0),
        actualCost: allStats.reduce((sum, s) => sum + s.elec.actualCost, 0),
        actualRate: state.data.actualElectricityRate,
        profit: allStats.reduce((sum, s) => sum + s.elec.profit, 0),
        profitRate: allStats.reduce((sum, s) => sum + s.elec.actualCost, 0) > 0 
          ? (allStats.reduce((sum, s) => sum + s.elec.profit, 0) / allStats.reduce((sum, s) => sum + s.elec.actualCost, 0)) * 100 
          : 0,
      }
    }
    
    elecAnalysis = analyzeElectricity(stats.elec)
  } else {
    // 單一物業的統計
    const currentProperty = getCurrentProperty()
    stats = calculateStats(
      currentProperty, 
      state.data, 
      state.revenueTimeScope, 
      state.revenueYear, 
      state.revenueMonth,
      state.elecTimeScope,
      state.elecYear,
      state.elecMonth
    )
    
    elecAnalysis = analyzeElectricity(stats.elec)
  }

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
            <h2 className="text-3xl font-bold mb-2">
              {showAllProperties ? `📊 ${t('allProperties', state.lang)}` : property.name}
            </h2>
            <p className="opacity-90">
              {showAllProperties 
                ? `${state.data.properties.length} ${t('properties', state.lang)} · ${stats.total} ${t('rooms', state.lang)}`
                : property.address}
            </p>
            <p className="text-sm opacity-75 mt-2">
              {showAllProperties
                ? `${t('totalRevenue', state.lang)}: ${formatCurrency(stats.totalRent)} · ${t('totalElectricityCost', state.lang)}: ${formatCurrency(Math.round(stats.elec.actualCost))}`
                : `${property.floors} ${t('floor', state.lang)} · ${property.rooms.length} ${t('rooms', state.lang)}`}
            </p>
          </div>
          {!showAllProperties && (
            <button 
              onClick={() => openModal('editProperty', property.id)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm"
            >
              ✏️ {t('edit', state.lang)}
            </button>
          )}
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
          <div className="flex gap-2 flex-wrap items-center">
            <select 
              value={state.tempRevenueTimeScope || state.revenueTimeScope}
              onChange={(e) => updateState({ tempRevenueTimeScope: e.target.value as any })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">{t('allTime', state.lang)}</option>
              <option value="year">{t('selectYear', state.lang)}</option>
              <option value="month">{t('selectMonth', state.lang)}</option>
            </select>
            
            {(state.tempRevenueTimeScope || state.revenueTimeScope) === 'year' && (
              <input 
                type="number"
                value={state.tempRevenueYear || state.revenueYear}
                onChange={(e) => updateState({ tempRevenueYear: parseInt(e.target.value) })}
                className="w-24 px-3 py-2 border rounded-lg text-sm"
                placeholder="年份"
              />
            )}
            
            {(state.tempRevenueTimeScope || state.revenueTimeScope) === 'month' && (
              <input 
                type="month"
                value={state.tempRevenueMonth || state.revenueMonth}
                onChange={(e) => updateState({ tempRevenueMonth: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
            )}
            
            {/* 確認按鈕 */}
            <button
              onClick={() => {
                updateState({
                  revenueTimeScope: state.tempRevenueTimeScope || state.revenueTimeScope,
                  revenueYear: state.tempRevenueYear || state.revenueYear,
                  revenueMonth: state.tempRevenueMonth || state.revenueMonth
                })
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              ✅ {t('confirm', state.lang)}
            </button>
            
            {/* 重置按鈕 */}
            <button
              onClick={() => {
                updateState({
                  revenueTimeScope: 'all',
                  revenueYear: 2026,
                  revenueMonth: '2026-02',
                  tempRevenueTimeScope: 'all',
                  tempRevenueYear: 2026,
                  tempRevenueMonth: '2026-02'
                })
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              🔄 {t('reset', state.lang)}
            </button>
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
          <div className="flex gap-2 flex-wrap items-center">
            <select 
              value={state.tempElecTimeScope || state.elecTimeScope}
              onChange={(e) => updateState({ tempElecTimeScope: e.target.value as any })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">{t('allTime', state.lang)}</option>
              <option value="year">{t('selectYear', state.lang)}</option>
              <option value="month">{t('selectMonth', state.lang)}</option>
            </select>
            
            {(state.tempElecTimeScope || state.elecTimeScope) === 'year' && (
              <input 
                type="number"
                value={state.tempElecYear || state.elecYear}
                onChange={(e) => updateState({ tempElecYear: parseInt(e.target.value) })}
                className="w-24 px-3 py-2 border rounded-lg text-sm"
                placeholder="年份"
              />
            )}
            
            {(state.tempElecTimeScope || state.elecTimeScope) === 'month' && (
              <input 
                type="month"
                value={state.tempElecMonth || state.elecMonth}
                onChange={(e) => updateState({ tempElecMonth: e.target.value })}
                className="px-3 py-2 border rounded-lg text-sm"
              />
            )}
            
            {/* 確認按鈕 */}
            <button
              onClick={() => {
                updateState({
                  elecTimeScope: state.tempElecTimeScope || state.elecTimeScope,
                  elecYear: state.tempElecYear || state.elecYear,
                  elecMonth: state.tempElecMonth || state.elecMonth
                })
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              ✅ {t('confirm', state.lang)}
            </button>
            
            {/* 重置按鈕 */}
            <button
              onClick={() => {
                updateState({
                  elecTimeScope: 'all',
                  elecYear: 2026,
                  elecMonth: '2026-02',
                  tempElecTimeScope: 'all',
                  tempElecYear: 2026,
                  tempElecMonth: '2026-02'
                })
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              🔄 {t('reset', state.lang)}
            </button>
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
              .filter((p: any) => p.s === 'pending')
              .map((payment: any) => (
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
        (property.maintenance || []).filter((m: any) => m.s === 'pending' || m.s === 'assigned').length > 0 || 
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
            
            {(property.maintenance || []).filter((m: any) => m.s === 'pending' || m.s === 'assigned').length > 0 && (
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
                      {t('has', state.lang)} {(property.maintenance || []).filter((m: any) => m.s === 'pending' || m.s === 'assigned').length} {t('maintCount', state.lang)}
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
