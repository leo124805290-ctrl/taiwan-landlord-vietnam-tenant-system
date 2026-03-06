// 模擬API服務 - 用於開發和測試
import { 
  SimpleRoom, SimplePayment, SimpleTenant, SimpleProperty,
  CreateRoomRequest, UpdateRoomRequest, CheckInRequest, CheckOutRequest, CreatePaymentRequest,
  SimpleRoomStatus, SimplePaymentType, SimplePaymentStatus
} from '@/src/types/simple'
import { sampleRooms } from '@/src/components/unified/sampleRooms'
import { createApiResponse } from './client'

// 模擬數據存儲
class MockDatabase {
  private rooms: Map<string, SimpleRoom>
  private payments: Map<string, SimplePayment>
  private tenants: Map<string, SimpleTenant>
  private properties: Map<string, SimpleProperty>

  constructor() {
    this.rooms = new Map()
    this.payments = new Map()
    this.tenants = new Map()
    this.properties = new Map()
    
    this.initializeData()
  }

  // 初始化測試數據
  private initializeData() {
    // 初始化物業
    const property: SimpleProperty = {
      id: 'property_1',
      name: '幸福公寓',
      address: '台北市大安區幸福路123號',
      createdAt: '2026-01-01T00:00:00Z',
    }
    this.properties.set(property.id, property)

    // 初始化房間
    sampleRooms.forEach(room => {
      this.rooms.set(room.id, room)
    })

    // 初始化付款記錄
    const samplePayments: SimplePayment[] = [
      {
        id: 'payment_1',
        roomId: 'room_1',
        type: 'rent',
        amount: 12000,
        dueDate: '2026-03-01',
        status: 'paid',
        notes: '3月份租金',
        createdAt: '2026-03-01T10:00:00Z',
      },
      {
        id: 'payment_2',
        roomId: 'room_1',
        type: 'deposit',
        amount: 24000,
        date: '2026-01-15',
        status: 'paid',
        description: '入住押金',
        createdAt: '2026-01-15T14:30:00Z',
      },
      {
        id: 'payment_3',
        roomId: 'room_3',
        type: 'electricity',
        amount: 200,
        date: '2026-03-01',
        status: 'pending',
        description: '2月份電費',
        createdAt: '2026-03-01T16:45:00Z',
      },
    ]

    samplePayments.forEach(payment => {
      this.payments.set(payment.id, payment)
    })

    // 初始化租客
    const sampleTenants: SimpleTenant[] = [
      {
        id: 'tenant_1',
        name: '陳小明',
        phone: '0912-345-678',
        rooms: ['room_1'],
        createdAt: '2026-01-15T10:00:00Z',
      },
      {
        id: 'tenant_2',
        name: '林美華',
        phone: '0988-765-432',
        rooms: ['room_3'],
        createdAt: '2025-11-01T14:20:00Z',
      },
      {
        id: 'tenant_3',
        name: '張大偉',
        phone: '0933-222-111',
        rooms: ['room_6'],
        createdAt: '2026-02-01T13:15:00Z',
      },
      {
        id: 'tenant_4',
        name: '王曉雯',
        phone: '0977-888-999',
        rooms: ['room_8'],
        createdAt: '2025-12-20T10:30:00Z',
      },
    ]

    sampleTenants.forEach(tenant => {
      this.tenants.set(tenant.id, tenant)
    })
  }

  // 房間操作
  getRooms() {
    return Array.from(this.rooms.values())
  }

  getRoom(id: string) {
    return this.rooms.get(id)
  }

  createRoom(data: CreateRoomRequest) {
    const id = `room_${Date.now()}`
    const now = new Date().toISOString()
    
    const room: SimpleRoom = {
      id,
      propertyId: data.propertyId,
      number: data.number,
      floor: data.floor,
      monthlyRent: data.monthlyRent,
      deposit: data.deposit,
      status: 'available',
      createdAt: now,
      updatedAt: now,
      notes: data.notes,
    }
    
    this.rooms.set(id, room)
    return room
  }

  updateRoom(id: string, data: UpdateRoomRequest) {
    const room = this.rooms.get(id)
    if (!room) return null
    
    const updatedRoom: SimpleRoom = {
      ...room,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    
    this.rooms.set(id, updatedRoom)
    return updatedRoom
  }

  deleteRoom(id: string) {
    return this.rooms.delete(id)
  }

  // 付款操作
  getPayments() {
    return Array.from(this.payments.values())
  }

  createPayment(data: CreatePaymentRequest) {
    const id = `payment_${Date.now()}`
    const now = new Date().toISOString()
    
    const payment: SimplePayment = {
      id,
      roomId: data.roomId,
      type: data.type as SimplePaymentType,
      amount: data.amount,
      date: data.date,
      status: 'pending',
      description: data.description,
      createdAt: now,
    }
    
    this.payments.set(id, payment)
    return payment
  }

  // 租客操作
  getTenants() {
    return Array.from(this.tenants.values())
  }

  // 物業操作
  getProperties() {
    return Array.from(this.properties.values())
  }
}

// 創建模擬數據庫實例
const mockDb = new MockDatabase()

// 模擬延遲
const simulateDelay = (ms = 300) => 
  new Promise(resolve => setTimeout(resolve, ms))

// 模擬API服務
export class MockApiService {
  // ==================== 房間管理 ====================

  async getRooms(params?: any) {
    await simulateDelay()
    
    let rooms = mockDb.getRooms()
    
    // 應用過濾
    if (params?.status && params.status !== 'all') {
      rooms = rooms.filter(room => room.status === params.status)
    }
    
    if (params?.search) {
      const search = params.search.toLowerCase()
      rooms = rooms.filter(room => 
        room.number.toLowerCase().includes(search) ||
        room.tenant?.name.toLowerCase().includes(search) ||
        room.tenant?.phone.includes(search)
      )
    }
    
    // 分頁
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    const paginatedRooms = rooms.slice(start, end)
    
    return createApiResponse({
      items: paginatedRooms,
      total: rooms.length,
      page,
      pageSize,
      totalPages: Math.ceil(rooms.length / pageSize),
    })
  }

  async getRoom(roomId: string) {
    await simulateDelay()
    
    const room = mockDb.getRoom(roomId)
    if (!room) {
      return createApiResponse<SimpleRoom>(undefined, {
        code: 'NOT_FOUND',
        message: '房間不存在',
      })
    }
    
    return createApiResponse(room)
  }

  async createRoom(data: CreateRoomRequest) {
    await simulateDelay()
    
    // 驗證數據
    if (!data.number || !data.monthlyRent || !data.deposit) {
      return createApiResponse<SimpleRoom>(undefined, {
        code: 'VALIDATION_ERROR',
        message: '缺少必要字段',
      })
    }
    
    const room = mockDb.createRoom(data)
    return createApiResponse(room)
  }

  async updateRoom(roomId: string, data: UpdateRoomRequest) {
    await simulateDelay()
    
    const room = mockDb.updateRoom(roomId, data)
    if (!room) {
      return createApiResponse<SimpleRoom>(undefined, {
        code: 'NOT_FOUND',
        message: '房間不存在',
      })
    }
    
    return createApiResponse(room)
  }

  async deleteRoom(roomId: string) {
    await simulateDelay()
    
    const deleted = mockDb.deleteRoom(roomId)
    return createApiResponse({ deleted })
  }

  async checkInRoom(roomId: string, data: CheckInRequest) {
    await simulateDelay()
    
    const room = mockDb.getRoom(roomId)
    if (!room) {
      return createApiResponse(undefined, {
        code: 'NOT_FOUND',
        message: '房間不存在',
      })
    }
    
    if (room.status !== 'available') {
      return createApiResponse(undefined, {
        code: 'CONFLICT',
        message: '房間當前不可入住',
      })
    }
    
    // 更新房間狀態
    const updatedRoom = mockDb.updateRoom(roomId, {
      status: 'occupied',
    })
    
    if (!updatedRoom) {
      return createApiResponse(undefined, {
        code: 'INTERNAL_ERROR',
        message: '更新房間失敗',
      })
    }
    
    // 創建租客
    const tenantId = `tenant_${Date.now()}`
    // 這裡應該實際創建租客記錄
    
    // 創建押金付款記錄
    const paymentData: CreatePaymentRequest = {
      roomId,
      type: 'deposit',
      amount: room.deposit,
      date: data.checkInDate,
      description: '入住押金',
    }
    
    const payment = mockDb.createPayment(paymentData)
    
    return createApiResponse({
      room: {
        ...updatedRoom,
        tenant: {
          name: data.tenantName,
          phone: data.tenantPhone,
        },
        lease: {
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
        },
        electricity: data.initialMeter ? {
          currentMeter: data.initialMeter,
          lastMeter: data.initialMeter,
          rate: 5,
          lastUpdated: data.checkInDate,
        } : undefined,
      },
      payment,
    })
  }

  // ==================== 付款管理 ====================

  async getPayments(params?: any) {
    await simulateDelay()
    
    let payments = mockDb.getPayments()
    
    // 應用過濾
    if (params?.roomId) {
      payments = payments.filter(payment => payment.roomId === params.roomId)
    }
    
    if (params?.type) {
      payments = payments.filter(payment => payment.type === params.type)
    }
    
    if (params?.status) {
      payments = payments.filter(payment => payment.status === params.status)
    }
    
    // 分頁
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    const paginatedPayments = payments.slice(start, end)
    
    return createApiResponse({
      items: paginatedPayments,
      total: payments.length,
      page,
      pageSize,
      totalPages: Math.ceil(payments.length / pageSize),
    })
  }

  async createPayment(data: CreatePaymentRequest) {
    await simulateDelay()
    
    // 驗證數據
    if (!data.roomId || !data.amount || !data.date) {
      return createApiResponse<SimplePayment>(undefined, {
        code: 'VALIDATION_ERROR',
        message: '缺少必要字段',
      })
    }
    
    const payment = mockDb.createPayment(data)
    return createApiResponse(payment)
  }

  // ==================== 租客管理 ====================

  async getTenants(params?: any) {
    await simulateDelay()
    
    let tenants = mockDb.getTenants()
    
    // 應用搜索
    if (params?.search) {
      const search = params.search.toLowerCase()
      tenants = tenants.filter(tenant => 
        tenant.name.toLowerCase().includes(search) ||
        tenant.phone.includes(search)
      )
    }
    
    // 分頁
    const page = params?.page || 1
    const pageSize = params?.pageSize || 20
    const start = (page - 1) * pageSize
    const end = start + pageSize
    
    const paginatedTenants = tenants.slice(start, end)
    
    return createApiResponse({
      items: paginatedTenants,
      total: tenants.length,
      page,
      pageSize,
      totalPages: Math.ceil(tenants.length / pageSize),
    })
  }

  // ==================== 統計報表 ====================

  async getRoomStats(propertyId?: string) {
    await simulateDelay()
    
    const rooms = mockDb.getRooms()
    const filteredRooms = propertyId 
      ? rooms.filter(room => room.propertyId === propertyId)
      : rooms
    
    const total = filteredRooms.length
    const available = filteredRooms.filter(r => r.status === 'available').length
    const occupied = filteredRooms.filter(r => r.status === 'occupied').length
    const maintenance = filteredRooms.filter(r => r.status === 'maintenance').length
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0
    
    const totalMonthlyRent = filteredRooms.reduce((sum, room) => sum + room.monthlyRent, 0)
    const averageRent = total > 0 ? Math.round(totalMonthlyRent / total) : 0
    
    const totalDeposit = filteredRooms.reduce((sum, room) => sum + room.deposit, 0)
    
    return createApiResponse({
      total,
      available,
      occupied,
      maintenance,
      occupancyRate,
      totalMonthlyRent,
      averageRent,
      totalDeposit,
    })
  }

  async getFinancialStats(params?: any) {
    await simulateDelay()
    
    const payments = mockDb.getPayments()
    
    // 按時間過濾
    let filteredPayments = payments
    if (params?.startDate || params?.endDate) {
      filteredPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.date)
        const startDate = params.startDate ? new Date(params.startDate) : null
        const endDate = params.endDate ? new Date(params.endDate) : null
        
        return (
          (!startDate || paymentDate >= startDate) &&
          (!endDate || paymentDate <= endDate)
        )
      })
    }
    
    // 計算統計
    const totalRentReceived = filteredPayments
      .filter(p => p.type === 'rent' && p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const totalDepositHeld = filteredPayments
      .filter(p => p.type === 'deposit' && p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const totalElectricityDue = filteredPayments
      .filter(p => p.type === 'electricity' && p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const pendingPayments = filteredPayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0)
    
    const pendingPaymentsCount = filteredPayments
      .filter(p => p.status === 'pending').length
    
    return createApiResponse({
      totalRentReceived,
      totalDepositHeld,
      totalElectricityDue,
      pendingPayments,
      pendingPaymentsCount,
    })
  }
}

// 創建全局模擬服務實例
export const mockApiService = new MockApiService()

// 檢查是否使用模擬模式
export const isMockMode = process.env.NEXT_PUBLIC_API_MODE === 'mock' || 
  typeof window !== 'undefined' && window.location.search.includes('mock=true')

// 根據模式返回適當的服務
export function getApiService() {
  return isMockMode ? mockApiService : null // 實際API服務待實現
}