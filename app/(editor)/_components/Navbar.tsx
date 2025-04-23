// app/(editor)/_components/Navbar.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import UserButton from "./UserButton"; // Import Editor's UserButton

const Navbar = () => {
  return (
    <nav className="bg-slate-800 text-white shadow-md sticky top-0 z-50 w-full">
      {" "}
      {/* Different color? */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {" "}
          {/* Standard height */}
          {/* Maybe Editor Logo or Link back to public site */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              {/* <Image src="/logo_editor.png" alt="Editor Logo" width={150} height={40} /> */}
              <span className="font-semibold">Editor Panel</span>
            </Link>
          </div>
          {/* Optional Editor Nav Links Here if needed */}
          {/* <div className="hidden md:flex md:items-center space-x-4">
             <Link href="/editor/content">Content</Link>
             <Link href="/editor/users">Users</Link>
          </div> */}
          {/* Right Side Actions - Just the UserButton for logout */}
          <div className="flex items-center">
            <UserButton /> {/* Editor's UserButton */}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
