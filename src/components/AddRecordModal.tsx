import React, { useState, useEffect } from 'react';
import { HealthRecord, INJECTION_SITES, COMMON_DOSES } from '../types';
import { X, Syringe, Scale, Ruler, Sparkles, Heart, Check, Footprints } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AddRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecord: (record: HealthRecord) => void;
  initialDate?: string;
  existingRecord?: HealthRecord | null;
  lastInjectionSite?: string | null;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  isOpen,
  onClose,
  onSaveRecord,
  initialDate,
  existingRecord,
  lastInjectionSite,
}) => {
  const [date, setDate] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [bust, setBust] = useState<string>('');
  const [waist, setWaist] = useState<string>('');
  const [hips, setHips] = useState<string>('');
  const [steps, setSteps] = useState<string>('');
  const [mounjaroDose, setMounjaroDose] = useState<number>(0);
  const [customDose, setCustomDose] = useState<string>('');
  const [injectionSite, setInjectionSite] = useState<string>('');
  const [isPeriod, setIsPeriod] = useState<boolean>(false);
  const [periodDay, setPeriodDay] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (existingRecord) {
        setDate(existingRecord.date);
        setWeight(existingRecord.weight !== null ? String(existingRecord.weight) : '');
        setBodyFat(existingRecord.bodyFat !== null ? String(existingRecord.bodyFat) : '');
        setBust(existingRecord.bust !== null ? String(existingRecord.bust) : '');
        setWaist(existingRecord.waist !== null ? String(existingRecord.waist) : '');
        setHips(existingRecord.hips !== null ? String(existingRecord.hips) : '');
        setSteps(existingRecord.steps !== null && existingRecord.steps !== undefined ? String(existingRecord.steps) : '');
        setMounjaroDose(existingRecord.mounjaroDose || 0);
        if (!COMMON_DOSES.includes(existingRecord.mounjaroDose) && existingRecord.mounjaroDose > 0) {
          setCustomDose(String(existingRecord.mounjaroDose));
        } else {
          setCustomDose('');
        }
        setInjectionSite(existingRecord.injectionSite || '');
        setIsPeriod(!!existingRecord.isPeriod);
        setPeriodDay(existingRecord.periodDay || 1);
        setNotes(existingRecord.notes || '');
      } else {
        const todayStr = initialDate || new Date().toISOString().split('T')[0];
        setDate(todayStr);
        setWeight('');
        setBodyFat('');
        setBust('');
        setWaist('');
        setHips('');
        setSteps('');
        setMounjaroDose(0);
        setCustomDose('');
        setInjectionSite('');
        setIsPeriod(false);
        setPeriodDay(1);
        setNotes('');
      }
    }
  }, [isOpen, existingRecord, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalDose = mounjaroDose;
    if (customDose && !isNaN(parseFloat(customDose))) {
      finalDose = parseFloat(customDose);
    }

    const newRecord: HealthRecord = {
      id: existingRecord ? existingRecord.id : `rec-${date}-${Date.now()}`,
      date,
      weight: weight ? parseFloat(weight) : null,
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      bust: bust ? parseFloat(bust) : null,
      waist: waist ? parseFloat(waist) : null,
      hips: hips ? parseFloat(hips) : null,
      steps: steps ? parseInt(steps) : null,
      mounjaroDose: finalDose,
      injectionSite: finalDose > 0 ? injectionSite : undefined,
      isPeriod,
      periodDay: isPeriod ? periodDay : undefined,
      notes: notes.trim() || undefined,
      createdAt: existingRecord ? existingRecord.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    onSaveRecord(newRecord);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#FB6F92', '#FF8FAB', '#FFB3C6', '#FFE5EC'],
      });
    } catch (err) {
      // ignore
    }

    onClose();
  };

  const handleAdjustWeight = (delta: number) => {
    const currentVal = parseFloat(weight) || 60;
    const newVal = +(currentVal + delta).toFixed(1);
    setWeight(String(newVal));
  };

  const quickNotes = [
    '食慾抑制良好 🌸',
    '飽足感明顯 ✨',
    '多喝溫水補水 💧',
    '排便順暢 🍓',
    '運動散步好精神 🚶‍♀️',
    '心情輕盈 💖',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-lg max-h-[92vh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border-2 border-[#FFCCD5]">
        {/* Modal Top Bar - Cute Baby Pink */}
        <div className="px-5 py-4 border-b-2 border-[#FFCCD5] flex items-center justify-between bg-linear-to-r from-[#FFF0F4] to-[#FFE5EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-[#FB6F92] to-[#FF8FAB] text-white flex items-center justify-center shadow-md shadow-[#FB6F92]/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#592736]">
                {existingRecord ? '編輯身體與施打紀錄 🎀' : '新增今日數據手帳 🌸'}
              </h2>
              <p className="text-xs text-[#8A4F60]">每日體態、步數與藥物追蹤</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#FB6F92] flex items-center justify-center border border-[#FFCCD5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* 1. Date Field */}
          <div>
            <label className="block text-xs font-black text-[#592736] mb-1">記錄日期 📅</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-[#FFCCD5] focus:border-[#FB6F92] outline-hidden text-sm text-[#592736] font-bold bg-[#FFF0F4]"
            />
          </div>

          {/* 2. Mounjaro Dose Field */}
          <div className="bg-[#FFF0F4] p-4 rounded-3xl border-2 border-[#FFCCD5]">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-black text-[#592736]">
                <Syringe className="w-4 h-4 text-[#FB6F92] -rotate-45" />
                <span>猛健樂施打劑量 (mg) 💉</span>
              </label>
              <span className="text-[11px] font-black text-[#FB6F92]">
                {mounjaroDose > 0 ? `本日施打 💉 ${mounjaroDose}mg` : '今日未施打 (0mg)'}
              </span>
            </div>

            {/* Quick Dose Chips */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 mb-3">
              {COMMON_DOSES.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => {
                    setMounjaroDose(d);
                    setCustomDose('');
                  }}
                  className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all ${
                    mounjaroDose === d && !customDose
                      ? 'bg-[#FB6F92] text-white shadow-xs scale-105 ring-2 ring-[#FFCCD5]'
                      : 'bg-white border border-[#FFCCD5] text-[#8A4F60] hover:bg-[#FFE5EC]'
                  }`}
                >
                  {d === 0 ? '無施打' : `${d}mg`}
                </button>
              ))}
            </div>

            {/* Custom Dose Input */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[#8A4F60]">自訂劑量:</span>
              <input
                type="number"
                step="0.1"
                placeholder="例如 4.0 或 2.5"
                value={customDose}
                onChange={(e) => {
                  setCustomDose(e.target.value);
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setMounjaroDose(val);
                }}
                className="w-32 px-3 py-1 text-xs font-bold bg-white border border-[#FFCCD5] rounded-xl text-[#592736] focus:border-[#FB6F92] outline-hidden"
              />
              <span className="text-xs text-[#8A4F60]">mg</span>
            </div>

            {/* Injection Site Picker */}
            {mounjaroDose > 0 && (
              <div className="mt-3 pt-3 border-t border-[#FFCCD5] animate-in fade-in">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-[#592736]">施打部位輪替</span>
                  {lastInjectionSite && (
                    <span className="text-[10px] text-[#FB6F92] font-bold">
                      上次部位：{lastInjectionSite}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {INJECTION_SITES.map((site) => (
                    <button
                      type="button"
                      key={site.id}
                      onClick={() => setInjectionSite(site.label)}
                      className={`text-left text-xs px-2.5 py-1.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                        injectionSite === site.label
                          ? 'border-[#FB6F92] bg-[#FFE5EC] text-[#592736] font-black'
                          : 'border-white bg-white/80 text-[#8A4F60] hover:bg-white'
                      }`}
                    >
                      <span>{site.label}</span>
                      {injectionSite === site.label && <Check className="w-3.5 h-3.5 text-[#FB6F92]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Weight, Body Fat & Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Weight */}
            <div className="bg-[#FFF0F4] p-3 rounded-2xl border-2 border-[#FFCCD5]">
              <div className="flex items-center justify-between mb-1">
                <label className="flex items-center gap-1 text-xs font-black text-[#592736]">
                  <Scale className="w-3.5 h-3.5 text-[#FB6F92]" />
                  <span>體重 (kg)</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(-0.1)}
                    className="w-4 h-4 rounded-md bg-white border border-[#FFCCD5] text-[#FB6F92] flex items-center justify-center hover:bg-[#FFE5EC] text-xs font-bold"
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustWeight(0.1)}
                    className="w-4 h-4 rounded-md bg-white border border-[#FFCCD5] text-[#FB6F92] flex items-center justify-center hover:bg-[#FFE5EC] text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <input
                type="number"
                step="0.05"
                placeholder="例如 64.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm font-black text-[#592736] bg-white border border-[#FFCCD5] rounded-xl focus:border-[#FB6F92] outline-hidden"
              />
            </div>

            {/* Body Fat */}
            <div className="bg-[#FFF0F4] p-3 rounded-2xl border-2 border-[#FFCCD5]">
              <label className="flex items-center gap-1 text-xs font-black text-[#592736] mb-1">
                <Heart className="w-3.5 h-3.5 text-[#FB6F92]" />
                <span>體脂率 (%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="例如 29.8"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm font-black text-[#592736] bg-white border border-[#FFCCD5] rounded-xl focus:border-[#FB6F92] outline-hidden"
              />
            </div>

            {/* Steps */}
            <div className="bg-[#FFF0F4] p-3 rounded-2xl border-2 border-[#FFCCD5]">
              <label className="flex items-center gap-1 text-xs font-black text-[#592736] mb-1">
                <Footprints className="w-3.5 h-3.5 text-[#FB6F92]" />
                <span>步數 (步)</span>
              </label>
              <input
                type="number"
                step="100"
                placeholder="例如 8500"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="w-full px-2.5 py-1.5 text-sm font-black text-[#592736] bg-white border border-[#FFCCD5] rounded-xl focus:border-[#FB6F92] outline-hidden"
              />
            </div>
          </div>

          {/* 4. Three Measurements (Bust, Waist, Hips) */}
          <div className="bg-[#FFF0F4] p-3.5 rounded-2xl border-2 border-[#FFCCD5] space-y-2">
            <div className="flex items-center gap-1.5 mb-1">
              <Ruler className="w-4 h-4 text-[#FB6F92]" />
              <label className="text-xs font-black text-[#592736]">
                三圍數據 (cm，選填) 🎀
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[11px] text-[#8A4F60] font-bold block mb-0.5">胸圍 cm</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="如 88.0"
                  value={bust}
                  onChange={(e) => setBust(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm font-black text-[#592736] bg-white border border-[#FFCCD5] rounded-xl focus:border-[#FB6F92] outline-hidden"
                />
              </div>
              <div>
                <span className="text-[11px] text-[#8A4F60] font-bold block mb-0.5">腰圍 cm</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="如 75.5"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm font-black text-[#592736] bg-white border border-[#FFCCD5] rounded-xl focus:border-[#FB6F92] outline-hidden"
                />
              </div>
              <div>
                <span className="text-[11px] text-[#8A4F60] font-bold block mb-0.5">臀圍 cm</span>
                <input
                  type="number"
                  step="0.1"
                  placeholder="如 95.0"
                  value={hips}
                  onChange={(e) => setHips(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm font-black text-[#592736] bg-white border border-[#FFCCD5] rounded-xl focus:border-[#FB6F92] outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 5. Period / Menstrual Cycle Switch */}
          <div className="p-3.5 rounded-2xl border-2 border-[#FFCCD5] bg-[#FFE5EC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌸</span>
              <div>
                <span className="text-xs font-black text-[#592736] block">今日為生理期</span>
                <span className="text-[10px] text-[#8A4F60]">
                  經期水腫可能導致體重浮動，放輕鬆別焦慮喔！
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPeriod && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[#592736] font-bold">第</span>
                  <select
                    value={periodDay}
                    onChange={(e) => setPeriodDay(parseInt(e.target.value))}
                    className="bg-white border border-[#FFCCD5] rounded-lg px-2 py-1 text-xs font-black text-[#FB6F92]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <option key={num} value={num}>
                        {num}
                      </option>
                    ))}
                  </select>
                  <span className="text-[#592736] font-bold">天</span>
                </div>
              )}
              <input
                type="checkbox"
                checked={isPeriod}
                onChange={(e) => setIsPeriod(e.target.checked)}
                className="w-5 h-5 rounded-md accent-[#FB6F92] cursor-pointer"
              />
            </div>
          </div>

          {/* 6. Notes & Feelings */}
          <div>
            <label className="block text-xs font-black text-[#592736] mb-1.5">
              紀錄備註與身體感受 (選填) ✨
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {quickNotes.map((qn) => (
                <button
                  type="button"
                  key={qn}
                  onClick={() => setNotes((prev) => (prev ? `${prev}、${qn}` : qn))}
                  className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF0F4] hover:bg-[#FFE5EC] text-[#592736] border border-[#FFCCD5] transition-colors"
                >
                  +{qn}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：注射後食慾安穩，口渴記得多補充溫水..."
              className="w-full px-3 py-2 text-xs text-[#592736] bg-[#FFF0F4] border-2 border-[#FFCCD5] rounded-2xl focus:border-[#FB6F92] focus:bg-white outline-hidden resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-linear-to-r from-[#FB6F92] to-[#FF8FAB] hover:opacity-95 text-white font-black text-sm shadow-md shadow-[#FB6F92]/30 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{existingRecord ? '儲存變更 ✨' : '確定記錄 🌸'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
