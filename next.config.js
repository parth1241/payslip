/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.mongodb.net' },
    ],
  },
  env: {
    NEXT_PUBLIC_STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK,
    NEXT_PUBLIC_STELLAR_HORIZON: process.env.NEXT_PUBLIC_STELLAR_HORIZON,
  },
}
module.exports = nextConfig
