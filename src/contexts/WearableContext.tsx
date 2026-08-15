import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { calculateWellnessScore } from '@/lib/wellness';
import { WearableMetrics } from '@/types/wearable';

interface WearableContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connectWearable: () => Promise<void>;
  disconnectWearable: () => void;
  setConnecting: (connecting: boolean) => void;
  metrics: WearableMetrics | null;
  loadingMetrics: boolean;
  syncData: (data: { heartRate: number; sleepHours: number; steps: number }) => Promise<void>;
  error: string | null;
}

const WearableContext = createContext<WearableContextType | undefined>(undefined);

export const WearableProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [metrics, setMetrics] = useState<WearableMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestMetrics = useCallback(async () => {
    setLoadingMetrics(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingMetrics(false);
        return;
      }

      const { data, error } = await supabase
        .from('wellness_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false })
        .limit(7);

      if (error) throw error;

      if (data && data.length > 0) {
        const latest = data[0];
        setMetrics({
          score: latest.score,
          heartRate: latest.heart_rate,
          sleepHours: latest.sleep_hours,
          steps: latest.steps,
          history: data.map(m => ({
            date: new Date(m.recorded_at).toLocaleDateString('en-US', { weekday: 'short' }),
            score: m.score
          })).reverse(),
          insights: [
            latest.score > 70 ? "✨ Condition stable for operational duties." : "⚠️ Fatigue markers detected. Review rest cycle.",
            "Historical biometric data synchronized from encrypted database."
          ]
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch metrics.");
    } finally {
      setLoadingMetrics(false);
    }
  }, []);

  const syncData = useCallback(async (data: { heartRate: number; sleepHours: number; steps: number }, isRetry = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const score = calculateWellnessScore(data.heartRate, data.sleepHours);

      // Handle offline mode check
      if (!navigator.onLine && !isRetry) {
        console.log("Device offline. Queuing wearable metrics sync.");
        const currentQueue = JSON.parse(localStorage.getItem("aeromind_offline_sync_queue") || "[]");
        currentQueue.push(data);
        localStorage.setItem("aeromind_offline_sync_queue", JSON.stringify(currentQueue));

        setMetrics((prev: WearableMetrics | null) => ({
          score,
          heartRate: data.heartRate,
          sleepHours: data.sleepHours,
          steps: data.steps,
          history: prev?.history || [],
          insights: prev?.insights || [],
        }));
        return;
      }

      const { error } = await supabase.from('wellness_metrics').insert({
        user_id: user.id,
        heart_rate: data.heartRate,
        sleep_hours: data.sleepHours,
        steps: data.steps,
        score: score,
      });

      if (error) throw error;

      if (!isRetry) {
        fetchLatestMetrics();
      }
    } catch (e: unknown) {
      console.error("Sync failed:", e instanceof Error ? e.message : "Unknown error");
    }
  }, [fetchLatestMetrics]);

  const drainOfflineQueue = useCallback(async () => {
    try {
      const queuedData = localStorage.getItem("aeromind_offline_sync_queue");
      if (queuedData) {
        const items = JSON.parse(queuedData);
        if (Array.isArray(items) && items.length > 0) {
          console.log(`Draining ${items.length} queued metrics...`);
          const remainingItems = [];
          for (const data of items) {
            try {
              await syncData(data, true);
            } catch (err) {
              console.error("Individual offline sync item failed. Retaining in queue:", err);
              remainingItems.push(data);
            }
          }
          if (remainingItems.length > 0) {
            localStorage.setItem("aeromind_offline_sync_queue", JSON.stringify(remainingItems));
          } else {
            localStorage.removeItem("aeromind_offline_sync_queue");
          }
          fetchLatestMetrics();
        }
      }
    } catch (e) {
      console.error("Failed to drain offline metrics sync queue:", e);
    }
  }, [syncData, fetchLatestMetrics]);

  useEffect(() => {
    const savedStatus = localStorage.getItem("aeromind_wearable_connected");
    setIsConnected(savedStatus === "true");
    fetchLatestMetrics();

    const handleOnline = () => {
      console.log("Device is back online. Attempting to drain offline sync queue...");
      drainOfflineQueue();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [drainOfflineQueue, fetchLatestMetrics]);

  const connectWearable = async () => {
    setIsConnecting(true);
    try {
      if (typeof navigator !== 'undefined' && 'bluetooth' in navigator) {
        try {
          const navBluetooth = (navigator as unknown as { bluetooth?: { requestDevice: (opts: unknown) => Promise<unknown> } }).bluetooth;
          if (navBluetooth) {
            await navBluetooth.requestDevice({
              filters: [{ services: ['heart_rate'] }]
            });
          }
        } catch (bleErr) {
          console.log("Bluetooth prompt dismissed or unsupported:", bleErr);
        }
      }
      setIsConnected(true);
      localStorage.setItem("aeromind_wearable_connected", "true");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWearable = () => {
    setIsConnected(false);
    localStorage.setItem("aeromind_wearable_connected", "false");
  };

  const value = {
    isConnected,
    isConnecting,
    connectWearable,
    disconnectWearable,
    setConnecting: setIsConnecting,
    metrics,
    loadingMetrics,
    syncData,
    error
  };

  return <WearableContext.Provider value={value}>{children}</WearableContext.Provider>;
};

export const useWearable = () => {
  const context = useContext(WearableContext);
  if (context === undefined) throw new Error('useWearable must be used within a WearableProvider');
  return context;
};
