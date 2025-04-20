// app/(public)/_components/(navbar_group)/TierBadge.tsx

"use client";

import React from "react";
import { useSession } from "@/app/SessionProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define tier colors
const tierColors = {
  BRONZE: "#cd7f32",
  SILVER: "#c0c0c0",
  GOLD: "#ffd700",
  PLATINUM: "#e5e4e2",
};

// Medal with necklace component
const TierBadge = () => {
  const { user } = useSession();

  if (!user) return null;

  // Default to BRONZE if tier is undefined
  const userTier = user.tier || "BRONZE";
  const tierColor = tierColors[userTier] || tierColors.BRONZE;
  const tierName = userTier.charAt(0) + userTier.slice(1).toLowerCase();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex items-center justify-center cursor-pointer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="w-6 h-6"
            >
              {/* Ribbon/Necklace */}
              <path
                d="M8 6V3.5C8 2.67 8.67 2 9.5 2h5c.83 0 1.5.67 1.5 1.5V6"
                stroke="#ff5555"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Medal body */}
              <circle
                cx="12"
                cy="12"
                r="6"
                fill={tierColor}
                stroke="#333"
                strokeWidth="0.5"
              />

              {/* Medal ring at top */}
              <circle
                cx="12"
                cy="6"
                r="1.5"
                fill="#777"
                stroke="#333"
                strokeWidth="0.5"
              />

              {/* Medal details/star */}
              <path
                d="M12 9l1 2 2.5.5-2 1.5.5 2.5-2-1-2 1 .5-2.5-2-1.5 2.5-.5z"
                fill="#333"
              />
            </svg>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tierName} Tier Member</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default TierBadge;
