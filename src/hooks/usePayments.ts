'use client'

import { useState, useEffect, useCallback } from 'react'
import { SimplePayment } from '@/src/types/simple'
// import { paymentsApi } from '@/src/lib/api/client' // 暫時註解，使用模擬數據

interface UsePaymentsResult {
  payments: SimplePayment[] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updatePayment: (paymentId: string, updates: Partial<SimplePayment>) => Promise<{
    success: boolean
    error?: string
    data?: SimplePayment
  }>
  confirmPayment: (paymentId: string, paidDate: string) => Promise<{
    success: boolean
    error?: string
    data?: SimplePayment
  }>
}

export function usePayments(propertyId: string): UsePaymentsResult {
  const [payments, setPayments] = useState<SimplePayment[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 模擬付款數據
      const mockPayments: SimplePayment[] = [
        {
          id: 'payment_1',
          roomId: 'room_1',
          tenantId: 'tenant_1',
          type: 'rent',
          amount: 8000,
          dueDate: '2026-03-05',
          status: 'paid',
          paidDate: '2026-03-01',
          notes: '3月份租金',
          createdAt: '2026-03-01T10:00:00Z',
          updatedAt: '2026-03-01T10:30:00Z'
        },
        {
          id: 'payment_2',
          roomId: 'room_1',
          tenantId: 'tenant_1',
          type: 'electricity',
          amount: 500,
          dueDate: '2026-03-10',
          status: 'pending',
          notes: '2月份電費',
          createdAt: '2026-03-01T11:00:00Z',
          updatedAt: '2026-03-01T11:00:00Z'
        },
        {
          id: 'payment_3',
          roomId: 'room_3',
          tenantId: 'tenant_2',
          type: 'rent',
          amount: 8500,
          dueDate: '2026-03-05',
          status: 'pending',
          notes: '3月份租金',
          createdAt: '2026-03-01T12:00:00Z',
          updatedAt: '2026-03-01T12:00:00Z'
        },
        {
          id: 'payment_4',
          roomId: 'room_6',
          tenantId: 'tenant_3',
          type: 'deposit',
          amount: 17000,
          dueDate: '2026-02-15',
          status: 'paid',
          paidDate: '2026-02-10',
          notes: '入住押金',
          createdAt: '2026-02-10T09:00:00Z',
          updatedAt: '2026-02-10T09:30:00Z'
        },
        {
          id: 'payment_5',
          roomId: 'room_2',
          type: 'rent',
          amount: 7500,
          dueDate: '2026-01-05',
          status: 'paid',
          paidDate: '2026-01-01',
          isBackfill: true,
          notes: '歷史補登 - 1月份租金',
          createdAt: '2026-03-01T14:00:00Z',
          updatedAt: '2026-03-01T14:00:00Z'
        },
        {
          id: 'payment_6',
          roomId: 'room_4',
          type: 'other',
          amount: 2000,
          dueDate: '2026-03-15',
          status: 'pending',
          notes: '維修材料費',
          createdAt: '2026-03-01T15:00:00Z',
          updatedAt: '2026-03-01T15:00:00Z'
        },
        {
          id: 'payment_7',
          roomId: 'room_3',
          tenantId: 'tenant_2',
          type: 'electricity',
          amount: 550,
          dueDate: '2026-03-10',
          status: 'pending',
          notes: '2月份電費',
          createdAt: '2026-03-02T10:00:00Z',
          updatedAt: '2026-03-02T10:00:00Z'
        },
        {
          id: 'payment_8',
          roomId: 'room_6',
          tenantId: 'tenant_3',
          type: 'rent',
          amount: 8800,
          dueDate: '2026-03-05',
          status: 'paid',
          paidDate: '2026-03-03',
          notes: '3月份租金',
          createdAt: '2026-03-03T09:00:00Z',
          updatedAt: '2026-03-03T09:15:00Z'
        }
      ]
      
      // 過濾屬於當前物業相關房間的付款
      // 注意：這裡需要根據房間的propertyId來過濾
      // 暫時返回所有模擬數據
      setPayments(mockPayments)
      
      // 實際API調用（註解）
      // const response = await paymentsApi.getPayments(propertyId)
      // setPayments(response.data)
      
    } catch (err) {
      console.error('載入付款資料失敗:', err)
      setError('載入付款資料失敗，請稍後再試')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }, [propertyId])
  
  const updatePayment = useCallback(async (
    paymentId: string, 
    updates: Partial<SimplePayment>
  ): Promise<{ success: boolean; error?: string; data?: SimplePayment }> => {
    try {
      // 模擬API調用
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // 更新本地狀態
      setPayments(prev => {
        if (!prev) return prev
        return prev.map(payment => {
          if (payment.id === paymentId) {
            const updatedPayment = { 
              ...payment, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            }
            console.log('更新付款:', updatedPayment)
            return updatedPayment
          }
          return payment
        })
      })
      
      return { success: true }
      
    } catch (err) {
      console.error('更新付款失敗:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : '更新失敗' 
      }
    }
  }, [])
  
  const confirmPayment = useCallback(async (
    paymentId: string,
    paidDate: string
  ): Promise<{ success: boolean; error?: string; data?: SimplePayment }> => {
    try {
      // 模擬API調用
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 更新本地狀態
      setPayments(prev => {
        if (!prev) return prev
        return prev.map(payment => {
          if (payment.id === paymentId) {
            const updatedPayment = { 
              ...payment, 
              status: 'paid' as const,
              paidDate,
              updatedAt: new Date().toISOString() 
            }
            console.log('確認付款:', updatedPayment)
            return updatedPayment
          }
          return payment
        })
      })
      
      return { success: true }
      
    } catch (err) {
      console.error('確認付款失敗:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : '確認失敗' 
      }
    }
  }, [])
  
  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])
  
  return {
    payments,
    loading,
    error,
    refetch: fetchPayments,
    updatePayment,
    confirmPayment
  }
}