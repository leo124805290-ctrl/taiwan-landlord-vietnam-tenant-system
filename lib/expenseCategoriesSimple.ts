// 簡化的支出分類系統 - 分層結構

// 大項分類（第一層）
export const mainCategories = [
  { id: 'renovation', name: '裝修費用', name_vn: 'Chi phí cải tạo' },
  { id: 'repair', name: '維修費用', name_vn: 'Chi phí sửa chữa' },
  { id: 'management', name: '管理費用', name_vn: 'Chi phí quản lý' },
  { id: 'tax', name: '稅金費用', name_vn: 'Chi phí thuế' },
  { id: 'other', name: '其他支出', name_vn: 'Chi phí khác' }
] as const

export type MainCategory = typeof mainCategories[number]['id']

// 中項分類（第二層）
export const subCategories = [
  // 裝修費用 - 中項
  { id: 'electrical_plumbing', name: '水電裝修', name_vn: 'Sửa chữa điện nước', mainCategory: 'renovation' },
  { id: 'ac_installation', name: '冷氣裝修', name_vn: 'Lắp đặt điều hòa', mainCategory: 'renovation' },
  { id: 'interior_renovation', name: '裝潢/隔間', name_vn: 'Nội thất/Vách ngăn', mainCategory: 'renovation' },
  { id: 'appliance_purchase', name: '電器購置', name_vn: 'Mua sắm thiết bị', mainCategory: 'renovation' },
  { id: 'other_renovation', name: '其他裝修', name_vn: 'Cải tạo khác', mainCategory: 'renovation' },
  
  // 維修費用 - 中項
  { id: 'appliance_repair', name: '電器維修', name_vn: 'Sửa chữa thiết bị', mainCategory: 'repair' },
  { id: 'interior_repair', name: '裝潢/隔間維修', name_vn: 'Sửa chữa nội thất', mainCategory: 'repair' },
  { id: 'electrical_plumbing_repair', name: '水電維修', name_vn: 'Sửa chữa điện nước', mainCategory: 'repair' },
  { id: 'public_area_repair', name: '公共區域維修', name_vn: 'Sửa chữa khu vực chung', mainCategory: 'repair' },
  { id: 'other_repair', name: '其他維修', name_vn: 'Sửa chữa khác', mainCategory: 'repair' },
  
  // 管理費用 - 中項
  { id: 'cleaning', name: '清潔費用', name_vn: 'Chi phí vệ sinh', mainCategory: 'management' },
  { id: 'management_fee', name: '管理費', name_vn: 'Phí quản lý', mainCategory: 'management' },
  { id: 'garbage', name: '垃圾清運', name_vn: 'Thu gom rác', mainCategory: 'management' },
  { id: 'other_management', name: '其他管理費', name_vn: 'Chi phí quản lý khác', mainCategory: 'management' },
  
  // 稅金費用 - 中項
  { id: 'property_tax', name: '房屋稅', name_vn: 'Thuế nhà', mainCategory: 'tax' },
  { id: 'other_tax', name: '其他稅金', name_vn: 'Thuế khác', mainCategory: 'tax' },
  
  // 其他支出 - 中項
  { id: 'miscellaneous', name: '雜項支出', name_vn: 'Chi phí linh tinh', mainCategory: 'other' }
] as const

// 小項分類（第三層，可選）
export const detailCategories = [
  // 水電裝修 - 小項
  { id: 'rewiring', name: '電線重牽', name_vn: 'Thay dây điện', subCategory: 'electrical_plumbing' },
  { id: 'pipe_replacement', name: '水管更新', name_vn: 'Thay ống nước', subCategory: 'electrical_plumbing' },
  
  // 冷氣裝修 - 小項
  { id: 'split_ac', name: '分離式冷氣安裝', name_vn: 'Lắp đặt điều hòa tách', subCategory: 'ac_installation' },
  { id: 'window_ac', name: '窗型冷氣安裝', name_vn: 'Lắp đặt điều hòa cửa sổ', subCategory: 'ac_installation' },
  
  // 裝潢/隔間 - 小項
  { id: 'partition_wall', name: '隔間牆', name_vn: 'Tường ngăn', subCategory: 'interior_renovation' },
  { id: 'flooring', name: '地板', name_vn: 'Sàn nhà', subCategory: 'interior_renovation' },
  { id: 'painting', name: '油漆', name_vn: 'Sơn', subCategory: 'interior_renovation' },
  
  // 電器購置 - 小項
  { id: 'water_heater', name: '熱水器', name_vn: 'Máy nước nóng', subCategory: 'appliance_purchase' },
  { id: 'washing_machine', name: '洗衣機', name_vn: 'Máy giặt', subCategory: 'appliance_purchase' },
  { id: 'refrigerator', name: '冰箱', name_vn: 'Tủ lạnh', subCategory: 'appliance_purchase' },
  
  // 電器維修 - 小項
  { id: 'ac_repair', name: '冷氣維修', name_vn: 'Sửa chữa điều hòa', subCategory: 'appliance_repair' },
  { id: 'water_heater_repair', name: '熱水器維修', name_vn: 'Sửa chữa máy nước nóng', subCategory: 'appliance_repair' }
] as const

// 輔助函數
export function getSubCategories(mainCategoryId: MainCategory) {
  return subCategories.filter(cat => cat.mainCategory === mainCategoryId)
}

export function getDetailCategories(subCategoryId: string) {
  return detailCategories.filter(cat => cat.subCategory === subCategoryId)
}

export function getName(item: any, lang: 'zh-TW' | 'vi-VN') {
  return lang === 'vi-VN' ? item.name_vn || item.name : item.name
}

// 範例：如何建立分層下拉選單
export const expenseFormExample = {
  // 表單狀態
  formState: {
    mainCategory: '' as MainCategory | '',
    subCategory: '',
    detailCategory: '',
    amount: '',
    description: '',
    room: ''
  },
  
  // 處理大項選擇
  handleMainCategoryChange: (value: MainCategory) => {
    // 1. 更新大項
    // 2. 清空中項和小項
    // 3. 根據大項篩選可用的中項
  },
  
  // 處理中項選擇
  handleSubCategoryChange: (value: string) => {
    // 1. 更新中項
    // 2. 清空小項
    // 3. 根據中項篩選可用的小項
  },
  
  // 處理小項選擇
  handleDetailCategoryChange: (value: string) => {
    // 更新小項
  }
}