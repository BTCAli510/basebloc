import type { NextConfig } from "next";
import path from 'path';

// The EAS SDK exports.import condition points to a broken ESM build that
// references a missing internal './eas' module. Both Turbopack (dev) and
// webpack (prod) must alias the package directly to its CJS entry.
// require.resolve() finds the installed package regardless of platform and
// the replace() normalizes backslashes for Turbopack on Windows.
const easSdkCjsForTurbopack = require.resolve('@ethereum-attestation-service/eas-sdk')
  .replace(/\\/g, '/');

// webpack handles backslash paths on Windows fine; keep path.resolve() for it.
const easSdkCjsForWebpack = path.resolve(
  process.cwd(),
  'node_modules/@ethereum-attestation-service/eas-sdk/dist/lib.commonjs/index.js'
);

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      '@ethereum-attestation-service/eas-sdk': easSdkCjsForTurbopack,
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@ethereum-attestation-service/eas-sdk': easSdkCjsForWebpack,
      };
    }
    return config;
  },
};

export default nextConfig;
