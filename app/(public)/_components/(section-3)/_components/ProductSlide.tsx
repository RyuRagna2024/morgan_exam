// app/(public)/_components/(section-3)/_components/ProductSlide.tsx
import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { UploadModal as NewArrivalCreateModal } from "./(new-arrivals)/UploadModal";
import { BestSellerUploadModal as BestSellerCreateModal } from "./(best-seller)/BestSellerUploadModal";
import { OnSaleUploadModal as OnSaleCreateModal } from "./(on-sale)/OnSaleModal";
import { EmptySlotCard } from "./EmptySlotCard";
import {
  StoreItem,
  ProductCardProps as ImportedProductCardProps, // Use the union type alias
  RegularProductProps, // Import for explicit return type
  SaleProductProps, // Import for explicit return type
  ProductSlideProps as BaseProductSlideProps, // Base props for this component
  EmptySlot, // Type for empty slot marker
} from "../types"; // Adjust path as needed

// --- Import Stores for Actions ---
import useNewArrivalsStore from "../_store/(new-store)/new-arrival-store";
import useBestSellerStore from "../_store/(best-store)/best-seller-store";
import useOnSaleStore from "../_store/(on-sale)/on-sale-store";

// --- Import Modals ---
import ProductUpdateModal from "./ProductUpdateModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { toast } from "sonner"; // Or react-hot-toast

// Extend props type (already includes userRole via BaseProductSlideProps -> types.ts)
interface ProductSlideProps extends BaseProductSlideProps {}

// Helper to convert StoreItem to the ProductCardProps UNION type
const convertToCardProps = (item: StoreItem): ImportedProductCardProps => {
  const baseProps = {
    id: item.id,
    name: item.name,
    rating: item.rating,
    image: item.imageUrl,
  };

  // Check if it's specifically an "On Sale" item structure
  if (
    typeof item.originalPrice === "number" &&
    typeof item.salePrice === "number"
  ) {
    // Explicitly return the SaleProductProps type
    const saleProps: SaleProductProps = {
      ...baseProps,
      originalPrice: item.originalPrice.toString(), // Convert to string for prop type
      salePrice: item.salePrice.toString(), // Convert to string for prop type
    };
    return saleProps;
  }
  // Check if it's specifically a "Regular" item structure
  else if (typeof item.price === "number") {
    // Explicitly return the RegularProductProps type
    const regularProps: RegularProductProps = {
      ...baseProps,
      price: item.price.toString(), // Convert to string for prop type
    };
    return regularProps;
  }

  // Fallback case
  console.error("Could not determine card type for item, defaulting:", item);
  const fallbackProps: RegularProductProps = {
    ...baseProps,
    price: "0.00", // Provide a default string value
  };
  return fallbackProps;
};

export const ProductSlide: React.FC<ProductSlideProps> = ({
  products, // Array of (StoreItem | EmptySlot)
  isMobile,
  activeTab,
  tabName,
  userRole, // Receive userRole
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<StoreItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<StoreItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // Loading state for actions

  // --- Add Logging ---
  console.log(
    `[ProductSlide] Rendering Tab: "${tabName}" (ID: ${activeTab}), Role: ${userRole}`,
  );
  console.log(
    "[ProductSlide] Raw 'products' prop for this slide:",
    JSON.stringify(products),
  ); // Stringify for better inspection
  // --- End Logging ---

  // --- Get store actions ---
  const { createNewArrival, updateNewArrival, deleteNewArrival } =
    useNewArrivalsStore();
  const { createBestSeller, updateBestSeller, deleteBestSeller } =
    useBestSellerStore();
  const { createOnSaleItem, updateOnSaleItem, deleteOnSaleItem } =
    useOnSaleStore();

  // --- Modal Open Handlers ---
  const handleOpenCreateModal = () => setIsCreateModalOpen(true);
  const handleOpenEditModal = (item: StoreItem) => {
    console.log("[ProductSlide] Opening edit modal for:", item); // Log edit click
    setItemToEdit(item);
    setIsUpdateModalOpen(true);
  };
  const handleOpenDeleteModal = (item: StoreItem) => {
    console.log("[ProductSlide] Opening delete modal for:", item); // Log delete click
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  // --- Action Handlers (Delete, Update, Create) ---
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    console.log(`[ProductSlide] Confirming delete for ID: ${itemToDelete.id}`);
    setIsProcessing(true);
    let success = false;
    try {
      switch (activeTab) {
        case 0:
          success = await deleteNewArrival(itemToDelete.id);
          break;
        case 1:
          success = await deleteBestSeller(itemToDelete.id);
          break;
        case 2:
          success = await deleteOnSaleItem(itemToDelete.id);
          break;
      }
      if (success) {
        toast.success(`"${itemToDelete.name}" deleted successfully.`);
        setIsDeleteModalOpen(false);
        setItemToDelete(null); // Close and clear on success
      } else {
        // Error should be set in store, toast might be redundant but okay
        toast.error(`Failed to delete "${itemToDelete.name}".`);
      }
    } catch (err) {
      toast.error("An error occurred during deletion.");
      console.error("Deletion error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateSubmit = async (
    id: string,
    formData: FormData,
  ): Promise<boolean> => {
    console.log(`[ProductSlide] Submitting update for ID: ${id}`, formData);
    setIsProcessing(true);
    let success = false;
    try {
      switch (activeTab) {
        case 0:
          success = await updateNewArrival(id, formData);
          break;
        case 1:
          success = await updateBestSeller(id, formData);
          break;
        case 2:
          success = await updateOnSaleItem(id, formData);
          break;
      }
      if (success) {
        toast.success("Item updated successfully.");
        setIsUpdateModalOpen(false);
        setItemToEdit(null); // Close and clear on success
      } else {
        toast.error("Failed to update item."); // Store hook likely sets specific error
      }
    } catch (err) {
      toast.error("An unexpected error occurred during update.");
      console.error("Update error:", err);
    } finally {
      setIsProcessing(false);
    }
    return success; // Return success status
  };

  const handleCreateSubmit = async (formData: FormData): Promise<boolean> => {
    console.log(
      `[ProductSlide] Submitting create for Tab: ${tabName}`,
      formData,
    );
    setIsProcessing(true);
    let success = false;
    try {
      switch (activeTab) {
        case 0:
          success = await createNewArrival(formData);
          break;
        case 1:
          success = await createBestSeller(formData);
          break;
        case 2:
          success = await createOnSaleItem(formData);
          break;
      }
      if (success) {
        toast.success(`${tabName} item created successfully.`);
        setIsCreateModalOpen(false); // Close modal on success
      } else {
        toast.error(`Failed to create ${tabName} item.`); // Store hook likely sets specific error
      }
    } catch (err) {
      toast.error(`An unexpected error occurred creating ${tabName} item.`);
      console.error("Create error:", err);
    } finally {
      setIsProcessing(false);
    }
    return success;
  };

  // --- Render Logic ---
  if (!products) {
    console.log("[ProductSlide] No products array provided, rendering null.");
    return null;
  }

  const displayProducts = isMobile ? products.slice(0, 2) : products;
  console.log(
    "[ProductSlide] 'displayProducts' for render:",
    JSON.stringify(displayProducts),
  ); // Log what will be mapped

  const CreateModalComponent =
    activeTab === 0
      ? NewArrivalCreateModal
      : activeTab === 1
        ? BestSellerCreateModal
        : OnSaleCreateModal;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {displayProducts.map((item, idx) => {
          // --- Add detailed logging inside map ---
          console.log(
            `[ProductSlide] Mapping index ${idx}:`,
            JSON.stringify(item),
          );
          // --- End Logging ---

          // Check if it's an empty slot marker
          if (
            item &&
            typeof item === "object" &&
            "isEmpty" in item &&
            item.isEmpty
          ) {
            console.log(
              `[ProductSlide] Rendering EmptySlotCard at index ${idx}`,
            );
            return (
              <EmptySlotCard
                key={`empty-${idx}`}
                onAdd={handleOpenCreateModal}
                tabName={tabName}
              />
            );
            // Check if it's a valid StoreItem with an id
          } else if (item && typeof item === "object" && "id" in item) {
            console.log(
              `[ProductSlide] Attempting to convert item ID ${item.id} at index ${idx}`,
            );
            try {
              // Convert StoreItem to props suitable for ProductCard
              const cardProps = convertToCardProps(item);
              console.log(
                `[ProductSlide] Rendering ProductCard for ID ${item.id} with props:`,
                JSON.stringify(cardProps),
              );
              return (
                <ProductCard
                  key={item.id} // Use actual item ID
                  {...cardProps} // Pass the correctly typed props object
                  userRole={userRole} // Pass role
                  // Pass handlers, wrapping item in the call
                  onEdit={() => handleOpenEditModal(item)}
                  onDelete={() => handleOpenDeleteModal(item)}
                />
              );
            } catch (conversionError) {
              // Log error if conversion fails
              console.error(
                `[ProductSlide] Error converting item at index ${idx}:`,
                item,
                conversionError,
              );
              return (
                <div
                  key={`error-${idx}`}
                  className="text-red-500 p-2 border border-red-500 rounded text-xs break-words"
                >
                  Error rendering item {item.id || `at index ${idx}`}. Check
                  console.
                </div>
              ); // Render error indicator
            }
          }
          // If item is somehow invalid (null/undefined/wrong type)
          console.warn(
            `[ProductSlide] Invalid item structure at index ${idx}, skipping render:`,
            item,
          );
          return null; // Skip rendering invalid items
        })}
      </div>

      {/* Create Modal */}
      <CreateModalComponent
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        // Pass create handler if the specific modal needs it,
        // otherwise assume modal handles its own submission internally
        // onSubmit={handleCreateSubmit} // Example if passing handler
      />

      {/* Update Modal */}
      {itemToEdit && (
        <ProductUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setItemToEdit(null);
          }} // Clear item on close
          itemData={itemToEdit}
          onSubmit={handleUpdateSubmit} // Pass the submit handler
          isLoading={isProcessing}
          tabName={tabName} // Pass tab name for context/title
        />
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
          }} // Clear item on close
          onConfirm={handleConfirmDelete}
          itemName={itemToDelete.name}
          isLoading={isProcessing}
        />
      )}
    </>
  );
};
