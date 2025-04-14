"use server";

import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";

/**
 * Types for the response
 */
export interface GetCustomerOrdersResponse {
  success: boolean;
  message?: string;
  orders?: any[];
  totalOrders?: number;
}

/**
 * Server action to get all orders for the authenticated customer
 * including a count of their total orders
 */
export async function getCustomerOrders(): Promise<GetCustomerOrdersResponse> {
  try {
    // Validate user is authenticated
    const { user, session } = await validateRequest();
    if (!user || !session || user.role !== "CUSTOMER") {
      return {
        success: false,
        message: "You must be logged in as a customer to view your orders",
      };
    }

    // Get all orders for the user
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
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
      orderBy: {
        createdAt: "desc", // Most recent orders first
      },
    });

    // Count the total number of orders
    const totalOrders = orders.length;

    return {
      success: true,
      orders,
      totalOrders,
    };
  } catch (error) {
    console.error("Get customer orders error:", error);
    return {
      success: false,
      message: "Failed to retrieve your orders",
    };
  }
}

/**
 * Server action to get just the count of orders for the authenticated customer
 */
export async function getCustomerOrderCount(): Promise<GetCustomerOrdersResponse> {
  try {
    // Validate user is authenticated
    const { user, session } = await validateRequest();
    if (!user || !session || user.role !== "CUSTOMER") {
      return {
        success: false,
        message: "You must be logged in as a customer to view your order count",
      };
    }

    // Count orders (more efficient than fetching all order data)
    const totalOrders = await prisma.order.count({
      where: {
        userId: user.id,
      },
    });

    return {
      success: true,
      totalOrders,
    };
  } catch (error) {
    console.error("Get customer order count error:", error);
    return {
      success: false,
      message: "Failed to retrieve your order count",
    };
  }
}
