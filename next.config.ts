import type { NextConfig } from "next";
import path from 'path';

// The EAS SDK exports.import condition points to a broken ESM build that
// references a missing internal './eas' module. Alias directly to the CJS
// entry so webpack never resolves the broken ESM path.
const easSdkCjs = path.resolve(
  process.cwd(),
  'node_modules/@ethereum-attestation-service/eas-sdk/dist/lib.commonjs/index.js'
);

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@ethereum-attestation-service/eas-sdk': easSdkCjs,
      };
    }
    return config;
  },
};

export default nextConfig;
