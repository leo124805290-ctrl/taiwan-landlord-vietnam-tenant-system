# 台灣房東越南租客管理系統 - 部署檢查清單

基於之前的部署經驗，此檢查清單確保 Vercel 部署一次成功。

## 部署前檢查（必須全部通過）

### ✅ 1. 本地構建測試
```bash
# 清理並重新安裝依賴
rm -rf .next node_modules
npm install

# 執行 TypeScript 檢查
npm run type-check

# 執行構建測試
npm run build

# 預期結果：構建成功，沒有錯誤
```

### ✅ 2. 專案配置檢查
- [ ] `package.json` 包含正確的依賴
- [ ] `tsconfig.json` 配置正確
- [ ] `next.config.js` 存在且配置正確
- [ ] `tailwind.config.js` 存在且配置正確
- [ ] `postcss.config.js` 存在且配置正確

### ✅ 3. Vercel 特定配置
- [ ] `vercel.json` 存在且包含：
  ```json
  {
    "installCommand": "npm ci --include=dev",
    "buildCommand": "npm run build"
  }
  ```
- [ ] `.npmrc` 存在且包含：
  ```
  production=false
  ```
- [ ] `.env.example` 提供完整的環境變數範例

### ✅ 4. 目錄結構檢查
- [ ] 沒有特殊字元目錄名稱（如 `app/{properties,...}`）
- [ ] 所有頁面目錄都有 `page.tsx` 檔案
- [ ] 沒有未使用的檔案或目錄

## GitHub 倉庫設定

### ✅ 1. 建立新倉庫
```bash
# 初始化 Git
git init
git add .
git commit -m "初始提交：台灣房東越南租客管理系統"

# 建立 GitHub 倉庫（透過網頁或 CLI）
# 然後連結遠端倉庫
git remote add origin https://github.com/your-username/taiwan-landlord-vietnam-tenant-system.git
git branch -M main
git push -u origin main
```

### ✅ 2. 倉庫設定檢查
- [ ] 倉庫設為公開（或私有根據需求）
- [ ] 包含完整的 README.md
- [ ] 包含 LICENSE 檔案（如果需要）
- [ ] 設定 .gitignore 正確

## Vercel 部署設定

### ✅ 1. 建立新專案
1. 登入 [Vercel](https://vercel.com)
2. 點擊 "New Project"
3. 匯入 GitHub 倉庫
4. 選擇倉庫：`taiwan-landlord-vietnam-tenant-system`

### ✅ 2. 專案配置
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`（自動偵測）
- **Output Directory**: `.next`（自動偵測）
- **Install Command**: `npm ci --include=dev`（重要！）

### ✅ 3. 環境變數設定
在 Vercel 專案設定中新增：
```
NODE_ENV = production
NEXT_PUBLIC_APP_NAME = 台灣房東越南租客管理系統
NEXT_PUBLIC_APP_URL = https://taiwan-landlord-vietnam-tenant-system.vercel.app
NEXT_PUBLIC_DEV_MODE = false
```

### ✅ 4. 部署區域設定
- 建議區域：`hkg1`（香港）或 `sin1`（新加坡）
- 台灣用戶訪問速度較快

## 部署執行

### ✅ 1. 觸發部署
- 推送程式碼到 GitHub main 分支
- Vercel 會自動偵測並開始部署
- 或在 Vercel 控制台手動點擊 "Deploy"

### ✅ 2. 監控部署過程
在 Vercel 部署日誌中檢查：
- [ ] 安裝依賴成功
- [ ] TypeScript 編譯成功
- [ ] Next.js 構建成功
- [ ] 部署完成（狀態：READY）

### ✅ 3. 部署後驗證
部署完成後立即測試：
- [ ] 主頁可訪問：`https://[專案名稱].vercel.app`
- [ ] 儀表板可訪問：`/dashboard`
- [ ] 所有主要功能頁面可訪問
- [ ] 沒有 404 錯誤
- [ ] 樣式正確載入

## 故障排除

### 🔧 1. 部署失敗：TypeScript 錯誤
**症狀**：構建失敗，TypeScript 編譯錯誤
**解決方案**：
```bash
# 本地修復 TypeScript 錯誤
npm run type-check
# 修正所有錯誤後重新提交
```

### 🔧 2. 部署失敗：依賴缺失
**症狀**：`Cannot find module` 錯誤
**解決方案**：
```bash
# 確保所有依賴在 package.json 中
npm install --save [缺失的套件]
# 提交 package.json 和 package-lock.json
```

### 🔧 3. 部署成功但頁面 404
**症狀**：部署成功但路由返回 404
**解決方案**：
1. 檢查 `next.config.js` 配置
2. 檢查頁面檔案命名（必須是 `page.tsx`）
3. 檢查目錄結構
4. 清除瀏覽器快取測試

### 🔧 4. 樣式未載入
**症狀**：頁面無樣式或 Tailwind CSS 未生效
**解決方案**：
1. 檢查 `tailwind.config.js` 配置
2. 檢查 `globals.css` 匯入
3. 檢查 PostCSS 配置

## 成功指標

### 🎯 部署成功標誌
- Vercel 部署狀態：✅ READY
- 所有測試路由返回 200
- 控制台沒有 JavaScript 錯誤
- 頁面載入時間 < 3秒
- 行動裝置響應正常

### 🎯 功能驗證清單
- [ ] 首頁顯示正確
- [ ] 導航功能正常
- [ ] 儀表板資料顯示
- [ ] 各管理頁面可訪問
- [ ] 響應式設計正常
- [ ] 沒有主控台錯誤

## 後續維護

### 📋 定期檢查
- 每月檢查依賴更新
- 每季測試部署流程
- 監控 Vercel 用量和限制

### 📋 備份策略
- 定期備份 GitHub 倉庫
- 匯出 Vercel 專案配置
- 記錄環境變數備份

### 📋 監控設定
- 設定 Vercel 監控告警
- 監控網站可用性
- 設定效能監控

---

**最後更新**：2026-02-20  
**基於經驗**：參考 DEPLOYMENT_LESSONS.md  
**目標**：確保 100% 部署成功率