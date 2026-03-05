// 本地類型定義
interface SimpleRoom {
  id: string;
  propertyId: string;
  number: string;
  floor: number;
  monthlyRent: number;
  deposit: number;
  status: 'available' | 'occupied' | 'maintenance';
  tenant?: {
    name: string;
    phone: string;
  };
  lease?: {
    checkInDate: string;
    checkOutDate: string;
  };
  electricity?: {
    usage: number;
    rate: number;
    fee: number;
  };
  createdAt: string;
  updatedAt: string;
}

// 生成示例房間數據
export const sampleRooms: SimpleRoom[] = [
  {
    id: 'room_1',
    propertyId: 'property_1',
    number: '101',
    floor: 1,
    monthlyRent: 12000,
    deposit: 24000,
    status: 'occupied',
    tenant: {
      name: '陳小明',
      phone: '0912-345-678',
    },
    lease: {
      checkInDate: '2026-01-15',
      checkOutDate: '2026-07-14',
    },
    electricity: {
      currentMeter: 1250,
      lastMeter: 1150,
      rate: 5,
      lastUpdated: '2026-03-01',
    },
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-03-01T15:30:00Z',
    notes: '按時繳租，愛乾淨',
  },
  {
    id: 'room_2',
    propertyId: 'property_1',
    number: '102',
    floor: 1,
    monthlyRent: 11000,
    deposit: 22000,
    status: 'available',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-02-28T09:15:00Z',
    notes: '朝南，採光好',
  },
  {
    id: 'room_3',
    propertyId: 'property_1',
    number: '201',
    floor: 2,
    monthlyRent: 13000,
    deposit: 26000,
    status: 'occupied',
    tenant: {
      name: '林美華',
      phone: '0988-765-432',
    },
    lease: {
      checkInDate: '2025-11-01',
      checkOutDate: '2026-05-31',
    },
    electricity: {
      currentMeter: 890,
      lastMeter: 850,
      rate: 5,
      lastUpdated: '2026-03-01',
    },
    createdAt: '2025-11-01T14:20:00Z',
    updatedAt: '2026-03-01T16:45:00Z',
    notes: '養一隻貓',
  },
  {
    id: 'room_4',
    propertyId: 'property_1',
    number: '202',
    floor: 2,
    monthlyRent: 12500,
    deposit: 25000,
    status: 'maintenance',
    createdAt: '2025-12-10T11:30:00Z',
    updatedAt: '2026-02-25T10:00:00Z',
    notes: '浴室漏水維修中',
  },
  {
    id: 'room_5',
    propertyId: 'property_1',
    number: '301',
    floor: 3,
    monthlyRent: 14000,
    deposit: 28000,
    status: 'available',
    createdAt: '2026-01-20T09:45:00Z',
    updatedAt: '2026-02-20T14:20:00Z',
    notes: '頂樓，有陽台',
  },
  {
    id: 'room_6',
    propertyId: 'property_1',
    number: '302',
    floor: 3,
    monthlyRent: 13500,
    deposit: 27000,
    status: 'occupied',
    tenant: {
      name: '張大偉',
      phone: '0933-222-111',
    },
    lease: {
      checkInDate: '2026-02-01',
      checkOutDate: '2026-08-31',
    },
    createdAt: '2026-02-01T13:15:00Z',
    updatedAt: '2026-02-01T13:15:00Z',
  },
  {
    id: 'room_7',
    propertyId: 'property_1',
    number: '401',
    floor: 4,
    monthlyRent: 15000,
    deposit: 30000,
    status: 'available',
    createdAt: '2026-01-10T16:40:00Z',
    updatedAt: '2026-02-15T11:10:00Z',
    notes: '景觀房，可看山景',
  },
  {
    id: 'room_8',
    propertyId: 'property_1',
    number: '402',
    floor: 4,
    monthlyRent: 14500,
    deposit: 29000,
    status: 'occupied',
    tenant: {
      name: '王曉雯',
      phone: '0977-888-999',
    },
    lease: {
      checkInDate: '2025-12-20',
      checkOutDate: '2026-06-19',
    },
    electricity: {
      currentMeter: 1050,
      lastMeter: 980,
      rate: 5,
      lastUpdated: '2026-03-01',
    },
    createdAt: '2025-12-20T10:30:00Z',
    updatedAt: '2026-03-01T17:20:00Z',
  },
  {
    id: 'room_9',
    propertyId: 'property_1',
    number: '501',
    floor: 5,
    monthlyRent: 16000,
    deposit: 32000,
    status: 'maintenance',
    createdAt: '2026-01-05T14:50:00Z',
    updatedAt: '2026-02-28T08:45:00Z',
    notes: '重新粉刷牆壁',
  },
  {
    id: 'room_10',
    propertyId: 'property_1',
    number: '502',
    floor: 5,
    monthlyRent: 15500,
    deposit: 31000,
    status: 'available',
    createdAt: '2026-01-25T11:20:00Z',
    updatedAt: '2026-02-10T15:30:00Z',
    notes: '附基本家具',
  },
]

// 生成房間操作處理函數
export function handleRoomAction(action: string, roomId: string, data?: any) {
  console.log('房間操作:', { action, roomId, data })
  
  switch (action) {
    case 'check-in':
      alert(`開始入住流程: 房間 ${roomId}`)
      break
    case 'check-out':
      alert(`開始退房流程: 房間 ${roomId}`)
      break
    case 'collect-rent':
      alert(`收租: 房間 ${roomId}`)
      break
    case 'renew':
      alert(`續約: 房間 ${roomId}`)
      break
    case 'edit':
      alert(`編輯房間: ${roomId}`)
      break
    case 'delete':
      alert(`刪除房間: ${roomId}`)
      break
    case 'maintenance':
      alert(`設為維修: 房間 ${roomId}`)
      break
    case 'available':
      alert(`恢復可出租: 房間 ${roomId}`)
      break
    case 'add':
      alert('新增房間')
      break
    default:
      console.log('未知操作:', action)
  }
}

// 獲取房間統計
export function getRoomStats(rooms: SimpleRoom[]) {
  const total = rooms.length
  const available = rooms.filter(r => r.status === 'available').length
  const occupied = rooms.filter(r => r.status === 'occupied').length
  const maintenance = rooms.filter(r => r.status === 'maintenance').length
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0
  
  const totalMonthlyRent = rooms.reduce((sum, room) => sum + room.monthlyRent, 0)
  const averageRent = total > 0 ? Math.round(totalMonthlyRent / total) : 0
  
  const totalDeposit = rooms.reduce((sum, room) => sum + room.deposit, 0)
  
  return {
    total,
    available,
    occupied,
    maintenance,
    occupancyRate,
    totalMonthlyRent,
    averageRent,
    totalDeposit,
  }
}