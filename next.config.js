/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Polyfill Node built-ins that the Stellar SDK references (browser builds only)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:  false,
        net: false,
        tls: false,
      };
    }

    // Apply sodium-native stub for BOTH server and client bundles.
    // Vercel's serverless environment can't load native .node binaries, so the
    // server SSR pass also needs this alias to fall back to tweetnacl.
    config.resolve.alias = {
      ...config.resolve.alias,
      'sodium-native': path.resolve(__dirname, 'src/lib/sodium-stub.js'),
    };

    return config;
  },
};

module.exports = nextConfig;
