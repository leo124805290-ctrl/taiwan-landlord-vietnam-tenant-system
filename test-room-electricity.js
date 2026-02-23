#!/usr/bin/env node

console.log('🔍 測試房間頁面電費顯示問題');
console.log('='.repeat(60));

// 模擬房間數據結構
const mockRoom = {
  id: 1,
  n: '101',
  f: 1,
  s: 'occupied',
  t: '測試租客',
  r: 7000,
  d: 14000,
  
  // 舊結構
  cm: 1500,  // 當前電錶
  pm: 1400,  // 上期電錶
  lm: 1400,  // 最後電錶（舊字段）
  
  // 新結構（批量抄表後更新）
  lastMeter: 1580,        // 上期電錶讀數
  lastMeterUsage: 80,     // 用電度數
  elecFee: 480,           // 電費金額
  lastMeterDate: '2026-02-23',
  lastMeterMonth: '2026年2月'
};

const electricityRate = 6;

console.log('\n📊 房間數據狀態:');
console.log('  房間:', mockRoom.n);
console.log('  狀態:', mockRoom.s);
console.log('  租客:', mockRoom.t);

console.log('\n⚡ 電費相關數據:');
console.log('  舊結構:');
console.log('    cm (當前電錶):', mockRoom.cm);
console.log('    pm (上期電錶):', mockRoom.pm);
console.log('    lm (最後電錶):', mockRoom.lm);

console.log('\n  新結構（批量抄表後）:');
console.log('    lastMeter:', mockRoom.lastMeter);
console.log('    lastMeterUsage:', mockRoom.lastMeterUsage);
console.log('    elecFee:', mockRoom.elecFee);
console.log('    lastMeterMonth:', mockRoom.lastMeterMonth);

// 測試房間頁面的計算邏輯
console.log('\n🧮 測試房間頁面計算邏輯:');

// 舊計算方式（問題所在）
const oldCalculation = () => {
  if (mockRoom.s === 'occupied') {
    return ((mockRoom.cm || 0) - (mockRoom.pm || 0)) * electricityRate;
  }
  return 0;
};

// 新計算方式（修復後）
const newCalculation = () => {
  let elecFee = 0;
  if (mockRoom.s === 'occupied') {
    if (mockRoom.elecFee !== undefined && mockRoom.elecFee !== null) {
      // 使用已計算的電費
      elecFee = mockRoom.elecFee;
    } else {
      // 使用舊公式計算
      elecFee = ((mockRoom.cm || 0) - (mockRoom.pm || 0)) * electricityRate;
    }
  }
  return elecFee;
};

const oldResult = oldCalculation();
const newResult = newCalculation();

console.log('  舊計算方式結果:', oldResult, '元');
console.log('  新計算方式結果:', newResult, '元');
console.log('  差異:', newResult - oldResult, '元');
console.log('  正確電費應為:', mockRoom.elecFee, '元');

// 測試用電度數計算
console.log('\n📈 測試用電度數計算:');
const oldUsage = Math.max(0, (mockRoom.cm || 0) - (mockRoom.pm || 0));
const newUsage = mockRoom.lastMeterUsage || oldUsage;

console.log('  舊計算用電度數:', oldUsage, '度');
console.log('  新計算用電度數:', newUsage, '度');
console.log('  實際用電度數:', mockRoom.lastMeterUsage, '度');

// 驗證計算正確性
console.log('\n✅ 驗證計算正確性:');
console.log('  1. 電費計算驗證:');
console.log('    新結構電費:', mockRoom.elecFee, '元');
console.log('    計算驗證:', mockRoom.lastMeterUsage, '度 ×', electricityRate, '元/度 =', mockRoom.lastMeterUsage * electricityRate, '元');
console.log('    是否一致:', mockRoom.elecFee === mockRoom.lastMeterUsage * electricityRate ? '✅ 一致' : '❌ 不一致');

console.log('\n  2. 用電度數驗證:');
const expectedUsage = mockRoom.lastMeter - (mockRoom.lm || mockRoom.pm || 0);
console.log('    新結構用電度數:', mockRoom.lastMeterUsage, '度');
console.log('    計算驗證:', mockRoom.lastMeter, '-', (mockRoom.lm || mockRoom.pm || 0), '=', expectedUsage, '度');
console.log('    是否一致:', mockRoom.lastMeterUsage === expectedUsage ? '✅ 一致' : '❌ 不一致');

// 問題診斷
console.log('\n🔍 問題診斷:');
const problems = [
  {
    problem: '房間頁面電費沒有更新',
    cause: '使用舊計算公式 ((cm - pm) × rate)，而不是 elecFee 字段',
    solution: '修改計算邏輯，優先使用 elecFee 字段'
  },
  {
    problem: '數據不同步',
    cause: '批量抄表更新了新結構，但頁面使用舊結構',
    solution: '確保所有頁面使用統一的數據結構'
  },
  {
    problem: '頁面未重新渲染',
    cause: 'React狀態更新後頁面未重新渲染',
    solution: '確保狀態更新觸發重新渲染，或強制刷新頁面'
  }
];

problems.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.problem}`);
  console.log(`     原因: ${item.cause}`);
  console.log(`     解決: ${item.solution}`);
});

// 測試修復後的顯示
console.log('\n📱 測試修復後的顯示:');
console.log('  電費顯示:', formatCurrency(newResult), '元');
console.log('  用電度數顯示:', newUsage, '度');
console.log('  電價顯示:', electricityRate, '元/度');
if (mockRoom.lastMeterMonth) {
  console.log('  月份顯示:', mockRoom.lastMeterMonth);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    minimumFractionDigits: 0
  }).format(amount);
}

console.log('\n' + '='.repeat(60));
console.log('🎯 總結:');
console.log('  問題根源：房間頁面使用舊的電費計算公式');
console.log('  解決方案：已修改為優先使用 elecFee 字段');
console.log('  預期效果：批量抄表後房間頁面應顯示正確電費');

console.log('\n⚠️ 注意: 如果頁面仍未更新，請嘗試:');
console.log('  1. 刷新頁面 (F5 或 Ctrl+R)');
console.log('  2. 清除瀏覽器緩存');
console.log('  3. 檢查瀏覽器開發者工具中的Console錯誤');

console.log('\n✅ 測試完成。請部署修復後測試效果。');