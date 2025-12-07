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
    <Card>
      <CardHeader>
        <CardTitle>Your Experience & Insights</CardTitle>
        <CardDescription>
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
        />
        <Button onClick={handleSubmit} disabled={!note.trim() || isLoading}>
          {isLoading ? "Analyzing..." : "Analyze My Input"}
        </Button>
      </CardContent>
    </Card>
  );
}
