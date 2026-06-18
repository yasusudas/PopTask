import { describe, expect, it } from "vitest";
import { mergeByUpdatedAt } from "./merge";

describe("mergeByUpdatedAt", () => {
  it("updatedAt が新しい方を採用する", () => {
    const local = [{ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 }];
    const remote = [{ id: "a", updatedAt: "2026-01-02T00:00:00.000Z", value: 2 }];
    const merged = mergeByUpdatedAt(local, remote);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ id: "a", value: 2 });
  });

  it("片方にしかない ID も残す", () => {
    const local = [{ id: "a", updatedAt: "2026-01-01T00:00:00.000Z" }];
    const remote = [{ id: "b", updatedAt: "2026-01-01T00:00:00.000Z" }];
    const merged = mergeByUpdatedAt(local, remote);
    expect(merged.map((x) => x.id).sort()).toEqual(["a", "b"]);
  });
});
