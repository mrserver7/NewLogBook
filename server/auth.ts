import type { Express, RequestHandler } from 'express';
import { auth } from 'express-openid-connect';
import { storage } from './storage';

/**
 * Configure and attach Auth0 authentication middleware to an Express app.
 *
 * The configuration values are read from environment variables:
 * - AUTH0_DOMAIN: your Auth0 tenant domain (e.g. "dev-abc123.us.auth0.com")
 * - AUTH0_CLIENT_ID: the client ID for your Auth0 application
 * - AUTH0_CLIENT_SECRET: the client secret for your Auth0 application
 * - SESSION_SECRET: a random string used to sign session cookies
 * - BASE_URL: the base URL of your application (e.g. "https://example.com")
 *
 * The middleware registers routes at `/api/auth/login`, `/api/auth/callback`
 * and `/api/auth/logout` to handle the OAuth flow.  You should ensure
 * these paths are configured as allowed callback/logout URLs in the Auth0
 * dashboard.  Authentication is not required on every route (authRequired: false)
 * so that unauthenticated users can access public pages.
 */
export async function setupAuth(app: Express) {
  const baseUrl =
    process.env.BASE_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${process.env.PORT || '5000'}`;

  const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    baseURL: baseUrl,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    routes: {
      login: '/api/auth/login',
      callback: '/api/auth/callback',
      logout: '/api/auth/logout',
    },
  } as any;

  // Attach the Auth0 OIDC middleware.  It adds `req.oidc` to every request.
  app.use(auth(config));
}

/**
 * Middleware to ensure that a request is authenticated.  If the user is
 * authenticated via Auth0, this middleware will upsert the user's record
 * into MongoDB (using the storage layer) and attach a `req.user.claims`
 * object to mirror the structure expected by the existing routes.  If the
 * request is not authenticated, it responds with HTTP 401.
 */
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    const oidc: any = (req as any).oidc;
    if (!oidc || !oidc.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userInfo: any = oidc.user || {};
    const id: string = userInfo.sub;
    const email: string = userInfo.email;
    // Derive first and last names from available properties.  Auth0 may
    // provide `given_name`/`family_name` or a full `name` string.
    let firstName: string = userInfo.given_name || '';
    let lastName: string = userInfo.family_name || '';
    if (!firstName && userInfo.name) {
      const parts = String(userInfo.name).split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
    // Upsert the user in the database so that a record always exists.
    if (id) {
      await storage.upsertUser({
        id,
        email,
        firstName,
        lastName,
      });
      // Attach a claims object for backward compatibility with existing routes.
      (req as any).user = {
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