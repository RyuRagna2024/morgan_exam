"use client";

import Image from "next/image";

interface ProductImageProps {
  imageUrl: string;
  productName: string;
}

const ProductImage = ({ imageUrl, productName }: ProductImageProps) => {
  return (
    <div className="bg-gray-50 rounded overflow-hidden relative aspect-square mb-4">
      <Image
        src={imageUrl}
        alt={productName}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        className="object-contain"
      />
    </div>
  );
};

export default ProductImage;
