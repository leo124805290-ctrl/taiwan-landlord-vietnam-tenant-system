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
  AlertCircle, 
  Calendar,
  DollarSign,
  User,
  Home,
  Filter,
  Plus,
  Search,
  ChevronRight,
  Tag,
  FileText
} from 'lucide-react'

interface MaintenanceSimpleProps {
  property: any
}

export default function MaintenanceSimple({ property }: MaintenanceSimpleProps) {
  const { state, updateState, updateData, openModal } = useApp()
  
  // 判斷記錄類型
  const getMaintenanceType = (maint: any): string => {
    if (maint.category) {
      return maint.category === 'renovation' ? 'renovation' : 'maintenance';
    }
    if (maint.estimatedCost !== undefined || 
        (maint.title && (maint.title.includes('裝修') || maint.title.includes('cải tạo') || maint.title.includes('renovation')))) {
      return 'renovation';
    }
    return 'maintenance';
  };

  // 計算統計數據
  const calculateMaintenanceStats = () => {
    const allMaintenance = property.maintenance || [];
    
    const completed = allMaintenance.filter((m: any) => m.s === 'completed');
    const pending = allMaintenance.filter((m: any) => m.s === 'pending' || m.s === 'assigned' || m.s === 'in-progress');
    
    const totalMaintenanceCost = allMaintenance.reduce((sum: number, m: any) => {
      return sum + (m.actualCost || m.cost || 0);
    }, 0);
    
    const totalEstimatedCost = allMaintenance.reduce((sum: number, m: any) => {
      return sum + (m.estimatedCost || 0);
    }, 0);
    
    return {
      totalMaintenanceCost,
      totalEstimatedCost,
      completedCount: completed.length,
      pendingCount: pending.length,
      totalCount: allMaintenance.length
    };
  };
  
  const stats = calculateMaintenanceStats();
  
  // 篩選狀態
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // 篩選報修/裝修記錄
  const filteredMaintenance = (property.maintenance || []).filter((maint: any) => {
    if (filterStatus !== 'all' && maint.s !== filterStatus) return false;
    if (searchQuery && !maint.title?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !maint.desc?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // 狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'assigned': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // 狀態圖標
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'assigned': return <AlertCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // 類型顏色
  const getTypeColor = (maint: any) => {
    const type = getMaintenanceType(maint);
    return type === 'renovation' 
      ? 'bg-green-50 text-green-700 border-green-200' 
      : 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">報修與裝修</h1>
          <p className="text-gray-600 mt-1">管理維修記錄與裝修專案</p>
        </div>
        <button 
          onClick={() => openModal('addMaint')}
          className="btn-primary inline-flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          新增記錄
        </button>
      </div>

      {/* 快速統計 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總記錄</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.totalCount}</p>
            </div>
            <FileText className="h-6 w-6 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">待處理</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.pendingCount}</p>
            </div>
            <Clock className="h-6 w-6 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已完成</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{stats.completedCount}</p>
            </div>
            <CheckCircle className="h-6 w-6 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總費用</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalMaintenanceCost)}</p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>

      {/* 篩選與搜尋 */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* 搜尋框 */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋報修或裝修..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* 狀態篩選按鈕 */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'pending' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              待處理
            </button>
            <button
              onClick={() => setFilterStatus('in-progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'in-progress' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              進行中
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === 'completed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已完成
            </button>
          </div>
        </div>
      </div>

      {/* 記錄列表 */}
      <div className="space-y-3">
        {filteredMaintenance.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
            <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">沒有找到記錄</h3>
            <p className="text-gray-600 mb-4">目前沒有符合條件的報修或裝修記錄</p>
            <button 
              onClick={() => openModal('addMaint')}
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              新增第一筆記錄
            </button>
          </div>
        ) : (
          filteredMaintenance.map((maint: any) => {
            const type = getMaintenanceType(maint);
            const isRenovation = type === 'renovation';
            
            return (
              <div key={maint.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 標題與類型 */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTypeColor(maint)}`}>
                          {isRenovation ? <Hammer className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                          {isRenovation ? '裝修' : '報修'}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(maint.s)}`}>
                          {getStatusIcon(maint.s)}
                          {maint.s === 'pending' ? '待處理' :
                           maint.s === 'assigned' ? '已指派' :
                           maint.s === 'in-progress' ? '進行中' :
                           maint.s === 'completed' ? '已完成' : '已取消'}
                        </span>
                      </div>
                      
                      {/* 主要資訊 */}
                      <h3 className="font-semibold text-gray-900 mb-1">{maint.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{maint.desc}</p>
                      
                      {/* 詳細資訊 */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {maint.n && (
                          <div className="flex items-center gap-1">
                            <Home className="h-3 w-3" />
                            <span>{maint.n}</span>
                          </div>
                        )}
                        
                        {maint.date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{maint.date}</span>
                          </div>
                        )}
                        
                        {maint.t && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{maint.t}</span>
                          </div>
                        )}
                        
                        {(maint.actualCost || maint.estimatedCost) && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span className="font-medium">
                              {formatCurrency(maint.actualCost || maint.estimatedCost)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 操作按鈕 */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button 
                        onClick={() => openModal('editMaint', maint.id)}
                        className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        編輯
                      </button>
                      
                      {maint.s !== 'completed' && (
                        <button 
                          onClick={() => markAsCompleted(maint.id)}
                          className="px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          完成
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 底部統計 */}
      {filteredMaintenance.length > 0 && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-600">
              顯示 {filteredMaintenance.length} 筆記錄
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">報修</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">裝修</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function markAsCompleted(maintId: number) {
    if (!confirm('確定要標記為已完成嗎？')) return

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
    alert('已標記為完成')
  }
}