import { jwtVerify, createRemoteJWKSet, JWTVerifyResult } from 'jose';
import { AuthProvider, UserInfo } from './AuthProvider';

export class Auth0AuthProvider implements AuthProvider {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
  private issuer: string;
  private audience: string;
  private jwksUrl: string;
  private rolesClaim: string;

  constructor() {
    this.issuer = process.env.AUTH0_ISSUER || '';
    this.audience = process.env.AUTH0_AUDIENCE || '';
    this.jwksUrl = process.env.AUTH0_JWKS_URL || `${this.issuer.replace(/\/$/, '')}/.well-known/jwks.json`;
    this.rolesClaim = process.env.AUTH0_ROLES_CLAIM || 'roles'; // Default to 'roles' if not set
  }

  private getJWKSet(): ReturnType<typeof createRemoteJWKSet> {
    if (!this.jwks) {
      this.jwks = createRemoteJWKSet(new URL(this.jwksUrl));
    }
    return this.jwks;
  }

  async validateAccessToken(token: string): Promise<UserInfo> {
    try {
      const { payload }: JWTVerifyResult = await jwtVerify(token, this.getJWKSet(), {
        issuer: this.issuer,
        audience: this.audience,
      });

      // Extract roles from configurable claim
      let roles: string[] = [];
      if (payload[this.rolesClaim]) {
        roles = Array.isArray(payload[this.rolesClaim]) ? payload[this.rolesClaim] as string[] : [];
      }


      // Get UserProfile from the userInfo route on auth0
      let profile: Record<string, any> = {};
      try {
        
        const userinfoUrl = `${this.issuer.replace(/\/$/, '')}/userinfo`;
        const resp = await fetch(userinfoUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (resp.ok) {
          profile = await resp.json() as Record<string, any>;
          console.log('[validateAccessToken] Fetched profile from /userinfo:', profile);
        } else {
          console.warn('[validateAccessToken] Failed to fetch /userinfo:', await resp.text());
        }
      } catch (err) {
        console.error('[validateAccessToken] Error fetching /userinfo:', err);
      }

      return {
        sub: payload.sub as string,
        email: profile.email as string,
        roles,
        plan: payload.plan as string || 'free',
        created_at: profile.created_at ? new Date(profile.created_at) : undefined,
        email_verified: profile.email_verified as boolean,
        family_name: profile.family_name as string,
        given_name: profile.given_name as string,
        name: profile.name as string,
        nickname: profile.nickname as string,
        picture: profile.picture as string,
      };
    } catch (error) {
      throw new Error(`Token validation failed: ${(error as Error).message}`);
    }
  }

  async getUserInfo(token: string): Promise<UserInfo> {
    // For now, same as validateAccessToken
    return this.validateAccessToken(token);
  }

  async getJWKS(): Promise<any> {
    throw new Error('Not implemented');
  }

  async createDeviceCode(clientId: string, scope?: string): Promise<{
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    expiresIn: number;
    interval: number;
  }> {
    throw new Error('Device code flow not implemented yet');
  }
}
