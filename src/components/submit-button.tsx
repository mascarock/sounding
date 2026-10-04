"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="brass" size="lg" disabled={pending}>
      {pending ? "Sounding the chain…" : "Sound the chain"}
    </Button>
  );
}
