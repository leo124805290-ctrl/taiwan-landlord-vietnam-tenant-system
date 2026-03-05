// 數據遷移工具 - 從舊類型遷移到簡化類型
import { Room } from '@/lib/types';
import { SimpleRoom, SimpleRoomStatus } from '@/src/types/simple';

/**
 * 將舊房間狀態映射到簡化房間狀態
 */
export function mapOldRoomStatusToSimple(oldStatus: string): SimpleRoomStatus {
  const statusMap: Record<string, SimpleRoomStatus> = {
    // 空房相關
    'available': 'available',
    
    // 待入住相關（簡化為available，因為還未實際入住）
    'pending_checkin_unpaid': 'available',
    'pending_checkin_paid': 'available',
    
    // 已出租相關
    'occupied': 'occupied',
    
    // 維修相關
    'maintenance': 'maintenance',
    
    // 兼容舊狀態（簡化處理）
    'reserved': 'available',        // 預訂視為可出租
    'deposit_paid': 'available',    // 已付訂金視為可出租
    'fully_paid': 'available',      // 已付全額視為可出租
    'pending_payment': 'available', // 待付款視為可出租
  };
  
  return statusMap[oldStatus] || 'available';
}

/**
 * 檢查房間是否實際已出租
 */
function isRoomActuallyOccupied(oldRoom: Room): boolean {
  // 如果有租客姓名和入住日期，視為已出租
  return !!(oldRoom.t && oldRoom.in);
}

/**
 * 從舊房間數據遷移到簡化房間數據
 */
export function migrateRoomToSimple(oldRoom: Room, propertyId: string): SimpleRoom {
  // 決定最終狀態
  let finalStatus: SimpleRoomStatus;
  const mappedStatus = mapOldRoomStatusToSimple(oldRoom.s);
  
  if (mappedStatus === 'available' && isRoomActuallyOccupied(oldRoom)) {
    // 如果映射為available但實際有租客，改為occupied
    finalStatus = 'occupied';
  } else {
    finalStatus = mappedStatus;
  }
  
  // 構建簡化房間對象
  const simpleRoom: SimpleRoom = {
    // 核心識別資訊
    id: `room_${oldRoom.id}`,
    propertyId,
    number: oldRoom.n || `房間${oldRoom.id}`,
    floor: oldRoom.f || 1,
    
    // 租金資訊
    monthlyRent: oldRoom.r || 0,
    deposit: oldRoom.d || 0,
    
    // 狀態資訊
    status: finalStatus,
    
    // 時間戳記（使用當前時間）
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // 如果有租客資訊，添加租客和租約資訊
  if (oldRoom.t && oldRoom.in) {
    simpleRoom.tenant = {
      name: oldRoom.t,
      phone: oldRoom.p || '',
    };
    
    simpleRoom.lease = {
      checkInDate: oldRoom.in,
      checkOutDate: oldRoom.out || calculateDefaultCheckOutDate(oldRoom.in),
    };
  }
  
  // 如果有電費資訊，添加電費資訊
  if (oldRoom.cm !== undefined || oldRoom.pm !== undefined) {
    simpleRoom.electricity = {
      currentMeter: oldRoom.cm || 0,
      lastMeter: oldRoom.pm || 0,
      rate: oldRoom.elecRate || 5, // 默認5元/度
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  }
  
  // 添加備註
  if (oldRoom.notes) {
    simpleRoom.notes = oldRoom.notes;
  }
  
  return simpleRoom;
}

/**
 * 計算默認到期日期（入住日期+1年）
 */
function calculateDefaultCheckOutDate(checkInDate: string): string {
  const date = new Date(checkInDate);
  date.setFullYear(date.getFullYear() + 1);
  date.setDate(date.getDate() - 1); // 前一天
  return date.toISOString().split('T')[0];
}

/**
 * 批量遷移房間數據
 */
export function migrateRoomsBatch(
  oldRooms: Room[], 
  propertyId: string
): SimpleRoom[] {
  return oldRooms.map(room => migrateRoomToSimple(room, propertyId));
}

/**
 * 生成遷移報告
 */
export interface MigrationReport {
  totalRooms: number;
  migratedRooms: number;
  statusChanges: Record<string, number>;
  warnings: string[];
  errors: string[];
}

/**
 * 執行遷移並生成報告
 */
export function migrateWithReport(
  oldRooms: Room[], 
  propertyId: string
): {
  migratedRooms: SimpleRoom[];
  report: MigrationReport;
} {
  const migratedRooms: SimpleRoom[] = [];
  const statusChanges: Record<string, number> = {};
  const warnings: string[] = [];
  const errors: string[] = [];
  
  for (const oldRoom of oldRooms) {
    try {
      const migratedRoom = migrateRoomToSimple(oldRoom, propertyId);
      migratedRooms.push(migratedRoom);
      
      // 記錄狀態變化
      const statusKey = `${oldRoom.s} → ${migratedRoom.status}`;
      statusChanges[statusKey] = (statusChanges[statusKey] || 0) + 1;
      
      // 檢查潛在問題
      if (oldRoom.s === 'occupied' && migratedRoom.status !== 'occupied') {
        warnings.push(`房間 ${oldRoom.n} 原狀態為occupied但遷移後變為${migratedRoom.status}`);
      }
      
      if (oldRoom.t && !migratedRoom.tenant) {
        warnings.push(`房間 ${oldRoom.n} 有租客資訊但遷移後丟失`);
      }
      
    } catch (error) {
      errors.push(`房間 ${oldRoom.n} 遷移失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  const report: MigrationReport = {
    totalRooms: oldRooms.length,
    migratedRooms: migratedRooms.length,
    statusChanges,
    warnings,
    errors,
  };
  
  return { migratedRooms, report };
}

/**
 * 驗證遷移後的數據
 */
export function validateMigratedRooms(rooms: SimpleRoom[]): {
  valid: boolean;
  issues: Array<{
    roomId: string;
    roomNumber: string;
    issue: string;
  }>;
} {
  const issues: Array<{
    roomId: string;
    roomNumber: string;
    issue: string;
  }> = [];
  
  for (const room of rooms) {
    // 檢查必要字段
    if (!room.id) {
      issues.push({
        roomId: room.id,
        roomNumber: room.number,
        issue: '缺少ID',
      });
    }
    
    if (!room.number) {
      issues.push({
        roomId: room.id,
        roomNumber: room.number,
        issue: '缺少房號',
      });
    }
    
    if (room.monthlyRent <= 0) {
      issues.push({
        roomId: room.id,
        roomNumber: room.number,
        issue: '月租金必須大於0',
      });
    }
    
    // 檢查狀態一致性
    if (room.status === 'occupied') {
      if (!room.tenant) {
        issues.push({
          roomId: room.id,
          roomNumber: room.number,
          issue: '已出租狀態但缺少租客資訊',
        });
      }
      
      if (!room.lease) {
        issues.push({
          roomId: room.id,
          roomNumber: room.number,
          issue: '已出租狀態但缺少租約資訊',
        });
      }
    } else if (room.status === 'available' || room.status === 'maintenance') {
      if (room.tenant || room.lease) {
        issues.push({
          roomId: room.id,
          roomNumber: room.number,
          issue: `非出租狀態但不應該有租客/租約資訊`,
        });
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * 生成遷移摘要
 */
export function generateMigrationSummary(report: MigrationReport): string {
  const lines: string[] = [];
  
  lines.push('=== 數據遷移摘要 ===');
  lines.push(`總房間數: ${report.totalRooms}`);
  lines.push(`成功遷移: ${report.migratedRooms}`);
  lines.push(`遷移成功率: ${((report.migratedRooms / report.totalRooms) * 100).toFixed(1)}%`);
  
  if (Object.keys(report.statusChanges).length > 0) {
    lines.push('\n狀態變化統計:');
    for (const [change, count] of Object.entries(report.statusChanges)) {
      lines.push(`  ${change}: ${count}個房間`);
    }
  }
  
  if (report.warnings.length > 0) {
    lines.push(`\n警告 (${report.warnings.length}個):`);
    report.warnings.forEach(warning => lines.push(`  ⚠️ ${warning}`));
  }
  
  if (report.errors.length > 0) {
    lines.push(`\n錯誤 (${report.errors.length}個):`);
    report.errors.forEach(error => lines.push(`  ❌ ${error}`));
  }
  
  return lines.join('\n');
}