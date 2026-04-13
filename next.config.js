const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['stellar.expert', 'horizon-testnet.stellar.org'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.mongodb.net' },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
  env: {
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
    NEXT_PUBLIC_STELLAR_HORIZON: process.env.NEXT_PUBLIC_STELLAR_HORIZON,
  },
}
module.exports = nextConfig

