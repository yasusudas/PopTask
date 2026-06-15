import { describe, expect, it } from "vitest";
import { BalloonEngine } from "./engine";

/** 浮遊の揺らぎを除外して決定的に検証するためのエンジンを作る */
function makeEngine(): BalloonEngine {
  const e = new BalloonEngine();
  e.reducedMotion = true;
  e.setBounds(800, 600);
  return e;
}

describe("BalloonEngine ドラッグ解放", () => {
  it("速いフリックで離しても横方向へ高速に飛ばない", () => {
    const e = makeEngine();
    const b = e.upsert("a", 40, 400, 300);
    e.startDrag("a");
    e.dragTo("a", 600, 300);
    e.endDrag("a");
    expect(Math.abs(b.vx)).toBeLessThanOrEqual(10);
  });

  it("解放後に画面を横切るような長距離の水平移動をしない", () => {
    const e = makeEngine();
    const b = e.upsert("a", 40, 400, 300);
    e.startDrag("a");
    e.dragTo("a", 600, 300);
    const startX = b.x;
    e.endDrag("a");
    let maxExcursion = 0;
    for (let i = 0; i < 90; i++) {
      e.step(1 / 60);
      maxExcursion = Math.max(maxExcursion, Math.abs(b.x - startX));
    }
    expect(maxExcursion).toBeLessThan(80);
  });

  it("どの方向にドラッグして離しても概ね鉛直上方向へ浮上する", () => {
    const e = makeEngine();
    const b = e.upsert("a", 30, 400, 200);
    e.startDrag("a");
    e.dragTo("a", 560, 430);
    const releaseX = b.x;
    const releaseY = b.y;
    e.endDrag("a");
    for (let i = 0; i < 150; i++) e.step(1 / 60);
    expect(releaseY - b.y).toBeGreaterThan(60);
    expect(Math.abs(b.x - releaseX)).toBeLessThan(35);
    expect(releaseY - b.y).toBeGreaterThan(Math.abs(b.x - releaseX) * 3);
  });
});

describe("BalloonEngine 衝突", () => {
  it("重なった状態の風船を解放しても高速で吹き飛ばない", () => {
    const e = makeEngine();
    const a = e.upsert("a", 25, 300, 300);
    const b = e.upsert("b", 25, 360, 300);
    b.x = 315;
    b.y = 300;
    let maxSpeed = 0;
    for (let i = 0; i < 120; i++) {
      e.step(1 / 60);
      maxSpeed = Math.max(maxSpeed, Math.hypot(a.vx, a.vy), Math.hypot(b.vx, b.vy));
    }
    expect(maxSpeed).toBeLessThanOrEqual(80);
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(53);
  });
});

describe("BalloonEngine 削除・upsert", () => {
  it("既存ボディの upsert は home を上書きしない", () => {
    const e = makeEngine();
    const a = e.upsert("a", 30, 200, 300);
    a.x = 210;
    a.y = 310;
    e.upsert("a", 35, 999, 999);
    expect(a.homeX).toBe(200);
    expect(a.homeY).toBe(300);
    expect(a.x).toBe(210);
  });

  it("隣接風船を削除しても残りの home 位置は変わらない", () => {
    const e = makeEngine();
    const a = e.upsert("a", 30, 200, 300);
    e.upsert("b", 30, 400, 300);
    const homeAX = a.homeX;
    const homeAY = a.homeY;
    e.remove("b");
    expect(a.homeX).toBe(homeAX);
    expect(a.homeY).toBe(homeAY);
  });

  it("風船削除後も残りが横方向へ高速移動しない", () => {
    const e = makeEngine();
    const a = e.upsert("a", 30, 200, 300);
    e.upsert("b", 30, 260, 300);
    const startX = a.x;
    e.remove("b");
    let maxHorizSpeed = 0;
    let maxExcursion = 0;
    for (let i = 0; i < 120; i++) {
      e.step(1 / 60);
      maxHorizSpeed = Math.max(maxHorizSpeed, Math.abs(a.vx));
      maxExcursion = Math.max(maxExcursion, Math.abs(a.x - startX));
    }
    expect(maxHorizSpeed).toBeLessThan(45);
    expect(maxExcursion).toBeLessThan(35);
  });
});
