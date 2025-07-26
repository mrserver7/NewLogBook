import type { Express, RequestHandler } from 'express';
import { auth } from 'express-openid-connect';
import session from 'express-session';
import memorystore from 'memorystore';
import { storage } from './storage';

/**
 * Configure and attach Auth0 authentication middleware to an Express app.
 *
 * This function now explicitly sets up a session middleware using an in-memory
 * store, which is then used by the Auth0 middleware. This resolves conflicts
 * and ensures session stability.
 */
export async function setupAuth(app: Express) {
  const baseUrl =
    process.env.BASE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${process.env.PORT || '5000'}`;

  // Initialize the memory store
  const MemoryStore = memorystore(session);

  // 1. Session Middleware
  // We must configure the session middleware *before* the Auth0 middleware.
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'a truly random secret should be here',
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // 2. Auth0 OIDC Middleware Configuration
  const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SESSION_SECRET, // Should be the same secret
    baseURL: baseUrl,
    clientID: process.env.AUTH0_CLIENT_ID,
    // CORRECTED LINE: Removed the extra "://"
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    routes: {
      login: '/api/auth/login',
      callback: '/api/auth/callback',
      logout: '/api/auth/logout',
    },
  } as any;

  // Attach the Auth0 OIDC middleware. It will automatically use the session.
  app.use(auth(config));
}

/**
 * Middleware to ensure that a request is authenticated. If the user is
 * authenticated via Auth0, this middleware will upsert the user's record
 * and attach a `req.user.claims` object. If not authenticated, it responds
 * with HTTP 401.
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