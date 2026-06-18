import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { deleteAllData } from "../lib/backup";
import { useAuth } from "../auth/AuthContext";
import { setSyncEnabled } from "./syncBridge";
import {
  applyMigration,
  clearMigratedOnDevice,
  fetchCloudSnapshot,
  markMigratedOnDevice,
  resolveInitialSync,
  startRealtimeSync,
  stopRealtimeSync,
  type MigrationChoice,
} from "./syncEngine";
import { DataMigrationDialog } from "../components/DataMigrationDialog";

interface SyncContextValue {
  ready: boolean;
  syncing: boolean;
}

const SyncContext = createContext<SyncContextValue>({ ready: true, syncing: false });

export function SyncProvider({ children }: { children: ReactNode }) {
  const { enabled, user, loading: authLoading } = useAuth();
  const [ready, setReady] = useState(!enabled);
  const [syncing, setSyncing] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<MigrationChoice | null>(null);
  const [cloudSnapshot, setCloudSnapshot] = useState<Awaited<ReturnType<typeof fetchCloudSnapshot>> | null>(
    null,
  );

  const finishSync = useCallback((uid: string) => {
    startRealtimeSync(uid);
    setSyncEnabled(true);
    setReady(true);
    setSyncing(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setSyncEnabled(false);
      setReady(true);
      return;
    }

    if (authLoading) return;

    if (!user) {
      stopRealtimeSync();
      setSyncEnabled(false);
      setReady(false);
      setSyncing(false);
      setPendingChoice(null);
      setCloudSnapshot(null);
      return;
    }

    let cancelled = false;
    setSyncing(true);
    setReady(false);

    void (async () => {
      try {
        const choice = await resolveInitialSync(user.uid);
        if (cancelled) return;

        if (choice) {
          const cloud = await fetchCloudSnapshot(user.uid);
          if (cancelled) return;
          setCloudSnapshot(cloud);
          setPendingChoice(choice);
          return;
        }

        finishSync(user.uid);
      } catch {
        if (!cancelled) {
          setSyncing(false);
          setReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, user, authLoading, finishSync]);

  const handleMigrationChoice = useCallback(
    async (choice: MigrationChoice) => {
      if (!user || !cloudSnapshot) return;
      setSyncing(true);
      try {
        await applyMigration(user.uid, choice, cloudSnapshot);
        markMigratedOnDevice(user.uid);
        setPendingChoice(null);
        setCloudSnapshot(null);
        finishSync(user.uid);
      } catch {
        setSyncing(false);
      }
    },
    [user, cloudSnapshot, finishSync],
  );

  const handleLogoutCleanup = useCallback(async () => {
    const uid = user?.uid;
    stopRealtimeSync();
    setSyncEnabled(false);
    await deleteAllData();
    if (uid) clearMigratedOnDevice(uid);
  }, [user]);

  const value = useMemo(() => ({ ready, syncing }), [ready, syncing]);

  return (
    <SyncContext.Provider value={value}>
      {children}
      {pendingChoice && cloudSnapshot && (
        <DataMigrationDialog
          onChoose={(choice) => void handleMigrationChoice(choice)}
          onCancel={() => void handleMigrationChoice("cloud")}
        />
      )}
      <LogoutCleanupBridge onLogout={handleLogoutCleanup} />
    </SyncContext.Provider>
  );
}

function LogoutCleanupBridge({ onLogout }: { onLogout: () => Promise<void> }) {
  const { user } = useAuth();
  const [prevUid, setPrevUid] = useState<string | null>(user?.uid ?? null);

  useEffect(() => {
    const uid = user?.uid ?? null;
    if (prevUid && !uid) {
      void onLogout();
    }
    setPrevUid(uid);
  }, [user, prevUid, onLogout]);

  return null;
}

export function useSync(): SyncContextValue {
  return useContext(SyncContext);
}
