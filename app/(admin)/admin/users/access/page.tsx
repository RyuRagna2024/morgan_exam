import { Suspense } from "react";
import { getAllUsers } from "../_actions/getAllUsers";
import AdminUsersTable from "../_components/UserTable";

// Server component that fetches the data
async function UsersData() {
  const { users = [], error } = await getAllUsers();

  if (error) {
    return (
      <div
        className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return <AdminUsersTable users={users} />;
}

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-gray-600">
          View and manage all user accounts, permissions, and roles.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <span className="ml-2">Loading users...</span>
          </div>
        }
      >
        <UsersData />
      </Suspense>
    </div>
  );
}
