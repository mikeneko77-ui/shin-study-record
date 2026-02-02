import { it, describe, expect } from "vitest";
import { add } from "../utils/calculate";

describe("calculate utilities", () => {
  describe("add", () => {
    it("2つの数値を足し算できる", () => {
      expect(add(1, 2)).toBe(3);
    });
  });
});
