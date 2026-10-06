import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals, generated share images (served at their
  // internal /<locale>/... path) and files with an extension.
  matcher: '/((?!api|_next|_vercel|.*opengraph-image|.*\\..*).*)',
};
