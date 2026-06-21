export type MassUnit = "mg" | "mcg";

export type CalculatorError =
  | "invalid-vial-amount"
  | "invalid-diluent"
  | "invalid-target-dose"
  | "invalid-syringe-capacity"
  | "invalid-syringe-step";

export type CalculatorWarning =
  | "dose-exceeds-vial"
  | "syringe-capacity-exceeded"
  | "not-on-marking";

export interface CalculatorInput {
  vialAmount: number;
  vialUnit: MassUnit;
  diluentMl: number;
  targetDose: number;
  targetDoseUnit: MassUnit;
  syringeCapacityMl: number;
  syringeUnitStep: number;
}

export interface CalculatorResult {
  isValid: boolean;
  errors: CalculatorError[];
  warnings: CalculatorWarning[];
  vialAmountMcg: number;
  targetDoseMcg: number;
  concentrationMgPerMl: number;
  concentrationMcgPerMl: number;
  drawVolumeMl: number;
  drawVolumeMicroliters: number;
  syringeUnitsExact: number;
  nearestSyringeUnits: number;
  tickCountExact: number;
  nearestTickCount: number;
  dosesPerVial: number;
  syringeFillPercent: number;
}

const U100_UNITS_PER_ML = 100;
const MCG_PER_MG = 1_000;
const MICROLITERS_PER_ML = 1_000;
const MARKING_TOLERANCE = 1e-9;

export function convertMassToMcg(value: number, unit: MassUnit): number {
  return unit === "mg" ? value * MCG_PER_MG : value;
}

export function convertMcgToMass(valueMcg: number, unit: MassUnit): number {
  return unit === "mg" ? valueMcg / MCG_PER_MG : valueMcg;
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

function emptyResult(errors: CalculatorError[]): CalculatorResult {
  return {
    isValid: false,
    errors,
    warnings: [],
    vialAmountMcg: 0,
    targetDoseMcg: 0,
    concentrationMgPerMl: 0,
    concentrationMcgPerMl: 0,
    drawVolumeMl: 0,
    drawVolumeMicroliters: 0,
    syringeUnitsExact: 0,
    nearestSyringeUnits: 0,
    tickCountExact: 0,
    nearestTickCount: 0,
    dosesPerVial: 0,
    syringeFillPercent: 0
  };
}

export function calculatePeptide(input: CalculatorInput): CalculatorResult {
  const errors: CalculatorError[] = [];

  if (!isPositiveFinite(input.vialAmount)) errors.push("invalid-vial-amount");
  if (!isPositiveFinite(input.diluentMl)) errors.push("invalid-diluent");
  if (!isPositiveFinite(input.targetDose)) errors.push("invalid-target-dose");
  if (!isPositiveFinite(input.syringeCapacityMl)) errors.push("invalid-syringe-capacity");
  if (!isPositiveFinite(input.syringeUnitStep)) errors.push("invalid-syringe-step");

  if (errors.length > 0) return emptyResult(errors);

  const vialAmountMcg = convertMassToMcg(input.vialAmount, input.vialUnit);
  const targetDoseMcg = convertMassToMcg(input.targetDose, input.targetDoseUnit);
  const concentrationMcgPerMl = vialAmountMcg / input.diluentMl;
  const drawVolumeMl = targetDoseMcg / concentrationMcgPerMl;
  const syringeUnitsExact = drawVolumeMl * U100_UNITS_PER_ML;
  const tickCountExact = syringeUnitsExact / input.syringeUnitStep;
  const nearestTickCount = Math.round(tickCountExact);
  const nearestSyringeUnits = nearestTickCount * input.syringeUnitStep;
  const warnings: CalculatorWarning[] = [];

  if (targetDoseMcg > vialAmountMcg) warnings.push("dose-exceeds-vial");
  if (drawVolumeMl > input.syringeCapacityMl) warnings.push("syringe-capacity-exceeded");
  if (Math.abs(tickCountExact - nearestTickCount) > MARKING_TOLERANCE) {
    warnings.push("not-on-marking");
  }

  return {
    isValid: true,
    errors,
    warnings,
    vialAmountMcg,
    targetDoseMcg,
    concentrationMgPerMl: concentrationMcgPerMl / MCG_PER_MG,
    concentrationMcgPerMl,
    drawVolumeMl,
    drawVolumeMicroliters: drawVolumeMl * MICROLITERS_PER_ML,
    syringeUnitsExact,
    nearestSyringeUnits,
    tickCountExact,
    nearestTickCount,
    dosesPerVial: vialAmountMcg / targetDoseMcg,
    syringeFillPercent: (drawVolumeMl / input.syringeCapacityMl) * 100
  };
}
