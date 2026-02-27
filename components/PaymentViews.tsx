'use client'

import { t } from '@/lib/translations'
import { formatCurrency } from '@/lib/utils'
import { Payment } from '@/lib/types'

interface PaymentViewsProps {
  payments: Payment[]
  viewMode: 'table' | 'card' | 'list'
  onCollectPayment: (payment: Payment) => void
  onUpdateElectricity: (paymentId: number) => void
  onRestorePayment: (paymentId: number) => void
  onToggleBackfillSelection?: (paymentId: number, checked: boolean) => void
  selectedBackfillIds?: number[]
  lang: string
}

export default function PaymentViews({ 
  payments, 
  viewMode, 
  onCollectPayment, 
  onUpdateElectricity,
  onRestorePayment,
  lang 
}: PaymentViewsProps) {
  
  // 表格視圖
  const renderTableView = () => {
    return (
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {onToggleBackfillSelection && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b w-12">
                  選擇
                </th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">房間</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">租客</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">月份</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">款項明細</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">金額</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">狀態</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => {
              const isOverdue = payment.s === 'pending' && 
                               payment.due && 
                               new Date(payment.due) < new Date()
              
              return (
                <tr key={payment.id} className={`hover:bg-gray-50 border-b ${payment.isBackfill ? 'bg-amber-50/30' : ''}`}>
                  {onToggleBackfillSelection && (
                    <td className="px-4 py-3">
                      {payment.isBackfill && payment.s === 'pending' ? (
                        <input
                          type="checkbox"
                          checked={selectedBackfillIds?.includes(payment.id) || false}
                          onChange={(e) => onToggleBackfillSelection(payment.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 rounded"
                        />
                      ) : (
                        <div className="w-4 h-4"></div>
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="font-medium">{payment.n}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{payment.t}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600">{payment.m}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-600">租金：</span>
                        <span className="font-medium">{formatCurrency(payment.r)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">電費：</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(payment.e || 0)}
                        </span>
                      </div>
                      {payment.paymentType === 'deposit' && (
                        <div className="text-xs text-purple-600">押金款項</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-green-600">
                      {formatCurrency(payment.total)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {payment.s === 'pending' ? (
                      <div>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          isOverdue 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        } ${payment.isBackfill ? 'border border-amber-500 bg-amber-50' : ''}`}>
                          {payment.isBackfill ? '📅 ' : ''}
                          {isOverdue ? '⚠️ 逾期' : '⏳ 待收'}
                          {payment.isBackfill ? ' (補登)' : ''}
                        </div>
                        {payment.due && (
                          <div className="text-xs text-gray-500 mt-1">
                            期限：{payment.due}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ${payment.isBackfill ? 'border border-amber-500 bg-amber-50' : ''}`}>
                        {payment.isBackfill ? '📅 ' : ''}
                        ✅ 已收
                        {payment.isBackfill ? ' (補登)' : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {payment.s === 'pending' ? (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => onCollectPayment(payment)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          💰 收款
                        </button>
                        {(payment.e === 0 || payment.e === undefined) && (
                          <button
                            onClick={() => onUpdateElectricity(payment.id)}
                            className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
                          >
                            ⚡ 更新電費
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="text-xs text-gray-500">
                          {payment.paid && `已收於 ${payment.paid}`}
                        </div>
                        {payment.archived && (
                          <button
                            onClick={() => onRestorePayment(payment.id)}
                            className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                            title="恢復為待收狀態"
                          >
                            🔄 恢復
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
  
  // 卡片視圖
  const renderCardView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payments.map(payment => {
          const isOverdue = payment.s === 'pending' && 
                           payment.due && 
                           new Date(payment.due) < new Date()
          const isNewTenant = payment.paymentType === 'deposit' || payment.tenantType === 'new'
          
          return (
            <div key={payment.id} className="card hover:shadow-md transition-shadow">
              {/* 卡片標頭 */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-lg">
                    {payment.n} - {payment.t}
                  </div>
                  <div className="text-sm text-gray-600">
                    {payment.m}
                    {isNewTenant && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        🆕 新租客
                      </span>
                    )}
                  </div>
                </div>
                <div className={`text-sm px-2 py-1 rounded ${
                  payment.s === 'pending' 
                    ? isOverdue 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {payment.s === 'pending' 
                    ? (isOverdue ? '⚠️ 逾期' : '⏳ 待收') 
                    : '✅ 已收'}
                </div>
              </div>
              
              {/* 金額明細 */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">租金：</span>
                  <span className="font-medium">{formatCurrency(payment.r)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">電費：</span>
                  <span className="font-medium text-blue-600">
                    {formatCurrency(payment.e || 0)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-bold">
                    <span>總計：</span>
                    <span className="text-green-600">{formatCurrency(payment.total)}</span>
                  </div>
                </div>
              </div>
              
              {/* 狀態信息 */}
              <div className="text-xs text-gray-500 mb-4">
                {payment.s === 'pending' ? (
                  <div>
                    <div>📅 繳費期限：{payment.due || '未設定'}</div>
                    {isOverdue && (
                      <div className="text-red-600 mt-1">
                        ⚠️ 已逾期
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div>✅ 已收款於 {payment.paid}</div>
                    {payment.paymentMethod && (
                      <div>💰 方式：{payment.paymentMethod}</div>
                    )}
                  </div>
                )}
              </div>
              
              {/* 操作按鈕 */}
              {payment.s === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => onCollectPayment(payment)}
                    className="flex-1 btn bg-green-600 text-white text-sm"
                  >
                    💰 標記已收
                  </button>
                  {(payment.e === 0 || payment.e === undefined) && (
                    <button
                      onClick={() => onUpdateElectricity(payment.id)}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                      title="更新電費"
                    >
                      ⚡
                    </button>
                  )}
                </div>
              ) : payment.archived && (
                <button
                  onClick={() => onRestorePayment(payment.id)}
                  className="w-full btn bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-sm"
                >
                  🔄 恢復為待收
                </button>
              )}
            </div>
          )
        })}
      </div>
    )
  }
  
  // 列表視圖
  const renderListView = () => {
    return (
      <div className="space-y-3">
        {payments.map(payment => {
          const isOverdue = payment.s === 'pending' && 
                           payment.due && 
                           new Date(payment.due) < new Date()
          const isNewTenant = payment.paymentType === 'deposit' || payment.tenantType === 'new'
          
          return (
            <div key={payment.id} className="border rounded-lg p-3 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {/* 主要信息 */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="font-bold">{payment.n}</div>
                    <div className="text-gray-600">-</div>
                    <div className="font-medium">{payment.t}</div>
                    {isNewTenant && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                        新租客
                      </span>
                    )}
                    <span className="text-sm text-gray-500 ml-auto">
                      {payment.m}
                    </span>
                  </div>
                  
                  {/* 金額信息 */}
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">租金：</span>
                      <span>{formatCurrency(payment.r)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">電費：</span>
                      <span className="text-blue-600">{formatCurrency(payment.e || 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t">
                      <span>總計：</span>
                      <span className="text-green-600">{formatCurrency(payment.total)}</span>
                    </div>
                  </div>
                  
                  {/* 狀態信息 */}
                  <div className="mt-2 text-xs">
                    {payment.s === 'pending' ? (
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded ${
                          isOverdue 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {isOverdue ? '⚠️ 逾期' : '⏳ 待收'}
                        </span>
                        {payment.due && (
                          <span className="text-gray-500">期限：{payment.due}</span>
                        )}
                      </div>
                    ) : (
                      <div className="text-green-600">
                        ✅ 已收款於 {payment.paid}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* 操作按鈕 */}
                <div className="ml-4">
                  {payment.s === 'pending' ? (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => onCollectPayment(payment)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        收款
                      </button>
                      {(payment.e === 0 || payment.e === undefined) && (
                        <button
                          onClick={() => onUpdateElectricity(payment.id)}
                          className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
                        >
                          電費
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-gray-500 text-right">
                        已收
                      </div>
                      {payment.archived && (
                        <button
                          onClick={() => onRestorePayment(payment.id)}
                          className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                        >
                          恢復
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
  
  // 根據視圖模式渲染
  switch (viewMode) {
    case 'table':
      return renderTableView()
    case 'card':
      return renderCardView()
    case 'list':
      return renderListView()
    default:
      return renderTableView()
  }
}