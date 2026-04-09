import type { ReactNode } from "react";

export type LayoutNavItem = {
  label: string;
  href: string;
  isActive?: boolean;
};

export type BannerProps = {
  title: string;
  subtitle: string;
  navItems?: LayoutNavItem[];
  heroImageUrl?: string | null;
  heroAction?: ReactNode;
  isLoading?: boolean;
};

export type LayoutNotice = {
  tone: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
  id?: number;
  ends?: string;
};

export type LayoutShellProps = {
  title: string;
  subtitle: string;
  variant?: "default" | "clean";
  navItems?: LayoutNavItem[];
  notices?: LayoutNotice[];
  footerLinks?: FooterLink[] | null;
  announcementStorageScope?: string;
  heroImageUrl?: string | null;
  heroAction?: ReactNode;
  isLoading?: boolean;
  children: ReactNode;
};

export type Speaker = {
  name: string;
  headshot: string;
  institution: string;
};

export type ScheduleSession = {
  id: number;
  time: string;
  title: string;
  room: string;
  track?: string | null;
  status: "live" | "up-next" | "later" | "cancelled";
  speakers?: Speaker[] | null;
  description?: string | null;
};

export type ScheduleDay = {
  isoDate: string;
  label: string;
  date: string;
  focus: string;
  sessions: ScheduleSession[];
};

export type ScheduleProps = {
  day: ScheduleDay;
};

export type HomeTab = "events" | "sponsors";

export type EventItem = {
  id: number;
  title: string;
  sponsor?: string | null;
  time: string;
  speakers?: Speaker[] | null;
  link?: string | null;
  description?: string | null;
  location?: string | null;
  cancelled?: boolean | null;
  slides?: string[] | null;
  event_id: number;
};

export type EventItemUpdate = {
  title?: string;
  sponsor?: string | null;
  time?: string;
  speakers?: Speaker[] | null;
  link?: string | null;
  description?: string | null;
  location?: string | null;
  cancelled?: boolean | null;
  slides?: string[] | null;
};

export type FooterLink = {
  link_title: string;
  href: string;
};

export type EventUpdate = {
  footer_links?: FooterLink[] | null;
  color_scheme?: ThemeColors;
};

export type EventCreate = {
  slug: string;
  title: string;
  hero_image_url?: string | null;
  color_scheme: ThemeColors;
};

export type EventAdminResponse = {
  id: number;
  slug: string;
  title: string;
  hero_image_url?: string | null;
  color_scheme: ThemeColors;
  footer_links?: FooterLink[] | null;
};

export type AdminTab = "events" | "eventItems" | "announcements" | "users";

export type AdminEvent = {
  id: number;
  slug: string;
  title: string;
  status: "live" | "draft" | "archived";
  itemsCount: number;
  footer_links?: FooterLink[] | null;
  color_scheme?: ThemeColors;
};

export type AdminEventItem = {
  id: number;
  event_id: number;
  title: string;
  sponsor?: string | null;
  time: string;
  speakers?: Speaker[] | null;
  link?: string | null;
  description?: string | null;
  location?: string | null;
  cancelled?: boolean | null;
  slides?: string[] | null;
};

export type AdminAnnouncement = {
  id: number;
  title: string;
  body: string;
  tone: "info" | "success" | "warning" | "danger";
  starts: string;
  ends: string;
  event_id: number;
  created_at: string;
};

export type AnnouncementCreate = {
  title: string;
  body: string;
  tone: "info" | "success" | "warning" | "danger";
  starts: string;
  ends: string;
  event_id: number;
};

export type AnnouncementUpdate = {
  title?: string;
  body?: string;
  tone?: "info" | "success" | "warning" | "danger";
  starts?: string;
  ends?: string;
};

export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  heading: string;
  alt_background?: string;
};

export type EventResponse = {
  id: number;
  slug: string;
  title: string;
  hero_image_url?: string | null;
  color_scheme: ThemeColors;
  event_items: EventItem[];
  footer_links?: FooterLink[] | null;
};

export type EventIdsResponse = {
  events: Array<{
    id: number;
    slug: string;
    title: string;
  }>;
};

// Authentication Types

export type UserResponse = {
  id: number;
  username: string;
  full_name: string | null;
  is_active: boolean;
  role: string;
  created_at: string;
};

export type AdminUser = {
  id: number;
  username: string;
  full_name: string | null;
  is_active: boolean;
  role: "admin";
  created_at: string;
};

export type AdminUserCreate = {
  username: string;
  password: string;
  full_name?: string | null;
  is_active?: boolean;
};

export type AdminUserUpdate = {
  username?: string;
  full_name?: string | null;
  is_active?: boolean;
  current_password?: string;
  new_password?: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  username: string;
  user: UserResponse;
};
