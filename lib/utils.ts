import { AppData, Property, Room, Payment, Tenant, Stats, TimeScope, ElectricityAnalysis } from './types';

// 初始化資料
export function initData(): AppData {
  return {
    properties: [],
    rooms: [],
    payments: [],
    tenants: [],
    history: [],
    maintenance: [],
    electricityRate: 6,
    actualElectricityRate: 4.5,
    utilityExpenses: [],
    additionalIncomes: [],
  };
}

// 格式化金額
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

// 格式化日期
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-TW');
}

// 計算月底日期
export function getMonthEndDate(startDate: string, monthsToAdd: number = 1): string {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + monthsToAdd);
  date.setDate(0);
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return date.toISOString().split('T')[0];
}

// 計算下個月底日期（從今天開始）
export function getNextMonthEndDate(months: number = 1): string {
  const today = new Date();
  return getMonthEndDate(today.toISOString().split('T')[0], months);
}

// 系統自檢函數（簡化版本）
export function systemSelfCheck(data: AppData): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!data.properties || data.properties.length === 0) {
    issues.push('⚠️ 沒有物業資料');
  }
  
  return {
    ok: issues.length === 0,
    issues: issues
  };
}

// 計算統計資料（簡化版本）
export function calculateStats(property: Property, data: AppData, revenueTimeScope: TimeScope, revenueYear: number, revenueMonth: string, elecTimeScope: TimeScope, elecYear: number, elecMonth: string): Stats {
  return {
    total: 0,
    occupied: 0,
    available: 0,
    rate: 0,
    totalRent: 0,
    avgRent: 0,
    totalElec: 0,
    received: 0,
    pending: 0,
    pendingCount: 0,
    expiring: 0,
    totalDeposit: 0,
    elecReceivable: 0,
    floors: [],
    rentByFloor: [],
    elec: {
      charged: 0,
      chargedRate: 0,
      usage: 0,
      actualCost: 0,
      actualRate: 0,
      profit: 0,
      profitRate: 0,
    }
  };
}

// 檢查合約是否即將到期
export function isContractExpiring(endDate: string, daysThreshold: number = 90): boolean {
  const end = new Date(endDate);
  const thresholdDate = new Date(Date.now() + daysThreshold * 86400000);
  return end < thresholdDate;
}

// 產生下一個ID
export function generateNextId(items: Array<{ id: number }>): number {
  return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
}

// 匯出資料
export function exportData(data: AppData): string {
  return JSON.stringify(data, null, 2);
}

// 匯入資料
export function importData(jsonString: string): AppData {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('匯入失敗：JSON 格式錯誤');
  }
}

// 計算所有付款
export function calcAllPayments(data: AppData): void {
  data.properties.forEach(prop => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentMonthStr = `${currentYear}/${currentMonth.toString().padStart(2, '0')}`;
    
    // 計算下個月的5號作為到期日
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const dueDate = `${nextMonth.getFullYear()}-${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}-05`;
    
    // 獲取現有的待付款記錄
    const existingPendingPayments = prop.payments.filter(p => p.s === 'pending');
    
    // 為每個已出租的房間生成當月付款記錄
    prop.rooms.filter(room => room.s === 'occupied').forEach(room => {
      // 檢查是否已經有當月的付款記錄
      const hasPayment = existingPendingPayments.some(p => 
        p.rid === room.id && p.m === currentMonthStr
      );
      
      if (!hasPayment) {
        // 計算電費使用量
        const electricityUsage = (room.cm || 0) - (room.pm || 0);
        const electricityFee = electricityUsage * data.electricityRate;
        
        // 生成新的付款ID
        const maxPaymentId = Math.max(
          ...prop.payments.map(p => p.id),
          ...(prop.history || []).map(h => h.id),
          0
        );
        
        // 創建新的付款記錄
        prop.payments.push({
          id: maxPaymentId + 1,
          rid: room.id,
          n: room.n,
          t: room.t || '',
          m: currentMonthStr,
          r: room.r,
          u: electricityUsage,
          e: electricityFee,
          total: room.r + electricityFee,
          due: dueDate,
          s: 'pending'
        });
      }
    });
    
    // 過濾掉不存在的房間的付款記錄
    prop.payments = prop.payments.filter(payment => {
      const room = prop.rooms.find(r => r.id === payment.rid);
      return room && room.s === 'occupied';
    });
  });
}

// 資料正規化：確保所有欄位都有正確的型別，防止 runtime 崩潰
export function normalizeAppData(data: any): AppData {
  const base = initData()
  
  if (!data || typeof data !== 'object') return base
  
  const properties = Array.isArray(data.properties) ? data.properties : []
  
  return {
    ...base,
    ...data,
    properties: properties.map((p: any) => ({
      ...p,
      rooms: Array.isArray(p.rooms) ? p.rooms.map((r: any) => ({
        ...r,
        id: r.id ?? 0,
        payments: Array.isArray(r.payments) ? r.payments : [],
      })) : [],
      payments: Array.isArray(p.payments) ? p.payments : [],
      history: Array.isArray(p.history) ? p.history : [],
      maintenance: Array.isArray(p.maintenance) ? p.maintenance : [],
      utilityExpenses: Array.isArray(p.utilityExpenses) ? p.utilityExpenses : [],
      additionalIncomes: Array.isArray(p.additionalIncomes) ? p.additionalIncomes : [],
    })),
    rooms: Array.isArray(data.rooms) ? data.rooms : [],
    payments: Array.isArray(data.payments) ? data.payments : [],
    tenants: Array.isArray(data.tenants) ? data.tenants : [],
    history: Array.isArray(data.history) ? data.history : [],
    maintenance: Array.isArray(data.maintenance) ? data.maintenance : [],
    utilityExpenses: Array.isArray(data.utilityExpenses) ? data.utilityExpenses : [],
    additionalIncomes: Array.isArray(data.additionalIncomes) ? data.additionalIncomes : [],
    electricityRate: typeof data.electricityRate === 'number' ? data.electricityRate : 6,
    actualElectricityRate: typeof data.actualElectricityRate === 'number' ? data.actualElectricityRate : 4.5,
  }
}
