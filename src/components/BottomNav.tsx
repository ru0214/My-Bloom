import React from 'react';
import { LayoutDashboard, TrendingUp, Syringe, Settings, Plus } from 'lucide-react';

export type TabKey = 'overview' | 'charts' | 'mounjaro' | 'sync';

interface BottomNavProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none flex justify-center pb-safe">
      <div className="w-full max-w-md mx-auto px-4 pb-3 pt-1 pointer-events-auto">
        <nav className="relative bg-white/95 backdrop-blur-xl border border-[#FFE0E9] rounded-3xl shadow-lg shadow-[#FFAFC2]/15 flex items-center justify-around px-2 py-2">
          {/* 首頁 */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'overview'
                ? 'text-[#FF85A0] font-black scale-105'
                : 'text-slate-400 hover:text-[#FFAFC2]'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight font-bold">首頁</span>
          </button>

          {/* 趨勢 */}
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'charts'
                ? 'text-[#FF85A0] font-black scale-105'
                : 'text-slate-400 hover:text-[#FFAFC2]'
            }`}
          >
            <TrendingUp className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight font-bold">趨勢</span>
          </button>

          {/* Center Elevated Floating Add Button - Soft Pastel Pink */}
          <div className="relative -top-5 flex flex-col items-center">
            <button
              onClick={onOpenAddModal}
              title="新增紀錄"
              aria-label="新增紀錄"
              className="w-13 h-13 rounded-full bg-linear-to-tr from-[#FFAFC2] to-[#FFCCD5] text-white flex items-center justify-center shadow-md shadow-[#FFAFC2]/40 active:scale-90 hover:scale-105 transition-all ring-4 ring-[#FFF8FA]"
            >
              <Plus className="w-7 h-7 stroke-[2.8]" />
            </button>
            <span className="text-[10px] font-extrabold text-[#FF85A0] mt-1">記一筆</span>
          </div>

          {/* 藥物紀錄 (圖標改成針筒) */}
          <button
            onClick={() => setActiveTab('mounjaro')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'mounjaro'
                ? 'text-[#FF85A0] font-black scale-105'
                : 'text-slate-400 hover:text-[#FFAFC2]'
            }`}
          >
            <Syringe className="w-5 h-5 mb-0.5 -rotate-45" />
            <span className="text-[11px] leading-tight font-bold">藥物紀錄</span>
          </button>

          {/* 設定 */}
          <button
            onClick={() => setActiveTab('sync')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'sync'
                ? 'text-[#FF85A0] font-black scale-105'
                : 'text-slate-400 hover:text-[#FFAFC2]'
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-tight font-bold">設定</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
