// 新增翻譯項目（避免重複）

// 房間狀態翻譯（補充）
const roomStatusTranslations = {
  'zh-TW': {
    reserved: '已預訂',
    pending_payment: '待補繳',
  },
  'vi-VN': {
    reserved: 'Đã đặt trước',
    pending_payment: 'Chờ thanh toán',
  }
}

// 入住付款類型
const paymentTypeTranslations = {
  'zh-TW': {
    full: '一次繳納',
    deposit_only: '僅付押金',
    reservation_only: '僅預訂',
  },
  'vi-VN': {
    full: 'Thanh toán một lần',
    deposit_only: 'Chỉ đặt cọc',
    reservation_only: 'Chỉ đặt trước',
  }
}

// 退房類型
const checkOutTypeTranslations = {
  'zh-TW': {
    scheduled: '到期退房',
    early: '臨時退房',
  },
  'vi-VN': {
    scheduled: 'Trả phòng đúng hạn',
    early: 'Trả phòng sớm',
  }
}

// 操作按鈕
const actionButtonTranslations = {
  'zh-TW': {
    checkIn: '入住',
    checkOut: '退房',
    completePayment: '補繳',
    cancelReservation: '取消預訂',
    viewContract: '查看合約',
  },
  'vi-VN': {
    checkIn: 'Cho thuê',
    checkOut: 'Trả phòng',
    completePayment: 'Hoàn tất thanh toán',
    cancelReservation: 'Hủy đặt trước',
    viewContract: 'Xem hợp đồng',
  }
}

// 狀態標籤
const statusLabelTranslations = {
  'zh-TW': {
    contractInfo: '合約資訊',
    electricityInfo: '電費資訊',
  },
  'vi-VN': {
    contractInfo: 'Thông tin hợp đồng',
    electricityInfo: 'Thông tin điện',
  }
}

// 入住流程
const checkInProcessTranslations = {
  'zh-TW': {
    checkInProcess: '入住流程',
    selectPaymentType: '選擇付款方式',
    enterTenantInfo: '輸入租客資訊',
    setContractTerms: '設定合約條款',
    confirmCheckIn: '確認入住',
  },
  'vi-VN': {
    checkInProcess: 'Quy trình cho thuê',
    selectPaymentType: 'Chọn phương thức thanh toán',
    enterTenantInfo: 'Nhập thông tin người thuê',
    setContractTerms: 'Đặt điều khoản hợp đồng',
    confirmCheckIn: 'Xác nhận cho thuê',
  }
}

// 退房流程
const checkOutProcessTranslations = {
  'zh-TW': {
    checkOutProcess: '退房流程',
    finalMeterReading: '最後電錶讀數',
    calculateDeductions: '計算扣款項目',
    confirmCheckOut: '確認退房',
  },
  'vi-VN': {
    checkOutProcess: 'Quy trình trả phòng',
    finalMeterReading: 'Số điện cuối cùng',
    calculateDeductions: 'Tính toán khấu trừ',
    confirmCheckOut: 'Xác nhận trả phòng',
  }
}

// 表格視圖
const tableViewTranslations = {
  'zh-TW': {
    tableView: '表格',
    cardView: '卡片',
    listView: '列表',
    searchRooms: '搜尋房間...',
    noRoomsFound: '找不到房間',
    noRoomsFoundDescription: '沒有符合條件的房間，或尚未建立房間',
    addFirstRoom: '新增第一個房間',
    tenantInfo: '租客資訊',
    contractEnd: '合約到期',
    daysToExpire: '天後到期',
    confirmCancelReservation: '確定要取消預訂嗎？',
    monthly: '每月',
  },
  'vi-VN': {
    tableView: 'Bảng',
    cardView: 'Thẻ',
    listView: 'Danh sách',
    searchRooms: 'Tìm kiếm phòng...',
    noRoomsFound: 'Không tìm thấy phòng',
    noRoomsFoundDescription: 'Không có phòng phù hợp, hoặc chưa tạo phòng',
    addFirstRoom: 'Thêm phòng đầu tiên',
    tenantInfo: 'Thông tin người thuê',
    contractEnd: 'Hết hạn hợp đồng',
    daysToExpire: 'ngày nữa hết hạn',
    confirmCancelReservation: 'Bạn có chắc chắn muốn hủy đặt trước không?',
    monthly: 'Hàng tháng',
  }
}