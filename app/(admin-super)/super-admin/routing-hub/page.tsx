"use client";

import React from "react";
import { useRouter } from "next/navigation";

const RoutingHubPage = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Super Admin Routing Hub
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigateTo("/admin")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg transition-colors flex flex-col items-center justify-center"
          >
            <span className="text-xl font-medium">Admin</span>
            <span className="text-sm mt-1">Manage system settings</span>
          </button>

          <button
            onClick={() => navigateTo("/")}
            className="bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg transition-colors flex flex-col items-center justify-center"
          >
            <span className="text-xl font-medium">Home</span>
            <span className="text-sm mt-1">Return to main page</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutingHubPage;
