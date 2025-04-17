// app/(manager)/manager/page.tsx
import { validateRequest } from "@/auth"; // Optional: If you need user data here

export default async function ManagerDashboardPage() {
  // You can fetch manager-specific data here if needed
  // const { user } = await validateRequest(); // Example

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Manager Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      {/* Add widgets or summaries here */}
    </div>
  );
}
