import type { CalculatorInput, MassUnit } from "./peptideCalculator";

export const DEFAULT_CALCULATOR_INPUT: CalculatorInput = {
  vialAmount: 10,
  vialUnit: "mg",
  diluentMl: 2,
  targetDose: 250,
  targetDoseUnit: "mcg",
  syringeCapacityMl: 1,
  syringeUnitStep: 1
};

function parsePositiveNumber(value: string | null, fallback: number): number {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseMassUnit(value: string | null, fallback: MassUnit): MassUnit {
  return value === "mg" || value === "mcg" ? value : fallback;
}

export function serializeCalculatorState(input: CalculatorInput): URLSearchParams {
  return new URLSearchParams({
    vial: String(input.vialAmount),
    vu: input.vialUnit,
    water: String(input.diluentMl),
    dose: String(input.targetDose),
    du: input.targetDoseUnit,
    syringe: String(input.syringeCapacityMl),
    step: String(input.syringeUnitStep)
  });
}

export function parseCalculatorState(
  params: URLSearchParams,
  defaults: CalculatorInput = DEFAULT_CALCULATOR_INPUT
): CalculatorInput {
  return {
    vialAmount: parsePositiveNumber(params.get("vial"), defaults.vialAmount),
    vialUnit: parseMassUnit(params.get("vu"), defaults.vialUnit),
    diluentMl: parsePositiveNumber(params.get("water"), defaults.diluentMl),
    targetDose: parsePositiveNumber(params.get("dose"), defaults.targetDose),
    targetDoseUnit: parseMassUnit(params.get("du"), defaults.targetDoseUnit),
    syringeCapacityMl: parsePositiveNumber(
      params.get("syringe"),
      defaults.syringeCapacityMl
    ),
    syringeUnitStep: parsePositiveNumber(params.get("step"), defaults.syringeUnitStep)
  };
}
