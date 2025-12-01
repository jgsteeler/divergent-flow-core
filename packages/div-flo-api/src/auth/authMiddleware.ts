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
      const userService = container.resolve<any>('IUserService');
      await userService.provisionOrUpdateOAuthUser({
        sub: userInfo?.sub,
        email: userInfo?.email,
        provider: 'auth0',
        // Add more fields if needed (e.g., name, roles)
      });
    } catch (provisionError) {
      console.error('[User Provisioning Error]', provisionError);
      // Optionally, you could add more logging or monitoring here
    }

    next();
  };
}