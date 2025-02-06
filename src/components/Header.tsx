import React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="flex items-center justify-between p-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <Link 
        href="/" 
        className="text-4xl font-bold text-gray-900 dark:text-gray-100"
      >
        Patent Vision
      </Link>
      <ThemeToggle />
    </header>
  );
}
