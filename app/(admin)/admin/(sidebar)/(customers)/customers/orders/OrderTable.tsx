"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Search, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";
import StatusDropdown from "./StatusDropdown"; // Assumes this component handles its own dark mode
import { useOrders } from "./use-orders";

export default function OrderTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";

  const [search, setSearch] = useState(searchQuery);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { orders, isLoading, totalOrders, totalPages, refetch } = useOrders({
    page: currentPage,
    search: searchQuery,
    status: statusFilter,
    limit: 10, // Keep limit consistent
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.push(`?${params.toString()}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleViewOrder = (orderId: string) => {
    // Assuming the detail page is /admin/customers/orders/[orderId]
    // Adjust if your detail page route is different
    router.push(`/admin/customers/orders/${orderId}`);
  };

  return (
    // *** ADDED DARK MODE STYLES ***
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 w-full border border-gray-200 dark:border-gray-700">
      {/* Header */}
      {/* *** ADDED DARK MODE STYLES *** */}
      <div className="pb-6 mb-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Orders
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full sm:w-auto bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="flex items-center gap-2">
            <div className="relative">
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="status-filter"
                defaultValue={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-[180px] appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Filter orders by status"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400 dark:text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <button
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleRefresh}
              disabled={isRefreshing}
              aria-label="Refresh orders"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Table content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mr-3"></div>
          Loading orders...
        </div>
      ) : (
        <>
          {/* *** ADDED DARK MODE STYLES *** */}
          <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
              {/* *** ADDED DARK MODE STYLES *** */}
              <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400 w-[100px]">
                    Order ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400">
                    Customer
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400">
                    Amount
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              {/* *** ADDED DARK MODE STYLES *** */}
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-gray-100"
                    >
                      <td className="p-4 align-middle font-medium">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium">{`${order.firstName} ${order.lastName}`}</span>
                          {/* *** ADDED DARK MODE STYLES *** */}
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {order.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {format(new Date(order.createdAt), "PP")}{" "}
                        {/* Using PP for locale date */}
                      </td>
                      <td className="p-4 align-middle">
                        R{order.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-4 align-middle">
                        {/* StatusDropdown should handle its dark mode */}
                        <StatusDropdown
                          orderId={order.id}
                          currentStatus={order.status}
                          onSuccess={refetch}
                        />
                      </td>
                      <td className="p-4 align-middle text-right">
                        {/* *** ADDED DARK MODE STYLES *** */}
                        <button
                          className="inline-flex items-center justify-center text-sm font-medium px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => handleViewOrder(order.id)}
                          aria-label={`View details for order ${order.id.slice(0, 8)}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    {/* *** ADDED DARK MODE STYLES *** */}
                    <td
                      colSpan={6}
                      className="h-24 text-center text-gray-500 dark:text-gray-400"
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="flex items-center gap-1">
                {currentPage > 1 && (
                  <Link
                    href={`?page=${currentPage - 1}${searchQuery ? `&search=${searchQuery}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`}
                    // *** ADDED DARK MODE STYLES ***
                    className="inline-flex items-center justify-center h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Previous
                  </Link>
                )}

                {/* Simplified Pagination Display Logic */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  // Show only a few pages around the current one if many pages exist
                  .filter(
                    (pageNum) =>
                      totalPages <= 7 ||
                      Math.abs(pageNum - currentPage) < 3 ||
                      pageNum === 1 ||
                      pageNum === totalPages,
                  )
                  .map((pageNum, index, arr) => (
                    <React.Fragment key={pageNum}>
                      {/* Add ellipsis if there's a gap */}
                      {totalPages > 7 &&
                        index > 0 &&
                        pageNum > arr[index - 1] + 1 && (
                          <span className="inline-flex items-center justify-center h-10 w-10 text-gray-500 dark:text-gray-400">
                            ...
                          </span>
                        )}
                      <Link
                        href={`?page=${pageNum}${searchQuery ? `&search=${searchQuery}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`}
                        // *** ADDED DARK MODE STYLES ***
                        className={`inline-flex items-center justify-center h-10 w-10 rounded-md border text-sm font-medium
                           ${
                             currentPage === pageNum
                               ? "bg-primary text-primary-foreground border-primary" // Active page
                               : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700" // Inactive page
                           }`}
                      >
                        {pageNum}
                      </Link>
                    </React.Fragment>
                  ))}

                {currentPage < totalPages && (
                  <Link
                    href={`?page=${currentPage + 1}${searchQuery ? `&search=${searchQuery}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`}
                    // *** ADDED DARK MODE STYLES ***
                    className="inline-flex items-center justify-center h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next
                  </Link>
                )}
              </nav>
            </div>
          )}

          {/* *** ADDED DARK MODE STYLES *** */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Showing {orders.length > 0 ? (currentPage - 1) * 10 + 1 : 0} -{" "}
            {(currentPage - 1) * 10 + orders.length} of {totalOrders} orders
          </div>
        </>
      )}
    </div>
  );
}
