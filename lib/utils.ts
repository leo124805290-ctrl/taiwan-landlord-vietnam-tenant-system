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
        address: '新北市汐止區大同路一段123號',
        floors: 5,
        rooms: [
          // 1樓 - 已出租
          { id: 1, f: 1, n: '101', r: 7000, d: 14000, s: 'occupied', t: 'Nguyen Van A', p: '0912-345-001', in: '2025-09-01', out: '2026-08-31', cm: 1250, pm: 1180, lm: 1110 },
          { id: 2, f: 1, n: '102', r: 7000, d: 14000, s: 'occupied', t: 'Tran Thi B', p: '0912-345-002', in: '2025-09-15', out: '2026-09-14', cm: 1380, pm: 1310, lm: 1240 },
          { id: 3, f: 1, n: '103', r: 7500, d: 15000, s: 'occupied', t: 'Le Van C', p: '0912-345-003', in: '2025-10-01', out: '2026-09-30', cm: 980, pm: 920, lm: 860 },
          
          // 2樓 - 已出租，合約即將到期
          { id: 4, f: 2, n: '201', r: 8000, d: 16000, s: 'occupied', t: 'Pham Thi D', p: '0912-345-004', in: '2025-11-01', out: '2026-03-31', cm: 890, pm: 820, lm: 750 },
          { id: 5, f: 2, n: '202', r: 8000, d: 16000, s: 'occupied', t: 'Hoang Van E', p: '0912-345-005', in: '2025-12-01', out: '2026-04-30', cm: 1050, pm: 980, lm: 910 },
          
          // 3樓 - 空房
          { id: 6, f: 3, n: '301', r: 8500, d: 17000, s: 'available' },
          { id: 7, f: 3, n: '302', r: 8500, d: 17000, s: 'available' },
          
          // 4樓 - 已退租（保留歷史）
          { id: 8, f: 4, n: '401', r: 9000, d: 18000, s: 'available', t: '舊租客F', p: '0912-345-006', in: '2025-08-01', out: '2026-01-31', moveOutDate: '2026-01-31', finalMeter: 1200, finalElectricityFee: 1200 },
          { id: 9, f: 4, n: '402', r: 9000, d: 18000, s: 'available', t: '舊租客G', p: '0912-345-007', in: '2025-07-01', out: '2025-12-31', moveOutDate: '2025-12-31', finalMeter: 1100, finalElectricityFee: 900 },
          
          // 5樓 - 裝修中
          { id: 10, f: 5, n: '501', r: 9500, d: 19000, s: 'renovation' },
        ],
        payments: [],
        history: [
          // 2025年12月歷史繳款
          { id: 1, rid: 1, n: '101', t: 'Nguyen Van A', m: '2025/12', r: 7000, u: 65, e: 390, total: 7390, due: '2025-12-05', paid: '2025-12-03', s: 'paid', paymentMethod: 'transfer' },
          { id: 2, rid: 2, n: '102', t: 'Tran Thi B', m: '2025/12', r: 7000, u: 70, e: 420, total: 7420, due: '2025-12-05', paid: '2025-12-04', s: 'paid', paymentMethod: 'cash' },
          { id: 3, rid: 4, n: '201', t: 'Pham Thi D', m: '2025/12', r: 8000, u: 45, e: 270, total: 8270, due: '2025-12-05', paid: '2025-12-02', s: 'paid', paymentMethod: 'transfer' },
          
          // 2026年1月歷史繳款
          { id: 4, rid: 1, n: '101', t: 'Nguyen Van A', m: '2026/01', r: 7000, u: 68, e: 408, total: 7408, due: '2026-01-05', paid: '2026-01-03', s: 'paid', paymentMethod: 'transfer' },
          { id: 5, rid: 2, n: '102', t: 'Tran Thi B', m: '2026/01', r: 7000, u: 72, e: 432, total: 7432, due: '2026-01-05', paid: '2026-01-04', s: 'paid', paymentMethod: 'cash' },
          { id: 6, rid: 3, n: '103', t: 'Le Van C', m: '2026/01', r: 7500, u: 60, e: 360, total: 7860, due: '2026-01-05', paid: '2026-01-05', s: 'paid', paymentMethod: 'transfer' },
          { id: 7, rid: 4, n: '201', t: 'Pham Thi D', m: '2026/01', r: 8000, u: 47, e: 282, total: 8282, due: '2026-01-05', paid: '2026-01-02', s: 'paid', paymentMethod: 'transfer' },
          { id: 8, rid: 5, n: '202', t: 'Hoang Van E', m: '2026/01', r: 8000, u: 70, e: 420, total: 8420, due: '2026-01-05', paid: '2026-01-04', s: 'paid', paymentMethod: 'cash' },
          
          // 2026年2月歷史繳款（部分）
          { id: 9, rid: 1, n: '101', t: 'Nguyen Van A', m: '2026/02', r: 7000, u: 70, e: 420, total: 7420, due: '2026-02-05', paid: '2026-02-03', s: 'paid', paymentMethod: 'transfer' },
        ],
        maintenance: [
          // 維修記錄
          { id: 1, rid: 1, n: '101', t: 'Nguyen Van A', title: '熱水器故障', desc: '無法加熱', urg: 'urgent', s: 'completed', date: '2026-02-13', repairDate: '2026-02-15', cost: 3500, technician: '王師傅', notes: '更換加熱棒', category: 'repair' },
          { id: 2, rid: 2, n: '102', t: 'Tran Thi B', title: '冷氣不冷', desc: '夏天冷氣效果差', urg: 'normal', s: 'completed', date: '2025-11-20', repairDate: '2025-11-22', cost: 2800, technician: '李師傅', notes: '清洗濾網，補充冷媒', category: 'repair' },
          { id: 3, rid: 4, n: '201', t: 'Pham Thi D', title: '馬桶堵塞', desc: '馬桶沖水不順', urg: 'urgent', s: 'completed', date: '2026-01-10', repairDate: '2026-01-10', cost: 1200, technician: '張師傅', notes: '疏通管道', category: 'repair' },
          { id: 4, rid: 8, n: '401', t: '舊租客F', title: '牆壁油漆剝落', desc: '退租後牆壁需要重新粉刷', urg: 'normal', s: 'completed', date: '2026-02-01', repairDate: '2026-02-05', cost: 5000, technician: '陳師傅', notes: '全室重新粉刷', category: 'repair' },
          
          // 裝修記錄
          { id: 5, rid: 10, n: '501', t: '', title: '房間全面裝修', desc: '地板更新、牆面粉刷、衛浴設備更新', urg: 'normal', s: 'pending', date: '2026-02-20', estimatedCost: 85000, estimatedCompletion: '2026-03-31', notes: '提升租金至9500元', category: 'renovation' },
        ],
      },
      {
        id: 2,
        name: '板橋文化路',
        address: '新北市板橋區文化路二段456號',
        floors: 4,
        rooms: [
          { id: 11, f: 1, n: '101', r: 7500, d: 15000, s: 'occupied', t: 'Nguyen Thi H', p: '0912-345-008', in: '2025-10-15', out: '2026-10-14', cm: 1150, pm: 1080, lm: 1010 },
          { id: 12, f: 2, n: '201', r: 8000, d: 16000, s: 'occupied', t: 'Tran Van I', p: '0912-345-009', in: '2025-11-01', out: '2026-05-31', cm: 920, pm: 850, lm: 780 },
          { id: 13, f: 3, n: '301', r: 8500, d: 17000, s: 'available' },
        ],
        payments: [],
        history: [
          { id: 10, rid: 11, n: '101', t: 'Nguyen Thi H', m: '2026/01', r: 7500, u: 55, e: 330, total: 7830, due: '2026-01-05', paid: '2026-01-03', s: 'paid', paymentMethod: 'transfer' },
          { id: 11, rid: 12, n: '201', t: 'Tran Van I', m: '2026/01', r: 8000, u: 60, e: 360, total: 8360, due: '2026-01-05', paid: '2026-01-04', s: 'paid', paymentMethod: 'cash' },
        ],
        maintenance: [
          { id: 6, rid: 11, n: '101', t: 'Nguyen Thi H', title: '燈具更換', desc: '房間主燈不亮', urg: 'normal', s: 'completed', date: '2026-01-15', repairDate: '2026-01-16', cost: 800, technician: '林師傅', category: 'repair' },
        ],
      }
    ],
    electricityRate: 6,
    actualElectricityRate: 4.5,
    utilityExpenses: [
      // 範例：台電帳單
      { id: 1, type: 'taipower', period: '2026年1-2月', amount: 8500, paidDate: '2026-03-05', notes: '冬季電費較高', propertyId: 1 },
      { id: 2, type: 'taipower', period: '2025年11-12月', amount: 7200, paidDate: '2026-01-05', propertyId: 1 },
      // 範例：水費帳單
      { id: 3, type: 'water', period: '2025年12月-2026年1月', amount: 1800, paidDate: '2026-02-10', propertyId: 1 },
      { id: 4, type: 'taipower', period: '2025年9-10月', amount: 6800, paidDate: '2025-11-05', propertyId: 1 },
      { id: 5, type: 'water', period: '2025年10-11月', amount: 1650, paidDate: '2025-12-10', propertyId: 1 },
      // 範例：租金支出（二房東需要支付給房東的租金）
      { id: 6, type: 'rent', period: '2026年1月', amount: 50000, paidDate: '2026-01-05', notes: '支付給房東的1月份租金', propertyId: 1 },
      { id: 7, type: 'rent', period: '2025年12月', amount: 50000, paidDate: '2025-12-05', notes: '支付給房東的12月份租金', propertyId: 1 },
      { id: 8, type: 'rent', period: '2026年1月', amount: 35000, paidDate: '2026-01-05', notes: '板橋文化路1月份租金', propertyId: 2 },
    ],
    additionalIncomes: [
      // 範例：洗衣機收入
      { id: 1, type: 'washing-machine', month: '2026/01', amount: 1500, description: '1月份洗衣機收入', receivedDate: '2026-02-01', propertyId: 1, notes: '租客使用收入' },
      { id: 2, type: 'washing-machine', month: '2025/12', amount: 1200, description: '12月份洗衣機收入', receivedDate: '2026-01-05', propertyId: 1, notes: '聖誕節期間收入較高' },
      { id: 3, type: 'other', month: '2026/01', amount: 800, description: '其他雜項收入', receivedDate: '2026-02-10', propertyId: 1, notes: '停車位出租' },
      { id: 4, type: 'washing-machine', month: '2025/11', amount: 1100, description: '11月份洗衣機收入', receivedDate: '2025-12-05', propertyId: 1 },
      { id: 5, type: 'other', month: '2025/12', amount: 500, description: '年終獎金', receivedDate: '2026-01-15', propertyId: 1, notes: '公司年終獎金' },
    ],
  };
}

// 計算所有付款
export function calcAllPayments(data: AppData): void {
  data.properties.forEach(prop => {
    calcPayments(prop, data.electricityRate);
  });
}

// 計算物業付款（智能生成，避免重複）
export function calcPayments(property: Property, electricityRate: number): void {
  // 獲取當前年月
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 0-based to 1-based
  const currentMonthStr = `${currentYear}/${currentMonth.toString().padStart(2, '0')}`;
  
  // 計算下個月的5號為到期日
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const dueDate = `${nextMonth.getFullYear()}-${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}-05`;
  
  // 獲取現有的待繳款項
  const existingPendingPayments = property.payments.filter(p => p.s === 'pending');
  
  // 為每個已出租房間檢查是否需要生成付款
  property.rooms
    .filter(r => r.s === 'occupied')
    .forEach(rm => {
      // 檢查是否已經有這個房間這個月的待繳款項
      const existingPayment = existingPendingPayments.find(p => 
        p.rid === rm.id && p.m === currentMonthStr
      );
      
      if (!existingPayment) {
        // 生成新的付款項
        const u = (rm.cm || 0) - (rm.pm || 0);
        const e = u * electricityRate;
        
        // 生成唯一的ID
        const maxId = Math.max(
          ...property.payments.map(p => p.id),
          ...(property.history || []).map(p => p.id),
          0
        );
        
        property.payments.push({
          id: maxId + 1,
          rid: rm.id,
          n: rm.n,
          t: rm.t || '',
          m: currentMonthStr,
          r: rm.r,
          u: u,
          e: e,
          total: rm.r + e,
          due: dueDate,
          s: 'pending'
        });
      }
    });
  
  // 移除已退租房間的待繳款項
  property.payments = property.payments.filter(p => {
    const room = property.rooms.find(r => r.id === p.rid);
    return room && room.s === 'occupied';
  });
}

// 時間篩選
export function filterHistoryByTime(history: Payment[], timeScope: TimeScope, year?: number, month?: string): Payment[] {
  if (!history) return [];
  
  // 獲取當前年份和月份
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // 過濾掉未來月份的數據
  const filteredHistory = history.filter(h => {
    if (!h.m) return false;
    
    // 解析月份字串 (格式: YYYY/MM)
    const [hYear, hMonth] = h.m.split('/').map(Number);
    
    // 排除未來月份
    if (hYear > currentYear) return false;
    if (hYear === currentYear && hMonth > currentMonth) return false;
    
    return true;
  });
  
  if (timeScope === 'all') return filteredHistory;
  
  if (timeScope === 'year' && year) {
    return filteredHistory.filter(h => h.m && h.m.startsWith(String(year)));
  }
  
  if (timeScope === 'month' && month) {
    const targetMonth = month.replace('-', '/');
    return filteredHistory.filter(h => h.m && h.m.startsWith(targetMonth));
  }
  
  return filteredHistory;
}

// 電費時間篩選
export function filterElecByTime(
  payments: Payment[], 
  history: Payment[], 
  timeScope: TimeScope, 
  year?: number, 
  month?: string
): { pend: Payment[]; hist: Payment[] } {
  // 獲取當前年份和月份
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  // 過濾掉未來月份的數據
  const filterFuture = (items: Payment[]) => {
    return items.filter(item => {
      if (!item.m) return false;
      
      // 解析月份字串 (格式: YYYY/MM)
      const [itemYear, itemMonth] = item.m.split('/').map(Number);
      
      // 排除未來月份
      if (itemYear > currentYear) return false;
      if (itemYear === currentYear && itemMonth > currentMonth) return false;
      
      return true;
    });
  };
  
  let pend = filterFuture(payments || []);
  let hist = filterFuture(history || []);
  
  if (timeScope === 'all') {
    return { pend: pend, hist: hist };
  }
  
  if (timeScope === 'year' && year) {
    const yearStr = String(year);
    pend = pend.filter(p => p.m && p.m.startsWith(yearStr));
    hist = hist.filter(h => h.m && h.m.startsWith(yearStr));
  } else if (timeScope === 'month' && month) {
    const targetMonth = month.replace('-', '/');
    pend = pend.filter(p => p.m && p.m.startsWith(targetMonth));
    hist = hist.filter(h => h.m && h.m.startsWith(targetMonth));
  }
  
  return { pend: pend, hist: hist };
}

// 系統自檢函數
export function systemSelfCheck(data: AppData): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // 檢查1：物業資料完整性
  if (!data.properties || data.properties.length === 0) {
    issues.push('⚠️ 沒有物業資料，請至少新增一個物業');
  }
  
  data.properties.forEach((property, index) => {
    // 檢查房間資料
    if (!property.rooms || property.rooms.length === 0) {
      issues.push(`⚠️ 物業「${property.name}」沒有房間資料`);
    }
    
    // 檢查房間號碼重複
    const roomNumbers = property.rooms.map(r => r.n);
    const duplicates = roomNumbers.filter((num, i) => roomNumbers.indexOf(num) !== i);
    if (duplicates.length > 0) {
      issues.push(`⚠️ 物業「${property.name}」有重複房號：${duplicates.join(', ')}`);
    }
    
    // 檢查電費率
    if (data.electricityRate <= 0) {
      issues.push('⚠️ 電費收費率必須大於0');
    }
    
    if (data.actualElectricityRate <= 0) {
      issues.push('⚠️ 實際電費率必須大於0');
    }
    
    // 檢查合約日期
    property.rooms.forEach(room => {
      if (room.s === 'occupied') {
        if (!room.in || !room.out) {
          issues.push(`⚠️ 房間 ${room.n} 已出租但缺少合約日期`);
        }
        
        // 檢查合約是否已過期
        if (room.out) {
          const outDate = new Date(room.out);
          const today = new Date();
          if (outDate < today) {
            issues.push(`⚠️ 房間 ${room.n} 合約已過期（${room.out}）`);
          }
        }
      }
    });
    
    // 檢查付款記錄一致性
    const paymentRoomIds = [...property.payments, ...(property.history || [])].map(p => p.rid);
    const validRoomIds = property.rooms.map(r => r.id);
    const invalidPayments = paymentRoomIds.filter(id => !validRoomIds.includes(id));
    if (invalidPayments.length > 0) {
      issues.push(`⚠️ 物業「${property.name}」有 ${invalidPayments.length} 筆付款記錄對應到不存在的房間`);
    }
  });
  
  return {
    ok: issues.length === 0,
    issues: issues
  };
}

// 檢查翻譯完整性
export function checkTranslations(): { missing: string[]; incomplete: string[] } {
  const missing: string[] = [];
  const incomplete: string[] = [];
  
  // 這裡可以添加更詳細的翻譯檢查邏輯
  // 目前先返回空結果，表示翻譯完整
  return { missing, incomplete };
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