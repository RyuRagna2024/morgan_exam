import Image from "next/image";
import { cn } from "@/lib/utils";
import avatarPlaceholder from "../assets/avatar-placeholder.png";

interface UserAvatarProps {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  avatarUrl,
  size = 48,
  className,
}: UserAvatarProps) {
  return (
    <Image
      src={avatarUrl || avatarPlaceholder}
      alt="User avatar"
      width={size}
      height={size}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className,
      )}
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    />
  );
}
