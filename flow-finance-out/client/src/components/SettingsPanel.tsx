import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";
import { useI18n } from "@/contexts/I18nContext";
import { Moon, Sun, Cloud, Globe } from "lucide-react";

/**
 * Settings Panel Component
 * FIX: Theme buttons now set a specific theme instead of blindly calling toggleTheme().
 * Previously clicking "Dark" while on "cloud" theme would cycle unpredictably.
 */
export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useI18n();

  const themeOptions = [
    { id: "light" as const, label: "Light", icon: Sun },
    { id: "dark" as const, label: "Dark", icon: Moon },
    { id: "cloud" as const, label: "Cloud", icon: Cloud },
  ];

  const languageOptions = [
    { id: "en" as const, label: "English", flag: "🇺🇸" },
    { id: "th" as const, label: "ไทย", flag: "🇹🇭" },
    { id: "lo" as const, label: "ລາວ", flag: "🇱🇦" },
  ];

  return (
    <div className="space-y-4">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = theme === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id)}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        isActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">
                {theme === "light" && "Light theme with clean, bright interface"}
                {theme === "dark" && "Dark theme for reduced eye strain"}
                {theme === "cloud" && "Cloud theme with animated floating clouds"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Language</CardTitle>
          <CardDescription>Choose your preferred language</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Select Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {languageOptions.map((option) => {
                  const isActive = language === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setLanguage(option.id)}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        isActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl">{option.flag}</span>
                      <span className="text-xs font-medium text-center">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-xs text-blue-900">
                💡 <strong>Tip:</strong> The app interface will update immediately when you change the language.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Preferences</CardTitle>
          <CardDescription>Other application settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Notifications</label>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Data Backup</label>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Privacy Settings</label>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
