// 簡化數據模型 - 套房出租管理系統
// 設計原則：簡單、明確、必要

// ==================== 核心類型 ====================

/**
 * 簡化版房間狀態
 * 從9種狀態簡化為3種核心狀態
 */
export type SimpleRoomStatus = 
  | 'available'    // 空房可出租
  | 'occupied'     // 已出租入住中
  | 'maintenance'; // 維修中不可出租

/**
 * 付款類型
 */
export type SimplePaymentType = 
  | 'rent'        // 租金
  | 'deposit'     // 押金
  | 'electricity' // 電費
  | 'other';      // 其他

/**
 * 付款狀態
 */
export type SimplePaymentStatus = 
  | 'pending'     // 待付款
  | 'paid';       // 已付款

// ==================== 實體類型 ====================

/**
 * 簡化房間資料
 * 從40+屬性簡化為核心屬性
 */
export interface SimpleRoom {
  // 核心識別資訊
  id: string;           // UUID格式
  propertyId: string;   // 所屬物業ID
  number: string;       // 房號（如"101"）
  floor: number;        // 樓層
  
  // 租金資訊
  monthlyRent: number;  // 月租金
  deposit: number;      // 押金
  
  // 狀態資訊
  status: SimpleRoomStatus;
  
  // 租客資訊（僅在occupied狀態時有效）
  tenant?: {
    name: string;       // 租客姓名
    phone: string;      // 聯絡電話
  };
  
  // 租約資訊
  lease?: {
    checkInDate: string;    // 入住日期 YYYY-MM-DD
    checkOutDate: string;   // 到期日期 YYYY-MM-DD
  };
  
  // 電費資訊
  electricity?: {
    currentMeter: number;   // 本期電錶
    lastMeter: number;      // 上期電錶
    rate: number;          // 電費單價（元/度）
    lastUpdated?: string;   // 最後更新日期（可選）
  };
  
  // 時間戳記
  createdAt: string;
  updatedAt: string;
  
  // 備註
  notes?: string;
}

/**
 * 簡化付款記錄
 */
export interface SimplePayment {
  id: string;
  roomId: string;
  tenantId?: string;     // 租客ID（可選）
  type: SimplePaymentType;
  amount: number;
  dueDate: string;       // 到期日期 YYYY-MM-DD
  paidDate?: string;     // 付款日期 YYYY-MM-DD（可選）
  status: SimplePaymentStatus;
  notes?: string;        // 備註
  isBackfill?: boolean;  // 是否為補登記錄
  
  // 時間戳記
  createdAt: string;
  updatedAt: string;
}

/**
 * 簡化租客資料
 */
export interface SimpleTenant {
  id: string;
  name: string;
  phone: string;
  rooms: string[];      // 租賃的房間ID列表
  
  // 時間戳記
  createdAt: string;
  updatedAt?: string;
}

/**
 * 簡化物業資料
 */
export interface SimpleProperty {
  id: string;
  name: string;
  address?: string;
  
  // 時間戳記
  createdAt: string;
  updatedAt?: string;
}

// ==================== 請求/響應類型 ====================

/**
 * API響應標準格式
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * 分頁響應
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==================== 請求類型 ====================

/**
 * 創建房間請求
 */
export interface CreateRoomRequest {
  propertyId: string;
  number: string;
  floor: number;
  monthlyRent: number;
  deposit: number;
  notes?: string;
}

/**
 * 更新房間請求
 */
export interface UpdateRoomRequest {
  number?: string;
  floor?: number;
  monthlyRent?: number;
  deposit?: number;
  status?: SimpleRoomStatus;
  notes?: string;
}

/**
 * 入住請求
 */
export interface CheckInRequest {
  tenantName: string;
  tenantPhone: string;
  checkInDate: string;    // YYYY-MM-DD
  checkOutDate: string;   // YYYY-MM-DD
  initialMeter?: number;  // 初始電錶讀數
  notes?: string;
}

/**
 * 退房請求
 */
export interface CheckOutRequest {
  finalMeter: number;     // 最後電錶讀數
  checkOutDate: string;   // YYYY-MM-DD
  notes?: string;
}

/**
 * 創建付款請求
 */
export interface CreatePaymentRequest {
  roomId: string;
  type: SimplePaymentType;
  amount: number;
  date: string;          // YYYY-MM-DD
  description?: string;
}

// ==================== 工具類型 ====================

/**
 * 房間統計
 */
export interface RoomStats {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  occupancyRate: number;  // 入住率
  totalMonthlyRent: number;
  averageRent: number;
}

/**
 * 財務統計
 */
export interface FinancialStats {
  totalRentReceived: number;
  totalDepositHeld: number;
  totalElectricityDue: number;
  pendingPayments: number;
  pendingPaymentsCount: number;
}

/**
 * 時間範圍
 */
export interface TimeRange {
  startDate: string;  // YYYY-MM-DD
  endDate: string;    // YYYY-MM-DD
}

// ==================== 驗證工具 ====================

/**
 * 狀態轉換驗證規則
 */
export const validStatusTransitions: Record<SimpleRoomStatus, SimpleRoomStatus[]> = {
  available: ['occupied', 'maintenance'],
  occupied: ['available'],
  maintenance: ['available']
};

/**
 * 檢查狀態轉換是否有效
 */
export function isValidStatusTransition(
  from: SimpleRoomStatus, 
  to: SimpleRoomStatus
): boolean {
  return validStatusTransitions[from].includes(to);
}

/**
 * 房間狀態顯示名稱
 */
export const roomStatusDisplayNames: Record<SimpleRoomStatus, string> = {
  available: '空房可出租',
  occupied: '已出租',
  maintenance: '維修中'
};

/**
 * 房間狀態顏色
 */
export const roomStatusColors: Record<SimpleRoomStatus, string> = {
  available: 'green',
  occupied: 'blue',
  maintenance: 'orange'
};

/**
 * 付款類型顯示名稱
 */
export const paymentTypeDisplayNames: Record<SimplePaymentType, string> = {
  rent: '租金',
  deposit: '押金',
  electricity: '電費',
  other: '其他'
};

// ==================== 類型守衛 ====================

/**
 * 檢查是否為有效的房間狀態
 */
export function isValidRoomStatus(status: string): status is SimpleRoomStatus {
  return ['available', 'occupied', 'maintenance'].includes(status);
}

/**
 * 檢查是否為有效的付款類型
 */
export function isValidPaymentType(type: string): type is SimplePaymentType {
  return ['rent', 'deposit', 'electricity', 'other'].includes(type);
}

/**
 * 檢查是否為有效的付款狀態
 */
export function isValidPaymentStatus(status: string): status is SimplePaymentStatus {
  return ['pending', 'paid'].includes(status);
}