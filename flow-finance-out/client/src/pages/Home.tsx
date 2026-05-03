import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";
import { ExportPanel } from "@/components/ExportPanel";
import { SpendingHeatmap } from "@/components/SpendingHeatmap";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Settings, Download, BarChart3 } from "lucide-react";
import { useState } from "react";

/**
 * Home Page - Main Dashboard for Flow Finance Tracker
 * Displays financial overview, export options, and spending analytics
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<"overview" | "export" | "settings">("overview");

  // Mock spending data for heatmap
  const mockSpendingData = [
    { location: "Shopping Mall", amount: 1250.5, transactionCount: 15 },
    { location: "Restaurants", amount: 890.25, transactionCount: 23 },
    { location: "Gas Stations", amount: 450.0, transactionCount: 8 },
    { location: "Groceries", amount: 320.75, transactionCount: 12 },
    { location: "Entertainment", amount: 280.5, transactionCount: 6 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Flow Finance Tracker</h1>
          <p className="text-gray-600 mb-8">
            Track your finances with real-time inflation adjustments and tax calculations
          </p>
          <Button
            size="lg"
            onClick={() => (window.location.href = "/login")}
            className="w-full"
          >
            Sign In
          </Button>
          <p className="text-xs text-gray-500 mt-4">
            Secure login with username and password
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Flow Finance Tracker</h1>
            <p className="text-sm text-gray-600">Welcome, {user?.name || "User"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("settings")}
              className="gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "export"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Download className="w-4 h-4 inline mr-2" />
            Export
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Settings
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">$12,450.50</div>
                  <p className="text-xs text-gray-500 mt-1">+5.2% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">$8,320.75</div>
                  <p className="text-xs text-gray-500 mt-1">-2.1% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Net Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">$4,129.75</div>
                  <p className="text-xs text-gray-500 mt-1">After taxes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Real Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">$4,098.32</div>
                  <p className="text-xs text-gray-500 mt-1">Inflation adjusted</p>
                </CardContent>
              </Card>
            </div>

            {/* Spending Heatmap */}
            <SpendingHeatmap
              data={mockSpendingData}
              title="Spending Heatmap"
              description="Areas where you spend the most"
            />

            {/* Features Info */}
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
                <CardDescription>
                  Flow Finance Tracker includes these powerful features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Real vs Nominal View</h4>
                    <p className="text-sm text-gray-600">
                      See the actual purchasing power of your money adjusted for inflation
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Tax Calculations</h4>
                    <p className="text-sm text-gray-600">
                      Automatic VAT and income tax calculations for accurate reporting
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Data Encryption</h4>
                    <p className="text-sm text-gray-600">
                      Your financial data is encrypted at rest using AES-256 encryption
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Audit Logging</h4>
                    <p className="text-sm text-gray-600">
                      Track all changes with timestamps and user information
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Multi-Language Support</h4>
                    <p className="text-sm text-gray-600">
                      Available in English, Thai, and Lao
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Professional Export</h4>
                    <p className="text-sm text-gray-600">
                      Export to CSV/Excel for accounting software integration
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === "export" && (
          <div>
            <ExportPanel />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div>
            <SettingsPanel />
          </div>
        )}
      </main>
    </div>
  );
}
