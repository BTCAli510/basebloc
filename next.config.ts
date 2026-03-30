import type { NextConfig } from "next";
import path from 'path';

// The EAS SDK exports.import condition points to a broken ESM build that
// references a missing internal './eas' module. Both Turbopack (dev) and
// webpack (prod) must alias the package directly to its CJS entry.
// path.resolve() produces backslash paths on Windows; Turbopack requires
// forward slashes, so normalize the separator.
const easSdkCjs = path
  .resolve(process.cwd(), 'node_modules/@ethereum-attestation-service/eas-sdk/dist/lib.commonjs/index.js')
  .split(path.sep).join('/');

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      '@ethereum-attestation-service/eas-sdk': easSdkCjs,
    },
  },
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
