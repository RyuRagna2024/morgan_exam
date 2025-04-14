"use client";
import React from "react";
import { formatDistance } from "date-fns";
import { OrderWithItems } from "../types";
import { OrderStatus } from "@prisma/client";

interface OrderDetailModalProps {
  order: OrderWithItems | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  // Format currency to South African Rand
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount);
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Order Details
              </h2>
              <p className="text-gray-500">
                Order ID: <span className="font-medium">{order.id}</span>
              </p>
              <p className="text-gray-500">
                Reference:{" "}
                <span className="font-medium">
                  {order.referenceNumber || "N/A"}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistance(new Date(order.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </p>
              <span
                className={`mt-2 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
                  order.status,
                )}`}
              >
                {order.status}
              </span>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">
                Customer Information
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Name:</span> {order.firstName}{" "}
                  {order.lastName}
                </p>
                {order.companyName && (
                  <p className="text-gray-700">
                    <span className="font-medium">Company:</span>{" "}
                    {order.companyName}
                  </p>
                )}
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span> {order.email}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Phone:</span> {order.phone}
                </p>
              </div>
            </div>

            {/* Shipping/Collection Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">
                Shipping Information
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Method:</span>{" "}
                  {order.methodOfCollection}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Branch:</span>{" "}
                  {order.captivityBranch}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Address:</span>{" "}
                  {order.streetAddress}
                  {order.apartmentSuite && `, ${order.apartmentSuite}`}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">City:</span> {order.townCity},{" "}
                  {order.province} {order.postcode}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Country:</span>{" "}
                  {order.countryRegion}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">
                Order Summary
              </h3>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Items:</span>{" "}
                  {order.orderItems.length}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Total Amount:</span>{" "}
                  <span className="text-lg font-bold">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </p>
                {order.salesRep && (
                  <p className="text-gray-700">
                    <span className="font-medium">Sales Rep:</span>{" "}
                    {order.salesRep}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                        {getProductName(item)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-right text-sm font-bold text-gray-900"
                    >
                      Total:
                    </td>
                    <td className="px-6 py-4 text-right text-base font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Additional Notes */}
          {order.orderNotes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                Order Notes
              </h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                {order.orderNotes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
