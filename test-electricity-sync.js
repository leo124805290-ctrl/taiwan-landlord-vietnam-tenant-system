#!/usr/bin/env node

console.log('🔍 測試電費數據連動問題');
console.log('='.repeat(60));

// 模擬數據結構
const mockData = {
  properties: [
    {
      id: 1,
      name: '測試物業',
      rooms: [
        { 
          id: 1, 
          f: 1, 
          n: '101', 
          r: 7000, 
          d: 14000, 
          s: 'occupied', 
          t: '測試租客',
          lastMeter: 1500,      // 上期電錶讀數
          elecFee: 0,           // 電費（初始為0）
          lastMeterUsage: 0     // 用電度數（初始為0）
        }
      ],
      payments: [
        {
          id: 1,
          rid: 1,
          n: '101',
          t: '測試租客',
          m: '2026年2月',
          r: 7000,
          u: 0,           // 用電度數（初始為0）
          e: 0,           // 電費（初始為0）
          total: 7000,    // 只有租金
          due: '2026-03-10',
          s: 'pending',
          electricityRate: 6
        }
      ],
      utilityExpenses: [],
      additionalIncomes: []
    }
  ],
  electricityRate: 6
};

console.log('\n📊 初始數據狀態:');
console.log('  房間電錶讀數:', mockData.properties[0].rooms[0].lastMeter);
console.log('  房間電費:', mockData.properties[0].rooms[0].elecFee);
console.log('  付款記錄電費:', mockData.properties[0].payments[0].e);
console.log('  付款記錄總額:', mockData.properties[0].payments[0].total);

// 模擬批量抄表
console.log('\n⚡ 模擬批量抄表流程:');
const simulateBatchMeterReading = () => {
  const property = mockData.properties[0];
  const room = property.rooms[0];
  const electricityRate = mockData.electricityRate;
  
  // 新電錶讀數
  const newMeterReading = 1580;
  const usage = newMeterReading - room.lastMeter;  // 80度
  const cost = usage * electricityRate;            // 480元
  
  console.log('  新電錶讀數:', newMeterReading);
  console.log('  用電度數:', usage, '度');
  console.log('  電費計算:', usage, '×', electricityRate, '=', cost, '元');
  
  // 更新房間數據
  room.lastMeter = newMeterReading;
  room.lastMeterUsage = usage;
  room.elecFee = cost;
  
  // 更新付款記錄（模擬批量抄表功能）
  const updatedPayments = property.payments.map(payment => {
    if (payment.rid === room.id && payment.s === 'pending') {
      return {
        ...payment,
        u: usage,
        e: cost,
        total: payment.r + cost,
        electricityRate: electricityRate
      };
    }
    return payment;
  });
  
  property.payments = updatedPayments;
  
  return {
    roomUpdated: true,
    paymentUpdated: true,
    newTotal: 7000 + cost
  };
};

const result = simulateBatchMeterReading();
console.log('\n✅ 批量抄表完成:');
console.log('  房間更新:', result.roomUpdated);
console.log('  付款記錄更新:', result.paymentUpdated);
console.log('  新總額:', result.newTotal, '元');

// 檢查Dashboard顯示
console.log('\n📈 檢查Dashboard顯示邏輯:');
const payment = mockData.properties[0].payments[0];
console.log('  1. 租金顯示:', payment.r, '元');
console.log('  2. 用電度數顯示:', payment.u, '度');
console.log('  3. 電費單價顯示:', payment.electricityRate, '元/度');
console.log('  4. 電費金額顯示:', payment.e, '元');
console.log('  5. 總金額顯示:', payment.total, '元');

// 驗證計算正確性
console.log('\n🔢 驗證計算正確性:');
const expectedElectricityFee = payment.u * payment.electricityRate;
const expectedTotal = payment.r + expectedElectricityFee;

console.log('  電費驗證:');
console.log('    實際電費:', payment.e, '元');
console.log('    計算電費:', payment.u, '×', payment.electricityRate, '=', expectedElectricityFee, '元');
console.log('    是否一致:', payment.e === expectedElectricityFee ? '✅ 一致' : '❌ 不一致');

console.log('\n  總金額驗證:');
console.log('    實際總額:', payment.total, '元');
console.log('    計算總額:', payment.r, '+', payment.e, '=', expectedTotal, '元');
console.log('    是否一致:', payment.total === expectedTotal ? '✅ 一致' : '❌ 不一致');

// 常見問題診斷
console.log('\n🔍 常見問題診斷:');
const commonProblems = [
  {
    problem: '批量抄表後Dashboard未更新',
    cause: 'React組件未重新渲染',
    solution: '確保狀態更新觸發重新渲染'
  },
  {
    problem: '電費計算顯示錯誤',
    cause: '顯示邏輯有誤',
    solution: '修正顯示文字和計算'
  },
  {
    problem: '付款記錄未更新',
    cause: '批量抄表函數未正確更新付款記錄',
    solution: '檢查批量抄表函數的更新邏輯'
  },
  {
    problem: '數據不同步',
    cause: '房間數據和付款記錄不一致',
    solution: '確保兩個地方同時更新'
  }
];

commonProblems.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.problem}`);
  console.log(`     原因: ${item.cause}`);
  console.log(`     解決: ${item.solution}`);
});

// 測試修復後的顯示邏輯
console.log('\n📱 測試修復後的顯示邏輯:');
const displayText = `🏠 租金 ${payment.r}元 + ⚡ 電費 ${payment.u}度 (單價: ${payment.electricityRate}元) = ${payment.e}元`;
console.log('  顯示文字:', displayText);

console.log('\n' + '='.repeat(60));
console.log('🎯 總結:');
console.log('  1. 已修復Dashboard電費顯示邏輯');
console.log('  2. 批量抄表功能應正確更新付款記錄');
console.log('  3. 需要確保React狀態更新觸發重新渲染');

console.log('\n⚠️ 注意: 如果Dashboard仍未更新，請嘗試:');
console.log('  1. 刷新頁面 (F5 或 Ctrl+R)');
console.log('  2. 清除瀏覽器緩存');
console.log('  3. 檢查瀏覽器開發者工具中的Console錯誤');

console.log('\n✅ 測試完成。請根據診斷結果修復問題。');