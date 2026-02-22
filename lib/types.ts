// 多物業管理系統 - 類型定義

// 房間狀態
export type RoomStatus = 'available' | 'occupied' | 'renovation';

// 付款狀態
export type PaymentStatus = 'pending' | 'paid';

// 維修緊急程度
export type UrgencyLevel = 'normal' | 'urgent';

// 維修狀態
export type MaintenanceStatus = 'pending' | 'assigned' | 'completed';

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
}

// 物業資料
export interface Property {
  id: number;
  name: string;
  address: string;
  floors: number;
  rooms: Room[];
  payments: Payment[];
  history: Payment[];
  maintenance: Maintenance[];
  meterHistory?: MeterReadingRecord[]; // 抄錶歷史記錄
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

// 應用資料
export interface AppData {
  properties: Property[];
  electricityRate: number;
  actualElectricityRate: number;
}

// 應用狀態
export interface AppState {
  tab: 'dashboard' | 'rooms' | 'meterReading' | 'payments' | 'maintenance' | 'settings';
  lang: 'zh-TW' | 'vi-VN';
  modal: {
    type: string;
    data?: any;
  } | null;
  filter: 'all' | 'unpaid' | 'paid';
  currentProperty: number | null;
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