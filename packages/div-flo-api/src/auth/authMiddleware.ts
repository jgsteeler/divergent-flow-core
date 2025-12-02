import { Request, Response, NextFunction } from 'express';
import { AuthProvider, UserInfo } from './AuthProvider';
import { container } from '../container';

declare global {
  namespace Express {
    interface Request {
      user?: UserInfo;
    }
  }
}

export function createAuthMiddleware(authProvider: AuthProvider) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    let userInfo: UserInfo | undefined;
    try {
      userInfo = await authProvider.validateAccessToken(token);
      req.user = userInfo;
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    

    // Auto-provision or upsert user on every validated request
    try {
      console.log('[authMiddleware] userInfo before provisioning:', userInfo);
      const userService = container.resolve<any>('IUserService');
      await userService.provisionOrUpdateOAuthUser({
        sub: userInfo?.sub,
        email: userInfo?.email || '',
        provider: 'auth0',
        name: userInfo?.name,
        given_name: userInfo?.given_name,
        family_name: userInfo?.family_name,
        emailVerified: userInfo?.email_verified,
        nickname: userInfo?.nickname,
        picture: userInfo?.picture,
        roles: userInfo?.roles,
        plan: userInfo?.plan,
        created_at: userInfo?.created_at,
        // Add more fields if needed (e.g., roles)
      });
    } catch (provisionError) {
      console.error('[User Provisioning Error]', provisionError);
    }

    next();
  };
}