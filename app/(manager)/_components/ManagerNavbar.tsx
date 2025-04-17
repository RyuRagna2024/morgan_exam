// app/(manager)/_components/ManagerNavbar.tsx
"use client";

import UserButton from "./UserButton"; // Assuming this is the shared/styled button
import { User } from "lucia";

interface ManagerNavbarProps {
  user: User; // Receive user data
}

const ManagerNavbar: React.FC<ManagerNavbarProps> = ({ user }) => {
  // Note: AdminNavbar has a fixed height and a spacer div in the layout.
  // We will replicate the visual style here.
  return (
    // Mimic AdminNavbar structure and styling
    <nav className="fixed top-0 left-0 right-0 z-40 h-[88px] bg-neutral-900 text-white shadow-md border-b border-neutral-800"> {/* Use z-40 so sidebar toggle (z-50) is above */}
      <div className="flex items-center justify-end h-full mx-auto w-full py-6 px-8"> {/* justify-end to push UserButton right */}
         {/* Optional: Add Mobile Menu Toggle Button if needed */}
         {/* <button className="md:hidden mr-4"> <Menu /> </button> */}

         {/* Kept simple like Admin - Just User Button on the right */}
         <div className="flex items-center space-x-6">
            <UserButton user={user} className="text-lg" /> {/* Pass user prop */}
         </div>
      </div>
    </nav>
  );
};

export default ManagerNavbar;