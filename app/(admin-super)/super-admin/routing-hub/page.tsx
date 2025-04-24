// app/(admin-super)/routing-hub/page.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Button removed if not used directly
import { Home, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils"; // <<< IMPORT cn UTILITY ADDED

const RoutingHubPage = () => {
  const router = useRouter();

  // Define the cards/links
  const hubItems = [
    {
      title: "Admin",
      description: "Manage system settings",
      href: "/admin",
      icon: ShieldCheck,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Home",
      description: "Return to main page",
      href: "/",
      icon: Home,
      color: "text-green-600 dark:text-green-400",
    },
    // Add more cards here if needed later
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Routing Hub</h1>

      {/* Grid for the cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {hubItems.map((item) => (
          <Link href={item.href} key={item.title} legacyBehavior passHref>
            <a className="block hover:scale-[1.02] transition-transform duration-200">
              <Card className="h-full hover:border-primary/50 cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-semibold">
                    {item.title}
                  </CardTitle>
                  {/* Use cn here */}
                  <item.icon className={cn("h-6 w-6", item.color)} />
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
      {/* Placeholder for other dashboard content */}
    </div>
  );
};

export default RoutingHubPage;
