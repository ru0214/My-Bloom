import React, { useState, useEffect, useCallback } from 'react';
import { AppData, HealthRecord, MounjaroPurchase, UserSettings } from './types';
import {
  loadLocalData,
  saveLocalData,
  fetchCloudData,
  saveCloudData,
  generateSampleData,
  DEFAULT_SETTINGS,
} from './utils/storage';
import { computeSummaryStats } from './utils/calculator';
import { applyTheme } from './utils/theme';
import { Header } from './components/Header';
import { BottomNav, TabKey } from './components/BottomNav';
import { OverviewTab } from './components/OverviewTab';
import { ChartsTab } from './components/ChartsTab';
import { MounjaroTab } from './components/MounjaroTab';
import { SyncBackupTab } from './components/SyncBackupTab';
import { AddRecordModal } from './components/AddRecordModal';
import { RecordDetailModal } from './components/RecordDetailModal';

export default function App() {
  const [data, setData] = useState<AppData>(() => loadLocalData());
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'idle' | 'offline'>('idle');

  // Apply theme dynamically whenever theme setting changes
  useEffect(() => {
    applyTheme(data.settings.themeColor || 'pink');
  }, [data.settings.themeColor]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialDate, setAddModalInitialDate] = useState<string | undefined>();
  const [addModalExistingRecord, setAddModalExistingRecord] = useState<HealthRecord | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<HealthRecord | null>(null);

  // Auto-sync when data changes if syncKey is set
  const pushToCloud = useCallback(async (appData: AppData) => {
    if (!appData.settings.syncKey) return;
    setSyncStatus('syncing');
    const success = await saveCloudData(appData.settings.syncKey, appData);
    if (success) {
      setSyncStatus('synced');
      setData((prev) => {
        const next = {
          ...prev,
          settings: { ...prev.settings, lastSyncTime: Date.now() },
        };
        saveLocalData(next);
        return next;
      });
    } else {
      setSyncStatus('idle');
    }
  }, []);

  // Initial pull from cloud if syncKey exists
  useEffect(() => {
    if (data.settings.syncKey) {
      (async () => {
        setSyncStatus('syncing');
        const remote = await fetchCloudData(data.settings.syncKey);
        if (remote) {
          // If remote has newer or more data, adopt it
          setData(remote);
          saveLocalData(remote);
          setSyncStatus('synced');
        } else {
          // If key exists on local but not on server yet, upload local
          await pushToCloud(data);
        }
      })();
    }
  }, []);

  // Summary stats for injection countdown
  const summaryStats = computeSummaryStats(data.records, data.settings);

  // Record CRUD
  const handleSaveRecord = (record: HealthRecord) => {
    setData((prev) => {
      // Find if record with same date exists
      const existingIdx = prev.records.findIndex(
        (r) => r.id === record.id || r.date === record.date
      );
      let updatedRecords: HealthRecord[];

      if (existingIdx >= 0) {
        updatedRecords = [...prev.records];
        updatedRecords[existingIdx] = record;
      } else {
        updatedRecords = [record, ...prev.records];
      }

      // Sort by date descending
      updatedRecords.sort((a, b) => b.date.localeCompare(a.date));

      const nextData: AppData = {
        ...prev,
        records: updatedRecords,
      };

      saveLocalData(nextData);
      if (prev.settings.autoSync && prev.settings.syncKey) {
        pushToCloud(nextData);
      }
      return nextData;
    });
  };

  const handleDeleteRecord = (id: string) => {
    setData((prev) => {
      const nextRecords = prev.records.filter((r) => r.id !== id);
      const nextData: AppData = {
        ...prev,
        records: nextRecords,
      };
      saveLocalData(nextData);
      if (prev.settings.autoSync && prev.settings.syncKey) {
        pushToCloud(nextData);
      }
      return nextData;
    });
  };

  // Purchase CRUD
  const handleAddPurchase = (purchase: MounjaroPurchase) => {
    setData((prev) => {
      const nextPurchases = [purchase, ...prev.purchases];
      nextPurchases.sort((a, b) => b.date.localeCompare(a.date));
      const nextData: AppData = {
        ...prev,
        purchases: nextPurchases,
      };
      saveLocalData(nextData);
      if (prev.settings.autoSync && prev.settings.syncKey) {
        pushToCloud(nextData);
      }
      return nextData;
    });
  };

  const handleDeletePurchase = (id: string) => {
    setData((prev) => {
      const nextPurchases = prev.purchases.filter((p) => p.id !== id);
      const nextData: AppData = {
        ...prev,
        purchases: nextPurchases,
      };
      saveLocalData(nextData);
      if (prev.settings.autoSync && prev.settings.syncKey) {
        pushToCloud(nextData);
      }
      return nextData;
    });
  };

  // Settings update
  const handleUpdateSettings = (newSettings: UserSettings) => {
    setData((prev) => {
      const nextData: AppData = {
        ...prev,
        settings: newSettings,
      };
      saveLocalData(nextData);
      if (newSettings.syncKey) {
        pushToCloud(nextData);
      }
      return nextData;
    });
  };

  // Import
  const handleImportData = (imported: AppData) => {
    setData(imported);
    saveLocalData(imported);
    if (imported.settings.syncKey) {
      pushToCloud(imported);
    }
  };

  // Reset sample data
  const handleResetSampleData = () => {
    const sample = generateSampleData();
    // Keep user's syncKey if exists
    if (data.settings.syncKey) {
      sample.settings.syncKey = data.settings.syncKey;
    }
    setData(sample);
    saveLocalData(sample);
    if (sample.settings.syncKey) {
      pushToCloud(sample);
    }
  };

  // Clear all data
  const handleClearAllData = () => {
    const empty: AppData = {
      records: [],
      purchases: [],
      settings: {
        ...DEFAULT_SETTINGS,
        syncKey: data.settings.syncKey,
      },
    };
    setData(empty);
    saveLocalData(empty);
    if (empty.settings.syncKey) {
      pushToCloud(empty);
    }
  };

  // Manual sync trigger
  const handleManualSync = async () => {
    if (!data.settings.syncKey) {
      alert('請先在設定中輸入或產生同步碼！');
      return;
    }
    setSyncStatus('syncing');
    try {
      const remote = await fetchCloudData(data.settings.syncKey);
      if (remote) {
        // Simple merge: union records by id/date, favoring newer updatedAt
        const recordMap = new Map<string, HealthRecord>();
        data.records.forEach((r) => recordMap.set(r.date, r));
        remote.records.forEach((r) => {
          const existing = recordMap.get(r.date);
          if (!existing || (r.updatedAt || 0) >= (existing.updatedAt || 0)) {
            recordMap.set(r.date, r);
          }
        });

        const mergedRecords = Array.from(recordMap.values()).sort((a, b) =>
          b.date.localeCompare(a.date)
        );

        const purchaseMap = new Map<string, MounjaroPurchase>();
        data.purchases.forEach((p) => purchaseMap.set(p.id, p));
        remote.purchases.forEach((p) => purchaseMap.set(p.id, p));
        const mergedPurchases = Array.from(purchaseMap.values()).sort((a, b) =>
          b.date.localeCompare(a.date)
        );

        const mergedData: AppData = {
          records: mergedRecords,
          purchases: mergedPurchases,
          settings: {
            ...data.settings,
            ...remote.settings,
            syncKey: data.settings.syncKey,
            lastSyncTime: Date.now(),
          },
        };

        setData(mergedData);
        saveLocalData(mergedData);
        await saveCloudData(data.settings.syncKey, mergedData);
        setSyncStatus('synced');
        alert(`雲端同步成功！目前共 ${mergedRecords.length} 筆身體數據。`);
      } else {
        // Upload local to remote
        await saveCloudData(data.settings.syncKey, data);
        setSyncStatus('synced');
        setData((prev) => {
          const next = {
            ...prev,
            settings: { ...prev.settings, lastSyncTime: Date.now() },
          };
          saveLocalData(next);
          return next;
        });
        alert('已成功將本機資料上傳備份至雲端！');
      }
    } catch (err) {
      setSyncStatus('idle');
      alert('同步失敗，請檢查網路連線。');
    }
  };

  const openAddModal = (dateStr?: string, existing?: HealthRecord) => {
    setAddModalInitialDate(dateStr);
    setAddModalExistingRecord(existing || null);
    setIsAddModalOpen(true);
  };

  const openRecordDetail = (record: HealthRecord) => {
    setSelectedRecordForDetail(record);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFF8FA] flex flex-col items-center justify-start text-[#592736]">
      {/* Container wrapper: on desktop with isMobileFrame, render inside phone shell */}
      <div
        className={`w-full transition-all duration-300 min-h-screen flex flex-col bg-[#FFFAFC] ${
          isMobileFrame
            ? 'max-w-md my-0 md:my-6 md:min-h-[844px] md:rounded-[44px] md:shadow-2xl md:border-[8px] md:border-[#592736]/70 relative overflow-hidden ring-4 ring-[#FFE0E9]'
            : 'max-w-4xl'
        }`}
      >
        {/* Dynamic Island / Speaker Notch for iPhone styling on desktop frame */}
        {isMobileFrame && (
          <div className="hidden md:flex justify-center pt-2 pb-1 bg-white border-b border-[#FFE0E9] relative z-40">
            <div className="w-24 h-4 bg-slate-900 rounded-full flex items-center justify-end px-2">
              <span className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700"></span>
            </div>
          </div>
        )}

        {/* Global Header */}
        <Header
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
          syncStatus={syncStatus}
          onSyncClick={() => {
            if (activeTab !== 'sync') {
              setActiveTab('sync');
            } else {
              handleManualSync();
            }
          }}
          onOpenAddModal={() => openAddModal()}
          daysUntilNextInjection={summaryStats.daysUntilNextInjection}
        />

        {/* Main Tab Content */}
        <main className="flex-1 p-3.5 sm:p-5 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewTab
              records={data.records}
              settings={data.settings}
              purchases={data.purchases}
              onOpenAddModal={openAddModal}
              onOpenRecordDetail={openRecordDetail}
            />
          )}

          {activeTab === 'charts' && (
            <ChartsTab
              records={data.records}
              settings={data.settings}
              onOpenRecordDetail={openRecordDetail}
              onOpenAddModal={openAddModal}
              onDeleteRecord={handleDeleteRecord}
            />
          )}

          {activeTab === 'mounjaro' && (
            <MounjaroTab
              records={data.records}
              purchases={data.purchases}
              onAddPurchase={handleAddPurchase}
              onDeletePurchase={handleDeletePurchase}
              onOpenRecordDetail={openRecordDetail}
            />
          )}

          {activeTab === 'sync' && (
            <SyncBackupTab
              data={data}
              onUpdateSettings={handleUpdateSettings}
              onImportData={handleImportData}
              onResetSampleData={handleResetSampleData}
              onClearAllData={handleClearAllData}
              onManualSync={handleManualSync}
              isSyncing={syncStatus === 'syncing'}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => openAddModal()}
        />

        {/* Add / Edit Record Modal */}
        <AddRecordModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSaveRecord={handleSaveRecord}
          initialDate={addModalInitialDate}
          existingRecord={addModalExistingRecord}
          lastInjectionSite={summaryStats.lastInjectionSite}
        />

        {/* Record Detail Modal */}
        <RecordDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          record={selectedRecordForDetail}
          onEdit={(rec) => openAddModal(rec.date, rec)}
          onDelete={handleDeleteRecord}
        />
      </div>
    </div>
  );
}
