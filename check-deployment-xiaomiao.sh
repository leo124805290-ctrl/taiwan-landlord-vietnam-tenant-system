#!/bin/bash

echo "🐱 小喵專屬部署檢查腳本"
echo "================================"
echo "檢查時間: $(date)"
echo ""

# 檢查本地修改
echo "✅ 本地修改檢查："
if grep -q "歡迎小喵" app/page.tsx; then
    echo "  ✓ 首頁已添加小喵歡迎訊息"
else
    echo "  ✗ 首頁未找到小喵歡迎訊息"
fi

if grep -q "專為小喵設計" app/layout.tsx; then
    echo "  ✓ 頁尾已更新為小喵專屬"
else
    echo "  ✗ 頁尾未找到小喵專屬訊息"
fi

echo ""
echo "🔗 部署連結："
echo "  https://taiwan-landlord-vietnam-tenant-system-pisbk463x.vercel.app"
echo ""

echo "📋 部署後檢查清單："
echo "  1. 訪問上方連結"
echo "  2. 查看首頁是否有 '🐱 歡迎小喵使用本系統！'"
echo "  3. 查看頁尾是否有 '專為小喵設計的管理平台'"
echo "  4. 查看主標題下方是否有 '👋 專為小喵設計的管理平台'"
echo ""

echo "🔄 如果沒看到變更："
echo "  1. 清除瀏覽器快取 (Ctrl+Shift+Delete)"
echo "  2. 使用無痕模式訪問"
echo "  3. 等待 5-8 分鐘讓部署完成"
echo "  4. 使用 Ctrl+F5 強制重新整理"
echo ""

echo "⏰ 預計部署完成時間："
echo "  提交時間: 07:15 UTC"
echo "  預計完成: 07:20-07:23 UTC"
echo "  當前時間: $(date -u '+%H:%M UTC')"
echo ""

# 計算等待時間
current_epoch=$(date +%s)
target_epoch=$(date -d "07:23 UTC" +%s 2>/dev/null || date -v7H -v23M -v0S +%s)
if [ $current_epoch -lt $target_epoch ]; then
    remaining=$((target_epoch - current_epoch))
    minutes=$((remaining / 60))
    echo "⏳ 還需要等待約 ${minutes} 分鐘"
else
    echo "✅ 已超過預計完成時間，應該可以看到了！"
fi

echo ""
echo "📞 如果仍有問題，請提供："
echo "  1. 看到的畫面截圖"
echo "  2. 瀏覽器控制台錯誤訊息"
echo "  3. 具體哪個修改沒看到"