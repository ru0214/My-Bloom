import React, { useState, useMemo, useRef, useEffect } from 'react';
import { HealthRecord, AggregationFreq, UserSettings } from '../types';
import {
  aggregateRecordsByFreq,
  AggregatedPoint,
  getInjectionOrderMap,
  formatNoYearDate,
  predictNextPeriod,
} from '../utils/calculator';
import { CalendarView } from './CalendarView';
import { getThemeById } from '../utils/theme';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  Scale,
  Heart,
  Ruler,
  LineChart,
  Edit3,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface ChartsTabProps {
  records: HealthRecord[];
  settings?: UserSettings;
  onOpenRecordDetail: (record: HealthRecord) => void;
  onOpenAddModal: (initialDate?: string, existingRecord?: HealthRecord) => void;
  onDeleteRecord?: (id: string) => void;
}

export const ChartsTab: React.FC<ChartsTabProps> = ({
  records,
  settings,
  onOpenRecordDetail,
  onOpenAddModal,
  onDeleteRecord,
}) => {
  const theme = useMemo(() => getThemeById(settings?.themeColor), [settings?.themeColor]);

  // Top view toggle: 'charts' (趨勢圖表) vs 'history' (月曆紀錄)
  const [activeView, setActiveView] = useState<'charts' | 'history'>('charts');

  // Frequency: 最近 (day), 週 (week), 月 (month), 年 (year) - ONLY buttons, centered and matching outer frame width!
  const [freq, setFreq] = useState<AggregationFreq>('day');

  // Day window offset
  const [dayOffset, setDayOffset] = useState<number>(0);

  // Month window offset (0 = current month, 1 = previous month)
  const [monthOffset, setMonthOffset] = useState<number>(0);

  // Selected date for calendar inline measurement details (defaults to today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(todayStr);

  // Hovered/touched data point
  const [hoveredPoint, setHoveredPoint] = useState<AggregatedPoint | null>(null);

  // Injection order map: date -> 第 X 次施打
  const injectionOrderMap = useMemo(() => getInjectionOrderMap(records), [records]);

  // Aggregated data points
  const { points: chartPoints, totalDayPages, currentDayRangeLabel, totalMonthPages, currentMonthLabel } = useMemo(() => {
    return aggregateRecordsByFreq(records, freq, dayOffset, monthOffset);
  }, [records, freq, dayOffset, monthOffset]);

  // Predicted next period information
  const periodInfo = useMemo(() => {
    return predictNextPeriod(records, settings?.cycleDays || 28);
  }, [records, settings?.cycleDays]);

  // Sorted history list (newest first)
  const historyList = useMemo(() => {
    return [...records].sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  // Record for selected calendar date
  const selectedDateRecord = useMemo(() => {
    return records.find((r) => r.date === selectedCalendarDate) || null;
  }, [records, selectedCalendarDate]);

  // Automatically scroll charts to the most recent records (far right) by default
  useEffect(() => {
    const timer = setTimeout(() => {
      const containers = document.querySelectorAll('.chart-scroll-container');
      containers.forEach((el) => {
        el.scrollLeft = el.scrollWidth;
      });
    }, 60);
    return () => clearTimeout(timer);
  }, [freq, monthOffset, chartPoints.length]);

  // Mouse drag-to-scroll support & sync horizontal scrolling across all charts (滑動折線圖即可移動，不強制使用下方滑桿)
  const isMouseDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const isSyncingScrollRef = useRef(false);

  // Synchronize horizontal scrolling between charts
  const handleChartScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isSyncingScrollRef.current) return;
    const target = e.currentTarget;
    const maxScroll = target.scrollWidth - target.clientWidth;
    const ratio = maxScroll > 0 ? target.scrollLeft / maxScroll : 0;

    isSyncingScrollRef.current = true;
    const containers = document.querySelectorAll<HTMLDivElement>('.chart-scroll-container');
    containers.forEach((c) => {
      if (c !== target) {
        const cMax = c.scrollWidth - c.clientWidth;
        if (cMax > 0) {
          c.scrollLeft = ratio * cMax;
        }
      }
    });
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false;
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    isMouseDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - container.offsetLeft;
    scrollLeftRef.current = container.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current) return;
    const container = e.currentTarget;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
    }
    container.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
  };

  // Reusable Single SVG Line Chart (LINES ONLY, NO SHADED / DARKENED BACKGROUND)
  const renderSingleSvgChart = (
    title: string,
    icon: React.ReactNode,
    seriesList: {
      name: string;
      color: string;
      getValue: (pt: AggregatedPoint) => number | null;
      unit: string;
    }[]
  ) => {
    const isMonth = freq === 'month';
    const monthSpacing = 95; // 月份點之間適中靠近，兩個月份不用離那麼遠
    const height = 195;
    const padding = { top: 26, right: 35, bottom: 44, left: 45 };

    const width = isMonth
      ? Math.max(340, (chartPoints.length - 1) * monthSpacing + padding.left + padding.right + 40)
      : Math.max(540, chartPoints.length * 68);
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const allVals: number[] = [];
    chartPoints.forEach((pt) => {
      seriesList.forEach((s) => {
        const v = s.getValue(pt);
        if (v !== null && v > 0) allVals.push(v);
      });
    });

    if (allVals.length === 0) {
      return (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            {icon}
            <h4 className="font-extrabold text-[#592736] text-sm">{title}</h4>
          </div>
          <div className="h-28 flex items-center justify-center text-xs text-[#8A4F60]">
            此區間尚無足夠數據 🌸
          </div>
        </div>
      );
    }

    const minY = Math.floor(Math.min(...allVals) - 0.5);
    const maxY = Math.ceil(Math.max(...allVals) + 0.5);
    const yRange = maxY - minY || 1;

    const getX = (index: number) => {
      if (chartPoints.length === 1) return padding.left + chartW / 2;
      if (isMonth) {
        // 月份折線圖：讓兩個月份靠近一點並置中顯示
        const totalSpan = (chartPoints.length - 1) * monthSpacing;
        const startX = padding.left + (chartW - totalSpan) / 2;
        return startX + index * monthSpacing;
      }
      return padding.left + (index / (chartPoints.length - 1)) * chartW;
    };

    const getY = (val: number) => {
      return padding.top + chartH - ((val - minY) / yRange) * chartH;
    };

    const yTicks = [
      minY,
      +(minY + yRange / 2).toFixed(1),
      maxY,
    ].map((val) => ({ val, y: getY(val) }));

    const firstVal = allVals[0];
    const lastVal = allVals[allVals.length - 1];
    const diff = +(lastVal - firstVal).toFixed(1);

    return (
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs space-y-3">
        {/* Chart Header (已刪除 最新週均值，保持乾淨清爽) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <h4 className="font-extrabold text-[#592736] text-sm">{title}</h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                diff <= 0
                  ? 'bg-[#FFF0F5] text-[#FF85A0] border border-[#FFE0E9]'
                  : 'bg-[#FFF8FA] text-[#8A4F60]'
              }`}
            >
              {diff <= 0 ? <TrendingDown className="w-3 h-3 text-[#FF85A0]" /> : <TrendingUp className="w-3 h-3" />}
              {diff > 0 ? `+${diff}` : `${diff}`} {seriesList[0].unit}
            </span>
          </div>
        </div>

        {/* SVG Drawing - 直接在折線圖上滑動/拖曳即可移動，無須強制使用下方滑桿 */}
        <div className="space-y-1.5">
          <div
            className="chart-scroll-container relative overflow-x-auto overflow-y-hidden pb-1 rounded-2xl touch-pan-x cursor-grab active:cursor-grabbing select-none"
            onScroll={handleChartScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            <div style={{ width: isMonth && chartPoints.length <= 4 ? '100%' : `${width}px`, minWidth: isMonth && chartPoints.length <= 4 ? '100%' : `${width}px` }}>
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto overflow-visible select-none"
              >
            {/* Grid lines */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={tick.y}
                  x2={width - padding.right}
                  y2={tick.y}
                  stroke="#FFEBF1"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 6}
                  y={tick.y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-[#8A4F60] font-mono font-bold"
                >
                  {tick.val}
                </text>
              </g>
            ))}

            {/* Render lines (fill="none" ONLY, no gradient or shadow below) */}
            {seriesList.map((series) => {
              const validPoints: { x: number; y: number; val: number; pt: AggregatedPoint }[] = [];
              chartPoints.forEach((pt, idx) => {
                const val = series.getValue(pt);
                if (val !== null && val > 0) {
                  validPoints.push({
                    x: getX(idx),
                    y: getY(val),
                    val,
                    pt,
                  });
                }
              });

              if (validPoints.length === 0) return null;

              // Build path string: straight / curve connecting all valid points
              let pathD = `M ${validPoints[0].x} ${validPoints[0].y}`;
              for (let i = 1; i < validPoints.length; i++) {
                const prev = validPoints[i - 1];
                const curr = validPoints[i];
                const cpX1 = prev.x + (curr.x - prev.x) / 2;
                const cpY1 = prev.y;
                const cpX2 = prev.x + (curr.x - prev.x) / 2;
                const cpY2 = curr.y;
                pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
              }

              return (
                <g key={series.name}>
                  {/* Single point fallback indicator line */}
                  {validPoints.length === 1 && (
                    <line
                      x1={Math.max(padding.left, validPoints[0].x - 30)}
                      y1={validPoints[0].y}
                      x2={Math.min(width - padding.right, validPoints[0].x + 30)}
                      y2={validPoints[0].y}
                      stroke={series.color}
                      strokeWidth="2.5"
                      strokeDasharray="2 2"
                    />
                  )}

                  {/* Clean line path connecting points */}
                  {validPoints.length >= 2 && (
                    <path
                      d={pathD}
                      fill="none"
                      stroke={series.color}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Circular points with exact values written directly in 7-day mode */}
                  {validPoints.map((p, pIdx) => {
                    const isHovered = hoveredPoint?.dateKey === p.pt.dateKey;
                    return (
                      <g key={pIdx}>
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isHovered ? 6 : 4}
                          fill={isHovered ? '#ffffff' : series.color}
                          stroke={series.color}
                          strokeWidth={isHovered ? 3 : 2}
                          className="cursor-pointer transition-all duration-150"
                          onMouseEnter={() => setHoveredPoint(p.pt)}
                          onClick={() => {
                            if (hasDraggedRef.current) return;
                            if (p.pt.sampleRecord) {
                              onOpenRecordDetail(p.pt.sampleRecord);
                            }
                          }}
                        />

                        {/* Direct value label right above each dot in 7-day size (每天是多少) */}
                        {chartPoints.length <= 8 && (
                          <text
                            x={p.x}
                            y={p.y - 8}
                            textAnchor="middle"
                            className="text-[10px] font-black fill-[#592736] select-none pointer-events-none"
                          >
                            {p.val}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Injections displayed with syringe emoji (下面那邊 可以用打針的emoji 4mg 代表施打) */}
            {chartPoints.map((pt, idx) => {
              const x = getX(idx);
              if (!pt.hasInjection) return null;

              const doseText = `💉 ${pt.totalInjectionDose}mg`;

              return (
                <g key={`inj-${pt.dateKey}-${idx}`}>
                  {/* Dotted guideline */}
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={height - 24}
                    stroke="#FFAFC2"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    opacity="0.7"
                  />
                  {/* Injection Badge near bottom: 💉 4mg */}
                  <g
                    transform={`translate(${x}, ${height - 24})`}
                    className="cursor-pointer"
                    onClick={() => {
                      if (hasDraggedRef.current) return;
                      if (pt.sampleRecord) onOpenRecordDetail(pt.sampleRecord);
                    }}
                  >
                    <rect
                      x="-23"
                      y="-7"
                      width="46"
                      height="15"
                      rx="7.5"
                      fill="#FFAFC2"
                      className="shadow-xs"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      className="text-[9px] fill-white font-black"
                    >
                      {doseText}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* X Axis Date labels (格式 mm/dd) */}
            {chartPoints.map((pt, idx) => {
              return (
                <text
                  key={`lbl-${pt.dateKey}`}
                  x={getX(idx)}
                  y={height - 6}
                  textAnchor="middle"
                  className="text-[10px] fill-[#8A4F60] font-bold"
                >
                  {pt.label}
                </text>
              );
            })}
              </svg>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-[#8A4F60] pt-1 border-t border-[#FFE0E9]/60">
          <div className="flex items-center gap-3">
            {seriesList.map((s) => (
              <div key={s.name} className="flex items-center gap-1">
                <span className="w-2.5 h-1 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="font-bold">{s.name}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 text-[#FF85A0] font-black text-[10px] bg-[#FFF0F5] px-2 py-0.5 rounded-full border border-[#FFE0E9]">
            <span>💉 4mg 施打標記</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-24">
      {/* 1. TOP TOGGLE BUTTON: Left/Right Switch (趨勢圖表 vs 歷史紀錄 & 月曆) */}
      <div className="bg-white rounded-3xl p-2 border border-[#FFE0E9] shadow-xs">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#FFF8FA] rounded-2xl">
          <button
            onClick={() => setActiveView('charts')}
            className={`py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
              activeView === 'charts'
                ? 'bg-linear-to-r from-[#FFAFC2] to-[#FFCCD5] text-white shadow-xs scale-[1.01]'
                : 'text-[#8A4F60] hover:text-[#592736]'
            }`}
          >
            <LineChart className="w-4 h-4" />
            <span>趨勢圖表 🌸</span>
          </button>

          <button
            onClick={() => setActiveView('history')}
            className={`py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
              activeView === 'history'
                ? 'bg-linear-to-r from-[#FFAFC2] to-[#FFCCD5] text-white shadow-xs scale-[1.01]'
                : 'text-[#8A4F60] hover:text-[#592736]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>月曆紀錄 🎀</span>
          </button>
        </div>
      </div>

      {/* 2. VIEW A: CHARTS - 直接在折線圖上滑動/拖曳即可移動 */}
      {activeView === 'charts' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Frequency Selector: 最近 週 月 年 置中，寬度與外框完全一致 (跟外框大小一致) */}
          <div className="bg-white rounded-3xl p-2.5 sm:p-3 border border-[#FFE0E9] shadow-xs">
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#FFF8FA] rounded-2xl w-full border border-[#FFE0E9]">
              {(
                [
                  { id: 'day', label: '最近' },
                  { id: 'week', label: '週' },
                  { id: 'month', label: '月' },
                  { id: 'year', label: '年' },
                ] as { id: AggregationFreq; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setFreq(item.id);
                    setDayOffset(0);
                    setMonthOffset(0);
                  }}
                  className={`py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center w-full ${
                    freq === item.id
                      ? 'bg-linear-to-r from-[#FFAFC2] to-[#FFCCD5] text-white shadow-xs'
                      : 'text-[#8A4F60] hover:text-[#592736]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hovered point details */}
          {hoveredPoint && (
            <div className="p-3 bg-[#FFF8FA] text-[#592736] rounded-2xl shadow-xs border border-[#FFE0E9] flex items-center justify-between text-xs animate-in fade-in">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#FF85A0]" />
                <span className="font-black text-[#FF85A0]">{hoveredPoint.label}</span>
                {freq === 'week' && (
                  <span className="bg-[#FFF0F5] text-[#FF85A0] px-2 py-0.5 rounded-full text-[10px] font-black border border-[#FFE0E9]">
                    週日~週六
                  </span>
                )}
                {freq === 'month' && (
                  <span className="bg-[#FFF0F5] text-[#FF85A0] px-2 py-0.5 rounded-full text-[10px] font-black border border-[#FFE0E9]">
                    整月平均
                  </span>
                )}
                {hoveredPoint.hasInjection && (
                  <span className="bg-[#FFAFC2] text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                    💉 {hoveredPoint.totalInjectionDose}mg
                  </span>
                )}
                {hoveredPoint.hasPeriod && (
                  <span className="bg-[#FFF0F5] text-[#FF85A0] px-2 py-0.5 rounded-full text-[10px] font-black">
                    🌸 生理期
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hoveredPoint.weight && (
                  <span className="font-black">
                    {freq === 'week' ? '週均重' : freq === 'month' ? '月均重' : '體重'} {hoveredPoint.weight}kg
                  </span>
                )}
                {hoveredPoint.bodyFat && (
                  <span className="font-black text-[#FF85A0]">
                    {freq === 'week' ? '週均脂' : freq === 'month' ? '月均脂' : '體脂'} {hoveredPoint.bodyFat}%
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 1) 體重 (Weight) */}
          {renderSingleSvgChart(
            '體重 (Weight)',
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>,
            [{ name: '體重', color: theme.primary, getValue: (pt) => pt.weight, unit: 'kg' }]
          )}

          {/* 2) 體脂率 (Body Fat) */}
          {renderSingleSvgChart(
            '體脂率 (Body Fat)',
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center font-bold">
              <Heart className="w-4 h-4" />
            </div>,
            [{ name: '體脂率', color: theme.from, getValue: (pt) => pt.bodyFat, unit: '%' }]
          )}

          {/* 3) 三圍 */}
          {renderSingleSvgChart(
            '三圍',
            <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center font-bold">
              <Ruler className="w-4 h-4" />
            </div>,
            [
              { name: '胸圍', color: theme.from, getValue: (pt) => pt.bust, unit: 'cm' },
              { name: '腰圍', color: theme.primary, getValue: (pt) => pt.waist, unit: 'cm' },
              { name: '臀圍', color: theme.dotColor, getValue: (pt) => pt.hips, unit: 'cm' },
            ]
          )}
        </div>
      )}

      {/* 3. VIEW B: HISTORY & CALENDAR - 點擊哪一天在下方直接顯示測量記錄 */}
      {activeView === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Calendar */}
          <CalendarView
            records={records}
            selectedDate={selectedCalendarDate}
            onSelectDate={(dStr) => setSelectedCalendarDate(dStr)}
          />

          {/* 預計下次生理期時間 */}
          <div className="bg-linear-to-r from-[#FFF0F5] to-[#FFF8FA] rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white text-[#FF85A0] flex items-center justify-center font-bold shadow-xs border border-[#FFE0E9] text-sm">
                  🌸
                </div>
                <div>
                  <h4 className="font-extrabold text-[#592736] text-sm sm:text-base">
                    預計下次生理期時間
                  </h4>
                  <p className="text-[11px] text-[#8A4F60]">
                    根據週期推算 · 貼心提醒與體重守護 💖
                  </p>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-full bg-white text-[#FF85A0] border border-[#FFE0E9] shadow-xs">
                週期 {periodInfo.cycleDays} 天
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="bg-white/90 p-3 rounded-2xl border border-[#FFE0E9] text-center shadow-xs">
                <span className="text-[10px] text-[#8A4F60] font-medium block">預計時間</span>
                <span className="text-base sm:text-lg font-black text-[#FF85A0] mt-0.5 block">
                  {periodInfo.nextPeriodFormatted}
                </span>
                <span className="text-[10px] text-[#8A4F60] font-medium">
                  {periodInfo.isCurrentlyPeriod ? '目前生理期中 🌸' : `約剩 ${periodInfo.daysUntil} 天`}
                </span>
              </div>

              <div className="bg-white/90 p-3 rounded-2xl border border-[#FFE0E9] text-center shadow-xs">
                <span className="text-[10px] text-[#8A4F60] font-medium block">上次生理期</span>
                <span className="text-base sm:text-lg font-black text-[#592736] mt-0.5 block">
                  {periodInfo.lastPeriodFormatted}
                </span>
                <span className="text-[10px] text-[#8A4F60] font-medium">
                  {periodInfo.lastPeriodDate ? '已記錄開始日' : '尚無紀錄'}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-white/90 p-3 rounded-2xl border border-[#FFE0E9] flex flex-col justify-center shadow-xs">
                <span className="text-[10px] text-[#FF85A0] font-bold block">✨ 生理期小叮嚀</span>
                <p className="text-[11px] text-[#8A4F60] mt-0.5 leading-snug">
                  經期前後水分易滯留，體重微幅浮動屬正常現象，多補充溫水、放鬆心情喔！
                </p>
              </div>
            </div>
          </div>

          {/* INLINE DATE DETAIL CARD */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#FFE0E9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center font-bold text-xs">
                  🌸
                </div>
                <div>
                  <h4 className="font-black text-[#592736] text-sm">
                    {formatNoYearDate(selectedCalendarDate)} 測量手帳
                  </h4>
                  <p className="text-[10px] text-[#8A4F60]">點選上方月曆任一天可立即切換 ✨</p>
                </div>
              </div>

              {selectedDateRecord ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenAddModal(selectedCalendarDate, selectedDateRecord)}
                    className="px-2.5 py-1 rounded-xl bg-[#FFF0F5] hover:bg-[#FFE0E9] text-[#FF85A0] text-xs font-black border border-[#FFE0E9] flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>編輯</span>
                  </button>
                  {onDeleteRecord && (
                    <button
                      onClick={() => {
                        if (window.confirm(`確定要刪除 ${selectedCalendarDate} 的紀錄嗎？`)) {
                          onDeleteRecord(selectedDateRecord.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                      title="刪除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => onOpenAddModal(selectedCalendarDate)}
                  className="px-3 py-1 rounded-xl bg-linear-to-r from-[#FFAFC2] to-[#FFCCD5] text-white text-xs font-black shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>補記此日</span>
                </button>
              )}
            </div>

            {selectedDateRecord ? (
              <div className="space-y-3">
                {/* Injection status with order counter and 4mg / dose */}
                {selectedDateRecord.mounjaroDose > 0 ? (
                  <div className="bg-[#FFF8FA] p-3 rounded-2xl border border-[#FFE0E9] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💉</span>
                      <div>
                        <span className="text-xs font-black text-[#FF85A0] block">
                          第 {injectionOrderMap.get(selectedDateRecord.date) || 1} 次施打 💉 {selectedDateRecord.mounjaroDose}mg 🎀
                        </span>
                        <span className="text-[11px] text-[#8A4F60]">
                          部位：{selectedDateRecord.injectionSite || '未填寫'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#FF85A0] bg-[#FFF0F5] px-2.5 py-0.5 rounded-full border border-[#FFE0E9]">
                      第 {injectionOrderMap.get(selectedDateRecord.date) || 1} 劑
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-[#8A4F60] bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE0E9]/50 flex items-center justify-between">
                    <span>本日未施打藥物 (0mg)</span>
                    <span className="text-[10px] text-[#8A4F60]">休整日 ☕</span>
                  </div>
                )}

                {/* Period status */}
                {selectedDateRecord.isPeriod && (
                  <div className="bg-[#FFF0F5] p-2.5 rounded-xl border border-[#FFE0E9] flex items-center gap-2 text-[#FF85A0] text-xs font-black">
                    <span>🌸</span>
                    <span>生理期 {selectedDateRecord.periodDay ? `第 ${selectedDateRecord.periodDay} 天` : ''}</span>
                  </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#FFF8FA] p-2.5 rounded-2xl border border-[#FFE0E9]/60 text-center">
                    <span className="text-[10px] text-[#8A4F60] font-bold block">體重</span>
                    <p className="text-sm font-black text-[#592736] mt-0.5">
                      {selectedDateRecord.weight !== null ? `${selectedDateRecord.weight} kg` : '--'}
                    </p>
                  </div>
                  <div className="bg-[#FFF8FA] p-2.5 rounded-2xl border border-[#FFE0E9]/60 text-center">
                    <span className="text-[10px] text-[#8A4F60] font-bold block">體脂率</span>
                    <p className="text-sm font-black text-[#FF85A0] mt-0.5">
                      {selectedDateRecord.bodyFat !== null ? `${selectedDateRecord.bodyFat} %` : '--'}
                    </p>
                  </div>
                  <div className="bg-[#FFF8FA] p-2.5 rounded-2xl border border-[#FFE0E9]/60 text-center">
                    <span className="text-[10px] text-[#8A4F60] font-bold block">步數</span>
                    <p className="text-sm font-black text-[#592736] mt-0.5">
                      {selectedDateRecord.steps ? `${selectedDateRecord.steps.toLocaleString()} 步` : '--'}
                    </p>
                  </div>
                </div>

                {/* Measurements */}
                {(selectedDateRecord.bust || selectedDateRecord.waist || selectedDateRecord.hips) && (
                  <div className="bg-[#FFF8FA] p-2.5 rounded-2xl border border-[#FFE0E9]/60 flex items-center justify-around text-center">
                    <div>
                      <span className="text-[10px] text-[#8A4F60] block">胸圍</span>
                      <span className="text-xs font-black text-[#592736]">
                        {selectedDateRecord.bust ? `${selectedDateRecord.bust}cm` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8A4F60] block">腰圍</span>
                      <span className="text-xs font-black text-[#592736]">
                        {selectedDateRecord.waist ? `${selectedDateRecord.waist}cm` : '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8A4F60] block">臀圍</span>
                      <span className="text-xs font-black text-[#592736]">
                        {selectedDateRecord.hips ? `${selectedDateRecord.hips}cm` : '-'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedDateRecord.notes && (
                  <div className="bg-[#FFF8FA] p-2.5 rounded-xl border border-[#FFE0E9]/50 text-xs text-[#592736]">
                    <span className="text-[10px] font-black text-[#FF85A0] block mb-0.5">備註 / 心得 🎀</span>
                    <p className="italic">「{selectedDateRecord.notes}」</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-[#8A4F60] space-y-1">
                <p>{formatNoYearDate(selectedCalendarDate)} 尚無測量或施打紀錄</p>
                <p className="text-[11px] text-[#FF85A0] font-black">點選右上角按鈕即可補記手帳 ✨</p>
              </div>
            )}
          </div>

          {/* ALL HISTORICAL RECORDS LIST */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-[#592736] text-sm sm:text-base">歷史紀錄明細 📖</h3>
                  <p className="text-[11px] text-[#8A4F60]">共 {historyList.length} 筆歷史紀錄 🌸</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#FF85A0] bg-[#FFF0F5] px-3 py-1 rounded-full border border-[#FFE0E9]">
                全部紀錄
              </span>
            </div>

            {/* List */}
            <div className="space-y-2 mt-2">
              {historyList.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#8A4F60]">
                  尚未有任何紀錄
                </div>
              ) : (
                historyList.map((rec) => {
                  const hasInjection = rec.mounjaroDose > 0;
                  const orderNum = hasInjection ? injectionOrderMap.get(rec.date) : null;

                  return (
                    <div
                      key={rec.id}
                      onClick={() => {
                        setSelectedCalendarDate(rec.date);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between hover:shadow-xs active:scale-[0.99] ${
                        rec.date === selectedCalendarDate
                          ? 'border-[#FFAFC2] bg-[#FFF0F5]'
                          : hasInjection
                          ? 'border-[#FFE0E9] bg-[#FFF8FA] hover:bg-[#FFF0F5]'
                          : 'border-[#FFF0F5] bg-white hover:bg-[#FFF8FA]'
                      }`}
                    >
                      {/* Left: Date & Badges */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-[#592736] text-sm">{formatNoYearDate(rec.date)}</span>

                          {hasInjection && (
                            <span className="bg-[#FFAFC2] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                              <span>💉</span>
                              <span>猛健樂施打第 {orderNum || 1} 次 (💉 {rec.mounjaroDose}mg)</span>
                            </span>
                          )}

                          {rec.isPeriod && (
                            <span className="bg-[#FFF0F5] text-[#FF85A0] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-[#FFE0E9]">
                              <span>🌸</span>
                              <span>生理期{rec.periodDay ? ` 第${rec.periodDay}天` : ''}</span>
                            </span>
                          )}
                        </div>

                        {/* Measurements summary */}
                        <div className="flex items-center gap-2 text-xs text-[#8A4F60] flex-wrap">
                          {rec.bust || rec.waist || rec.hips ? (
                            <span className="text-[11px] font-black text-[#FF85A0]">
                              三圍：
                              {rec.bust ? `胸${rec.bust} ` : ''}
                              {rec.waist ? `腰${rec.waist} ` : ''}
                              {rec.hips ? `臀${rec.hips}` : ''}
                            </span>
                          ) : null}
                          {rec.steps ? (
                            <span className="text-[11px] text-[#592736] font-bold">
                              🚶 {rec.steps.toLocaleString()} 步
                            </span>
                          ) : null}
                          {rec.notes && (
                            <span className="text-[11px] text-[#8A4F60] italic truncate max-w-[160px]">
                              「{rec.notes}」
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Weight & Body Fat & Arrow */}
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {rec.weight !== null ? (
                            <div className="text-sm font-black text-[#592736]">
                              {rec.weight} <span className="text-xs font-normal text-[#8A4F60]">kg</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-300">未量體重</span>
                          )}
                          {rec.bodyFat !== null && (
                            <div className="text-[11px] font-black text-[#FF85A0]">
                              {rec.bodyFat}%
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#FF85A0]" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
