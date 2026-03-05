'use client'

import { SimpleRoom } from '@/src/types/simple'
import RoomTableRow from './RoomTableRow'

interface RoomTableProps {
  rooms: SimpleRoom[]
  onRoomAction: (
    roomId: string, 
    action: 'checkin' | 'checkout' | 'edit' | 'maintenance',
    data?: any
  ) => void
}

export default function RoomTable({ rooms, onRoomAction }: RoomTableProps) {
  return (
    <div className="room-table-container bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                房號 / 樓層
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                狀態
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                租金 / 押金
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                租客資訊
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                入住期間
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                電費資訊
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rooms.map((room) => (
              <RoomTableRow
                key={room.id}
                room={room}
                onRoomAction={onRoomAction}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}