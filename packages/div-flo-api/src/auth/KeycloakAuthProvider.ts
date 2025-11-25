import { jwtVerify, createRemoteJWKSet, JWTVerifyResult } from 'jose';
import { AuthProvider, UserInfo } from './AuthProvider';

export class KeycloakAuthProvider implements AuthProvider {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
  private issuer: string;
  private audiences: string[];
  private jwksUrl: string;

  constructor(issuer: string, audience: string, jwksUrl?: string) {
    this.issuer = issuer;
    this.audiences = (audience || '')
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);
    // Allow explicit JWKS URL via env; else derive from issuer (Keycloak standard path)
    this.jwksUrl = (jwksUrl && jwksUrl.trim().length > 0)
      ? jwksUrl
      : `${issuer.replace(/\/$/, '')}/protocol/openid-connect/certs`;
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
        audience: this.audiences.length > 0 ? this.audiences : undefined,
      });

      return {
        sub: payload.sub as string,
        email: payload.email as string,
        roles: (payload.realm_access as any)?.roles || [],
        plan: payload.plan as string || 'free',
      };
    } catch (error) {
      throw new Error(`Token validation failed: ${(error as Error).message}`);
    }
  }

  async getUserInfo(token: string): Promise<UserInfo> {
    // For now, same as validateAccessToken, but could call userinfo endpoint
    return this.validateAccessToken(token);
  }

  async getJWKS(): Promise<any> {
    // This might not be needed directly, but for interface
    throw new Error('Not implemented');
  }

  async createDeviceCode(clientId: string, scope?: string): Promise<{
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    expiresIn: number;
    interval: number;
  }> {
    // Implement device code flow by calling Keycloak's device endpoint
    // For now, stub
    throw new Error('Device code flow not implemented yet');
  }
}