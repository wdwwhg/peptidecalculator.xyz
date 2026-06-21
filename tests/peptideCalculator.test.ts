import { describe, expect, it } from "vitest";
import {
  calculatePeptide,
  convertMassToMcg,
  convertMcgToMass,
  type CalculatorInput
} from "../src/lib/peptideCalculator";

const validInput: CalculatorInput = {
  vialAmount: 10,
  vialUnit: "mg",
  diluentMl: 2,
  targetDose: 250,
  targetDoseUnit: "mcg",
  syringeCapacityMl: 1,
  syringeUnitStep: 1
};

describe("mass conversion", () => {
  it("converts milligrams to micrograms", () => {
    expect(convertMassToMcg(10, "mg")).toBe(10_000);
  });

  it("converts micrograms back to the requested display unit", () => {
    expect(convertMcgToMass(2_500, "mg")).toBe(2.5);
    expect(convertMcgToMass(2_500, "mcg")).toBe(2_500);
  });
});

describe("calculatePeptide", () => {
  it("calculates the agreed 10 mg reference example", () => {
    const result = calculatePeptide(validInput);

    expect(result.isValid).toBe(true);
    expect(result.concentrationMgPerMl).toBe(5);
    expect(result.concentrationMcgPerMl).toBe(5_000);
    expect(result.drawVolumeMl).toBe(0.05);
    expect(result.drawVolumeMicroliters).toBe(50);
    expect(result.syringeUnitsExact).toBe(5);
    expect(result.dosesPerVial).toBe(40);
    expect(result.warnings).toEqual([]);
  });

  it("reports the nearest visible syringe marking without replacing the exact result", () => {
    const result = calculatePeptide({
      ...validInput,
      targetDose: 275,
      syringeUnitStep: 1
    });

    expect(result.syringeUnitsExact).toBe(5.5);
    expect(result.nearestSyringeUnits).toBe(6);
    expect(result.tickCountExact).toBe(5.5);
    expect(result.warnings).toContain("not-on-marking");
  });

  it("rejects non-positive and non-finite values", () => {
    const result = calculatePeptide({
      ...validInput,
      diluentMl: 0,
      targetDose: Number.NaN
    });

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("invalid-diluent");
    expect(result.errors).toContain("invalid-target-dose");
  });

  it("warns when the target dose exceeds the vial contents", () => {
    const result = calculatePeptide({
      ...validInput,
      targetDose: 11,
      targetDoseUnit: "mg"
    });

    expect(result.warnings).toContain("dose-exceeds-vial");
  });

  it("warns when the draw volume exceeds syringe capacity", () => {
    const result = calculatePeptide({
      ...validInput,
      targetDose: 7_500,
      syringeCapacityMl: 0.3
    });

    expect(result.drawVolumeMl).toBe(1.5);
    expect(result.warnings).toContain("syringe-capacity-exceeded");
  });

  it("uses U-100 markings as volume units at 100 units per mL", () => {
    const result = calculatePeptide({
      ...validInput,
      targetDose: 1,
      targetDoseUnit: "mg"
    });

    expect(result.drawVolumeMl).toBe(0.2);
    expect(result.syringeUnitsExact).toBe(20);
  });
});
