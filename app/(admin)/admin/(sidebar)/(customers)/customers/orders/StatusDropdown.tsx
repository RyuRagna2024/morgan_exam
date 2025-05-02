"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "./fetch-order"; // Ensure correct path
import { OrderStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: string;
}

// *** ADDED DARK MODE STYLES ***
const StatusBadge = ({ status }: StatusBadgeProps) => {
  let colorClass = "";

  switch (status) {
    case "PENDING":
      colorClass =
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      break;
    case "PROCESSING":
      colorClass =
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      break;
    case "SHIPPED":
      colorClass =
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      break;
    case "DELIVERED":
      colorClass =
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      break;
    case "CANCELLED":
      colorClass = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      break;
    case "REFUNDED":
      colorClass =
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      break;
    default:
      colorClass =
        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }

  return (
    <span
      className={`${colorClass} inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`}
    >
      {status}
    </span>
  );
};

interface StatusDropdownProps {
  orderId: string;
  currentStatus: OrderStatus;
  onSuccess?: () => void; // Callback for successful update
}

export default function StatusDropdown({
  orderId,
  currentStatus,
  onSuccess,
}: StatusDropdownProps) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const newStatus = e.target.value as OrderStatus;

    if (newStatus === status) return; // No change

    setIsUpdating(true);
    const optimisticStatus = status; // Store current status in case of failure
    setStatus(newStatus); // Optimistically update UI

    try {
      const result = await updateOrderStatus(orderId, newStatus);

      if (result.success) {
        toast.success(result.message || "Order status updated successfully.");
        if (onSuccess) onSuccess(); // Trigger refetch or other actions
      } else {
        toast.error(result.message || "Failed to update order status.");
        setStatus(optimisticStatus); // Revert optimistic update on failure
      }
    } catch (error) {
      toast.error("An error occurred while updating order status.");
      console.error("Error updating order status:", error);
      setStatus(optimisticStatus); // Revert optimistic update on error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center">
      <div className="relative">
        <label htmlFor={`order-status-${orderId}`} className="sr-only">
          Update order status
        </label>
        {/* *** ADDED DARK MODE STYLES *** */}
        <select
          id={`order-status-${orderId}`}
          value={status}
          onChange={handleStatusChange}
          disabled={isUpdating}
          // Added appearance-none to allow custom arrow, and dark mode styles
          className={`h-9 w-[150px] appearance-none rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1 text-sm text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring dark:focus:ring-offset-gray-800 ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
          aria-label={`Update status for order ${orderId.slice(0, 8)}`}
        >
          <option value="PENDING">PENDING</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
          <svg
            className="h-4 w-4 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {/* Badge is already styled for dark mode */}
      <div className="ml-2">
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

