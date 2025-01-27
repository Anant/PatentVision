import React from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  ScrollText,
  Search,
  Lightbulb,
  Users,
  LineChart,
  Briefcase,
  Brain,
  Scale,
  Shield,
  ChartBar,
  Gavel,
} from "lucide-react";

export function Sidebar() {


  const personas = [
    { icon: <Search className="h-6 w-6" />, title: "Quick Overview" },
    { icon: <Lightbulb className="h-6 w-6" />, title: "Inventor's View" },
    { icon: <Users className="h-6 w-6" />, title: "Startup / Angel Pitch" },
    { icon: <LineChart className="h-6 w-6" />, title: "Investor Brief" },
    { icon: <Briefcase className="h-6 w-6" />, title: "M&A Brief" },
    { icon: <Brain className="h-6 w-6" />, title: "Technical Deep Dive" },
    { icon: <Scale className="h-6 w-6" />, title: "Legal Analysis" },
    { icon: <Shield className="h-6 w-6" />, title: "Patent Defense" },
    { icon: <ChartBar className="h-6 w-6" />, title: "Market Impact" },
    { icon: <Gavel className="h-6 w-6" />, title: "Litigation Risk" },
  ];

  return (
    <div className="flex flex-col gap-2 p-4 border-r bg-[rgba(255,255,255,0.05)]">
      {/* "New Analysis" Button */}
      <Link href="/">
        <Button variant="ghost" className="w-full justify-start gap-2">
          <ScrollText className="h-4 w-4" />
          New Analysis
        </Button>
      </Link>

      {/* Recent Cases */}
      <div className="mt-4">
        <h2 className="px-2 text-lg font-semibold mb-2">Recent Cases</h2>
        <div className="grid gap-1">

        </div>
      </div>

      {/* Personas */}
      <div className="mt-6">
        <h2 className="px-2 text-lg font-semibold mb-2">Analysis Modes</h2>
        <div className="grid gap-1">
          {personas.map((p) => (
            <Button key={p.title} variant="ghost" className="w-full justify-start gap-2 text-left">
              {p.icon}
              <span>{p.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
