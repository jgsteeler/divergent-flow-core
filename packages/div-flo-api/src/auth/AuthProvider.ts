export interface UserInfo {
  sub: string;
  email?: string;
  roles?: string[];
  plan?: string;
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