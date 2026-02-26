// 支出分類定義 - 分層結構

// 大項分類（第一層）
export type MainCategory = 'renovation' | 'repair' | 'management' | 'tax' | 'other'

// 中項分類（第二層）
export interface SubCategory {
  id: string
  name: string
  mainCategory: MainCategory
}

// 小項分類（第三層，可選）
export interface DetailCategory {
  id: string
  name: string
  subCategoryId: string
}

// 完整的分類定義
export const expenseCategories = {
  // 大項分類定義
  mainCategories: [
    { id: 'renovation', name: '裝修費用', color: 'bg-blue-100 text-blue-700', icon: '🏗️' },
    { id: 'repair', name: '維修費用', color: 'bg-orange-100 text-orange-700', icon: '🔧' },
    { id: 'management', name: '管理費用', color: 'bg-green-100 text-green-700', icon: '📊' },
    { id: 'tax', name: '稅金費用', color: 'bg-red-100 text-red-700', icon: '💰' },
    { id: 'other', name: '其他支出', color: 'bg-gray-100 text-gray-700', icon: '📝' }
  ] as const,
  
  // 中項分類定義
  subCategories: [
    // 裝修費用 - 中項
    { id: 'electrical_plumbing', name: '水電裝修', mainCategory: 'renovation' },
    { id: 'ac_installation', name: '冷氣裝修', mainCategory: 'renovation' },
    { id: 'interior_renovation', name: '裝潢/隔間', mainCategory: 'renovation' },
    { id: 'appliance_purchase', name: '電器購置', mainCategory: 'renovation' },
    { id: 'bathroom_equipment', name: '衛浴設備', mainCategory: 'renovation' },
    { id: 'kitchen_equipment', name: '廚房設備', mainCategory: 'renovation' },
    { id: 'door_window', name: '門窗工程', mainCategory: 'renovation' },
    { id: 'other_renovation', name: '其他裝修', mainCategory: 'renovation' },
    
    // 維修費用 - 中項
    { id: 'elevator_repair', name: '電梯維修', mainCategory: 'repair' },
    { id: 'appliance_repair', name: '電器維修', mainCategory: 'repair' },
    { id: 'interior_repair', name: '裝潢/隔間維修', mainCategory: 'repair' },
    { id: 'electrical_plumbing_repair', name: '水電維修', mainCategory: 'repair' },
    { id: 'door_window_repair', name: '門窗維修', mainCategory: 'repair' },
    { id: 'bathroom_repair', name: '衛浴維修', mainCategory: 'repair' },
    { id: 'public_area_repair', name: '公共區域維修', mainCategory: 'repair' },
    { id: 'other_repair', name: '其他維修', mainCategory: 'repair' },
    
    // 管理費用 - 中項
    { id: 'cleaning', name: '清潔費用', mainCategory: 'management' },
    { id: 'management_fee', name: '管理費', mainCategory: 'management' },
    { id: 'security', name: '保全費用', mainCategory: 'management' },
    { id: 'garbage', name: '垃圾清運', mainCategory: 'management' },
    { id: 'public_utilities', name: '公共水電費', mainCategory: 'management' },
    { id: 'other_management', name: '其他管理費', mainCategory: 'management' },
    
    // 稅金費用 - 中項
    { id: 'property_tax', name: '房屋稅', mainCategory: 'tax' },
    { id: 'land_tax', name: '地價稅', mainCategory: 'tax' },
    { id: 'income_tax', name: '所得稅', mainCategory: 'tax' },
    { id: 'other_tax', name: '其他稅金', mainCategory: 'tax' },
    
    // 其他支出 - 中項
    { id: 'miscellaneous', name: '雜項支出', mainCategory: 'other' }
  ] as const,
  
  // 小項分類定義（可選，根據需要擴充）
  detailCategories: [
    // 水電裝修 - 小項
    { id: 'rewiring', name: '電線重牽', subCategoryId: 'electrical_plumbing' },
    { id: 'pipe_replacement', name: '水管更新', subCategoryId: 'electrical_plumbing' },
    { id: 'switch_replacement', name: '開關更換', subCategoryId: 'electrical_plumbing' },
    
    // 冷氣裝修 - 小項
    { id: 'split_ac', name: '分離式冷氣安裝', subCategoryId: 'ac_installation' },
    { id: 'window_ac', name: '窗型冷氣安裝', subCategoryId: 'ac_installation' },
    { id: 'piping', name: '冷氣管線配置', subCategoryId: 'ac_installation' },
    
    // 裝潢/隔間 - 小項
    { id: 'partition_wall', name: '隔間牆', subCategoryId: 'interior_renovation' },
    { id: 'ceiling', name: '天花板', subCategoryId: 'interior_renovation' },
    { id: 'flooring', name: '地板', subCategoryId: 'interior_renovation' },
    { id: 'painting', name: '油漆', subCategoryId: 'interior_renovation' },
    
    // 電器購置 - 小項
    { id: 'water_heater', name: '熱水器', subCategoryId: 'appliance_purchase' },
    { id: 'washing_machine', name: '洗衣機', subCategoryId: 'appliance_purchase' },
    { id: 'refrigerator', name: '冰箱', subCategoryId: 'appliance_purchase' },
    
    // 電器維修 - 小項
    { id: 'ac_repair', name: '冷氣維修', subCategoryId: 'appliance_repair' },
    { id: 'water_heater_repair', name: '熱水器維修', subCategoryId: 'appliance_repair' },
    { id: 'washing_machine_repair', name: '洗衣機維修', subCategoryId: 'appliance_repair' }
  ] as const
}

// 輔助函數
export function getMainCategory(id: MainCategory) {
  return expenseCategories.mainCategories.find(cat => cat.id === id)
}

export function getSubCategories(mainCategoryId: MainCategory) {
  return expenseCategories.subCategories.filter(cat => cat.mainCategory === mainCategoryId)
}

export function getDetailCategories(subCategoryId: string) {
  return expenseCategories.detailCategories.filter(cat => cat.subCategoryId === subCategoryId)
}

export function getCategoryPath(mainId: MainCategory, subId?: string, detailId?: string) {
  const main = getMainCategory(mainId)
  const sub = subId ? expenseCategories.subCategories.find(c => c.id === subId) : null
  const detail = detailId ? expenseCategories.detailCategories.find(c => c.id === detailId) : null
  
  return {
    main: main?.name || '',
    sub: sub?.name || '',
    detail: detail?.name || '',
    fullPath: [main?.name, sub?.name, detail?.name].filter(Boolean).join(' → ')
  }
}