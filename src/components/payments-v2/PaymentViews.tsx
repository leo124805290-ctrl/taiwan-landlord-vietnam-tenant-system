'use client'

import { SimplePayment } from '@/src/types/simple'
import PaymentTable from './PaymentTable'
import PaymentCards from './PaymentCards'

interface PaymentViewsProps {
  payments: SimplePayment[]
  viewMode: 'table' | 'card'
  selectedPayments: string[]
  onPaymentAction: (
    paymentId: string | string[],
    action: 'confirm' | 'edit' | 'delete',
    data?: any
  ) => void
  onSelectPayment: (paymentId: string, selected: boolean) => void
}

export default function PaymentViews({ 
  payments, 
  viewMode, 
  selectedPayments,
  onPaymentAction,
  onSelectPayment
}: PaymentViewsProps) {
  if (payments.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-gray-600 font-medium mb-1">沒有找到付款記錄</div>
        <div className="text-gray-500 text-sm">
          嘗試調整搜尋條件或狀態篩選器
        </div>
      </div>
    )
  }
  
  return (
    <div className="payment-views">
      {/* 視圖切換提示 */}
      <div className="mb-4 text-sm text-gray-500">
        目前顯示 {payments.length} 筆付款記錄 ({viewMode === 'table' ? '表格視圖' : '卡片視圖'})
      </div>
      
      {/* 視圖內容 */}
      {viewMode === 'table' ? (
        <PaymentTable 
          payments={payments}
          selectedPayments={selectedPayments}
          onPaymentAction={onPaymentAction}
          onSelectPayment={onSelectPayment}
        />
      ) : (
        <PaymentCards 
          payments={payments}
          selectedPayments={selectedPayments}
          onPaymentAction={onPaymentAction}
          onSelectPayment={onSelectPayment}
        />
      )}
      
      {/* 分頁提示（未來擴展） */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <div>
          顯示第 1 - {payments.length} 筆，共 {payments.length} 筆
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