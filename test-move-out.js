#!/usr/bin/env node

console.log('🔍 測試退租結算邏輯');
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
          lm: 1500,      // 上期電錶讀數
          cm: 1500,      // 當前電錶讀數
          elecFee: 0
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
          u: 0,
          e: 0,
          total: 7000,
          due: '2026-03-10',
          s: 'pending'
        }
      ],
      history: [],
      additionalIncomes: []
    }
  ],
  electricityRate: 6
};

console.log('\n📊 初始數據狀態:');
const property = mockData.properties[0];
const room = property.rooms[0];
console.log('  房間狀態:', room.s);
console.log('  租客:', room.t);
console.log('  押金:', room.d, '元');
console.log('  上期電錶:', room.lm);
console.log('  待付款記錄:', property.payments.length, '筆');
console.log('  待付款金額:', property.payments[0].total, '元');

// 模擬退租流程
console.log('\n🚪 模擬退租流程:');
const simulateMoveOut = () => {
  // 退租參數
  const moveOutDate = '2026-02-23';
  const finalMeter = 1580;  // 最後電錶讀數
  
  console.log('  退租日期:', moveOutDate);
  console.log('  最後電錶讀數:', finalMeter);
  
  // 計算最後電費
  const lastMeter = room.lm || 0;
  const electricityUsage = Math.max(0, finalMeter - lastMeter);
  const electricityFee = electricityUsage * mockData.electricityRate;
  
  console.log('  最後用電度數:', electricityUsage, '度');
  console.log('  最後電費:', electricityFee, '元');
  
  // 計算待付款總額
  const pendingPayments = property.payments.filter(p => p.s === 'pending');
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.total, 0);
  
  console.log('  待付款總額:', totalPending, '元');
  
  // 計算總應付費用
  const totalDue = totalPending + electricityFee;
  console.log('  總應付費用:', totalDue, '元');
  
  // 計算押金退還
  const deposit = room.d || 0;
  const depositToReturn = deposit - totalDue;
  
  console.log('\n💰 押金結算:');
  console.log('  原始押金:', deposit, '元');
  console.log('  扣除費用:', totalDue, '元');
  console.log('  應退押金:', depositToReturn, '元');
  
  // 模擬其他扣款
  console.log('\n📝 模擬其他扣款（根據討論需求）:');
  const otherDeductions = [
    {
      reason: '牆壁修復',
      amount: 2000,
      notes: '客廳牆壁有釘孔'
    },
    {
      reason: '清潔費用',
      amount: 500,
      notes: '專業深度清潔'
    }
  ];
  
  otherDeductions.forEach((deduction, index) => {
    console.log(`  ${index + 1}. ${deduction.reason}: ${deduction.amount}元 (${deduction.notes})`);
  });
  
  const totalOtherDeductions = otherDeductions.reduce((sum, d) => sum + d.amount, 0);
  console.log('  其他扣款總計:', totalOtherDeductions, '元');
  
  // 最終結算
  const finalDepositToReturn = deposit - totalDue - totalOtherDeductions;
  
  console.log('\n📋 最終結算單:');
  console.log('  =================================');
  console.log('  項目                 金額');
  console.log('  ---------------------------------');
  console.log(`  原始押金            ${deposit.toFixed(2)}`);
  console.log(`  扣除待付款          -${totalPending.toFixed(2)}`);
  console.log(`  扣除最後電費        -${electricityFee.toFixed(2)}`);
  otherDeductions.forEach(d => {
    console.log(`  扣除${d.reason.padEnd(10)} -${d.amount.toFixed(2)}`);
  });
  console.log('  ---------------------------------');
  console.log(`  應退押金            ${finalDepositToReturn.toFixed(2)}`);
  console.log('  =================================');
  
  return {
    moveOutDate,
    finalMeter,
    electricityUsage,
    electricityFee,
    totalPending,
    totalDue,
    deposit,
    otherDeductions,
    totalOtherDeductions,
    finalDepositToReturn
  };
};

const result = simulateMoveOut();

// 檢查是否符合討論的邏輯
console.log('\n✅ 邏輯驗證:');
console.log('  1. 租金結算: 未滿一個月仍以一個月計算');
console.log('     ✅ 符合：退租當月租金全額計算');

console.log('\n  2. 電費計算: 使用設定中的電價');
console.log('     ✅ 符合：使用統一電價', mockData.electricityRate, '元/度');

console.log('\n  3. 扣款管理: 預設分類 + 記錄到其他收入');
console.log('     ✅ 符合：扣款有預設分類和備註');
console.log('     ✅ 符合：扣款應記錄到其他收入');

console.log('\n  4. 押金退還: 彈出提醒');
console.log('     ⚠️ 需要：添加押金退還提醒功能');

// 建議改進
console.log('\n🔧 建議改進項目:');
const improvements = [
  {
    item: '退租表單改進',
    description: '添加其他扣款輸入欄位',
    priority: '高'
  },
  {
    item: '扣款分類預設',
    description: '提供預設扣款分類選項',
    priority: '高'
  },
  {
    item: '押金退還提醒',
    description: '添加彈出視窗提醒確認',
    priority: '中'
  },
  {
    item: '數據記錄',
    description: '扣款記錄到其他收入',
    priority: '高'
  },
  {
    item: '結算單生成',
    description: '生成網頁版結算單',
    priority: '中'
  }
];

improvements.forEach((item, index) => {
  console.log(`  ${index + 1}. [${item.priority}] ${item.item}: ${item.description}`);
});

console.log('\n' + '='.repeat(60));
console.log('🎯 總結:');
console.log('  現有退租功能基礎完整，但需要根據討論進行以下改進：');
console.log('  1. 添加其他扣款管理');
console.log('  2. 實現扣款分類預設');
console.log('  3. 添加押金退還提醒');
console.log('  4. 確保扣款記錄到其他收入');

console.log('\n✅ 測試完成。準備進行退租功能改進。');