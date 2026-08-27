/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure compatibility with older browsers (iOS 13+, Safari 13+)
  transpilePackages: ['framer-motion', 'lucide-react', 'socket.io-client', 'simple-peer'],
  
  // Optimize for production
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
