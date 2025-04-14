import React from "react";
import OrderTable from "./OrderTable";

const OrderPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        </div>

        <OrderTable />
      </div>
    </div>
  );
};

export default OrderPage;
