'use client'

import { SimplePayment } from '@/src/types/simple'
import PaymentCard from './PaymentCard'

interface PaymentCardsProps {
  payments: SimplePayment[]
  selectedPayments: string[]
  onPaymentAction: (
    paymentId: string | string[],
    action: 'confirm' | 'edit' | 'delete',
    data?: any
  ) => void
  onSelectPayment: (paymentId: string, selected: boolean) => void
}

export default function PaymentCards({ 
  payments, 
  selectedPayments,
  onPaymentAction,
  onSelectPayment
}: PaymentCardsProps) {
  return (
    <div className="payment-cards grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {payments.map((payment) => (
        <PaymentCard
          key={payment.id}
          payment={payment}
          selected={selectedPayments.includes(payment.id)}
          onPaymentAction={onPaymentAction}
          onSelectPayment={onSelectPayment}
        />
      ))}
    </div>
  )
}