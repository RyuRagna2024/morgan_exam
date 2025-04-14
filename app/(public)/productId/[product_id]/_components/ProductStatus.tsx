"use client";

interface ProductStatusProps {
  isLoading: boolean;
  error: string | null;
  productId: string | null;
  isProductFound: boolean;
}

const ProductStatus = ({
  isLoading,
  error,
  productId,
  isProductFound,
}: ProductStatusProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-52 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Product not found
  if (!isProductFound) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <span>Product not found: {productId || "unknown"}</span>
          <div className="mt-2 text-xs">
            <p>Please check the product ID and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  // If none of the above conditions are met, return null
  return null;
};

export default ProductStatus;
