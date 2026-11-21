import { env } from '../config/env.js';

export function getAppBrand(): 'reachflow' | 'growthflow' {
  return env.APP_BRAND;
}

/**
 * Returns SQL condition scoping queries to the current brand.
 * 
 * Examples:
 * - scopeToBrand('o') => "o.brand = 'growthflow'"
 * - scopeToBrand('camp.org_id') => "camp.org_id IN (SELECT id FROM organizations WHERE brand = 'growthflow')"
 * - scopeToBrand('messages.org_id', 'reachflow') => "messages.org_id IN (SELECT id FROM organizations WHERE brand = 'reachflow')"
 */
export function scopeToBrand(targetColOrAlias: string = 'org_id', brand: string = env.APP_BRAND): string {
  // Validate brand against allowed literals to prevent any SQL injection
  const safeBrand = brand === 'reachflow' ? 'reachflow' : 'growthflow';

  if (targetColOrAlias === 'o' || targetColOrAlias === 'organizations') {
    return `${targetColOrAlias}.brand = '${safeBrand}'`;
  }

  return `${targetColOrAlias} IN (SELECT id FROM organizations WHERE brand = '${safeBrand}')`;
}
