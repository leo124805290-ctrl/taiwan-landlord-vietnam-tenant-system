#!/usr/bin/env node

/**
 * 數據結構驗證腳本
 * 用於檢查樣本數據與類型定義的一致性
 * 
 * 使用方法：
 * node scripts/validate-data-structure.js
 */

const fs = require('fs');
const path = require('path');

// 從類型定義文件中提取屬性
function extractPropertiesFromTypeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const properties = new Set();
  
  // 簡單的正則匹配提取屬性
  const propertyRegex = /(\w+)\??:\s*[^{};]+[;}]/g;
  let match;
  
  while ((match = propertyRegex.exec(content)) !== null) {
    const propertyName = match[1];
    properties.add(propertyName);
  }
  
  return properties;
}

// 從樣本數據文件中提取使用的屬性
function extractPropertiesFromSampleData(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const properties = new Set();
  
  // 匹配對象屬性（簡單實現）
  const propertyRegex = /(\w+)\s*:/g;
  let match;
  
  while ((match = propertyRegex.exec(content)) !== null) {
    const propertyName = match[1];
    properties.add(propertyName);
  }
  
  return properties;
}

// 比較兩個屬性集合
function compareProperties(typeProperties, dataProperties) {
  const missingInType = [];
  const missingInData = [];
  
  // 檢查數據中有但類型中沒有的屬性
  for (const prop of dataProperties) {
    if (!typeProperties.has(prop)) {
      missingInType.push(prop);
    }
  }
  
  // 檢查類型中有但數據中沒有的屬性（可選）
  for (const prop of typeProperties) {
    if (!dataProperties.has(prop)) {
      missingInData.push(prop);
    }
  }
  
  return { missingInType, missingInData };
}

// 主函數
function main() {
  console.log('🔍 開始數據結構驗證...\n');
  
  // 文件路徑
  const typeFiles = [
    'src/components/unified/RoomCard.tsx',
    'src/components/unified/RoomsSimple.tsx',
    'src/components/unified/sampleRooms.ts'
  ];
  
  const sampleDataFile = 'src/components/unified/sampleRooms.ts';
  
  try {
    // 從所有類型文件中提取屬性（取並集）
    const allTypeProperties = new Set();
    
    for (const typeFile of typeFiles) {
      const filePath = path.join(__dirname, '..', typeFile);
      if (fs.existsSync(filePath)) {
        const props = extractPropertiesFromTypeFile(filePath);
        props.forEach(prop => allTypeProperties.add(prop));
        console.log(`✅ 讀取類型文件: ${typeFile} (${props.size}個屬性)`);
      } else {
        console.log(`❌ 文件不存在: ${typeFile}`);
      }
    }
    
    // 從樣本數據中提取屬性
    const sampleDataPath = path.join(__dirname, '..', sampleDataFile);
    const dataProperties = extractPropertiesFromSampleData(sampleDataPath);
    console.log(`✅ 讀取樣本數據: ${sampleDataFile} (${dataProperties.size}個屬性)\n`);
    
    // 比較屬性
    const { missingInType, missingInData } = compareProperties(allTypeProperties, dataProperties);
    
    // 輸出結果
    if (missingInType.length === 0 && missingInData.length === 0) {
      console.log('🎉 數據結構完全一致！');
      process.exit(0);
    } else {
      if (missingInType.length > 0) {
        console.log('⚠️  類型定義中缺少以下屬性：');
        missingInType.forEach(prop => console.log(`  - ${prop}`));
        console.log('');
      }
      
      if (missingInData.length > 0) {
        console.log('ℹ️  樣本數據中缺少以下類型屬性：');
        missingInData.forEach(prop => console.log(`  - ${prop}`));
        console.log('');
      }
      
      console.log('💡 建議：');
      console.log('1. 在類型定義中添加缺失的屬性');
      console.log('2. 或者在樣本數據中移除未定義的屬性');
      console.log('3. 運行此腳本驗證修復結果\n');
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ 驗證過程中發生錯誤：', error.message);
    process.exit(1);
  }
}

// 執行主函數
if (require.main === module) {
  main();
}

module.exports = {
  extractPropertiesFromTypeFile,
  extractPropertiesFromSampleData,
  compareProperties
};