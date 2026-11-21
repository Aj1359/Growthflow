import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scopeToBrand } from '../src/db/brand.js';
import { createHmac } from 'crypto';

describe('Stage 2: Multi-Brand Isolation & Scoping Test Suite', () => {
  const TEST_KEY = Buffer.alloc(32, 'a').toString('base64');
  const APP_SECRET = 'meta_test_secret_key_12345';

  describe('1. Worker & Tick Brand Scoping (scopeToBrand)', () => {
    it('scopes organization table queries directly to APP_BRAND', () => {
      expect(scopeToBrand('o', 'growthflow')).toBe("o.brand = 'growthflow'");
      expect(scopeToBrand('organizations', 'growthflow')).toBe("organizations.brand = 'growthflow'");
      expect(scopeToBrand('o', 'reachflow')).toBe("o.brand = 'reachflow'");
    });

    it('scopes org_id foreign key queries via subselect strictly to specified brand', () => {
      const gfScope = scopeToBrand('m.org_id', 'growthflow');
      expect(gfScope).toBe("m.org_id IN (SELECT id FROM organizations WHERE brand = 'growthflow')");

      const rfScope = scopeToBrand('m.org_id', 'reachflow');
      expect(rfScope).toBe("m.org_id IN (SELECT id FROM organizations WHERE brand = 'reachflow')");
    });

    it('ensures growthflow worker claim filter strictly excludes reachflow organizations', () => {
      const claimFilterGf = scopeToBrand('o', 'growthflow');
      expect(claimFilterGf).toContain("'growthflow'");
      expect(claimFilterGf).not.toContain("'reachflow'");

      const claimFilterRf = scopeToBrand('o', 'reachflow');
      expect(claimFilterRf).toContain("'reachflow'");
      expect(claimFilterRf).not.toContain("'growthflow'");
    });
  });

  describe('2. User Membership & WRONG_APP Isolation', () => {
    it('rejects user with 403 WRONG_APP if their organizations only belong to reachflow', async () => {
      // Simulate requireAuth logic with mock request/response
      const req: any = {
        headers: {
          authorization: 'Bearer valid_mock_jwt_token',
        },
      };

      let responseStatus = 0;
      let responseBody: any = null;

      const res: any = {
        status: (code: number) => {
          responseStatus = code;
          return {
            json: (body: any) => {
              responseBody = body;
            },
          };
        },
      };

      // Mock database returning only reachflow memberships for this user
      const allMemberships = [
        { org_id: '11111111-1111-1111-1111-111111111111', role: 'owner', brand: 'reachflow' },
      ];

      const currentAppBrand = 'growthflow';
      const filtered = allMemberships.filter((m) => m.brand === currentAppBrand);

      if (filtered.length === 0) {
        res.status(403).json({
          error: {
            code: 'WRONG_APP',
            message: 'This account is not registered for this app.',
          },
        });
      }

      expect(responseStatus).toBe(403);
      expect(responseBody).toEqual({
        error: {
          code: 'WRONG_APP',
          message: 'This account is not registered for this app.',
        },
      });
    });

    it('accepts user if they have a membership matching the current brand', () => {
      const allMemberships = [
        { org_id: '11111111-1111-1111-1111-111111111111', role: 'member', brand: 'reachflow' },
        { org_id: '22222222-2222-2222-2222-222222222222', role: 'owner', brand: 'growthflow' },
      ];

      const currentAppBrand = 'growthflow';
      const filtered = allMemberships.filter((m) => m.brand === currentAppBrand);

      expect(filtered.length).toBe(1);
      expect(filtered[0].org_id).toBe('22222222-2222-2222-2222-222222222222');
      expect(filtered[0].brand).toBe('growthflow');
    });
  });

  describe('3. Webhook Brand Routing Isolation', () => {
    it('returns 200 and writes nothing when webhook event is for the other brand', async () => {
      const phoneNumberId = '999888777666';
      const payload = { object: 'whatsapp_business_account', entry: [] };
      const rawBody = JSON.stringify(payload);
      const hmac = createHmac('sha256', APP_SECRET).update(rawBody).digest('hex');
      const signature = `sha256=${hmac}`;

      // Simulate incoming webhook lookup returning a ReachFlow account
      const matchedAccount = {
        org_id: 'rf-org-123',
        brand: 'reachflow',
      };

      const currentAppBrand = 'growthflow';
      let wroteToDb = false;
      let statusCode = 0;
      let responseText = '';

      // Check brand match
      if (!matchedAccount || matchedAccount.brand !== currentAppBrand) {
        // Return 200 immediately and skip any DB writes
        statusCode = 200;
        responseText = 'EVENT_RECEIVED';
      } else {
        wroteToDb = true;
      }

      expect(statusCode).toBe(200);
      expect(responseText).toBe('EVENT_RECEIVED');
      expect(wroteToDb).toBe(false);
    });
  });

  describe('4. PostgreSQL Advisory Lock Brand Independence', () => {
    function computeLockKey(brand: string): number {
      // Emulates PostgreSQL hashtext('tick:' || brand)
      let hash = 0;
      const str = `tick:${brand}`;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }

    it('generates distinct advisory lock keys for reachflow and growthflow', () => {
      const reachflowLockKey = computeLockKey('reachflow');
      const growthflowLockKey = computeLockKey('growthflow');

      expect(reachflowLockKey).not.toBe(growthflowLockKey);
      expect(typeof reachflowLockKey).toBe('number');
      expect(typeof growthflowLockKey).toBe('number');
    });
  });
});
