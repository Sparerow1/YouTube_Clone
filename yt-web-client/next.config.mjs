/** @type {import('next').NextConfig} */
const nextConfig = {    
    experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'storage.googleapis.com',
      port: ''
    }],
    minimumCacheTTL: 10
  }
};

export default nextConfig;
