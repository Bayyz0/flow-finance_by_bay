import { describe, expect, it } from "vitest";
import {
  calculateRealValue,
  calculateNominalValue,
  calculateVAT,
  calculateIncomeTax,
  calculateTotalCostWithTax,
  analyzeSpendingPower,
} from "./calculations";

describe("Financial Calculations", () => {
  describe("calculateRealValue", () => {
    it("should calculate real value with inflation adjustment", () => {
      // $100 spent 1 year ago with 3% inflation = ~$97.09 in today's money
      const result = calculateRealValue(100, 3, 1);
      expect(parseFloat(result)).toBeCloseTo(97.09, 1);
    });

    it("should handle zero years ago", () => {
      // No inflation adjustment for current year
      const result = calculateRealValue(100, 5, 0);
      expect(parseFloat(result)).toBe(100);
    });

    it("should handle multiple years", () => {
      // $100 spent 2 years ago with 2% inflation
      const result = calculateRealValue(100, 2, 2);
      expect(parseFloat(result)).toBeCloseTo(96.12, 1);
    });
  });

  describe("calculateNominalValue", () => {
    it("should calculate nominal value from real value", () => {
      // $97.09 real value 1 year ago with 3% inflation = ~$100
      const result = calculateNominalValue(97.09, 3, 1);
      expect(parseFloat(result)).toBeCloseTo(100, 0);
    });

    it("should handle zero years", () => {
      const result = calculateNominalValue(100, 5, 0);
      expect(parseFloat(result)).toBe(100);
    });
  });

  describe("calculateVAT", () => {
    it("should calculate VAT correctly", () => {
      // $100 with 7% VAT
      const result = calculateVAT(100, 7);
      expect(parseFloat(result.tax)).toBe(7);
      expect(parseFloat(result.gross)).toBe(107);
      expect(parseFloat(result.net)).toBe(100);
    });

    it("should handle different VAT rates", () => {
      // $100 with 10% VAT
      const result = calculateVAT(100, 10);
      expect(parseFloat(result.tax)).toBe(10);
      expect(parseFloat(result.gross)).toBe(110);
    });

    it("should handle decimal amounts", () => {
      // $99.99 with 7% VAT
      const result = calculateVAT(99.99, 7);
      expect(parseFloat(result.tax)).toBeCloseTo(6.99, 1);
      expect(parseFloat(result.gross)).toBeCloseTo(106.99, 1);
    });
  });

  describe("calculateIncomeTax", () => {
    it("should calculate income tax correctly", () => {
      // $1000 income with 20% tax
      const result = calculateIncomeTax(1000, 20);
      expect(parseFloat(result.tax)).toBe(200);
      expect(parseFloat(result.netIncome)).toBe(800);
      expect(parseFloat(result.grossIncome)).toBe(1000);
    });

    it("should handle different tax rates", () => {
      // $1000 income with 15% tax
      const result = calculateIncomeTax(1000, 15);
      expect(parseFloat(result.tax)).toBe(150);
      expect(parseFloat(result.netIncome)).toBe(850);
    });

    it("should handle zero tax rate", () => {
      const result = calculateIncomeTax(1000, 0);
      expect(parseFloat(result.tax)).toBe(0);
      expect(parseFloat(result.netIncome)).toBe(1000);
    });
  });

  describe("calculateTotalCostWithTax", () => {
    it("should calculate total cost with VAT", () => {
      // $100 base with 7% VAT = $107
      const result = calculateTotalCostWithTax(100, 7);
      expect(parseFloat(result)).toBe(107);
    });

    it("should handle different VAT rates", () => {
      // $100 base with 10% VAT = $110
      const result = calculateTotalCostWithTax(100, 10);
      expect(parseFloat(result)).toBe(110);
    });
  });

  describe("analyzeSpendingPower", () => {
    it("should analyze spending power changes", () => {
      // $100 spent 1 year ago with 3% inflation
      const result = analyzeSpendingPower(100, 3, 1);
      expect(parseFloat(result.nominalAmount)).toBe(100);
      expect(parseFloat(result.realAmount)).toBeCloseTo(97.09, 1);
      expect(parseFloat(result.purchasingPowerChange)).toBeCloseTo(2.91, 1);
      expect(parseFloat(result.percentageChange)).toBeCloseTo(2.91, 1);
    });

    it("should show no change for zero years", () => {
      const result = analyzeSpendingPower(100, 5, 0);
      expect(parseFloat(result.nominalAmount)).toBe(100);
      expect(parseFloat(result.realAmount)).toBe(100);
      expect(parseFloat(result.purchasingPowerChange)).toBe(0);
      expect(parseFloat(result.percentageChange)).toBe(0);
    });

    it("should handle high inflation", () => {
      // $100 spent 1 year ago with 10% inflation
      const result = analyzeSpendingPower(100, 10, 1);
      expect(parseFloat(result.realAmount)).toBeCloseTo(90.91, 1);
      expect(parseFloat(result.purchasingPowerChange)).toBeCloseTo(9.09, 1);
    });
  });

  describe("Edge cases and validation", () => {
    it("should handle string inputs for amounts", () => {
      const result = calculateVAT("100", 7);
      expect(parseFloat(result.tax)).toBe(7);
    });

    it("should handle very small amounts", () => {
      const result = calculateVAT(0.01, 7);
      expect(parseFloat(result.gross)).toBeCloseTo(0.0107, 2);
    });

    it("should handle very large amounts", () => {
      const result = calculateVAT(1000000, 7);
      expect(parseFloat(result.tax)).toBe(70000);
      expect(parseFloat(result.gross)).toBe(1070000);
    });

    it("should handle zero amounts", () => {
      const result = calculateVAT(0, 7);
      expect(parseFloat(result.tax)).toBe(0);
      expect(parseFloat(result.gross)).toBe(0);
    });
  });
});
