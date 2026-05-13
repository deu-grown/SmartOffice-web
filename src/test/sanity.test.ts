// Vitest 셋업이 정상 동작하는지 확인하는 최소 테스트.
import { describe, expect, it } from "vitest";

describe("sanity", () => {
  it("vitest 셋업이 동작한다", () => {
    expect(1 + 1).toBe(2);
  });
});
