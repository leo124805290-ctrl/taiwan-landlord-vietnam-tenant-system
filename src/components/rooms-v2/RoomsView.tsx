'use client'

import { SimpleRoom } from '@/src/types/simple'
import RoomTable from './RoomTable'
import RoomCards from './RoomCards'

interface RoomsViewProps {
  rooms: SimpleRoom[]
  viewMode: 'table' | 'card'
  onRoomAction: (
    roomId: string, 
    action: 'checkin' | 'checkout' | 'edit' | 'maintenance',
    data?: any
  ) => void
}

export default function RoomsView({ rooms, viewMode, onRoomAction }: RoomsViewProps) {
  if (rooms.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="text-gray-600 font-medium mb-1">沒有找到房間</div>
        <div className="text-gray-500 text-sm">
          嘗試調整搜尋條件或狀態篩選器
        </div>
      </div>
    )
  }
  
  return (
    <div className="rooms-view">
      {/* 視圖切換提示 */}
      <div className="mb-4 text-sm text-gray-500">
        目前顯示 {rooms.length} 間房間 ({viewMode === 'table' ? '表格視圖' : '卡片視圖'})
      </div>
      
      {/* 視圖內容 */}
      {viewMode === 'table' ? (
        <RoomTable rooms={rooms} onRoomAction={onRoomAction} />
      ) : (
        <RoomCards rooms={rooms} onRoomAction={onRoomAction} />
      )}
      
      {/* 分頁提示（未來擴展） */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <div>
          顯示第 1 - {rooms.length} 筆，共 {rooms.length} 筆
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            上一頁
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
            下一頁
          </button>
        </div>
      </div>
    </div>
  )
}