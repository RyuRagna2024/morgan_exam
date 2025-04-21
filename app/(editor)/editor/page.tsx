// app/(editor)/page.tsx
import React from "react";

export default function EditorDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Editor Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <p>Welcome, Editor!</p>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Manage site content from here.
        </p>
      </div>
    </div>
  );
}
