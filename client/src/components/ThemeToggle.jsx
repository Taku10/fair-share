import { useTheme } from "../ThemeContext.jsx";

function ThemeToggle({ floating = false }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className={`theme-toggle ${floating ? "theme-toggle-floating" : ""}`}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}

export default ThemeToggle;
