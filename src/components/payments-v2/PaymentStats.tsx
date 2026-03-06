'use client'

import { useMemo } from 'react'
import { SimplePayment } from '@/src/types/simple'

interface PaymentStatsProps {
  payments: SimplePayment[]
}

export default function PaymentStats({ payments }: PaymentStatsProps) {
  const stats = useMemo(() => {
    const total = payments.length
    const pending = payments.filter(p => p.status === 'pending').length
    const paid = payments.filter(p => p.status === 'paid').length
    const backfill = payments.filter(p => p.isBackfill).length
    
    // 金額統計
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
    const pendingAmount = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0)
    const paidAmount = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0)
    
    // 類型統計
    const rentCount = payments.filter(p => p.type === 'rent').length
    const depositCount = payments.filter(p => p.type === 'deposit').length
    const electricityCount = payments.filter(p => p.type === 'electricity').length
    const otherCount = payments.filter(p => p.type === 'other').length
    
    // 付款率
    const paymentRate = total > 0 ? Math.round((paid / total) * 100) : 0
    
    return {
      total,
      pending,
      paid,
      backfill,
      totalAmount,
      pendingAmount,
      paidAmount,
      rentCount,
      depositCount,
      electricityCount,
      otherCount,
      paymentRate
    }
  }, [payments])
  
  return (
    <div className="payment-stats grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {/* 總付款數 */}
      <div className="stat-card bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-indigo-600">💰</div>
          <div className="text-sm font-medium text-gray-700">總付款數</div>
        </div>
        <div className="text-2xl font-bold text-indigo-700">{stats.total}</div>
        <div className="text-xs text-gray-500 mt-1">筆</div>
      </div>
      
      {/* 待付款 */}
      <div className="stat-card bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-yellow-600">⏰</div>
          <div className="text-sm font-medium text-gray-700">待付款</div>
        </div>
        <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
        <div className="text-xs text-gray-500 mt-1">
          ${stats.pendingAmount.toLocaleString()}
        </div>
      </div>
      
      {/* 已付款 */}
      <div className="stat-card bg-green-50 border border-green-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-green-600">✅</div>
          <div className="text-sm font-medium text-gray-700">已付款</div>
        </div>
        <div className="text-2xl font-bold text-green-700">{stats.paid}</div>
        <div className="text-xs text-gray-500 mt-1">
          ${stats.paidAmount.toLocaleString()}
        </div>
      </div>
      
      {/* 補登記錄 */}
      <div className="stat-card bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-blue-600">📅</div>
          <div className="text-sm font-medium text-gray-700">補登記錄</div>
        </div>
        <div className="text-2xl font-bold text-blue-700">{stats.backfill}</div>
        <div className="text-xs text-gray-500 mt-1">筆</div>
      </div>
      
      {/* 付款率 */}
      <div className="stat-card bg-purple-50 border border-purple-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-purple-600">📊</div>
          <div className="text-sm font-medium text-gray-700">付款率</div>
        </div>
        <div className="text-2xl font-bold text-purple-700">{stats.paymentRate}%</div>
        <div className="text-xs text-gray-500 mt-1">
          {stats.paid}/{stats.total}
        </div>
      </div>
      
      {/* 總金額 */}
      <div className="stat-card bg-teal-50 border border-teal-200 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-teal-600">💵</div>
          <div className="text-sm font-medium text-gray-700">總金額</div>
        </div>
        <div className="text-2xl font-bold text-teal-700">
          ${stats.totalAmount.toLocaleString()}
        </div>
        <div className="text-xs text-gray-500 mt-1">元</div>
      </div>
      
      {/* 類型統計（第二行） */}
      <div className="col-span-2 md:col-span-3 lg:col-span-6 mt-2">
        <div className="text-sm font-medium text-gray-700 mb-2">付款類型分布</div>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium text-gray-900">{stats.rentCount}</div>
            <div className="text-xs text-gray-500">租金</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium text-gray-900">{stats.depositCount}</div>
            <div className="text-xs text-gray-500">押金</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium text-gray-900">{stats.electricityCount}</div>
            <div className="text-xs text-gray-500">電費</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium text-gray-900">{stats.otherCount}</div>
            <div className="text-xs text-gray-500">其他</div>
          </div>
        </div>
      </div>
    </div>
  )
}