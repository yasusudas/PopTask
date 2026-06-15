import { describe, expect, it } from "vitest";
import { colorHex, resolveBalloonColor, UNFILED_COLOR, WARNING_COLOR } from "./colors";

describe("resolveBalloonColor", () => {
  it("個別色が指定されていれば、期限超過でもその色を優先する", () => {
    expect(resolveBalloonColor("green", null, true)).toBe(colorHex("green"));
    expect(resolveBalloonColor("green", "blue", true)).toBe(colorHex("green"));
    expect(resolveBalloonColor("pink", null, false)).toBe(colorHex("pink"));
  });

  it("個別色が未指定で期限超過なら警告色(赤)になる", () => {
    expect(resolveBalloonColor(null, "blue", true)).toBe(WARNING_COLOR);
    expect(resolveBalloonColor(null, null, true)).toBe(WARNING_COLOR);
  });

  it("個別色が未指定で期限内ならフォルダ色を使う", () => {
    expect(resolveBalloonColor(null, "blue", false)).toBe(colorHex("blue"));
  });

  it("個別色もフォルダ色もなく期限内なら未分類色を使う", () => {
    expect(resolveBalloonColor(null, null, false)).toBe(UNFILED_COLOR);
  });
});
