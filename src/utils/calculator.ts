import { HealthRecord, UserSettings, AggregationFreq, MounjaroPurchase } from '../types';

export interface SummaryStats {
  latestWeight: number | null;
  previousWeight: number | null;
  weightChangeFromPrevious: number | null;
  weightChangeFromStart: number | null;
  targetWeight: number;
  weightToTarget: number | null;
  progressPercent: number;
  latestBodyFat: number | null;
  bodyFatChangeFromStart: number | null;
  latestBust: number | null;
  bustChange: number | null;
  latestWaist: number | null;
  waistChange: number | null;
  latestHips: number | null;
  hipsChange: number | null;
  whr: number | null;
  bmi: number | null;
  bmiCategory: string;
  nextInjectionDate: string | null;
  daysUntilNextInjection: number | null;
  lastInjectionDose: number | null;
  lastInjectionDate: string | null;
  lastInjectionSite: string | null;
  suggestedNextSite: string;
  totalInjectionsCount: number;
  latestSteps: number | null;
  todaySteps: number | null;
  stepsTarget: number;
  stepsPercent: number;
}

export function computeSummaryStats(
  records: HealthRecord[],
  settings: UserSettings
): SummaryStats {
  const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const oldestRecord = [...records].sort((a, b) => a.date.localeCompare(b.date))[0];

  const recordsWithWeight = sortedRecords.filter((r) => r.weight !== null && r.weight > 0);
  const latestWeightRecord = recordsWithWeight[0] || null;
  const prevWeightRecord = recordsWithWeight[1] || null;

  const latestWeight = latestWeightRecord ? latestWeightRecord.weight : null;
  const previousWeight = prevWeightRecord ? prevWeightRecord.weight : null;

  const startWeight = settings.startWeight || (oldestRecord?.weight ?? (latestWeight || 70));
  const targetWeight = settings.targetWeight || 52;

  let weightChangeFromPrevious: number | null = null;
  if (latestWeight !== null && previousWeight !== null) {
    weightChangeFromPrevious = +(latestWeight - previousWeight).toFixed(1);
  }

  let weightChangeFromStart: number | null = null;
  if (latestWeight !== null && startWeight) {
    weightChangeFromStart = +(latestWeight - startWeight).toFixed(1);
  }

  let weightToTarget: number | null = null;
  let progressPercent = 0;
  if (latestWeight !== null) {
    weightToTarget = +(latestWeight - targetWeight).toFixed(1);
    const totalGoalLoss = startWeight - targetWeight;
    const currentLoss = startWeight - latestWeight;
    if (totalGoalLoss > 0) {
      progressPercent = Math.min(100, Math.max(0, Math.round((currentLoss / totalGoalLoss) * 100)));
    }
  }

  // Body Fat
  const recordsWithFat = sortedRecords.filter((r) => r.bodyFat !== null && r.bodyFat > 0);
  const latestBodyFat = recordsWithFat[0]?.bodyFat ?? null;
  const oldestFat = [...recordsWithFat].reverse()[0]?.bodyFat ?? null;
  const bodyFatChangeFromStart =
    latestBodyFat !== null && oldestFat !== null ? +(latestBodyFat - oldestFat).toFixed(1) : null;

  // Measurements
  const recordsWithBust = sortedRecords.filter((r) => r.bust !== null && r.bust > 0);
  const latestBust = recordsWithBust[0]?.bust ?? null;
  const prevBust = recordsWithBust[1]?.bust ?? null;
  const bustChange = latestBust !== null && prevBust !== null ? +(latestBust - prevBust).toFixed(1) : null;

  const recordsWithWaist = sortedRecords.filter((r) => r.waist !== null && r.waist > 0);
  const latestWaist = recordsWithWaist[0]?.waist ?? null;
  const prevWaist = recordsWithWaist[1]?.waist ?? null;
  const waistChange = latestWaist !== null && prevWaist !== null ? +(latestWaist - prevWaist).toFixed(1) : null;

  const recordsWithHips = sortedRecords.filter((r) => r.hips !== null && r.hips > 0);
  const latestHips = recordsWithHips[0]?.hips ?? null;
  const prevHips = recordsWithHips[1]?.hips ?? null;
  const hipsChange = latestHips !== null && prevHips !== null ? +(latestHips - prevHips).toFixed(1) : null;

  // Waist-to-Hip Ratio (WHR)
  let whr: number | null = null;
  if (latestWaist && latestHips) {
    whr = +(latestWaist / latestHips).toFixed(2);
  }

  // BMI
  let bmi: number | null = null;
  let bmiCategory = '健康標準';
  if (latestWeight && settings.height > 0) {
    const heightInMeters = settings.height / 100;
    bmi = +(latestWeight / (heightInMeters * heightInMeters)).toFixed(1);
    if (bmi < 18.5) bmiCategory = '體重過輕';
    else if (bmi < 24) bmiCategory = '健康標準';
    else if (bmi < 27) bmiCategory = '體重過重';
    else if (bmi < 30) bmiCategory = '輕度肥胖';
    else if (bmi < 35) bmiCategory = '中度肥胖';
    else bmiCategory = '重度肥胖';
  }

  // Steps
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = sortedRecords.find((r) => r.date === todayStr);
  const recordsWithSteps = sortedRecords.filter((r) => r.steps !== null && r.steps !== undefined && r.steps > 0);
  const todaySteps = todayRecord?.steps ?? null;
  const latestSteps = todaySteps ?? (recordsWithSteps[0]?.steps ?? null);
  const stepsTarget = settings.dailyStepsTarget || 8000;
  const stepsPercent = latestSteps ? Math.min(100, Math.round((latestSteps / stepsTarget) * 100)) : 0;

  // Next injection date & count
  const injectionRecords = sortedRecords.filter((r) => r.mounjaroDose > 0);
  const totalInjectionsCount = injectionRecords.length;
  const lastInjection = injectionRecords[0] || null;

  let nextInjectionDate: string | null = null;
  let daysUntilNextInjection: number | null = null;
  let lastInjectionDose: number | null = null;
  let lastInjectionDate: string | null = null;
  let lastInjectionSite: string | null = null;
  let suggestedNextSite = '腹部右側 (建議輪替)';

  if (lastInjection) {
    lastInjectionDose = lastInjection.mounjaroDose;
    lastInjectionDate = lastInjection.date;
    lastInjectionSite = lastInjection.injectionSite || '未填寫';

    const lastDate = new Date(lastInjection.date);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 7);
    nextInjectionDate = nextDate.toISOString().split('T')[0];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = nextDate.getTime() - today.getTime();
    daysUntilNextInjection = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (lastInjection.injectionSite?.includes('腹部左側')) {
      suggestedNextSite = '腹部右側 (左側已休整)';
    } else if (lastInjection.injectionSite?.includes('腹部右側')) {
      suggestedNextSite = '大腿前側或腹部左側';
    } else if (lastInjection.injectionSite?.includes('大腿')) {
      suggestedNextSite = '腹部周圍 (距肚臍5cm)';
    } else {
      suggestedNextSite = '腹部兩側輪替 (避開肚臍周圍5cm)';
    }
  }

  return {
    latestWeight,
    previousWeight,
    weightChangeFromPrevious,
    weightChangeFromStart,
    targetWeight,
    weightToTarget,
    progressPercent,
    latestBodyFat,
    bodyFatChangeFromStart,
    latestBust,
    bustChange,
    latestWaist,
    waistChange,
    latestHips,
    hipsChange,
    whr,
    bmi,
    bmiCategory,
    nextInjectionDate,
    daysUntilNextInjection,
    lastInjectionDose,
    lastInjectionDate,
    lastInjectionSite,
    suggestedNextSite,
    totalInjectionsCount,
    latestSteps,
    todaySteps,
    stepsTarget,
    stepsPercent,
  };
}

export function getInjectionOrderMap(records: HealthRecord[]): Map<string, number> {
  const map = new Map<string, number>();
  const ascending = [...records]
    .filter((r) => r.mounjaroDose > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  ascending.forEach((rec, idx) => {
    map.set(rec.date, idx + 1);
  });
  return map;
}

export function computeMounjaroDoseStats(
  records: HealthRecord[],
  purchases: MounjaroPurchase[]
) {
  const totalPurchasedMg = purchases.reduce((sum, p) => sum + (p.dosage || 0) * (p.quantity || 1), 0);
  const totalInjectedMg = records.reduce((sum, r) => sum + (r.mounjaroDose || 0), 0);
  const remainingMg = Math.max(0, +(totalPurchasedMg - totalInjectedMg).toFixed(2));

  const sorted = [...records].filter((r) => r.mounjaroDose > 0).sort((a, b) => b.date.localeCompare(a.date));
  const currentDose = sorted[0]?.mounjaroDose || (purchases[0]?.dosage || 2.5);

  const remainingTimes = currentDose > 0 ? Math.floor(remainingMg / currentDose) : 0;
  const remainingFraction = currentDose > 0 ? +(remainingMg / currentDose).toFixed(1) : 0;

  return {
    totalPurchasedMg,
    totalInjectedMg,
    remainingMg,
    currentDose,
    remainingTimes,
    remainingFraction,
    totalPurchasesCount: purchases.length,
  };
}

export function formatNoYearDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return dateStr;
}

export interface AggregatedPoint {
  label: string;
  dateKey: string;
  weight: number | null;
  bodyFat: number | null;
  bust: number | null;
  waist: number | null;
  hips: number | null;
  steps: number | null;
  hasInjection: boolean;
  totalInjectionDose: number;
  hasPeriod: boolean;
  count: number;
  sampleRecord?: HealthRecord;
}

// Group records by frequency: 'day', 'week', 'month', 'year'
// For 'day', allows 7-day window so the graph range is nicely focused (只有七天的大小 每天是多少)
// For 'month', allows monthly paging with "<" "月份" ">" buttons, displaying daily records for that month
export function aggregateRecordsByFreq(
  records: HealthRecord[],
  freq: AggregationFreq,
  dayOffset: number = 0, // 0 = most recent 7 days, 1 = previous 7 days, etc.
  monthOffset: number = 0 // 0 = current month, 1 = previous month, etc.
): {
  points: AggregatedPoint[];
  totalDayPages: number;
  currentDayRangeLabel: string;
  totalMonthPages: number;
  currentMonthLabel: string;
} {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  // Determine available months for month pagination
  const allMonthsSet = new Set<string>();
  sorted.forEach((r) => {
    allMonthsSet.add(r.date.slice(0, 7)); // 'YYYY-MM'
  });
  const todayMonth = new Date().toISOString().slice(0, 7);
  allMonthsSet.add(todayMonth);
  const availableMonths = Array.from(allMonthsSet).sort((a, b) => b.localeCompare(a)); // Newest first
  const totalMonthPages = Math.max(1, availableMonths.length);
  const safeMonthOffset = Math.max(0, Math.min(monthOffset, totalMonthPages - 1));
  const targetMonthStr = availableMonths[safeMonthOffset] || todayMonth;
  const targetMonthNum = parseInt(targetMonthStr.slice(5, 7), 10);
  const currentMonthLabel = `${targetMonthNum}月`;

  if (sorted.length === 0) {
    return {
      points: [],
      totalDayPages: 1,
      currentDayRangeLabel: '',
      totalMonthPages: 1,
      currentMonthLabel: `${new Date().getMonth() + 1}月`,
    };
  }

  if (freq === 'day') {
    // 最近：包含所有每日紀錄，橫軸支援左右滑動查看全部時間紀錄
    const points = sorted.map((r) => ({
      label: formatNoYearDate(r.date), // 月份/日期 (MM/DD)
      dateKey: r.date,
      weight: r.weight,
      bodyFat: r.bodyFat,
      bust: r.bust,
      waist: r.waist,
      hips: r.hips,
      steps: r.steps ?? null,
      hasInjection: r.mounjaroDose > 0,
      totalInjectionDose: r.mounjaroDose,
      hasPeriod: !!r.isPeriod,
      count: 1,
      sampleRecord: r,
    }));

    const firstDate = formatNoYearDate(sorted[0]?.date) || '';
    const lastDate = formatNoYearDate(sorted[sorted.length - 1]?.date) || '';
    // 區間表示 (例如 10/04 ~ 10/10)
    const currentDayRangeLabel = sorted.length > 0 ? `${firstDate} ~ ${lastDate}` : '';

    return {
      points,
      totalDayPages: 1,
      currentDayRangeLabel,
      totalMonthPages,
      currentMonthLabel,
    };
  }

  if (freq === 'month') {
    // 月：整個月的平均，橫軸為 115/9、115/10 (民國年份/月份)
    const monthGroups = new Map<string, HealthRecord[]>();

    sorted.forEach((r) => {
      const ym = r.date.slice(0, 7); // 'YYYY-MM'
      if (!monthGroups.has(ym)) {
        monthGroups.set(ym, []);
      }
      monthGroups.get(ym)!.push(r);
    });

    const points: AggregatedPoint[] = [];
    const sortedYmKeys = Array.from(monthGroups.keys()).sort();

    sortedYmKeys.forEach((ym) => {
      const recordsInMonth = monthGroups.get(ym)!;
      const [yearStr, monthStr] = ym.split('-');
      const y = parseInt(yearStr, 10);
      const rocYear = y > 1911 ? y - 1911 : y;
      const m = parseInt(monthStr, 10);
      const label = `${rocYear}/${m}`; // 橫軸：115/9, 115/10 (年份/月份)

      const calcAvg = (getter: (r: HealthRecord) => number | null | undefined): number | null => {
        const vals = recordsInMonth.map(getter).filter((v): v is number => v !== null && v !== undefined && v > 0);
        if (vals.length === 0) return null;
        const sum = vals.reduce((a, b) => a + b, 0);
        return +(sum / vals.length).toFixed(1);
      };

      const hasInjection = recordsInMonth.some((r) => r.mounjaroDose > 0);
      const totalInjectionDose = recordsInMonth.reduce((sum, r) => sum + r.mounjaroDose, 0);
      const hasPeriod = recordsInMonth.some((r) => r.isPeriod);

      points.push({
        label,
        dateKey: ym,
        weight: calcAvg((r) => r.weight),
        bodyFat: calcAvg((r) => r.bodyFat),
        bust: calcAvg((r) => r.bust),
        waist: calcAvg((r) => r.waist),
        hips: calcAvg((r) => r.hips),
        steps: calcAvg((r) => r.steps),
        hasInjection,
        totalInjectionDose,
        hasPeriod,
        count: recordsInMonth.length,
        sampleRecord: recordsInMonth[recordsInMonth.length - 1],
      });
    });

    const firstMonthLabel = points[0]?.label || '';
    const lastMonthLabel = points[points.length - 1]?.label || '';
    const currentMonthLabel = points.length > 1
      ? `${firstMonthLabel} ~ ${lastMonthLabel}`
      : firstMonthLabel || '115/10';

    return {
      points,
      totalDayPages: 1,
      currentDayRangeLabel: '',
      totalMonthPages: 1,
      currentMonthLabel,
    };
  }

  // Week / Year
  const groups = new Map<string, HealthRecord[]>();

  sorted.forEach((r) => {
    let key = '';

    if (freq === 'week') {
      const [yearStr, monthStr, dayStr] = r.date.split('-');
      const y = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10) - 1;
      const d = parseInt(dayStr, 10);
      const dateObj = new Date(y, m, d);

      const dayOfWeek = dateObj.getDay(); // 0 is Sunday (週日), 6 is Saturday (週六)
      // 週期是從週日到週六 (Sunday to Saturday)
      const sunday = new Date(y, m, d - dayOfWeek);
      const saturday = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + 6);

      const sunMonth = String(sunday.getMonth() + 1).padStart(2, '0');
      const sunDay = String(sunday.getDate()).padStart(2, '0');
      const satMonth = String(saturday.getMonth() + 1).padStart(2, '0');
      const satDay = String(saturday.getDate()).padStart(2, '0');

      // 以週日為起點至週六為週期，格式為 mm/dd ~ mm/dd
      key = `${sunMonth}/${sunDay} ~ ${satMonth}/${satDay}`;
    } else if (freq === 'year') {
      key = r.date.slice(0, 4) + '年'; // YYYY年
    }

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(r);
  });

  const points: AggregatedPoint[] = [];

  groups.forEach((groupRecords, key) => {
    const calcAvg = (getter: (r: HealthRecord) => number | null | undefined): number | null => {
      const vals = groupRecords.map(getter).filter((v): v is number => v !== null && v !== undefined && v > 0);
      if (vals.length === 0) return null;
      const sum = vals.reduce((a, b) => a + b, 0);
      return +(sum / vals.length).toFixed(1);
    };

    const hasInjection = groupRecords.some((r) => r.mounjaroDose > 0);
    const totalInjectionDose = groupRecords.reduce((sum, r) => sum + r.mounjaroDose, 0);
    const hasPeriod = groupRecords.some((r) => r.isPeriod);

    points.push({
      label: key,
      dateKey: key,
      weight: calcAvg((r) => r.weight),
      bodyFat: calcAvg((r) => r.bodyFat),
      bust: calcAvg((r) => r.bust),
      waist: calcAvg((r) => r.waist),
      hips: calcAvg((r) => r.hips),
      steps: calcAvg((r) => r.steps),
      hasInjection,
      totalInjectionDose,
      hasPeriod,
      count: groupRecords.length,
      sampleRecord: groupRecords[groupRecords.length - 1],
    });
  });

  return {
    points,
    totalDayPages: 1,
    currentDayRangeLabel: '',
    totalMonthPages,
    currentMonthLabel,
  };
}

export interface PeriodPrediction {
  nextPeriodDate: string;
  nextPeriodFormatted: string;
  lastPeriodDate: string | null;
  lastPeriodFormatted: string;
  daysUntil: number;
  isCurrentlyPeriod: boolean;
  currentPeriodDay: number | null;
  cycleDays: number;
}

export function predictNextPeriod(
  records: HealthRecord[],
  cycleDays: number = 28
): PeriodPrediction {
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  const periodRecords = sorted.filter((r) => r.isPeriod);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  const todayRecord = records.find((r) => r.date === todayStr);
  const isCurrentlyPeriod = Boolean(todayRecord?.isPeriod);
  const currentPeriodDay = todayRecord?.periodDay || (isCurrentlyPeriod ? 1 : null);

  if (periodRecords.length === 0) {
    // Fallback: estimate from today + 14 days
    const est = new Date(today);
    est.setDate(est.getDate() + 14);
    const estStr = est.toISOString().split('T')[0];
    return {
      nextPeriodDate: estStr,
      nextPeriodFormatted: formatNoYearDate(estStr),
      lastPeriodDate: null,
      lastPeriodFormatted: '尚未記錄',
      daysUntil: 14,
      isCurrentlyPeriod: false,
      currentPeriodDay: null,
      cycleDays,
    };
  }

  // Find the start date of the latest period episode
  let lastPeriodStartStr = periodRecords[0].date;
  const recDay1 = periodRecords.find((r) => r.periodDay === 1);
  if (recDay1) {
    lastPeriodStartStr = recDay1.date;
  } else {
    for (let i = 0; i < periodRecords.length - 1; i++) {
      const d1 = new Date(periodRecords[i].date);
      const d2 = new Date(periodRecords[i + 1].date);
      const diff = Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 2) {
        lastPeriodStartStr = periodRecords[i + 1].date;
      } else {
        break;
      }
    }
  }

  const [ly, lm, ld] = lastPeriodStartStr.split('-').map(Number);
  const nextDate = new Date(ly, lm - 1, ld);
  nextDate.setDate(nextDate.getDate() + cycleDays);

  // If nextDate is already past, advance by cycleDays
  while (nextDate.getTime() < today.getTime()) {
    nextDate.setDate(nextDate.getDate() + cycleDays);
  }

  const nextPeriodStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(nextDate.getDate()).padStart(2, '0')}`;
  const diffTime = nextDate.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    nextPeriodDate: nextPeriodStr,
    nextPeriodFormatted: formatNoYearDate(nextPeriodStr),
    lastPeriodDate: lastPeriodStartStr,
    lastPeriodFormatted: formatNoYearDate(lastPeriodStartStr),
    daysUntil,
    isCurrentlyPeriod,
    currentPeriodDay,
    cycleDays,
  };
}

export const TITRATION_SCHEDULE = [
  {
    stage: '適應期 (第 1-4 週)',
    dose: '2.5 mg',
    purpose: '建立腸胃耐受性，減少噁心與消化道不適。此劑量非長期維持劑量。',
    minWeeks: 4,
  },
  {
    stage: '初期治療劑量 (第 5-8 週)',
    dose: '5.0 mg',
    purpose: '開始發揮顯著食慾抑制與代謝調節效果。若效果良好可在此劑量長期維持。',
    minWeeks: 4,
  },
  {
    stage: '進階增量 (第 9-12 週)',
    dose: '7.5 mg',
    purpose: '若 5mg 減重遇到停滯期且耐受良好，經醫師評估後調升。',
    minWeeks: 4,
  },
  {
    stage: '中高劑量 (第 13-16 週)',
    dose: '10.0 mg',
    purpose: '加強血糖控制與減重幅度。注意補充足夠水分與蛋白質。',
    minWeeks: 4,
  },
  {
    stage: '高劑量 (第 17-20 週)',
    dose: '12.5 mg',
    purpose: '針對重度需求或高抗性使用者，階梯式微調。',
    minWeeks: 4,
  },
  {
    stage: '最高劑量 (第 21 週以上)',
    dose: '15.0 mg',
    purpose: '臨床試驗之最高核准劑量，達到最大減重效果。',
    minWeeks: '維持',
  },
];
