/**
 * Dynamic configuration for the frontend.
 * Automatically chooses the backend URL based on the current environment.
 */

const getApiUrl = () => {
  // If we're not in a browser (e.g., SSR), use the env variable or fallback
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // 1. Local Development / Private Network
  if (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || 
    hostname.startsWith('10.') ||      
    hostname.startsWith('172.') ||     
    hostname.endsWith('.local')        
  ) {
    // Ensure we match the protocol of the page (http vs https)
    // Most local network devices use http.
    const backendProtocol = protocol === 'https:' ? 'https:' : 'http:';
    return `${backendProtocol}//${hostname}:5000`;
  }

  // 2. Production / Public Deployment
  // Primary public endpoint (always HTTPS on Railway)
  return 'https://mafyngate-backend-production.up.railway.app';
};

export const API_URL = getApiUrl();
