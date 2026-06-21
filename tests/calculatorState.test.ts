import { describe, expect, it } from "vitest";
import {
  DEFAULT_CALCULATOR_INPUT,
  parseCalculatorState,
  serializeCalculatorState
} from "../src/lib/calculatorState";

describe("calculator URL state", () => {
  it("serializes calculator values into concise search parameters", () => {
    const params = serializeCalculatorState({
      vialAmount: 10,
      vialUnit: "mg",
      diluentMl: 2,
      targetDose: 250,
      targetDoseUnit: "mcg",
      syringeCapacityMl: 1,
      syringeUnitStep: 1
    });

    expect(params.toString()).toBe("vial=10&vu=mg&water=2&dose=250&du=mcg&syringe=1&step=1");
  });

  it("parses a complete valid shared state", () => {
    const parsed = parseCalculatorState(
      new URLSearchParams("vial=5&vu=mg&water=1.5&dose=100&du=mcg&syringe=0.3&step=0.5")
    );

    expect(parsed).toEqual({
      vialAmount: 5,
      vialUnit: "mg",
      diluentMl: 1.5,
      targetDose: 100,
      targetDoseUnit: "mcg",
      syringeCapacityMl: 0.3,
      syringeUnitStep: 0.5
    });
  });

  it("falls back field-by-field when shared values are missing or invalid", () => {
    const parsed = parseCalculatorState(
      new URLSearchParams("vial=-5&vu=grams&water=3&dose=oops&syringe=0.5")
    );

    expect(parsed).toEqual({
      ...DEFAULT_CALCULATOR_INPUT,
      diluentMl: 3,
      syringeCapacityMl: 0.5
    });
  });
});
