import { toast } from "sonner";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  duration?: number;
  position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
}

/**
 * Custom hook for showing toast notifications
 * Uses sonner library for consistent toast UI
 */
export function useToast() {
  const showToast = (message: string, type: ToastType = "info", options?: ToastOptions) => {
    const defaultOptions = {
      duration: 4000,
      position: "bottom-right" as const,
      ...options,
    };

    switch (type) {
      case "success":
        toast.success(message, defaultOptions);
        break;
      case "error":
        toast.error(message, defaultOptions);
        break;
      case "warning":
        toast.warning(message, defaultOptions);
        break;
      case "info":
      default:
        toast.info(message, defaultOptions);
        break;
    }
  };

  return {
    success: (message: string, options?: ToastOptions) => showToast(message, "success", options),
    error: (message: string, options?: ToastOptions) => showToast(message, "error", options),
    warning: (message: string, options?: ToastOptions) => showToast(message, "warning", options),
    info: (message: string, options?: ToastOptions) => showToast(message, "info", options),
  };
}
