export interface UserInfo {
  sub: string;
  email?: string;
  roles?: string[];
  plan?: string;
  created_at?: Date;
  email_verified?: boolean;
  family_name?: string;
  given_name?: string;
  name?: string;
  nickname?: string;
  picture?: string;
}


export interface AuthProvider {
  validateAccessToken(token: string): Promise<UserInfo>;
  getUserInfo(token: string): Promise<UserInfo>;
  getJWKS(): Promise<any>;
  createDeviceCode(clientId: string, scope?: string): Promise<{
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    expiresIn: number;
    interval: number;
  }>;
}