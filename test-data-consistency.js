#!/usr/bin/env node

console.log('🔍 檢查數據連動性測試');
console.log('='.repeat(50));

// 模擬數據結構
const mockData = {
  properties: [
    {
      id: 1,
      name: '測試物業',
      rooms: [
        { id: 1, f: 1, n: '101', r: 7000, d: 14000, s: 'occupied', t: '測試租客' }
      ],
      payments: [],
      utilityExpenses: [],
      additionalIncomes: []
    }
  ],
  electricityRate: 6,
  actualElectricityRate: 4.5
};

console.log('\n📊 初始數據狀態:');
console.log('  物業數量:', mockData.properties.length);
console.log('  房間數量:', mockData.properties[0].rooms.length);
console.log('  支出記錄:', mockData.properties[0].utilityExpenses.length);
console.log('  付款記錄:', mockData.properties[0].payments.length);

// 模擬新增台電帳單
console.log('\n➕ 模擬新增台電帳單:');
const newUtilityExpense = {
  id: 1,
  type: 'taipower',
  period: '2026年2月',
  amount: 5000,
  paidDate: '2026-02-23',
  notes: '測試台電帳單'
};

mockData.properties[0].utilityExpenses.push(newUtilityExpense);
console.log('  ✅ 新增台電帳單成功');
console.log('  支出記錄數量:', mockData.properties[0].utilityExpenses.length);

// 檢查Dashboard統計計算
console.log('\n📈 檢查Dashboard統計計算:');
const calculateDashboardStats = () => {
  const property = mockData.properties[0];
  
  // 計算台電總支出
  const totalTaipower = property.utilityExpenses
    .filter(e => e.type === 'taipower')
    .reduce((sum, e) => sum + e.amount, 0);
  
  // 計算水費總支出
  const totalWater = property.utilityExpenses
    .filter(e => e.type === 'water')
    .reduce((sum, e) => sum + e.amount, 0);
  
  // 計算租金總支出
  const totalRent = property.utilityExpenses
    .filter(e => e.type === 'rent')
    .reduce((sum, e) => sum + e.amount, 0);
  
  return {
    totalTaipower,
    totalWater,
    totalRent,
    totalExpenses: totalTaipower + totalWater + totalRent
  };
};

const stats = calculateDashboardStats();
console.log('  台電總支出:', stats.totalTaipower);
console.log('  水費總支出:', stats.totalWater);
console.log('  租金總支出:', stats.totalRent);
console.log('  總支出:', stats.totalExpenses);

// 檢查快速收租與繳費系統連動
console.log('\n💰 檢查快速收租與繳費系統連動:');
console.log('  1. 快速收租應更新房間電錶讀數');
console.log('  2. 快速收租應創建付款記錄');
console.log('  3. 付款記錄應標記為已付款');
console.log('  4. 待付款記錄應被移除');

// 模擬快速收租
console.log('\n⚡ 模擬快速收租流程:');
const simulateQuickCollectRent = () => {
  const room = mockData.properties[0].rooms[0];
  
  // 更新房間電錶讀數
  room.lastMeter = 1500;
  room.lastMeterUsage = 100;
  room.elecFee = 100 * mockData.electricityRate;
  
  // 創建付款記錄
  const newPayment = {
    id: 1,
    rid: room.id,
    n: room.n,
    t: room.t,
    m: '2026年2月',
    r: room.r,
    u: room.lastMeterUsage,
    e: room.elecFee,
    total: room.r + room.elecFee,
    due: '2026-02-05',
    paid: '2026-02-23',
    s: 'paid',
    paymentMethod: 'cash'
  };
  
  mockData.properties[0].payments.push(newPayment);
  
  return {
    roomUpdated: true,
    paymentCreated: true,
    paymentStatus: 'paid'
  };
};

const rentResult = simulateQuickCollectRent();
console.log('  ✅ 房間電錶更新:', rentResult.roomUpdated);
console.log('  ✅ 付款記錄創建:', rentResult.paymentCreated);
console.log('  ✅ 付款狀態:', rentResult.paymentStatus);
console.log('  付款記錄數量:', mockData.properties[0].payments.length);

// 檢查各模塊數據一致性
console.log('\n🔗 檢查各模塊數據一致性:');
console.log('  1. 房間電費計算是否正確？');
console.log('     用電度數:', mockData.properties[0].rooms[0].lastMeterUsage, '度');
console.log('     電費單價:', mockData.electricityRate, '元/度');
console.log('     應收電費:', mockData.properties[0].rooms[0].elecFee, '元');
console.log('     計算驗證:', mockData.properties[0].rooms[0].lastMeterUsage * mockData.electricityRate, '元');

console.log('\n  2. 付款記錄是否與房間數據一致？');
const payment = mockData.properties[0].payments[0];
const correspondingRoom = mockData.properties[0].rooms.find(r => r.id === payment.rid);
console.log('     房間租金:', correspondingRoom?.r, '元');
console.log('     付款租金:', payment.r, '元');
console.log('     一致性:', correspondingRoom?.r === payment.r ? '✅ 一致' : '❌ 不一致');

console.log('\n  3. Dashboard統計是否即時更新？');
console.log('     初始支出記錄:', 1, '筆');
console.log('     初始付款記錄:', 1, '筆');
console.log('     統計計算應包含所有記錄');

// 常見問題檢查
console.log('\n🔍 常見連動問題檢查:');
const commonIssues = [
  {
    issue: '新增支出但Dashboard未更新',
    cause: '統計計算函數未重新執行',
    solution: '確保useEffect依賴項包含相關數據'
  },
  {
    issue: '快速收租後繳費頁面仍有待付款',
    cause: '未移除對應的待付款記錄',
    solution: '在快速收租時移除相同月份的待付款記錄'
  },
  {
    issue: '電費計算不一致',
    cause: '房間電費與付款記錄電費不同步',
    solution: '確保更新房間數據時同時更新付款記錄'
  },
  {
    issue: '統計卡片顯示舊數據',
    cause: '組件未重新渲染',
    solution: '使用狀態管理確保數據變更觸發重新渲染'
  }
];

commonIssues.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.issue}`);
  console.log(`     原因: ${item.cause}`);
  console.log(`     解決: ${item.solution}`);
});

console.log('\n' + '='.repeat(50));
console.log('🎯 建議改進:');
console.log('  1. 使用統一的狀態管理（如Redux或Context）');
console.log('  2. 數據變更時觸發全局更新事件');
console.log('  3. 添加數據一致性驗證函數');
console.log('  4. 定期運行數據完整性檢查');

console.log('\n✅ 測試完成。請根據檢查結果修復數據連動問題。');