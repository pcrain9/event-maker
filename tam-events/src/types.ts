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
};

export type LayoutNotice = {
  tone: "info" | "success" | "warning" | "danger";
  title: string;
  message: string;
};

export type LayoutShellProps = {
  title: string;
  subtitle: string;
  navItems?: LayoutNavItem[];
  notices?: LayoutNotice[];
  children: ReactNode;
};

export type Speaker = {
  name: string;
  headshot: string;
  institution: string;
};

export type ScheduleSession = {
  time: string;
  title: string;
  room: string;
  track: string;
  status: "live" | "up-next" | "later";
  speakers?: Speaker[] | null;
  description?: string | null;
};

export type ScheduleDay = {
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

export type AdminTab = "events" | "announcements" | "theme";

export type AdminEvent = {
  id: number;
  title: string;
  dateRange: string;
  location: string;
  status: "live" | "draft" | "archived";
  itemsCount: number;
};

export type AdminEventItem = {
  id: number;
  eventId: number;
  title: string;
  time: string;
  room: string;
  speaker: string;
  status: "live" | "up-next" | "later" | "draft";
};

export type AdminAnnouncement = {
  id: number;
  title: string;
  body: string;
  tone: "info" | "success" | "warning" | "danger";
  starts: string;
  ends: string;
};

export type ThemeColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  alt_background: string;
  text: string;
  title_text: string;
};
