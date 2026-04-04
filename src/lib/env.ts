const required = {
  MONGODB_URI: process.env.MONGODB_URI,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
}

for (const [key, value] of Object.entries(required)) {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Add it to .env.local for development or Vercel dashboard for production.`
    )
  }
}

export const env = {
  MONGODB_URI: process.env.MONGODB_URI!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  RESEND_API_KEY: process.env.RESEND_API_KEY ?? '',
  STELLAR_NETWORK: process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? 'testnet',
  STELLAR_HORIZON: process.env.NEXT_PUBLIC_STELLAR_HORIZON ?? 'https://horizon-testnet.stellar.org',
}
