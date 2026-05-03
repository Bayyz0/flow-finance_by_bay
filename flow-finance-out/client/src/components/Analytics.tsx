import { useEffect } from "react";

// Vite exposes import.meta.env at build time; the type comes from vite/client.
// We reference it safely here so the component still compiles without the
// vite/client lib reference in strict tsconfig environments.
declare const __VITE_ANALYTICS_ENDPOINT__: string | undefined;
declare const __VITE_ANALYTICS_WEBSITE_ID__: string | undefined;

/**
 * Analytics — safely loads Umami only when VITE_ANALYTICS_ENDPOINT is set.
 * FIX: replaced hard-coded /umami script in index.html which caused
 * "Unexpected token '<'" SyntaxError on every dev page load.
 */
export function Analytics() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = import.meta as any;
  const endpoint = meta.env?.VITE_ANALYTICS_ENDPOINT as string | undefined;
  const websiteId = meta.env?.VITE_ANALYTICS_WEBSITE_ID as string | undefined;

  useEffect(() => {
    if (!endpoint) return;
    const src = `${endpoint}/umami`;
    if (document.querySelector(`script[src="${src}"]`)) return;

    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.async = true;
    if (websiteId) script.setAttribute("data-website-id", websiteId);
    document.head.appendChild(script);

    return () => {
      const el = document.querySelector(`script[src="${src}"]`);
      if (el) document.head.removeChild(el);
    };
  }, [endpoint, websiteId]);

  return null;
}
