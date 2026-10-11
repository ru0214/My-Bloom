import { AppData, HealthRecord, MounjaroPurchase, UserSettings } from '../types';

const LOCAL_STORAGE_KEY = 'mounjaro_tracker_data_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  targetWeight: 52.0,
  startWeight: 66.5,
  height: 162,
  dailyStepsTarget: 8000,
  gender: 'female',
  cycleDays: 28,
  syncKey: '',
  autoSync: true,
  lastSyncTime: null,
  themeColor: 'pink',
};

// Generate realistic 30-day initial demo data
export function generateSampleData(): AppData {
  const records: HealthRecord[] = [];
  const purchases: MounjaroPurchase[] = [];
  const today = new Date();

  // Create purchases: e.g. 2.5mg 4 pens, 5.0mg 4 pens
  purchases.push({
    id: 'p-1',
    date: getOffsetDateString(today, -28),
    dosage: 2.5,
    quantity: 4,
    price: 12000,
    notes: '2.5mg 初階適應劑量 1盒4支',
    createdAt: Date.now() - 28 * 86400000,
  });

  purchases.push({
    id: 'p-2',
    date: getOffsetDateString(today, -7),
    dosage: 5.0,
    quantity: 4,
    price: 15000,
    notes: '5.0mg 維持進階劑量 1盒4支',
    createdAt: Date.now() - 7 * 86400000,
  });

  // Base measurements
  let currentWeight = 66.5;
  let currentFat = 31.8;
  let currentBust = 91.0;
  let currentWaist = 78.5;
  let currentHips = 97.0;

  const sites = [
    '腹部左側 (左肚臍旁)',
    '腹部右側 (右肚臍旁)',
    '大腿左前側',
    '大腿右前側',
    '腹部左側 (左肚臍旁)',
  ];

  // Past 28 days
  for (let i = 28; i >= 0; i--) {
    const dStr = getOffsetDateString(today, -i);
    const isInjectionDay = i % 7 === 0;
    const dose = isInjectionDay ? (i > 7 ? 2.5 : 5.0) : 0;
    const injectionSite = isInjectionDay ? sites[Math.floor(i / 7) % sites.length] : undefined;

    const isPeriod = i >= 14 && i <= 18;
    const periodDay = isPeriod ? 19 - i : undefined;

    const drop = 0.08 + (isInjectionDay ? 0.2 : 0) + (Math.sin(i) * 0.05);
    const periodEffect = isPeriod ? 0.35 : 0;
    currentWeight = Math.max(50, +(currentWeight - drop + periodEffect * (i === 18 ? 0.3 : -0.1)).toFixed(1));
    currentFat = +(currentFat - 0.04).toFixed(1);

    const hasMeasurements = i % 4 === 0 || i === 0;
    if (hasMeasurements) {
      currentWaist = +(currentWaist - 0.25).toFixed(1);
      currentHips = +(currentHips - 0.2).toFixed(1);
      currentBust = +(currentBust - 0.1).toFixed(1);
    }

    // Daily steps variation (6500 - 10500)
    const steps = Math.floor(6500 + Math.abs(Math.sin(i * 1.5)) * 4000);

    records.push({
      id: `rec-${dStr}`,
      date: dStr,
      weight: currentWeight,
      bodyFat: currentFat,
      bust: hasMeasurements ? currentBust : null,
      waist: hasMeasurements ? currentWaist : null,
      hips: hasMeasurements ? currentHips : null,
      steps,
      mounjaroDose: dose,
      injectionSite,
      isPeriod,
      periodDay,
      notes: isInjectionDay
        ? `第 ${Math.floor((28 - i) / 7) + 1} 週施打 ${dose}mg，施打部位：${injectionSite}`
        : isPeriod
        ? `生理期第 ${periodDay} 天，多補充溫水與電解質`
        : undefined,
      createdAt: Date.now() - i * 86400000,
      updatedAt: Date.now() - i * 86400000,
    });
  }

  return {
    records,
    purchases,
    settings: {
      ...DEFAULT_SETTINGS,
      startWeight: 66.5,
      targetWeight: 52.0,
      dailyStepsTarget: 8000,
    },
  };
}

function getOffsetDateString(baseDate: Date, offsetDays: number): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export function loadLocalData(): AppData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.records)) {
        return {
          records: parsed.records || [],
          purchases: parsed.purchases || [],
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        };
      }
    }
  } catch (err) {
    console.error('Error reading localStorage:', err);
  }
  const sample = generateSampleData();
  saveLocalData(sample);
  return sample;
}

export function saveLocalData(data: AppData): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error writing to localStorage:', err);
  }
}

export async function generateCloudCode(): Promise<string> {
  try {
    const res = await fetch('/api/sync/generate-code', { method: 'POST' });
    if (res.ok) {
      const json = await res.json();
      return json.code;
    }
  } catch (e) {
    console.error('Failed to generate cloud code', e);
  }
  return 'MJ-' + Math.floor(1000 + Math.random() * 9000);
}

export async function fetchCloudData(key: string): Promise<AppData | null> {
  if (!key) return null;
  try {
    const res = await fetch(`/api/sync/${encodeURIComponent(key.trim())}`);
    if (res.ok) {
      const result = await res.json();
      if (result && result.data) {
        return result.data as AppData;
      }
    }
  } catch (e) {
    console.error('Failed to fetch from cloud', e);
  }
  return null;
}

export async function saveCloudData(key: string, data: AppData): Promise<boolean> {
  if (!key) return false;
  try {
    const res = await fetch(`/api/sync/${encodeURIComponent(key.trim())}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
    return res.ok;
  } catch (e) {
    console.error('Failed to save to cloud', e);
    return false;
  }
}

export function exportToJson(data: AppData): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `猛健樂與身體數據備份_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCsv(records: HealthRecord[]): void {
  const headers = [
    '日期',
    '體重(kg)',
    '體脂率(%)',
    '胸圍(cm)',
    '腰圍(cm)',
    '臀圍(cm)',
    '步數',
    '猛健樂施打劑量(mg)',
    '施打部位',
    '生理期',
    '經期天數',
    '備註',
  ];

  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  const rows = sorted.map((r) => [
    r.date,
    r.weight !== null ? r.weight : '',
    r.bodyFat !== null ? r.bodyFat : '',
    r.bust !== null ? r.bust : '',
    r.waist !== null ? r.waist : '',
    r.hips !== null ? r.hips : '',
    r.steps !== null && r.steps !== undefined ? r.steps : '',
    r.mounjaroDose > 0 ? r.mounjaroDose : '未施打',
    r.injectionSite || '',
    r.isPeriod ? '是' : '否',
    r.periodDay || '',
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `猛健樂身體數據表_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseImportJson(fileContent: string): AppData {
  const parsed = JSON.parse(fileContent);
  if (!parsed || !Array.isArray(parsed.records)) {
    throw new Error('格式不正確，找不到紀錄列表');
  }
  return {
    records: parsed.records || [],
    purchases: parsed.purchases || [],
    settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
  };
}
