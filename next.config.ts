import path from 'path';
import type { NextConfig } from "next";

// The EAS SDK exports.import condition points to a broken ESM build that
// references a missing internal './eas' module. Alias directly to the CJS
// entry so webpack never resolves the broken ESM path.
const easSdkCjs = path.resolve(
  process.cwd(),
  'node_modules/@ethereum-attestation-service/eas-sdk/dist/lib.commonjs/index.js'
);

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@ethereum-attestation-service/eas-sdk': easSdkCjs,
      };
    }
    // wagmi/connectors barrel pulls in @metamask/sdk which requires the React
    // Native async-storage module. Stub it out — this is a web-only app.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      '@farcaster/mini-app-solana': false,
    };
    return config;
  },
};

export default nextConfig;
