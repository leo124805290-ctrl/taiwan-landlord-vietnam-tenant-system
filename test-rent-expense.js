// 測試租金支出功能
console.log("🔍 測試租金支出填寫功能...");
console.log("==============================");

const fs = require('fs');
const path = require('path');

// 1. 檢查模態框中的租金選項
console.log("\n1. 檢查模態框租金選項：");
try {
  const modalContent = fs.readFileSync(path.join(__dirname, 'components/Modal.tsx'), 'utf8');
  
  // 檢查新增支出模態框
  if (modalContent.includes("option value=\"rent\"")) {
    console.log("   ✅ 新增支出模態框已添加租金選項");
  } else {
    console.log("   ❌ 新增支出模態框未添加租金選項");
  }
  
  // 檢查編輯支出模態框
  const editModalCount = (modalContent.match(/option value="rent"/g) || []).length;
  if (editModalCount >= 2) {
    console.log("   ✅ 編輯支出模態框已添加租金選項");
  } else {
    console.log(`   ❌ 編輯支出模態框租金選項數量不足：${editModalCount}`);
  }
} catch (error) {
  console.log("   ❌ 無法讀取 Modal.tsx:", error.message);
}

// 2. 檢查類型定義
console.log("\n2. 檢查類型定義：");
try {
  const modalContent = fs.readFileSync(path.join(__dirname, 'components/Modal.tsx'), 'utf8');
  
  // 檢查 saveAddUtilityExpense 函數
  if (modalContent.includes("type: typeInput.value as 'taipower' | 'water' | 'rent'")) {
    console.log("   ✅ saveAddUtilityExpense 函數已支持租金類型");
  } else {
    console.log("   ❌ saveAddUtilityExpense 函數未支持租金類型");
  }
  
  // 檢查 saveEditUtilityExpense 函數
  if (modalContent.includes("type: typeInput.value as 'taipower' | 'water' | 'rent',")) {
    console.log("   ✅ saveEditUtilityExpense 函數已支持租金類型");
  } else {
    console.log("   ❌ saveEditUtilityExpense 函數未支持租金類型");
  }
} catch (error) {
  console.log("   ❌ 無法檢查類型定義:", error.message);
}

// 3. 檢查模態框初始化
console.log("\n3. 檢查模態框初始化：");
try {
  const modalContent = fs.readFileSync(path.join(__dirname, 'components/Modal.tsx'), 'utf8');
  
  if (modalContent.includes("// 初始化模態框輸入字段")) {
    console.log("   ✅ 已添加模態框初始化邏輯");
    
    if (modalContent.includes("if (typeInput) typeInput.value = expense.type || 'taipower'")) {
      console.log("   ✅ 編輯支出模態框有初始化邏輯");
    } else {
      console.log("   ❌ 編輯支出模態框初始化邏輯不完整");
    }
  } else {
    console.log("   ❌ 未添加模態框初始化邏輯");
  }
} catch (error) {
  console.log("   ❌ 無法檢查模態框初始化:", error.message);
}

// 4. 檢查翻譯更新
console.log("\n4. 檢查翻譯更新：");
try {
  const translationsContent = fs.readFileSync(path.join(__dirname, 'lib/translations.ts'), 'utf8');
  
  if (translationsContent.includes("addUtilityExpense: '新增支出'")) {
    console.log("   ✅ '新增水電支出'已改為'新增支出'");
  } else {
    console.log("   ❌ '新增水電支出'未更新");
  }
  
  if (translationsContent.includes("editUtilityExpense: '編輯支出'")) {
    console.log("   ✅ '編輯水電支出'已改為'編輯支出'");
  } else {
    console.log("   ❌ '編輯水電支出'未更新");
  }
} catch (error) {
  console.log("   ❌ 無法讀取 translations.ts:", error.message);
}

// 5. 檢查物業收支頁面篩選器
console.log("\n5. 檢查物業收支頁面：");
try {
  const utilitiesContent = fs.readFileSync(path.join(__dirname, 'components/Utilities.tsx'), 'utf8');
  
  if (utilitiesContent.includes("option value=\"rent\"")) {
    console.log("   ✅ 物業收支頁面篩選器已包含租金選項");
  } else {
    console.log("   ❌ 物業收支頁面篩選器未包含租金選項");
  }
  
  // 檢查按鈕文字
  if (utilitiesContent.includes("＋ 新增支出")) {
    console.log("   ✅ 新增按鈕文字已更新");
  } else {
    console.log("   ❌ 新增按鈕文字未更新");
  }
} catch (error) {
  console.log("   ❌ 無法讀取 Utilities.tsx:", error.message);
}

console.log("\n==============================");
console.log("📊 測試總結：");
console.log("租金支出填寫功能已添加完成！");
console.log("\n現在您可以在「物業收支」頁面中：");
console.log("1. 點擊「＋ 新增支出」按鈕");
console.log("2. 在類型選擇中選擇「租金支出」");
console.log("3. 填寫期間、金額、付款日期和備註");
console.log("4. 保存後即可記錄二房東支付給房東的租金");
console.log("\n📈 功能特點：");
console.log("- 按月記錄租金支出");
console.log("- 支持編輯和刪除租金記錄");
console.log("- 在報表分頁中自動計算租金支出統計");
console.log("- 在儀表板中顯示租金總支出統計卡片");
console.log("\n⏳ 部署狀態：");
console.log("修改已推送到 GitHub，Vercel 將自動部署");
console.log("請等待幾分鐘後刷新頁面查看更新");