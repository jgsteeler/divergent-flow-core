import { Request, Response, NextFunction } from 'express';
import { AuthProvider, UserInfo } from './AuthProvider';
import { container } from '../container';
import { createClient } from 'redis';

declare global {
  namespace Express {
    interface Request {
      user?: UserInfo;
    }
  }
}

export function createAuthMiddleware(authProvider: AuthProvider) {
  // Create Redis client once per process
  let redisClient: ReturnType<typeof createClient> | undefined;
  async function getRedisClient() {
    if (!redisClient) {
      redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
    }
    return redisClient;
  }

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

    

    // Redis cache: skip provisioning if already done for this provider/sub
    try {
      const redis = await getRedisClient();
      const cacheKey = `provisioned:auth0:${userInfo?.sub}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log(`[authMiddleware] Provisioning skipped (cached): ${cacheKey}`);
        return next();
      }
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
      // Set cache for 4 hours
      await redis.setEx(cacheKey, 4 * 60 * 60, '1');
      console.log(`[authMiddleware] Provisioning cached: ${cacheKey}`);
    } catch (provisionError) {
      console.error('[User Provisioning Error]', provisionError);
    }

    next();
  };
}