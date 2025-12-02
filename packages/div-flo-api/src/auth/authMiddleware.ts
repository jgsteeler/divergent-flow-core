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

    // If email is missing, fetch from Auth0 /userinfo
    let profile: Record<string, any> = {};
    if (!userInfo?.email) {
      try {
        const auth0Domain = process.env.AUTH0_ISSUER || '';
        const userinfoUrl = `${auth0Domain.replace(/\/$/, '')}/userinfo`;
        const resp = await fetch(userinfoUrl, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (resp.ok) {
          profile = await resp.json() as Record<string, any>;
          console.log('[authMiddleware] Fetched profile from /userinfo:', profile);
        } else {
          console.warn('[authMiddleware] Failed to fetch /userinfo:', await resp.text());
        }
      } catch (err) {
        console.error('[authMiddleware] Error fetching /userinfo:', err);
      }
    }

    // Auto-provision or upsert user on every validated request
    try {
      console.log('[authMiddleware] userInfo before provisioning:', userInfo);
      const userService = container.resolve<any>('IUserService');
      const emailToUse = userInfo?.email ? userInfo.email : profile.email;
      await userService.provisionOrUpdateOAuthUser({
        sub: userInfo?.sub,
        email: emailToUse,
        provider: 'auth0',
        name: profile.name,
        given_name: profile.given_name,
        family_name: profile.family_name,
        emailVerified: profile.email_verified,
        // Add more fields if needed (e.g., roles)
      });
    } catch (provisionError) {
      console.error('[User Provisioning Error]', provisionError);
    }

    next();
  };
}