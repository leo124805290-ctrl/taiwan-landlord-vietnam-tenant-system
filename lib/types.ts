// 多物業管理系統 - 類型定義

// 房間狀態
export type RoomStatus = 'available' | 'occupied';

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
}

// 應用資料
export interface AppData {
  properties: Property[];
  electricityRate: number;
  actualElectricityRate: number;
}

// 應用狀態
export interface AppState {
  tab: 'dashboard' | 'rooms' | 'payments' | 'maintenance' | 'settings';
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