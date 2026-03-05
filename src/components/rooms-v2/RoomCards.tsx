'use client'

import { SimpleRoom } from '@/src/types/simple'
import RoomCard from './RoomCard'

interface RoomCardsProps {
  rooms: SimpleRoom[]
  onRoomAction: (
    roomId: string, 
    action: 'checkin' | 'checkout' | 'edit' | 'maintenance',
    data?: any
  ) => void
}

export default function RoomCards({ rooms, onRoomAction }: RoomCardsProps) {
  return (
    <div className="room-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {rooms.map((room) => (
        <RoomCard
          key={room.id}
          room={room}
          onRoomAction={onRoomAction}
        />
      ))}
    </div>
  )
}