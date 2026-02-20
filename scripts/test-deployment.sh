#!/bin/bash

# 台灣房東越南租客管理系統 - 部署測試腳本
# 基於之前的部署經驗，確保所有檢查通過

set -e  # 遇到錯誤時停止執行

echo "🚀 開始部署測試..."
echo "========================================"

# 檢查 Node.js 版本
echo "1. 檢查 Node.js 版本..."
NODE_VERSION=$(node --version)
echo "   Node.js 版本: $NODE_VERSION"
if [[ $NODE_VERSION != v20* ]]; then
    echo "   ⚠️  建議使用 Node.js 20 或更高版本"
fi

# 清理並重新安裝
echo "2. 清理並安裝依賴..."
rm -rf .next node_modules 2>/dev/null || true
npm install --legacy-peer-deps

# TypeScript 檢查
echo "3. 執行 TypeScript 檢查..."
npm run type-check

# 構建測試
echo "4. 執行生產構建測試..."
npm run build

# 檢查構建輸出
echo "5. 檢查構建輸出..."
if [ -d ".next" ]; then
    echo "   ✅ .next 目錄存在"
    BUILD_SIZE=$(du -sh .next | cut -f1)
    echo "   構建大小: $BUILD_SIZE"
else
    echo "   ❌ .next 目錄不存在，構建失敗"
    exit 1
fi

# 檢查必要檔案
echo "6. 檢查必要配置檔案..."
REQUIRED_FILES=("package.json" "tsconfig.json" "next.config.js" "tailwind.config.js" "vercel.json" ".npmrc")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file 存在"
    else
        echo "   ❌ $file 不存在"
        exit 1
    fi
done

# 檢查 Vercel 配置
echo "7. 檢查 Vercel 配置..."
if grep -q "npm ci --include=dev" vercel.json; then
    echo "   ✅ vercel.json 包含正確的 installCommand"
else
    echo "   ❌ vercel.json 缺少正確的 installCommand"
    exit 1
fi

if grep -q "production=false" .npmrc; then
    echo "   ✅ .npmrc 包含正確的生產設定"
else
    echo "   ❌ .npmrc 缺少 production=false"
    exit 1
fi

# 檢查環境變數範例
echo "8. 檢查環境變數配置..."
if [ -f ".env.example" ]; then
    ENV_VARS=$(grep -c "^NEXT_PUBLIC" .env.example || true)
    echo "   ✅ .env.example 存在，包含 $ENV_VARS 個環境變數"
else
    echo "   ⚠️  .env.example 不存在，建議建立"
fi

# 檢查頁面檔案
echo "9. 檢查頁面檔案..."
REQUIRED_PAGES=("app/page.tsx" "app/dashboard/page.tsx" "app/layout.tsx")
for page in "${REQUIRED_PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "   ✅ $page 存在"
    else
        echo "   ❌ $page 不存在"
        exit 1
    fi
done

# 總結
echo "========================================"
echo "🎉 所有測試通過！專案已準備好部署到 Vercel"
echo ""
echo "下一步："
echo "1. 將專案推送到 GitHub"
echo "2. 在 Vercel 建立新專案"
echo "3. 設定環境變數"
echo "4. 部署並測試"
echo ""
echo "詳細指引請參考 DEPLOYMENT_CHECKLIST.md"