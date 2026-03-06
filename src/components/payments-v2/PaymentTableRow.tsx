'use client'

import { SimplePayment } from '@/src/types/simple'
import { useState } from 'react'

interface PaymentTableRowProps {
  payment: SimplePayment
  selected: boolean
  onPaymentAction: (
    paymentId: string | string[],
    action: 'confirm' | 'edit' | 'delete',
    data?: any
  ) => void
  onSelectPayment: (paymentId: string, selected: boolean) => void
}

export default function PaymentTableRow({ 
  payment, 
  selected,
  onPaymentAction,
  onSelectPayment
}: PaymentTableRowProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const getStatusColor = (status: SimplePayment['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getStatusText = (status: SimplePayment['status']) => {
    switch (status) {
      case 'pending': return '待付款'
      case 'paid': return '已付款'
      default: return '未知狀態'
    }
  }
  
  const getTypeColor = (type: SimplePayment['type']) => {
    switch (type) {
      case 'rent': return 'text-blue-600 bg-blue-50'
      case 'deposit': return 'text-purple-600 bg-purple-50'
      case 'electricity': return 'text-green-600 bg-green-50'
      case 'other': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
  
  const getTypeText = (type: SimplePayment['type']) => {
    switch (type) {
      case 'rent': return '租金'
      case 'deposit': return '押金'
      case 'electricity': return '電費'
      case 'other': return '其他'
      default: return '未知類型'
    }
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('zh-TW')
  }
  
  return (
    <tr 
      className={`hover:bg-gray-50 transition-colors ${isHovered ? 'bg-gray-50' : ''} ${payment.isBackfill ? 'bg-amber-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 選擇框 */}
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelectPayment(payment.id, e.target.checked)}
          className="h-4 w-4 text-blue-600 rounded"
        />
      </td>
      
      {/* 房間 / 類型 */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(payment.type)}`}>
            {getTypeText(payment.type)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{payment.roomId}</div>
            <div className="text-xs text-gray-500">ID: {payment.id.substring(0, 8)}</div>
          </div>
        </div>
        {payment.isBackfill && (
          <div className="mt-1 text-xs text-amber-600 font-medium">
            📅 補登記錄
          </div>
        )}
      </td>
      
      {/* 金額 / 狀態 */}
      <td className="px-4 py-3">
        <div className="font-bold text-lg text-gray-900">
          ${payment.amount.toLocaleString()}
        </div>
        <div className="mt-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
            {getStatusText(payment.status)}
          </span>
        </div>
        {payment.tenantId && (
          <div className="text-xs text-gray-500 mt-1">
            租客: {payment.tenantId.substring(0, 8)}
          </div>
        )}
      </td>
      
      {/* 到期日 / 付款日 */}
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div>
            <div className="text-xs text-gray-500">到期日</div>
            <div className={`font-medium ${payment.status === 'pending' && new Date(payment.dueDate) < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(payment.dueDate)}
              {payment.status === 'pending' && new Date(payment.dueDate) < new Date() && (
                <span className="ml-1 text-xs text-red-500">(逾期)</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">付款日</div>
            <div className="font-medium text-gray-900">
              {payment.paidDate ? formatDate(payment.paidDate) : '-'}
            </div>
          </div>
        </div>
      </td>
      
      {/* 備註 */}
      <td className="px-4 py-3">
        {payment.notes ? (
          <div className="max-w-[200px]">
            <div className="text-sm text-gray-700 line-clamp-2" title={payment.notes}>
              {payment.notes}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              創建: {formatDate(payment.createdAt)}
            </div>
          </div>
        ) : (
          <div className="text-gray-400">無備註</div>
        )}
      </td>
      
      {/* 操作 */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-2">
          {payment.status === 'pending' && (
            <button
              onClick={() => onPaymentAction(payment.id, 'confirm')}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors font-medium"
            >
              確認付款
            </button>
          )}
          
          <button
            onClick={() => onPaymentAction(payment.id, 'edit')}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors font-medium"
          >
            編輯
          </button>
          
          <button
            onClick={() => onPaymentAction(payment.id, 'delete')}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors font-medium"
          >
            刪除
          </button>
          
          {/* 快速操作 */}
          <div className="flex gap-1 mt-2">
            <button
              onClick={() => onPaymentAction(payment.id, 'confirm', { paidDate: new Date().toISOString().split('T')[0] })}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
              title="今日付款"
            >
              今日付
            </button>
            <button
              onClick={() => console.log('複製資訊')}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
              title="複製資訊"
            >
              複製
            </button>
          </div>
        </div>
      </td>
    </tr>
  )
}