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
