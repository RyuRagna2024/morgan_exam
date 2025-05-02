"use client";

import { useState } from "react";
import Image from "next/image";
// Use UserRole from Prisma where the complete enum (including MANAGER) is defined
import { UserRole } from "@prisma/client";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Trash2,
  UserCog,
  Shield,
  Filter,
} from "lucide-react";
import type { AdminUsersTableProps, User } from "./types"; // types.ts should also use UserRole from @prisma/client
import { updateUserRole } from "../_actions/updateUserRole";
import { deleteUser } from "../_actions/deleteUser";

export default function AdminUsersTable({ users }: AdminUsersTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortField, setSortField] = useState<keyof User | "name">("lastName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentUsers, setCurrentUsers] = useState<User[]>(users);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");

  // Handle sorting
  const handleSort = (field: keyof User | "name") => {
    // ... (no changes needed here) ...
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle role change
  const handleRoleChange = async (userId: string, newRoleValue: string) => {
    // ... (no changes needed here) ...
    const newRole = newRoleValue as UserRole;
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("newRole", newRole);
    const result = await updateUserRole(formData);
    if (result.success) {
      setCurrentUsers(
        currentUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
    } else {
      alert(result.error || "Failed to update user role");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    // ... (no changes needed here) ...
    const formData = new FormData();
    formData.append("userId", userId);
    const result = await deleteUser(formData);
    if (result.success) {
      setCurrentUsers(currentUsers.filter((user) => user.id !== userId));
      setConfirmDelete(null);
    } else {
      alert(result.error || "Failed to delete user");
    }
  };

  // Filter and sort users
  const filteredUsers = currentUsers
    .filter((user) => {
      // ... (filtering logic - no changes needed) ...
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (user.firstName?.toLowerCase() || "").includes(searchLower) ||
        (user.lastName?.toLowerCase() || "").includes(searchLower) ||
        (user.email?.toLowerCase() || "").includes(searchLower) ||
        (user.username?.toLowerCase() || "").includes(searchLower) ||
        (user.role?.toLowerCase() || "").includes(searchLower);
      const matchesRoleFilter =
        roleFilter === "ALL" || user.role === roleFilter;
      return matchesSearch && matchesRoleFilter;
    })
    .sort((a, b) => {
      // ... (sorting logic - no changes needed) ...
      if (sortField === "name") {
        const nameA = `${a.lastName || ""} ${a.firstName || ""}`;
        const nameB = `${b.lastName || ""} ${b.firstName || ""}`;
        if (nameA < nameB) return sortDirection === "asc" ? -1 : 1;
        if (nameA > nameB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }
      const valueA = a[sortField as keyof User] ?? "";
      const valueB = b[sortField as keyof User] ?? "";
      const strA = String(valueA);
      const strB = String(valueB);
      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // Role badge style helper - *** ADDED MANAGER CASE + DARK VARIANTS ***
  const getRoleBadgeClass = (role: UserRole): string => {
    switch (role) {
      case UserRole.SUPERADMIN:
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case UserRole.ADMIN:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case UserRole.MANAGER: // <<< ADDED MANAGER
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"; // Example: Orange
      case UserRole.EDITOR:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case UserRole.CUSTOMER:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case UserRole.PROCUSTOMER:
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
      default: // USER
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  // Sort icon helper
  const SortIcon = ({ field }: { field: keyof User | "name" }) => {
    // ... (no changes needed here) ...
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    // *** ADDED DARK MODE STYLES ***
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Search and filters */}
      {/* *** ADDED DARK MODE STYLES *** */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <select
              className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as UserRole | "ALL")
              }
              aria-label="Filter by role"
            >
              <option value="ALL">All Roles</option>
              <option value={UserRole.USER}>User</option>
              <option value={UserRole.CUSTOMER}>Customer</option>
              <option value={UserRole.PROCUSTOMER}>Pro Customer</option>
              <option value={UserRole.EDITOR}>Editor</option>
              <option value={UserRole.MANAGER}>Manager</option>{" "}
              {/* <<< ADDED MANAGER */}
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.SUPERADMIN}>SuperAdmin</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {/* *** ADDED DARK MODE STYLES *** */}
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {/* Apply dark styles to headers */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name <SortIcon field="name" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email <SortIcon field="email" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("username")}
              >
                Username <SortIcon field="username" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("townCity")}
              >
                Location <SortIcon field="townCity" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("role")}
              >
                Role <SortIcon field="role" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          {/* Apply dark styles to body */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                // Apply dark styles to rows
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        {user.avatarUrl ? (
                          <Image
                            className="rounded-full object-cover"
                            src={user.avatarUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            fill
                            sizes="40px"
                          />
                        ) : (
                          // Apply dark styles to avatar placeholder
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 font-semibold">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        {/* Apply dark styles to text */}
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.displayName}
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Apply dark styles to text */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {user.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">
                      {user.townCity}
                      {user.postcode ? `, ${user.postcode}` : ""}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.country}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {/* The getRoleBadgeClass handles dark mode */}
                    {/* The select dropdown also needs dark mode styling and MANAGER option */}
                    <select
                      aria-label={`Change role for ${user.firstName} ${user.lastName}`}
                      // Base classes + role-specific classes + dark mode for select itself
                      className={`text-sm font-medium rounded-full px-3 py-1 appearance-none border border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary ${getRoleBadgeClass(user.role)}`}
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      // Add basic select styling for dark mode compatibility if needed
                      // style={{ backgroundColor: 'inherit', color: 'inherit' }} // Example inline style if needed
                    >
                      <option value={UserRole.USER}>User</option>
                      <option value={UserRole.CUSTOMER}>Customer</option>
                      <option value={UserRole.PROCUSTOMER}>Pro Customer</option>
                      <option value={UserRole.EDITOR}>Editor</option>
                      <option value={UserRole.MANAGER}>Manager</option>{" "}
                      {/* <<< ADDED MANAGER */}
                      <option value={UserRole.ADMIN}>Admin</option>
                      <option value={UserRole.SUPERADMIN}>SuperAdmin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {confirmDelete === user.id ? (
                      // Apply dark styles to confirm delete text/buttons
                      <div className="flex justify-end items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Confirm?
                        </span>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 font-medium"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      // Apply dark styles to delete button
                      <button
                        onClick={() => setConfirmDelete(user.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        aria-label={`Delete user ${user.firstName} ${user.lastName}`}
                      >
                        <Trash2 className="h-5 w-5 inline" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7} // Adjusted colspan
                  // Apply dark styles to "No users found" message
                  className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No users found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
