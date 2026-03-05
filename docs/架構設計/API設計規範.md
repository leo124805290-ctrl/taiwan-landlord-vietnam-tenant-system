# API設計規範 - 簡化套房出租管理系統

## 設計原則
1. **RESTful風格**：資源導向，HTTP方法語義化
2. **簡單直觀**：接口命名清晰，參數明確
3. **類型安全**：使用TypeScript確保類型安全
4. **錯誤處理**：統一的錯誤響應格式
5. **版本控制**：支持API版本升級

## 基礎約定

### 1. 響應格式
```typescript
interface ApiResponse<T> {
  success: boolean;      // 請求是否成功
  data?: T;             // 成功時的數據
  error?: {             // 失敗時的錯誤信息
    code: string;       // 錯誤代碼
    message: string;    // 錯誤描述
    details?: any;      // 詳細錯誤信息
  };
  timestamp: string;    // 響應時間戳
}
```

### 2. 分頁響應
```typescript
interface PaginatedResponse<T> {
  items: T[];           // 當前頁數據
  total: number;        // 總數據量
  page: number;         // 當前頁碼
  pageSize: number;     // 每頁數量
  totalPages: number;   // 總頁數
}
```

### 3. 錯誤代碼規範
| 錯誤碼 | 說明 | HTTP狀態碼 |
|--------|------|-----------|
| `VALIDATION_ERROR` | 參數驗證失敗 | 400 |
| `NOT_FOUND` | 資源不存在 | 404 |
| `UNAUTHORIZED` | 未授權 | 401 |
| `FORBIDDEN` | 禁止訪問 | 403 |
| `CONFLICT` | 資源衝突 | 409 |
| `INTERNAL_ERROR` | 伺服器內部錯誤 | 500 |

## API端點設計

### 房間管理 API

#### 1. 獲取房間列表
```
GET /api/rooms
```

**查詢參數**：
- `page` (可選): 頁碼，默認1
- `pageSize` (可選): 每頁數量，默認20
- `status` (可選): 過濾狀態 (available/occupied/maintenance)
- `propertyId` (可選): 物業ID
- `search` (可選): 搜索關鍵字（房號、租客姓名）

**響應**：
```typescript
ApiResponse<PaginatedResponse<SimpleRoom>>
```

#### 2. 獲取單個房間
```
GET /api/rooms/:roomId
```

**響應**：
```typescript
ApiResponse<SimpleRoom>
```

#### 3. 創建房間
```
POST /api/rooms
```

**請求體**：
```typescript
{
  propertyId: string;
  number: string;
  floor: number;
  monthlyRent: number;
  deposit: number;
  notes?: string;
}
```

**響應**：
```typescript
ApiResponse<SimpleRoom>
```

#### 4. 更新房間
```
PUT /api/rooms/:roomId
```

**請求體**：
```typescript
{
  number?: string;
  floor?: number;
  monthlyRent?: number;
  deposit?: number;
  status?: SimpleRoomStatus;
  notes?: string;
}
```

**響應**：
```typescript
ApiResponse<SimpleRoom>
```

#### 5. 刪除房間
```
DELETE /api/rooms/:roomId
```

**響應**：
```typescript
ApiResponse<{ deleted: boolean }>
```

#### 6. 入住操作
```
POST /api/rooms/:roomId/check-in
```

**請求體**：
```typescript
{
  tenantName: string;
  tenantPhone: string;
  checkInDate: string;    // YYYY-MM-DD
  checkOutDate: string;   // YYYY-MM-DD
  initialMeter?: number;  // 初始電錶讀數
  notes?: string;
}
```

**響應**：
```typescript
ApiResponse<{
  room: SimpleRoom;
  payment?: SimplePayment;  // 自動生成的押金付款記錄
}>
```

#### 7. 退房操作
```
POST /api/rooms/:roomId/check-out
```

**請求體**：
```typescript
{
  finalMeter: number;     // 最後電錶讀數
  checkOutDate: string;   // YYYY-MM-DD
  notes?: string;
}
```

**響應**：
```typescript
ApiResponse<{
  room: SimpleRoom;
  finalPayment?: SimplePayment;  // 最後電費付款記錄
  depositRefund?: number;        // 應退押金
}>
```

#### 8. 設為維修
```
POST /api/rooms/:roomId/maintenance
```

**請求體**：
```typescript
{
  reason?: string;  // 維修原因
  estimatedDays?: number;  // 預計維修天數
}
```

**響應**：
```typescript
ApiResponse<SimpleRoom>
```

### 付款管理 API

#### 1. 獲取付款記錄
```
GET /api/payments
```

**查詢參數**：
- `roomId` (可選): 房間ID
- `type` (可選): 付款類型
- `status` (可選): 付款狀態
- `startDate` (可選): 開始日期
- `endDate` (可選): 結束日期
- `page`, `pageSize`: 分頁參數

**響應**：
```typescript
ApiResponse<PaginatedResponse<SimplePayment>>
```

#### 2. 創建付款記錄
```
POST /api/payments
```

**請求體**：
```typescript
{
  roomId: string;
  type: SimplePaymentType;
  amount: number;
  date: string;          // YYYY-MM-DD
  description?: string;
}
```

**響應**：
```typescript
ApiResponse<SimplePayment>
```

#### 3. 更新付款狀態
```
PUT /api/payments/:paymentId/status
```

**請求體**：
```typescript
{
  status: SimplePaymentStatus;
}
```

**響應**：
```typescript
ApiResponse<SimplePayment>
```

### 租客管理 API

#### 1. 獲取租客列表
```
GET /api/tenants
```

**查詢參數**：
- `search` (可選): 搜索關鍵字
- `page`, `pageSize`: 分頁參數

**響應**：
```typescript
ApiResponse<PaginatedResponse<SimpleTenant>>
```

#### 2. 獲取租客詳情
```
GET /api/tenants/:tenantId
```

**響應**：
```typescript
ApiResponse<SimpleTenant & {
  currentRooms: SimpleRoom[];
  paymentHistory: SimplePayment[];
}>
```

### 統計報表 API

#### 1. 房間統計
```
GET /api/stats/rooms
```

**查詢參數**：
- `propertyId` (可選): 物業ID

**響應**：
```typescript
ApiResponse<{
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  occupancyRate: number;
  totalMonthlyRent: number;
  averageRent: number;
  totalDeposit: number;
}>
```

#### 2. 財務統計
```
GET /api/stats/financial
```

**查詢參數**：
- `startDate` (可選): 開始日期
- `endDate` (可選): 結束日期
- `propertyId` (可選): 物業ID

**響應**：
```typescript
ApiResponse<{
  totalRentReceived: number;
  totalDepositHeld: number;
  totalElectricityDue: number;
  pendingPayments: number;
  pendingPaymentsCount: number;
  monthlyTrend?: Array<{
    month: string;
    rent: number;
    electricity: number;
    other: number;
  }>;
}>
```

## 數據驗證規則

### 房間數據驗證
1. **房號**：必填，2-10字符，唯一
2. **月租金**：必填，大於0
3. **押金**：必填，大於等於0
4. **樓層**：必填，1-99

### 入住操作驗證
1. 房間必須是 `available` 狀態
2. 租客姓名和電話必填
3. 入住日期必須是今天或未來
4. 到期日期必須晚於入住日期

### 付款記錄驗證
1. 金額必須大於0
2. 付款日期必須是有效日期
3. 房間必須存在

## 業務邏輯規則

### 狀態轉換規則
```typescript
const validTransitions = {
  available: ['occupied', 'maintenance'],
  occupied: ['available'],
  maintenance: ['available']
};
```

### 自動化任務
1. **租金提醒**：每月1日自動生成租金付款記錄
2. **合約到期提醒**：到期前30天、7天、1天提醒
3. **電費計算**：每月自動計算電費

## 安全性考慮

### 1. 輸入驗證
- 所有輸入必須驗證
- 防止SQL注入和XSS攻擊
- 文件上傳限制

### 2. 權限控制
- 房間操作需要驗證權限
- 敏感操作記錄日誌
- API速率限制

### 3. 數據保護
- 敏感信息加密存儲
- 傳輸使用HTTPS
- 定期數據備份

## 版本控制策略

### URL版本控制
```
/api/v1/rooms
/api/v2/rooms
```

### 兼容性保證
1. 不刪除現有字段
2. 新字段設為可選
3. 提供遷移指南

## 監控和日誌

### 監控指標
1. API響應時間
2. 錯誤率
3. 請求量
4. 資源使用率

### 日誌記錄
1. 所有API請求
2. 錯誤和異常
3. 重要業務操作
4. 性能瓶頸

## 下一步實施計畫

### 階段一：基礎API實現
1. 房間CRUD API
2. 基本驗證邏輯
3. 錯誤處理框架

### 階段二：業務邏輯實現
1. 入住/退房流程
2. 付款管理
3. 狀態轉換邏輯

### 階段三：進階功能
1. 統計報表
2. 自動化任務
3. 權限管理

### 階段四：優化和監控
1. 性能優化
2. 監控集成
3. 文檔完善