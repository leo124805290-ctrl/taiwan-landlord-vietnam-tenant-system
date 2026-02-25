// 簡單測試腳本檢查數據
console.log("檢查財務總覽數據問題...")

// 模擬數據結構
const mockData = {
  properties: [
    {
      id: 1,
      name: "台北中山店",
      rooms: [
        { id: 101, n: "101", r: 8000, d: 16000, s: "occupied" },
        { id: 102, n: "102", r: 7500, d: 15000, s: "available" }
      ]
    },
    {
      id: 2,
      name: "台中逢甲店",
      rooms: [
        { id: 201, n: "201", r: 9000, d: 18000, s: "occupied" },
        { id: 202, n: "202", r: 8500, d: 17000, s: "pending_checkin_paid" }
      ]
    }
  ]
}

console.log("模擬數據中的物業數量:", mockData.properties.length)
console.log("物業1:", mockData.properties[0].name, "房間數:", mockData.properties[0].rooms.length)
console.log("物業2:", mockData.properties[1].name, "房間數:", mockData.properties[1].rooms.length)

// 測試財務統計計算
const allRooms = mockData.properties.flatMap(property => 
  property.rooms.map(room => ({
    ...room,
    propertyName: property.name,
    propertyId: property.id
  }))
)

console.log("\n全部房間數量:", allRooms.length)
console.log("已出租房間:", allRooms.filter(r => r.s === 'occupied').length)
console.log("待入住已付:", allRooms.filter(r => r.s === 'pending_checkin_paid').length)

// 計算租金收入潛力
const totalRentPotential = allRooms.reduce((sum, room) => 
  sum + (room.r || 0), 0
)

console.log("\n租金收入潛力:", totalRentPotential)

// 計算押金
const depositStats = allRooms.reduce((acc, room) => {
  const deposit = room.d || 0
  
  if (room.s === 'occupied') {
    acc.occupiedDeposit += deposit
  } else if (room.s === 'pending_checkin_paid') {
    acc.prepaidDeposit += deposit
  }
  
  return acc
}, { occupiedDeposit: 0, prepaidDeposit: 0 })

depositStats.totalDeposit = depositStats.occupiedDeposit + depositStats.prepaidDeposit

console.log("\n押金統計:")
console.log("- 已入住押金:", depositStats.occupiedDeposit)
console.log("- 預付押金:", depositStats.prepaidDeposit)
console.log("- 總保管押金:", depositStats.totalDeposit)