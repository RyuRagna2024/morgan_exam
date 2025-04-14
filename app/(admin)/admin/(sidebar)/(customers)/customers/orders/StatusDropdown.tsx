"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "./fetch-order";
import { OrderStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  let colorClass = "";

  switch (status) {
    case "PENDING":
      colorClass = "bg-yellow-100 text-yellow-800";
      break;
    case "PROCESSING":
      colorClass = "bg-blue-100 text-blue-800";
      break;
    case "SHIPPED":
      colorClass = "bg-indigo-100 text-indigo-800";
      break;
    case "DELIVERED":
      colorClass = "bg-green-100 text-green-800";
      break;
    case "CANCELLED":
      colorClass = "bg-red-100 text-red-800";
      break;
    case "REFUNDED":
      colorClass = "bg-purple-100 text-purple-800";
      break;
    default:
      colorClass = "bg-gray-100 text-gray-800";
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
  onSuccess?: () => void;
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

    if (newStatus === status) return;

    setIsUpdating(true);
    try {
      const result = await updateOrderStatus(orderId, newStatus);

      if (result.success) {
        setStatus(newStatus);
        toast.success(result.message);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order status:", error);
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
        <select
          id={`order-status-${orderId}`}
          value={status}
          onChange={handleStatusChange}
          disabled={isUpdating}
          className="h-9 w-[150px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          aria-label={`Update status for order ${orderId}`}
        >
          <option value="PENDING">PENDING</option>
          <option value="PROCESSING">PROCESSING</option>
          <option value="SHIPPED">SHIPPED</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="REFUNDED">REFUNDED</option>
        </select>
      </div>
      <div className="ml-2">
        <StatusBadge status={status} />
      </div>
    </div>
  );
}
