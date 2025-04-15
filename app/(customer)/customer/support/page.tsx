// src/app/(customer)/customer/support/page.tsx (or similar path)

import React from "react";
import { redirect } from "next/navigation";
import SupportForm from "./_components/SupportForm";
import { validateRequest } from "@/auth";

export default async function SupportPage() {
  // Validate user session
  const { user } = await validateRequest();

  if (!user) {
    redirect("/login?message=Please log in to access support");
  }

  return (
    // Adjust container styling if needed for scrollbar issue
    <div className="container mx-auto px-4 py-8">
      {/* Render the form - it now contains its own action logic */}
      <SupportForm />
    </div>
  );
}
