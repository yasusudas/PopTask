import Dexie, { type EntityTable } from "dexie";
import type { Task, Folder, NotificationReceipt, Settings } from "../types";

export class PopTaskDB extends Dexie {
  tasks!: EntityTable<Task, "id">;
  folders!: EntityTable<Folder, "id">;
  notificationReceipts!: EntityTable<NotificationReceipt, "id">;
  settings!: EntityTable<Settings, "id">;

  constructor() {
    super("poptask");
    this.version(1).stores({
      tasks: "id, status, folderId, dueAt, deletedAt, updatedAt",
      folders: "id, name, createdAt",
      notificationReceipts: "id, taskId",
      settings: "id",
    });
    this.version(2).stores({
      tasks: "id, status, folderId, dueAt, deletedAt, updatedAt",
      folders: "id, name, createdAt",
      notificationReceipts: "id, taskId",
      settings: "id",
    }).upgrade(async (tx) => {
      await tx.table("tasks").toCollection().modify((task) => {
        if (task.colorId === undefined) task.colorId = null;
      });
    });
  }
}

export const db = new PopTaskDB();
