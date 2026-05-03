import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "th" | "lo" | "en";

export const LANGUAGES: { id: Language; label: string; nativeLabel: string; flag: string }[] = [
  { id: "en", label: "English",  nativeLabel: "English", flag: "🇺🇸" },
  { id: "th", label: "Thai",     nativeLabel: "ไทย",     flag: "🇹🇭" },
  { id: "lo", label: "Lao",      nativeLabel: "ລາວ",     flag: "🇱🇦" },
];

const translations = {
  th: {
    // Common
    "common.save": "บันทึก",
    "common.cancel": "ยกเลิก",
    "common.delete": "ลบ",
    "common.edit": "แก้ไข",
    "common.add": "เพิ่ม",
    "common.close": "ปิด",
    "common.loading": "กำลังโหลด...",
    "common.error": "เกิดข้อผิดพลาด",
    "common.success": "สำเร็จ",
    "common.warning": "คำเตือน",
    "common.info": "ข้อมูล",
    "common.search": "ค้นหา",
    "common.filter": "ตัวกรอง",
    "common.export": "ส่งออก",
    "common.import": "นำเข้า",
    "common.settings": "ตั้งค่า",
    "common.logout": "ออกจากระบบ",
    "common.login": "เข้าสู่ระบบ",
    "common.signIn": "เข้าสู่ระบบ",
    "common.signOut": "ออกจากระบบ",
    // Navigation
    "nav.dashboard": "แดชบอร์ด",
    "nav.transactions": "ธุรกรรม",
    "nav.accounts": "บัญชี",
    "nav.categories": "หมวดหมู่",
    "nav.reports": "รายงาน",
    "nav.export": "ส่งออก",
    "nav.settings": "ตั้งค่า",
    "nav.appName": "Flow Finance",
    // Dashboard
    "dashboard.title": "แดชบอร์ด",
    "dashboard.welcome": "ยินดีต้อนรับ",
    "dashboard.totalIncome": "รายได้รวม",
    "dashboard.totalExpense": "รายจ่ายรวม",
    "dashboard.balance": "ยอดคงเหลือ",
    "dashboard.netIncome": "รายได้สุทธิ",
    "dashboard.realValue": "มูลค่าจริง",
    "dashboard.recentTransactions": "ธุรกรรมล่าสุด",
    "dashboard.spendingByCategory": "การใช้จ่ายตามหมวดหมู่",
    "dashboard.monthlyComparison": "เปรียบเทียบรายเดือน",
    "dashboard.afterTax": "หลังหักภาษี",
    "dashboard.inflationAdj": "ปรับตามเงินเฟ้อ",
    "dashboard.vsLastMonth": "เทียบเดือนที่แล้ว",
    "dashboard.features": "ฟีเจอร์",
    "dashboard.overview": "ภาพรวม",
    // Auth
    "auth.username": "ชื่อผู้ใช้",
    "auth.password": "รหัสผ่าน",
    "auth.email": "อีเมล (ไม่บังคับ)",
    "auth.name": "ชื่อจริง (ไม่บังคับ)",
    "auth.createAccount": "สร้างบัญชี",
    "auth.noAccount": "ยังไม่มีบัญชี? สร้างใหม่",
    "auth.hasAccount": "มีบัญชีแล้ว? เข้าสู่ระบบ",
    "auth.signingIn": "กำลังเข้าสู่ระบบ...",
    "auth.creating": "กำลังสร้างบัญชี...",
    "auth.tagline": "ติดตามการเงินพร้อมคำนวณภาษีและเงินเฟ้อแบบเรียลไทม์",
    "auth.forgotPassword": "ลืมรหัสผ่าน?",
    "auth.forgotPasswordTitle": "ลืมรหัสผ่าน",
    "auth.forgotPasswordDesc": "กรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้คุณ",
    "auth.sendResetLink": "ส่งลิงก์รีเซ็ต",
    "auth.resetLinkSent": "ส่งลิงก์รีเซ็ตไปยัง {email} แล้ว",
    "auth.rememberMe": "จดจำฉัน",
    "auth.orContinueWith": "หรือเข้าสู่ระบบด้วย",
    "auth.signInWithGoogle": "เข้าสู่ระบบด้วย Google",
    "auth.signUpWithGoogle": "สมัครด้วย Google",
    "auth.welcomeBack": "ยินดีต้อนรับกลับ 👋",
    "auth.loginSubtitle": "เข้าสู่ระบบเพื่อจัดการการเงินของคุณ",
    "auth.registerSubtitle": "สร้างบัญชีใหม่ เริ่มใช้งาน Flow Finance ฟรี",
    "auth.firstName": "ชื่อ",
    "auth.lastName": "นามสกุล",
    "auth.passwordStrengthLow": "ความปลอดภัยต่ำ",
    "auth.passwordStrengthMed": "ความปลอดภัยปานกลาง",
    "auth.passwordStrengthHigh": "ความปลอดภัยดี ✓",
    "auth.sending": "กำลังส่ง...",
    "auth.googleComingSoon": "Google Sign-In พร้อมใช้งาน (ต้องตั้งค่า OAuth)",
    // Settings
    "settings.title": "ตั้งค่า",
    "settings.language": "ภาษา",
    "settings.theme": "ธีม",
    "settings.darkMode": "โหมดมืด",
    "settings.lightMode": "โหมดสว่าง",
    "settings.appearance": "การแสดงผล",
    "settings.selectLanguage": "เลือกภาษา",
    "settings.logoutConfirm": "คุณแน่ใจหรือว่าต้องการออกจากระบบ?",
    // Transactions
    "transactions.title": "ธุรกรรม",
    "transactions.add": "เพิ่มธุรกรรม",
    "transactions.income": "รายได้",
    "transactions.expense": "รายจ่าย",
    "transactions.noTransactions": "ไม่มีธุรกรรม",
    // Messages
    "messages.saved": "บันทึกสำเร็จ",
    "messages.deleted": "ลบสำเร็จ",
    "messages.updated": "อัปเดตสำเร็จ",
    "messages.error": "เกิดข้อผิดพลาด",
    "messages.comingSoon": "เร็วๆนี้",
    // Placeholders
    "page.comingSoon": "เร็วๆ นี้",
    "page.underConstruction": "หน้านี้กำลังพัฒนา",
  },
  lo: {
    // Common
    "common.save": "ບັນທຶກ",
    "common.cancel": "ຍົກເລີກ",
    "common.delete": "ລຶບ",
    "common.edit": "ແກ້ໄຂ",
    "common.add": "ເພີ່ມ",
    "common.close": "ປິດ",
    "common.loading": "ກຳລັງໂຫລດ...",
    "common.error": "ເກີດຂໍ້ຜິດພາດ",
    "common.success": "ສຳເລັດ",
    "common.warning": "ຄຳເຕືອນ",
    "common.info": "ຂໍ້ມູນ",
    "common.search": "ຊອກຫາ",
    "common.filter": "ກັ່ນຕອງ",
    "common.export": "ສົ່ງອອກ",
    "common.import": "ນຳເຂົ້າ",
    "common.settings": "ຕັ້ງຄ່າ",
    "common.logout": "ອອກຈາກລະບົບ",
    "common.login": "ເຂົ້າສູ່ລະບົບ",
    "common.signIn": "ເຂົ້າສູ່ລະບົບ",
    "common.signOut": "ອອກຈາກລະບົບ",
    // Navigation
    "nav.dashboard": "ແດັດບອດ",
    "nav.transactions": "ທຸລະກຳ",
    "nav.accounts": "ບັນຊີ",
    "nav.categories": "ປະເພດ",
    "nav.reports": "ລາຍງານ",
    "nav.export": "ສົ່ງອອກ",
    "nav.settings": "ຕັ້ງຄ່າ",
    "nav.appName": "Flow Finance",
    // Dashboard
    "dashboard.title": "ແດັດບອດ",
    "dashboard.welcome": "ຍິນດີຕ້ອນຮັບ",
    "dashboard.totalIncome": "ລາຍໄດ້ທັງໝົດ",
    "dashboard.totalExpense": "ລາຍຈ່າຍທັງໝົດ",
    "dashboard.balance": "ຍອດເຫຼືອ",
    "dashboard.netIncome": "ລາຍໄດ້ສຸດທິ",
    "dashboard.realValue": "ມູນຄ່າທີ່ແທ້ຈິງ",
    "dashboard.recentTransactions": "ທຸລະກຳລ່າສຸດ",
    "dashboard.spendingByCategory": "ການໃຊ້ຈ່າຍຕາມປະເພດ",
    "dashboard.monthlyComparison": "ປຽບທຽບລາຍເດືອນ",
    "dashboard.afterTax": "ຫຼັງຫັກພາສີ",
    "dashboard.inflationAdj": "ປັບຕາມເງິນເຟ້ອ",
    "dashboard.vsLastMonth": "ທຽບເດືອນທີ່ຜ່ານມາ",
    "dashboard.features": "ຄຸນສົມບັດ",
    "dashboard.overview": "ພາບລວມ",
    // Auth
    "auth.username": "ຊື່ຜູ້ໃຊ້",
    "auth.password": "ລະຫັດຜ່ານ",
    "auth.email": "ອີເມລ (ທາງເລືອກ)",
    "auth.name": "ຊື່ຈິງ (ທາງເລືອກ)",
    "auth.createAccount": "ສ້າງບັນຊີ",
    "auth.noAccount": "ຍັງບໍ່ມີບັນຊີ? ສ້າງໃໝ່",
    "auth.hasAccount": "ມີບັນຊີແລ້ວ? ເຂົ້າສູ່ລະບົບ",
    "auth.signingIn": "ກຳລັງເຂົ້າສູ່ລະບົບ...",
    "auth.creating": "ກຳລັງສ້າງບັນຊີ...",
    "auth.tagline": "ຕິດຕາມການເງິນພ້ອມຄຳນວນພາສີ ແລະ ເງິນເຟ້ອແບບເວລາຈິງ",
    "auth.forgotPassword": "ລືມລະຫັດຜ່ານ?",
    "auth.forgotPasswordTitle": "ລືມລະຫັດຜ່ານ",
    "auth.forgotPasswordDesc": "ໃສ່ອີເມລທີ່ລົງທະບຽນ, ພວກເຮົາຈະສົ່ງລິ້ງຣີເຊັດໃຫ້ທ່ານ",
    "auth.sendResetLink": "ສົ່ງລິ້ງຣີເຊັດ",
    "auth.resetLinkSent": "ສົ່ງລິ້ງຣີເຊັດໄປຍັງ {email} ແລ້ວ",
    "auth.rememberMe": "ຈື່ຈຳຂ້ອຍ",
    "auth.orContinueWith": "ຫຼືເຂົ້າສູ່ລະບົບດ້ວຍ",
    "auth.signInWithGoogle": "ເຂົ້າສູ່ລະບົບດ້ວຍ Google",
    "auth.signUpWithGoogle": "ສະໝັກດ້ວຍ Google",
    "auth.welcomeBack": "ຍິນດີຕ້ອນຮັບກັບຄືນ 👋",
    "auth.loginSubtitle": "ເຂົ້າສູ່ລະບົບເພື່ອຈັດການການເງິນຂອງທ່ານ",
    "auth.registerSubtitle": "ສ້າງບັນຊີໃໝ່ ເລີ່ມໃຊ້ງານ Flow Finance ຟຣີ",
    "auth.firstName": "ຊື່",
    "auth.lastName": "ນາມສະກຸນ",
    "auth.passwordStrengthLow": "ຄວາມປອດໄພຕ່ຳ",
    "auth.passwordStrengthMed": "ຄວາມປອດໄພປານກາງ",
    "auth.passwordStrengthHigh": "ຄວາມປອດໄພດີ ✓",
    "auth.sending": "ກຳລັງສົ່ງ...",
    "auth.googleComingSoon": "Google Sign-In ພ້ອມໃຊ້ງານ (ຕ້ອງຕັ້ງຄ່າ OAuth)",
    // Settings
    "settings.title": "ຕັ້ງຄ່າ",
    "settings.language": "ພາສາ",
    "settings.theme": "ຮູບແບບ",
    "settings.darkMode": "ໂໝ່ວມືດ",
    "settings.lightMode": "ໂໝ່ວສ່ວາງ",
    "settings.appearance": "ການສະແດງຜົນ",
    "settings.selectLanguage": "ເລືອກພາສາ",
    "settings.logoutConfirm": "ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການອອກຈາກລະບົບ?",
    // Transactions
    "transactions.title": "ທຸລະກຳ",
    "transactions.add": "ເພີ່ມທຸລະກຳ",
    "transactions.income": "ລາຍໄດ້",
    "transactions.expense": "ລາຍຈ່າຍ",
    "transactions.noTransactions": "ບໍ່ມີທຸລະກຳ",
    // Messages
    "messages.saved": "ບັນທຶກສຳເລັດ",
    "messages.deleted": "ລຶບສຳເລັດ",
    "messages.updated": "ອັບເດດສຳເລັດ",
    "messages.error": "ເກີດຂໍ້ຜິດພາດ",
    "messages.comingSoon": "ໄວໆນີ້",
    // Placeholders
    "page.comingSoon": "ໄວໆ ນີ້",
    "page.underConstruction": "ໜ້ານີ້ກຳລັງພັດທະນາ",
  },
  en: {
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.add": "Add",
    "common.close": "Close",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.warning": "Warning",
    "common.info": "Info",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.export": "Export",
    "common.import": "Import",
    "common.settings": "Settings",
    "common.logout": "Logout",
    "common.login": "Login",
    "common.signIn": "Sign In",
    "common.signOut": "Sign Out",
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.transactions": "Transactions",
    "nav.accounts": "Accounts",
    "nav.categories": "Categories",
    "nav.reports": "Reports",
    "nav.export": "Export",
    "nav.settings": "Settings",
    "nav.appName": "Flow Finance",
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome back",
    "dashboard.totalIncome": "Total Income",
    "dashboard.totalExpense": "Total Expenses",
    "dashboard.balance": "Balance",
    "dashboard.netIncome": "Net Income",
    "dashboard.realValue": "Real Value",
    "dashboard.recentTransactions": "Recent Transactions",
    "dashboard.spendingByCategory": "Spending by Category",
    "dashboard.monthlyComparison": "Monthly Comparison",
    "dashboard.afterTax": "After taxes",
    "dashboard.inflationAdj": "Inflation adjusted",
    "dashboard.vsLastMonth": "vs last month",
    "dashboard.features": "Features",
    "dashboard.overview": "Overview",
    // Auth
    "auth.username": "Username",
    "auth.password": "Password",
    "auth.email": "Email (optional)",
    "auth.name": "Full name (optional)",
    "auth.createAccount": "Create account",
    "auth.noAccount": "Don't have an account? Create one",
    "auth.hasAccount": "Already have an account? Sign in",
    "auth.signingIn": "Signing in...",
    "auth.creating": "Creating account...",
    "auth.tagline": "Track your finances with real-time inflation & tax calculations",
    "auth.forgotPassword": "Forgot password?",
    "auth.forgotPasswordTitle": "Forgot password",
    "auth.forgotPasswordDesc": "Enter your registered email and we'll send you a reset link.",
    "auth.sendResetLink": "Send reset link",
    "auth.resetLinkSent": "Reset link sent to {email}",
    "auth.rememberMe": "Remember me",
    "auth.orContinueWith": "Or continue with",
    "auth.signInWithGoogle": "Sign in with Google",
    "auth.signUpWithGoogle": "Sign up with Google",
    "auth.welcomeBack": "Welcome back 👋",
    "auth.loginSubtitle": "Sign in to manage your finances",
    "auth.registerSubtitle": "Create a free account to get started",
    "auth.firstName": "First name",
    "auth.lastName": "Last name",
    "auth.passwordStrengthLow": "Weak password",
    "auth.passwordStrengthMed": "Fair password",
    "auth.passwordStrengthHigh": "Strong password ✓",
    "auth.sending": "Sending...",
    "auth.googleComingSoon": "Google Sign-In ready (OAuth setup required)",
    // Settings
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.theme": "Theme",
    "settings.darkMode": "Dark mode",
    "settings.lightMode": "Light mode",
    "settings.appearance": "Appearance",
    "settings.selectLanguage": "Select language",
    "settings.logoutConfirm": "Are you sure you want to sign out?",
    // Transactions
    "transactions.title": "Transactions",
    "transactions.add": "Add Transaction",
    "transactions.income": "Income",
    "transactions.expense": "Expense",
    "transactions.noTransactions": "No transactions",
    // Messages
    "messages.saved": "Saved successfully",
    "messages.deleted": "Deleted successfully",
    "messages.updated": "Updated successfully",
    "messages.error": "An error occurred",
    "messages.comingSoon": "Coming soon",
    // Placeholders
    "page.comingSoon": "Coming Soon",
    "page.underConstruction": "This page is under construction",
  },
} as const;

type TranslationKeys = keyof typeof translations.en;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys | string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app-language") as Language | null;
      if (saved && ["en", "th", "lo"].includes(saved)) return saved;
    }
    return "en";
  });

  // FIX: persist + update <html lang> so screen readers & fonts respond correctly
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
    document.documentElement.lang = lang;
  };

  // Sync on first render
  useEffect(() => {
    document.documentElement.lang = language;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const t = (key: string): string => {
    const map = translations[language] as Record<string, string>;
    return map[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
