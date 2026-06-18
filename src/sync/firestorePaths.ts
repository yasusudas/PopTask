export function userTasksPath(uid: string): string {
  return `users/${uid}/tasks`;
}

export function userTaskPath(uid: string, taskId: string): string {
  return `${userTasksPath(uid)}/${taskId}`;
}

export function userFoldersPath(uid: string): string {
  return `users/${uid}/folders`;
}

export function userFolderPath(uid: string, folderId: string): string {
  return `${userFoldersPath(uid)}/${folderId}`;
}

export function userSettingsPath(uid: string): string {
  return `users/${uid}/settings/app`;
}

export function migratedKey(uid: string): string {
  return `puffy:sync:migrated:${uid}`;
}
