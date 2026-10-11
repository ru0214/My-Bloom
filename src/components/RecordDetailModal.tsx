import React from 'react';
import { HealthRecord } from '../types';
import { X, Edit3, Trash2, Calendar, Scale, Ruler, Heart, Footprints } from 'lucide-react';

interface RecordDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: HealthRecord | null;
  onEdit: (record: HealthRecord) => void;
  onDelete: (id: string) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !record) return null;

  const handleDelete = () => {
    if (window.confirm(`確定要刪除 ${record.date} 的紀錄嗎？`)) {
      onDelete(record.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-5 border-2 border-[#FFCCD5] flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#FFCCD5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#FB6F92] to-[#FF8FAB] text-white flex items-center justify-center shadow-sm">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-[#592736] text-sm">{record.date} 手帳明細 🌸</h3>
              <p className="text-[11px] text-[#8A4F60]">身體數據與打卡細節</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#FFF0F4] hover:bg-[#FFE5EC] text-[#FB6F92] flex items-center justify-center border border-[#FFCCD5] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mounjaro Status */}
        {record.mounjaroDose > 0 ? (
          <div className="bg-[#FFF0F4] p-3 rounded-2xl border-2 border-[#FFCCD5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💉</span>
              <div>
                <span className="text-xs font-black text-[#FB6F92] block">
                  猛健樂施打 💉 {record.mounjaroDose}mg
                </span>
                <span className="text-[11px] text-[#8A4F60]">
                  部位：{record.injectionSite || '未填寫'}
                </span>
              </div>
            </div>
            <span className="text-xs font-black text-[#FB6F92] bg-[#FFE5EC] px-2.5 py-0.5 rounded-full border border-[#FFCCD5]">
              已施打 🎀
            </span>
          </div>
        ) : (
          <div className="text-xs text-[#8A4F60] bg-[#FFF0F4] p-2.5 rounded-xl border border-[#FFCCD5]/50 flex items-center justify-between">
            <span>本日未施打藥物 (0mg)</span>
            <span className="text-[10px] text-[#8A4F60]">休整日 ☕</span>
          </div>
        )}

        {/* Period Status */}
        {record.isPeriod && (
          <div className="bg-[#FFE5EC] p-2.5 rounded-xl border border-[#FFCCD5] flex items-center gap-2 text-[#FB6F92] text-xs font-black">
            <span>🌸</span>
            <span>生理期 {record.periodDay ? `第 ${record.periodDay} 天` : ''}</span>
          </div>
        )}

        {/* Weight, Body Fat & Steps */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#FFF0F4] p-2.5 rounded-2xl border border-[#FFCCD5]/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#8A4F60] mb-0.5 font-bold">
              <Scale className="w-3 h-3 text-[#FB6F92]" />
              <span>體重</span>
            </div>
            <span className="text-sm font-black text-[#592736]">
              {record.weight !== null ? `${record.weight}kg` : '--'}
            </span>
          </div>
          <div className="bg-[#FFF0F4] p-2.5 rounded-2xl border border-[#FFCCD5]/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#8A4F60] mb-0.5 font-bold">
              <Heart className="w-3 h-3 text-[#FB6F92]" />
              <span>體脂率</span>
            </div>
            <span className="text-sm font-black text-[#FB6F92]">
              {record.bodyFat !== null ? `${record.bodyFat}%` : '--'}
            </span>
          </div>
          <div className="bg-[#FFF0F4] p-2.5 rounded-2xl border border-[#FFCCD5]/60 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#8A4F60] mb-0.5 font-bold">
              <Footprints className="w-3 h-3 text-[#FB6F92]" />
              <span>步數</span>
            </div>
            <span className="text-sm font-black text-[#592736]">
              {record.steps ? `${record.steps.toLocaleString()}` : '--'}
            </span>
          </div>
        </div>

        {/* Measurements */}
        {(record.bust || record.waist || record.hips) && (
          <div className="bg-[#FFF0F4] p-3 rounded-2xl border border-[#FFCCD5]/60">
            <div className="flex items-center gap-1 text-[11px] text-[#FB6F92] mb-1.5 font-black">
              <Ruler className="w-3.5 h-3.5 text-[#FB6F92]" />
              <span>三圍體態 🎀</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="bg-white p-1.5 rounded-xl border border-[#FFCCD5]/60">
                <span className="text-[10px] text-[#8A4F60] block">胸圍</span>
                <span className="text-xs font-black text-[#592736]">
                  {record.bust ? `${record.bust}cm` : '-'}
                </span>
              </div>
              <div className="bg-white p-1.5 rounded-xl border border-[#FFCCD5]/60">
                <span className="text-[10px] text-[#8A4F60] block">腰圍</span>
                <span className="text-xs font-black text-[#592736]">
                  {record.waist ? `${record.waist}cm` : '-'}
                </span>
              </div>
              <div className="bg-white p-1.5 rounded-xl border border-[#FFCCD5]/60">
                <span className="text-[10px] text-[#8A4F60] block">臀圍</span>
                <span className="text-xs font-black text-[#592736]">
                  {record.hips ? `${record.hips}cm` : '-'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {record.notes && (
          <div className="bg-[#FFF0F4] p-3 rounded-2xl border border-[#FFCCD5]/60">
            <span className="text-[11px] font-black text-[#FB6F92] block mb-1">備註 / 感受 ✨</span>
            <p className="text-xs text-[#592736] leading-relaxed whitespace-pre-wrap">
              {record.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => {
              onEdit(record);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-[#FB6F92] to-[#FF8FAB] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>編輯此筆</span>
          </button>
          <button
            onClick={handleDelete}
            className="py-2.5 px-3 rounded-xl bg-[#FFF0F4] hover:bg-[#FFE5EC] text-rose-500 font-bold text-xs flex items-center justify-center gap-1 transition-colors border border-[#FFCCD5]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>刪除</span>
          </button>
        </div>
      </div>
    </div>
  );
};
