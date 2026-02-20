import { 
  AppData, 
  Property, 
  Room, 
  Payment, 
  Stats, 
  TimeScope,
  ElectricityAnalysis
} from './types';

// 初始化資料
export function initData(): AppData {
  return {
    properties: [
      {
        id: 1,
        name: '汐止大同路',
        address: '新北市汐止區大同路',
        floors: 3,
        rooms: [
          { id: 1, f: 1, n: '101', r: 7000, d: 14000, s: 'occupied', t: 'Nguyen Van A', p: '0912-345-001', in: '2025-09-01', out: '2026-08-31', cm: 1250, pm: 1180, lm: 1110 },
          { id: 2, f: 1, n: '102', r: 7000, d: 14000, s: 'occupied', t: 'Tran Thi B', p: '0912-345-002', in: '2025-09-15', out: '2026-09-14', cm: 1380, pm: 1310, lm: 1240 },
          { id: 3, f: 1, n: '103', r: 7500, d: 15000, s: 'occupied', t: 'Le Van C', p: '0912-345-003', in: '2025-10-01', out: '2026-09-30', cm: 980, pm: 920, lm: 860 },
          { id: 6, f: 1, n: '106', r: 7500, d: 15000, s: 'available' },
        ],
        payments: [],
        history: [
          { id: 1, rid: 1, n: '101', t: 'Nguyen Van A', m: '2026/02', r: 7000, u: 70, e: 420, total: 7420, due: '2026-02-05', paid: '2026-02-03', s: 'paid' },
        ],
        maintenance: [
          { id: 1, rid: 1, n: '101', t: 'Nguyen Van A', title: '熱水器故障', desc: '無法加熱', urg: 'urgent', s: 'pending', date: '2026-02-13', cost: 0 },
        ],
      }
    ],
    electricityRate: 6,
    actualElectricityRate: 4.5,
  };
}

// 計算所有付款
export function calcAllPayments(data: AppData): void {
  data.properties.forEach(prop => {
    calcPayments(prop, data.electricityRate);
  });
}

// 計算物業付款
export function calcPayments(property: Property, electricityRate: number): void {
  property.payments = [];
  let id = (property.history?.length > 0 ? Math.max(...property.history.map(p => p.id)) : 0) + 100;
  
  property.rooms
    .filter(r => r.s === 'occupied')
    .forEach(rm => {
      const u = (rm.cm || 0) - (rm.pm || 0);
      const e = u * electricityRate;
      property.payments.push({
        id: id++,
        rid: rm.id,
        n: rm.n,
        t: rm.t || '',
        m: '2026/03',
        r: rm.r,
        u: u,
        e: e,
        total: rm.r + e,
        due: '2026-03-05',
        s: 'pending'
      });
    });
}

// 時間篩選
export function filterHistoryByTime(history: Payment[], timeScope: TimeScope, year?: number, month?: string): Payment[] {
  if (!history) return [];
  if (timeScope === 'all') return history;
  
  if (timeScope === 'year' && year) {
    return history.filter(h => h.m && h.m.startsWith(String(year)));
  }
  
  if (timeScope === 'month' && month) {
    const targetMonth = month.replace('-', '/');
    return history.filter(h => h.m && h.m.startsWith(targetMonth));
  }
  
  return history;
}

// 電費時間篩選
export function filterElecByTime(
  payments: Payment[], 
  history: Payment[], 
  timeScope: TimeScope, 
  year?: number, 
  month?: string
): { pend: Payment[]; hist: Payment[] } {
  if (timeScope === 'all') {
    return { pend: payments, hist: history || [] };
  }
  
  let hist = history || [];
  if (timeScope === 'year' && year) {
    hist = hist.filter(h => h.m && h.m.startsWith(String(year)));
  } else if (timeScope === 'month' && month) {
    const targetMonth = month.replace('-', '/');
    hist = hist.filter(h => h.m && h.m.startsWith(targetMonth));
  }
  
  return { pend: payments, hist: hist };
}

// 計算統計資料
export function calculateStats(property: Property, data: AppData, revenueTimeScope: TimeScope, revenueYear: number, revenueMonth: string, elecTimeScope: TimeScope, elecYear: number, elecMonth: string): Stats {
  if (!property) {
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

  const occupiedRooms = property.rooms.filter(r => r.s === 'occupied');
  const totalRooms = property.rooms.length;
  const pendingPayments = property.payments.filter(p => p.s === 'pending');
  const allHistory = property.history || [];
  
  const filteredHistory = filterHistoryByTime(allHistory, revenueTimeScope, revenueYear, revenueMonth);
  const elecFiltered = filterElecByTime(pendingPayments, allHistory, elecTimeScope, elecYear, elecMonth);
  
  const totalChargedElec = 
    elecFiltered.pend.reduce((s, p) => s + p.e, 0) + 
    elecFiltered.hist.reduce((s, h) => s + h.e, 0);
  
  const totalUsage = 
    elecFiltered.pend.reduce((s, p) => s + p.u, 0) + 
    elecFiltered.hist.reduce((s, h) => s + h.u, 0);
  
  const actualElecCost = totalUsage * data.actualElectricityRate;
  const elecProfit = totalChargedElec - actualElecCost;
  const elecProfitRate = actualElecCost > 0 ? (elecProfit / actualElecCost) * 100 : 0;
  
  const totalDeposit = occupiedRooms.reduce((s, r) => s + (r.d || 0), 0);
  const elecReceivable = pendingPayments.reduce((s, p) => s + p.e, 0);
  
  const floors = Array.from({ length: property.floors }, (_, i) => i + 1).map(f => {
    const floorRooms = property.rooms.filter(r => r.f === f);
    const floorOccupied = floorRooms.filter(r => r.s === 'occupied').length;
    return {
      f,
      total: floorRooms.length,
      occ: floorOccupied,
      rate: floorRooms.length > 0 ? Math.round(floorOccupied / floorRooms.length * 100) : 0
    };
  });
  
  const rentByFloor = Array.from({ length: property.floors }, (_, i) => i + 1).map(f => {
    const floorRooms = property.rooms.filter(r => r.f === f && r.s === 'occupied');
    return {
      f,
      rent: floorRooms.reduce((s, r) => s + r.r, 0)
    };
  });
  
  const expiringRooms = occupiedRooms.filter(r => {
    if (!r.out) return false;
    const endDate = new Date(r.out);
    const threeMonthsLater = new Date(Date.now() + 90 * 86400000);
    return endDate < threeMonthsLater;
  }).length;
  
  return {
    total: totalRooms,
    occupied: occupiedRooms.length,
    available: totalRooms - occupiedRooms.length,
    rate: totalRooms > 0 ? Math.round(occupiedRooms.length / totalRooms * 100) : 0,
    totalRent: occupiedRooms.reduce((s, r) => s + r.r, 0),
    avgRent: occupiedRooms.length > 0 ? Math.round(occupiedRooms.reduce((s, r) => s + r.r, 0) / occupiedRooms.length) : 0,
    totalElec: pendingPayments.reduce((s, p) => s + p.e, 0),
    received: filteredHistory.reduce((s, h) => s + h.total, 0),
    pending: pendingPayments.reduce((s, p) => s + p.total, 0),
    pendingCount: pendingPayments.length,
    expiring: expiringRooms,
    totalDeposit,
    elecReceivable,
    floors,
    rentByFloor,
    elec: {
      charged: totalChargedElec,
      chargedRate: data.electricityRate,
      usage: totalUsage,
      actualCost: actualElecCost,
      actualRate: data.actualElectricityRate,
      profit: elecProfit,
      profitRate: elecProfitRate,
    }
  };
}

// 分析電費
export function analyzeElectricity(elec: Stats['elec']): ElectricityAnalysis {
  const profit = elec.profit;
  const profitRate = elec.profitRate;
  
  let recommendation;
  if (profit >= 0) {
    recommendation = {
      ok: true,
      message: '電價合理，可繼續使用',
    };
  } else {
    const suggestedRate = Math.ceil(elec.actualRate * 1.3);
    recommendation = {
      ok: false,
      message: '建議調整電價',
      suggestedRate,
    };
  }
  
  return {
    charged: elec.charged,
    usage: elec.usage,
    actualCost: elec.actualCost,
    profit,
    profitRate,
    recommendation,
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