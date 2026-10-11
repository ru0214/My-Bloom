import React, { useState } from 'react';
import { HealthRecord } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarViewProps {
  records: HealthRecord[];
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  records,
  selectedDate,
  onSelectDate,
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
      }
    }
    return new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const recordMap = new Map<string, HealthRecord>();
  records.forEach((r) => {
    recordMap.set(r.date, r);
  });

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    const todayStr = today.toISOString().split('T')[0];
    onSelectDate(todayStr);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const days = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const dateStr = prevDate.toISOString().split('T')[0];
    const rec = recordMap.get(dateStr);
    days.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      record: rec,
    });
  }

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${mStr}-${dStr}`;
    const rec = recordMap.get(dateStr);
    days.push({
      dateStr,
      dayNum,
      isCurrentMonth: true,
      record: rec,
    });
  }

  const remainingCells = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
  for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
    const nextDate = new Date(year, month + 1, dayNum);
    const dateStr = nextDate.toISOString().split('T')[0];
    const rec = recordMap.get(dateStr);
    days.push({
      dateStr,
      dayNum,
      isCurrentMonth: false,
      record: rec,
    });
  }

  const weekDayHeaders = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs">
      {/* Calendar Header with Month & Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center font-bold">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-[#592736] text-sm sm:text-base">
              {year} 年 {month + 1} 月 🌸
            </h3>
            <p className="text-[11px] text-[#8A4F60]">點選任一天，下方立即檢視紀錄</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleToday}
            className="text-xs px-2.5 py-1 rounded-xl bg-[#FFF0F5] hover:bg-[#FFE0E9] text-[#FF85A0] font-black border border-[#FFE0E9] transition-colors"
          >
            今天 ✨
          </button>
          <div className="flex items-center bg-[#FFF8FA] rounded-xl p-0.5 border border-[#FFE0E9]">
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white rounded-lg text-[#FF85A0] transition-colors"
              aria-label="上個月"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-white rounded-lg text-[#FF85A0] transition-colors"
              aria-label="下個月"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDayHeaders.map((w, idx) => (
          <div
            key={w}
            className={`text-[11px] font-bold py-1 ${
              idx === 0 || idx === 6 ? 'text-[#FB6F92]' : 'text-[#8A4F60]'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* Calendar Date Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {days.map((item, idx) => {
          const isToday = item.dateStr === todayStr;
          const isSelected = item.dateStr === selectedDate;
          const rec = item.record;
          const hasInjection = rec && rec.mounjaroDose > 0;
          const isPeriod = rec && rec.isPeriod;
          const hasWeight = rec && rec.weight !== null;

          return (
            <button
              key={`${item.dateStr}-${idx}`}
              onClick={() => onSelectDate(item.dateStr)}
              className={`min-h-[58px] sm:min-h-[64px] rounded-2xl p-1 flex flex-col justify-between items-center transition-all relative border ${
                item.isCurrentMonth ? 'bg-white' : 'bg-slate-50/40 opacity-40'
              } ${
                isSelected
                  ? 'border-[#FFAFC2] bg-[#FFF0F5] shadow-xs ring-2 ring-[#FFAFC2]'
                  : isToday
                  ? 'border-[#FFAFC2] ring-2 ring-[#FFE0E9]'
                  : 'border-[#FFF8FA] hover:border-[#FFE0E9]'
              } hover:shadow-xs active:scale-95`}
            >
              {/* Day Number */}
              <div className="w-full flex items-center justify-between px-0.5">
                <span
                  className={`text-xs font-bold ${
                    isSelected
                      ? 'w-5 h-5 rounded-full bg-[#FFAFC2] text-white flex items-center justify-center -ml-0.5 shadow-xs font-black'
                      : isToday
                      ? 'w-5 h-5 rounded-full bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center -ml-0.5 font-black'
                      : item.isCurrentMonth
                      ? 'text-[#592736]'
                      : 'text-slate-300'
                  }`}
                >
                  {item.dayNum}
                </span>

                {isPeriod && (
                  <span
                    title={`生理期 ${rec?.periodDay ? `第${rec.periodDay}天` : ''}`}
                    className="w-3.5 h-3.5 rounded-full bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center text-[9px] font-extrabold"
                  >
                    🌸
                  </span>
                )}
              </div>

              {/* Badges / Metrics inside day cell */}
              <div className="w-full flex flex-col items-center gap-0.5 my-auto">
                {hasInjection && (
                  <div
                    title={`施打猛健樂 ${rec.mounjaroDose}mg`}
                    className="w-full text-center bg-[#FFAFC2] text-white text-[9px] font-black py-0.5 px-0.5 rounded-md shadow-xs flex items-center justify-center gap-0.5 leading-none"
                  >
                    <span>💉</span>
                    <span>{rec.mounjaroDose}mg</span>
                  </div>
                )}

                {hasWeight && (
                  <span className="text-[10px] font-semibold text-[#592736] leading-tight tracking-tighter">
                    {rec.weight}k
                  </span>
                )}
              </div>

              {/* Bottom activity dot indicator */}
              <div className="flex gap-0.5 h-1 items-center">
                {rec?.bust || rec?.waist || rec?.hips ? (
                  <span className="w-1 h-1 rounded-full bg-[#FFB8C6]" title="有三圍記錄" />
                ) : null}
                {rec?.steps ? (
                  <span className="w-1 h-1 rounded-full bg-[#FFAFC2]" title="有步數記錄" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Calendar Legend */}
      <div className="mt-3 pt-3 border-t border-[#FFE0E9]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8A4F60]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFAFC2]"></span>
            <span>💉 施打日</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFF0F5] border border-[#FFAFC2]"></span>
            <span>🌸 生理期</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200"></span>
            <span>秤重紀錄</span>
          </div>
        </div>
        <div className="text-[10px] text-[#FF85A0] bg-[#FFF0F5] px-2.5 py-0.5 rounded-full font-bold border border-[#FFE0E9]">
          週期每 7 天 1 次 🎀
        </div>
      </div>
    </div>
  );
};
