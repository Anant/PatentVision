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

  const [personas, setPersonas] = useState<PersonaItem[]>([
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
  ]);

  function handleSelectPersona(title: string) {
    setSelectedPersona(title);
  }

  function handleAddCustomPersona() {
    if (!customPersona.trim()) return;
    setPersonas((prev) => [
      ...prev,
      { title: customPersona.trim(), icon: <Users className="h-6 w-6" /> },
    ]);
    setSelectedPersona(customPersona.trim());
    setCustomPersona("");
  }

  return (
    <div className="mt-8">
      <div className="grid gap-6">
        {/* Persona Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10 gap-3">
          {personas.map((persona) => (
            <Card
              key={persona.title}
              className={`w-28 h-28 p-4 rounded-md cursor-pointer transition-colors 
                border border-transparent bg-gray-800 hover:border-gray-500 hover:bg-gray-700 
                flex flex-col items-center justify-center
                ${
                  selectedPersona === persona.title
                    ? "border-blue-400 bg-gray-600"
                    : ""
                }
              `}
              onClick={() => handleSelectPersona(persona.title)}
            >
              <div className="flex flex-col items-center justify-center text-center gap-2 h-full">
                {persona.icon}
                <h3 className="font-semibold text-xs">{persona.title}</h3>
              </div>
            </Card>
          ))}

          {/* "More" card for custom persona entry */}
          <Dialog>
            <DialogTrigger asChild>
              <Card
                className="w-28 h-28 p-4 rounded-md cursor-pointer 
                  border border-transparent bg-gray-800 
                  hover:border-gray-500 hover:bg-gray-700 
                  transition-colors flex flex-col items-center justify-center
                "
              >
                <Plus className="h-6 w-6" />
                <h3 className="font-semibold text-xs">More</h3>
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
                <Button onClick={handleAddCustomPersona}>Add Persona</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* "Next" Button */}
        {/* <div className="flex justify-end">
          <Button
            disabled={!selectedPersona}
            onClick={() => console.log("Persona chosen:", selectedPersona)}
          >
            Next
          </Button>
        </div> */}
      </div>
    </div>
  );
}
