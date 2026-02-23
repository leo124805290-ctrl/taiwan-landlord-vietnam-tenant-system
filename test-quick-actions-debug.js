#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 診斷快速操作面板問題');
console.log('='.repeat(50));

// 1. 檢查當前物業狀態
console.log('\n📊 檢查樣本數據中的物業狀態:');
const utilsPath = path.join(__dirname, 'lib/utils.ts');
const utilsContent = fs.readFileSync(utilsPath, 'utf8');

// 提取樣本物業數據
const samplePropertyMatch = utilsContent.match(/const sampleProperty[^{]+\{([^}]+)\}/);
if (samplePropertyMatch) {
  console.log('✅ 找到樣本物業數據');
  
  // 檢查房間狀態
  const roomsMatch = utilsContent.match(/rooms:\s*\[(.*?)\]/s);
  if (roomsMatch) {
    const roomsText = roomsMatch[1];
    const occupiedRooms = (roomsText.match(/s:\s*'occupied'/g) || []).length;
    const vacantRooms = (roomsText.match(/s:\s*'vacant'/g) || []).length;
    
    console.log(`   🏠 房間狀態: ${occupiedRooms} 間已出租, ${vacantRooms} 間空房`);
    console.log(`   💡 快速收租/批量抄表需要至少 1 間已出租房間`);
  }
}

// 2. 檢查 QuickActionsPanel 組件
console.log('\n🎯 檢查 QuickActionsPanel 組件:');
const panelPath = path.join(__dirname, 'components/QuickActionsPanel.tsx');
const panelContent = fs.readFileSync(panelPath, 'utf8');

// 檢查啟用條件
const enabledConditions = panelContent.match(/enabled:\s*(.*?),/g);
if (enabledConditions) {
  console.log('✅ 找到啟用條件:');
  enabledConditions.forEach((condition, index) => {
    console.log(`   ${index + 1}. ${condition.trim()}`);
  });
}

// 3. 檢查 AppContext 中的 openModal
console.log('\n🔧 檢查 AppContext 中的 openModal 函數:');
const contextPath = path.join(__dirname, 'contexts/AppContext.tsx');
const contextContent = fs.readFileSync(contextPath, 'utf8');

const openModalMatch = contextContent.match(/const openModal = \(type: string, data\?: any\) => \{([^}]+)\}/);
if (openModalMatch) {
  console.log('✅ openModal 函數正確定義');
  console.log(`   函數內容: ${openModalMatch[1].trim().substring(0, 50)}...`);
} else {
  console.log('❌ 未找到 openModal 函數定義');
}

// 4. 檢查 Dashboard 中的使用
console.log('\n📱 檢查 Dashboard 中的使用:');
const dashboardPath = path.join(__dirname, 'components/Dashboard.tsx');
const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

const quickActionsUsage = dashboardContent.includes('<QuickActionsPanel />');
console.log(quickActionsUsage ? '✅ Dashboard 中包含 QuickActionsPanel' : '❌ Dashboard 中未找到 QuickActionsPanel');

// 5. 檢查 Modal 組件中的類型定義
console.log('\n🎭 檢查 Modal 組件中的模態類型:');
const modalPath = path.join(__dirname, 'components/Modal.tsx');
const modalContent = fs.readFileSync(modalPath, 'utf8');

const modalTypes = ['quickCollectRent', 'batchMeterReading'];
modalTypes.forEach(type => {
  const hasType = modalContent.includes(`case '${type}'`);
  console.log(`   ${hasType ? '✅' : '❌'} Modal 組件包含 '${type}' 類型`);
});

// 6. 常見問題檢查
console.log('\n🔍 常見問題檢查:');
console.log('   1. 是否選擇了物業？ - 需要選擇一個物業才能使用快速操作');
console.log('   2. 物業是否有已出租的房間？ - 快速收租/批量抄表需要已出租房間');
console.log('   3. 是否在 Dashboard 頁面？ - 快速操作面板只在 Dashboard 顯示');
console.log('   4. 控制台是否有錯誤？ - 檢查瀏覽器開發者工具控制台');

// 7. 解決方案
console.log('\n🚀 解決方案:');
console.log('   1. 確保已選擇一個物業（點擊左側物業列表）');
console.log('   2. 確保物業有已出租的房間');
console.log('   3. 如果沒有已出租房間，先添加房間並設置為已出租');
console.log('   4. 清除瀏覽器緩存並重新載入');
console.log('   5. 檢查瀏覽器控制台是否有 JavaScript 錯誤');

console.log('\n' + '='.repeat(50));
console.log('💡 診斷完成。請根據以上檢查結果解決問題。');