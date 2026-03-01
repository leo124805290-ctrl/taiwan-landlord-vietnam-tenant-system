import { 
  AppData, 
  Property, 
  Room, 
  Payment, 
  Tenant,
  Stats, 
  TimeScope,
  ElectricityAnalysis
} from './types';

// 初始化資料 - 修復版本
export function initData(): AppData {
  // 定義物業數據
  const properties = [
    {
      id: 1,
      name: '汐止大同路',
      address: '新北市汐止區大同路一段123號',
      floors: 5,
      rooms: [
        { id: 1, f: 1, n: '101', r: 7000, d: 14000, s: 'occupied', t: 'Nguyen Van A', p: '0912-345-001', in: '2025-09-01', out: '2026-08-31', cm: 1250, pm: 1180, lm: 1110 },
        { id: 2, f: 1, n: '102', r: 7000, d: 14000, s: 'occupied', t: 'Tran Thi B', p: '0912-345-002', in: '2025-09-15', out: '2026-09-14', cm: 1380, pm: 1310, lm: 1240 },
        { id: 3, f: 1, n: '103', r: 7500, d: 15000, s: 'occupied', t: 'Le Van C', p: '0912-345-003', in: '2025-10-01', out: '2026-09-30', cm: 980, pm: 920, lm: 860 },
        { id: 4, f: 2, n: '201', r: 8000, d: 16000, s: 'occupied', t: 'Pham Thi D', p: '0912-345-004', in: '2025-11-01', out: '2026-03-31', cm: 890, pm: 820, lm: 750 },
        { id: 5, f: 2, n: '202', r: 8000, d: 16000, s: 'occupied', t: 'Hoang Van E', p: '0912-345-005', in: '2025-12-01', out: '2026-04-30', cm: 1050, pm: 980, lm: 910 },
        { id: 6, f: 3, n: '301', r: 8500, d: 17000, s: 'available' },
        { id: 7, f: 3, n: '302', r: 8500, d: 17000, s: 'available' },
        { id: 8, f: 4, n: '401', r: 9000, d: 18000, s: 'available', t: '舊租客F', p: '0912-345-006', in: '2025-08-01', out: '2026-01-31', moveOutDate: '2026-01-31', finalMeter: 1200, finalElectricityFee: 1200 },
        { id: 9, f: 4, n: '402', r: 9000, d: 18000, s: 'available', t: '舊租客G', p: '0912-345-007', in: '2025-07-01', out: '2025-12-31', moveOutDate: '2025-12-31', finalMeter: 1100, finalElectricityFee: 900 },
        { id: 10, f: 5, n: '501', r: 9500, d: 19000, s: 'maintenance' },
      ],
      payments: [],
      history: [
        { id: 1, rid: 1, n: '101', t: 'Nguyen Van A', m: '2025/12', r: 7000, u: 65, e: 390, total: 7390, due: '2025-12-05', paid: '2025-12-03', s: 'paid', paymentMethod: 'transfer' },
        { id: 2, rid: 2, n: '102', t: 'Tran Thi B', m: '2025/12', r: 7000, u: 70, e: 420, total: 7420, due: '2025-12-05', paid: '2025-12-04', s: 'paid', paymentMethod: 'cash' },
        { id: 3, rid: 4, n: '201', t: 'Pham Thi D', m: '2025/12', r: 8000, u: 45, e: 270, total: 8270, due: '2025-12-05', paid: '2025-12-02', s: 'paid', paymentMethod: 'transfer' },
        { id: 4, rid: 1, n: '101', t: 'Nguyen Van A', m: '2026/01', r: 7000, u: 68, e: 408, total: 7408, due: '2026-01-05', paid: '2026-01-03', s: 'paid', paymentMethod: 'transfer' },
        { id: 5, rid: 2, n: '102', t: 'Tran Thi B', m: '2026/01', r: 7000, u: 72, e: 432, total: 7432, due: '2026-01-05', paid: '2026-01-04', s: 'paid', paymentMethod: 'cash' },
        { id: 6, rid: 3, n: '103', t: 'Le Van C', m: '2026/01', r: 7500, u: 60, e: 360, total: 7860, due: '2026-01-05', paid: '2026-01-05', s: 'paid', paymentMethod: 'transfer' },
        { id: 7, rid: 4, n: '201', t: 'Pham Thi D', m: '2026/01', r: 8000, u: 47, e: 282, total: 8282, due: '2026-01-05', paid: '2026-01-02', s: 'paid', paymentMethod: 'transfer' },
        { id: 8, rid: 5, n: '202', t: 'Hoang Van E', m: '2026/01', r: 8000, u: 70, e: 420, total: 8420, due: '2026-01-05', paid: '2026-01-04', s: 'paid', paymentMethod: 'cash' },
        { id: 9, rid: 1, n: '101', t: 'Nguyen Van A', m: '2026/02', r: 7000, u: 70, e: 420, total: 7420, due: '2026-02-05', paid: '2026-02-03', s: 'paid', paymentMethod: 'transfer' },
      ],
      maintenance: [
        { id: 1, rid: 1, n: '101', t: 'Nguyen Van A', title: '熱水器故障', desc: '無法加熱', urg: 'urgent', s: 'completed', date: '2026-02-13', repairDate: '2026-02-15', cost: 3500, technician: '王師傅', notes: '更換加熱棒', category: 'repair' },
        { id: 2, rid: 2, n: '102', t: 'Tran Thi B', title: '冷氣不冷', desc: '夏天冷氣效果差', urg: 'normal', s: 'completed', date: '2025-11-20', repairDate: '2025-11-22', cost: 2800, technician: '李師傅', notes: '清洗濾網，補充冷媒', category: 'repair' },
        { id: 3, rid: 4, n: '201', t: 'Pham Thi D', title: '馬桶堵塞', desc: '馬桶沖水不順', urg: 'urgent', s: 'completed', date: '2026-01-10', repairDate: '2026-01-10', cost: 1200, technician: '張師傅', notes: '疏通管道', category: 'repair' },
        { id: 4, rid: 8, n: '401', t: '舊租客F', title: '牆壁油漆剝落', desc: '退租後牆壁需要重新粉刷', urg: 'normal', s: 'completed', date: '2026-02-01', repairDate: '2026-02-05', cost: 5000, technician: '陳師傅', notes: '全室重新粉刷', category: 'repair' },
        { id: 5, rid: 10, n: '501', t: '', title: '房間全面裝修', desc: '地板更新、牆面粉刷、衛浴設備更新', urg: 'normal', s: 'pending', date: '2026-02-20', estimatedCost: 85000, estimatedCompletion: '2026-03-31', notes: '提升租金至9500元', category: 'renovation' },
      ],
      propertyRentalCost: {
        monthlyRent: 50000,
        deposit: 100000,
        contractStartDate: '2025-01-01',
        contractEndDate: '2027-12-31',
        paymentDay: 5,
        notes: '整棟租用，二房東轉租給租客'
      },
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
      propertyRentalCost: {
        monthlyRent: 35000,
        deposit: 70000,
        contractStartDate: '2025-03-01',
        contractEndDate: '2027-02-28',
        paymentDay: 10,
        notes: '部分樓層租用'
      },
    }
  ];

  // 從所有物業中提取數據
  const allRooms: Room[] = [];
  const allPayments: Payment[] = [];
  const allTenants: Tenant[] = [];
  const allHistory: any[] = [];
  const allMaintenance: any[] = [];

  properties.forEach(property => {
    // 提取房間
    if (property.rooms) {
      allRooms.push(...property.rooms);
    }
    
    // 提取付款
    if (property.payments) {
      allPayments.push(...property.payments);
    }
    
    // 提取租客（從房間中提取）
    property.rooms.forEach(room => {
      if (room.s === 'occupied' && room.t) {
        allTenants.push({
          id: room.id,
          name: room.t,
          phone: room.p || '',
          roomId: room.id,
          roomName: room.n,
          checkInDate: room.in || '',
          checkOutDate: room.out || '',
          rent: room.r,
          deposit: room.d,
          status: 'active'
        });
      }
    });
    
    // 提取歷史記錄
    if (property.history) {
      allHistory.push(...property.history);
    }
    
    // 提取維修記錄
    if (property.maintenance) {
      allMaintenance.push(...property.maintenance);
    }
  });

  return {
    properties: properties,
    rooms: allRooms,
    payments: allPayments,
    tenants: allTenants,
    history: allHistory,
    maintenance: allMaintenance,
    electricityRate: 6,
    actualElectricityRate: 4.5,
    utilityExpenses: [
      { id: 1, type: 'taipower', period: '2026年1-2月', amount: 8500, paidDate: '2026-03-05', notes: '冬季電費較高', propertyId: 1 },
      { id: 2, type: 'taipower', period: '2025年11-12月', amount: 7200, paidDate: '2026-01-05', propertyId: 1 },
      { id: 3, type: 'water', period: '2025年12月-2026年1月', amount: 1800, paidDate: '2026-02-10', propertyId: 1 },
      { id: 4, type: 'taipower', period: '2025年9-10月', amount: 6800, paidDate: '2025-11-05', propertyId: 1 },
      { id: 5, type: 'water', period: '2025年10-11月', amount: 1650, paidDate: '2025-12-10', propertyId: 1 },
      { id: 6, type: 'rent', period: '2026年1月', amount: 50000, paidDate: '2026-01-05', notes: '支付給房東的1月份租金', propertyId: 1 },
      { id: 7, type: 'rent', period: '2025年12月', amount: 50000, paidDate: '2025-12-05', notes: '支付給房東的12月份租金', propertyId: 1 },
      { id: 8, type: 'rent', period: '2026年1月', amount: 35000, paidDate: '2026-01-05', notes: '板橋文化路1月份租金', propertyId: 2 },
    ],
    additionalIncomes: [
      { id: 1, type: 'washing-machine', month: '2026/01', amount: 1500, description: '1月份洗衣機收入', receivedDate: '2026-02-01', propertyId: 1, notes: '租客使用收入' },
      { id: 2, type: 'washing-machine', month: '2025/12', amount: 1200, description: '12月份洗衣機收入', receivedDate: '2026-01-05', propertyId: 1, notes: '聖誕節期間收入較高' },
      { id: 3, type: 'other', month: '2026/01', amount: 800, description: '其他雜項收入', receivedDate: '2026-02-10', propertyId: 1, notes: '停車位出租' },
      { id: 4, type: 'washing-machine', month: '2025/11', amount: 1100, description: '11月份洗衣機收入', receivedDate: '2025-12-05', propertyId: 1 },
      { id: 5, type: 'other', month: '2025/12', amount: 500, description: '年終獎金', receivedDate: '2026-01-15', propertyId: 1, notes: '公司年終獎金' },
    ],
  };
}

// 其他函數保持不變...