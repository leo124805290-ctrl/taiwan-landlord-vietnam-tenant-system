#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'contexts/AppContext.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 修復所有 data: initialData 的地方
const fixes = [
  {
    search: 'const initialData = initData()\n            setState(prev => ({\n              ...prev,\n              data: initialData,',
    replace: 'const initialData = initData()\n            setState(prev => ({\n              ...prev,\n              data: normalizeAppData(initialData),'
  },
  {
    search: 'const initialData = initData()\n          setState(prev => ({\n            ...prev,\n            data: initialData,',
    replace: 'const initialData = initData()\n          setState(prev => ({\n            ...prev,\n            data: normalizeAppData(initialData),'
  },
  {
    search: 'const initialData = initData()\n        setState(prev => ({\n          ...prev,\n          data: initialData,',
    replace: 'const initialData = initData()\n        setState(prev => ({\n          ...prev,\n          data: normalizeAppData(initialData),'
  }
];

let modified = false;
fixes.forEach(({ search, replace }) => {
  if (content.includes(search)) {
    content = content.replace(search, replace);
    modified = true;
    console.log(`✅ 修復了一處 data: initialData`);
  }
});

if (modified) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('📝 AppContext.tsx 更新完成');
} else {
  console.log('⚠️ 未找到需要修復的 data: initialData');
}

// 檢查 updateData 函數中的 data 設置
if (content.includes('data: { ...prev.data, ...updates }')) {
  console.log('⚠️ 發現 updateData 函數中的 data 設置，需要檢查是否需要 normalize');
  // 這裡可能需要更複雜的修復，取決於 updateData 的邏輯
}