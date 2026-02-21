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
  
  // 獲取所有房間號碼
  const allRooms: string[] = Array.from(new Set((property.maintenance || []).map((m: any) => m.n)));
  
  // 篩選報修記錄
  const filteredMaintenance = (property.maintenance || []).filter((maint: any) => {
    if (filterStatus !== 'all' && maint.s !== filterStatus) return false;
    if (filterRoom !== 'all' && maint.n !== filterRoom) return false;
    return true;
  });
  
  return (
    <div className="space-y-4">
      {/* 成本統計 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">💰 {t('costAnalysis', state.lang)}</h2>
        
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
        </div>
      </div>

      {/* 新增報修按鈕 */}
      <button 
        onClick={() => openModal('addMaint')}
        className="btn btn-primary w-full"
      >
        ➕ {t('addMaint', state.lang)}
      </button>

      {/* 報修列表 */}
      <div className="space-y-3">
        {filteredMaintenance.map((maint: any) => (
          <div key={maint.id} className="card">
            <div className="flex gap-2 mb-2">
              <span className={`badge ${
                maint.urg === 'urgent' 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {t(maint.urg, state.lang)}
              </span>
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

            <h3 className="font-bold text-lg mb-2">{maint.title}</h3>
            <p className="text-gray-600 mb-2">{maint.desc}</p>
            <div className="text-sm text-gray-500 mb-2">
              {maint.n} - {maint.t}
            </div>

            {maint.cost && (
              <div className="text-sm font-bold text-blue-600">
                維修費用: ${maint.cost.toLocaleString()}
              </div>
            )}
            
            {maint.repairDate && (
              <div className="text-xs text-gray-500">
                維修日期: {maint.repairDate}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => openModal('editMaint', maint.id)}
                className="flex-1 btn bg-blue-100 text-blue-700 text-sm"
              >
                {t('edit', state.lang)}
              </button>
              <button 
                onClick={() => deleteMaintenance(maint.id)}
                className="flex-1 btn bg-red-100 text-red-600 text-sm"
              >
                {t('delete', state.lang)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

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