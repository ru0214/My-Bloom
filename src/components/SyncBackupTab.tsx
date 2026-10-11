import React, { useState } from 'react';
import { AppData, UserSettings } from '../types';
import {
  exportToJson,
  exportToCsv,
  parseImportJson,
  generateCloudCode,
} from '../utils/storage';
import {
  Cloud,
  Download,
  Upload,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  Target,
  Sparkles,
  Trash2,
  Smartphone,
  ShieldCheck,
  Footprints,
  Palette,
  AlertTriangle,
  X,
} from 'lucide-react';
import { APP_THEMES, getThemeById } from '../utils/theme';

interface SyncBackupTabProps {
  data: AppData;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onImportData: (importedData: AppData) => void;
  onResetSampleData: () => void;
  onClearAllData: () => void;
  onManualSync: () => Promise<void>;
  isSyncing: boolean;
}

export const SyncBackupTab: React.FC<SyncBackupTabProps> = ({
  data,
  onUpdateSettings,
  onImportData,
  onResetSampleData,
  onClearAllData,
  onManualSync,
  isSyncing,
}) => {
  const [syncKeyInput, setSyncKeyInput] = useState(data.settings.syncKey || '');
  const [copied, setCopied] = useState(false);
  const [targetWeight, setTargetWeight] = useState(String(data.settings.targetWeight || 52));
  const [startWeight, setStartWeight] = useState(String(data.settings.startWeight || 66.5));
  const [height, setHeight] = useState(String(data.settings.height || 162));
  const [dailyStepsTarget, setDailyStepsTarget] = useState(String(data.settings.dailyStepsTarget || 8000));
  const [clearConfirmStep, setClearConfirmStep] = useState<0 | 1 | 2>(0);
  const [showSampleConfirmModal, setShowSampleConfirmModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleFinalClear = () => {
    onClearAllData();
    setClearConfirmStep(0);
    showFeedback('已清空所有歷史資料與紀錄！🌸');
  };

  const handleGenerateCode = async () => {
    const code = await generateCloudCode();
    setSyncKeyInput(code);
    onUpdateSettings({ ...data.settings, syncKey: code });
  };

  const handleSaveSyncKey = () => {
    if (!syncKeyInput.trim()) return;
    onUpdateSettings({ ...data.settings, syncKey: syncKeyInput.trim().toUpperCase() });
    showFeedback(`已綁定同步碼：${syncKeyInput.trim().toUpperCase()}`);
  };

  const handleCopyCode = () => {
    if (!data.settings.syncKey) return;
    navigator.clipboard.writeText(data.settings.syncKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...data.settings,
      targetWeight: parseFloat(targetWeight) || 52,
      startWeight: parseFloat(startWeight) || 66.5,
      height: parseFloat(height) || 162,
      dailyStepsTarget: parseInt(dailyStepsTarget) || 8000,
    });
    alert('目標設定已成功更新！🌸');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = parseImportJson(content);
        if (
          window.confirm(
            `成功讀取備份！包含 ${imported.records.length} 筆身體數據與 ${imported.purchases.length} 筆購買紀錄。確定要載入並取代目前資料嗎？`
          )
        ) {
          onImportData(imported);
          alert('資料還原成功！✨');
        }
      } catch (err: any) {
        alert('匯入失敗：' + (err.message || '檔案格式錯誤'));
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4 pb-24">
      {/* 1. TOP CARD: 目標設定 */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#FFCCD5] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-[#FB6F92] to-[#FF8FAB] text-white flex items-center justify-center shadow-md shadow-[#FB6F92]/25">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-[#592736] text-base">目標設定</h3>
            <p className="text-xs text-[#8A4F60]">體重、身高與每日步數目標 (計算 BMI 與達成率)</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-xs font-black text-[#592736] mb-1">目標體重 (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border-2 border-[#FFCCD5] text-sm font-black text-[#592736] bg-[#FFF0F4] focus:border-[#FB6F92] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#592736] mb-1">起始體重 (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={startWeight}
                onChange={(e) => setStartWeight(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border-2 border-[#FFCCD5] text-sm font-black text-[#592736] bg-[#FFF0F4] focus:border-[#FB6F92] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#592736] mb-1">身高 (cm)</label>
              <input
                type="number"
                step="0.5"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border-2 border-[#FFCCD5] text-sm font-black text-[#592736] bg-[#FFF0F4] focus:border-[#FB6F92] outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#592736] mb-1 flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5 text-[#FB6F92]" />
                <span>目標步數</span>
              </label>
              <input
                type="number"
                step="500"
                required
                value={dailyStepsTarget}
                onChange={(e) => setDailyStepsTarget(e.target.value)}
                className="w-full px-3 py-2 rounded-2xl border-2 border-[#FFCCD5] text-sm font-black text-[#592736] bg-[#FFF0F4] focus:border-[#FB6F92] outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-linear-to-r from-[#FB6F92] to-[#FF8FAB] hover:opacity-95 text-white text-xs font-black transition-all shadow-md shadow-[#FB6F92]/25"
            >
              儲存目標設定 🌸
            </button>
          </div>
        </form>
      </div>

      {/* 2. 界面顏色 (純色塊選擇，依色系排列，32 種配色) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#FFCCD5] shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-[#FFAFC2] to-[#FFCCD5] text-white flex items-center justify-center shadow-md shadow-[#FFAFC2]/25">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-[#592736] text-base">界面顏色 🎨</h3>
          </div>
        </div>

        {/* 只要留下顏色色塊，不顯示顏色名稱與說明 (依照色系排列好，小圓形色塊，視覺乾淨不擁擠) */}
        <div className="grid grid-cols-8 gap-y-3 gap-x-1.5 sm:gap-x-2.5 sm:gap-y-3.5 pt-1.5 px-0.5 sm:px-1">
          {APP_THEMES.map((theme) => {
            const isSelected = (data.settings.themeColor || 'pink') === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  onUpdateSettings({ ...data.settings, themeColor: theme.id });
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 mx-auto rounded-full transition-all flex items-center justify-center relative cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'scale-110 z-10'
                    : 'hover:scale-110 hover:shadow-2xs opacity-90 hover:opacity-100'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
                  border: `1.5px solid ${theme.primary}`,
                  boxShadow: isSelected
                    ? `0 0 0 2px #ffffff, 0 0 0 4.5px ${theme.primary}`
                    : undefined,
                }}
                title={theme.name}
                aria-label={theme.name}
              >
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-white stroke-[3.5] drop-shadow-xs" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Cross-Device Cloud Sync Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#FFCCD5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-[#FB6F92] to-[#FF8FAB] text-white flex items-center justify-center shadow-md shadow-[#FB6F92]/25">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-[#592736] text-base">
                Windows 與 iPhone 跨裝置同步 ☁️
              </h3>
              <p className="text-xs text-[#8A4F60]">輸入相同同步碼即可跨裝置查看最新數據</p>
            </div>
          </div>
          <button
            onClick={onManualSync}
            disabled={isSyncing || !data.settings.syncKey}
            className="text-xs font-black px-3.5 py-2 rounded-xl bg-linear-to-r from-[#FB6F92] to-[#FF8FAB] hover:opacity-95 disabled:opacity-40 text-white flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? '同步中...' : '立即同步'}</span>
          </button>
        </div>

        {/* Pairing Code Banner */}
        <div className="bg-[#FFF0F4] p-4 rounded-3xl border-2 border-[#FFCCD5] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#592736] flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-[#FB6F92]" />
              <span>您的專屬同步碼 (Sync Key)</span>
            </span>
            {data.settings.syncKey && (
              <button
                onClick={handleCopyCode}
                className="text-xs text-[#FB6F92] font-black flex items-center gap-1 hover:underline"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#FB6F92]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已複製！' : '複製代碼'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="例如 MJ-8823 或自訂代碼"
              value={syncKeyInput}
              onChange={(e) => setSyncKeyInput(e.target.value.toUpperCase())}
              className="flex-1 px-3.5 py-2.5 rounded-2xl border-2 border-[#FFCCD5] bg-white text-sm font-mono font-black text-[#592736] tracking-wider uppercase focus:border-[#FB6F92] outline-hidden"
            />
            <button
              onClick={handleSaveSyncKey}
              className="px-4 py-2.5 rounded-2xl bg-linear-to-r from-[#FB6F92] to-[#FF8FAB] text-white font-black text-xs shadow-xs"
            >
              綁定此碼
            </button>
            <button
              onClick={handleGenerateCode}
              title="自動產生新同步碼"
              className="px-3 py-2.5 rounded-2xl bg-white border border-[#FFCCD5] hover:bg-[#FFE5EC] text-[#FB6F92] font-black text-xs"
            >
              隨機產生
            </button>
          </div>

          {/* Sync Guide Instruction */}
          <div className="p-3 bg-white border border-[#FFCCD5] rounded-2xl text-xs text-[#592736] space-y-1">
            <p className="font-black flex items-center gap-1 text-[#FB6F92]">
              <Smartphone className="w-3.5 h-3.5" />
              <span>如何跨裝置查看？</span>
            </p>
            <p className="text-[11px] leading-relaxed text-[#8A4F60]">
              1. 點擊「隨機產生」或輸入自訂同步碼並點擊「綁定」。<br />
              2. 在您的 iPhone 或 Windows 瀏覽器開啟本工具，進入「設定」分頁。<br />
              3. 輸入相同的同步碼並綁定，即可隨時在兩台裝置雙向查看最新數據！
            </p>
          </div>

          {data.settings.lastSyncTime && (
            <p className="text-[10px] text-[#8A4F60] text-right font-medium">
              最後雲端同步時間：{new Date(data.settings.lastSyncTime).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* 3. Export & Import Backup Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#FFCCD5] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-linear-to-tr from-[#FB6F92] to-[#FF8FAB] text-white flex items-center justify-center shadow-md shadow-[#FB6F92]/25">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-[#592736] text-base">資料備份與檔案匯出 💾</h3>
            <p className="text-xs text-[#8A4F60]">完整保存本機所有歷史數據，隨時備份防遺失</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Export JSON */}
          <button
            onClick={() => exportToJson(data)}
            className="p-3.5 rounded-2xl border-2 border-[#FFCCD5] hover:bg-[#FFE5EC]/50 bg-[#FFF0F4]/60 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#FFE5EC] text-[#FB6F92] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform font-bold">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-[#592736] block">匯出 JSON 備份</span>
              <span className="text-[11px] text-[#8A4F60] leading-tight block mt-0.5">
                完整備份檔，包含所有紀錄與個人設定
              </span>
            </div>
            <span className="text-[11px] font-black text-[#FB6F92] mt-3 block">點擊下載備份檔 →</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={() => exportToCsv(data.records)}
            className="p-3.5 rounded-2xl border-2 border-[#FFCCD5] hover:bg-[#FFE5EC]/50 bg-[#FFF0F4]/60 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#FFE5EC] text-[#FB6F92] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform font-bold">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-[#592736] block">匯出 CSV 試算表</span>
              <span className="text-[11px] text-[#8A4F60] leading-tight block mt-0.5">
                包含步數、體重、體脂率與三圍表格
              </span>
            </div>
            <span className="text-[11px] font-black text-[#FB6F92] mt-3 block">下載 Excel 表格 →</span>
          </button>

          {/* Import JSON */}
          <label className="p-3.5 rounded-2xl border-2 border-[#FFCCD5] hover:bg-[#FFE5EC]/50 bg-[#FFF0F4]/60 text-left transition-all group flex flex-col justify-between cursor-pointer">
            <div>
              <div className="w-8 h-8 rounded-xl bg-[#FFE5EC] text-[#FB6F92] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform font-bold">
                <Upload className="w-4 h-4" />
              </div>
              <span className="text-xs font-black text-[#592736] block">匯入 JSON 還原</span>
              <span className="text-[11px] text-[#8A4F60] leading-tight block mt-0.5">
                從備份檔還原先前的歷史資料
              </span>
            </div>
            <span className="text-[11px] font-black text-[#FB6F92] mt-3 block">選擇檔案還原 →</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 4. Reset & Sample Data Tools */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#FFCCD5] shadow-xs space-y-3">
        <h4 className="text-xs font-black text-[#592736]">資料重置與示範範本 🌸</h4>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSampleConfirmModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FFF0F4] hover:bg-[#FFE5EC] text-[#592736] text-xs font-black border border-[#FFCCD5] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FB6F92]" />
            <span>重新載入 30 天示範數據</span>
          </button>

          <button
            type="button"
            onClick={() => setClearConfirmStep(1)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空所有紀錄</span>
          </button>
        </div>
      </div>

      {/* 二次確認視窗 (2/3) */}
      {clearConfirmStep === 1 && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setClearConfirmStep(0);
          }}
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-rose-200 space-y-4 animate-in zoom-in-95 duration-200 text-center relative">
            <button
              type="button"
              onClick={() => setClearConfirmStep(0)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="關閉視窗"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 警告圖標與進度標籤 */}
            <div className="w-14 h-14 rounded-full bg-rose-50 border-2 border-rose-100 flex items-center justify-center mx-auto text-rose-500 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black">
                步驟 2 / 3 · 二次確認
              </span>
              <h3 className="text-base font-black text-[#592736]">
                二次確認：清空所有紀錄？
              </h3>
              <p className="text-xs text-rose-600 font-bold">
                ⚠️ 即將刪除歷史數據，請進行二次確認！
              </p>
            </div>

            <div className="bg-rose-50/70 rounded-2xl p-3.5 text-left border border-rose-100 text-xs text-[#592736] space-y-1.5">
              <p className="font-bold text-[#592736]">即將永久刪除的內容：</p>
              <ul className="space-y-1 text-[11px] text-[#8A4F60] list-disc list-inside">
                <li>
                  身體數據紀錄：<strong className="text-rose-600">{data.records.length}</strong> 筆
                </li>
                <li>
                  購買與清單項目：<strong className="text-rose-600">{data.purchases.length}</strong> 筆
                </li>
              </ul>
              <p className="text-[10px] text-gray-500 pt-1.5 border-t border-rose-200/50">
                💡 提示：如需備份，可先按「取消」並在上方進行 JSON/CSV 備份匯出。
              </p>
            </div>

            {/* 二次確認操作按鈕 */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setClearConfirmStep(0)}
                className="w-full py-2.5 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs transition-colors cursor-pointer"
              >
                取消保留
              </button>
              <button
                type="button"
                onClick={() => setClearConfirmStep(2)}
                className="w-full py-2.5 px-3 rounded-2xl bg-linear-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-black text-xs transition-all shadow-md shadow-rose-500/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>二次確認清空</span>
                <span className="text-[11px]">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 三次確認視窗 (3/3 最終確認) */}
      {clearConfirmStep === 2 && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setClearConfirmStep(0);
          }}
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-3 border-red-400 space-y-4 animate-in zoom-in-95 duration-200 text-center relative ring-4 ring-red-500/20">
            <button
              type="button"
              onClick={() => setClearConfirmStep(0)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="關閉視窗"
            >
              <X className="w-4 h-4" />
            </button>

            {/* 高警示危險圖標 */}
            <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center mx-auto text-red-600 shadow-lg shadow-red-500/20 animate-pulse">
              <Trash2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider animate-bounce">
                🚨 步驟 3 / 3 · 最終三次確認
              </span>
              <h3 className="text-lg font-black text-red-600 pt-1">
                三次確認：最後決定！
              </h3>
              <p className="text-xs text-[#592736] font-extrabold">
                此動作將立即「永久銷毀」所有歷史紀錄！
              </p>
            </div>

            <div className="bg-red-50 rounded-2xl p-3.5 text-center border-2 border-red-200 text-xs text-red-700 space-y-1 font-bold">
              <p>一旦按下確認，所有紀錄將無法挽回與撤銷！</p>
              <p className="text-[11px] text-red-500 font-medium">真的確定要執行刪除嗎？</p>
            </div>

            {/* 三次確認操作按鈕 */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setClearConfirmStep(0)}
                className="w-full py-2.5 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs transition-colors cursor-pointer"
              >
                取消放棄
              </button>
              <button
                type="button"
                onClick={handleFinalClear}
                className="w-full py-2.5 px-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition-all shadow-lg shadow-red-600/35 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>三次確認：確定刪除</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 示範數據確認視窗 */}
      {showSampleConfirmModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSampleConfirmModal(false);
          }}
        >
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-[#FFCCD5] space-y-4 animate-in zoom-in-95 duration-200 text-center relative">
            <button
              type="button"
              onClick={() => setShowSampleConfirmModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="關閉視窗"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-pink-50 border-2 border-pink-100 flex items-center justify-center mx-auto text-[#FB6F92] shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-black text-[#592736]">
                載入 30 天示範數據？
              </h3>
              <p className="text-xs text-[#8A4F60]">
                將會以模擬連續 30 天數據覆蓋現有紀錄。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowSampleConfirmModal(false)}
                className="w-full py-2.5 px-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-black text-xs transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetSampleData();
                  setShowSampleConfirmModal(false);
                  showFeedback('已成功載入 30 天示範數據！✨');
                }}
                className="w-full py-2.5 px-3 rounded-2xl bg-linear-to-r from-[#FFAFC2] to-[#FF85A0] hover:opacity-95 text-white font-black text-xs transition-all shadow-md shadow-pink-500/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>確認載入</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 操作提示 Toast */}
      {feedbackMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#592736] text-white px-4 py-2.5 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          <span>{feedbackMessage}</span>
        </div>
      )}
    </div>
  );
};
