// EmptySlotCard.tsx
import React from "react";
import { Plus } from "lucide-react";

interface EmptySlotCardProps {
  onAdd: () => void;
  tabName: string;
}

export const EmptySlotCard: React.FC<EmptySlotCardProps> = ({
  onAdd,
  tabName,
}) => {
  return (
    <div
      onClick={onAdd}
      className="w-full sm:flex-1 p-4 bg-card rounded-lg border-2 border-dashed 
                border-border hover:border-primary hover:shadow-md transition-all 
                cursor-pointer group flex flex-col items-center justify-center min-h-[300px]"
    >
      <Plus
        className="w-12 h-12 text-muted-foreground group-hover:text-primary 
                  transition-colors mb-2"
      />
      <span
        className="text-sm text-muted-foreground group-hover:text-primary 
                      transition-colors font-medium"
      >
        {`Add ${tabName}`}
      </span>
    </div>
  );
};
