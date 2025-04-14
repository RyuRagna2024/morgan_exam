// ProductSlide.tsx
import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { UploadModal } from "./(new-arrivals)/UploadModal";
import { BestSellerUploadModal } from "./(best-seller)/BestSellerUploadModal";
import { EmptySlotCard } from "./EmptySlotCard";
import { ProductSlideProps } from "../types";
import { OnSaleUploadModal } from "./(on-sale)/OnSaleModal";

export const ProductSlide: React.FC<ProductSlideProps> = ({
  products,
  isMobile,
  activeTab,
  tabName,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!products || products.length === 0) {
    return null;
  }

  const displayProducts = isMobile ? products.slice(0, 2) : products;

  const renderModal = () => {
    switch (activeTab) {
      case 0:
        return (
          <UploadModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        );
      case 1:
        return (
          <BestSellerUploadModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        );
      case 2:
        return (
          <OnSaleUploadModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4">
        {displayProducts.map((product, idx) =>
          "isEmpty" in product ? (
            <EmptySlotCard
              key={`empty-${idx}`}
              onAdd={() => setIsModalOpen(true)}
              tabName={tabName}
            />
          ) : (
            <ProductCard key={`product-${idx}`} {...product} />
          ),
        )}
      </div>

      {renderModal()}
    </>
  );
};
