import { useState, useEffect } from "react";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Check for saved theme preference or default to dark
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" || "dark";
    setTheme(savedTheme);
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.toggle("dark", savedTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    
    // Apply theme to document
    const root = document.documentElement;
    root.classList.toggle("dark", newTheme === "dark");
  };

  return { theme, toggleTheme };
}
