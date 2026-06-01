import { describe, expect, test } from "vitest";

import { formatEchoResponse, isQuitCommand } from "../src/echo.js";

describe("formatEchoResponse", () => {
  test("formats a basic echo response", () => {
    expect(formatEchoResponse("hello")).toBe("Echo: hello");
  });

  test("preserves the original message text", () => {
    expect(formatEchoResponse("CS 453")).toBe("Echo: CS 453");
  });
});

describe("isQuitCommand", () => {
  test("returns true for QUIT", () => {
    expect(isQuitCommand("QUIT")).toBe(true);
  });

  test("ignores case and extra spaces", () => {
    expect(isQuitCommand("  quit  ")).toBe(true);
  });

  test("returns false for normal messages", () => {
    expect(isQuitCommand("hello")).toBe(false);
  });
});
