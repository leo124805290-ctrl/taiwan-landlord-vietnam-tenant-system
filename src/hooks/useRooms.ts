'use client'

import { useState, useEffect, useCallback } from 'react'
import { SimpleRoom } from '@/src/types/simple'
import { roomsApi } from '@/src/lib/api/client'

interface UseRoomsResult {
  rooms: SimpleRoom[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateRoom: (roomId: string, updates: Partial<SimpleRoom>) => Promise<{
    success: boolean
    error?: string
    data?: SimpleRoom
  }>
}

export function useRooms(propertyId: string): UseRoomsResult {
  const [rooms, setRooms] = useState<SimpleRoom[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 暫時使用模擬數據，實際應該調用API
      const mockRooms: SimpleRoom[] = [
        {
          id: 'room_1',
          propertyId: 'property_1',
          number: '101',
          floor: 1,
          monthlyRent: 8000,
          deposit: 16000,
          status: 'occupied',
          tenant: {
            name: '張小明',
            phone: '0912-345-678'
          },
          lease: {
            checkInDate: '2026-01-15',
            checkOutDate: '2026-07-14'
          },
          electricity: {
            currentMeter: 1250,
            lastMeter: 1150,
            rate: 5,
            lastUpdated: '2026-03-01'
          },
          createdAt: '2026-01-15T10:00:00Z',
          updatedAt: '2026-03-01T15:30:00Z',
          notes: '按時繳租，愛乾淨'
        },
        {
          id: 'room_2',
          propertyId: 'property_1',
          number: '102',
          floor: 1,
          monthlyRent: 7500,
          deposit: 15000,
          status: 'available',
          createdAt: '2026-01-10T09:00:00Z',
          updatedAt: '2026-02-28T14:20:00Z',
          notes: '朝南，採光好'
        },
        {
          id: 'room_3',
          propertyId: 'property_1',
          number: '201',
          floor: 2,
          monthlyRent: 8500,
          deposit: 17000,
          status: 'occupied',
          tenant: {
            name: '李美麗',
            phone: '0933-987-654'
          },
          lease: {
            checkInDate: '2026-02-01',
            checkOutDate: '2026-08-01'
          },
          electricity: {
            currentMeter: 890,
            lastMeter: 780,
            rate: 5,
            lastUpdated: '2026-02-28'
          },
          createdAt: '2026-01-20T11:00:00Z',
          updatedAt: '2026-02-28T16:45:00Z'
        },
        {
          id: 'room_4',
          propertyId: 'property_1',
          number: '202',
          floor: 2,
          monthlyRent: 8200,
          deposit: 16400,
          status: 'maintenance',
          createdAt: '2026-01-25T10:30:00Z',
          updatedAt: '2026-03-01T13:10:00Z',
          notes: '水管維修中，預計3/10完成'
        },
        {
          id: 'room_5',
          propertyId: 'property_1',
          number: '301',
          floor: 3,
          monthlyRent: 9000,
          deposit: 18000,
          status: 'available',
          createdAt: '2026-02-01T09:15:00Z',
          updatedAt: '2026-02-20T10:25:00Z'
        },
        {
          id: 'room_6',
          propertyId: 'property_1',
          number: '302',
          floor: 3,
          monthlyRent: 8800,
          deposit: 17600,
          status: 'occupied',
          tenant: {
            name: '王大同',
            phone: '0921-555-888'
          },
          lease: {
            checkInDate: '2026-02-15',
            checkOutDate: '2026-08-15'
          },
          createdAt: '2026-02-10T14:00:00Z',
          updatedAt: '2026-02-28T09:20:00Z'
        }
      ]
      
      // 過濾屬於當前物業的房間
      const filteredRooms = mockRooms.filter(room => room.propertyId === propertyId)
      setRooms(filteredRooms)
      
      // 實際API調用（註解）
      // const response = await roomsApi.getRooms(propertyId)
      // setRooms(response.data)
      
    } catch (err) {
      console.error('載入房間資料失敗:', err)
      setError('載入房間資料失敗，請稍後再試')
      setRooms([])
    } finally {
      setLoading(false)
    }
  }, [propertyId])
  
  const updateRoom = useCallback(async (
    roomId: string, 
    updates: Partial<SimpleRoom>
  ): Promise<{ success: boolean; error?: string; data?: SimpleRoom }> => {
    try {
      // 模擬API調用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 更新本地狀態
      setRooms(prev => {
        if (!prev) return prev
        return prev.map(room => {
          if (room.id === roomId) {
            const updatedRoom = { ...room, ...updates, updatedAt: new Date().toISOString() }
            console.log('更新房間:', updatedRoom)
            return updatedRoom
          }
          return room
        })
      })
      
      // 實際API調用（註解）
      // const response = await roomsApi.updateRoom(roomId, updates)
      // return { success: true, data: response.data }
      
      return { success: true }
      
    } catch (err) {
      console.error('更新房間失敗:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : '更新失敗' 
      }
    }
  }, [])
  
  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])
  
  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
    updateRoom
  }
}