import assert from "node:assert";
import { describe, it } from "node:test";

describe("math", () => {
  it("1 + 1 = 2", () => {
    assert(1 + 1 === 2, "Math must work.");
  });
});
