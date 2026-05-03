import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SpendingData {
  location: string;
  amount: number;
  transactionCount: number;
}

interface SpendingHeatmapProps {
  data: SpendingData[];
  title?: string;
  description?: string;
}

/**
 * Spending Heatmap Component
 * Visualizes spending patterns by location/category
 * Shows which areas have the highest spending frequency and amounts
 */
export function SpendingHeatmap({
  data,
  title = "Spending Heatmap",
  description = "Areas where you spend the most",
}: SpendingHeatmapProps) {
  // Calculate statistics for color intensity
  const stats = useMemo(() => {
    if (data.length === 0) {
      return { maxAmount: 0, minAmount: 0, maxCount: 0 };
    }

    const amounts = data.map((d) => d.amount);
    const counts = data.map((d) => d.transactionCount);

    return {
      maxAmount: Math.max(...amounts),
      minAmount: Math.min(...amounts),
      maxCount: Math.max(...counts),
    };
  }, [data]);

  // Get color intensity based on amount
  const getColorIntensity = (amount: number): string => {
    if (stats.maxAmount === 0) return "bg-gray-100";

    const ratio = amount / stats.maxAmount;

    if (ratio > 0.8) return "bg-red-500 text-white";
    if (ratio > 0.6) return "bg-orange-400 text-white";
    if (ratio > 0.4) return "bg-yellow-300";
    if (ratio > 0.2) return "bg-blue-200";
    return "bg-blue-100";
  };

  // Sort data by amount (descending)
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.amount - a.amount);
  }, [data]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No spending data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedData.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{item.location}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold">${item.amount.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{item.transactionCount} transactions</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${getColorIntensity(item.amount)}`}
                  style={{
                    width: `${(item.amount / stats.maxAmount) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-semibold text-gray-600 mb-2">Intensity Scale</h4>
          <div className="grid grid-cols-5 gap-2">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-100 rounded" />
              <span className="text-xs text-gray-600">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-200 rounded" />
              <span className="text-xs text-gray-600">Low-Mid</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-300 rounded" />
              <span className="text-xs text-gray-600">Mid</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-orange-400 rounded" />
              <span className="text-xs text-gray-600">High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-xs text-gray-600">Very High</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-600">Total Spending</div>
            <div className="text-sm font-semibold">
              ${data.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
            </div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-600">Locations</div>
            <div className="text-sm font-semibold">{data.length}</div>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <div className="text-xs text-gray-600">Avg per Location</div>
            <div className="text-sm font-semibold">
              ${(data.reduce((sum, item) => sum + item.amount, 0) / data.length).toFixed(2)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
