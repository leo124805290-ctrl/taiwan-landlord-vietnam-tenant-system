'use client'

import { SimplePayment } from '@/src/types/simple'
import { useState } from 'react'

interface PaymentCardProps {
  payment: SimplePayment
  selected: boolean
  onPaymentAction: (
    paymentId: string | string[],
    action: 'confirm' | 'edit' | 'delete',
    data?: any
  ) => void
  onSelectPayment: (paymentId: string, selected: boolean) => void
}

export default function PaymentCard({ 
  payment, 
  selected,
  onPaymentAction,
  onSelectPayment
}: PaymentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getStatusColor = (status: SimplePayment['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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
      case 'rent': return 'bg-blue-100 text-blue-800'
      case 'deposit': return 'bg-purple-100 text-purple-800'
      case 'electricity': return 'bg-green-100 text-green-800'
      case 'other': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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
  
  const isOverdue = payment.status === 'pending' && new Date(payment.dueDate) < new Date()
  
  return (
    <div className={`payment-card bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${getStatusColor(payment.status)} ${payment.isBackfill ? 'border-amber-300' : ''}`}>
      {/* 卡片頭部 */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelectPayment(payment.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(payment.type)}`}>
                  {getTypeText(payment.type)}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {getStatusText(payment.status)}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">ID: {payment.id.substring(0, 8)}</div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${payment.amount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">金額</div>
          </div>
        </div>
        
        {/* 房間和租客資訊 */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-900">{payment.roomId}</div>
          {payment.tenantId && (
            <div className="text-sm text-gray-600 mt-1">
              租客: {payment.tenantId.substring(0, 8)}
            </div>
          )}
        </div>
        
        {/* 日期資訊 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-2 bg-white border rounded">
            <div className="text-xs text-gray-500">到期日</div>
            <div className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(payment.dueDate)}
              {isOverdue && (
                <span className="ml-1 text-xs text-red-500">逾期</span>
              )}
            </div>
          </div>
          <div className="p-2 bg-white border rounded">
            <div className="text-xs text-gray-500">付款日</div>
            <div className="font-medium text-gray-900">
              {payment.paidDate ? formatDate(payment.paidDate) : '-'}
            </div>
          </div>
        </div>
        
        {/* 補登標記 */}
        {payment.isBackfill && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
            <div className="font-medium">📅 補登記錄</div>
            <div className="text-xs mt-1">歷史日期補登的付款記錄</div>
          </div>
        )}
        
        {/* 備註 */}
        {payment.notes && (
          <div className="mb-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-800"
            >
              <span>📝 備註 {isExpanded ? '▲' : '▼'}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {isExpanded ? '收起' : '展開'}
              </span>
            </button>
            
            {isExpanded && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-100 rounded text-sm text-gray-700">
                {payment.notes}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 操作按鈕 */}
      <div className="border-t border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-2">
          {payment.status === 'pending' && (
            <button
              onClick={() => onPaymentAction(payment.id, 'confirm')}
              className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              確認付款
            </button>
          )}
          
          <button
            onClick={() => onPaymentAction(payment.id, 'edit')}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            編輯
          </button>
          
          <button
            onClick={() => onPaymentAction(payment.id, 'delete')}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            刪除
          </button>
          
          <button
            onClick={() => console.log('更多操作')}
            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            更多
          </button>
        </div>
        
        {/* 額外資訊 */}
        <div className="mt-3 text-xs text-gray-500 flex justify-between">
          <div>
            創建: {formatDate(payment.createdAt)}
          </div>
          <div>
            更新: {formatDate(payment.updatedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}