"use client";

import { useState } from "react";
import Image from "next/image";
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
import type { AdminUsersTableProps, User } from "./types";
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
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle role change
  const handleRoleChange = async (userId: string, newRoleValue: string) => {
    // Convert string to UserRole enum
    const newRole = newRoleValue as UserRole;

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("newRole", newRole);

    const result = await updateUserRole(formData);

    if (result.success) {
      // Update local state
      setCurrentUsers(
        currentUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
      // Show success message - you can implement toast messages here
    } else {
      // Show error message
      alert(result.error || "Failed to update user role");
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    const formData = new FormData();
    formData.append("userId", userId);

    const result = await deleteUser(formData);

    if (result.success) {
      // Remove user from local state
      setCurrentUsers(currentUsers.filter((user) => user.id !== userId));
      setConfirmDelete(null);
      // Show success message
    } else {
      // Show error message
      alert(result.error || "Failed to delete user");
    }
  };

  // Filter and sort users
  const filteredUsers = currentUsers
    .filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (user.firstName?.toLowerCase() || "").includes(searchLower) ||
        (user.lastName?.toLowerCase() || "").includes(searchLower) ||
        (user.email?.toLowerCase() || "").includes(searchLower) ||
        (user.username?.toLowerCase() || "").includes(searchLower) ||
        (user.role?.toLowerCase() || "").includes(searchLower);

      // Apply role filter if it's not "ALL"
      const matchesRoleFilter =
        roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRoleFilter;
    })
    .sort((a, b) => {
      // Handle sorting for name field separately
      if (sortField === "name") {
        const nameA = `${a.lastName || ""} ${a.firstName || ""}`;
        const nameB = `${b.lastName || ""} ${b.firstName || ""}`;
        if (nameA < nameB) return sortDirection === "asc" ? -1 : 1;
        if (nameA > nameB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }

      // For other fields, use the property directly
      const valueA = a[sortField as keyof User] ?? "";
      const valueB = b[sortField as keyof User] ?? "";

      // Use a safe string comparison (handles all types by converting to string)
      const strA = String(valueA);
      const strB = String(valueB);

      if (strA < strB) return sortDirection === "asc" ? -1 : 1;
      if (strA > strB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // Role badge style helper
  const getRoleBadgeClass = (role: UserRole): string => {
    switch (role) {
      case UserRole.SUPERADMIN:
        return "bg-red-100 text-red-800";
      case UserRole.ADMIN:
        return "bg-purple-100 text-purple-800";
      case UserRole.EDITOR:
        return "bg-blue-100 text-blue-800";
      case UserRole.CUSTOMER:
        return "bg-green-100 text-green-800";
      case UserRole.PROCUSTOMER:
        return "bg-teal-100 text-teal-800";
      default: // USER
        return "bg-gray-100 text-gray-800";
    }
  };

  // Sort icon helper
  const SortIcon = ({ field }: { field: keyof User | "name" }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" />
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Search and filters */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
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
              <option value={UserRole.ADMIN}>Admin</option>
              <option value={UserRole.SUPERADMIN}>SuperAdmin</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Name <SortIcon field="name" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("email")}
              >
                Email <SortIcon field="email" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("username")}
              >
                Username <SortIcon field="username" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("townCity")}
              >
                Location <SortIcon field="townCity" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort("role")}
              >
                Role <SortIcon field="role" />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
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
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                            {user.firstName?.[0]}
                            {user.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.displayName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.townCity}
                      {user.postcode ? `, ${user.postcode}` : ""}
                    </div>
                    <div className="text-sm text-gray-500">{user.country}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      aria-label={`Change role for ${user.firstName} ${user.lastName}`}
                      className={`text-sm font-medium rounded-full px-3 py-1 ${getRoleBadgeClass(user.role)}`}
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                    >
                      <option value={UserRole.USER}>User</option>
                      <option value={UserRole.CUSTOMER}>Customer</option>
                      <option value={UserRole.PROCUSTOMER}>Pro Customer</option>
                      <option value={UserRole.EDITOR}>Editor</option>
                      <option value={UserRole.ADMIN}>Admin</option>
                      <option value={UserRole.SUPERADMIN}>SuperAdmin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {confirmDelete === user.id ? (
                      <div className="flex justify-end items-center space-x-2">
                        <span className="text-sm text-gray-600">Confirm?</span>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
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
                  colSpan={6}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
