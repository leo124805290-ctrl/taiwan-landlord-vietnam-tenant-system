'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'

interface MaintenanceProps {
  property: any
}

export default function Maintenance({ property }: MaintenanceProps) {
  const { state, updateState, updateData, openModal } = useApp()
  
  // 計算維修成本統計
  const calculateMaintenanceStats = () => {
    const allMaintenance = property.maintenance || [];
    
    const completed = allMaintenance.filter((m: any) => m.s === 'completed');
    const pending = allMaintenance.filter((m: any) => m.s === 'pending' || m.s === 'assigned');
    
    const totalMaintenanceCost = completed.reduce((sum: number, m: any) => sum + (m.cost || 0), 0);
    const totalRenovationCost = allMaintenance.reduce((sum: number, m: any) => sum + (m.estimatedCost || 0), 0);
    
    // 按房間統計
    const byRoom: Record<string, { count: number, cost: number }> = {};
    completed.forEach((m: any) => {
      if (!byRoom[m.n]) {
        byRoom[m.n] = { count: 0, cost: 0 };
      }
      byRoom[m.n].count += 1;
      byRoom[m.n].cost += (m.cost || 0);
    });
    
    return {
      totalMaintenanceCost,
      totalRenovationCost,
      completedCount: completed.length,
      pendingCount: pending.length,
      byRoom
    };
  };
  
  const stats = calculateMaintenanceStats();
  
  // 篩選狀態
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  // 獲取所有房間號碼
  const allRooms: string[] = Array.from(new Set((property.maintenance || []).map((m: any) => m.n)));
  
  // 判斷記錄類型（報修或裝修）
  const getMaintenanceType = (maint: any): string => {
    // 如果有 estimatedCost 或標題包含「裝修」，則視為裝修
    if (maint.estimatedCost !== undefined || 
        (maint.title && (maint.title.includes('裝修') || maint.title.includes('cải tạo') || maint.title.includes('renovation')))) {
      return 'renovation';
    }
    return 'maintenance';
  };

  // 篩選報修/裝修記錄
  const filteredMaintenance = (property.maintenance || []).filter((maint: any) => {
    if (filterStatus !== 'all' && maint.s !== filterStatus) return false;
    if (filterRoom !== 'all' && maint.n !== filterRoom) return false;
    if (filterType !== 'all') {
      const type = getMaintenanceType(maint);
      if (filterType !== type) return false;
    }
    return true;
  });
  
  return (
    <div className="space-y-4">
      {/* 成本統計 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">🔧 {t('maintenanceRenovation', state.lang)}</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-gray-600">{t('totalMaintenanceCost', state.lang)}</div>
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(stats.totalMaintenanceCost)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.completedCount} {t('completedMaintenance', state.lang)}
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-gray-600">{t('totalRenovationCost', state.lang)}</div>
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(stats.totalRenovationCost)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t('renovationHistory', state.lang)}
            </div>
          </div>
        </div>
        
        {/* 各房間維修統計 */}
        {Object.keys(stats.byRoom).length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-bold mb-2">{t('maintenanceByRoom', state.lang)}</div>
            <div className="space-y-2">
              {Object.entries(stats.byRoom).map(([room, data]: [string, any]) => (
                <div key={room} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{room}</span>
                  <div className="text-right">
                    <div className="text-sm font-bold">{data.count} 次</div>
                    <div className="text-xs text-gray-600">{formatCurrency(data.cost)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 篩選器 */}
      <div className="card">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm mb-1">{t('filterByStatus', state.lang)}</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">{t('allStatus', state.lang)}</option>
              <option value="pending">待處理</option>
              <option value="assigned">已指派</option>
              <option value="completed">已完成</option>
            </select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm mb-1">{t('filterByRoom', state.lang)}</label>
            <select 
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="input-field"
            >
              <option value="all">{t('allRooms', state.lang)}</option>
              {allRooms.map((room: string) => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm mb-1">{t('filterByType', state.lang)}</label>
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="all">{t('allTypes', state.lang)}</option>
              <option value="maintenance">{t('typeMaintenance', state.lang)}</option>
              <option value="renovation">{t('typeRenovation', state.lang)}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 新增按鈕 */}
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={() => openModal('addMaint')}
          className="btn bg-blue-600 text-white"
        >
          🔧 {t('addMaintenance', state.lang)}
        </button>
        
        <button 
          onClick={() => openModal('addRenovation')}
          className="btn bg-green-600 text-white"
        >
          🏗️ {t('addRenovation', state.lang)}
        </button>
      </div>

      {/* 報修/裝修列表 */}
      <div className="space-y-3">
        {filteredMaintenance.map((maint: any) => {
          const type = getMaintenanceType(maint);
          const isRenovation = type === 'renovation';
          
          return (
            <div key={maint.id} className={`card ${isRenovation ? 'border-l-4 border-green-500' : 'border-l-4 border-blue-500'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 flex-wrap">
                  {/* 類型標籤 */}
                  <span className={`badge ${
                    isRenovation 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isRenovation ? t('typeRenovation', state.lang) : t('typeMaintenance', state.lang)}
                  </span>
                  
                  {/* 緊急程度標籤 */}
                  {!isRenovation && maint.urg && (
                    <span className={`badge ${
                      maint.urg === 'urgent' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {t(maint.urg, state.lang)}
                    </span>
                  )}
                  
                  {/* 狀態標籤 */}
                  <span className={`badge ${
                    maint.s === 'pending' 
                      ? 'bg-orange-100 text-orange-700' 
                      : maint.s === 'assigned' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {t(maint.s + 'Status', state.lang)}
                  </span>
                </div>
                
                {/* 日期 */}
                <div className="text-xs text-gray-500">
                  {maint.date}
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2">{maint.title}</h3>
              <p className="text-gray-600 mb-3">{maint.desc}</p>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div>
                  <div className="text-gray-500">房間</div>
                  <div className="font-bold">{maint.n || '公共區域'}</div>
                </div>
                <div>
                  <div className="text-gray-500">租客</div>
                  <div className="font-bold">{maint.t || 'N/A'}</div>
                </div>
              </div>
              
              {/* 費用資訊 */}
              <div className="mb-3">
                {maint.cost ? (
                  <div className="text-sm font-bold text-blue-600">
                    💰 {t('cost', state.lang)}: {formatCurrency(maint.cost)}
                    {maint.technician && ` (${t('technician', state.lang)}: ${maint.technician})`}
                  </div>
                ) : maint.estimatedCost ? (
                  <div className="text-sm font-bold text-green-600">
                    💰 {t('estimatedCost', state.lang)}: {formatCurrency(maint.estimatedCost)}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    💰 {t('cost', state.lang)}: {t('notSet', state.lang)}
                  </div>
                )}
                
                {/* 裝修預計完成日期 */}
                {isRenovation && maint.estimatedCompletion && (
                  <div className="text-sm text-green-600 mt-1">
                    📅 {t('estimatedCompletion', state.lang)}: {maint.estimatedCompletion}
                  </div>
                )}
                
                {/* 維修日期 */}
                {!isRenovation && maint.repairDate && (
                  <div className="text-sm text-blue-600 mt-1">
                    🔧 {t('repairDate', state.lang)}: {maint.repairDate}
                  </div>
                )}
              </div>

              {/* 操作按鈕 */}
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => openModal('editMaint', maint.id)}
                  className="flex-1 btn bg-blue-100 text-blue-700 text-sm"
                >
                  {t('edit', state.lang)}
                </button>
                
                {maint.s !== 'completed' && (
                  <button 
                    onClick={() => markAsCompleted(maint.id)}
                    className="flex-1 btn bg-green-100 text-green-700 text-sm"
                  >
                    ✅ {t('markAsCompleted', state.lang)}
                  </button>
                )}
                
                {(!maint.cost && !maint.estimatedCost) && (
                  <button 
                    onClick={() => openModal('updateCost', maint.id)}
                    className="flex-1 btn bg-yellow-100 text-yellow-700 text-sm"
                  >
                    💰 {t('addCost', state.lang)}
                  </button>
                )}
                
                <button 
                  onClick={() => deleteMaintenance(maint.id)}
                  className="flex-1 btn bg-red-100 text-red-600 text-sm"
                >
                  {t('delete', state.lang)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )

  function markAsCompleted(maintId: number) {
    if (!confirm(t('confirmComplete', state.lang))) return

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            maintenance: (p.maintenance || []).map(m => 
              m.id === maintId
                ? { 
                    ...m, 
                    s: 'completed' as const,
                    repairDate: m.repairDate || new Date().toISOString().split('T')[0]
                  }
                : m
            )
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('maintenanceCompleted', state.lang))
  }

  function deleteMaintenance(maintId: number) {
    if (!confirm(t('confirmDelete', state.lang))) return

    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            maintenance: (p.maintenance || []).filter(m => m.id !== maintId)
          }
        : p
    )

    updateData({ properties: updatedProperties })
  }
}