import React from 'react';
import { HealthRecord, UserSettings, MounjaroPurchase } from '../types';
import { computeSummaryStats, formatNoYearDate, computeMounjaroDoseStats } from '../utils/calculator';
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Target,
  Sparkles,
  Footprints,
} from 'lucide-react';

interface OverviewTabProps {
  records: HealthRecord[];
  settings: UserSettings;
  purchases?: MounjaroPurchase[];
  onOpenAddModal: (initialDate?: string, existingRecord?: HealthRecord) => void;
  onOpenRecordDetail: (record: HealthRecord) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  records,
  settings,
  purchases = [],
}) => {
  const stats = computeSummaryStats(records, settings);
  const doseStats = computeMounjaroDoseStats(records, purchases);

  return (
    <div className="space-y-4 pb-20">
      {/* 剩餘施打次數剩下 1 時，在首頁最上方跳出提示 */}
      {doseStats.remainingTimes <= 1 && (
        <div className="p-3.5 bg-rose-50/95 border border-rose-200 rounded-3xl text-xs text-rose-800 flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <span className="text-xl shrink-0">⚠️</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-black text-rose-900 text-xs sm:text-sm">
                {doseStats.remainingTimes === 1
                  ? '藥物庫存提醒：剩餘施打次數僅剩 1 次！'
                  : '藥物庫存提醒：剩餘施打次數已用罄 (0次)！'}
              </p>
              <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                剩餘 {doseStats.remainingTimes} 次
              </span>
            </div>
            <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
              您的猛健樂庫存即將見底，請留意提早準備或補充購買，確保療程不中斷哦！🌸
            </p>
          </div>
        </div>
      )}

      {/* 1. Next Injection Reminder Card - Soft Light Pastel Pink */}
      <div className="bg-linear-to-br from-[#FFAFC2] via-[#FFB8C6] to-[#FFCCD5] rounded-3xl p-4 sm:p-5 text-white shadow-md shadow-[#FFAFC2]/20 relative overflow-hidden">
        {/* Subtle decorative background bubbles */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/20 blur-xl pointer-events-none" />
        <div className="absolute right-4 top-4 opacity-15 text-5xl select-none">
          💉
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 bg-white/25 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white">
              <span>💉 施打排程</span>
            </div>
            {stats.daysUntilNextInjection !== null && (
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                  stats.daysUntilNextInjection <= 0
                    ? 'bg-white text-[#FF85A0] animate-pulse shadow-xs'
                    : 'bg-white/30 text-white border border-white/40'
                }`}
              >
                {stats.daysUntilNextInjection <= 0
                  ? '⚡ 今天是施打日哦！'
                  : `倒數 ${stats.daysUntilNextInjection} 天 ✨`}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <p className="text-white/85 text-[11px] font-medium">下次預計施打日</p>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5 text-white">
                {formatNoYearDate(stats.nextInjectionDate) || '尚未記錄施打'}
              </h3>
            </div>

            <div className="bg-black/10 rounded-2xl p-2.5 backdrop-blur-xs border border-white/20 flex flex-col justify-between">
              <div>
                <p className="text-white/80 text-[10px] font-medium">上次施打紀錄</p>
                <p className="text-xs font-bold text-white mt-0.5">
                  {stats.lastInjectionDate
                    ? `${formatNoYearDate(stats.lastInjectionDate)} (${stats.lastInjectionDose}mg)`
                    : '無資料'}
                </p>
              </div>
              <div className="mt-1 pt-1 border-t border-white/15">
                <p className="text-[10px] text-white flex items-center gap-0.5 font-medium truncate">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-200 shrink-0" />
                  <span className="truncate">
                    上次施打部位：{stats.lastInjectionSite ? (stats.lastInjectionSite.includes('左') && stats.lastInjectionSite.includes('腹') ? '左腹部' : stats.lastInjectionSite.includes('右') && stats.lastInjectionSite.includes('腹') ? '右腹部' : stats.lastInjectionSite.replace(/ \(.*\)/, '')) : '左腹部'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom count display - no button as requested */}
          <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between">
            <span className="text-xs text-white/95 font-medium">
              累計施打 <strong className="text-white font-black">{stats.totalInjectionsCount}</strong> 次 🌸
            </span>
          </div>
        </div>
      </div>

      {/* 2. Weight & Target Progress Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#592736] text-sm sm:text-base">體重進度與變化</h3>
              <p className="text-[11px] text-[#8A4F60]">目前數據與目標達成率 ✨</p>
            </div>
          </div>
          {stats.bmi !== null && (
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#FFF0F5] text-[#FF85A0] border border-[#FFE0E9]">
              BMI {stats.bmi} ({stats.bmiCategory})
            </span>
          )}
        </div>

        {/* Big numbers row */}
        <div className="grid grid-cols-3 gap-2.5 py-2">
          {/* Latest weight */}
          <div className="bg-[#FFF8FA] p-3 rounded-2xl border border-[#FFE0E9]/60 text-center">
            <span className="text-[11px] text-[#8A4F60] font-medium block">最新體重</span>
            <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-[#592736] tracking-tight">
                {stats.latestWeight !== null ? stats.latestWeight : '--'}
              </span>
              <span className="text-xs font-semibold text-[#8A4F60]">kg</span>
            </div>
            {stats.weightChangeFromPrevious !== null && (
              <span
                className={`text-[10px] font-extrabold inline-flex items-center justify-center gap-0.5 mt-1 ${
                  stats.weightChangeFromPrevious <= 0 ? 'text-[#FF85A0]' : 'text-slate-500'
                }`}
              >
                {stats.weightChangeFromPrevious <= 0 ? (
                  <TrendingDown className="w-3 h-3 text-[#FF85A0]" />
                ) : (
                  <TrendingUp className="w-3 h-3 text-slate-400" />
                )}
                {stats.weightChangeFromPrevious > 0 ? '+' : ''}
                {stats.weightChangeFromPrevious} kg
              </span>
            )}
          </div>

          {/* Cumulative change from start: 累積減重 (起點已刪除，下方增加 初始體重) */}
          <div className="bg-[#FFF0F5] p-3 rounded-2xl border border-[#FFE0E9] text-center flex flex-col justify-center">
            <span className="text-[11px] text-[#FF85A0] font-bold block">累積減重 </span>
            <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-[#FF85A0] tracking-tight">
                {stats.weightChangeFromStart !== null
                  ? `${stats.weightChangeFromStart > 0 ? '+' : ''}${stats.weightChangeFromStart}`
                  : '--'}
              </span>
              <span className="text-xs font-semibold text-[#FF85A0]">kg</span>
            </div>
            <span className="text-[10px] text-[#8A4F60] font-medium block mt-1">
              初始 {settings.startWeight} kg
            </span>
          </div>

          {/* Distance to target: 距離目標 */}
          <div className="bg-[#FFF8FA] p-3 rounded-2xl border border-[#FFE0E9] text-center">
            <span className="text-[11px] text-[#592736] font-medium block">距離目標 </span>
            <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-[#592736] tracking-tight">
                {stats.weightToTarget !== null ? stats.weightToTarget : '--'}
              </span>
              <span className="text-xs font-semibold text-[#8A4F60]">kg</span>
            </div>
            <span className="text-[10px] text-[#8A4F60] font-medium block mt-1">
              目標 {settings.targetWeight} kg
            </span>
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="mt-3 pt-3 border-t border-[#FFE0E9]/60">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="flex items-center gap-1 text-[#592736] font-bold">
              <Target className="w-3.5 h-3.5 text-[#FF85A0]" />
              <span>達成率</span>
            </span>
            <span className="text-[#FF85A0] font-black">{stats.progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#FFF0F5] overflow-hidden relative border border-[#FFE0E9]">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#FFCCD5] to-[#FFAFC2] transition-all duration-500 ease-out"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#8A4F60] mt-1">
            <span>初始 {settings.startWeight} kg</span>
            <span>達成 {stats.progressPercent}%</span>
            <span>目標 {settings.targetWeight} kg</span>
          </div>
        </div>
      </div>

      {/* 3. Daily Steps Card (日常活動步數) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center">
              <Footprints className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#592736] text-sm sm:text-base">日常活動步數 🚶‍♀️</h3>
              <p className="text-[11px] text-[#8A4F60]">每天走路多一點，代謝更好哦！</p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FFF0F5] text-[#FF85A0] border border-[#FFE0E9]">
            目標 {stats.stepsTarget.toLocaleString()} 步
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 py-1">
          <div className="bg-[#FFF8FA] p-3 rounded-2xl border border-[#FFE0E9]/60">
            <span className="text-[11px] text-[#8A4F60] font-medium block">今日 / 最新步數</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-[#592736] tracking-tight">
                {stats.latestSteps !== null ? stats.latestSteps.toLocaleString() : '--'}
              </span>
              <span className="text-xs font-semibold text-[#8A4F60]">步</span>
            </div>
            <span className="text-[10px] text-[#FF85A0] font-black block mt-1">
              達成率 {stats.stepsPercent}%
            </span>
          </div>

          <div className="bg-[#FFF0F5] p-3 rounded-2xl border border-[#FFE0E9] flex flex-col justify-between">
            <span className="text-[11px] text-[#FF85A0] font-extrabold block">✨ 小叮嚀</span>
            <p className="text-xs text-[#592736] mt-1 leading-relaxed">
              猛健樂期間記得多喝溫水，散步 30 分鐘讓心情與身體都輕盈！
            </p>
          </div>
        </div>

        {/* Steps Progress bar */}
        <div className="mt-3 pt-3 border-t border-[#FFE0E9]/60">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-[#592736] font-bold flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-[#FF85A0]" />
              <span>今日步數進度</span>
            </span>
            <span className="text-[#FF85A0] font-black">{stats.stepsPercent}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#FFF0F5] overflow-hidden relative border border-[#FFE0E9]">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#FFCCD5] to-[#FFAFC2] transition-all duration-500 ease-out"
              style={{ width: `${stats.stepsPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Three Measurements (Bust, Waist, Hips) Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center">
              <span className="text-sm select-none">🎀</span>
            </div>
            <div>
              <h3 className="font-extrabold text-[#592736] text-sm sm:text-base">三圍體態變化</h3>
              <p className="text-[11px] text-[#8A4F60]">胸圍、腰圍、臀圍及腰臀比</p>
            </div>
          </div>
          {stats.whr !== null && (
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#FFF0F5] text-[#FF85A0] border border-[#FFE0E9]">
              腰臀比 WHR {stats.whr}
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5 py-1">
          {/* Bust */}
          <div className="bg-[#FFF8FA] p-3 rounded-2xl border border-[#FFE0E9]/60 text-center">
            <span className="text-[11px] text-[#8A4F60] font-medium block">胸圍</span>
            <p className="text-lg font-black text-[#592736] mt-0.5">
              {stats.latestBust !== null ? `${stats.latestBust}cm` : '--'}
            </p>
            {stats.bustChange !== null && (
              <span className="text-[10px] text-[#FF85A0] font-bold block mt-0.5">
                {stats.bustChange <= 0 ? `${stats.bustChange}cm` : `+${stats.bustChange}cm`}
              </span>
            )}
          </div>

          {/* Waist */}
          <div className="bg-[#FFF8FA] p-3 rounded-2xl border border-[#FFE0E9]/60 text-center">
            <span className="text-[11px] text-[#8A4F60] font-medium block">腰圍</span>
            <p className="text-lg font-black text-[#592736] mt-0.5">
              {stats.latestWaist !== null ? `${stats.latestWaist}cm` : '--'}
            </p>
            {stats.waistChange !== null && (
              <span className="text-[10px] text-[#FF85A0] font-bold block mt-0.5">
                {stats.waistChange <= 0 ? `${stats.waistChange}cm` : `+${stats.waistChange}cm`}
              </span>
            )}
          </div>

          {/* Hips */}
          <div className="bg-[#FFF8FA] p-3 rounded-2xl border border-[#FFE0E9]/60 text-center">
            <span className="text-[11px] text-[#8A4F60] font-medium block">臀圍</span>
            <p className="text-lg font-black text-[#592736] mt-0.5">
              {stats.latestHips !== null ? `${stats.latestHips}cm` : '--'}
            </p>
            {stats.hipsChange !== null && (
              <span className="text-[10px] text-[#FF85A0] font-bold block mt-0.5">
                {stats.hipsChange <= 0 ? `${stats.hipsChange}cm` : `+${stats.hipsChange}cm`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
