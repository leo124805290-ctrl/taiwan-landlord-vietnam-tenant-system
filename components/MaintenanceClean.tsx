'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'
import { 
  Wrench, 
  Hammer, 
  Clock, 
  CheckCircle, 
  Calendar,
  DollarSign,
  User,
  Home,
  Plus,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react'

interface MaintenanceCleanProps {
  property: any
}

export default function MaintenanceClean({ property }: MaintenanceCleanProps) {
  const { state, updateState, updateData, openModal } = useApp()
  
  // 計算統計
  const allMaintenance = property.maintenance || [];
  const pendingCount = allMaintenance.filter((m: any) => 
    m.s === 'pending' || m.s === 'assigned' || m.s === 'in-progress'
  ).length;
  const completedCount = allMaintenance.filter((m: any) => m.s === 'completed').length;
  
  // 篩選狀態
  const [view, setView] = useState<'all' | 'pending' | 'completed'>('pending');
  const [search, setSearch] = useState('');
  
  // 篩選記錄
  const filteredMaintenance = allMaintenance.filter((maint: any) => {
    if (view === 'pending' && !['pending', 'assigned', 'in-progress'].includes(maint.s)) return false;
    if (view === 'completed' && maint.s !== 'completed') return false;
    if (search && !maint.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // 狀態樣式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending': return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'assigned': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'in-progress': return { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' };
      case 'completed': return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
    }
  };

  // 狀態文字
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待處理';
      case 'assigned': return '已指派';
      case 'in-progress': return '進行中';
      case 'completed': return '已完成';
      default: return status;
    }
  };

  // 類型判斷
  const isRenovation = (maint: any) => {
    return maint.category === 'renovation' || maint.estimatedCost !== undefined ||
           (maint.title && (maint.title.includes('裝修') || maint.title.includes('renovation')));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">維修管理</h1>
              <p className="text-sm text-gray-600 mt-1">報修與裝修記錄</p>
            </div>
            <button 
              onClick={() => openModal('addMaint')}
              className="btn-primary inline-flex items-center px-4 py-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              新增
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 快速統計 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600">總記錄</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{allMaintenance.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600">待處理</div>
            <div className="text-2xl font-bold text-orange-600 mt-1">{pendingCount}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600">已完成</div>
            <div className="text-2xl font-bold text-green-600 mt-1">{completedCount}</div>
          </div>
        </div>

        {/* 控制欄 */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* 視圖切換 */}
            <div className="flex rounded-lg border border-gray-200 p-1">
              <button
                onClick={() => setView('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'all' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setView('pending')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'pending' ? 'bg-orange-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                待處理
              </button>
              <button
                onClick={() => setView('completed')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === 'completed' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                已完成
              </button>
            </div>

            {/* 搜尋 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜尋..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 篩選 */}
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 記錄列表 */}
        <div className="space-y-3">
          {filteredMaintenance.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">沒有記錄</h3>
              <p className="text-gray-600 mb-4">目前沒有維修或裝修記錄</p>
              <button 
                onClick={() => openModal('addMaint')}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                新增記錄
              </button>
            </div>
          ) : (
            filteredMaintenance.map((maint: any) => {
              const statusStyle = getStatusStyle(maint.s);
              const renovation = isRenovation(maint);
              
              return (
                <div key={maint.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="p-4">
                    {/* 標頭 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded ${renovation ? 'bg-green-100' : 'bg-blue-100'}`}>
                          {renovation ? (
                            <Hammer className="h-4 w-4 text-green-600" />
                          ) : (
                            <Wrench className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{maint.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                              {getStatusText(maint.s)}
                            </span>
                            {maint.urg === 'urgent' && (
                              <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                                緊急
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* 日期 */}
                      {maint.date && (
                        <div className="text-sm text-gray-500">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          {maint.date}
                        </div>
                      )}
                    </div>

                    {/* 內容 */}
                    <p className="text-gray-600 text-sm mb-4">{maint.desc}</p>

                    {/* 詳細資訊 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {maint.n && (
                        <div>
                          <div className="text-gray-500">房間</div>
                          <div className="font-medium text-gray-900">{maint.n}</div>
                        </div>
                      )}
                      
                      {maint.t && (
                        <div>
                          <div className="text-gray-500">租客</div>
                          <div className="font-medium text-gray-900">{maint.t}</div>
                        </div>
                      )}
                      
                      {(maint.actualCost || maint.estimatedCost) && (
                        <div>
                          <div className="text-gray-500">費用</div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(maint.actualCost || maint.estimatedCost)}
                          </div>
                        </div>
                      )}
                      
                      {maint.technician && (
                        <div>
                          <div className="text-gray-500">師傅</div>
                          <div className="font-medium text-gray-900">{maint.technician}</div>
                        </div>
                      )}
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => openModal('editMaint', maint.id)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                      >
                        編輯
                      </button>
                      
                      {maint.s !== 'completed' && (
                        <button 
                          onClick={() => markAsCompleted(maint.id)}
                          className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          標記完成
                        </button>
                      )}
                      
                      {(!maint.cost && !maint.estimatedCost) && (
                        <button 
                          onClick={() => openModal('updateCost', maint.id)}
                          className="flex-1 px-3 py-2 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50"
                        >
                          新增費用
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 底部資訊 */}
        {filteredMaintenance.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            顯示 {filteredMaintenance.length} 筆記錄
          </div>
        )}
      </div>
    </div>
  )

  function markAsCompleted(maintId: number) {
    if (!confirm('確定要標記為已完成嗎？')) return

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
    alert('已標記為完成')
  }
}