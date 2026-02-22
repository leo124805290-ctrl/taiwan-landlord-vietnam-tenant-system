'use client'

import { t } from '@/lib/translations'
import { formatCurrency } from '@/lib/utils'

interface ChartData {
  labels: string[]
  values: number[]
  colors?: string[]
  type?: 'bar' | 'line' | 'pie'
  title?: string
  showValues?: boolean
  maxHeight?: number
}

interface SimpleChartProps {
  data: ChartData
  lang: 'zh-TW' | 'vi-VN'
  className?: string
}

export default function SimpleChart({ data, lang, className = '' }: SimpleChartProps) {
  const {
    labels,
    values,
    colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
    type = 'bar',
    title,
    showValues = true,
    maxHeight = 200
  } = data
  
  // 計算最大值用於比例
  const maxValue = Math.max(...values, 1)
  
  // 計算百分比
  const percentages = values.map(value => (value / maxValue) * 100)
  
  // 計算總和（用於餅圖）
  const total = values.reduce((sum, val) => sum + val, 0)
  
  if (type === 'bar') {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
        
        <div className="space-y-3">
          {labels.map((label, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{label}</span>
                {showValues && (
                  <span className="font-bold" style={{ color: colors[index % colors.length] }}>
                    {formatCurrency(values[index])}
                  </span>
                )}
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentages[index]}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                ></div>
              </div>
              
              {showValues && values.length <= 6 && (
                <div className="text-xs text-gray-500 text-right">
                  {percentages[index].toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (type === 'line') {
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
        
        <div className="relative" style={{ height: `${maxHeight}px` }}>
          {/* 網格線 */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 25, 50, 75, 100].map(percent => (
              <div key={percent} className="border-t border-gray-100"></div>
            ))}
          </div>
          
          {/* 數據點和線條 */}
          <div className="absolute inset-0 flex items-end">
            {values.map((value, index) => {
              const height = (value / maxValue) * 100
              const left = (index / (values.length - 1 || 1)) * 100
              
              return (
                <div key={index} className="absolute bottom-0" style={{ left: `${left}%` }}>
                  {/* 數據點 */}
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-md transform -translate-x-1/2"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  ></div>
                  
                  {/* 連接線（除了最後一個點） */}
                  {index < values.length - 1 && (
                    <div 
                      className="absolute top-1/2 h-0.5 transform -translate-y-1/2"
                      style={{ 
                        width: `${100 / (values.length - 1)}%`,
                        backgroundColor: colors[index % colors.length],
                        opacity: 0.5
                      }}
                    ></div>
                  )}
                  
                  {/* 標籤 */}
                  <div className="absolute top-full mt-2 transform -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
                    {labels[index]}
                  </div>
                  
                  {/* 數值 */}
                  {showValues && (
                    <div 
                      className="absolute bottom-full mb-2 transform -translate-x-1/2 text-xs font-bold whitespace-nowrap"
                      style={{ color: colors[index % colors.length] }}
                    >
                      {formatCurrency(value)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
  
  if (type === 'pie') {
    // 簡單的餅圖實現
    const radius = 80
    const circumference = 2 * Math.PI * radius
    
    let currentAngle = 0
    const segments = values.map((value, index) => {
      const percentage = total > 0 ? (value / total) * 100 : 0
      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
      const strokeDashoffset = -currentAngle * circumference / 100
      currentAngle += percentage
      
      return {
        percentage,
        strokeDasharray,
        strokeDashoffset,
        color: colors[index % colors.length],
        label: labels[index],
        value
      }
    })
    
    return (
      <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
        {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* 餅圖 */}
          <div className="relative">
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="30"
              />
              
              {segments.map((segment, index) => (
                <circle
                  key={index}
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="30"
                  strokeDasharray={segment.strokeDasharray}
                  strokeDashoffset={segment.strokeDashoffset}
                  transform="rotate(-90 90 90)"
                  className="transition-all duration-500"
                />
              ))}
              
              <text
                x="90"
                y="90"
                textAnchor="middle"
                dy="0.3em"
                className="text-2xl font-bold fill-gray-800"
              >
                {total > 0 ? `${((segments[0]?.percentage || 0)).toFixed(0)}%` : '0%'}
              </text>
            </svg>
          </div>
          
          {/* 圖例 */}
          <div className="flex-1">
            <div className="space-y-2">
              {segments.map((segment, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: segment.color }}
                    ></div>
                    <span className="text-sm">{segment.label}</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold" style={{ color: segment.color }}>
                      {formatCurrency(segment.value)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {segment.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
              
              {/* 總計 */}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>{t('total', lang)}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  return null
}