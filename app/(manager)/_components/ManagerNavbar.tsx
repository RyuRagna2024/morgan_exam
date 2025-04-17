// app/(manager)/_components/ManagerNavbar.tsx
"use client";

import UserButton from "./UserButton";
// import { User } from "lucia"; // No longer needed

// Remove user prop from interface
interface ManagerNavbarProps {
  // No props needed now if UserButton uses session
}

// Remove user prop from function signature
const ManagerNavbar: React.FC<ManagerNavbarProps> = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-[88px] bg-neutral-900 text-white shadow-md border-b border-neutral-800">
      <div className="flex items-center justify-end h-full mx-auto w-full py-6 px-8">
        <div className="flex items-center space-x-6">
          {/* Render UserButton WITHOUT the user prop */}
          <UserButton className="text-lg" />
        </div>
      </div>
    </nav>
  );
};

export default ManagerNavbar;
