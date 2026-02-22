import { Property, Payment, TimeScope } from './types'

// 計算時間篩選後的營收分析
export function calculateRevenueAnalysis(
  property: Property,
  timeScope: TimeScope,
  year?: number,
  month?: string
) {
  if (!property) {
    return {
      totalRent: 0,
      totalDeposit: 0,
      totalElectricity: 0,
      totalIncome: 0,
      paymentCount: 0,
      roomCount: 0,
      details: []
    }
  }

  // 獲取所有歷史記錄
  const allHistory = property.history || []
  
  // 根據時間篩選歷史記錄
  const filteredHistory = filterPaymentsByTime(allHistory, timeScope, year, month)
  
  // 計算各項收入
  let totalRent = 0
  let totalDeposit = 0
  let totalElectricity = 0
  let totalIncome = 0
  
  // 分析每筆付款記錄
  filteredHistory.forEach((payment: Payment) => {
    totalRent += payment.r || 0
    totalElectricity += payment.e || 0
    totalIncome += payment.total || 0
  })
  
  // 押金是從房間資料中計算的，不是從付款記錄
  // 我們需要計算在選定時間範圍內出租的房間的押金
  totalDeposit = calculateDepositsInTimeRange(property, timeScope, year, month)
  
  // 計算房間相關數據（根據時間篩選）
  const roomDetails = calculateRoomDetails(property, timeScope, year, month)
  
  return {
    totalRent,
    totalDeposit,
    totalElectricity,
    totalIncome,
    paymentCount: filteredHistory.length,
    roomCount: roomDetails.length,
    details: roomDetails,
    timeScope,
    year,
    month
  }
}

// 根據時間篩選付款記錄
function filterPaymentsByTime(
  payments: Payment[],
  timeScope: TimeScope,
  year?: number,
  month?: string
): Payment[] {
  if (!payments) return []
  
  if (timeScope === 'all') {
    return payments
  }
  
  if (timeScope === 'year' && year) {
    const yearStr = String(year)
    return payments.filter(p => p.m && p.m.startsWith(yearStr))
  }
  
  if (timeScope === 'month' && month) {
    // 將 YYYY-MM 轉換為 YYYY/MM
    const targetMonth = month.replace('-', '/')
    return payments.filter(p => p.m && p.m.startsWith(targetMonth))
  }
  
  return payments
}

// 計算在時間範圍內的押金
function calculateDepositsInTimeRange(
  property: Property,
  timeScope: TimeScope,
  year?: number,
  month?: string
): number {
  const rooms = property.rooms || []
  const allHistory = property.history || []
  
  let totalDeposit = 0
  
  rooms.forEach(room => {
    if (room.s === 'occupied' && room.d) {
      // 檢查該房間在選定時間範圍內是否有付款記錄
      const roomPayments = allHistory.filter(p => p.n === room.n)
      const filteredPayments = filterPaymentsByTime(roomPayments, timeScope, year, month)
      
      // 如果在選定時間範圍內有付款記錄，則計入押金
      if (filteredPayments.length > 0) {
        totalDeposit += room.d
      }
    }
  })
  
  return totalDeposit
}

// 計算房間詳細信息
function calculateRoomDetails(
  property: Property,
  timeScope: TimeScope,
  year?: number,
  month?: string
) {
  const rooms = property.rooms || []
  const allHistory = property.history || []
  
  return rooms
    .filter(room => room.s === 'occupied')
    .map(room => {
      // 篩選該房間的付款記錄
      const roomPayments = allHistory.filter(p => p.n === room.n)
      const filteredPayments = filterPaymentsByTime(roomPayments, timeScope, year, month)
      
      // 計算該房間的收入
      const roomRent = filteredPayments.reduce((sum, p) => sum + (p.r || 0), 0)
      const roomDeposit = room.d || 0 // 房間的押金
      const roomElectricity = filteredPayments.reduce((sum, p) => sum + (p.e || 0), 0)
      const roomTotal = filteredPayments.reduce((sum, p) => sum + (p.total || 0), 0)
      
      return {
        roomNumber: room.n,
        floor: room.f,
        tenantName: room.t || '未設定',
        rent: room.r,
        deposit: room.d || 0,
        paymentCount: filteredPayments.length,
        totalRentReceived: roomRent,
        totalDepositReceived: roomDeposit,
        totalElectricityReceived: roomElectricity,
        totalIncomeReceived: roomTotal,
        moveInDate: room.in,
        moveOutDate: room.out
      }
    })
}

// 生成營收分析卡片數據
export function generateRevenueCards(analysis: any, lang: 'zh' | 'vi') {
  const t = (key: string) => {
    // 簡單的翻譯函數，實際應該使用完整的翻譯系統
    const translations: Record<string, Record<string, string>> = {
      totalRent: { zh: '租金收入', vi: 'Thu nhập tiền thuê' },
      totalDeposit: { zh: '押金收入', vi: 'Thu nhập tiền cọc' },
      totalElectricity: { zh: '電費收入', vi: 'Thu nhập tiền điện' },
      totalIncome: { zh: '總收入', vi: 'Tổng thu nhập' },
      paymentCount: { zh: '付款筆數', vi: 'Số lần thanh toán' },
      roomCount: { zh: '出租房間數', vi: 'Số phòng cho thuê' }
    }
    return translations[key]?.[lang] || key
  }
  
  return [
    {
      title: t('totalRent'),
      value: formatCurrency(analysis.totalRent),
      subText: `${analysis.roomCount} 間房間`,
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      icon: '💰'
    },
    {
      title: t('totalDeposit'),
      value: formatCurrency(analysis.totalDeposit),
      subText: `${analysis.paymentCount} 筆付款`,
      bg: 'bg-green-50',
      text: 'text-green-600',
      icon: '🏦'
    },
    {
      title: t('totalElectricity'),
      value: formatCurrency(analysis.totalElectricity),
      subText: '電費收入',
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      icon: '⚡'
    },
    {
      title: t('totalIncome'),
      value: formatCurrency(analysis.totalIncome),
      subText: '總收入',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      icon: '📈'
    },
    {
      title: t('paymentCount'),
      value: analysis.paymentCount.toString(),
      subText: '付款記錄',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      icon: '📋'
    }
  ]
}

// 格式化貨幣
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`
  }
  return `$${Math.round(amount)}`
}

// 獲取時間範圍顯示文字
export function getTimeRangeText(timeScope: TimeScope, year?: number, month?: string): string {
  if (timeScope === 'all') {
    return '全部時間'
  } else if (timeScope === 'year' && year) {
    return `${year}年`
  } else if (timeScope === 'month' && month) {
    const [y, m] = month.split('-')
    return `${y}年${m}月`
  }
  return '未知時間範圍'
}