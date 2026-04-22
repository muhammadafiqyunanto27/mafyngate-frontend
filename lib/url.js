/**
 * Utility to ensure all media URLs are absolute and correctly formatted.
 * It handles Railway production domains, local development, and external URLs.
 */
import { API_URL } from './config';

export const getMediaUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;

  // ULTRA-SYNC: If we are not on a production domain, and the URL looks like
  // it's coming from a local backend (localhost, IP, etc. on port 5000/5001),
  // we redirect it to production to ensure media loads even if not synced locally.
  if (typeof window !== 'undefined' &&
    !window.location.hostname.includes('railway.app') &&
    !window.location.hostname.includes('vercel.app')) {

    // Pattern to catch http://ANY_IP_OR_HOST:5000/uploads or :5001/uploads
    const localBackendPattern = /^https?:\/\/[^/]+:(5000|5001)\/uploads\/(.*)/;
    const match = pathOrUrl.match(localBackendPattern);

    if (match) {
      // match[2] is the filename/path after /uploads/
      return `https://mafyngate-backend-production.up.railway.app/uploads/${match[2]}`;
    }

    // Also handle relative paths for local development
    if (pathOrUrl.startsWith('uploads/') || pathOrUrl.startsWith('/uploads/')) {
      const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl.substring(1) : pathOrUrl;
      return `https://mafyngate-backend-production.up.railway.app/${cleanPath}`;
    }
  }

  // If already absolute (Cloudinary / External / Already Rewritten), return as is
  if (pathOrUrl.startsWith('http')) return pathOrUrl;

  // Base URL is now dynamic
  let baseUrl = API_URL;

  // Ensure path starts with /
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;

  // Sanitize backslashes (common in Windows paths from backend)
  const sanitizedPath = cleanPath.replace(/\\/g, '/');

  return `${baseUrl}${sanitizedPath}`;
};
