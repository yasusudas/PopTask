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
    expect(Math.abs(b.vx)).toBeLessThanOrEqual(200);
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
    expect(maxExcursion).toBeLessThan(120);
  });

  it("どの方向にドラッグして離しても概ね鉛直上方向へ浮上する", () => {
    const e = makeEngine();
    const b = e.upsert("a", 30, 400, 200);
    e.startDrag("a");
    // 右下方向へドラッグ
    e.dragTo("a", 560, 430);
    const releaseX = b.x;
    const releaseY = b.y;
    e.endDrag("a");
    for (let i = 0; i < 150; i++) e.step(1 / 60);
    // 上方向へ移動している
    expect(releaseY - b.y).toBeGreaterThan(80);
    // ドラッグした横方向へ流れていかない (水平移動はごくわずか)
    expect(Math.abs(b.x - releaseX)).toBeLessThan(40);
    // 鉛直成分が水平成分を大きく上回る
    expect(releaseY - b.y).toBeGreaterThan(Math.abs(b.x - releaseX) * 3);
  });
});

describe("BalloonEngine 衝突", () => {
  it("重なった状態の風船を解放しても高速で吹き飛ばない", () => {
    const e = makeEngine();
    // 互いの定位置 (home) は離れているが、片方を相手の上に落とした状態を再現する
    const a = e.upsert("a", 25, 300, 300);
    const b = e.upsert("b", 25, 360, 300);
    b.x = 315;
    b.y = 300;
    let maxSpeed = 0;
    for (let i = 0; i < 120; i++) {
      e.step(1 / 60);
      maxSpeed = Math.max(maxSpeed, Math.hypot(a.vx, a.vy), Math.hypot(b.vx, b.vy));
    }
    expect(maxSpeed).toBeLessThanOrEqual(100);
    // 重なりは解消している
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(53);
  });
});
