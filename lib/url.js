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
  
  // CRITICAL: If we are on localhost, and the path is a relative upload path,
  // we want to fetch from production so we can see public uploads.
  if (typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && 
      (pathOrUrl.startsWith('uploads/') || pathOrUrl.startsWith('/uploads/'))) {
    baseUrl = 'https://mafyngate-backend-production.up.railway.app';
  }
  
  // Ensure path starts with /
  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  
  // Sanitize backslashes (common in Windows paths from backend)
  const sanitizedPath = cleanPath.replace(/\\/g, '/');
  
  return `${baseUrl}${sanitizedPath}`;
};
