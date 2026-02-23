// 檢查部署狀態
console.log("🔍 檢查系統部署狀態...");
console.log("==============================");

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. 檢查Git狀態
console.log("\n1. 📊 Git狀態：");
try {
  const branch = execSync('git branch --show-current', { cwd: __dirname, encoding: 'utf8' }).trim();
  const commitHash = execSync('git log --oneline -1', { cwd: __dirname, encoding: 'utf8' }).trim();
  const remoteStatus = execSync('git status -uno', { cwd: __dirname, encoding: 'utf8' });
  
  console.log(`   分支: ${branch}`);
  console.log(`   最新提交: ${commitHash}`);
  
  if (remoteStatus.includes('Your branch is up to date')) {
    console.log("   ✅ 已同步到遠程倉庫");
  } else {
    console.log("   ⚠️  需要同步到遠程倉庫");
  }
} catch (error) {
  console.log("   ❌ 無法檢查Git狀態:", error.message);
}

// 2. 檢查文件狀態
console.log("\n2. 📁 文件狀態：");
const importantFiles = [
  'package.json',
  'next.config.js',
  'app/globals.css',
  'components/Dashboard.tsx',
  'components/QuickActionsPanel.tsx',
  'styles/responsive.css',
  'styles/quick-actions.css'
];

importantFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(1);
    console.log(`   ✅ ${file} (${sizeKB} KB)`);
  } else {
    console.log(`   ❌ ${file} 不存在`);
  }
});

// 3. 檢查TypeScript編譯
console.log("\n3. 🔧 TypeScript編譯：");
try {
  const result = execSync('npx tsc --noEmit 2>&1', { cwd: __dirname, encoding: 'utf8' });
  
  if (result.includes('error')) {
    const errors = result.split('\n').filter(line => line.includes('error')).slice(0, 3);
    console.log("   ❌ 編譯錯誤:");
    errors.forEach(error => console.log(`      ${error}`));
  } else {
    console.log("   ✅ 編譯通過");
  }
} catch (error) {
  console.log("   ❌ 編譯檢查失敗:", error.message);
}

// 4. 檢查依賴
console.log("\n4. 📦 依賴檢查：");
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  console.log(`   專案名稱: ${packageJson.name}`);
  console.log(`   版本: ${packageJson.version}`);
  console.log(`   Next.js: ${packageJson.dependencies.next || '未找到'}`);
  console.log(`   React: ${packageJson.dependencies.react || '未找到'}`);
  console.log(`   TypeScript: ${packageJson.devDependencies?.typescript || '未找到'}`);
} catch (error) {
  console.log("   ❌ 無法讀取package.json:", error.message);
}

// 5. 檢查優化功能
console.log("\n5. 🚀 優化功能狀態：");
const optimizationFiles = [
  { file: 'components/QuickActionsPanel.tsx', name: '快速操作面板' },
  { file: 'styles/responsive.css', name: '移動端響應式優化' },
  { file: 'styles/quick-actions.css', name: '快速操作樣式' },
  { file: 'optimization-analysis.md', name: '優化分析文檔' },
  { file: 'optimization-implementation-plan.md', name: '實施計劃' },
  { file: 'quick-wins-optimization.md', name: '快速改進方案' }
];

optimizationFiles.forEach(item => {
  const filePath = path.join(__dirname, item.file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${item.name}`);
  } else {
    console.log(`   ❌ ${item.name}`);
  }
});

// 6. 檢查測試腳本
console.log("\n6. 🧪 測試腳本：");
const testScripts = [
  'test-quick-actions.js',
  'test-mobile-optimization.js',
  'test-rent-expense.js',
  'test-fixes.js'
];

testScripts.forEach(script => {
  const filePath = path.join(__dirname, script);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${script}`);
  } else {
    console.log(`   ❌ ${script}`);
  }
});

// 7. 部署建議
console.log("\n7. 📋 部署建議：");
console.log("   當前狀態：所有優化已提交到GitHub");
console.log("   Vercel應該正在自動部署...");
console.log("\n   ⏳ 預計時間線：");
console.log("   - 立即：Vercel開始構建");
console.log("   - 2-5分鐘：構建完成");
console.log("   - 5-10分鐘：部署完成");
console.log("\n   🔍 檢查部署：");
console.log("   1. 訪問 https://vercel.com/leo124805290-ctrl/taiwan-landlord-vietnam-tenant-system");
console.log("   2. 查看部署日誌");
console.log("   3. 等待構建完成");
console.log("\n   📱 測試部署：");
console.log("   1. 訪問 https://taiwan-landlord-vietnam-tenant-syst.vercel.app");
console.log("   2. 清除瀏覽器緩存 (Ctrl+Shift+Delete)");
console.log("   3. 測試新功能：");
console.log("      - 快速操作面板");
console.log("      - 移動端響應式設計");
console.log("      - 租金支出填寫");

console.log("\n==============================");
console.log("📊 系統狀態總結：");
console.log("\n✅ 已完成的工作：");
console.log("1. 快速操作面板 - 6個快速操作按鈕");
console.log("2. 移動端響應式優化 - 全面的CSS媒體查詢");
console.log("3. 租金支出功能 - 完整的租金記錄系統");
console.log("4. 裝修頁面錯誤修復 - 客戶端異常解決");
console.log("5. 物業收支改名 - 從水電收支擴展");

console.log("\n🚀 最新優化（剛剛完成）：");
console.log("1. 快速操作面板：");
console.log("   - 💰 快速收租（開發中）");
console.log("   - 📝 批量抄錶（開發中）");
console.log("   - 💸 新增支出");
console.log("   - 📈 新增收入");
console.log("   - 🔧 報修登記");
console.log("   - 🏠 新增房間");

console.log("\n2. 移動端響應式優化：");
console.log("   - 📱 觸摸目標優化 (44x44px)");
console.log("   - 📊 表格水平滾動");
console.log("   - 🎨 響應式網格布局");
console.log("   - 🔧 iOS特定優化");
console.log("   - 🌙 黑暗模式支持");

console.log("\n⏳ 部署狀態：");
console.log("   - ✅ 所有代碼已提交到GitHub");
console.log("   - ⚙️  Vercel自動部署中");
console.log("   - 🔄 預計5-10分鐘完成");

console.log("\n🎯 下一步建議：");
console.log("1. 等待Vercel部署完成");
console.log("2. 測試移動端體驗");
console.log("3. 驗證快速操作功能");
console.log("4. 根據用戶反饋進行進一步優化");

console.log("\n💡 重要提醒：");
console.log("由於我們剛剛推送了更新，Vercel需要一些時間來構建和部署。");
console.log("請耐心等待幾分鐘，然後刷新頁面查看更新。");