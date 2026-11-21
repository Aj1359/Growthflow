import { BrandConfig } from '../types';

export const growthflowBrand: BrandConfig = {
  id: 'growthflow',
  name: 'GrowthFlow',
  tagline: 'Grow your customers on WhatsApp',
  pageTitle: 'GrowthFlow - Grow your customers on WhatsApp',
  favicon: '/growthflow-logo.png',
  logoSrc: '/growthflow-logo.png',
  loginHeading: 'GrowthFlow',
  loginSubheading: 'Grow your customers on WhatsApp with broadcast campaigns, automation, and real-time replies.',
  sidebarItems: [
    { to: '/dashboard', label: 'Dashboard', icon: 'Home' },
    { to: '/customers', label: 'Contacts', icon: 'Users' },
    { to: '/posts', label: 'Templates', icon: 'FileText' },
    { to: '/posts?tab=send', label: 'Send', icon: 'Send' },
    { to: '/replies', label: 'Replies', icon: 'MessageSquare' },
    { to: '/dashboard?tab=reports', label: 'Reports', icon: 'BarChart2' },
    { to: '/profile', label: 'Settings', icon: 'Settings' },
  ],
  tokens: {
    primary: '#0F766E',
    primaryHover: '#0D9488',
    accent: '#F59E0B',
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A',
    muted: '#64748B',
    border: '#E2E8F0',
    sidebarBg: '#0C3C37',
    sidebarBorder: '#0F443E',
    sidebarActiveBg: 'rgba(255, 255, 255, 0.14)',
    sidebarText: '#FFFFFF',
    radius: '1rem', // rounded-2xl / rounded-xl per spec
    shadow: '0 4px 20px -2px rgba(15, 118, 110, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
    fontHeading: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
};
