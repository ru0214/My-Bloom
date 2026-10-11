export interface HealthRecord {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number | null; // kg
  bodyFat: number | null; // %
  bust: number | null; // cm 胸圍
  waist: number | null; // cm 腰圍
  hips: number | null; // cm 臀圍
  steps?: number | null; // 步數
  mounjaroDose: number; // mg (0 = 未施打, 2.5, 5, 7.5, 10, 12.5, 15)
  injectionSite?: string; // 施打部位：左下腹、右下腹、左大腿、右大腿、左上臂、右上臂
  isPeriod?: boolean; // 是否為生理期
  periodDay?: number; // 生理期第幾天 (1~7)
  notes?: string; // 備註 (副作用、食慾感受、運動)
  createdAt: number;
  updatedAt: number;
}

export interface MounjaroPurchase {
  id: string;
  date: string; // 購買日期 YYYY-MM-DD
  dosage: number; // 劑量規格 (mg/支，例如 2.5, 5, 7.5, 10, 15)
  quantity: number; // 支數或盒數
  price: number; // 購買價格 (NTD)
  notes?: string; // 備註 (無須藥局名稱)
  createdAt: number;
}

export interface UserSettings {
  targetWeight: number; // 目標體重 kg
  startWeight: number; // 起始體重 kg
  height: number; // 身高 cm (計算 BMI)
  dailyStepsTarget: number; // 每日步數目標 (預設 8000 或 10000)
  gender: 'female' | 'male';
  cycleDays: number; // 生理週期天數 (預設 28)
  syncKey: string; // 雲端同步識別碼
  autoSync: boolean; // 是否自動同步
  lastSyncTime: number | null; // 上次同步時間戳記
  themeColor?: string; // 介面主題配色 (預設 pink)
}

export interface AppData {
  records: HealthRecord[];
  purchases: MounjaroPurchase[];
  settings: UserSettings;
}

// 頻率：天 (Daily)、週 (Weekly average)、月 (Monthly average)、年 (Yearly average)
export type AggregationFreq = 'day' | 'week' | 'month' | 'year';

export const INJECTION_SITES = [
  { id: 'abdomen_left', label: '腹部左側 (左肚臍旁)' },
  { id: 'abdomen_right', label: '腹部右側 (右肚臍旁)' },
  { id: 'thigh_left', label: '大腿左前側' },
  { id: 'thigh_right', label: '大腿右前側' },
  { id: 'arm_left', label: '左上臂後外側' },
  { id: 'arm_right', label: '右上臂後外側' },
];

export const COMMON_DOSES = [0, 2.5, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0];
