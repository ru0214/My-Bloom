import React, { useState } from 'react';
import { HealthRecord, MounjaroPurchase } from '../types';
import { computeMounjaroDoseStats } from '../utils/calculator';
import {
  Syringe,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface MounjaroTabProps {
  records: HealthRecord[];
  purchases: MounjaroPurchase[];
  onAddPurchase: (purchase: MounjaroPurchase) => void;
  onDeletePurchase: (id: string) => void;
  onOpenRecordDetail: (record: HealthRecord) => void;
}

export const MounjaroTab: React.FC<MounjaroTabProps> = ({
  records,
  purchases,
  onAddPurchase,
  onDeletePurchase,
  onOpenRecordDetail,
}) => {
  // Sub-tabs: 'purchases' (購買紀錄), 'injections' (歷史施打), 'calculator' (劑量換算)
  const [subTab, setSubTab] = useState<'purchases' | 'injections' | 'calculator'>('purchases');

  // Purchase Form State
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [purchaseDosage, setPurchaseDosage] = useState<number>(5.0);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(4);
  const [purchasePrice, setPurchasePrice] = useState<string>('14000');
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');

  // Dose Calculator State
  const [penDose, setPenDose] = useState<number>(5.0);
  const [targetDose, setTargetDose] = useState<number>(2.5);
  const [totalClicksForFullDose] = useState<number>(60);

  // Injections history
  const injectionRecords = [...records]
    .filter((r) => r.mounjaroDose > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Compute remaining doses dynamically
  const doseStats = computeMounjaroDoseStats(records, purchases);

  // Purchases stats
  const totalSpent = purchases.reduce((sum, p) => sum + p.price, 0);

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    const newPurchase: MounjaroPurchase = {
      id: `purch-${Date.now()}`,
      date: purchaseDate,
      dosage: purchaseDosage,
      quantity: purchaseQuantity,
      price: parseFloat(purchasePrice) || 0,
      notes: purchaseNotes.trim() || undefined,
      createdAt: Date.now(),
    };
    onAddPurchase(newPurchase);
    setShowAddPurchaseModal(false);
    setPurchaseNotes('');
  };

  const calculatedClicks = penDose > 0 ? Math.round((targetDose / penDose) * totalClicksForFullDose) : 0;

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Header Overview & Sub-tab switcher */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#FFAFC2] to-[#FFCCD5] text-white flex items-center justify-center shadow-xs">
              <Syringe className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h2 className="font-extrabold text-[#592736] text-base sm:text-lg">藥物紀錄 💉</h2>
              <p className="text-xs text-[#8A4F60]">購買明細、施打歷程與剩餘次數試算</p>
            </div>
          </div>
          {/* 只留下一個 "+" 按鈕 */}
          <button
            onClick={() => setShowAddPurchaseModal(true)}
            title="新增購買"
            aria-label="新增購買"
            className="w-8 h-8 rounded-xl bg-[#FFF0F5] hover:bg-[#FFE0E9] text-[#FF85A0] border border-[#FFE0E9] transition-colors flex items-center justify-center shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.8]" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex bg-[#FFF8FA] p-1 rounded-2xl text-xs font-bold border border-[#FFE0E9]">
          <button
            onClick={() => setSubTab('purchases')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              subTab === 'purchases'
                ? 'bg-linear-to-r from-[#FFAFC2] to-[#FFCCD5] text-white shadow-xs font-black'
                : 'text-[#8A4F60] hover:text-[#592736]'
            }`}
          >
            💰 購買紀錄 & 費用
          </button>
          {/* 歷史施打 */}
          <button
            onClick={() => setSubTab('injections')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              subTab === 'injections'
                ? 'bg-linear-to-r from-[#FFAFC2] to-[#FFCCD5] text-white shadow-xs font-black'
                : 'text-[#8A4F60] hover:text-[#592736]'
            }`}
          >
            💉 歷史施打 ({injectionRecords.length})
          </button>
          <button
            onClick={() => setSubTab('calculator')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              subTab === 'calculator'
                ? 'bg-linear-to-r from-[#FFAFC2] to-[#FFCCD5] text-white shadow-xs font-black'
                : 'text-[#8A4F60] hover:text-[#592736]'
            }`}
          >
            📐 劑量換算
          </button>
        </div>
      </div>

      {/* 2. SubTab: 購買紀錄 & 2x2 格排列 */}
      {subTab === 'purchases' && (
        <div className="space-y-4">
          {/* 2x2 排列的四個指標卡片 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 1) 總購買花費 */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#FFE0E9] shadow-xs">
              <span className="text-[11px] text-[#8A4F60] font-medium block">總購買花費</span>
              <p className="text-base sm:text-lg font-black text-[#592736] mt-1">
                NT$ {totalSpent.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400">累計 {purchases.length} 筆紀錄 🎀</span>
            </div>

            {/* 2) 累計施打量 */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#FFE0E9] shadow-xs">
              <span className="text-[11px] text-[#8A4F60] font-medium block">累計施打量</span>
              <p className="text-base sm:text-lg font-black text-[#592736] mt-1">
                {doseStats.totalInjectedMg} <span className="text-xs font-normal text-slate-400">mg</span>
              </p>
              <span className="text-[10px] text-[#8A4F60] font-medium">
                累計施打 {injectionRecords.length} 次
              </span>
            </div>

            {/* 3) 剩餘庫存 */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#FFE0E9] shadow-xs">
              <span className="text-[11px] text-[#8A4F60] font-medium block">剩餘庫存</span>
              <p className="text-base sm:text-lg font-black text-[#FF85A0] mt-1">
                {doseStats.remainingMg} <span className="text-xs font-normal text-slate-400">mg</span>
              </p>
              <span className="text-[10px] text-[#FF85A0] font-medium">
                每次施打 {doseStats.currentDose}mg
              </span>
            </div>

            {/* 4) 剩餘施打次數 */}
            <div className="bg-[#FFF0F5] p-3.5 rounded-2xl border border-[#FFAFC2] shadow-xs">
              <span className="text-[11px] text-[#FF85A0] font-black block">
                剩餘施打次數
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#FF85A0] mt-0.5">
                {doseStats.remainingTimes} <span className="text-xs font-bold">次</span>
              </p>
              <span className="text-[10px] text-[#8A4F60] font-bold block leading-tight">
                約可施打 {doseStats.remainingTimes} 週 🌸
              </span>
            </div>
          </div>

          {/* 當剩餘施打數剩下 1 次（或更少）時的專屬警示提示 */}
          {doseStats.remainingTimes <= 1 && (
            <div className="p-3.5 bg-rose-50/90 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-2.5 shadow-xs">
              <span className="text-xl shrink-0">⚠️</span>
              <div>
                <p className="font-black text-rose-900 text-xs sm:text-sm">
                  {doseStats.remainingTimes === 1
                    ? '貼心提醒：剩餘施打次數僅剩 1 次！'
                    : '貼心提醒：剩餘施打次數已用罄 (0次)！'}
                </p>
                <p className="text-[11px] text-rose-700 mt-0.5 leading-relaxed">
                  藥物庫存即將見底，請留意提早預約或準備新藥物，確保療程順利銜接哦！
                </p>
              </div>
            </div>
          )}

          {/* Explanation Banner */}
          <div className="p-3 bg-[#FFF8FA] border border-[#FFE0E9] rounded-2xl text-xs text-[#592736] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF85A0] shrink-0" />
            <p className="text-[11px] leading-relaxed">
              <strong>智慧次數試算：</strong>已購藥量 {doseStats.totalPurchasedMg}mg，扣除已施打 {doseStats.totalInjectedMg}mg，剩餘總庫存 {doseStats.remainingMg}mg。以目前每劑 {doseStats.currentDose}mg 計算，還可完整施打 <strong>{doseStats.remainingTimes} 次</strong>。
            </p>
          </div>

          {/* Historical Purchases List */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-[#592736] text-sm sm:text-base flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#FF85A0]" />
                <span>購買紀錄清單</span>
              </h3>
              <button
                onClick={() => setShowAddPurchaseModal(true)}
                className="text-xs font-black text-[#FF85A0] hover:underline flex items-center gap-1"
              >
                + 新增購買
              </button>
            </div>

            {purchases.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#8A4F60]">
                尚未記錄任何購買紀錄
              </div>
            ) : (
              <div className="space-y-2.5">
                {purchases.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-[#FFE0E9] hover:border-[#FFAFC2] bg-[#FFF8FA] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-[#592736]">{item.date}</span>
                        <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#FFF0F5] text-[#FF85A0] border border-[#FFE0E9]">
                          規格 {item.dosage} mg
                        </span>
                        <span className="text-xs text-[#592736] font-medium">
                          {item.quantity} 支 (總量 {(item.dosage * item.quantity).toFixed(1)} mg)
                        </span>
                      </div>
                      {item.notes && (
                        <div className="text-[11px] text-[#8A4F60] mt-1 italic">
                          備註：{item.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-sm font-black text-[#592736] block">
                          NT$ {item.price.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          單支 NT${Math.round(item.price / (item.quantity || 1))}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm('確定要刪除這筆購買紀錄嗎？')) {
                            onDeletePurchase(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title="刪除紀錄"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. SubTab: 歷史施打清單 */}
      {subTab === 'injections' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-[#592736] text-sm sm:text-base flex items-center gap-1.5">
                  <Syringe className="w-4 h-4 text-[#FF85A0] -rotate-45" />
                  <span>歷史施打清單</span>
                </h3>
                <p className="text-xs text-[#8A4F60]">累計施打 {injectionRecords.length} 次，總劑量 {doseStats.totalInjectedMg} mg</p>
              </div>
              <span className="text-xs font-black text-[#FF85A0] bg-[#FFF0F5] px-2.5 py-1 rounded-xl border border-[#FFE0E9]">
                每 7 天 1 劑
              </span>
            </div>

            {injectionRecords.length === 0 ? (
              <div className="text-center py-8 text-xs text-[#8A4F60]">
                尚未有施打紀錄，請在首頁或數據趨勢中點擊「+」新增！
              </div>
            ) : (
              <div className="space-y-2.5">
                {injectionRecords.map((r, idx) => (
                  <div
                    key={r.id}
                    onClick={() => onOpenRecordDetail(r)}
                    className="p-3.5 rounded-2xl border border-[#FFE0E9] hover:border-[#FFAFC2] bg-[#FFF8FA] flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FFF0F5] text-[#FF85A0] flex items-center justify-center font-black text-xs border border-[#FFE0E9]">
                        #{injectionRecords.length - idx}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-[#592736]">{r.date}</span>
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-[#FFF0F5] text-[#FF85A0] border border-[#FFE0E9]">
                            💉 {r.mounjaroDose} mg
                          </span>
                        </div>
                        <span className="text-[11px] text-[#8A4F60] mt-0.5 block">
                          部位：{r.injectionSite || '未特別記錄'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {r.weight !== null && (
                        <span className="text-xs font-black text-[#592736] block">
                          {r.weight} kg
                        </span>
                      )}
                      <span className="text-[10px] text-[#8A4F60]">點擊查看明細 →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SubTab: 劑量換算 (格數計算) */}
      {subTab === 'calculator' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#FFE0E9] shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-[#592736] text-sm sm:text-base">
                格數計算
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#592736] mb-1">
                  購買筆型規格 (mg)
                </label>
                <select
                  value={penDose}
                  onChange={(e) => setPenDose(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#FFE0E9] bg-white text-xs font-bold text-[#592736]"
                >
                  {[2.5, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0].map((d) => (
                    <option key={d} value={d}>
                      {d} mg 筆
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#592736] mb-1">
                  目標想要施打劑量 (mg)
                </label>
                <input
                  type="number"
                  step="0.25"
                  value={targetDose}
                  onChange={(e) => setTargetDose(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-[#FFE0E9] bg-white text-xs font-bold text-[#592736]"
                />
              </div>
            </div>

            <div className="bg-linear-to-r from-[#FFAFC2] to-[#FFCCD5] text-white p-4 rounded-2xl shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white/90 block">建議旋轉刻度數</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-black">{calculatedClicks}</span>
                  <span className="text-sm font-bold text-white/90">刻度 (Clicks)</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#FF85A0] leading-relaxed bg-[#FFF0F5] p-2.5 rounded-2xl border border-[#FFE0E9] font-medium">
              ⚠️ 貼心提醒：換算僅供個人施打微調參考。不同批次筆型機制可能不同，使用前請務必遵循專業醫師與藥師指示。
            </p>
          </div>
        </div>
      )}

      {/* Add Purchase Modal */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-[#FFE0E9] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#FFE0E9]">
              <h3 className="font-extrabold text-[#592736] text-base">新增藥物購買紀錄 💊</h3>
              <button
                onClick={() => setShowAddPurchaseModal(false)}
                className="text-[#8A4F60] hover:text-[#592736] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#592736] mb-1">購買日期</label>
                <input
                  type="date"
                  required
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#FFE0E9] text-xs font-medium bg-[#FFF8FA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#592736] mb-1">單支規格 (mg)</label>
                  <select
                    value={purchaseDosage}
                    onChange={(e) => setPurchaseDosage(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#FFE0E9] text-xs font-bold bg-white"
                  >
                    {[2.5, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0].map((d) => (
                      <option key={d} value={d}>
                        {d} mg
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#592736] mb-1">購買數量 (支/劑)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FFE0E9] text-xs font-bold bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#592736] mb-1">購買總價格 (NTD)</label>
                <input
                  type="number"
                  required
                  placeholder="例如 14000"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#FFE0E9] text-xs font-bold bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#592736] mb-1">備註 (選填)</label>
                <input
                  type="text"
                  placeholder="例如 1盒4支、買2盒優惠"
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#FFE0E9] text-xs bg-[#FFF8FA]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-linear-to-r from-[#FFAFC2] to-[#FFCCD5] text-white font-black text-xs shadow-xs transition-all"
                >
                  確定儲存購買 ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
