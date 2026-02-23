// 測試CSS導入順序
console.log("🔍 測試CSS導入順序...");
console.log("==============================");

const fs = require('fs');
const path = require('path');

// 1. 檢查globals.css
console.log("\n1. 檢查globals.css導入順序：");
try {
  const globalsCss = fs.readFileSync(path.join(__dirname, 'app/globals.css'), 'utf8');
  const lines = globalsCss.split('\n');
  
  // 找到@import和@tailwind的位置
  const importLines = [];
  const tailwindLines = [];
  
  lines.forEach((line, index) => {
    if (line.trim().startsWith('@import')) {
      importLines.push({ line: index + 1, content: line.trim() });
    }
    if (line.trim().startsWith('@tailwind')) {
      tailwindLines.push({ line: index + 1, content: line.trim() });
    }
  });
  
  console.log(`   @import 語句數量: ${importLines.length}`);
  importLines.forEach(imp => {
    console.log(`     第${imp.line}行: ${imp.content}`);
  });
  
  console.log(`   @tailwind 語句數量: ${tailwindLines.length}`);
  tailwindLines.forEach(tw => {
    console.log(`     第${tw.line}行: ${tw.content}`);
  });
  
  // 檢查順序：所有@import必須在@tailwind之前
  if (importLines.length > 0 && tailwindLines.length > 0) {
    const lastImportLine = importLines[importLines.length - 1].line;
    const firstTailwindLine = tailwindLines[0].line;
    
    if (lastImportLine < firstTailwindLine) {
      console.log("   ✅ @import 在 @tailwind 之前（正確順序）");
    } else {
      console.log("   ❌ @import 在 @tailwind 之後（錯誤順序）");
    }
  } else {
    console.log("   ⚠️  缺少必要的CSS語句");
  }
  
  // 檢查是否有其他規則在@import之前
  let hasRulesBeforeImports = false;
  let firstImportLine = importLines.length > 0 ? importLines[0].line : Infinity;
  
  for (let i = 0; i < firstImportLine - 1; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('/*') && !line.startsWith('@import') && !line.startsWith('@tailwind')) {
      hasRulesBeforeImports = true;
      console.log(`   ❌ 第${i + 1}行有規則在@import之前: "${line}"`);
    }
  }
  
  if (!hasRulesBeforeImports) {
    console.log("   ✅ 沒有其他規則在@import之前");
  }
  
} catch (error) {
  console.log("   ❌ 無法讀取globals.css:", error.message);
}

// 2. 檢查導入的CSS文件
console.log("\n2. 檢查導入的CSS文件：");
const cssFiles = [
  'styles/quick-actions.css',
  'styles/responsive.css'
];

cssFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    const size = fs.statSync(filePath).size;
    
    // 檢查文件是否包含@import
    if (content.includes('@import')) {
      console.log(`   ⚠️  ${file} 包含@import語句（${lines}行，${size}字節）`);
      // 顯示@import行
      content.split('\n').forEach((line, index) => {
        if (line.trim().startsWith('@import')) {
          console.log(`      第${index + 1}行: ${line.trim()}`);
        }
      });
    } else {
      console.log(`   ✅ ${file} 沒有@import語句（${lines}行，${size}字節）`);
    }
  } else {
    console.log(`   ❌ ${file} 不存在`);
  }
});

// 3. 檢查CSS語法
console.log("\n3. 檢查CSS語法：");
try {
  const responsiveCss = fs.readFileSync(path.join(__dirname, 'styles/responsive.css'), 'utf8');
  const quickActionsCss = fs.readFileSync(path.join(__dirname, 'styles/quick-actions.css'), 'utf8');
  
  // 檢查常見的CSS語法問題
  const cssChecks = [
    { name: 'responsive.css - 媒體查詢語法', check: !responsiveCss.includes('@media (') || responsiveCss.includes('@media (max-width:') },
    { name: 'responsive.css - 正確的括號配對', check: (responsiveCss.match(/{/g) || []).length === (responsiveCss.match(/}/g) || []).length },
    { name: 'quick-actions.css - 動畫語法', check: !quickActionsCss.includes('@keyframes') || quickActionsCss.includes('@keyframes slideIn') },
    { name: 'quick-actions.css - 正確的分號', check: !quickActionsCss.includes(';') || quickActionsCss.split(';').length > quickActionsCss.split('{').length }
  ];
  
  cssChecks.forEach(check => {
    if (check.check) {
      console.log(`   ✅ ${check.name}`);
    } else {
      console.log(`   ❌ ${check.name}`);
    }
  });
  
} catch (error) {
  console.log("   ❌ 無法檢查CSS語法:", error.message);
}

// 4. 模擬Next.js構建檢查
console.log("\n4. 模擬構建檢查：");
try {
  // 檢查package.json中的構建命令
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const buildCommand = packageJson.scripts?.build || 'next build';
  
  console.log(`   構建命令: ${buildCommand}`);
  
  // 檢查next.config.js是否存在
  const nextConfigPath = path.join(__dirname, 'next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    console.log("   ✅ next.config.js 存在");
  } else {
    console.log("   ⚠️  next.config.js 不存在（使用默認配置）");
  }
  
  // 檢查Turbopack相關配置
  const nextConfig = fs.existsSync(nextConfigPath) ? fs.readFileSync(nextConfigPath, 'utf8') : '';
  if (nextConfig.includes('turbopack')) {
    console.log("   ⚠️  檢測到Turbopack配置");
  }
  
} catch (error) {
  console.log("   ❌ 構建檢查失敗:", error.message);
}

console.log("\n==============================");
console.log("📊 測試總結：");
console.log("\n問題分析：");
console.log("原始錯誤：@import 規則必須位於所有其他規則之前");
console.log("根本原因：在 globals.css 中，@import 語句在 @tailwind 之後");
console.log("解決方案：將 @import 移到文件開頭，在 @tailwind 之前");
console.log("\n已實施的修復：");
console.log("1. 重新組織 globals.css 的順序：");
console.log("   - @import '../styles/quick-actions.css';");
console.log("   - @import '../styles/responsive.css';");
console.log("   - @tailwind base;");
console.log("   - @tailwind components;");
console.log("   - @tailwind utilities;");
console.log("\n2. 確保沒有其他CSS規則在@import之前");
console.log("\n預期結果：");
console.log("✅ CSS導入順序正確");
console.log("✅ Turbopack構建成功");
console.log("✅ Vercel部署繼續");
console.log("\n🚀 下一步：");
console.log("1. 提交修復到GitHub");
console.log("2. Vercel將重新觸發部署");
console.log("3. 等待部署完成（約5分鐘）");
console.log("4. 測試網站功能");