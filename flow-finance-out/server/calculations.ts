import { Decimal } from "decimal.js";

/**
 * Financial calculations utilities
 * Handles inflation adjustments, tax calculations, and real vs nominal value conversions
 */

/**
 * Calculates the real value of money adjusted for inflation
 * Formula: Real Value = Nominal Value / (1 + inflation_rate/100)^years
 */
export function calculateRealValue(
  nominalAmount: number | string,
  inflationRate: number, // percentage (e.g., 3.5 for 3.5%)
  yearsAgo: number
): string {
  const nominal = new Decimal(nominalAmount);
  const rate = new Decimal(inflationRate).div(100);
  const exponent = new Decimal(yearsAgo);

  // (1 + rate)^years
  const inflationFactor = new Decimal(1).plus(rate).pow(exponent);

  // Real Value = Nominal / inflationFactor
  const realValue = nominal.div(inflationFactor);

  return realValue.toFixed(2);
}

/**
 * Calculates the nominal value from a real value
 * Formula: Nominal Value = Real Value * (1 + inflation_rate/100)^years
 */
export function calculateNominalValue(
  realAmount: number | string,
  inflationRate: number, // percentage
  yearsAgo: number
): string {
  const real = new Decimal(realAmount);
  const rate = new Decimal(inflationRate).div(100);
  const exponent = new Decimal(yearsAgo);

  // (1 + rate)^years
  const inflationFactor = new Decimal(1).plus(rate).pow(exponent);

  // Nominal Value = Real * inflationFactor
  const nominalValue = real.times(inflationFactor);

  return nominalValue.toFixed(2);
}

/**
 * Calculates VAT (Value Added Tax)
 */
export function calculateVAT(
  amount: number | string,
  vatRate: number // percentage (e.g., 7 for 7%)
): { gross: string; tax: string; net: string } {
  const baseAmount = new Decimal(amount);
  const rate = new Decimal(vatRate).div(100);

  const tax = baseAmount.times(rate);
  const gross = baseAmount.plus(tax);

  return {
    gross: gross.toFixed(2),
    tax: tax.toFixed(2),
    net: baseAmount.toFixed(2),
  };
}

/**
 * Calculates income tax on a given amount
 */
export function calculateIncomeTax(
  income: number | string,
  taxRate: number // percentage
): { grossIncome: string; tax: string; netIncome: string } {
  const grossIncome = new Decimal(income);
  const rate = new Decimal(taxRate).div(100);

  const tax = grossIncome.times(rate);
  const netIncome = grossIncome.minus(tax);

  return {
    grossIncome: grossIncome.toFixed(2),
    tax: tax.toFixed(2),
    netIncome: netIncome.toFixed(2),
  };
}

/**
 * Calculates total spending with tax considerations
 * Useful for understanding the true cost of purchases
 */
export function calculateTotalCostWithTax(
  baseAmount: number | string,
  vatRate: number
): string {
  const base = new Decimal(baseAmount);
  const rate = new Decimal(vatRate).div(100);

  const total = base.times(new Decimal(1).plus(rate));

  return total.toFixed(2);
}

/**
 * Compares nominal vs real spending over time
 * Returns an analysis of purchasing power changes
 */
export function analyzeSpendingPower(
  historicalAmount: number | string,
  inflationRate: number,
  yearsAgo: number
): {
  nominalAmount: string;
  realAmount: string;
  purchasingPowerChange: string;
  percentageChange: string;
} {
  const nominal = new Decimal(historicalAmount);
  const real = new Decimal(calculateRealValue(historicalAmount, inflationRate, yearsAgo));

  const change = nominal.minus(real);
  const percentChange = change.div(nominal).times(100);

  return {
    nominalAmount: nominal.toFixed(2),
    realAmount: real.toFixed(2),
    purchasingPowerChange: change.toFixed(2),
    percentageChange: percentChange.toFixed(2),
  };
}

/**
 * Calculates average spending per category with inflation adjustment
 */
export function calculateAverageSpendingAdjusted(
  amounts: (number | string)[],
  inflationRate: number,
  yearsAgo: number
): {
  nominalAverage: string;
  realAverage: string;
} {
  if (amounts.length === 0) {
    return { nominalAverage: "0.00", realAverage: "0.00" };
  }

  const sum = amounts.reduce((acc, amount) => acc.plus(new Decimal(amount)), new Decimal(0));
  const nominalAverage = sum.div(amounts.length);

  const realAverage = new Decimal(
    calculateRealValue(nominalAverage.toString(), inflationRate, yearsAgo)
  );

  return {
    nominalAverage: nominalAverage.toFixed(2),
    realAverage: realAverage.toFixed(2),
  };
}
