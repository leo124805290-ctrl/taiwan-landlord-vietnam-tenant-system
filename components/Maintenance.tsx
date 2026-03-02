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
  
  // 判斷記錄類型（報修或裝修）
  const getMaintenanceType = (maint: any): string => {
    // 優先使用 category 字段
    if (maint.category) {
      return maint.category === 'renovation' ? 'renovation' : 'maintenance';
    }
    // 兼容舊數據：如果有 estimatedCost 或標題包含「裝修」，則視為裝修
    if (maint.estimatedCost !== undefined || 
        (maint.title && (maint.title.includes('裝修') || maint.title.includes('cải tạo') || maint.title.includes('renovation')))) {
      return 'renovation';
    }
    return 'maintenance';
  };

  // 計算維修成本統計
  const calculateMaintenanceStats = () => {
    const allMaintenance = property.maintenance || [];
    
    const completed = allMaintenance.filter((m: any) => m.s === 'completed');
    const pending = allMaintenance.filter((m: any) => m.s === 'pending' || m.s === 'assigned' || m.s === 'in-progress');
    
    // 使用實際費用，如果沒有則使用預計費用
    const totalMaintenanceCost = allMaintenance.reduce((sum: number, m: any) => {
      return sum + (m.actualCost || m.cost || 0);
    }, 0);
    
    const totalEstimatedCost = allMaintenance.reduce((sum: number, m: any) => {
      return sum + (m.estimatedCost || 0);
    }, 0);
    
    // 按房間統計（使用實際費用）
    const byRoom: Record<string, { count: number, cost: number }> = {};
    allMaintenance.forEach((m: any) => {
      if (!byRoom[m.n]) {
        byRoom[m.n] = { count: 0, cost: 0 };
      }
      byRoom[m.n].count += 1;
      byRoom[m.n].cost += (m.actualCost || m.cost || 0);
    });
    
    // 按類別統計
    const byCategory = {
      repair: allMaintenance.filter((m: any) => 
        m.category === 'repair' || (!m.category && getMaintenanceType(m) === 'maintenance')
      ).length,
      renovation: allMaintenance.filter((m: any) => 
        m.category === 'renovation' || (!m.category && getMaintenanceType(m) === 'renovation')
      ).length,
      other: allMaintenance.filter((m: any) => m.category === 'other').length
    };
    
    // 按狀態統計
    const byStatus = {
      pending: allMaintenance.filter((m: any) => m.s === 'pending').length,
      assigned: allMaintenance.filter((m: any) => m.s === 'assigned').length,
      inProgress: allMaintenance.filter((m: any) => m.s === 'in-progress').length,
      completed: allMaintenance.filter((m: any) => m.s === 'completed').length,
      cancelled: allMaintenance.filter((m: any) => m.s === 'cancelled').length
    };
    
    return {
      totalMaintenanceCost,
      totalEstimatedCost,
      completedCount: completed.length,
      pendingCount: pending.length,
      byRoom,
      byCategory,
      byStatus
    };
  };
  
  const stats = calculateMaintenanceStats();
  
  // 篩選狀態
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  // 獲取所有房間號碼
  const allRooms: string[] = Array.from(new Set((property.maintenance || []).map((m: any) => m.n)));

  // 篩選報修/裝修記錄
  const filteredMaintenance = (property.maintenance || []).filter((maint: any) => {
    if (filterStatus !== 'all' && maint.s !== filterStatus) return false;
    if (filterRoom !== 'all' && maint.n !== filterRoom) return false;
    if (filterType !== 'all') {
      // 使用 category 字段進行篩選
      const maintCategory = maint.category || (getMaintenanceType(maint) === 'renovation' ? 'renovation' : 'repair');
      if (filterType !== maintCategory) return false;
    }
    return true;
  });
  
  return (
    <div className="space-y-4">
      {/* 成本統計 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">🔧 {t('maintenanceRenovation', state.lang)}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
              {formatCurrency(stats.totalEstimatedCost)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.byCategory.renovation} {t('categoryRenovation', state.lang)}
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600">{t('pendingMaintenance', state.lang)}</div>
            <div className="text-2xl font-bold text-purple-700">
              {stats.pendingCount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.byStatus.pending} {t('statusPending', state.lang)}
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-sm text-gray-600">{t('inProgressMaintenance', state.lang)}</div>
            <div className="text-2xl font-bold text-yellow-700">
              {stats.byStatus.inProgress}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.byStatus.assigned} {t('statusAssigned', state.lang)}
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
              <option value="pending">{t('statusPending', state.lang)}</option>
              <option value="assigned">{t('statusAssigned', state.lang)}</option>
              <option value="in-progress">{t('statusInProgress', state.lang)}</option>
              <option value="completed">{t('statusCompleted', state.lang)}</option>
              <option value="cancelled">{t('statusCancelled', state.lang)}</option>
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
              <option value="repair">{t('categoryRepair', state.lang)}</option>
              <option value="renovation">{t('categoryRenovation', state.lang)}</option>
              <option value="other">{t('categoryOther', state.lang)}</option>
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
                    maint.category === 'renovation' 
                      ? 'bg-green-100 text-green-700' 
                      : maint.category === 'other'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {maint.category === 'renovation' 
                      ? t('categoryRenovation', state.lang) 
                      : maint.category === 'other'
                      ? t('categoryOther', state.lang)
                      : t('categoryRepair', state.lang)}
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
                      : maint.s === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-700'
                      : maint.s === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {maint.s === 'pending' ? t('statusPending', state.lang) :
                     maint.s === 'assigned' ? t('statusAssigned', state.lang) :
                     maint.s === 'in-progress' ? t('statusInProgress', state.lang) :
                     maint.s === 'completed' ? t('statusCompleted', state.lang) :
                     t('statusCancelled', state.lang)}
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
              <div className="mb-3 space-y-2">
                {/* 預計費用 */}
                {maint.estimatedCost && (
                  <div className="text-sm">
                    <span className="text-gray-600">📋 {t('estimatedCost', state.lang)}:</span>
                    <span className="font-bold text-green-600 ml-2">{formatCurrency(maint.estimatedCost)}</span>
                  </div>
                )}
                
                {/* 實際費用 */}
                {maint.actualCost && (
                  <div className="text-sm">
                    <span className="text-gray-600">💰 {t('actualCost', state.lang)}:</span>
                    <span className="font-bold text-blue-600 ml-2">{formatCurrency(maint.actualCost)}</span>
                  </div>
                )}
                
                {/* 付款狀態 */}
                {maint.paymentStatus && (
                  <div className="text-sm">
                    <span className="text-gray-600">💳 {t('paymentStatus', state.lang)}:</span>
                    <span className={`font-bold ml-2 ${
                      maint.paymentStatus === 'paid' ? 'text-green-600' :
                      maint.paymentStatus === 'partial' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {maint.paymentStatus === 'paid' ? t('paidStatus', state.lang) :
                       maint.paymentStatus === 'partial' ? t('partialPayment', state.lang) :
                       t('unpaidStatus', state.lang)}
                    </span>
                  </div>
                )}
                
                {/* 發票號碼 */}
                {maint.invoiceNumber && (
                  <div className="text-sm">
                    <span className="text-gray-600">🧾 {t('invoiceNumber', state.lang)}:</span>
                    <span className="font-bold text-purple-600 ml-2">{maint.invoiceNumber}</span>
                  </div>
                )}
                
                {/* 日期資訊 */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {maint.estimatedCompletion && (
                    <div>
                      <span className="text-gray-600">📅 {t('estimatedCompletion', state.lang)}:</span>
                      <div className="font-medium">{maint.estimatedCompletion}</div>
                    </div>
                  )}
                  
                  {maint.actualCompletionDate && (
                    <div>
                      <span className="text-gray-600">✅ {t('actualCompletionDate', state.lang)}:</span>
                      <div className="font-medium">{maint.actualCompletionDate}</div>
                    </div>
                  )}
                </div>
                
                {/* 師傅資訊 */}
                {maint.technician && (
                  <div className="text-sm">
                    <span className="text-gray-600">👨‍🔧 {t('technician', state.lang)}:</span>
                    <span className="font-medium ml-2">{maint.technician}</span>
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

    const updatedProperties = (state.data?.properties || []).map(p => 
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
    if (!confirm(t('confirmDeleteMaintenance', state.lang))) return
    
    const password = prompt(t('enterPasswordToDeleteMaintenance', state.lang))
    if (password !== '123456') {
      alert(t('incorrectPassword', state.lang))
      return
    }

    const updatedProperties = (state.data?.properties || []).map(p => 
      p.id === property.id
        ? {
            ...p,
            maintenance: (p.maintenance || []).filter(m => m.id !== maintId)
          }
        : p
    )

    updateData({ properties: updatedProperties })
    alert(t('maintenanceDeleted', state.lang))
  }
}