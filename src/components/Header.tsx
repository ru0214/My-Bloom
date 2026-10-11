import React from 'react';
import { Cloud, CloudCheck, RefreshCw, Smartphone, Monitor, Plus } from 'lucide-react';

interface HeaderProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  syncStatus: 'synced' | 'syncing' | 'idle' | 'offline';
  onSyncClick: () => void;
  onOpenAddModal: () => void;
  daysUntilNextInjection: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  isMobileFrame,
  setIsMobileFrame,
  syncStatus,
  onSyncClick,
  onOpenAddModal,
  daysUntilNextInjection,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-30 border-b border-[#FFE0E9] px-4 py-3 shadow-xs transition-all">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* App Title & Cute Bloom Icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-[#FFAFC2] to-[#FFCCD5] flex items-center justify-center text-white shadow-xs">
            <span className="text-lg select-none">🌸</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-[#592736]">
                My Bloom
              </h1>
            </div>
            {daysUntilNextInjection !== null && (
              <p className="text-xs text-[#8A4F60] font-medium flex items-center gap-1">
                {daysUntilNextInjection <= 0 ? (
                  <span className="text-[#FF85A0] font-bold animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF85A0]"></span>
                    今日為施打日哦！🎀
                  </span>
                ) : (
                  <span>
                    下次施打倒數{' '}
                    <strong className="text-[#FF85A0] font-black">{daysUntilNextInjection}</strong> 天 ✨
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls - Icons ONLY (保留圖標就好 不用寫出中文) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Windows / iPhone View Toggle */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title={isMobileFrame ? '切換為電腦寬版' : '切換為手機模擬畫面'}
            className="hidden md:flex items-center justify-center w-9 h-9 rounded-2xl border border-[#FFE0E9] text-[#8A4F60] hover:bg-[#FFF0F5] transition-colors"
          >
            {isMobileFrame ? (
              <Monitor className="w-4 h-4 text-[#8A4F60]" />
            ) : (
              <Smartphone className="w-4 h-4 text-[#FF85A0]" />
            )}
          </button>

          {/* Cloud Sync Status Indicator */}
          <button
            onClick={onSyncClick}
            title={syncStatus === 'syncing' ? '同步中' : syncStatus === 'synced' ? '已同步' : '點擊同步'}
            className="flex items-center justify-center w-9 h-9 rounded-2xl border border-[#FFE0E9] hover:border-[#FFAFC2] bg-[#FFF8FA] hover:bg-[#FFF0F5] text-[#592736] transition-colors"
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
            ) : syncStatus === 'synced' ? (
              <CloudCheck className="w-4 h-4 text-[#FF85A0]" />
            ) : (
              <Cloud className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Quick Add Button - Icon only */}
          <button
            onClick={onOpenAddModal}
            title="記一筆"
            aria-label="記一筆"
            className="w-9 h-9 flex items-center justify-center rounded-2xl bg-linear-to-r from-[#FFAFC2] to-[#FFCCD5] hover:opacity-95 text-white shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.8]" />
          </button>
        </div>
      </div>
    </header>
  );
};
