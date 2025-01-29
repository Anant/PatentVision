// components/Header.tsx
import React from "react";
import ThemeToggle from "@/components/ThemeToggle"; // Adjust the import path as necessary

export function Header() {
  return (
    <header className="flex items-center justify-between p-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Patent Vision</h1>
      <ThemeToggle />
    </header>
  );
}
