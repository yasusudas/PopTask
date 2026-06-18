import type { Folder, Settings, Task } from "../types";
import {
  deleteFolderFromCloud,
  deleteTaskFromCloud,
  pushAllLocalData,
  pushFolder,
  pushSettings,
  pushTask,
  replaceCloudWithLocal,
} from "./syncEngine";

let enabled = false;

export function setSyncEnabled(next: boolean): void {
  enabled = next;
}

export const syncBridge = {
  async onTaskCreated(task: Task): Promise<void> {
    if (!enabled) return;
    await pushTask(task);
  },
  async onTaskUpdated(task: Task): Promise<void> {
    if (!enabled) return;
    await pushTask(task);
  },
  async onTaskDeleted(id: string): Promise<void> {
    if (!enabled) return;
    await deleteTaskFromCloud(id);
  },
  async onFolderCreated(folder: Folder): Promise<void> {
    if (!enabled) return;
    await pushFolder(folder);
  },
  async onFolderUpdated(folder: Folder): Promise<void> {
    if (!enabled) return;
    await pushFolder(folder);
  },
  async onFolderDeleted(id: string): Promise<void> {
    if (!enabled) return;
    await deleteFolderFromCloud(id);
  },
  async onSettingsUpdated(settings: Settings): Promise<void> {
    if (!enabled) return;
    await pushSettings(settings);
  },
  async onImportComplete(): Promise<void> {
    if (!enabled) return;
    await replaceCloudWithLocal();
  },
  async onDeleteAllLocal(): Promise<void> {
    if (!enabled) return;
    await replaceCloudWithLocal();
  },
  async onBulkLocalChange(): Promise<void> {
    if (!enabled) return;
    await pushAllLocalData();
  },
};
