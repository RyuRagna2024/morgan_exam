"use client";

import { useState, useEffect, useCallback } from "react";
import { OrderStatus } from "@prisma/client";
import { fetchOrders } from "./fetch-order";

interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

interface UseOrdersProps {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export function useOrders({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  sortBy = "createdAt",
  sortDirection = "desc",
}: UseOrdersProps = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalOrders / limit);

  // Use useCallback to memoize the loadOrders function
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const dateFrom =
        status === "today"
          ? new Date(new Date().setHours(0, 0, 0, 0))
          : undefined;
      const dateTo = status === "today" ? new Date() : undefined;

      // Convert status strings to OrderStatus enum values or undefined if it's a special filter
      const statusFilter = ["today", ""].includes(status)
        ? undefined
        : (status as OrderStatus);

      const response = await fetchOrders({
        page,
        limit,
        search,
        status: statusFilter,
        dateFrom,
        dateTo,
        sortBy,
        sortDirection,
      });

      if (response.success) {
        setOrders(response.orders || []);
        setTotalOrders(response.total || 0);
      } else {
        setError(response.message || "Failed to fetch orders");
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders");
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, status, sortBy, sortDirection]);

  // Load orders initially and when dependencies change
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    totalOrders,
    totalPages,
    isLoading,
    error,
    refetch: loadOrders,
  };
}
