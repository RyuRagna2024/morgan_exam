"use client";
import React from "react";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-2xl">
        {/* 404 Header */}
        <h1 className="text-9xl font-bold text-gray-900">404</h1>

        {/* Main Message */}
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold text-gray-800">
            Page Not Found
          </h2>
          <p className="text-gray-600 text-lg">
            Oops! The page you are looking for seems to have gone on vacation.
          </p>
        </div>

        {/* Illustration */}
        <div className="py-8">
          <svg
            className="mx-auto h-40 w-40 text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M8 15s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
            <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
          </svg>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <Home className="mr-2 h-5 w-5" />
            Home Page
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
