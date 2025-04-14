export interface User {
  id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  streetAddress?: string;
  suburb?: string | null;
  townCity?: string;
  postcode?: string;
  country?: string;
  avatarUrl?: string | null;
  backgroundUrl?: string | null;
  role?: string;
}

export interface CustomerSidebarProps {
  user: User;
}

export interface ProfileSectionProps {
  user: User;
  isCollapsed: boolean;
}

export interface NavigationLinksProps {
  isCollapsed: boolean;
}
