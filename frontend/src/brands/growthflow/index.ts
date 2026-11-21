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
    primary: '#2D3A1E',          // Deep luxury olive
    primaryHover: '#3D4F29',     // Slightly lighter olive on hover
    accent: '#D4AF37',           // Premium warm gold
    accentHover: '#E5C048',      // Bright gold
    bg: '#FAFAF8',               // Clean, warm premium white
    surface: '#FFFFFF',          // Pure crisp white cards
    text: '#111827',             // Rich premium black
    muted: '#6B7280',            // Subtle grey
    border: '#E5E7EB',           // Crisp divider border
    sidebarBg: '#1E2B16',        // Rich dark olive green for sidebars
    sidebarBorder: '#2E3E24',     // Subtly lighter olive border
    sidebarActiveBg: 'linear-gradient(135deg, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.10) 100%)', // Gold active highlight
    sidebarText: '#F9FAFB',      // Crisp light text on dark olive
    sidebarGold: '#D4AF37',      // Metallic champagne gold
    radius: '1rem',
    shadow: '0 4px 20px -2px rgba(45, 58, 30, 0.08), 0 2px 6px -1px rgba(212, 175, 55, 0.06)',
    fontHeading: "'Plus Jakarta Sans', sans-serif",
    fontBody: "'Inter', sans-serif",
  },
};
