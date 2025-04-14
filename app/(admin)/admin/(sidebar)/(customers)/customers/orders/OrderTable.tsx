"use client";

import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Search, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";
import StatusDropdown from "./StatusDropdown";
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
    limit: 10,
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
    router.push(`/admin/orders/${orderId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 w-full">
      {/* Header */}
      <div className="pb-6 mb-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Orders</h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
            <input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border rounded-md w-full sm:w-auto"
            />
            <button
              type="submit"
              className="p-2 border rounded-md hover:bg-gray-100"
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
                className="px-3 py-2 border rounded-md w-[180px]"
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
            </div>

            <button
              className="p-2 border rounded-md hover:bg-gray-100"
              onClick={handleRefresh}
              disabled={isRefreshing}
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium w-[100px]">
                    Order ID
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Customer
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Amount
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Status
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 align-middle font-medium">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium">{`${order.firstName} ${order.lastName}`}</span>
                          <span className="text-sm text-muted-foreground">
                            {order.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="p-4 align-middle">
                        R{order.totalAmount.toFixed(2)}
                      </td>
                      <td className="p-4 align-middle">
                        <StatusDropdown
                          orderId={order.id}
                          currentStatus={order.status}
                          onSuccess={refetch}
                        />
                      </td>
                      <td className="p-4 align-middle text-right">
                        <button
                          className="inline-flex items-center justify-center text-sm font-medium px-3 py-1.5 rounded-md hover:bg-gray-100"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="h-24 text-center">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="flex items-center gap-1">
                {currentPage > 1 && (
                  <Link
                    href={`?page=${currentPage - 1}${searchQuery ? `&search=${searchQuery}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`}
                    className="inline-flex items-center justify-center h-10 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Previous
                  </Link>
                )}

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show current page and some pages around it
                  let pageNum = i + 1;
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 3 + i;
                    }
                    if (currentPage > totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    }
                  }
                  return (
                    <Link
                      key={pageNum}
                      href={`?page=${pageNum}${searchQuery ? `&search=${searchQuery}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`}
                      className={`inline-flex items-center justify-center h-10 w-10 rounded-md border text-sm font-medium 
                        ${
                          currentPage === pageNum
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-input bg-background hover:bg-muted"
                        }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}

                {currentPage < totalPages && (
                  <Link
                    href={`?page=${currentPage + 1}${searchQuery ? `&search=${searchQuery}` : ""}${statusFilter ? `&status=${statusFilter}` : ""}`}
                    className="inline-flex items-center justify-center h-10 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
                  >
                    Next
                  </Link>
                )}
              </nav>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground mt-2">
            Showing {orders.length} of {totalOrders} orders
          </div>
        </>
      )}
    </div>
  );
}
