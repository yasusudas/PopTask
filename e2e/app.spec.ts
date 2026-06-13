import { expect, test, type Page } from "@playwright/test";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function localInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function createTask(page: Page, title: string, dueInHours: number): Promise<void> {
  await page.getByRole("button", { name: "新規タスク" }).click();
  await page.fill("#task-title", title);
  await page.fill("#task-due", localInput(new Date(Date.now() + dueInHours * 3600 * 1000)));
  await page.getByRole("button", { name: "作成", exact: true }).click();
  await expect(page.locator(".balloon", { hasText: title })).toBeVisible();
}

test("タスクを作成し、完了して完了一覧へ移動できる", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("PopTask")).toBeVisible();

  await createTask(page, "E2Eテストのタスク", 26);

  // タップ (8px未満の操作) で詳細を開き、完了する
  await page.locator(".balloon", { hasText: "E2Eテストのタスク" }).click({ force: true });
  await expect(page.getByRole("dialog", { name: "タスクの詳細" })).toBeVisible();
  await page.getByRole("button", { name: "完了して風船を割る" }).click();

  // Undoトーストが表示され、完了一覧に履歴カードが現れる
  await expect(page.getByText("タスクを完了しました")).toBeVisible();
  await page.locator(".sidebar-item").filter({ hasText: /^完了$/ }).click();
  await expect(page.locator(".history-card", { hasText: "E2Eテストのタスク" })).toBeVisible();
});

test("検索で現在のタブ内を部分一致で絞り込める", async ({ page }) => {
  await page.goto("/");
  await createTask(page, "歯医者の予約", 48);
  await createTask(page, "レポートを提出する", 72);

  await page.getByLabel("タスク名・メモを検索").fill("歯医者");
  await expect(page.locator(".balloon", { hasText: "歯医者の予約" })).toBeVisible();
  await expect(page.locator(".balloon", { hasText: "レポートを提出する" })).toHaveCount(0);
});

test("デスクトップで検索後にモバイル幅へ縮小しても、隠れたクエリでタスクが消えない", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto("/");
  await createTask(page, "歯医者の予約", 48);
  await createTask(page, "レポートを提出する", 72);

  // デスクトップのトップバー検索で絞り込む
  await page.getByLabel("タスク名・メモを検索").fill("歯医者");
  await expect(page.locator(".balloon", { hasText: "レポートを提出する" })).toHaveCount(0);

  // モバイル幅へ縮小: 検索欄が消えても全タスクが見えること
  await page.setViewportSize({ width: 375, height: 800 });
  await expect(page.locator(".balloon", { hasText: "歯医者の予約" })).toBeVisible();
  await expect(page.locator(".balloon", { hasText: "レポートを提出する" })).toBeVisible();
});

test("初回読み込み後、オフラインでアプリを再起動できる", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByText("PopTask")).toBeVisible();

  // Service Workerの有効化を待つ (インストール時にプリキャッシュ完了済み。
  // 初回ロードのページはSWの管理下に入らないが、以降のナビゲーションはSWが処理する)
  await page.evaluate(() => navigator.serviceWorker.ready);

  await createTask(page, "オフライン確認タスク", 26);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByText("PopTask")).toBeVisible();
  // ローカルデータ (IndexedDB) もオフラインで読める
  await expect(page.locator(".balloon", { hasText: "オフライン確認タスク" })).toBeVisible();
  await context.setOffline(false);
});
