const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'lib/translations.ts');
const content = fs.readFileSync(filePath, 'utf8');

// 分割中文和越南文部分
const sections = content.split(/'vi-VN': {/);
const zhTWSection = sections[0];
const viVNSection = "'vi-VN': {" + sections[1];

// 移除重複鍵的函數
function removeDuplicateKeys(section) {
  const lines = section.split('\n');
  const seen = new Set();
  const result = [];
  
  for (const line of lines) {
    // 提取鍵名（在冒號之前的部分）
    const match = line.match(/^\s*([a-zA-Z]+):/);
    if (match) {
      const key = match[1];
      if (seen.has(key)) {
        continue; // 跳過重複的鍵
      }
      seen.add(key);
    }
    result.push(line);
  }
  
  return result.join('\n');
}

// 清理兩個部分
const cleanedZHTW = removeDuplicateKeys(zhTWSection);
const cleanedVIVN = removeDuplicateKeys(viVNSection);

// 合併結果
const finalContent = cleanedZHTW + cleanedVIVN;

// 寫回文件
fs.writeFileSync(filePath, finalContent);
console.log('已清理翻譯文件，移除了重複的鍵。');