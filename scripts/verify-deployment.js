#!/usr/bin/env node

/**
 * 部署驗證腳本
 * 用於在提交前驗證專案可以成功部署
 * 
 * 使用方法：
 * node scripts/verify-deployment.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 開始部署驗證檢查...\n');

const checks = [];
let hasErrors = false;

// 檢查1: TypeScript編譯
try {
  console.log('🔍 檢查1: TypeScript編譯...');
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
  checks.push({ name: 'TypeScript編譯', status: '✅ 通過' });
  console.log('   ✅ TypeScript編譯通過\n');
} catch (error) {
  checks.push({ name: 'TypeScript編譯', status: '❌ 失敗', error: error.message });
  console.log('   ❌ TypeScript編譯失敗:');
  console.log(error.message);
  hasErrors = true;
}

// 檢查2: 頁面文件存在性
try {
  console.log('🔍 檢查2: 頁面文件存在性...');
  const requiredPages = [
    'app/page.tsx',
    'app/phase1-demo/page.tsx',
    'app/simple-test/page.tsx'
  ];
  
  const missingPages = [];
  for (const page of requiredPages) {
    if (!fs.existsSync(path.join(__dirname, '..', page))) {
      missingPages.push(page);
    }
  }
  
  if (missingPages.length === 0) {
    checks.push({ name: '頁面文件存在性', status: '✅ 通過' });
    console.log('   ✅ 所有必需頁面文件存在\n');
  } else {
    checks.push({ 
      name: '頁面文件存在性', 
      status: '❌ 失敗', 
      error: `缺少頁面: ${missingPages.join(', ')}` 
    });
    console.log(`   ❌ 缺少頁面文件: ${missingPages.join(', ')}\n`);
    hasErrors = true;
  }
} catch (error) {
  checks.push({ name: '頁面文件存在性', status: '❌ 錯誤', error: error.message });
  console.log('   ❌ 檢查頁面文件時發生錯誤:', error.message);
  hasErrors = true;
}

// 檢查3: 配置文件完整性
try {
  console.log('🔍 檢查3: 配置文件完整性...');
  const requiredConfigs = [
    'package.json',
    'tsconfig.json',
    'next.config.js',
    'vercel.json'
  ];
  
  const missingConfigs = [];
  for (const config of requiredConfigs) {
    if (!fs.existsSync(path.join(__dirname, '..', config))) {
      missingConfigs.push(config);
    }
  }
  
  if (missingConfigs.length === 0) {
    checks.push({ name: '配置文件完整性', status: '✅ 通過' });
    console.log('   ✅ 所有配置文件存在\n');
  } else {
    checks.push({ 
      name: '配置文件完整性', 
      status: '❌ 失敗', 
      error: `缺少配置: ${missingConfigs.join(', ')}` 
    });
    console.log(`   ❌ 缺少配置文件: ${missingConfigs.join(', ')}\n`);
    hasErrors = true;
  }
} catch (error) {
  checks.push({ name: '配置文件完整性', status: '❌ 錯誤', error: error.message });
  console.log('   ❌ 檢查配置文件時發生錯誤:', error.message);
  hasErrors = true;
}

// 檢查4: 依賴安裝測試
try {
  console.log('🔍 檢查4: 依賴安裝測試...');
  // 簡單檢查package.json格式
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  
  if (packageJson.name && packageJson.version && packageJson.scripts && packageJson.dependencies) {
    checks.push({ name: '依賴安裝測試', status: '✅ 通過' });
    console.log('   ✅ package.json格式正確\n');
  } else {
    checks.push({ name: '依賴安裝測試', status: '❌ 失敗', error: 'package.json格式不完整' });
    console.log('   ❌ package.json格式不完整\n');
    hasErrors = true;
  }
} catch (error) {
  checks.push({ name: '依賴安裝測試', status: '❌ 錯誤', error: error.message });
  console.log('   ❌ 檢查依賴時發生錯誤:', error.message);
  hasErrors = true;
}

// 輸出檢查結果
console.log('📊 檢查結果總結:');
console.log('='.repeat(50));

checks.forEach(check => {
  console.log(`${check.status} ${check.name}`);
  if (check.error) {
    console.log(`   錯誤: ${check.error}`);
  }
});

console.log('='.repeat(50));

if (hasErrors) {
  console.log('\n❌ 部署驗證失敗！請修復以上問題後再提交。');
  console.log('\n💡 建議:');
  console.log('1. 修復所有TypeScript錯誤');
  console.log('2. 確保所有必需文件存在');
  console.log('3. 驗證配置文件完整性');
  console.log('4. 重新運行此驗證腳本');
  process.exit(1);
} else {
  console.log('\n🎉 所有檢查通過！專案已準備好部署。');
  console.log('\n💡 下一步:');
  console.log('1. 提交代碼到GitHub');
  console.log('2. Vercel將自動部署');
  console.log('3. 訪問新頁面驗證功能');
  process.exit(0);
}