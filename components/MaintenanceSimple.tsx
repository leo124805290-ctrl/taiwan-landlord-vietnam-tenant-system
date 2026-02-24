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
  FileText
} from 'lucide-react'

interface MaintenanceSimpleProps {
  property: any
}

export default function MaintenanceSimple({ property }: MaintenanceSimpleProps) {
  const { state, updateState, updateData, openModal } = useApp()
  
  // 所有維護記錄
  const allMaintenance = property.maintenance || []
  
  // 篩選狀態
  const [filterCategory, setFilterCategory] = useState<string>('all') // 大類：all, repair, renovation
  const [filterStatus, setFilterStatus] = useState<string>('all') // 小類：all, pending, in-progress, completed
  const [filterRoom, setFilterRoom] = useState<string>('all') // 房間：all, 具體房間
  
  // 獲取所有房間
  const allRooms = useMemo(() => {
    const rooms = allMaintenance.map((m: any) => m.n || '公共區域')
    const uniqueRooms = Array.from(new Set(rooms)).filter(room => room && room.trim() !== '')
    return uniqueRooms
  }, [allMaintenance])
  
  // 篩選記錄
  const filteredMaintenance = useMemo(() => {
    return allMaintenance.filter((maint: any) => {
      // 大類篩選
      if (filterCategory !== 'all') {
        const maintCategory = maint.category || 'repair'
        if (filterCategory !== maintCategory) return false
      }
      
      // 小類（狀態）篩選
      if (filterStatus !== 'all' && maint.s !== filterStatus) return false
      
      // 房間篩選
      if (filterRoom !== 'all' && maint.n !== filterRoom) return false
      
      return true
    })
  }, [allMaintenance, filterCategory, filterStatus, filterRoom])
  
  // 統計
  const stats = useMemo(() => {
    const totalCost = allMaintenance.reduce((sum: number, m: any) => sum + (m.cost || 0), 0)
    const completed = allMaintenance.filter((m: any) => m.s === 'completed').length
    const pending = allMaintenance.filter((m: any) => m.s === 'pending' || m.s === 'in-progress').length
    
    return {
      totalCount: allMaintenance.length,
      completedCount: completed,
      pendingCount: pending,
      totalCost: totalCost
    }
  }, [allMaintenance])
  
  // 狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700'
      case 'in-progress': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  // 類型顏色
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'renovation': return 'bg-green-100 text-green-700'
      case 'repair': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  // 標記為完成
  const markAsCompleted = (maintId: number) => {
    if (!confirm('確定要標記為已完成嗎？')) return
    
    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            maintenance: (p.maintenance || []).map(m => 
              m.id === maintId
                ? { ...m, s: 'completed' as const }
                : m
            )
          }
        : p
    )
    
    updateData({ properties: updatedProperties })
    alert('已標記為已完成')
  }
  
  // 刪除記錄
  const deleteMaintenance = (maintId: number) => {
    if (!confirm('確定要刪除這筆記錄嗎？')) return
    
    const updatedProperties = state.data.properties.map(p => 
      p.id === property.id
        ? {
            ...p,
            maintenance: (p.maintenance || []).filter(m => m.id !== maintId)
          }
        : p
    )
    
    updateData({ properties: updatedProperties })
    alert('記錄已刪除')
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            報修/裝修管理
          </h1>
          <p className="text-gray-600 mt-1">
            簡單管理報修和裝修記錄
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => openModal('addMaint')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增報修
          </button>
          
          <button 
            onClick={() => openModal('addRenovation')}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新增裝修
          </button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <p className="text-sm text-gray-600">總費用</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(stats.totalCost)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            所有記錄費用總計
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">待處理</p>
              <p className="text-2xl font-bold mt-1">{stats.pendingCount}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            需要處理的記錄
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
          {/* 大類篩選 */}
          <div>
            <label className="block text-sm font-medium mb-2">大類</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filterCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterCategory('repair')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filterCategory === 'repair' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                報修
              </button>
              <button
                onClick={() => setFilterCategory('renovation')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filterCategory === 'renovation' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                裝修
              </button>
            </div>
          </div>

          {/* 小類（狀態）篩選 */}
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
              {filterCategory !== 'all' && <span className="inline-block px-2 py-1 bg-gray-100 rounded mr-2">大類: {filterCategory === 'repair' ? '報修' : '裝修'}</span>}
              {filterStatus !== 'all' && <span className="inline-block px-2 py-1 bg-gray-100 rounded mr-2">狀態: {filterStatus === 'pending' ? '待處理' : filterStatus === 'in-progress' ? '進行中' : '已完成'}</span>}
              {filterRoom !== 'all' && <span className="inline-block px-2 py-1 bg-gray-100 rounded">房間: {filterRoom}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* 記錄列表 */}
      <div className="space-y-4">
        {filteredMaintenance.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Wrench className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">暫無記錄</h3>
            <p className="text-gray-600 mb-6">目前沒有符合篩選條件的記錄</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => {
                  setFilterCategory('all')
                  setFilterStatus('all')
                  setFilterRoom('all')
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
        ) : (
          filteredMaintenance.map((maint: any) => {
            const isRenovation = maint.category === 'renovation'
            
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
                        <h3 className="font-bold text-lg">{maint.title || '無標題'}</h3>
                        <p className="text-gray-600 text-sm mt-1">{maint.desc || '無描述'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(maint.s)}`}>
                        {maint.s === 'pending' ? '待處理' :
                         maint.s === 'in-progress' ? '進行中' :
                         maint.s === 'completed' ? '已完成' : maint.s}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(maint.category || 'repair')}`}>
                        {isRenovation ? '裝修' : '報修'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 詳細資訊 */}
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 基本資訊 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">房間</div>
                          <div className="font-medium">{maint.n || '公共區域'}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">日期</div>
                          <div className="font-medium">{maint.date || '未設定'}</div>
                        </div>
                      </div>
                    </div>

                    {/* 金額資訊 */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-600">金額</div>
                          <div className="font-medium text-blue-600">{formatCurrency(maint.cost || 0)}</div>
                        </div>
                      </div>
                      
                      {maint.subCategory && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">問題類型</div>
                            <div className="font-medium">{maint.subCategory}</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 租客資訊 */}
                    <div className="space-y-2">
                      {maint.t && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">租客</div>
                            <div className="font-medium">{maint.t}</div>
                          </div>
                        </div>
                      )}
                      
                      {maint.urg && maint.urg !== 'normal' && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <div>
                            <div className="text-sm text-gray-600">緊急程度</div>
                            <div className="font-medium text-red-600">
                              {maint.urg === 'urgent' ? '緊急' : '高'}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 其他資訊 */}
                    <div className="space-y-2">
                      {maint.technician && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">師傅</div>
                            <div className="font-medium">{maint.technician}</div>
                          </div>
                        </div>
                      )}
                      
                      {maint.repairDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">維修日期</div>
                            <div className="font-medium">{maint.repairDate}</div>
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
            )
          })
        )}
      </div>
    </div>
  )
}