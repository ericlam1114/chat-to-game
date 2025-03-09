/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable React strict mode for better development experience
    reactStrictMode: true,
    
    // Configure image domains for external images if needed
    images: {
      domains: [],
    },
    
    // Transpile modules that need to be converted
    transpilePackages: ['three'],
  };
  
  module.exports = nextConfig;