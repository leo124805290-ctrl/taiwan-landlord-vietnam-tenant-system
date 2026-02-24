#!/bin/bash

echo "🔍 檢查 Vercel 部署更新狀態"
echo "================================"
echo "檢查時間: $(date)"
echo ""

URL="https://taiwan-landlord-vietnam-tenant-system-pisbk463x.vercel.app"

echo "🌐 測試網站可訪問性..."
if curl -s -I "$URL" | head -1 | grep -q "200\|301\|302"; then
    echo "  ✓ 網站可正常訪問"
else
    echo "  ✗ 網站無法訪問"
    exit 1
fi

echo ""
echo "🔎 檢查是否包含小喵相關內容..."
echo ""

# 下載首頁內容檢查
echo "正在檢查首頁內容..."
CONTENT=$(curl -s "$URL")

if echo "$CONTENT" | grep -q "歡迎小喵"; then
    echo "  ✅ 找到 '歡迎小喵' 內容"
else
    echo "  ❌ 未找到 '歡迎小喵' 內容"
    echo "  可能原因："
    echo "  1. 部署尚未完成"
    echo "  2. 瀏覽器快取問題"
    echo "  3. CDN 緩存尚未更新"
fi

if echo "$CONTENT" | grep -q "專為小喵設計"; then
    echo "  ✅ 找到 '專為小喵設計' 內容"
else
    echo "  ❌ 未找到 '專為小喵設計' 內容"
fi

if echo "$CONTENT" | grep -q "使用者: 小喵"; then
    echo "  ✅ 找到 '使用者: 小喵' 內容"
else
    echo "  ❌ 未找到 '使用者: 小喵' 內容"
fi

echo ""
echo "📊 部署狀態分析："
echo "  Git 提交時間: 07:15 UTC"
echo "  當前時間: $(date -u '+%H:%M UTC')"
echo "  已過時間: $(( ($(date +%s) - $(date -d "07:15 UTC" +%s)) / 60 )) 分鐘"
echo ""

echo "🔄 建議操作："
echo "  1. 清除瀏覽器快取 (Ctrl+Shift+Delete)"
echo "  2. 使用無痕模式訪問"
echo "  3. 等待 5-10 分鐘讓 CDN 緩存更新"
echo "  4. 訪問: $URL"
echo ""

echo "📞 如果還是沒看到："
echo "  1. 可能是 Vercel 部署還在進行中"
echo "  2. 或 CDN 緩存需要更長時間更新"
echo "  3. 可以嘗試手動觸發 Vercel 重新部署"