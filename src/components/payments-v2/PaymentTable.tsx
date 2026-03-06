'use client'

import { SimplePayment } from '@/src/types/simple'
import PaymentTableRow from './PaymentTableRow'

interface PaymentTableProps {
  payments: SimplePayment[]
  selectedPayments: string[]
  onPaymentAction: (
    paymentId: string | string[],
    action: 'confirm' | 'edit' | 'delete',
    data?: any
  ) => void
  onSelectPayment: (paymentId: string, selected: boolean) => void
}

export default function PaymentTable({ 
  payments, 
  selectedPayments,
  onPaymentAction,
  onSelectPayment
}: PaymentTableProps) {
  return (
    <div className="payment-table-container bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-12">
                <input
                  type="checkbox"
                  checked={selectedPayments.length === payments.length && payments.length > 0}
                  onChange={(e) => {
                    const allIds = payments.map(p => p.id)
                    onSelectPayment('all', e.target.checked)
                  }}
                  className="h-4 w-4 text-blue-600 rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                房間 / 類型
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                金額 / 狀態
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                到期日 / 付款日
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                備註
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <PaymentTableRow
                key={payment.id}
                payment={payment}
                selected={selectedPayments.includes(payment.id)}
                onPaymentAction={onPaymentAction}
                onSelectPayment={onSelectPayment}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}