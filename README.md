# 台灣房東越南租客管理系統

專為台灣房東管理越南租客設計的現代化管理平台，提供完整的物業管理解決方案。

## 系統特色

### 🏠 房產管理
- 多房產集中管理
- 詳細房產資訊記錄
- 照片和文件管理
- 地理位置標記

### 👥 越南租客管理
- 租客基本資料管理
- 簽證和工作許可追蹤
- 聯絡資訊和緊急聯絡人
- 租約歷史記錄

### 💰 租金管理
- 自動租金計算
- 收款記錄和發票
- 逾期提醒和罰款計算
- 多種付款方式支援

### 🔧 維修管理
- 線上報修系統
- 維修進度追蹤
- 費用記錄和分攤
- 供應商管理

### 📊 報表分析
- 財務報表自動產生
- 入住率和收入分析
- 趨勢圖表和預測
- 匯出功能（PDF/Excel）

## 技術架構

### 前端技術
- **Next.js 16** - React 框架
- **TypeScript** - 類型安全
- **Tailwind CSS** - 現代化 CSS 框架
- **React Hooks** - 狀態管理
- **Lucide React** - 圖標庫

### 開發工具
- **ESLint** - 程式碼檢查
- **Prettier** - 程式碼格式化
- **Git** - 版本控制
- **Vercel** - 部署平台

## 快速開始

### 環境需求
- Node.js 20.0.0 或更高版本
- npm 或 yarn

### 安裝步驟

1. **克隆專案**
   ```bash
   git clone https://github.com/your-username/taiwan-landlord-vietnam-tenant-system.git
   cd taiwan-landlord-vietnam-tenant-system
   ```

2. **安裝依賴**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **環境變數設定**
   ```bash
   cp .env.example .env.local
   # 編輯 .env.local 設定您的環境變數
   ```

4. **啟動開發伺服器**
   ```bash
   npm run dev
   # 或
   yarn dev
   ```

5. **開啟瀏覽器**
   訪問 http://localhost:3000

### 開發指令

```bash
# 開發模式
npm run dev

# 生產構建
npm run build

# 啟動生產伺服器
npm start

# 程式碼檢查
npm run lint

# TypeScript 類型檢查
npm run type-check
```

## 部署到 Vercel

### 自動部署
1. 將專案推送到 GitHub
2. 登入 [Vercel](https://vercel.com)
3. 點擊 "New Project"
4. 匯入您的 GitHub 倉庫
5. 設定環境變數（參考 `.env.example`）
6. 點擊 "Deploy"

### 手動部署
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 登入 Vercel
vercel login

# 部署
vercel

# 生產部署
vercel --prod
```

## 專案結構

```
taiwan-landlord-vietnam-tenant-system/
├── app/                    # Next.js 13+ App Router
│   ├── dashboard/         # 儀表板頁面
│   ├── properties/        # 房產管理
│   ├── tenants/          # 租客管理
│   ├── payments/         # 租金管理
│   ├── maintenance/      # 維修管理
│   ├── reports/         # 報表分析
│   ├── auth/            # 身份驗證
│   ├── api/             # API 路由
│   ├── layout.tsx       # 根佈局
│   ├── page.tsx         # 首頁
│   └── globals.css      # 全域樣式
├── components/           # 可重用元件
├── lib/                 # 工具函數和配置
├── utils/               # 工具函數
├── public/              # 靜態資源
└── package.json         # 依賴管理
```

## 環境變數

### 必要變數
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 開發變數
```env
NEXT_PUBLIC_DEV_MODE=true
NEXT_PUBLIC_ENABLE_DEMO_DATA=true
```

## 開發指南

### 新增頁面
1. 在 `app/` 目錄下建立新資料夾
2. 建立 `page.tsx` 檔案
3. 匯出預設的 React 元件

### 新增元件
1. 在 `components/` 目錄下建立新檔案
2. 使用 TypeScript 和 Tailwind CSS
3. 確保元件可重用和可測試

### 樣式規範
- 使用 Tailwind CSS 工具類
- 遵循響應式設計原則
- 保持一致的設計系統

## 故障排除

### 常見問題

1. **TypeScript 錯誤**
   ```bash
   npm run type-check
   ```

2. **構建失敗**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

3. **Vercel 部署失敗**
   - 檢查環境變數設定
   - 確認 `vercel.json` 配置正確
   - 查看 Vercel 部署日誌

### 部署檢查清單
- [ ] 本地 `npm run build` 成功
- [ ] TypeScript 沒有錯誤
- [ ] 環境變數已設定
- [ ] Vercel 專案連結正確

## 貢獻指南

1. Fork 專案
2. 建立功能分支
3. 提交更改
4. 推送到分支
5. 建立 Pull Request

## 授權

MIT License - 詳見 LICENSE 檔案

## 聯絡資訊

如有問題或建議，請透過以下方式聯絡：
- GitHub Issues
- 電子郵件：support@landlord-system.com

---

**最後更新**：2026-02-20  
**版本**：1.0.0  
**狀態**：開發中// Trigger Vercel deployment
