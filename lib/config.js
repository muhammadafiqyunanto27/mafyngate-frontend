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

  // 1. Local Development / Private Network
  if (
    hostname === 'localhost' || 
    hostname === '127.0.0.1' || 
    hostname.startsWith('192.168.') || // Personal Wi-Fi / LAN
    hostname.startsWith('10.') ||      // Private corporate network
    hostname.startsWith('172.') ||     // Private network
    hostname.endsWith('.local')        // mDNS
  ) {
    // We use the current hostname to ensure phones/other devices on the same Wi-Fi 
    // can connect to the backend running on this machine.
    return `http://${hostname}:5000`;
  }

  // 2. Production / Public Deployment
  // You can use your hardcoded Railway URL here as the primary public endpoint
  return 'https://mafyngate-backend-production.up.railway.app';
};

export const API_URL = getApiUrl();
