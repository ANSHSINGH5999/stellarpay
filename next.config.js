/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for Stellar SDK (uses Node.js crypto internals via sodium-native)
  webpack: (config, { isServer }) => {
    // Polyfill Node built-ins that the Stellar SDK references
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs:     false,
      net:    false,
      tls:    false,
      crypto: false,
    };

    // sodium-native is a native Node module used for signing on the server.
    // In the browser the Stellar SDK falls back to WebCrypto automatically,
    // so we can safely mark it as external / empty on the client bundle.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'sodium-native': false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
