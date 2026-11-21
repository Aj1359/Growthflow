export type BrandId = 'reachflow' | 'growthflow';

export interface SidebarItem {
  to: string;
  label: string;
  icon: string;
}

export interface BrandTokens {
  primary: string;
  primaryHover: string;
  accent: string;
  bg: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
  sidebarBg: string;
  sidebarBorder: string;
  sidebarActiveBg: string;
  sidebarText: string;
  radius: string;
  shadow: string;
  fontHeading: string;
  fontBody: string;
}

export interface BrandConfig {
  id: BrandId;
  name: string;
  tagline: string;
  pageTitle: string;
  favicon: string;
  logoSrc: string;
  loginHeading: string;
  loginSubheading: string;
  sidebarItems: SidebarItem[];
  tokens: BrandTokens;
}
