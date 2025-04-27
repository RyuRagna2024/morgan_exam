// app/(manager)/_components/ManagerNavbar.tsx
"use client";

import UserButton from "./UserButton";
// *** IMPORT TierBadge (assuming it's shared from public) ***
import TierBadge from "@/app/(public)/_components/(navbar_group)/TierBadge";
import { cn } from "@/lib/utils"; // Import cn if needed for badge container class

// Keep interface empty if no other props needed
interface ManagerNavbarProps {}

const ManagerNavbar: React.FC<ManagerNavbarProps> = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-[88px] bg-neutral-900 text-white shadow-md border-b border-neutral-800">
      <div className="flex items-center justify-end h-full mx-auto w-full py-6 px-8">
        <div className="flex items-center space-x-6">
          {/* *** CORRECTED STRUCTURE for UserButton + TierBadge *** */}
          <div className="relative flex-shrink-0">
            {" "}
            {/* Wrap UserButton & Badge */}
            {/* Render UserButton WITHOUT the user prop */}
            <UserButton className="text-lg" />
            {/* Position Badge absolutely relative to the wrapper */}
            <div className="absolute -bottom-1 -right-1 z-10">
              <TierBadge />
            </div>
          </div>
          {/* *** End Corrected Structure *** */}
        </div>
      </div>
    </nav>
  );
};

export default ManagerNavbar;
