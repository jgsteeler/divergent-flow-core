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

      return {
        sub: payload.sub as string,
        email: payload.email as string,
        roles,
        plan: payload.plan as string || 'free',
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
