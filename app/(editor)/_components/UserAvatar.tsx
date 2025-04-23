// app/(editor)/_components/UserAvatar.tsx

import { cn } from "@/lib/utils";
import Image, { StaticImageData } from "next/image";

// Define or import a placeholder image
import avatarPlaceholder from "@/app/(public)/_assets/avatar-placeholder.png"; // Adjust path if placeholder is elsewhere

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  avatarUrl,
  size, // Use the prop directly
  className,
}: UserAvatarProps) {
  const imageSize = size ?? 48; // Default to 48 if size is not provided

  return (
    <Image
      // Use avatarUrl if available, otherwise fallback to placeholder
      src={avatarUrl || avatarPlaceholder}
      alt="User avatar"
      width={imageSize} // Use calculated size
      height={imageSize} // Use calculated size
      // Use placeholder only if avatarUrl is potentially null/undefined
      placeholder={!avatarUrl ? "blur" : undefined}
      blurDataURL={!avatarUrl ? avatarPlaceholder.blurDataURL : undefined} // Use blur URL from placeholder if needed
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className,
      )}
    />
  );
}
