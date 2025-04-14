import React from "react";
import { CreateProductForm } from "./ProductForm";

const CreateProductPage = () => {
  return (
    <div className="flex-1 w-full h-full">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Product</h1>
          <p className="text-muted-foreground">
            Add a new product to your catalog
          </p>
        </div>
        <CreateProductForm />
      </div>
    </div>
  );
};

export default CreateProductPage;
