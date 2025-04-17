// app/(manager)/_components/profile/ProfileSection.tsx
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
// Using SessionUser from Manager provider is preferred for consistency
import { SessionUser } from "../../SessionProvider";

interface ProfileSectionProps {
  user: SessionUser | null; // Expect SessionUser from the page (can be null initially)
  onEditClick: () => void; // Function to open the edit modal
}

const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  onEditClick,
}) => {
  const fallbackAvatar = "/assets/avatar-placeholder.png"; // Adjust path if needed
  const fallbackBackground = "/assets/background-placeholder.png"; // Add a placeholder if needed

  if (!user) {
    // Optional: Render a loading state or placeholder if user data isn't ready
    return (
      <div className="mb-8 bg-card p-6 rounded-lg shadow border border-border text-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="mb-8 bg-card p-6 rounded-lg shadow border border-border">
      {/* Background Image Container */}
      <div className="relative h-40 md:h-56 rounded-t-lg overflow-hidden mb-[-60px] md:mb-[-80px]">
        <Image
          src={user.backgroundUrl || fallbackBackground}
          alt="Profile background"
          fill // Use fill instead of layout="fill" in newer Next.js
          style={{ objectFit: "cover" }} // Use style for objectFit
          priority
          key={user.backgroundUrl || "bg-fallback"} // Add key
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Content below background (avatar, name, button) */}
      <div className="relative flex items-end space-x-5 px-4">
        {/* Avatar */}
        <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-card overflow-hidden bg-muted">
          <Image
            src={user.avatarUrl || fallbackAvatar}
            alt={`${user.displayName}'s avatar`}
            fill
            style={{ objectFit: "cover" }}
            key={user.avatarUrl || "avatar-fallback"} // Add key
          />
        </div>
        {/* User Info */}
        <div className="pb-3 flex-1 min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-foreground truncate">
            {user.displayName}
          </h2>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
        {/* Edit Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onEditClick}
          className="mb-3 self-end"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit Profile</span>
        </Button>
      </div>
    </div>
  );
};

export default ProfileSection;
