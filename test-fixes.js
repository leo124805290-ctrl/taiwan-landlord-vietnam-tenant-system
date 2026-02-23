// 測試修復的腳本
console.log("🔍 測試修復內容...");
console.log("======================");

// 檢查 Maintenance.tsx 中的函數定義順序
const fs = require('fs');
const path = require('path');

// 1. 檢查 Maintenance.tsx
console.log("\n1. 檢查 Maintenance.tsx 修復：");
try {
  const maintenanceContent = fs.readFileSync(path.join(__dirname, 'components/Maintenance.tsx'), 'utf8');
  
  // 檢查 getMaintenanceType 函數是否在 calculateMaintenanceStats 之前定義
  const getMaintenanceTypeIndex = maintenanceContent.indexOf('const getMaintenanceType = (maint: any): string => {');
  const calculateMaintenanceStatsIndex = maintenanceContent.indexOf('const calculateMaintenanceStats = () => {');
  
  if (getMaintenanceTypeIndex < calculateMaintenanceStatsIndex) {
    console.log("   ✅ getMaintenanceType 函數在 calculateMaintenanceStats 之前定義");
  } else {
    console.log("   ❌ getMaintenanceType 函數定義順序有問題");
  }
  
  // 檢查是否有重複的 getMaintenanceType 定義
  const getMaintenanceTypeCount = (maintenanceContent.match(/const getMaintenanceType = \(maint: any\): string => \{/g) || []).length;
  if (getMaintenanceTypeCount === 1) {
    console.log("   ✅ 沒有重複的 getMaintenanceType 函數定義");
  } else {
    console.log(`   ❌ 發現 ${getMaintenanceTypeCount} 個 getMaintenanceType 函數定義（應該只有1個）`);
  }
} catch (error) {
  console.log("   ❌ 無法讀取 Maintenance.tsx:", error.message);
}

// 2. 檢查翻譯更新
console.log("\n2. 檢查翻譯更新：");
try {
  const translationsContent = fs.readFileSync(path.join(__dirname, 'lib/translations.ts'), 'utf8');
  
  // 檢查中文翻譯
  if (translationsContent.includes("utilityExpenses: '物業收支'")) {
    console.log("   ✅ 中文翻譯已更新為 '物業收支'");
  } else {
    console.log("   ❌ 中文翻譯未更新");
  }
  
  // 檢查越南文翻譯
  if (translationsContent.includes("utilityExpenses: 'Thu chi tài sản'")) {
    console.log("   ✅ 越南文翻譯已更新為 'Thu chi tài sản'");
  } else {
    console.log("   ❌ 越南文翻譯未更新");
  }
  
  // 檢查物業租用成本翻譯
  if (translationsContent.includes("propertyRentalCost: '物業租用成本'")) {
    console.log("   ✅ 已添加物業租用成本中文翻譯");
  } else {
    console.log("   ❌ 未找到物業租用成本中文翻譯");
  }
} catch (error) {
  console.log("   ❌ 無法讀取 translations.ts:", error.message);
}

// 3. 檢查物業租用成本數據結構
console.log("\n3. 檢查物業租用成本數據結構：");
try {
  const typesContent = fs.readFileSync(path.join(__dirname, 'lib/types.ts'), 'utf8');
  
  if (typesContent.includes('propertyRentalCost?: {')) {
    console.log("   ✅ Property 接口已添加 propertyRentalCost 字段");
  } else {
    console.log("   ❌ Property 接口未添加 propertyRentalCost 字段");
  }
} catch (error) {
  console.log("   ❌ 無法讀取 types.ts:", error.message);
}

// 4. 檢查示例數據
console.log("\n4. 檢查示例數據：");
try {
  const utilsContent = fs.readFileSync(path.join(__dirname, 'lib/utils.ts'), 'utf8');
  
  // 檢查第一個物業的 propertyRentalCost
  if (utilsContent.includes('propertyRentalCost: {')) {
    console.log("   ✅ 示例物業已添加 propertyRentalCost 數據");
    
    // 檢查具體數據
    if (utilsContent.includes('monthlyRent: 50000')) {
      console.log("   ✅ 汐止大同路月租金設置為 50,000元");
    }
    if (utilsContent.includes('deposit: 100000')) {
      console.log("   ✅ 汐止大同路押金設置為 100,000元");
    }
  } else {
    console.log("   ❌ 示例物業未添加 propertyRentalCost 數據");
  }
} catch (error) {
  console.log("   ❌ 無法讀取 utils.ts:", error.message);
}

// 5. 檢查報表計算更新
console.log("\n5. 檢查報表計算更新：");
try {
  const reportsContent = fs.readFileSync(path.join(__dirname, 'components/Reports.tsx'), 'utf8');
  
  // 檢查 calculateUtilityStats 函數是否包含 propertyRentalCost
  if (reportsContent.includes('propertyRentalCost: 0')) {
    console.log("   ✅ calculateUtilityStats 函數已包含 propertyRentalCost");
  } else {
    console.log("   ❌ calculateUtilityStats 函數未包含 propertyRentalCost");
  }
  
  // 檢查支出分析是否顯示物業租用成本
  if (reportsContent.includes('propertyRentalCostDescription')) {
    console.log("   ✅ 支出分析已添加物業租用成本顯示");
  } else {
    console.log("   ❌ 支出分析未添加物業租用成本顯示");
  }
} catch (error) {
  console.log("   ❌ 無法讀取 Reports.tsx:", error.message);
}

// 6. 檢查儀表板更新
console.log("\n6. 檢查儀表板更新：");
try {
  const dashboardContent = fs.readFileSync(path.join(__dirname, 'components/Dashboard.tsx'), 'utf8');
  
  // 檢查網格布局
  if (dashboardContent.includes('grid-cols-6')) {
    console.log("   ✅ 儀表板網格布局已更新為 grid-cols-6");
  } else {
    console.log("   ❌ 儀表板網格布局未更新");
  }
  
  // 檢查租金支出卡片
  if (dashboardContent.includes('租金總支出')) {
    console.log("   ✅ 儀表板已添加租金總支出卡片");
  } else {
    console.log("   ❌ 儀表板未添加租金總支出卡片");
  }
  
  // 檢查物業租用成本卡片
  if (dashboardContent.includes('物業租用成本')) {
    console.log("   ✅ 儀表板已添加物業租用成本卡片");
  } else {
    console.log("   ❌ 儀表板未添加物業租用成本卡片");
  }
} catch (error) {
  console.log("   ❌ 無法讀取 Dashboard.tsx:", error.message);
}

console.log("\n======================");
console.log("📊 總結：");
console.log("修改已提交到 GitHub，Vercel 部署可能需要幾分鐘時間。");
console.log("請稍等幾分鐘後刷新頁面查看更新。");
console.log("\n如果仍然看不到更新，請檢查：");
console.log("1. Vercel 部署狀態：https://vercel.com/leo124805290-ctrl/taiwan-landlord-vietnam-tenant-system");
console.log("2. 清除瀏覽器緩存後重新載入");
console.log("3. 等待 5-10 分鐘讓 Vercel 完成部署");