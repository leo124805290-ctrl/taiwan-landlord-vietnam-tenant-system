# Rooms.tsx 組件分析報告

## 分析時間
- **台灣時間**：2026-03-06 00:57
- **文件**：`components/Rooms.tsx`
- **行數**：995行

## 組件概覽

### 主要問題
1. **過於龐大**：995行單一文件，違反單一職責原則
2. **狀態複雜**：處理9種房間狀態，邏輯混亂
3. **職責過多**：包含UI渲染、業務邏輯、數據處理
4. **難以維護**：代碼結構複雜，修改風險高

## 組件結構分析

### 1. 導入和接口定義（行1-30）
```typescript
'use client'

import { t } from '@/lib/translations'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useApp } from '@/contexts/AppContext'
import { useState, useMemo, useEffect } from 'react'
import { Room, RoomStatus, CheckInPaymentType, CheckOutType } from '@/lib/types'

interface RoomsProps {
  property: any
}
```

### 2. 狀態管理（行32-50）
```typescript
export default function Rooms({ property }: RoomsProps) {
  const { state, updateState, updateData, openModal } = useApp()
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'table'>('table')
  const [filterStatus, setFilterStatus] = useState<RoomStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
```

### 3. 業務邏輯（行52-150）
- 房間狀態自動轉換邏輯（入住日檢查）
- 9種狀態的處理邏輯
- 數據更新和同步

### 4. 數據處理函數（行150-400）
- 過濾和搜索邏輯
- 統計計算函數
- 狀態轉換函數

### 5. UI渲染（行400-995）
- 三種視圖模式（卡片、列表、表格）
- 複雜的條件渲染
- 大量的JSX代碼

## 9種房間狀態分析

### 現有狀態（複雜）：
1. `pending_checkin_paid` - 待入住（已結清）
2. `pending_checkin_unpaid` - 待入住（尚未結清）
3. `occupied` - 已出租入住中
4. `pending_checkout` - 待退房
5. `pending_checkout_unpaid` - 待退房（尚有未結清款項）
6. `available` - 空屋可出租
7. `maintenance` - 維修中
8. `reserved` - 已預訂
9. `unavailable` - 不可出租（其他原因）

### 簡化狀態（目標）：
1. `available` - 空房可出租
2. `occupied` - 已出租入住中
3. `maintenance` - 維修中

## 核心業務邏輯提取

### 需要保留的功能：
1. **房間狀態管理**
   - 狀態轉換邏輯
   - 自動狀態更新
   - 狀態驗證

2. **數據操作**
   - 房間CRUD操作
   - 租客管理
   - 付款管理

3. **UI交互**
   - 多視圖模式
   - 過濾和搜索
   - 批量操作

### 可以簡化的功能：
1. **複雜的狀態邏輯**：從9種簡化為3種
2. **重複的UI代碼**：提取為可重用組件
3. **分散的業務邏輯**：集中到服務層

## 重構方案

### 方案A：逐步替換
1. **第一步**：創建新的簡化組件 `RoomsSimplified.tsx`
2. **第二步**：並行運行新舊組件
3. **第三步**：逐步遷移功能
4. **第四步**：完全替換舊組件

### 方案B：直接重構
1. **第一步**：分析並提取核心邏輯
2. **第二步**：創建新的組件結構
3. **第三步**：一次性替換舊組件
4. **第四步**：測試和驗證

### 推薦方案：A（逐步替換）
**理由**：
1. 風險較低，可以隨時回滾
2. 不影響現有功能
3. 可以逐步驗證和調整
4. 團隊學習曲線較平緩

## 新的組件結構設計

### 1. 核心組件：`RoomsContainer.tsx`
```typescript
// 容器組件，負責數據管理和狀態
import { useState, useEffect } from 'react'
import { useRooms } from '@/hooks/useRooms'
import RoomsView from './RoomsView'
import RoomFilters from './RoomFilters'
import RoomStats from './RoomStats'

export default function RoomsContainer({ propertyId }: { propertyId: string }) {
  const { rooms, loading, error, refetch } = useRooms(propertyId)
  const [filter, setFilter] = useState({ status: 'all', search: '' })
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  
  // 過濾邏輯
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (filter.status !== 'all' && room.status !== filter.status) return false
      if (filter.search && !room.number.includes(filter.search)) return false
      return true
    })
  }, [rooms, filter])
  
  return (
    <div className="rooms-container">
      <RoomStats rooms={rooms} />
      <RoomFilters filter={filter} onFilterChange={setFilter} />
      <RoomsView 
        rooms={filteredRooms} 
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
    </div>
  )
}
```

### 2. 視圖組件：`RoomsView.tsx`
```typescript
// 負責房間列表的顯示
import RoomTable from './RoomTable'
import RoomCards from './RoomCards'

export default function RoomsView({ 
  rooms, 
  viewMode,
  onViewModeChange 
}: RoomsViewProps) {
  return (
    <div className="rooms-view">
      <div className="view-mode-selector">
        <button onClick={() => onViewModeChange('table')}>表格</button>
        <button onClick={() => onViewModeChange('card')}>卡片</button>
      </div>
      
      {viewMode === 'table' ? (
        <RoomTable rooms={rooms} />
      ) : (
        <RoomCards rooms={rooms} />
      )}
    </div>
  )
}
```

### 3. 表格視圖：`RoomTable.tsx`
```typescript
// 表格視圖的具體實現
import RoomRow from './RoomRow'

export default function RoomTable({ rooms }: { rooms: SimpleRoom[] }) {
  return (
    <table className="room-table">
      <thead>
        <tr>
          <th>房號</th>
          <th>狀態</th>
          <th>租金</th>
          <th>租客</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {rooms.map(room => (
          <RoomRow key={room.id} room={room} />
        ))}
      </tbody>
    </table>
  )
}
```

### 4. 卡片視圖：`RoomCards.tsx`
```typescript
// 卡片視圖的具體實現
import RoomCard from './RoomCard'

export default function RoomCards({ rooms }: { rooms: SimpleRoom[] }) {
  return (
    <div className="room-cards">
      {rooms.map(room => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  )
}
```

### 5. 過濾器組件：`RoomFilters.tsx`
```typescript
// 過濾和搜索功能
export default function RoomFilters({ 
  filter, 
  onFilterChange 
}: RoomFiltersProps) {
  return (
    <div className="room-filters">
      <select 
        value={filter.status}
        onChange={e => onFilterChange({ ...filter, status: e.target.value })}
      >
        <option value="all">全部狀態</option>
        <option value="available">空房</option>
        <option value="occupied">已出租</option>
        <option value="maintenance">維修中</option>
      </select>
      
      <input
        type="text"
        placeholder="搜尋房號..."
        value={filter.search}
        onChange={e => onFilterChange({ ...filter, search: e.target.value })}
      />
    </div>
  )
}
```

### 6. 統計組件：`RoomStats.tsx`
```typescript
// 房間統計信息
export default function RoomStats({ rooms }: { rooms: SimpleRoom[] }) {
  const stats = useMemo(() => {
    const total = rooms.length
    const available = rooms.filter(r => r.status === 'available').length
    const occupied = rooms.filter(r => r.status === 'occupied').length
    const maintenance = rooms.filter(r => r.status === 'maintenance').length
    
    return { total, available, occupied, maintenance }
  }, [rooms])
  
  return (
    <div className="room-stats">
      <div className="stat-card">
        <div className="stat-label">總房間數</div>
        <div className="stat-value">{stats.total}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">空房</div>
        <div className="stat-value">{stats.available}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">已出租</div>
        <div className="stat-value">{stats.occupied}</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">維修中</div>
        <div className="stat-value">{stats.maintenance}</div>
      </div>
    </div>
  )
}
```

## 數據層設計

### 自定義Hook：`useRooms.ts`
```typescript
import { useState, useEffect } from 'react'
import { SimpleRoom } from '@/types/simple'
import { roomsApi } from '@/lib/api/client'

export function useRooms(propertyId: string) {
  const [rooms, setRooms] = useState<SimpleRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    fetchRooms()
  }, [propertyId])
  
  const fetchRooms = async () => {
    try {
      setLoading(true)
      const response = await roomsApi.getRooms(propertyId)
      setRooms(response.data)
      setError(null)
    } catch (err) {
      setError('載入房間資料失敗')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  const updateRoom = async (roomId: string, updates: Partial<SimpleRoom>) => {
    try {
      const response = await roomsApi.updateRoom(roomId, updates)
      setRooms(prev => prev.map(r => r.id === roomId ? response.data : r))
      return { success: true }
    } catch (err) {
      console.error(err)
      return { success: false, error: '更新失敗' }
    }
  }
  
  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
    updateRoom
  }
}
```

## 遷移策略

### 階段1：基礎架構（第1天）
1. 創建新的組件結構
2. 實現基本的數據層
3. 創建簡單的UI組件

### 階段2：功能遷移（第2天）
1. 遷移房間列表功能
2. 實現過濾和搜索
3. 添加統計信息

### 階段3：操作功能（第3天）
1. 實現房間操作（入住、退房、編輯）
2. 添加狀態轉換邏輯
3. 實現數據同步

### 階段4：優化和測試（第4天）
1. 性能優化
2. 用戶體驗改進
3. 完整測試和驗證

## 預期成果

### 代碼量對比
- **當前**：995行單一文件
- **目標**：6個組件，總計約300-400行
- **減少**：約60-70%的代碼量

### 維護性提升
1. **單一職責**：每個組件只負責一個功能
2. **可重用性**：組件可以在其他地方重用
3. **可測試性**：每個組件都可以獨立測試
4. **可擴展性**：容易添加新功能

### 用戶體驗改善
1. **加載速度**：減少初始加載時間
2. **操作流暢**：減少不必要的重新渲染
3. **界面清晰**：簡化的狀態和操作
4. **錯誤處理**：更好的錯誤提示和恢復

## 風險和緩解

### 技術風險
1. **數據不一致**：新舊系統數據可能不同步
   - 緩解：使用數據遷移工具，確保一致性

2. **功能缺失**：可能遺漏某些功能
   - 緩解：詳細的功能對照表，逐步遷移

3. **性能問題**：新組件可能性能不佳
   - 緩解：性能測試和優化

### 專案風險
1. **時間超支**：可能超出預計時間
   - 緩解：靈活的時間管理，優先級調整

2. **團隊協作**：可能需要更多溝通
   - 緩解：清晰的文檔和接口定義

## 下一步行動

### 立即行動（今天）
1. 創建基礎組件結構
2. 實現基本的數據層
3. 創建簡單的演示頁面

### 短期目標（本週）
1. 完成房間管理重構
2. 通過測試和驗證
3. 準備部署到生產環境

### 長期目標（階段二完成）
1. 完全替換現有複雜組件
2. 實現顯著的性能提升
3. 獲得用戶正面反饋

---

**分析完成時間**：台灣時間 2026-03-06 01:00  
**分析者**：前端工程師 (OpenClaw Assistant)  
**狀態**：準備開始實施