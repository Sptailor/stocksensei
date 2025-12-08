"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface UserExperienceInputProps {
  onSubmit: (note: string) => void;
  isLoading?: boolean;
}

export function UserExperienceInput({ onSubmit, isLoading }: UserExperienceInputProps) {
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    if (note.trim()) {
      onSubmit(note);
    }
  };

  return (
    <Card className="glass-card glass-card-hover border-blue-500/20">
      <CardHeader>
        <CardTitle className="text-blue-100">Your Experience & Insights</CardTitle>
        <CardDescription className="text-blue-300/60">
          Share your thoughts and observations about this stock
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Example: I believe this stock is strong due to recent product launches and positive earnings reports. The company has shown consistent growth..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          disabled={isLoading}
          className="bg-slate-900/50 border-blue-500/30 text-blue-100 placeholder:text-blue-300/40 focus:border-blue-500/60 focus:ring-blue-500/30 backdrop-blur-xl resize-none"
        />
        <Button
          onClick={handleSubmit}
          disabled={!note.trim() || isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Analyzing..." : "Analyze My Input"}
        </Button>
      </CardContent>
    </Card>
  );
}
