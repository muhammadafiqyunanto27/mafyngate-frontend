/**
 * Utility to ensure all media URLs are absolute and correctly formatted.
 * It handles Railway production domains, local development, and external URLs.
 */
import { API_URL } from './config';

export const getMediaUrl = (pathOrUrl) => {
  if (!pathOrUrl) return null;
  
  // If already absolute (Cloudinary / External), return as is
  if (pathOrUrl.startsWith('http')) return pathOrUrl;
  
  // Base URL is now dynamic
  let baseUrl = API_URL;
  
  // If we're in the browser and the baseUrl is relative or missing, 
  // we can't easily guess the backend if it's on a different domain.
  // But typically it's configured in .env.
  
  // Ensure path starts with /
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  
  // Sanitize backslashes (common in Windows paths from backend)
  const sanitizedPath = cleanPath.replace(/\\/g, '/');
  
  return `${baseUrl}${sanitizedPath}`;
};
