// 多物業管理系統 - 類型定義

// 房間狀態
export type RoomStatus = 
  | 'available'                 // 空屋（可立即出租）
  | 'pending_checkin_unpaid'    // 待入住（尚未結清）
  | 'pending_checkin_paid'      // 待入住（已結清）
  | 'occupied'                  // 已出租入住中
  | 'maintenance'               // 維修中
  | 'reserved'                  // 已預訂（兼容舊資料）
  | 'deposit_paid'              // 已付訂金（兼容舊資料）
  | 'fully_paid'                // 已付全額（兼容舊資料）
  | 'pending_payment';          // 待付款（兼容舊資料）

// 入住付款類型
export type CheckInPaymentType = 'full' | 'deposit_only' | 'reservation_only';

// 退房類型
export type CheckOutType = 'scheduled' | 'early';

// 付款狀態
export type PaymentStatus = 'pending' | 'paid';

// 維修緊急程度
export type UrgencyLevel = 'normal' | 'urgent';

// 維修狀態
export type MaintenanceStatus = 'pending' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';

// 時間範圍
export type TimeScope = 'all' | 'year' | 'month';

// 房間資料
export interface Room {
  id: number;
  f: number; // 樓層
  n: string; // 房號
  r: number; // 月租金
  d: number; // 押金
  s: RoomStatus; // 狀態
  t?: string; // 租客姓名
  p?: string; // 電話
  in?: string; // 入住日
  out?: string; // 到期日
  cm?: number; // 本期電錶
  pm?: number; // 上期電錶
  lm?: number; // 上上期電錶
  moveOutDate?: string; // 退租日期
  finalMeter?: number; // 最後電錶
  finalElectricityFee?: number; // 最後電費
  previousTenant?: string; // 前租客姓名
  previousPhone?: string; // 前租客電話
  previousContractStart?: string; // 前合約開始日
  previousContractEnd?: string; // 前合約結束日
  previousTenants?: string[]; // 歷史租客（多個）
  totalRentCollected?: number; // 總收租金
  totalElectricityCollected?: number; // 總收電費
  maintenanceHistory?: number[]; // 維修記錄ID列表
  // 電費相關屬性
  elecRate?: number; // 電費單價
  lastMeter?: number; // 上期電錶讀數
  elecFee?: number; // 本期電費
  lastMeterDate?: string; // 上期抄表日期
  lastMeterMonth?: string; // 上期抄表月份
  lastMeterUsage?: number; // 上期用電度數
  deposit?: number; // 押金（兼容舊代碼，建議使用 d）
  
  // 新增：進階房間管理功能
  checkInPaymentType?: CheckInPaymentType; // 入住付款類型
  contractMonths?: number; // 合約月數
  initialElectricityMeter?: number; // 入住初始電錶
  rentHistory?: RentRecord[]; // 租金歷史記錄
  checkOutType?: CheckOutType; // 退房類型
  earlyCheckOutPenalty?: number; // 提前退房違約金
  otherDeductions?: Deduction[]; // 其他扣款項目
  depositReturned?: boolean; // 押金是否已退還
  notes?: string; // 備註
  archived?: boolean; // 是否已歸檔（軟刪除）
  archiveDate?: string; // 歸檔日期
  archiveReason?: string; // 歸檔原因
  archiveNotes?: string; // 歸檔備註
}

// 租金記錄
export interface RentRecord {
  id: number;
  date: string; // 收款日期
  amount: number; // 金額
  type: 'rent' | 'deposit' | 'electricity' | 'other'; // 類型
  month?: string; // 所屬月份
  paymentMethod?: 'cash' | 'transfer' | 'other'; // 付款方式
  notes?: string; // 備註
}

// 扣款項目
export interface Deduction {
  id: number;
  reason: string; // 扣款原因
  amount: number; // 金額
  date: string; // 扣款日期
  notes?: string; // 備註
}

// 付款記錄
export interface Payment {
  id: number;
  rid: number; // 房間ID
  n: string; // 房號
  t: string; // 租客姓名
  m: string; // 月份 (格式: YYYY/MM)
  r: number; // 租金
  u: number; // 用電度數
  e: number; // 電費
  total: number; // 總金額
  due: string; // 到期日
  s: PaymentStatus; // 狀態
  paid?: string; // 付款日期
  paymentMethod?: string; // 付款方式
  notes?: string; // 備註
  electricityRate?: number; // 當時的電費單價（用於版本控制）
  archived?: boolean; // 是否已歸檔到歷史
  collectedBy?: string; // 收款人員
  collectionDate?: string; // 收款日期
  paymentType?: 'rent' | 'deposit' | 'electricity' | 'water' | 'internet' | 'other'; // 款項類型
  period?: string; // 期間（如：2026-02、入住前）
  tenantType?: 'new' | 'existing'; // 租客類型
  overdueDays?: number; // 逾期天數
}

// 維修記錄
export interface Maintenance {
  id: number;
  rid: number; // 房間ID
  n: string; // 房號
  t: string; // 租客姓名
  title: string; // 標題
  desc: string; // 說明
  urg: UrgencyLevel; // 緊急程度
  s: MaintenanceStatus; // 狀態
  date: string; // 報修日期
  cost?: number; // 維修費用
  repairDate?: string; // 維修日期
  estimatedCost?: number; // 預計費用（用於裝修）
  estimatedCompletion?: string; // 預計完成日期
  technician?: string; // 師傅姓名
  notes?: string; // 備註
  // 新增字段：實際發生金額相關
  actualCost?: number; // 實際發生費用
  actualCompletionDate?: string; // 實際完成日期
  paymentStatus?: 'unpaid' | 'paid' | 'partial'; // 付款狀態
  invoiceNumber?: string; // 發票號碼
  category?: 'repair' | 'renovation' | 'other'; // 類別：報修/裝修/其他
}

// 物業資料
export interface Property {
  id: number;
  name: string;
  address: string;
  floors: number;
  color?: string; // 物業顏色標識
  rooms: Room[];
  payments: Payment[];
  history: Payment[];
  maintenance: Maintenance[];
  expenses?: Expense[]; // 物業修繕/支出記錄
  meterHistory?: MeterReadingRecord[]; // 抄錶歷史記錄
  utilityExpenses?: UtilityExpense[]; // 水電支出記錄
  additionalIncomes?: AdditionalIncome[]; // 補充收入記錄
  // 物業租用成本（二房東需要支付給房東的成本）
  propertyRentalCost?: {
    monthlyRent: number; // 月租金
    deposit: number; // 押金
    contractStartDate: string; // 合約開始日期
    contractEndDate: string; // 合約結束日期
    paymentDay: number; // 每月付款日（1-31）
    notes?: string; // 備註
  };
}

// 抄錶記錄
export interface MeterReadingRecord {
  id: number;
  date: string; // 抄錶日期
  month: string; // 月份 (YYYY/MM)
  readings: {
    rid: number; // 房間ID
    roomNumber: string; // 房號
    reading: number; // 電錶讀數
    usage: number; // 用電度數
    fee: number; // 電費
  }[];
}

// 水電支出記錄
export interface UtilityExpense {
  id: number;
  type: 'taipower' | 'water' | 'rent'; // 台電、水費或租金
  period: string; // 期間，如 "2026年1-2月"
  amount: number; // 金額
  paidDate: string; // 繳費日期 (YYYY-MM-DD)
  notes?: string; // 備註
  propertyId: number; // 所屬物業ID
}

// 補充收入記錄
export interface AdditionalIncome {
  id: number;
  type: 'washing-machine' | 'other'; // 洗衣機或其他
  month: string; // 月份，如 "2026/01"
  amount: number; // 金額
  description: string; // 描述
  receivedDate: string; // 收款日期 (YYYY-MM-DD)
  propertyId: number; // 所屬物業ID
  notes?: string; // 備註（添加notes字段）
}

// 物業修繕/支出記錄
export interface Expense {
  id: number;
  date: string; // 支出日期
  type: 'repair' | 'renovation' | 'utility' | 'tax' | 'management' | 'other'; // 支出類型
  amount: number; // 金額
  description: string; // 說明
  room: string; // 房間/區域
  vendor?: string; // 供應商/收款人
  paymentMethod?: 'cash' | 'transfer' | 'credit' | 'check'; // 付款方式
  status: 'pending' | 'paid' | 'cancelled'; // 付款狀態
  invoiceNumber?: string; // 發票號碼
  propertyId: number; // 所屬物業ID
}

// 應用資料
export interface AppData {
  properties: Property[];
  electricityRate: number;
  actualElectricityRate: number;
  utilityExpenses: UtilityExpense[]; // 水電支出記錄
  additionalIncomes: AdditionalIncome[]; // 補充收入記錄
}

// 應用狀態
export interface AppState {
  tab: 'rooms' | 'financial' | 'payments' | 'paymentHistory' | 'maintenance' | 'expenses' | 'utilities' | 'settings';
  lang: 'zh-TW' | 'vi-VN';
  modal: {
    type: string;
    data?: any;
  } | null;
  filter: 'all' | 'unpaid' | 'paid';
  currentProperty: number | 'all' | null;
  revenueTimeScope: TimeScope;
  revenueYear: number;
  revenueMonth: string;
  elecTimeScope: TimeScope;
  elecYear: number;
  elecMonth: string;
  data: AppData;
  // 新增：臨時篩選狀態
  tempRevenueTimeScope: TimeScope;
  tempRevenueYear: number;
  tempRevenueMonth: string;
  tempElecTimeScope: TimeScope;
  tempElecYear: number;
  tempElecMonth: string;
}

// 統計資料
export interface Stats {
  total: number;
  occupied: number;
  available: number;
  rate: number;
  totalRent: number;
  avgRent: number;
  totalElec: number;
  received: number;
  pending: number;
  pendingCount: number;
  expiring: number;
  totalDeposit: number;
  elecReceivable: number;
  floors: Array<{
    f: number;
    total: number;
    occ: number;
    rate: number;
  }>;
  rentByFloor: Array<{
    f: number;
    rent: number;
  }>;
  elec: {
    charged: number;
    chargedRate: number;
    usage: number;
    actualCost: number;
    actualRate: number;
    profit: number;
    profitRate: number;
  };
}

// 翻譯字典
export interface Translation {
  [key: string]: {
    [key: string]: string;
  };
}

// 電費分析結果
export interface ElectricityAnalysis {
  charged: number;
  usage: number;
  actualCost: number;
  profit: number;
  profitRate: number;
  recommendation: {
    ok: boolean;
    message: string;
    suggestedRate?: number;
  };
}