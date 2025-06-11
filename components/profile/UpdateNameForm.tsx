// components/profile/UpdateNameForm.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { User as UserIcon } from "lucide-react";

interface UpdateNameFormProps {
  currentName: string;
  onNameUpdate: (newName: string) => Promise<void>; // Callback to update session in parent
}

export function UpdateNameForm({ currentName, onNameUpdate }: UpdateNameFormProps) {
  const [name, setName] = useState(currentName);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleNameUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (name === currentName || !name.trim()) {
        toast({
            variant: "default",
            title: "No Changes",
            description: "Name is the same or empty.",
        });
        return;
    }
    setIsUpdatingName(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to update name.",
        });
      } else {
        toast({
          title: "Success",
          description: "Name updated successfully.",
        });
        await onNameUpdate(result.user.name); // Call parent's update function
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsUpdatingName(false);
    }
  };

  return (
    <form onSubmit={handleNameUpdate} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="pl-9"
            placeholder="Enter your full name"
          />
        </div>
      </div>
      <Button type="submit" disabled={isUpdatingName || name === currentName || !name.trim()} className="w-full sm:w-auto">
        {isUpdatingName ? "Saving..." : "Save Name Changes"}
      </Button>
    </form>
  );
}
