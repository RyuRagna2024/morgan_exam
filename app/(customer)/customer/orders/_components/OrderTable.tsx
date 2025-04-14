"use client";
import React, { useState } from "react";
import { formatDistance } from "date-fns";
import { OrderStatus } from "@prisma/client";
import { OrderTableProps, OrderWithItems } from "../types";
import OrderDetailModal from "./OrderDetailModal";

const OrderTable: React.FC<OrderTableProps> = ({ orders }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to get status badge color
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case OrderStatus.PROCESSING:
        return "bg-blue-100 text-blue-800";
      case OrderStatus.SHIPPED:
        return "bg-indigo-100 text-indigo-800";
      case OrderStatus.DELIVERED:
        return "bg-green-100 text-green-800";
      case OrderStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      case OrderStatus.REFUNDED:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format currency to South African Rand
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

  // Helper function to get product name correctly
  const getProductName = (item: any) => {
    if (item?.variation?.product?.productName) {
      return item.variation.product.productName;
    } else if (item?.variation?.productName) {
      return item.variation.productName;
    } else if (item?.variation?.product?.name) {
      return item.variation.product.name;
    } else if (item?.variation?.name) {
      return item.variation.name;
    } else {
      return "Unnamed Product";
    }
  };

  // Handle view details click
  const handleViewDetails = (order: OrderWithItems) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Filter orders based on search, status, and date
  const filteredOrders = orders.filter((order) => {
    // Filter by search query (including product names)
    const searchMatch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.referenceNumber
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // Search in order items for product name
      order.orderItems.some((item) => {
        const productName = getProductName(item);
        return productName.toLowerCase().includes(searchQuery.toLowerCase());
      });

    // Filter by status
    const statusMatch = statusFilter === "ALL" || order.status === statusFilter;

    // Filter by date (single date)
    const dateMatch =
      !startDate ||
      new Date(order.createdAt).toDateString() ===
        new Date(startDate).toDateString();

    return searchMatch && statusMatch && dateMatch;
  });

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium">No orders found</h3>
        <p className="mt-2 text-gray-500">
          You haven&apos;t placed any orders yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative w-full md:w-1/3">
          <label htmlFor="order-search" className="sr-only">
            Search orders
          </label>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            id="order-search"
            type="text"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="w-full md:w-1/3">
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            aria-label="Filter orders by status"
            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as OrderStatus | "ALL")
            }
          >
            <option value="ALL">Filter by status</option>
            {Object.values(OrderStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Date filter */}
        <div className="w-full md:w-1/3">
          <label htmlFor="date-filter" className="sr-only">
            Pick a date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              id="date-filter"
              type="date"
              aria-label="Filter orders by date"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Pick a date range"
            />
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">No orders found</h3>
          <p className="mt-2 text-gray-500">
            Try adjusting your filters to find what you&apos;re looking for.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Order ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Items
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
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400">
                      {formatDistance(new Date(order.createdAt), new Date(), {
                        addSuffix: true,
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">
                    <div className="max-w-xs">
                      {order.orderItems.map((item, index) => (
                        <div key={item.id} className={index > 0 ? "mt-1" : ""}>
                          <span className="font-medium">{item.quantity}×</span>{" "}
                          {getProductName(item)}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="text-indigo-600 hover:text-indigo-900 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default OrderTable;
