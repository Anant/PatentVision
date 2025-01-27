// components/PersonaSelect.tsx
import React, { JSX, useState } from "react";
import { Card } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Plus,
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

interface PersonaItem {
  icon: JSX.Element;
  title: string;
}

interface PersonaSelectProps {
  selectedPersona: string;
  setSelectedPersona: (value: string) => void;
}

export function PersonaSelect({ selectedPersona, setSelectedPersona }: PersonaSelectProps) {
  const [customPersona, setCustomPersona] = useState("");

  // Here’s your list of icons and titles
  const personas: PersonaItem[] = [
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

  function handleSelectPersona(title: string) {
    setSelectedPersona(title);
  }

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
        {personas.map((persona) => (
          <Card
            key={persona.title}
            className={`aspect-square p-4 cursor-pointer transition-colors hover:bg-accent ${
              selectedPersona === persona.title ? "border border-primary" : ""
            }`}
            onClick={() => handleSelectPersona(persona.title)}
          >
            <div className="flex flex-col items-center justify-center h-full text-center gap-2">
              {persona.icon}
              <h3 className="font-semibold text-xs">{persona.title}</h3>
            </div>
          </Card>
        ))}

        {/* "More" card for custom persona entry */}
        <Dialog>
          <DialogTrigger asChild>
            <Card className="aspect-square p-4 cursor-pointer transition-colors hover:bg-accent">
              <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                <Plus className="h-6 w-6" />
                <h3 className="font-semibold text-xs">More</h3>
              </div>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Custom Persona</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="custom-persona">Enter your use case</Label>
                <Input
                  id="custom-persona"
                  value={customPersona}
                  onChange={(e) => setCustomPersona(e.target.value)}
                  placeholder="e.g. Competitive Analysis"
                />
              </div>
              <Button onClick={() => setSelectedPersona(customPersona)}>Add Persona</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* “Next” button, or any relevant action */}
      <div className="flex justify-end">
        <Button
          
          disabled={!selectedPersona}
          onClick={() => console.log("Persona chosen:", selectedPersona)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
