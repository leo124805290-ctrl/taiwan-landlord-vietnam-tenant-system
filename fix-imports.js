// 批量修復導入路徑腳本
const fs = require('fs');
const path = require('path');

// 要處理的文件列表
const filesToFix = [
  'src/lib/api/client.ts',
  'src/lib/api/mockService.ts',
  'src/components/unified/RoomsSimple.tsx',
  'src/components/unified/RoomCard.tsx',
  'src/components/unified/RoomFilters.tsx',
  'src/components/unified/RoomActions.tsx',
  'src/lib/migration.ts',
  'app/debug/page.tsx'
];

// 路徑映射規則
const pathMappings = [
  // 從相對路徑改為 ~/ 別名
  { from: /from\s+['"]\.\.\/\.\.\/types\//g, to: "from '~/types/" },
  { from: /from\s+['"]\.\.\/\.\.\/lib\//g, to: "from '~/lib/" },
  { from: /from\s+['"]\.\.\/\.\.\/components\//g, to: "from '~/components/" },
  
  // 從 @/ 改為 ~/（針對 src 目錄）
  { from: /from\s+['"]@\/types\//g, to: "from '~/types/" },
  { from: /from\s+['"]@\/lib\//g, to: "from '~/lib/" },
  { from: /from\s+['"]@\/components\//g, to: "from '~/components/" },
  { from: /from\s+['"]@\/data\//g, to: "from '~/components/unified/" },
];

console.log('開始修復導入路徑...');

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(filePath => {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ 文件不存在: ${filePath}`);
      errorCount++;
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let originalContent = content;
    
    // 應用所有路徑映射
    pathMappings.forEach(mapping => {
      content = content.replace(mapping.from, mapping.to);
    });
    
    // 如果內容有變化，寫回文件
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ 已修復: ${filePath}`);
      fixedCount++;
    } else {
      console.log(`ℹ️  無需修改: ${filePath}`);
    }
    
  } catch (error) {
    console.log(`❌ 處理失敗 ${filePath}:`, error.message);
    errorCount++;
  }
});

console.log('\n=== 修復完成 ===');
console.log(`已修復文件: ${fixedCount}`);
console.log(`失敗文件: ${errorCount}`);
console.log(`總處理文件: ${filesToFix.length}`);

if (errorCount > 0) {
  console.log('\n⚠️  有文件處理失敗，請手動檢查');
  process.exit(1);
} else {
  console.log('\n✅ 所有文件修復成功');
  process.exit(0);
}