import type { Express, RequestHandler } from 'express';
import { auth } from 'express-openid-connect';
import session from 'express-session';
import memorystore from 'memorystore';
import { storage } from './storage';

/**
 * Configure and attach Auth0 authentication middleware to an Express app.
 * - Middleware and session order is CRUCIAL for cloud deployments like Render.com.
 */
export async function setupAuth(app: Express) {
  // CRUCIAL: Trust proxy headers (needed for correct secure cookies on Render.com)
  app.set('trust proxy', 1);

  // Use persistent (memory) session store (swap for PG or Redis if desired)
  const MemoryStore = memorystore(session);

  // Session middleware: must come BEFORE auth middleware!
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'you-must-set-a-SESSION_SECRET',
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: {
        secure: process.env.NODE_ENV === 'production',  // Only require HTTPS in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // Lax for dev, None for prod
        httpOnly: true,
      },
      store: new MemoryStore({
        checkPeriod: 86400000, // Prune expired entries every 24h
      }),
    })
  );

  // Auth0 OIDC Middleware Configuration
  const baseUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.BASE_URL ||
    `http://localhost:${process.env.PORT || '5000'}`;

  const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SESSION_SECRET,
    baseURL: baseUrl,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_DOMAIN?.startsWith('https://')
      ? process.env.AUTH0_DOMAIN
      : `https://${process.env.AUTH0_DOMAIN}`,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    routes: {
      login: '/api/auth/login',
      callback: '/api/auth/callback',
      logout: '/api/auth/logout',
    },
    session: {
      rolling: true,
      cookie: {
        secure: process.env.NODE_ENV === 'production',  // Only require HTTPS in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  // Lax for dev, None for prod
        httpOnly: true,
      }
    }
  } as any;

  // Attach the Auth0 OIDC middleware. It uses the above session.
  app.use(auth(config));
}

/**
 * Middleware to ensure a request is authenticated.
 * - Upserts the user in DB and attaches `req.user.claims`.
 */
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    if (!req.oidc || !req.oidc.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userInfo: any = req.oidc.user || {};
    const id: string = userInfo.sub;
    const email: string = userInfo.email;

    let firstName: string = userInfo.given_name || '';
    let lastName: string = userInfo.family_name || '';
    if (!firstName && userInfo.name) {
      const parts = String(userInfo.name).split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }

    if (id) {
      await storage.upsertUser({
        id,
        email,
        firstName,
        lastName,
      });
      // Attach a claims object for backward compatibility
      req.user = {
        claims: {
          sub: id,
          email,
          first_name: firstName,
          last_name: lastName,
        },
      };
    }

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};