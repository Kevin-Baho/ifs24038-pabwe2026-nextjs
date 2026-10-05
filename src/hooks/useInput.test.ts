import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useInput } from "./useInput";
import { ChangeEvent } from "react";

describe("useInput Hook", () => {
  it("should initialize with default empty string", () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe("");
  });

  it("should initialize with provided initial value", () => {
    const { result } = renderHook(() => useInput("initial"));
    expect(result.current[0]).toBe("initial");
  });

  it("should handle change event from HTML input", () => {
    const { result } = renderHook(() => useInput(""));
    act(() => {
      const event = {
        target: { value: "new text" },
      } as ChangeEvent<HTMLInputElement>;
      result.current[1](event);
    });
    expect(result.current[0]).toBe("new text");
  });

  it("should handle direct string update in handleValueChange", () => {
    const { result } = renderHook(() => useInput(""));
    act(() => {
      result.current[1]("direct string");
    });
    expect(result.current[0]).toBe("direct string");
  });

  it("should allow resetting or updating value via setValue", () => {
    const { result } = renderHook(() => useInput("first"));
    act(() => {
      result.current[2]("second");
    });
    expect(result.current[0]).toBe("second");
  });
});

