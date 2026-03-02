'use client'

import { t } from '@/lib/translations'
import { useApp } from '@/contexts/AppContext'
import { formatCurrency } from '@/lib/utils'
import { useState, useMemo } from 'react'
import { 
  Wrench, 
  Hammer, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign,
  Calendar,
  User,
  Home,
  Filter,
  Plus,
  Edit,
  Trash2,
  FileText,
  CreditCard,
  Users
} from 'lucide-react'

interface MaintenanceProps {
  property: any
}

export default function MaintenanceOptimized({ property }: MaintenanceProps) {
  const { state, updateState, updateData, openModal } = useApp()
  
  // 判斷記錄類型（報修或裝修）- 簡化版
  const getMaintenanceType = (maint: any): string => {
    // 優先使用 category 欄位
    if (maint.category) {
      return maint.category;
    }
    // 預設為報修
    return 'repair';
  };

  // 計算維修成本統計
  const stats = useMemo(() => {
    const allMaintenance = property.maintenance || [];
    
    const completed = allMaintenance.filter((m: any) => m.s === 'completed');
    const pending = allMaintenance.filter((m: any) => m.s === 'pending' || m.s === 'assigned' || m.s === 'in-progress');
    
    const totalMaintenanceCost = allMaintenance.reduce((sum: number, m: any) => {
      return sum + (m.actualCost || m.cost || 0);
    }, 0);
    
    const totalEstimatedCost = allMaintenance.reduce((sum: number, m: any) => {
      return sum + (m.estimatedCost || 0);
    }, 0);
    
    // 按房間統計
    const byRoom: Record<string, { count: number, cost: number }> = {};
    allMaintenance.forEach((m: any) => {
      if (!byRoom[m.n]) {
        byRoom[m.n] = { count: 0, cost: 0 };
      }
      byRoom[m.n].count += 1;
      byRoom[m.n].cost += (m.actualCost || m.cost || 0);
    });
    
    // 按類別統計 - 簡化版
    const byCategory = {
      repair: allMaintenance.filter((m: any) => 
        m.category === 'repair' || m.category === '報修' || (!m.category && getMaintenanceType(m) === 'repair')
      ).length,
      renovation: allMaintenance.filter((m: any) => 
        m.category === 'renovation' || m.category === '裝修' || (!m.category && getMaintenanceType(m) === 'renovation')
      ).length,
      other: allMaintenance.filter((m: any) => 
        m.category === 'other' || m.category === '其它'
      ).length
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
      byStatus,
      totalCount: allMaintenance.length
    };
  }, [property.maintenance]);
  
  // 篩選狀態
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // 獲取所有房間號碼
  const allRooms = useMemo(() => {
    const rooms = (property.maintenance || []).map((m: any) => m.n?.toString() || '');
    const uniqueRooms = Array.from(new Set(rooms)).filter((room): room is string => 
      typeof room === 'string' && room.trim() !== ''
    );
    return uniqueRooms;
  }, [property.maintenance]);

  // 篩選報修/裝修記錄
  const filteredMaintenance = useMemo(() => {
    return (property.maintenance || []).filter((maint: any) => {
      if (filterStatus !== 'all' && maint.s !== filterStatus) return false;
      if (filterRoom !== 'all' && maint.n !== filterRoom) return false;
      if (filterType !== 'all') {
        const maintCategory = maint.category || (getMaintenanceType(maint) === 'renovation' ? 'renovation' : 'repair');
        if (filterType !== maintCategory) return false;
      }
      return true;
    });
  }, [property.maintenance, filterStatus, filterRoom, filterType]);

  // 狀態標籤顏色
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

  // 類型標籤顏色
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'renovation': return 'bg-green-100 text-green-700 border-green-200';
      case 'other': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  // 緊急程度標籤顏色
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 頁面標題和快速操作 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            {t('maintenanceRenovation', state.lang)}
          </h1>
          <p className="text-gray-600 mt-1">
            管理物業的報修和裝修記錄，追蹤進度和成本
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2"
          >
            {viewMode === 'list' ? '網格檢視' : '列表檢視'}
          </button>
          
          <button 
            onClick={() => openModal('addMaint')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            🔧 {t('addMaintenance', state.lang)}
          </button>
          
          <button 
            onClick={() => openModal('addRenovation')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            🏗️ {t('addRenovation', state.lang)}
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總記錄數</p>
              <p className="text-2xl font-bold mt-1">{stats.totalCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            {stats.completedCount} 已完成 • {stats.pendingCount} 進行中
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">維修總成本</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalMaintenanceCost)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            已完成維修費用總計
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">裝修預算</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalEstimatedCost)}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Hammer className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            裝修項目預算總計
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">待處理</p>
              <p className="text-2xl font-bold mt-1">{stats.byStatus.pending + stats.byStatus.assigned}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            {stats.byStatus.pending} 待指派 • {stats.byStatus.assigned} 已指派
          </div>
        </div>
      </div>

      {/* 篩選器 */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold">篩選條件</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 狀態篩選 */}
          <div>
            <label className="block text-sm font-medium mb-2">狀態</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === 'pending' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                待處理
              </button>
              <button
                onClick={() => setFilterStatus('in-progress')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === 'in-progress' ? 'bg-yellow-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                進行中
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filterStatus === 'completed' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                已完成
              </button>
            </div>
          </div>

          {/* 類型篩選 */}
          <div>
            <label className="block text-sm font-medium mb-2">類型</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterType('repair')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filterType === 'repair' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                報修
              </button>
              <button
                onClick={() => setFilterType('renovation')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filterType === 'renovation' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                裝修
              </button>
            </div>
          </div>

          {/* 房間篩選 */}
          <div>
            <label className="block text-sm font-medium mb-2">房間</label>
            <select 
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">全部房間</option>
              {allRooms.map((room: string) => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 篩選結果 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              找到 <span className="font-bold text-blue-600">{filteredMaintenance.length}</span> 筆記錄
            </div>
            <div className="text-sm">
              {filterStatus !== 'all' && <span className="inline-block px-2 py-1 bg-gray-100 rounded mr-2">狀態: {filterStatus}</span>}
              {filterType !== 'all' && <span className="inline-block px-2 py-1 bg-gray-100 rounded mr-2">類型: {filterType}</span>}
              {filterRoom !== 'all' && <span className="inline-block px-2 py-1 bg-gray-100 rounded">房間: {filterRoom}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* 記錄列表/網格 */}
      {viewMode === 'list' ? (
        /* 列表檢視 */
        <div className="space-y-4">
          {filteredMaintenance.map((maint: any) => {
            const type = getMaintenanceType(maint);
            const isRenovation = type === 'renovation';
            
            return (
              <div key={maint.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* 標題欄 */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isRenovation ? 'bg-green-50' : 'bg-blue-50'}`}>
                        {isRenovation ? (
                          <Hammer className="w-5 h-5 text-green-600" />
                        ) : (
                          <Wrench className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{maint.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{maint.desc}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(maint.s)}`}>
                        {maint.s === 'pending' ? '待處理' :
                         maint.s === 'assigned' ? '已指派' :
                         maint.s === 'in-progress' ? '進行中' :
                         maint.s === 'completed' ? '已完成' : '已取消'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(maint.category || (isRenovation ? 'renovation' : 'repair'))}`}>
                        {isRenovation ? '裝修' : '報修'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 詳細資訊 */}
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 基本資訊 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">房間</div>
                          <div className="font-medium">{maint.n || '公共區域'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">租客</div>
                          <div className="font-medium">{maint.t || 'N/A'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">日期</div>
                          <div className="font-medium">{maint.date}</div>
                        </div>
                      </div>
                    </div>

                    {/* 費用資訊 */}
                    <div className="space-y-3">
                      {maint.estimatedCost && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <div>
                            <div className="text-sm text-gray-600">預算</div>
                            <div className="font-medium text-green-600">{formatCurrency(maint.estimatedCost)}</div>
                          </div>
                        </div>
                      )}
                      
                      {maint.actualCost && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-blue-500" />
                          <div>
                            <div className="text-sm text-gray-600">實際費用</div>
                            <div className="font-medium text-blue-600">{formatCurrency(maint.actualCost)}</div>
                          </div>
                        </div>
                      )}
                      
                      {maint.paymentStatus && (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-purple-500" />
                          <div>
                            <div className="text-sm text-gray-600">付款狀態</div>
                            <div className={`font-medium ${
                              maint.paymentStatus === 'paid' ? 'text-green-600' :
                              maint.paymentStatus === 'partial' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {maint.paymentStatus === 'paid' ? '已付款' :
                               maint.paymentStatus === 'partial' ? '部分付款' : '未付款'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 其他資訊 */}
                    <div className="space-y-3">
                      {maint.technician && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">師傅</div>
                            <div className="font-medium">{maint.technician}</div>
                          </div>
                        </div>
                      )}
                      
                      {maint.estimatedCompletion && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">預計完成</div>
                            <div className="font-medium">{maint.estimatedCompletion}</div>
                          </div>
                        </div>
                      )}
                      
                      {maint.actualCompletionDate && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <div>
                            <div className="text-sm text-gray-600">實際完成</div>
                            <div className="font-medium">{maint.actualCompletionDate}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 操作按鈕 */}
                  <div className="mt-5 pt-5 border-t border-gray-100 flex gap-2">
                    <button 
                      onClick={() => openModal('editMaint', maint.id)}
                      className="flex-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      編輯
                    </button>
                    
                    {maint.s !== 'completed' && (
                      <button 
                        onClick={() => markAsCompleted(maint.id)}
                        className="flex-1 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        標記完成
                      </button>
                    )}
                    
                    {(!maint.cost && !maint.estimatedCost) && (
                      <button 
                        onClick={() => openModal('updateCost', maint.id)}
                        className="flex-1 px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg flex items-center justify-center gap-2"
                      >
                        <DollarSign className="w-4 h-4" />
                        更新費用
                      </button>
                    )}
                    
                    <button 
                      onClick={() => deleteMaintenance(maint.id)}
                      className="flex-1 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      刪除
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 網格檢視 */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaintenance.map((maint: any) => {
            const type = getMaintenanceType(maint);
            const isRenovation = type === 'renovation';
            
            return (
              <div key={maint.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* 標題欄 */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${isRenovation ? 'bg-green-50' : 'bg-blue-50'}`}>
                      {isRenovation ? (
                        <Hammer className="w-5 h-5 text-green-600" />
                      ) : (
                        <Wrench className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(maint.s)}`}>
                      {maint.s === 'pending' ? '待處理' :
                       maint.s === 'assigned' ? '已指派' :
                       maint.s === 'in-progress' ? '進行中' :
                       maint.s === 'completed' ? '已完成' : '已取消'}
                    </span>
                  </div>
                  
                  <h3 className="font-bold mt-3 line-clamp-2">{maint.title}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{maint.desc}</p>
                </div>

                {/* 簡要資訊 */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">房間</div>
                      <div className="font-medium">{maint.n || '公共區域'}</div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">日期</div>
                      <div className="font-medium">{maint.date}</div>
                    </div>
                    
                    {maint.estimatedCost && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">預算</div>
                        <div className="font-medium text-green-600">{formatCurrency(maint.estimatedCost)}</div>
                      </div>
                    )}
                    
                    {maint.actualCost && (
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">實際費用</div>
                        <div className="font-medium text-blue-600">{formatCurrency(maint.actualCost)}</div>
                      </div>
                    )}
                  </div>

                  {/* 操作按鈕 */}
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => openModal('editMaint', maint.id)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm"
                    >
                      編輯
                    </button>
                    
                    <button 
                      onClick={() => openModal('viewMaint', maint.id)}
                      className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm"
                    >
                      詳情
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 空狀態 */}
      {filteredMaintenance.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold mb-2">暫無記錄</h3>
          <p className="text-gray-600 mb-6">目前沒有符合篩選條件的報修或裝修記錄</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={() => {
                setFilterStatus('all');
                setFilterRoom('all');
                setFilterType('all');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              清除篩選
            </button>
            <button 
              onClick={() => openModal('addMaint')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              新增記錄
            </button>
          </div>
        </div>
      )}
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