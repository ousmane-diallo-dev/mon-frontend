import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";

const getSystemPrefersDark = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const applyThemeClass = (mode: ThemeMode) => {
  const root = document.documentElement;
  const shouldUseDark = mode === "dark" || (mode === "system" && getSystemPrefersDark());
  root.classList.toggle("dark", shouldUseDark);
};

const ThemeToggle = () => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme-mode") as ThemeMode | null;
    return saved || "system";
  });

  useEffect(() => {
    applyThemeClass(mode);
    localStorage.setItem("theme-mode", mode);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => {
      if (mode === "system") applyThemeClass("system");
    };
    media.addEventListener?.('change', listener);
    return () => media.removeEventListener?.('change', listener);
  }, [mode]);

  return (
    <div className="flex items-center gap-1">
      <button
        aria-label="Thème clair"
        title="Thème clair"
        onClick={() => setMode("light")}
        className={`px-2 py-1 rounded text-sm transition border ${mode === "light" ? "bg-blue-600 text-white border-blue-600" : "hover:bg-blue-50 text-blue-900 border-blue-200"}`}
      >
        Clair
      </button>
      <button
        aria-label="Thème système"
        title="Thème système"
        onClick={() => setMode("system")}
        className={`px-2 py-1 rounded text-sm transition border ${mode === "system" ? "bg-blue-600 text-white border-blue-600" : "hover:bg-blue-50 text-blue-900 border-blue-200"}`}
      >
        Système
      </button>
      <button
        aria-label="Thème sombre"
        title="Thème sombre"
        onClick={() => setMode("dark")}
        className={`px-2 py-1 rounded text-sm transition border ${mode === "dark" ? "bg-blue-600 text-white border-blue-600" : "hover:bg-blue-50 text-blue-900 border-blue-200"}`}
      >
        Sombre
      </button>
    </div>
  );
};

export default ThemeToggle;


