"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { OrderStatus } from "@prisma/client";

/**
 * Interface for order filter parameters
 */
export interface OrderFilters {
  status?: OrderStatus;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

/**
 * Response type for fetching orders
 */
export interface FetchOrdersResponse {
  success: boolean;
  orders?: any[];
  total?: number;
  message?: string;
}

/**
 * Response type for fetching a single order
 */
export interface FetchOrderResponse {
  success: boolean;
  order?: any;
  message?: string;
}

/**
 * Function to fetch all orders with optional filtering (admin only)
 */
export async function fetchOrders(
  filters: OrderFilters = {},
): Promise<FetchOrdersResponse> {
  try {
    // Validate user is authenticated as admin
    const { user, session } = await validateRequest();
    if (!user || !session || !["ADMIN", "SUPERADMIN"].includes(user.role)) {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    // Set default pagination values
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {};

    // Filter by status if provided
    if (filters.status) {
      where.status = filters.status;
    }

    // Filter by date range if provided
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    // Search in relevant fields if search term provided
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { companyName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { referenceNumber: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Determine sort options
    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortDirection || "desc";
    } else {
      orderBy.createdAt = "desc"; // Default sort
    }

    // Count total matching records for pagination
    const total = await prisma.order.count({ where });

    // Fetch orders with pagination and related data
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
          },
        },
        orderItems: {
          include: {
            variation: {
              include: {
                product: {
                  select: {
                    id: true,
                    productName: true,
                    productImgUrl: true,
                  },
                },
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy,
    });

    return {
      success: true,
      orders,
      total,
    };
  } catch (error) {
    console.error("Fetch orders error:", error);
    return {
      success: false,
      message: "Failed to fetch orders",
    };
  }
}

/**
 * Function to fetch a single order by ID (admin only)
 */
export async function fetchOrderById(
  orderId: string,
): Promise<FetchOrderResponse> {
  try {
    // Validate user is authenticated as admin
    const { user, session } = await validateRequest();
    if (!user || !session || !["ADMIN", "SUPERADMIN"].includes(user.role)) {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    // Get the order with items and related data
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            phoneNumber: true,
          },
        },
        orderItems: {
          include: {
            variation: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Fetch order by ID error:", error);
    return {
      success: false,
      message: "Failed to retrieve order details",
    };
  }
}

/**
 * Function to update order status (admin only)
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate user is authenticated as admin
    const { user, session } = await validateRequest();
    if (!user || !session || !["ADMIN", "SUPERADMIN"].includes(user.role)) {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return {
        success: false,
        message: "Order not found",
      };
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return {
      success: true,
      message: `Order status updated to ${status}`,
    };
  } catch (error) {
    console.error("Update order status error:", error);
    return {
      success: false,
      message: "Failed to update order status",
    };
  }
}
/**
 * Function to get order statistics for admin dashboard
 */
export async function getOrderStatistics(): Promise<{
  success: boolean;
  stats?: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    recentOrders: any[];
  };
  message?: string;
}> {
  try {
    // Validate user is authenticated as admin
    const { user, session } = await validateRequest();
    if (!user || !session || !["ADMIN", "SUPERADMIN"].includes(user.role)) {
      return {
        success: false,
        message: "Unauthorized: Admin access required",
      };
    }

    // Get total orders
    const totalOrders = await prisma.order.count();

    // Get total revenue
    const revenueResult = await prisma.order.aggregate({
      _sum: {
        totalAmount: true,
      },
    });
    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // Get orders by status
    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" },
    });

    const processingOrders = await prisma.order.count({
      where: { status: "PROCESSING" },
    });

    const shippedOrders = await prisma.order.count({
      where: { status: "SHIPPED" },
    });

    const deliveredOrders = await prisma.order.count({
      where: { status: "DELIVERED" },
    });

    const cancelledOrders = await prisma.order.count({
      where: { status: "CANCELLED" },
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            displayName: true,
          },
        },
      },
    });

    return {
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        recentOrders,
      },
    };
  } catch (error) {
    console.error("Get order statistics error:", error);
    return {
      success: false,
      message: "Failed to retrieve order statistics",
    };
  }
}
