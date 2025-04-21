// app/(public)/_components/(section-3)/types.ts

// Properties needed for the visual card display and basic identification
export interface BaseProductProps {
  id: string; // <<< ADDED ID
  name: string;
  rating: number;
  image?: string;
}

// Specific props for regular priced items
export interface RegularProductProps extends BaseProductProps {
  price: string; // Expecting string for display consistency
  originalPrice?: never; // Ensure these are not present
  salePrice?: never; // Ensure these are not present
}

// Specific props for sale items
export interface SaleProductProps extends BaseProductProps {
  originalPrice: string; // Expecting string
  salePrice: string; // Expecting string
  price?: never; // Ensure this is not present
}

// Union type for the props accepted by ProductCard
export type ProductCardProps = RegularProductProps | SaleProductProps;

// Props for the slide container component
export interface ProductSlideProps {
  // products array can contain actual product data or placeholders
  products: (StoreItem | { isEmpty: true })[];
  isMobile: boolean;
  activeTab: number;
  tabName: string;
  userRole: string; // Pass down user role for conditional rendering in Card
}

// Type for the raw items coming directly from the Zustand stores
// Used internally before converting to ProductCardProps for display
export interface StoreItem {
  id: string;
  name: string;
  price?: number; // For New Arrivals, Best Sellers (optional for type safety)
  originalPrice?: number; // For On Sale (optional for type safety)
  salePrice?: number; // For On Sale (optional for type safety)
  rating: number;
  imageUrl: string;
  // Include any other fields needed for edit/delete logic if not covered above
  // e.g., userId (though preferably handled server-side)
}

// Type defining the structure for content fetched/managed by hooks like useNewArrivalsContent
export type Viewport = "mobile" | "desktop";

// Each viewport holds an array of slides (pages),
// each slide holds an array of StoreItems or empty placeholders
export type TabContent = {
  [key in Viewport]: (StoreItem | { isEmpty: true })[][];
};

// Define a specific type for the empty slot marker
export type EmptySlot = { isEmpty: true };
