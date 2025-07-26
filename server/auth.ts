import session from 'express-session';
import type { Express, RequestHandler } from 'express';
import memorystore from 'memorystore';

/**
 * This file provides a very simple authentication and session layer for
 * local development and deployment environments outside of Replit.  It
 * uses an in‑memory session store (backed by `memorystore`) to avoid
 * any database dependency.  All requests are treated as authenticated
 * and a dummy user object is attached to the request.
 */

const MemoryStore = memorystore(session);

/**
 * Return a session middleware configured with a memorystore.  The
 * session lifetime is one week.  In a production deployment you
 * should consider a more persistent session store, such as redis or
 * MongoDB, and enabling secure cookies.
 */
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const sessionStore = new MemoryStore({ checkPeriod: sessionTtl });
  return session({
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  });
}

/**
 * Set up basic authentication.  This adds the session middleware to
 * the express app and trusts proxies for correct IP handling.  No
 * external identity provider is used.
 */
export async function setupAuth(app: Express) {
  app.set('trust proxy', 1);
  app.use(getSession());
}

/**
 * Authentication middleware.  Attaches a dummy user to every request
 * and allows the request to proceed.  Replace this implementation
 * with real authentication logic if needed.
 */
export const isAuthenticated: RequestHandler = (req, _res, next) => {
  // Attach a dummy user with a unique identifier.  In a real
  // application you should verify an access token or session here.
  req.user = {
    claims: {
      sub: 'local_user',
      email: 'local@example.com',
      first_name: 'Local',
      last_name: 'User',
    },
  } as any;
  next();
};