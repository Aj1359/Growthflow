import { BrandConfig, BrandId } from './types';
import { reachflowBrand } from './reachflow';
import { growthflowBrand } from './growthflow';

const brands: Record<BrandId, BrandConfig> = {
  reachflow: reachflowBrand,
  growthflow: growthflowBrand,
};

// Resolve brand from VITE_BRAND (defaults to 'growthflow')
const activeBrandId = (import.meta.env.VITE_BRAND || 'growthflow').toLowerCase() as BrandId;
export const currentBrand: BrandConfig = brands[activeBrandId] || growthflowBrand;

/**
 * Injects CSS variables onto :root at startup to configure brand tokens.
 */
export function applyBrandTheme(brand: BrandConfig = currentBrand): void {
  const root = document.documentElement;
  const { tokens } = brand;

  root.style.setProperty('--color-primary', tokens.primary);
  root.style.setProperty('--color-primary-hover', tokens.primaryHover);
  root.style.setProperty('--color-accent', tokens.accent);
  root.style.setProperty('--color-accent-hover', tokens.accentHover || tokens.accent);
  root.style.setProperty('--color-bg', tokens.bg);
  root.style.setProperty('--color-surface', tokens.surface);
  root.style.setProperty('--color-text', tokens.text);
  root.style.setProperty('--color-muted', tokens.muted);
  root.style.setProperty('--color-border', tokens.border);
  root.style.setProperty('--sidebar-bg', tokens.sidebarBg);
  root.style.setProperty('--sidebar-border', tokens.sidebarBorder);
  root.style.setProperty('--sidebar-active-bg', tokens.sidebarActiveBg);
  root.style.setProperty('--sidebar-text', tokens.sidebarText);
  root.style.setProperty('--sidebar-gold', tokens.sidebarGold || '#D4AF37');
  root.style.setProperty('--radius', tokens.radius);
  root.style.setProperty('--shadow-custom', tokens.shadow);
  root.style.setProperty('--font-heading', tokens.fontHeading);
  root.style.setProperty('--font-body', tokens.fontBody);

  // Update dynamic page title
  document.title = brand.pageTitle;

  // Update favicon if link element exists
  const favicon = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  if (favicon) {
    favicon.href = brand.favicon;
  }
}

export * from './types';
export { GrowthFlowLogo } from './growthflow/Logo';
