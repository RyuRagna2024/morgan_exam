// types.ts
export interface BaseProductProps {
  name: string;
  rating: number;
  image?: string;
}

export interface RegularProductProps extends BaseProductProps {
  price: string;
  originalPrice?: never;
  salePrice?: never;
}

export interface SaleProductProps extends BaseProductProps {
  originalPrice: string;
  salePrice: string;
  price?: never;
}

export type ProductCardProps = RegularProductProps | SaleProductProps;

export interface ProductSlideProps {
  products: ProductCardProps[];
  isMobile: boolean;
  activeTab: number;
  tabName: string;
}

export type TabContent = {
  [key: number]: ProductCardProps[][];
};
